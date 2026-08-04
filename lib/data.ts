import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients, companies, companyMembers, documentItems, documents, emailLogs, user } from "@/db/schema";
import type { Company } from "@/lib/types";

export async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function getCompany(): Promise<{ company: Company; isOwner: boolean } | null> {
  const userSession = await getSessionUser();
  if (!userSession) return null;

  const rows = await db
    .select({ company: companies, role: companyMembers.role })
    .from(companyMembers)
    .innerJoin(companies, eq(companyMembers.company_id, companies.id))
    .where(eq(companyMembers.user_id, userSession.id))
    .limit(1);

  if (rows.length === 0) return null;
  return { company: rows[0].company, isOwner: rows[0].role === "owner" };
}

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
  const [totalRow] = await db.select({ c: count() }).from(clients).where(eq(clients.company_id, companyId));
  const total = totalRow?.c ?? 0;
  const rows = await db
    .select()
    .from(clients)
    .where(eq(clients.company_id, companyId))
    .orderBy(desc(clients.created_at))
    .limit(PAGE_SIZE)
    .offset((safePage - 1) * PAGE_SIZE);
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
  const [totalRow] = await db
    .select({ c: count() })
    .from(documents)
    .where(and(...documentConditions(companyId, opts)));
  const total = totalRow?.c ?? 0;
  const rows = await db
    .select()
    .from(documents)
    .where(and(...documentConditions(companyId, opts)))
    .orderBy(desc(documents.created_at))
    .limit(PAGE_SIZE)
    .offset((safePage - 1) * PAGE_SIZE);
  return { rows, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function listDocumentItems(docId: string) {
  return db
    .select()
    .from(documentItems)
    .where(eq(documentItems.document_id, docId))
    .orderBy(asc(documentItems.sort_order));
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
    const [docRow] = await db.select({ c: count() }).from(documents);
    const [compRow] = await db.select({ c: count() }).from(companies);

    return {
      totalDocuments: docRow?.c ?? 0,
      totalCompanies: compRow?.c ?? 0,
    };
  } catch {
    return {
      totalDocuments: 0,
      totalCompanies: 0,
    };
  }
}
