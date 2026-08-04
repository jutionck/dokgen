"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { clients } from "@/db/schema";
import { requireCompanyId } from "@/lib/documents/auth";

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
  if (!input.name?.trim()) return { error: "Nama klien wajib diisi" };

  await db.insert(clients).values({
    company_id,
    name: input.name.trim(),
    company: input.company || null,
    address: input.address || null,
    phone: input.phone || null,
    email: input.email || null,
    npwp: input.npwp || null,
    pic: input.pic || null,
    notes: input.notes || null,
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateClientAction(id: string, input: ClientInput) {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };

  await db
    .update(clients)
    .set({
      name: input.name.trim(),
      company: input.company || null,
      address: input.address || null,
      phone: input.phone || null,
      email: input.email || null,
      npwp: input.npwp || null,
      pic: input.pic || null,
      notes: input.notes || null,
    })
    .where(eq(clients.id, id));

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteClientAction(id: string) {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };

  await db.delete(clients).where(eq(clients.id, id));

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true };
}