import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { companies, companyMembers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Company } from "@/lib/types";

export const getSessionUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

export const getCompany = cache(async (): Promise<{ company: Company; isOwner: boolean } | null> => {
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
});

export async function requireCompanyId(): Promise<string | null> {
  return (await getCompany())?.company.id ?? null;
}
