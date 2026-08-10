"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { clients } from "@/db/schema";
import { requireCompanyId } from "@/lib/documents/auth";
import { clientInputSchema, idSchema } from "@/lib/validators/actions";

export interface ClientInput {
  name: string;
  company?: string;
  address?: string;
  phone?: string;
  email?: string;
  npwp?: string;
  pic?: string;
  notes?: string;
}

export async function createClientAction(input: ClientInput) {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };
  const parsed = clientInputSchema.safeParse(input);
  if (!parsed.success) return { error: "Data klien tidak valid" };
  const validInput = parsed.data;

  await db.insert(clients).values({
    company_id,
    name: validInput.name,
    company: validInput.company || null,
    address: validInput.address || null,
    phone: validInput.phone || null,
    email: validInput.email || null,
    npwp: validInput.npwp || null,
    pic: validInput.pic || null,
    notes: validInput.notes || null,
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateClientAction(id: string, input: ClientInput) {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };
  if (!idSchema.safeParse(id).success) return { error: "Klien tidak ditemukan" };
  const parsed = clientInputSchema.safeParse(input);
  if (!parsed.success) return { error: "Data klien tidak valid" };
  const validInput = parsed.data;

  await db
    .update(clients)
    .set({
      name: validInput.name,
      company: validInput.company || null,
      address: validInput.address || null,
      phone: validInput.phone || null,
      email: validInput.email || null,
      npwp: validInput.npwp || null,
      pic: validInput.pic || null,
      notes: validInput.notes || null,
    })
    .where(and(eq(clients.id, id), eq(clients.company_id, company_id)));

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteClientAction(id: string) {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };
  if (!idSchema.safeParse(id).success) return { error: "Klien tidak ditemukan" };

  await db.delete(clients).where(and(eq(clients.id, id), eq(clients.company_id, company_id)));

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true };
}
