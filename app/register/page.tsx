"use client";

import { useActionState, useState } from "react";
import { Building2, KeyRound, AlertCircle, Loader2, UserPlus } from "lucide-react";
import { registerAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent } from "@/components/ui/card";
import { AuthFooter } from "@/components/auth/auth-footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, null);
  const [mode, setMode] = useState("create");
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const name = String(form.get("name") || "").trim();
    const currentMode = String(form.get("mode") || "create");
    const companyName = String(form.get("company_name") || "").trim();
    const joinCode = String(form.get("join_code") || "").trim();

    let err: string | null = null;
    if (currentMode === "create" && !companyName) err = "Nama perusahaan wajib diisi";
    else if (currentMode === "join" && !joinCode) err = "Kode perusahaan wajib diisi";
    else if (!name) err = "Nama Anda wajib diisi";
    else if (!email) err = "Email wajib diisi";
    else if (!/^\S+@\S+\.\S+$/.test(email)) err = "Format email tidak valid";
    else if (password.length < 6) err = "Password minimal 6 karakter";

    if (err) {
      e.preventDefault();
      setClientError(err);
      return;
    }
    setClientError(null);
  };

  return (
    <main className="dot-grid relative flex min-h-screen items-center justify-center px-4 py-8 sm:p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 sm:mb-6 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.svg"
            alt="Dokgen"
            className="mb-2.5 h-14 w-14 sm:h-16 sm:w-16 rounded-2xl shadow-md shadow-blue-900/20"
          />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Mulai pakai Dokgen</h1>
          <p className="mt-1 max-w-xs text-xs sm:text-sm text-slate-500">
            Buat perusahaan baru, atau gabung ke perusahaan tim dengan kode.
          </p>
        </div>

        <Card className="w-full border-0 bg-transparent shadow-none sm:border sm:border-slate-200 sm:bg-white sm:shadow-xl sm:shadow-blue-900/10 sm:rounded-2xl">
          <CardContent className="px-0 sm:px-7 py-2 sm:py-7">
            <Tabs value={mode} onValueChange={setMode}>
              <form action={action} onSubmit={handleSubmit} className="space-y-4" noValidate>
                <input type="hidden" name="mode" value={mode} />
                {(state?.error || clientError) && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {clientError || state?.error}
                  </div>
                )}

                <TabsList className="grid w-full grid-cols-2 bg-slate-200/60 sm:bg-slate-100">
                  <TabsTrigger value="create" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
                    <Building2 className="h-3.5 w-3.5" /> Perusahaan Baru
                  </TabsTrigger>
                  <TabsTrigger value="join" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
                    <KeyRound className="h-3.5 w-3.5" /> Gabung Tim
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="mt-0 space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="company_name">
                      Nama Perusahaan <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      placeholder="PT Contoh Karya"
                      className="h-11 bg-white sm:bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city">Kota</Label>
                    <Input id="city" name="city" placeholder="Jakarta" className="h-11 bg-white sm:bg-slate-50/50" />
                  </div>
                </TabsContent>

                <TabsContent value="join" className="mt-0 space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="join_code">
                      Kode Perusahaan <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="join_code"
                      name="join_code"
                      placeholder="Contoh: ABC123"
                      className="h-11 uppercase tracking-widest bg-white sm:bg-slate-50/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minta kode dari pemilik perusahaan di menu Pengaturan → Tim.
                    </p>
                  </div>
                </TabsContent>

                <div className="my-5 h-px bg-slate-200/80 sm:bg-slate-100" />
                <p className="-mt-1 text-xs text-muted-foreground">
                  Kolom bertanda <span className="text-red-500">*</span> wajib diisi
                </p>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">
                      Nama Anda <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Nama lengkap"
                      className="h-11 bg-white sm:bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="nama@email.com"
                      className="h-11 bg-white sm:bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <PasswordInput
                      id="password"
                      name="password"
                      containerClassName="[&>input]:h-11 [&>input]:bg-white sm:[&>input]:bg-slate-50/50"
                      placeholder="Minimal 6 karakter"
                    />
                  </div>
                </div>

                <Button type="submit" className="h-11 w-full text-base font-semibold shadow-2xs" disabled={pending}>
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Mendaftarkan...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" /> Daftar
                    </>
                  )}
                </Button>
              </form>
            </Tabs>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <a href="/login" className="font-semibold text-blue-700 hover:underline">
                Masuk
              </a>
            </p>
          </CardContent>
        </Card>
        <AuthFooter />
      </div>
    </main>
  );
}
