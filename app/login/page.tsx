"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthFooter } from "@/components/auth/auth-footer";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const verified = searchParams.get("verified") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailVal = email.trim();
    if (!emailVal) {
      setError("Email wajib diisi");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(emailVal)) {
      setError("Format email tidak valid");
      return;
    }
    if (!password) {
      setError("Password wajib diisi");
      return;
    }

    setPending(true);
    const res = await authClient.signIn.email({ email: emailVal, password });

    if (res.error) {
      setPending(false);
      const msg = res.error.message?.toLowerCase() || "";
      if (msg.includes("verify") || msg.includes("verifikasi") || res.error.code === "EMAIL_NOT_VERIFIED") {
        setError("Email Anda belum diverifikasi. Silakan cek inbox/spam email Anda.");
      } else {
        setError(res.error.message || "Email atau password salah");
      }
      return;
    }
    router.replace("/dashboard");
  };

  const isValid = email.trim().length > 0 && /^\S+@\S+\.\S+$/.test(email.trim()) && password.length > 0;

  return (
    <Card className="w-full max-w-md border-0 bg-transparent shadow-none sm:border sm:border-slate-200/80 sm:bg-white sm:shadow-2xl sm:shadow-blue-900/10 sm:rounded-3xl">
      <CardHeader className="items-center space-y-2 pb-3 pt-2 sm:pt-9 text-center px-0 sm:px-8">
        <div className="relative mb-1">
          <div className="absolute -inset-1 rounded-2xl bg-blue-600/20 blur-sm sm:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.svg"
            alt="Docgen"
            className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl shadow-lg shadow-blue-900/25"
          />
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Selamat Datang
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-slate-500 max-w-xs">
          Masuk ke akun Docgen untuk mengelola faktur & dokumen bisnis Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-8 pb-4 sm:pb-9 pt-2 sm:pt-4">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {verified && (
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-2.5 text-center text-xs font-medium text-emerald-800 shadow-2xs">
              Verifikasi email berhasil. Silakan masuk dengan akun Anda.
            </div>
          )}
          {registered && !verified && (
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-2.5 text-center text-xs font-medium text-emerald-800 shadow-2xs">
              Registrasi berhasil. Silakan verifikasi email Anda sebelum masuk.
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-xs sm:text-sm font-medium text-red-700 shadow-2xs animate-in fade-in-50">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
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
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="nama@perusahaan.com"
              className="h-12 rounded-xl bg-white text-base sm:text-sm border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 shadow-2xs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Lupa password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              containerClassName="[&>input]:h-12 [&>input]:rounded-xl [&>input]:bg-white [&>input]:text-base sm:[&>input]:text-sm [&>input]:border-slate-200 [&>input]:focus:border-blue-600 [&>input]:focus:ring-2 [&>input]:focus:ring-blue-600/20 [&>input]:shadow-2xs"
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="h-12 w-full text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98] transition-all shadow-md shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none mt-2"
            disabled={pending || !isValid}
          >
            {pending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" /> Masuk
              </>
            )}
          </Button>
        </form>
        <div className="mt-6 pt-5 border-t border-slate-200/60 sm:border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Belum punya akun?{" "}
            <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="dot-grid relative flex min-h-screen items-center justify-center px-4 py-8 sm:p-4">
      <Suspense fallback={<div className="h-80 w-full max-w-md" />}>
        <div className="flex w-full max-w-md flex-col items-center">
          <LoginForm />
          <AuthFooter />
        </div>
      </Suspense>
    </main>
  );
}
