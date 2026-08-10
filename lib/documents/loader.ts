import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients, companies, documentItems, documents } from "@/db/schema";
import { computeTotals, type TemplateData } from "@/components/documents/templates/shared";
import type { Client, DocRecord } from "@/lib/types";
import { requireCompanyId } from "@/lib/dal/auth";
import { idSchema } from "@/lib/validators/actions";

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

  // Logo diambil server-side & di-embed sebagai data URI agar muncul di PDF/DOCX
  let logoDataUri: string | null = null;
  if (company.logo_url) {
    try {
      const res = await fetch(company.logo_url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const mime = res.headers.get("content-type") || "image/png";
        const buf = Buffer.from(await res.arrayBuffer());
        logoDataUri = `data:${mime};base64,${buf.toString("base64")}`;
      }
    } catch {
      logoDataUri = null;
    }
  }

  return {
    company,
    client,
    doc: doc as unknown as DocRecord,
    items: relItems,
    totals: computeTotals(doc as unknown as DocRecord, relItems),
    logoDataUri,
  };
}
