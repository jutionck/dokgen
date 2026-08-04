import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { companyMembers } from "@/db/schema";

export async function requireCompanyId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const members = await db
    .select({ company_id: companyMembers.company_id })
    .from(companyMembers)
    .where(eq(companyMembers.user_id, session.user.id))
    .limit(1);

  return members[0]?.company_id ?? null;
}