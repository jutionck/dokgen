"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { AuthFooter } from "@/components/auth/auth-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedEmail = email.trim().toLowerCase();
  const validEmail = /^\S+@\S+\.\S+$/.test(normalizedEmail);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validEmail || pending) return;

    setPending(true);
    setError(null);
    try {
      const result = await authClient.requestPasswordReset({
        email: normalizedEmail,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (result.error) {
        setError(result.error.message || "Permintaan reset password gagal. Silakan coba lagi.");
        return;
      }
      setSent(true);
    } catch {
      setError("Tidak dapat mengirim email reset password. Silakan coba lagi.");
    } finally {
      setPending(false);
    }
  };

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
            <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900">Lupa Password?</CardTitle>
            <CardDescription className="max-w-sm text-sm leading-relaxed">
              Masukkan email akun Docgen. Kami akan mengirimkan tautan untuk membuat password baru.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-8 pt-3 sm:px-8">
            {sent ? (
              <div className="space-y-5 text-center" role="status" aria-live="polite">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <div>
                  <h2 className="font-bold text-slate-900">Periksa email Anda</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    Jika <strong>{normalizedEmail}</strong> terdaftar, tautan reset password akan segera dikirim.
                    Periksa juga folder spam.
                  </p>
                </div>
                <Button asChild variant="outline" className="h-11 w-full rounded-xl">
                  <Link href="/login">
                    <ArrowLeft className="h-4 w-4" /> Kembali ke Login
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nama@perusahaan.com"
                    className="h-12 rounded-xl"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!validEmail || pending}
                  className="h-12 w-full rounded-xl font-semibold"
                >
                  {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                  {pending ? "Mengirim..." : "Kirim Link Reset"}
                </Button>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-700"
                >
                  <ArrowLeft className="h-4 w-4" /> Kembali ke Login
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
        <AuthFooter />
      </div>
    </main>
  );
}
