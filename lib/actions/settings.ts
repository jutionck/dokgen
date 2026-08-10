"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { del, put } from "@vercel/blob";
import { db } from "@/lib/db";
import { companies } from "@/db/schema";
import { getBlobReadWriteToken, isVercelBlobUrl } from "@/lib/blob";
import { requireCompanyId } from "@/lib/documents/auth";
import { companyInputSchema } from "@/lib/validators/actions";

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

const COMPANY_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

async function deleteManagedBlob(value?: string | null) {
  const token = getBlobReadWriteToken();
  if (!isVercelBlobUrl(value) || !token) return;
  try {
    await del(value!, { token });
  } catch (error) {
    console.warn("[company-image] Gagal menghapus Blob lama:", error);
  }
}

async function uploadCompanyImage(
  formData: FormData,
  options: {
    formKey: "logo" | "signature";
    folder: "logos" | "signatures";
    column: "logo_url" | "signature_url";
    label: "logo" | "tanda tangan";
    allowedTypes?: string[];
  }
) {
  const companyId = await requireCompanyId();
  if (!companyId) return { error: "Akun tidak terhubung ke perusahaan" };

  const file = formData.get(options.formKey) as File | null;
  if (!file || file.size === 0) return { error: `Pilih file ${options.label} terlebih dahulu` };
  if (file.size > 2 * 1024 * 1024) return { error: `Ukuran ${options.label} maksimal 2MB` };
  const allowedTypes = options.allowedTypes ?? COMPANY_IMAGE_TYPES;
  if (!allowedTypes.includes(file.type)) {
    const formats = allowedTypes.includes("image/webp") ? "PNG, JPG, atau WebP" : "PNG atau JPG";
    return { error: `Format ${options.label} harus ${formats}` };
  }

  const blobToken = getBlobReadWriteToken();
  if (!blobToken) {
    return {
      error:
        "Penyimpanan gambar belum dikonfigurasi. Hubungkan Vercel Blob dan tambahkan read-write token di environment aplikasi.",
    };
  }

  const [currentCompany] = await db
    .select({ imageUrl: companies[options.column] })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  let imageUrl: string;
  try {
    const result = await put(
      `${options.folder}/${companyId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`,
      file,
      { access: "private", addRandomSuffix: true, token: blobToken }
    );
    imageUrl = result.url;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message.includes("This store does not exist")) {
      return {
        error:
          "Blob store tidak ditemukan. Perbarui read-write token dari Blob store yang masih aktif, lalu deploy ulang aplikasi.",
      };
    }
    return { error: `Gagal mengunggah ${options.label}: ${message}` };
  }

  try {
    const updateData: Partial<typeof companies.$inferInsert> = { [options.column]: imageUrl };
    await db.update(companies).set(updateData).where(eq(companies.id, companyId));
    await deleteManagedBlob(currentCompany?.imageUrl);
    revalidatePath("/settings");
    revalidatePath("/documents");
    revalidatePath("/dashboard");
    return { success: true, url: imageUrl };
  } catch (error) {
    await deleteManagedBlob(imageUrl);
    return { error: `Gagal menyimpan ${options.label}: ${error instanceof Error ? error.message : "unknown"}` };
  }
}

async function removeCompanyImage(column: "logo_url" | "signature_url") {
  const companyId = await requireCompanyId();
  if (!companyId) return { error: "Akun tidak terhubung ke perusahaan" };

  const [currentCompany] = await db
    .select({ imageUrl: companies[column] })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);
  const updateData: Partial<typeof companies.$inferInsert> = { [column]: null };
  await db.update(companies).set(updateData).where(eq(companies.id, companyId));
  await deleteManagedBlob(currentCompany?.imageUrl);
  revalidatePath("/settings");
  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateCompanyAction(input: CompanyInput) {
  const companyId = await requireCompanyId();
  if (!companyId) return { error: "Akun tidak terhubung ke perusahaan" };
  const parsed = companyInputSchema.safeParse(input);
  if (!parsed.success) return { error: "Data perusahaan tidak valid" };
  const validInput = parsed.data;

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
    if (validInput[field] !== undefined) {
      const value = validInput[field];
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
  return uploadCompanyImage(formData, {
    formKey: "logo",
    folder: "logos",
    column: "logo_url",
    label: "logo",
  });
}

export async function removeLogoAction() {
  return removeCompanyImage("logo_url");
}

export async function uploadSignatureAction(formData: FormData) {
  return uploadCompanyImage(formData, {
    formKey: "signature",
    folder: "signatures",
    column: "signature_url",
    label: "tanda tangan",
    allowedTypes: ["image/png", "image/jpeg"],
  });
}

export async function removeSignatureAction() {
  return removeCompanyImage("signature_url");
}
