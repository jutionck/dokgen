import "server-only";

import { get } from "@vercel/blob";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients, companies, documentItems, documents } from "@/db/schema";
import { computeTotals, type TemplateData } from "@/components/documents/templates/shared";
import type { Client, DocRecord } from "@/lib/types";
import { requireCompanyId } from "@/lib/dal/auth";
import { idSchema } from "@/lib/validators/actions";
import { getBlobReadWriteToken, isPrivateVercelBlobUrl } from "@/lib/blob";

async function embedImage(imageUrl?: string | null): Promise<string | null> {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("data:image/")) return imageUrl;

  try {
    if (isPrivateVercelBlobUrl(imageUrl)) {
      const token = getBlobReadWriteToken();
      if (!token) return null;
      const result = await get(imageUrl, { access: "private", token });
      if (!result || result.statusCode !== 200) return null;
      const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
      return `data:${result.blob.contentType};base64,${buffer.toString("base64")}`;
    }

    const response = await fetch(imageUrl, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return null;
    const mime = response.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function loadTemplateData(id: string): Promise<TemplateData | null> {
  if (!idSchema.safeParse(id).success) return null;
  const companyId = await requireCompanyId();
  if (!companyId) return null;

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.company_id, companyId)))
    .limit(1);
  if (!doc) return null;

  const [company] = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
  if (!company) return null;

  const items = await db
    .select()
    .from(documentItems)
    .where(eq(documentItems.document_id, id))
    .orderBy(asc(documentItems.sort_order));

  let client: Client | null = null;
  if (doc.client_id) {
    const [c] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, doc.client_id), eq(clients.company_id, companyId)))
      .limit(1);
    client = c ?? null;
  }

  const relItems = items.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  // Aset diambil paralel dan di-embed agar konsisten di PDF, email, dan DOCX.
  const [logoDataUri, signatureDataUri] = await Promise.all([
    embedImage(company.logo_url),
    embedImage(company.signature_url),
  ]);

  return {
    company: {
      ...company,
      logo_url: logoDataUri,
      signature_url: signatureDataUri,
    },
    client,
    doc: doc as unknown as DocRecord,
    items: relItems,
    totals: computeTotals(doc as unknown as DocRecord, relItems),
    logoDataUri,
    signatureDataUri,
  };
}
