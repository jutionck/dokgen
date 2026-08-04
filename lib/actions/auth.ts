"use server";

import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { companies, companyMembers, user } from "@/db/schema";

export async function registerAction(_prevState: { error: string } | null, formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();
  const mode = String(formData.get("mode") || "create");
  const companyName = String(formData.get("company_name") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const joinCode = String(formData.get("join_code") || "").trim();

  if (!email || password.length < 6) {
    return { error: "Email wajib diisi dan password minimal 6 karakter" };
  }
  if (mode === "create" && !companyName) {
    return { error: "Nama perusahaan wajib diisi" };
  }
  if (mode === "join" && !joinCode) {
    return { error: "Kode perusahaan wajib diisi" };
  }

  // 1) Daftarkan user. Kalau email sudah terdaftar, pakai akun lama yang
  //    "yatim" (terdaftar tapi belum punya perusahaan).
  const signUpRes = await auth.api.signUpEmail({
    body: { email, password, name: name || email.split("@")[0] },
  });

  let user_id: string;
  let userBaru = true;

  if (signUpRes?.user) {
    user_id = signUpRes.user.id;
  } else {
    const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, email.toLowerCase())).limit(1);
    if (existing.length === 0) {
      return { error: "Registrasi gagal. Silakan coba lagi." };
    }
    const member = await db
      .select({ id: companyMembers.id })
      .from(companyMembers)
      .where(eq(companyMembers.user_id, existing[0].id))
      .limit(1);
    if (member.length > 0) {
      return { error: "Akun ini sudah terdaftar. Silakan masuk." };
    }
    user_id = existing[0].id;
    userBaru = false; // akun lama yang belum punya perusahaan
  }

  let companyId: string | null = null;

  try {
    if (mode === "create") {
      const code = randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
      const [company] = await db
        .insert(companies)
        .values({ name: companyName, city: city || "", join_code: code })
        .returning({ id: companies.id });
      if (!company) throw new Error("company insert gagal");
      companyId = company.id;

      await db.insert(companyMembers).values({
        company_id: company.id,
        user_id,
        role: "owner",
      });
    } else {
      const matched = await db
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.join_code, joinCode.toUpperCase()))
        .limit(1);
      if (matched.length === 0) {
        return { error: "Kode perusahaan tidak ditemukan" };
      }
      await db.insert(companyMembers).values({
        company_id: matched[0].id,
        user_id,
        role: "member",
      });
    }
  } catch (e) {
    console.error("[registerAction] gagal membuat perusahaan/keanggotaan:", e);

    // Rollback penuh: hapus perusahaan yang baru dibuat + akun baru yang tadi dibuat
    if (companyId) {
      try {
        await db.delete(companies).where(eq(companies.id, companyId));
      } catch {
        // abaikan
      }
    }
    if (userBaru) {
      try {
        await db.delete(user).where(eq(user.id, user_id));
      } catch {
        // abaikan
      }
    }
    return { error: "Gagal membuat akun. Silakan coba lagi." };
  }

  redirect("/login?registered=1");
}

export async function logoutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
