import "server-only";

import { and, asc, count, desc, eq, inArray, like, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients, companies, companyMembers, documentItems, documents, emailLogs, user } from "@/db/schema";
export { getCompany, getSessionUser } from "@/lib/dal/auth";

export async function listClients(companyId: string) {
  return db.select().from(clients).where(eq(clients.company_id, companyId)).orderBy(desc(clients.created_at));
}

export interface PageResult<T> {
  rows: T[];
  total: number;
  totalPages: number;
}

export const PAGE_SIZE = 10;

export async function listClientsPage(
  companyId: string,
  page: number
): Promise<PageResult<typeof clients.$inferSelect>> {
  const safePage = Math.max(1, page);

  const [totalRes, rows] = await Promise.all([
    db.select({ c: count() }).from(clients).where(eq(clients.company_id, companyId)),
    db
      .select()
      .from(clients)
      .where(eq(clients.company_id, companyId))
      .orderBy(desc(clients.created_at))
      .limit(PAGE_SIZE)
      .offset((safePage - 1) * PAGE_SIZE),
  ]);

  const total = totalRes[0]?.c ?? 0;
  return { rows, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export interface DocumentFilters {
  type?: string;
  status?: string;
  q?: string;
}

function documentConditions(companyId: string, opts?: DocumentFilters) {
  const filters = [eq(documents.company_id, companyId)];
  if (opts?.type) filters.push(eq(documents.type, opts.type as never));
  if (opts?.status) filters.push(eq(documents.status, opts.status as never));
  if (opts?.q) {
    const q = `%${opts.q.toLowerCase()}%`;
    filters.push(or(like(documents.number, q), like(documents.title, q))!);
  }
  return filters;
}

export async function listDocuments(companyId: string, opts?: DocumentFilters) {
  return db
    .select()
    .from(documents)
    .where(and(...documentConditions(companyId, opts)))
    .orderBy(desc(documents.created_at));
}

export async function listDocumentsPage(
  companyId: string,
  page: number,
  opts?: DocumentFilters
): Promise<PageResult<typeof documents.$inferSelect>> {
  const safePage = Math.max(1, page);

  const [totalRes, rows] = await Promise.all([
    db
      .select({ c: count() })
      .from(documents)
      .where(and(...documentConditions(companyId, opts))),
    db
      .select()
      .from(documents)
      .where(and(...documentConditions(companyId, opts)))
      .orderBy(desc(documents.created_at))
      .limit(PAGE_SIZE)
      .offset((safePage - 1) * PAGE_SIZE),
  ]);

  const total = totalRes[0]?.c ?? 0;
  return { rows, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function listDocumentItems(docId: string) {
  return db
    .select()
    .from(documentItems)
    .where(eq(documentItems.document_id, docId))
    .orderBy(asc(documentItems.sort_order));
}

export interface DocumentItemAmount {
  document_id: string;
  qty: number;
  unit_price: number;
}

/**
 * Ambil nilai item untuk banyak dokumen dalam satu round-trip database.
 * Digunakan halaman list/dashboard untuk menghindari pola N+1 query.
 */
export async function listDocumentItemAmounts(documentIds: string[]): Promise<DocumentItemAmount[]> {
  const uniqueIds = [...new Set(documentIds)].filter(Boolean);
  if (uniqueIds.length === 0) return [];

  return db
    .select({
      document_id: documentItems.document_id,
      qty: documentItems.qty,
      unit_price: documentItems.unit_price,
    })
    .from(documentItems)
    .where(inArray(documentItems.document_id, uniqueIds));
}

export function groupDocumentItemAmounts(rows: DocumentItemAmount[]) {
  const grouped = new Map<string, DocumentItemAmount[]>();
  for (const row of rows) {
    const items = grouped.get(row.document_id);
    if (items) items.push(row);
    else grouped.set(row.document_id, [row]);
  }
  return grouped;
}

export async function listEmailLogs(docId: string) {
  return db.select().from(emailLogs).where(eq(emailLogs.document_id, docId)).orderBy(desc(emailLogs.sent_at));
}

export async function getMembers(companyId: string) {
  return db
    .select({
      id: companyMembers.id,
      user_id: companyMembers.user_id,
      role: companyMembers.role,
      email: user.email,
      name: user.name,
    })
    .from(companyMembers)
    .innerJoin(user, eq(companyMembers.user_id, user.id))
    .where(eq(companyMembers.company_id, companyId));
}

export async function getLandingPageStats() {
  try {
    const [docRow, compRow] = await Promise.all([
      db.select({ c: count() }).from(documents),
      db.select({ c: count() }).from(companies),
    ]);

    return {
      totalDocuments: docRow[0]?.c ?? 0,
      totalCompanies: compRow[0]?.c ?? 0,
    };
  } catch {
    return {
      totalDocuments: 0,
      totalCompanies: 0,
    };
  }
}
