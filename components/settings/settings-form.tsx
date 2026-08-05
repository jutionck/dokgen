"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Landmark, PenLine, Copy, Check, Trash2, Upload, Users, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { updateCompanyAction, uploadLogoAction, removeLogoAction } from "@/lib/actions/settings";
import type { Company } from "@/lib/types";
import { parseBankAccounts } from "@/components/documents/templates/blocks";

interface Props {
  company: Company;
  members: { id: string; user_id: string; role: string; email: string | null; name: string | null }[];
  isOwner: boolean;
}

interface BankRow {
  key: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;
}

export function SettingsForm({ company, members, isOwner }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState<null | "profil" | "bank" | "signer">(null);
  const [copied, setCopied] = useState(false);

  const [companyForm, setCompanyForm] = useState({
    name: company.name || "",
    tagline: company.tagline || "",
    address: company.address || "",
    phone: company.phone || "",
    email: company.email || "",
    website: company.website || "",
    npwp: company.npwp || "",
    city: company.city || "",
  });

  const initialBankRows = useMemo(() => {
    const parsed = parseBankAccounts(company);
    if (parsed.length === 0) {
      return [{ key: "bank-1", bank_name: "", bank_account_number: "", bank_account_holder: company.name || "" }];
    }
    return parsed.map((item, idx) => ({
      key: `bank-${idx + 1}`,
      bank_name: item.bank_name,
      bank_account_number: item.bank_account_number,
      bank_account_holder: item.bank_account_holder,
    }));
  }, [company]);

  const [bankRows, setBankRows] = useState<BankRow[]>(initialBankRows);

  const addBankRow = () => {
    setBankRows((prev) => [
      ...prev,
      { key: `bank-${Date.now()}`, bank_name: "", bank_account_number: "", bank_account_holder: company.name || "" },
    ]);
  };

  const removeBankRow = (key: string) => {
    setBankRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  };

  const updateBankRow = (key: string, field: keyof BankRow, value: string) => {
    setBankRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const saveBankAccounts = async () => {
    const names = bankRows.map((r) => r.bank_name.trim()).join("\n");
    const numbers = bankRows.map((r) => r.bank_account_number.trim()).join("\n");
    const holders = bankRows.map((r) => r.bank_account_holder.trim()).join("\n");

    const payload = {
      bank_name: names,
      bank_account_number: numbers,
      bank_account_holder: holders,
    };
    save("bank", payload);
  };

  const [signerForm, setSignerForm] = useState({
    signer_name: company.signer_name || "",
    signer_position: company.signer_position || "",
    signer_nip: company.signer_nip || "",
  });

  const [uploading, setUploading] = useState(false);

  const setComp = (k: keyof typeof companyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCompanyForm((f) => ({ ...f, [k]: e.target.value }));
  const setSigner = (k: keyof typeof signerForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSignerForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (which: "profil" | "bank" | "signer", payload: Record<string, string>) => {
    setSaving(which);
    const res = await updateCompanyAction({ ...payload, name: companyForm.name } as never);
    setSaving(null);
    if (res.error) return toast.error(res.error);
    toast.success("Pengaturan berhasil disimpan");
    router.refresh();
  };

  const handleUpload = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("logo", file);
    const res = await uploadLogoAction(fd);
    setUploading(false);
    if (res.error) return toast.error(res.error);
    toast.success("Logo perusahaan diperbarui");
    router.refresh();
  };

  const handleRemoveLogo = async () => {
    const res = await removeLogoAction();
    if (res.error) return toast.error(res.error);
    toast.success("Logo dihapus");
    router.refresh();
  };

  const copyCode = async () => {
    if (!company.join_code) return;
    await navigator.clipboard.writeText(company.join_code);
    setCopied(true);
    toast.success("Kode tim berhasil disalin");
    setTimeout(() => setCopied(false), 1500);
  };

  const roleLabel = (role: string) => (role === "owner" ? "Pemilik" : role === "admin" ? "Admin" : "Anggota");

  return (
    <div className="space-y-6">
      {/* ===== Page Header ===== */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Pengaturan Perusahaan</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Informasi profil, bank, dan penandatangan ini otomatis terintegrasi di seluruh dokumen bisnis Anda.
        </p>
      </div>

      {/* ===== Main Tabs Navigation ===== */}
      <Tabs defaultValue="profil" className="space-y-6">
        <TabsList className="w-full max-w-full overflow-x-auto flex justify-start p-1.5 gap-1.5 bg-slate-100/80 border border-slate-200/60 rounded-2xl">
          <TabsTrigger
            value="profil"
            className="shrink-0 flex items-center gap-2 text-xs sm:text-sm font-semibold rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs py-2 px-3.5 transition-all"
          >
            <Building2 className="h-4 w-4" /> Profil Perusahaan
          </TabsTrigger>
          <TabsTrigger
            value="bank"
            className="shrink-0 flex items-center gap-2 text-xs sm:text-sm font-semibold rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs py-2 px-3.5 transition-all"
          >
            <Landmark className="h-4 w-4" /> Bank & Pembayaran
          </TabsTrigger>
          <TabsTrigger
            value="signer"
            className="shrink-0 flex items-center gap-2 text-xs sm:text-sm font-semibold rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs py-2 px-3.5 transition-all"
          >
            <PenLine className="h-4 w-4" /> Penandatangan
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="shrink-0 flex items-center gap-2 text-xs sm:text-sm font-semibold rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs py-2 px-3.5 transition-all"
          >
            <Users className="h-4 w-4" /> Anggota Tim
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: PROFIL PERUSAHAAN ===== */}
        <TabsContent value="profil">
          <Card className="border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900">Profil & Identitas Perusahaan</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Informasi ini akan dicetak pada kop surat penawaran, invoice, dan SPK.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-6">
              {/* Logo Uploader */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
                  {company.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logo_url} alt="Logo Perusahaan" className="h-full w-full object-contain p-1" />
                  ) : (
                    <Building2 className="h-9 w-9 text-slate-300" />
                  )}
                </div>
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold cursor-pointer shadow-xs transition-all active:scale-95">
                      <Upload className="h-3.5 w-3.5" />
                      {uploading ? "Mengunggah..." : "Upload Logo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e.target.files?.[0])}
                      />
                    </label>
                    {company.logo_url && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus Logo
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Format gambar PNG atau JPG (maksimal 2MB). Disarankan berlatar transparan.
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Nama Perusahaan *</Label>
                  <Input
                    value={companyForm.name}
                    onChange={setComp("name")}
                    placeholder="Nama PT / CV / Perusahaan"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Tagline / Slogan (opsional)</Label>
                  <Input
                    value={companyForm.tagline}
                    onChange={setComp("tagline")}
                    placeholder="Contoh: Digital Solutions Partner"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-bold text-slate-700">Alamat Lengkap</Label>
                  <Input
                    value={companyForm.address}
                    onChange={setComp("address")}
                    placeholder="Jl. Jendral Sudirman No. 123"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Nomor Telepon</Label>
                  <Input
                    value={companyForm.phone}
                    onChange={setComp("phone")}
                    placeholder="081234567890 / 021-123456"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Email Resmi</Label>
                  <Input
                    value={companyForm.email}
                    onChange={setComp("email")}
                    placeholder="info@perusahaan.com"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Website</Label>
                  <Input
                    value={companyForm.website}
                    onChange={setComp("website")}
                    placeholder="https://perusahaan.com"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Kota / Kabupaten</Label>
                  <Input
                    value={companyForm.city}
                    onChange={setComp("city")}
                    placeholder="Jakarta Selatan"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-bold text-slate-700">NPWP Perusahaan</Label>
                  <Input
                    value={companyForm.npwp}
                    onChange={setComp("npwp")}
                    placeholder="00.000.000.0-000.000"
                    className="h-10 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                  onClick={() => save("profil", companyForm)}
                  disabled={saving === "profil"}
                >
                  {saving === "profil" ? "Menyimpan Profil..." : "Simpan Profil Perusahaan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 2: INFORMASI BANK ===== */}
        <TabsContent value="bank">
          <Card className="border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Rekening Bank & Pembayaran</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Rekening ini akan dicetak di invoice agar klien dapat mentransfer pembayaran.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBankRow}
                className="gap-1.5 text-xs font-semibold rounded-xl border-dashed shrink-0"
              >
                <Plus className="h-3.5 w-3.5 text-blue-600" /> Tambah Rekening
              </Button>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="space-y-4">
                {bankRows.map((row, idx) => (
                  <div
                    key={row.key}
                    className="relative flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 text-xs font-bold">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">Rekening Bank #{idx + 1}</span>
                      </div>
                      {bankRows.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBankRow(row.key)}
                          className="h-8 px-2.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700">Nama Bank</Label>
                        <Input
                          value={row.bank_name}
                          onChange={(e) => updateBankRow(row.key, "bank_name", e.target.value)}
                          placeholder="BCA / Mandiri / BNI / BRI"
                          className="h-10 rounded-xl bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700">Nomor Rekening</Label>
                        <Input
                          value={row.bank_account_number}
                          onChange={(e) => updateBankRow(row.key, "bank_account_number", e.target.value)}
                          placeholder="7030298629"
                          className="h-10 rounded-xl font-mono bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700">Atas Nama (Pemilik)</Label>
                        <Input
                          value={row.bank_account_holder}
                          onChange={(e) => updateBankRow(row.key, "bank_account_holder", e.target.value)}
                          placeholder="PT Nama Perusahaan"
                          className="h-10 rounded-xl bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBankRow}
                  className="w-full sm:w-auto gap-1.5 text-xs font-semibold rounded-xl border-slate-200"
                >
                  <Plus className="h-3.5 w-3.5 text-blue-600" /> Tambah Rekening Lain
                </Button>
                <Button
                  className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                  onClick={saveBankAccounts}
                  disabled={saving === "bank"}
                >
                  {saving === "bank" ? "Menyimpan Bank..." : "Simpan Informasi Bank"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 3: PENANDATANGAN DOKUMEN ===== */}
        <TabsContent value="signer">
          <Card className="border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900">Penandatangan Dokumen Resmi</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Nama dan jabatan pejabat yang berwenang menandatangani surat penawaran, invoice, dan SPK.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Nama Penandatangan</Label>
                  <Input
                    value={signerForm.signer_name}
                    onChange={setSigner("signer_name")}
                    placeholder="Nama Lengkap & Gelar"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Jabatan</Label>
                  <Input
                    value={signerForm.signer_position}
                    onChange={setSigner("signer_position")}
                    placeholder="Direktur / Chief Executive Officer"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">NIP / NIK (opsional)</Label>
                  <Input
                    value={signerForm.signer_nip}
                    onChange={setSigner("signer_nip")}
                    placeholder="Nomor Induk Pegawai"
                    className="h-10 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                  onClick={() => save("signer", signerForm)}
                  disabled={saving === "signer"}
                >
                  {saving === "signer" ? "Menyimpan Penandatangan..." : "Simpan Penandatangan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 4: ANGGOTA TIM ===== */}
        <TabsContent value="team">
          <Card className="border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900">Anggota Tim & Kode Akses</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Kelola anggota tim yang memiliki hak akses untuk mengelola dokumen perusahaan.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-6">
              {isOwner && company.join_code && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-blue-200/80 bg-blue-50/70 p-4 sm:p-5">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                      <ShieldCheck className="h-4 w-4" /> Kode Undangan Tim
                    </div>
                    <p className="text-xs text-slate-600 max-w-md">
                      Bagikan kode unik ini kepada rekan tim. Rekan tim dapat mendaftar lewat{" "}
                      <span className="font-mono font-semibold text-blue-800">/register</span> → pilih opsi &quot;Gabung
                      Tim&quot;.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-xl border border-blue-200 bg-white px-4 py-2 font-mono text-xl font-black tracking-[0.3em] text-blue-800 shadow-2xs">
                      {company.join_code}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyCode}
                      title="Salin kode tim"
                      className="h-10 w-10 rounded-xl border-blue-200 bg-white hover:bg-blue-100/50"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-blue-700" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">Daftar Anggota Terdaftar ({members.length})</p>
                <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 overflow-hidden bg-white">
                  {members.map((m) => (
                    <li key={m.id} className="flex items-center justify-between px-4 py-3.5 sm:px-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-600 text-xs">
                          {(m.name || m.email || "U").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{m.name || m.email}</p>
                          <p className="text-xs text-slate-400">{m.email}</p>
                        </div>
                      </div>
                      <Badge
                        variant={m.role === "owner" ? "info" : "secondary"}
                        className="rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                      >
                        {roleLabel(m.role)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>

              {!isOwner && (
                <p className="text-xs text-slate-400 italic">
                  * Hanya pemilik perusahaan (Owner) yang memiliki akses untuk melihat kode tim & mengelola keanggotaan.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
