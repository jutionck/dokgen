import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "mysql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: false,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
        console.warn("[Auth] RESEND_API_KEY atau RESEND_FROM belum di-set. Email reset password dilewati.");
        return;
      }

      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM,
        to: [user.email],
        subject: "Reset Password Akun Docgen",
        html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - Docgen</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background:#f8fafc; color:#0f172a; margin:0; padding:0;">
  <div style="width:100%; padding:32px 16px; box-sizing:border-box;">
    <div style="max-width:520px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 4px 12px rgba(15,23,42,.06);">
      <div style="background:linear-gradient(135deg,#1d4ed8,#2563eb); padding:28px 32px; color:#ffffff; text-align:center;">
        <img src="https://docgen.mipdevp.com/icons/icon-192.png" width="56" height="56" alt="Docgen" style="display:block; margin:0 auto 12px; border-radius:14px;">
        <h1 style="font-size:22px; margin:0;">Reset Password Docgen</h1>
      </div>
      <div style="padding:32px;">
        <p style="font-size:14px; line-height:1.7; color:#334155; margin:0 0 18px;">Kami menerima permintaan untuk mengganti password akun Docgen Anda.</p>
        <div style="text-align:center;">
          <a href="${url}" style="display:inline-block; background:#2563eb; color:#ffffff; font-weight:600; text-decoration:none; padding:14px 28px; border-radius:12px;">Buat Password Baru</a>
        </div>
        <p style="font-size:12px; line-height:1.6; color:#64748b; margin:24px 0 0;">Tautan ini berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini dan password Anda tidak akan berubah.</p>
      </div>
      <div style="background:#f1f5f9; padding:18px 32px; text-align:center; font-size:12px; color:#64748b;">© ${new Date().getFullYear()} Docgen — Generator Dokumen Bisnis.</div>
    </div>
  </div>
</body>
</html>
        `.trim(),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    async sendVerificationEmail({ user, url }) {
      if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
        console.warn("[Auth] RESEND_API_KEY atau RESEND_FROM belum di-set. Email verifikasi dilewati.");
        return;
      }
      try {
        let verifyUrl = url;
        if (!verifyUrl.includes("callbackURL")) {
          const joiner = verifyUrl.includes("?") ? "&" : "?";
          verifyUrl = `${verifyUrl}${joiner}callbackURL=${encodeURIComponent("/login?verified=1")}`;
        }
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM,
          to: [user.email],
          subject: "Verifikasi Alamat Email Anda - Docgen",
          html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifikasi Email - Docgen</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
    .wrapper { width: 100%; padding: 32px 16px; background-color: #f8fafc; box-sizing: border-box; }
    .container { max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; }
    .header { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); padding: 28px 32px; color: #ffffff; text-align: center; }
    .brand-title { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
    .brand-sub { font-size: 12px; color: #93c5fd; margin-top: 4px; }
    .content { padding: 32px; text-align: center; }
    .message-body { font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px; text-align: left; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; margin: 16px 0 24px 0; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
    .footer { background-color: #f1f5f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img
          src="https://docgen.mipdevp.com/icons/icon-192.png"
          width="56"
          height="56"
          alt="Docgen Logo"
          style="display: block; margin: 0 auto 12px auto; border-radius: 14px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2); border: 2px solid rgba(255, 255, 255, 0.2);"
        />
        <h1 class="brand-title">Docgen</h1>
        <p class="brand-sub">Verifikasi Alamat Email Anda</p>
      </div>
      <div class="content">
        <div class="message-body">
          Halo <strong>${user.name || "Pengguna Docgen"}</strong>,<br/><br/>
          Terima kasih telah mendaftar di Docgen. Sebelum dapat menggunakan akun Anda, mohon konfirmasi alamat email ini dengan menekan tombol di bawah:
        </div>
        <a href="${verifyUrl}" class="btn" target="_blank">Verifikasi Email Saya</a>
        <div class="message-body" style="font-size: 12px; color: #94a3b8; margin-top: 16px;">
          Jika tombol di atas tidak dapat diklik, salin dan tempel link berikut ke browser Anda:<br/>
          <span style="color: #2563eb; word-break: break-all;">${verifyUrl}</span>
        </div>
      </div>
      <div class="footer">
        <p style="margin: 0;">© ${new Date().getFullYear()} Docgen — Generator Dokumen Bisnis.</p>
      </div>
    </div>
  </div>
</body>
</html>
          `.trim(),
        });
      } catch (err) {
        console.error("[Auth] Gagal mengirim email verifikasi:", err);
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "compact",
    },
  },
});
