"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { companies } from "@/db/schema";
import { requireCompanyId } from "@/lib/documents/auth";

export interface CompanyInput {
  name: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  npwp?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder?: string;
  city?: string;
  signer_name?: string;
  signer_position?: string;
  signer_nip?: string;
}

export async function updateCompanyAction(input: CompanyInput) {
  const companyId = await requireCompanyId();
  if (!companyId) return { error: "Akun tidak terhubung ke perusahaan" };
  if (!input.name?.trim()) return { error: "Nama perusahaan wajib diisi" };

  // Hanya update field yang benar-benar dikirim — supaya menyimpan satu tab
  // tidak menghapus data tab lainnya (bank, penandatangan, profil).
  const fields: (keyof CompanyInput)[] = [
    "name",
    "tagline",
    "address",
    "phone",
    "email",
    "website",
    "npwp",
    "bank_name",
    "bank_account_number",
    "bank_account_holder",
    "city",
    "signer_name",
    "signer_position",
    "signer_nip",
  ];

  const setData: Record<string, string | null> = {};
  for (const field of fields) {
    if (input[field] !== undefined) {
      const value = input[field];
      setData[field] = field === "name" ? value.trim() : value?.trim() ? value.trim() : null;
    }
  }

  await db.update(companies).set(setData).where(eq(companies.id, companyId));

  revalidatePath("/settings");
  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function uploadLogoAction(formData: FormData) {
  const companyId = await requireCompanyId();
  if (!companyId) return { error: "Akun tidak terhubung ke perusahaan" };

  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) return { error: "Pilih file logo terlebih dahulu" };
  if (file.size > 2 * 1024 * 1024) return { error: "Ukuran logo maksimal 2MB" };

  let logoUrl = "";

  // 1. Coba upload ke Vercel Blob jika token tersedia
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { url } = await put(
        `logos/${companyId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`,
        file,
        {
          access: "public",
          addRandomSuffix: false,
        }
      );
      logoUrl = url;
    } catch (e) {
      console.warn("Vercel Blob upload failed, fallback to Data URL:", e);
    }
  }

  // 2. Mitigasi Fallback: Jika Vercel Blob tidak tersedia atau gagal, gunakan Data URL (Base64)
  if (!logoUrl) {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "image/png";
      logoUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    } catch (e) {
      return { error: `Gagal memproses file logo: ${e instanceof Error ? e.message : "unknown"}` };
    }
  }

  try {
    await db.update(companies).set({ logo_url: logoUrl }).where(eq(companies.id, companyId));
    revalidatePath("/settings");
    revalidatePath("/documents");
    revalidatePath("/dashboard");
    return { success: true, url: logoUrl };
  } catch (e) {
    return { error: `Gagal menyimpan logo: ${e instanceof Error ? e.message : "unknown"}` };
  }
}

export async function removeLogoAction() {
  const companyId = await requireCompanyId();
  if (!companyId) return { error: "Akun tidak terhubung ke perusahaan" };

  await db.update(companies).set({ logo_url: null }).where(eq(companies.id, companyId));
  revalidatePath("/settings");
  revalidatePath("/documents");
  return { success: true };
}
