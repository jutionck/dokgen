"use client";

import { Suspense, useState } from "react";
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
    setPending(false);

    if (res.error) {
      setError(res.error.message || "Email atau password salah");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Card className="w-full max-w-md border-0 bg-transparent shadow-none sm:border sm:border-slate-200 sm:bg-white sm:shadow-xl sm:shadow-blue-900/10 sm:rounded-2xl">
      <CardHeader className="items-center space-y-1.5 pb-2 pt-2 sm:pt-8 text-center px-0 sm:px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="Dokgen" className="mb-2 h-14 w-14 rounded-2xl shadow-md shadow-blue-900/20" />
        <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Selamat datang kembali
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-slate-500">
          Masuk untuk mengelola seluruh dokumen bisnis Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-7 pb-4 sm:pb-8 pt-2 sm:pt-4">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {registered && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              ✅ Registrasi berhasil. Silakan masuk dengan akun Anda.
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@perusahaan.com"
              className="h-11 bg-white sm:bg-slate-50/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              containerClassName="[&>input]:h-11 [&>input]:bg-white sm:[&>input]:bg-slate-50/50"
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="h-11 w-full text-base font-semibold shadow-2xs" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" /> Masuk
              </>
            )}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <a href="/register" className="font-semibold text-blue-700 hover:underline">
            Daftar di sini
          </a>
        </p>
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
