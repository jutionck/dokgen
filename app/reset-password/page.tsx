"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { AuthFooter } from "@/components/auth/auth-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const invalidToken = searchParams.get("error") === "INVALID_TOKEN" || !token;
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || pending) return;
    if (password.length < 6) return setError("Password minimal 6 karakter.");
    if (password !== confirmation) return setError("Konfirmasi password tidak sama.");

    setPending(true);
    setError(null);
    try {
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result.error) {
        setError(
          result.error.code === "INVALID_TOKEN"
            ? "Tautan reset sudah tidak berlaku. Silakan minta tautan baru."
            : result.error.message || "Gagal mengganti password."
        );
        return;
      }
      setSuccess(true);
    } catch {
      setError("Gagal mengganti password. Silakan coba lagi.");
    } finally {
      setPending(false);
    }
  };

  if (invalidToken) {
    return (
      <div className="space-y-5 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
        <div>
          <h2 className="font-bold text-slate-900">Tautan tidak berlaku</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Tautan reset password sudah kedaluwarsa atau tidak valid. Minta tautan baru untuk melanjutkan.
          </p>
        </div>
        <Button asChild className="h-11 w-full rounded-xl">
          <Link href="/forgot-password">Minta Link Reset Baru</Link>
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-5 text-center" role="status" aria-live="polite">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <div>
          <h2 className="font-bold text-slate-900">Password berhasil diperbarui</h2>
          <p className="mt-1 text-sm text-slate-500">Silakan masuk menggunakan password baru Anda.</p>
        </div>
        <Button asChild className="h-11 w-full rounded-xl">
          <Link href="/login">Masuk ke Docgen</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Password Baru
        </Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimal 6 karakter"
          containerClassName="[&>input]:h-12 [&>input]:rounded-xl"
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmation" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Ulangi Password Baru
        </Label>
        <PasswordInput
          id="confirmation"
          autoComplete="new-password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder="Ketik ulang password"
          containerClassName="[&>input]:h-12 [&>input]:rounded-xl"
        />
      </div>
      <Button
        type="submit"
        disabled={pending || password.length < 6 || !confirmation}
        className="h-12 w-full rounded-xl font-semibold"
      >
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <KeyRound className="h-5 w-5" />}
        {pending ? "Menyimpan..." : "Simpan Password Baru"}
      </Button>
      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Login
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="dot-grid flex min-h-screen items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-md flex-col items-center">
        <Card className="w-full rounded-3xl border-slate-200/80 shadow-2xl shadow-blue-900/10">
          <CardHeader className="items-center px-6 pb-3 pt-8 text-center sm:px-8">
            <Image
              src="/icon.svg"
              alt="Docgen"
              width={56}
              height={56}
              priority
              className="mb-2 rounded-2xl shadow-lg shadow-blue-900/20"
            />
            <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900">Buat Password Baru</CardTitle>
            <CardDescription className="text-sm">
              Gunakan password yang kuat dan belum pernah Anda gunakan.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-8 pt-3 sm:px-8">
            <Suspense fallback={<div className="h-64" />}>
              <ResetPasswordForm />
            </Suspense>
          </CardContent>
        </Card>
        <AuthFooter />
      </div>
    </main>
  );
}
