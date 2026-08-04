import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients, companies, companyMembers, documentItems, documents } from "@/db/schema";
import { computeTotals, type TemplateData } from "@/components/documents/templates/shared";
import type { Client, DocRecord } from "@/lib/types";

export async function loadTemplateData(id: string): Promise<TemplateData | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const members = await db
    .select({ company_id: companyMembers.company_id })
    .from(companyMembers)
    .where(eq(companyMembers.user_id, session.user.id))
    .limit(1);
  if (members.length === 0) return null;
  const companyId = members[0].company_id;

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
    const [c] = await db.select().from(clients).where(eq(clients.id, doc.client_id)).limit(1);
    client = c ?? null;
  }

  const relItems = items.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return {
    company,
    client,
    doc: doc as unknown as DocRecord,
    items: relItems,
    totals: computeTotals(doc as unknown as DocRecord, relItems),
  };
}