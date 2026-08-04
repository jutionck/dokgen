"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Landmark, PenLine, Copy, Check, Trash2, Upload, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    // nama perusahaan selalu disertakan (wajib di server action)
    const res = await updateCompanyAction({ ...payload, name: companyForm.name } as never);
    setSaving(null);
    if (res.error) return toast.error(res.error);
    toast.success("Pengaturan disimpan");
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
    toast.success("Logo diperbarui");
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
    setTimeout(() => setCopied(false), 1500);
  };

  const roleLabel = (role: string) => (role === "owner" ? "Pemilik" : role === "admin" ? "Admin" : "Anggota");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">
          Data perusahaan ini otomatis muncul di semua dokumen yang Anda buat.
        </p>
      </div>

      <Tabs defaultValue="profil">
        <TabsList className="w-full max-w-full overflow-x-auto flex justify-start sm:justify-center p-1 gap-1 bg-slate-100/90 rounded-lg">
          <TabsTrigger value="profil" className="shrink-0 flex items-center gap-1.5 text-xs sm:text-sm font-medium">
            <Building2 className="h-3.5 w-3.5" /> Profil
          </TabsTrigger>
          <TabsTrigger value="bank" className="shrink-0 flex items-center gap-1.5 text-xs sm:text-sm font-medium">
            <Landmark className="h-3.5 w-3.5" /> Bank
          </TabsTrigger>
          <TabsTrigger value="signer" className="shrink-0 flex items-center gap-1.5 text-xs sm:text-sm font-medium">
            <PenLine className="h-3.5 w-3.5" /> Penandatangan
          </TabsTrigger>
          <TabsTrigger value="team" className="shrink-0 flex items-center gap-1.5 text-xs sm:text-sm font-medium">
            <Users className="h-3.5 w-3.5" /> Tim
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profil">
          <Card>
            <CardHeader>
              <CardTitle>Profil Perusahaan</CardTitle>
              <CardDescription>Logo, identitas, dan kontak perusahaan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-slate-50">
                  {company.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logo_url} alt="logo" className="h-full w-full object-contain" />
                  ) : (
                    <Building2 className="h-8 w-8 text-slate-300" />
                  )}
                </div>
                <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                  <label className="inline-flex items-center justify-center sm:justify-start gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-slate-50 cursor-pointer">
                    <Upload className="h-4 w-4" />
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
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Hapus logo
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nama Perusahaan *</Label>
                  <Input value={companyForm.name} onChange={setComp("name")} />
                </div>
                <div className="space-y-2">
                  <Label>Tagline (opsional)</Label>
                  <Input value={companyForm.tagline} onChange={setComp("tagline")} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Alamat</Label>
                  <Input value={companyForm.address} onChange={setComp("address")} />
                </div>
                <div className="space-y-2">
                  <Label>Telepon</Label>
                  <Input value={companyForm.phone} onChange={setComp("phone")} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={companyForm.email} onChange={setComp("email")} />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={companyForm.website} onChange={setComp("website")} />
                </div>
                <div className="space-y-2">
                  <Label>Kota</Label>
                  <Input value={companyForm.city} onChange={setComp("city")} placeholder="Cimahi" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>NPWP</Label>
                  <Input value={companyForm.npwp} onChange={setComp("npwp")} />
                </div>
              </div>
              <Button
                className="w-full sm:w-auto"
                onClick={() => save("profil", companyForm)}
                disabled={saving === "profil"}
              >
                {saving === "profil" ? "Menyimpan..." : "Simpan Profil"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Informasi Bank</CardTitle>
                <CardDescription>
                  Muncul di invoice dan dokumen pembayaran. Anda dapat menambahkan lebih dari 1 rekening bank.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBankRow}
                className="gap-1.5 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" /> Tambah Rekening
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {bankRows.map((row, idx) => (
                  <div
                    key={row.key}
                    className="relative flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Rekening Bank #{idx + 1}</span>
                      {bankRows.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBankRow(row.key)}
                          className="h-7 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Hapus
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Nama Bank</Label>
                        <Input
                          value={row.bank_name}
                          onChange={(e) => updateBankRow(row.key, "bank_name", e.target.value)}
                          placeholder="Contoh: BCA / Mandiri / BNI"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">No. Rekening</Label>
                        <Input
                          value={row.bank_account_number}
                          onChange={(e) => updateBankRow(row.key, "bank_account_number", e.target.value)}
                          placeholder="Contoh: 7030298629"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Atas Nama</Label>
                        <Input
                          value={row.bank_account_holder}
                          onChange={(e) => updateBankRow(row.key, "bank_account_holder", e.target.value)}
                          placeholder="Nama pemilik rekening"
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
                  className="w-full sm:w-auto gap-1.5 text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Rekening Lain
                </Button>
                <Button className="w-full sm:w-auto" onClick={saveBankAccounts} disabled={saving === "bank"}>
                  {saving === "bank" ? "Menyimpan..." : "Simpan Bank"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signer">
          <Card>
            <CardHeader>
              <CardTitle>Penandatangan Dokumen</CardTitle>
              <CardDescription>Nama yang tampil di kolom tanda tangan dokumen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Nama</Label>
                  <Input value={signerForm.signer_name} onChange={setSigner("signer_name")} />
                </div>
                <div className="space-y-2">
                  <Label>Jabatan</Label>
                  <Input
                    value={signerForm.signer_position}
                    onChange={setSigner("signer_position")}
                    placeholder="Direktur"
                  />
                </div>
                <div className="space-y-2 sm:col-span-3 lg:col-span-1">
                  <Label>NIP / NIK (opsional)</Label>
                  <Input value={signerForm.signer_nip} onChange={setSigner("signer_nip")} />
                </div>
              </div>
              <div>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => save("signer", signerForm)}
                  disabled={saving === "signer"}
                >
                  {saving === "signer" ? "Menyimpan..." : "Simpan Penandatangan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Anggota Tim</CardTitle>
              <CardDescription>Anggota bisa login dan mengakses semua dokumen perusahaan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isOwner && company.join_code && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div>
                    <p className="text-sm font-medium">Kode Bergabung Tim</p>
                    <p className="text-xs text-slate-600">
                      Bagikan kode ini ke rekan tim. Mereka mendaftar lewat halaman{" "}
                      <span className="font-mono">/register</span> → &quot;Gabung Tim&quot;.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded border bg-white px-4 py-2 font-mono text-lg font-bold tracking-[0.3em] text-blue-800">
                      {company.join_code}
                    </span>
                    <Button variant="outline" size="icon" onClick={copyCode} title="Salin kode">
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
              <ul className="divide-y rounded-lg border">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{m.name || m.email}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {roleLabel(m.role)}
                    </span>
                  </li>
                ))}
              </ul>
              {!isOwner && (
                <p className="text-xs text-muted-foreground">
                  Hanya pemilik yang bisa melihat kode tim dan mengelola keanggotaan.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
