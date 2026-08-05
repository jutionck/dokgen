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

  const [companyName, setCompanyName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isCompanyValid = mode === "create" ? companyName.trim().length > 0 : joinCode.trim().length > 0;
  const isNameValid = name.trim().length > 0;
  const isEmailValid = email.trim().length > 0 && /^\S+@\S+\.\S+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isFormValid = isCompanyValid && isNameValid && isEmailValid && isPasswordValid;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = new FormData(e.currentTarget);
    const emailVal = String(form.get("email") || "").trim();
    const passwordVal = String(form.get("password") || "");
    const nameVal = String(form.get("name") || "").trim();
    const currentMode = String(form.get("mode") || "create");
    const companyVal = String(form.get("company_name") || "").trim();
    const codeVal = String(form.get("join_code") || "").trim();

    let err: string | null = null;
    if (currentMode === "create" && !companyVal) err = "Nama perusahaan wajib diisi";
    else if (currentMode === "join" && !codeVal) err = "Kode perusahaan wajib diisi";
    else if (!nameVal) err = "Nama Anda wajib diisi";
    else if (!emailVal) err = "Email wajib diisi";
    else if (!/^\S+@\S+\.\S+$/.test(emailVal)) err = "Format email tidak valid";
    else if (passwordVal.length < 6) err = "Password minimal 6 karakter";

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
          <div className="relative mb-1">
            <div className="absolute -inset-1 rounded-2xl bg-blue-600/20 blur-sm sm:hidden" />
            <img
              src="/icon.svg"
              alt="Dokgen"
              className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl shadow-lg shadow-blue-900/25"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Mulai Pakai Dokgen</h1>
          <p className="mt-1 max-w-xs text-xs sm:text-sm text-slate-500">
            Buat akun perusahaan baru atau gabung ke tim dengan kode.
          </p>
        </div>

        <Card className="w-full border-0 bg-transparent shadow-none sm:border sm:border-slate-200/80 sm:bg-white sm:shadow-2xl sm:shadow-blue-900/10 sm:rounded-3xl">
          <CardContent className="px-0 sm:px-8 py-2 sm:py-9">
            <Tabs value={mode} onValueChange={setMode}>
              <form action={action} onSubmit={handleSubmit} className="space-y-4" noValidate>
                <input type="hidden" name="mode" value={mode} />
                {(state?.error || clientError) && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-xs sm:text-sm font-medium text-red-700 shadow-2xs animate-in fade-in-50">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    {clientError || state?.error}
                  </div>
                )}

                <TabsList className="grid w-full grid-cols-2 p-1 h-12 bg-slate-200/60 sm:bg-slate-100 rounded-xl">
                  <TabsTrigger
                    value="create"
                    className="flex items-center justify-center gap-1.5 h-10 rounded-lg text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:shadow-xs"
                  >
                    <Building2 className="h-4 w-4" /> Perusahaan Baru
                  </TabsTrigger>
                  <TabsTrigger
                    value="join"
                    className="flex items-center justify-center gap-1.5 h-10 rounded-lg text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:shadow-xs"
                  >
                    <KeyRound className="h-4 w-4" /> Gabung Tim
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="mt-0 space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="company_name"
                      className="text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                      Nama Perusahaan <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      placeholder="PT Contoh Karya"
                      className="h-12 rounded-xl bg-white text-base sm:text-sm border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 shadow-2xs"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Kota
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Jakarta"
                      className="h-12 rounded-xl bg-white text-base sm:text-sm border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 shadow-2xs"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="join" className="mt-0 space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="join_code"
                      className="text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                      Kode Perusahaan <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="join_code"
                      name="join_code"
                      placeholder="Contoh: ABC123"
                      className="h-12 rounded-xl uppercase tracking-widest bg-white text-base sm:text-sm border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 shadow-2xs font-semibold"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      Minta kode dari pemilik perusahaan di menu Pengaturan → Tim.
                    </p>
                  </div>
                </TabsContent>

                <div className="my-5 h-px bg-slate-200/70 sm:bg-slate-100" />

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Nama Anda <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      autoComplete="name"
                      placeholder="Nama lengkap"
                      className="h-12 rounded-xl bg-white text-base sm:text-sm border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 shadow-2xs"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      placeholder="nama@email.com"
                      className="h-12 rounded-xl bg-white text-base sm:text-sm border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 shadow-2xs"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <PasswordInput
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      containerClassName="[&>input]:h-12 [&>input]:rounded-xl [&>input]:bg-white [&>input]:text-base sm:[&>input]:text-sm [&>input]:border-slate-200 [&>input]:focus:border-blue-600 [&>input]:focus:ring-2 [&>input]:focus:ring-blue-600/20 [&>input]:shadow-2xs"
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98] transition-all shadow-md shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none mt-2"
                  disabled={pending || !isFormValid}
                >
                  {pending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Mendaftarkan...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" /> Daftar Sekarang
                    </>
                  )}
                </Button>
              </form>
            </Tabs>
            <div className="mt-6 pt-5 border-t border-slate-200/60 sm:border-slate-100 text-center">
              <p className="text-sm text-slate-600">
                Sudah punya akun?{" "}
                <a href="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                  Masuk di sini
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
        <AuthFooter />
      </div>
    </main>
  );
}
