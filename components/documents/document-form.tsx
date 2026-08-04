"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  FileText,
  Briefcase,
  Calculator,
  FileCheck,
  ListOrdered,
  List,
  TableProperties,
  Landmark,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DOC_TYPES, DOC_STATUS } from "@/lib/types";
import type { Client, DocRecord, DocStatus, DocType, DocumentItem, DocExtra, Company } from "@/lib/types";
import { createDocumentAction, updateDocumentAction } from "@/lib/actions/documents";
import { formatIDR, todayISO } from "@/lib/utils";
import type { DocSeed } from "@/lib/documents/templates";
import { parseScopeOfWork, parseBankAccounts } from "@/components/documents/templates/blocks";

interface ItemRow extends DocumentItem {
  key: number;
}

interface DocumentFormProps {
  mode: "create" | "edit";
  clients: Client[];
  initialType?: DocType;
  seed?: DocSeed | null;
  doc?: DocRecord | null;
  items?: DocumentItem[];
  company?: Company;
}

function emptyExtra(): DocExtra {
  return {
    intro: "",
    scope_of_work: "",
    validity_days: 14,
    payment_terms: "",
    po_number: "",
    project_title: "",
    work_description: "",
    start_date: "",
    end_date: "",
    location: "",
    contract_ref: "",
    duration_text: "",
    clauses: "",
    result_text: "",
  };
}

const defaultTerms: Record<DocType, string> = {
  penawaran:
    "1. Penawaran ini berlaku selama 14 hari sejak tanggal penerbitan.\n2. Pembayaran DP 50% saat persetujuan penawaran, pelunasan 50% setelah pekerjaan selesai.\n3. Harga sudah termasuk semua biaya terkait kecuali dinyatakan lain.",
  quotation:
    "1. Quotation berlaku selama 14 hari sejak tanggal penerbitan.\n2. Pengerjaan dimulai setelah persetujuan quotation ini dikonfirmasi.\n3. Pembayaran dilakukan sesuai dengan syarat dan ketentuan yang disepakati.",
  invoice:
    "1. Pembayaran dapat dilakukan via transfer ke rekening bank resmi yang tertera pada dokumen ini.\n2. Mohon konfirmasi atau kirimkan bukti transfer setelah pembayaran selesai dilakukan.",
  bast: "1. Pekerjaan telah diperiksa dan diserahkan dalam keadaan baik dan lengkap.\n2. Hak dan kewajiban para pihak atas hasil pekerjaan ini tunduk pada syarat dan ketentuan yang berlaku.",
  kontrak:
    "1. Surat Perjanjian ini mengikat kedua belah pihak sejak tanggal ditandatangani.\n2. Segala perubahan atau penambahan lingkup pekerjaan akan disepakati bersama secara tertulis.",
};

function ListHelperButtons({
  value,
  onChange,
  showTableFormat = false,
}: {
  value: string;
  onChange: (val: string) => void;
  showTableFormat?: boolean;
}) {
  const formatNumbered = () => {
    if (!value.trim()) {
      onChange(
        "1. Estimasi waktu pengerjaan 1-2 minggu terhitung setelah DP 1 diterima (50%)\n2. Garansi bug-fixing selama 90 hari setelah go-live tanpa biaya tambahan.\n3. Penawaran ini berlaku selama 14 hari sejak tanggal penerbitan."
      );
      return;
    }
    const lines = value.split("\n");
    const formatted = lines
      .map((line, idx) => {
        const clean = line.replace(/^(\d+[\.\)]|[•\-\*]|->)\s*/, "").trim();
        return clean ? `${idx + 1}. ${clean}` : "";
      })
      .filter(Boolean)
      .join("\n");
    onChange(formatted);
  };

  const formatBullet = () => {
    if (!value.trim()) {
      onChange("• KTP Pengelola (wajib)\n• NIB (wajib)\n• Sertifikat merek (jika ada)");
      return;
    }
    const lines = value.split("\n");
    const formatted = lines
      .map((line) => {
        const clean = line.replace(/^(\d+[\.\)]|[•\-\*]|->)\s*/, "").trim();
        return clean ? `• ${clean}` : "";
      })
      .filter(Boolean)
      .join("\n");
    onChange(formatted);
  };

  const formatTable = () => {
    if (!value.trim()) {
      onChange(
        "Setup server, domain (kabarsumatera.co.id*), SSL dan Basic SEO | Persyaratan domain .co.id: - KTP Pengelola (wajib) - NIB (wajib)\nInstalasi dan konfigurasi Laravel 13 | Framework & CMS\nSistem manajemen artikel: buat, edit, hapus, preview | Rich Text Editor\nManajemen galeri foto, embed video YouTube, infografis | Media management\nTesting, bug fixing, dan deployment produksi | Go-live"
      );
      return;
    }
    const lines = value.split("\n");
    const formatted = lines
      .map((line) => {
        const clean = line.replace(/^(\d+[\.\)]|[•\-\*]|->)\s*/, "").trim();
        return clean.includes("|") ? clean : `${clean} | -`;
      })
      .filter(Boolean)
      .join("\n");
    onChange(formatted);
  };

  return (
    <div className="flex items-center gap-1.5">
      {showTableFormat && (
        <button
          type="button"
          onClick={formatTable}
          className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
          title="Format tabel: Deskripsi Pekerjaan | Keterangan"
        >
          <TableProperties className="h-3 w-3" /> Format Tabel (|)
        </button>
      )}
      <button
        type="button"
        onClick={formatNumbered}
        className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
        title="Format atau buat list angka (1., 2., 3.)"
      >
        <ListOrdered className="h-3 w-3" /> List Angka (1,2,3)
      </button>
      <button
        type="button"
        onClick={formatBullet}
        className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
        title="Format atau buat list poin (•)"
      >
        <List className="h-3 w-3" /> List Poin (•)
      </button>
    </div>
  );
}

export function DocumentForm({
  mode,
  clients,
  initialType = "invoice",
  seed,
  doc,
  items: initialItems = [],
  company,
}: DocumentFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const startDoc = doc?.extra || emptyExtra();

  const companyBankAccounts = useMemo(() => {
    const comp = company || (doc as { company?: Company })?.company || (seed as { company?: Company })?.company || {};
    return parseBankAccounts(comp);
  }, [company, doc, seed]);

  const [type, setType] = useState<DocType>(isEdit ? doc!.type : initialType);
  const [clientId, setClientId] = useState(doc?.client_id || "");
  const [title, setTitle] = useState(isEdit ? doc!.title : seed?.title || DOC_TYPES[initialType].defaultTitle);
  const [status, setStatus] = useState<DocStatus>(isEdit ? doc!.status : "draft");
  const [issueDate, setIssueDate] = useState(doc?.issue_date || todayISO());
  const [dueDate, setDueDate] = useState(doc?.due_date || "");
  const [currency, setCurrency] = useState(doc?.currency || "IDR");
  const [taxRate, setTaxRate] = useState(String(doc?.tax_rate ?? 0));
  const [discount, setDiscount] = useState(String(doc?.discount ?? 0));
  const [notes, setNotes] = useState(doc?.notes || seed?.notes || "");
  const [terms, setTerms] = useState(doc?.terms ?? (isEdit ? "" : (seed?.terms ?? defaultTerms[initialType])));
  const [extra, setExtra] = useState<DocExtra>({
    ...emptyExtra(),
    ...(seed?.extra || {}),
    ...(startDoc || {}),
  });
  const [rows, setRows] = useState<ItemRow[]>(
    initialItems.length
      ? initialItems.map((it, i) => ({ ...it, qty: Number(it.qty), unit_price: Number(it.unit_price), key: i }))
      : seed?.items?.length
        ? seed.items.map((it, i) => ({ ...it, qty: Number(it.qty), unit_price: Number(it.unit_price), key: i }))
        : [{ description: "", qty: 1, unit: "pcs", unit_price: 0, key: 0 }]
  );

  // Initial Scope Rows (parsed from extra.scope_of_work)
  const initialScopeRows = useMemo(() => {
    const parsed = parseScopeOfWork(extra.scope_of_work || "");
    if (parsed.length === 0) {
      return [{ key: "scope-1", description: "", note: "" }];
    }
    return parsed.map((item, idx) => ({
      key: `scope-${idx + 1}`,
      description: item.description,
      note: item.note,
    }));
  }, [extra.scope_of_work]);

  const [scopeRows, setScopeRows] = useState(initialScopeRows);

  const syncScopeToExtra = (updatedRows: { key: string; description: string; note: string }[]) => {
    const serialized = updatedRows
      .filter((r) => r.description.trim() || r.note.trim())
      .map((r) => (r.note.trim() ? `${r.description.trim()} | ${r.note.trim()}` : r.description.trim()))
      .join("\n");
    setExtra((ex) => ({ ...ex, scope_of_work: serialized }));
  };

  const updateScopeRow = (key: string, field: "description" | "note", value: string) => {
    setScopeRows((prev) => {
      const updated = prev.map((r) => (r.key === key ? { ...r, [field]: value } : r));
      syncScopeToExtra(updated);
      return updated;
    });
  };

  const addScopeRow = () => {
    setScopeRows((prev) => {
      const updated = [...prev, { key: `scope-${Date.now()}`, description: "", note: "" }];
      syncScopeToExtra(updated);
      return updated;
    });
  };

  const removeScopeRow = (key: string) => {
    setScopeRows((prev) => {
      const updated = prev.length > 1 ? prev.filter((r) => r.key !== key) : prev;
      syncScopeToExtra(updated);
      return updated;
    });
  };

  const isPenawaran = type === "penawaran";
  const isQuotation = type === "quotation";
  const isKontrak = type === "kontrak";
  const isBast = type === "bast";
  const isInvoice = type === "invoice";
  const showDetailCard = isPenawaran || isQuotation || isKontrak || isBast;

  const setExtraField = (key: keyof DocExtra) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setExtra((ex) => ({ ...ex, [key]: e.target.value }));

  const updateRow = (key: number, field: keyof ItemRow, value: string) =>
    setRows((rs) =>
      rs.map((r) =>
        r.key === key ? { ...r, [field]: field === "description" || field === "unit" ? value : Number(value) || 0 } : r
      )
    );

  const addRow = () =>
    setRows((rs) => [...rs, { description: "", qty: 1, unit: "pcs", unit_price: 0, key: Date.now() }]);
  const removeRow = (key: number) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs));

  const totals = useMemo(() => {
    const subtotal = rows.reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.unit_price) || 0), 0);
    const disc = Number(discount) || 0;
    const taxable = Math.max(subtotal - disc, 0);
    const tax = (taxable * (Number(taxRate) || 0)) / 100;
    return { subtotal, disc, tax, total: taxable + tax };
  }, [rows, discount, taxRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type,
      title,
      client_id: clientId || undefined,
      status,
      issue_date: issueDate,
      due_date: dueDate || undefined,
      currency,
      tax_rate: Number(taxRate) || 0,
      discount: Number(discount) || 0,
      notes,
      terms,
      extra,
      items: rows.map((r) => ({
        description: r.description,
        qty: Number(r.qty) || 0,
        unit: r.unit || "pcs",
        unit_price: Number(r.unit_price) || 0,
      })),
    };

    const res = isEdit ? await updateDocumentAction(doc!.id, payload) : await createDocumentAction(payload);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(isEdit ? "Dokumen diperbarui" : `Dokumen dibuat: ${res.number}`);
    router.push(`/documents/${isEdit ? doc!.id : res.id}`);
    router.refresh();
  };

  const changeType = (t: DocType) => {
    setType(t);
    setTitle(DOC_TYPES[t].defaultTitle);
    if (!isEdit) setTerms(defaultTerms[t]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24 sm:pb-0">
      {/* Top Bar Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          {!isEdit ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Jenis Dokumen:</span>
              <Select
                value={type}
                onValueChange={(v) => changeType(v as DocType)}
                className="w-auto min-w-[200px] sm:min-w-[240px] font-semibold"
                options={(Object.keys(DOC_TYPES) as DocType[]).map((t) => ({
                  value: t,
                  label: DOC_TYPES[t].label,
                }))}
              />
            </div>
          ) : (
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <FileText className="h-3.5 w-3.5" />
                {DOC_TYPES[type].label}
              </span>
              <h2 className="mt-1 font-mono text-xl font-bold tracking-tight text-slate-900">{doc!.number}</h2>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Status:</span>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as DocStatus)}
              className="w-36 font-medium"
              options={(Object.keys(DOC_STATUS) as DocStatus[]).map((s) => ({
                value: s,
                label: DOC_STATUS[s].label,
              }))}
            />
          </div>
          <Button type="submit" className="gap-2 shadow-sm transition-all hover:shadow">
            <Save className="h-4 w-4" /> {isEdit ? "Simpan Perubahan" : "Simpan Dokumen"}
          </Button>
        </div>
      </div>

      {/* 1. INFORMASI UMUM */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3 pt-4">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-blue-100 p-1.5 text-blue-600">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">Informasi Utama</CardTitle>
              <CardDescription className="text-xs">Informasi dasar identitas dokumen & penerima</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Judul Dokumen</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Invoice Tagihan" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Klien / Pelanggan</Label>
            <Select
              value={clientId}
              onValueChange={setClientId}
              placeholder="— Pilih Klien —"
              options={[
                { value: "", label: "— Tanpa Klien —" },
                ...clients.map((c) => ({ value: c.id, label: c.company ? `${c.company} (${c.name})` : c.name })),
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Tanggal Terbit</Label>
            <DateInput value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Jatuh Tempo</Label>
            <DateInput value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Mata Uang</Label>
            <Select
              value={currency}
              onValueChange={setCurrency}
              options={[
                { value: "IDR", label: "IDR — Rupiah (Rp)" },
                { value: "USD", label: "USD — US Dollar ($)" },
                { value: "SGD", label: "SGD — SG Dollar (S$)" },
                { value: "MYR", label: "MYR — Ringgit (RM)" },
              ]}
            />
          </div>

          {(isQuotation || isInvoice) && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">No. PO / Referensi</Label>
              <Input
                value={extra.po_number || ""}
                onChange={setExtraField("po_number")}
                placeholder="No. Purchase Order (opsional)"
              />
            </div>
          )}

          {(isPenawaran || isQuotation) && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Masa Berlaku Penawaran</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={String(extra.validity_days ?? 14)}
                  onChange={(e) => setExtra((ex) => ({ ...ex, validity_days: Number(e.target.value) || 14 }))}
                />
                <span className="text-xs font-medium text-slate-500 shrink-0">Hari</span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Pajak PPN (%)</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              max={100}
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Diskon (Nominal Rp)</Label>
            <Input
              type="number"
              min={0}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. DETAIL PEKERJAAN (Tergantung Jenis Dokumen) */}
      {showDetailCard && (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3 pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-purple-100 p-1.5 text-purple-600">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-800">Detail Pekerjaan & Kontrak</CardTitle>
                <CardDescription className="text-xs">
                  Informasi spesifik mengenai lingkup & durasi pekerjaan
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
            {(isPenawaran || isKontrak) && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">Judul / Nama Pekerjaan</Label>
                <Input
                  value={extra.project_title || ""}
                  onChange={setExtraField("project_title")}
                  placeholder="Contoh: Pembuatan Website E-Commerce & Integration API"
                />
              </div>
            )}

            {(isKontrak || isBast) && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Tanggal Mulai Pekerjaan</Label>
                  <DateInput value={extra.start_date || ""} onChange={setExtraField("start_date")} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Tanggal Selesai Pekerjaan</Label>
                  <DateInput value={extra.end_date || ""} onChange={setExtraField("end_date")} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Lokasi Pekerjaan</Label>
                  <Input
                    value={extra.location || ""}
                    onChange={setExtraField("location")}
                    placeholder="Kota / lokasi pekerjaan (contoh: Jakarta Selatan)"
                  />
                </div>
              </>
            )}

            {isKontrak && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Durasi (Teks opsional)</Label>
                <Input
                  value={extra.duration_text || ""}
                  onChange={setExtraField("duration_text")}
                  placeholder="Contoh: 30 hari kerja / 3 bulan"
                />
              </div>
            )}

            {(isPenawaran || isQuotation) && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">Paragraf Pembuka (Opsional)</Label>
                <Textarea
                  value={extra.intro || ""}
                  onChange={setExtraField("intro")}
                  placeholder="Kalimat pembuka khusus sebelum daftar item..."
                  rows={2}
                />
              </div>
            )}

            {(isPenawaran || isKontrak || isBast) && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">Uraian / Deskripsi Pekerjaan</Label>
                <Textarea
                  value={extra.work_description || ""}
                  onChange={setExtraField("work_description")}
                  placeholder="Uraian ringkas pekerjaan yang telah atau akan diselesaikan..."
                  rows={3}
                />
              </div>
            )}

            {isBast && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Referensi Kontrak / SPK</Label>
                  <Input
                    value={extra.contract_ref || ""}
                    onChange={setExtraField("contract_ref")}
                    placeholder="No. Kontrak / SPK (contoh: 001/SPK/08/2026)"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    Pernyataan Hasil Serah Terima (Opsional)
                  </Label>
                  <Textarea
                    value={extra.result_text || ""}
                    onChange={setExtraField("result_text")}
                    rows={2}
                    placeholder="Bahwa seluruh pekerjaan telah diselesaikan dengan baik..."
                  />
                </div>
              </>
            )}

            {isKontrak && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">Ketentuan Lain / Klausul Tambahan</Label>
                <Textarea
                  value={extra.clauses || ""}
                  onChange={setExtraField("clauses")}
                  rows={3}
                  placeholder="Klausul khusus perjanjian..."
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* LINGKUP PEKERJAAN REPEATER (Untuk Penawaran & Quotation) */}
      {(isPenawaran || isQuotation) && (
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 pb-3 pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-blue-100 p-1.5 text-blue-600">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-800">Rincian Lingkup Pekerjaan</CardTitle>
                <CardDescription className="text-xs">
                  Daftar rincian pekerjaan dan keterangan spesifikasi yang tampil pada tabel penawaran
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addScopeRow}
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Baris
            </Button>
          </CardHeader>
          <CardContent className="p-5">
            {/* Header Tabel Desktop */}
            <div className="hidden grid-cols-12 gap-3 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500 sm:grid">
              <div className="col-span-6">Deskripsi Pekerjaan</div>
              <div className="col-span-5">Keterangan / Spesifikasi</div>
              <div className="col-span-1 text-center">Hapus</div>
            </div>

            {/* Body Rows */}
            <div className="mt-3 space-y-3">
              {scopeRows.map((row, idx) => (
                <div
                  key={row.key}
                  className="group relative flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3 shadow-xs transition-all sm:grid sm:grid-cols-12 sm:items-center sm:gap-3 sm:bg-white sm:p-2"
                >
                  {/* Mobile Header Index */}
                  <div className="flex items-center justify-between sm:hidden">
                    <span className="text-xs font-bold text-slate-500">Pekerjaan #{idx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeScopeRow(row.key)}
                      className="h-7 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Hapus
                    </Button>
                  </div>

                  {/* Deskripsi Pekerjaan */}
                  <div className="sm:col-span-6">
                    <Input
                      placeholder="Contoh: Setup server, domain (kabarsumatera.co.id), SSL & Basic SEO"
                      value={row.description}
                      onChange={(e) => updateScopeRow(row.key, "description", e.target.value)}
                      className="text-sm font-medium"
                    />
                  </div>

                  {/* Keterangan */}
                  <div className="sm:col-span-5">
                    <Input
                      placeholder="Contoh: Persyaratan domain .co.id: - KTP Pengelola - NIB"
                      value={row.note}
                      onChange={(e) => updateScopeRow(row.key, "note", e.target.value)}
                      className="text-sm text-slate-600"
                    />
                  </div>

                  {/* Desktop Hapus Button */}
                  <div className="hidden text-center sm:block sm:col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeScopeRow(row.key)}
                      className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Hapus baris"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addScopeRow}
                className="gap-1.5 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" /> Tambah Baris Baru
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. RINCIAN HARGA / ITEM */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 pb-3 pt-4">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-emerald-100 p-1.5 text-emerald-600">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">Rincian Item & Biaya</CardTitle>
              <CardDescription className="text-xs">
                Daftar item barang/jasa, kuantitas, dan harga satuan
              </CardDescription>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1.5 text-xs font-semibold">
            <Plus className="h-3.5 w-3.5" /> Tambah Baris
          </Button>
        </CardHeader>
        <CardContent className="p-5">
          {/* Header Tabel Desktop */}
          <div className="hidden grid-cols-12 gap-3 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500 sm:grid">
            <div className="col-span-5">Deskripsi Barang / Jasa</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-center">Satuan</div>
            <div className="col-span-2 text-right">Harga Satuan (Rp)</div>
            <div className="col-span-1 text-center">Hapus</div>
          </div>

          {/* Body Rows */}
          <div className="mt-3 space-y-3">
            {rows.map((row, idx) => (
              <div
                key={row.key}
                className="group relative flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3 shadow-xs transition-all hover:border-slate-300 sm:grid sm:grid-cols-12 sm:items-center sm:gap-3 sm:bg-white sm:p-2 sm:hover:bg-slate-50/30"
              >
                {/* Mobile Item Index */}
                <div className="flex items-center justify-between sm:hidden">
                  <span className="text-xs font-bold text-slate-500">Item #{idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(row.key)}
                    className="h-7 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </Button>
                </div>

                {/* Deskripsi */}
                <div className="sm:col-span-5">
                  <Input
                    placeholder="Uraian barang / jasa (contoh: Website CMS & Domain 1 tahun)"
                    value={row.description}
                    onChange={(e) => updateRow(row.key, "description", e.target.value)}
                    className="text-sm"
                  />
                </div>

                {/* Qty & Satuan & Harga */}
                <div className="grid grid-cols-3 gap-2 sm:contents">
                  <div className="sm:col-span-2">
                    <p className="mb-1 text-[10px] font-semibold text-slate-500 sm:hidden">Qty</p>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="Qty"
                      value={row.qty}
                      onChange={(e) => updateRow(row.key, "qty", e.target.value)}
                      className="text-center text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <p className="mb-1 text-[10px] font-semibold text-slate-500 sm:hidden">Satuan</p>
                    <Select
                      value={row.unit}
                      onValueChange={(v) => updateRow(row.key, "unit", v)}
                      options={["pcs", "unit", "paket", "set", "jam", "hari", "bulan", "kali", "ls", "meter", "kg"].map(
                        (u) => ({ value: u, label: u })
                      )}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <p className="mb-1 text-[10px] font-semibold text-slate-500 sm:hidden">Harga Satuan</p>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Harga"
                      value={row.unit_price}
                      onChange={(e) => updateRow(row.key, "unit_price", e.target.value)}
                      className="text-right text-sm font-mono"
                    />
                  </div>
                </div>

                {/* Subtotal Item & Tombol Hapus (Desktop) */}
                <div className="hidden sm:col-span-1 sm:flex sm:items-center sm:justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(row.key)}
                    className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Hapus baris ini"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Ringkasan Subtotal & Total */}
          <div className="mt-6 flex flex-col justify-between gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-end">
            <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1.5 self-start text-xs">
              <Plus className="h-3.5 w-3.5" /> Tambah Baris Baru
            </Button>

            <div className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-4 sm:w-80">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Item</span>
                  <span className="font-mono font-semibold text-slate-800">{formatIDR(totals.subtotal)}</span>
                </div>

                {totals.disc > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Diskon</span>
                    <span className="font-mono font-semibold">-{formatIDR(totals.disc)}</span>
                  </div>
                )}

                {Number(taxRate) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>PPN ({taxRate}%)</span>
                    <span className="font-mono font-semibold text-slate-800">{formatIDR(totals.tax)}</span>
                  </div>
                )}

                <div className="mt-2 flex justify-between rounded-md bg-slate-900 p-2.5 text-sm font-bold text-white shadow-xs">
                  <span>Total Akhir</span>
                  <span className="font-mono">{formatIDR(totals.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. KETENTUAN, PEMBAYARAN, & CATATAN */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3 pt-4">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-amber-100 p-1.5 text-amber-600">
              <FileCheck className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">Ketentuan & Catatan Dokumen</CardTitle>
              <CardDescription className="text-xs">
                Ketentuan pembayaran, syarat & ketentuan umum, serta catatan tambahan
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 p-5 sm:grid-cols-2">
          {/* Ketentuan Pembayaran */}
          {(isInvoice || isQuotation || isKontrak || isPenawaran) && (
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="text-xs font-semibold text-slate-800">Ketentuan Pembayaran</Label>
                <ListHelperButtons
                  value={extra.payment_terms || ""}
                  onChange={(val) => setExtra((ex) => ({ ...ex, payment_terms: val }))}
                />
              </div>
              <Textarea
                value={extra.payment_terms || ""}
                onChange={setExtraField("payment_terms")}
                rows={3}
                placeholder="Contoh: 1. DP 50% saat PO diterima. 2. Pelunasan 50% setelah serah terima pekerjaan."
                className="text-sm font-sans leading-relaxed"
              />
            </div>
          )}

          {/* Pilihan Rekening Bank Transfer */}
          {(isInvoice || isQuotation) && (
            <div className="space-y-2.5 sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-blue-600" />
                  <div>
                    <Label className="text-xs font-bold text-slate-800">Pilihan Rekening Bank Transfer</Label>
                    <p className="text-[11px] text-slate-500">
                      Pilih rekening mana saja yang ingin ditampilkan di dokumen ini
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setExtra((ex) => ({ ...ex, selected_banks: [] }))}
                  className="text-xs h-7 px-2.5 text-slate-600 hover:text-slate-900"
                >
                  Tampilkan Semua Bank
                </Button>
              </div>
              {companyBankAccounts.length > 0 ? (
                <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
                  {companyBankAccounts.map((acc, idx) => {
                    const key = `${acc.bank_name}|${acc.bank_account_number}`;
                    const isChecked =
                      !extra.selected_banks ||
                      extra.selected_banks.length === 0 ||
                      extra.selected_banks.includes(key) ||
                      extra.selected_banks.includes(acc.bank_name) ||
                      extra.selected_banks.includes(acc.bank_account_number);

                    const toggleBank = () => {
                      setExtra((ex) => {
                        const current =
                          ex.selected_banks && ex.selected_banks.length > 0
                            ? [...ex.selected_banks]
                            : companyBankAccounts.map((a) => `${a.bank_name}|${a.bank_account_number}`);

                        const exists = current.includes(key);
                        const updated = exists
                          ? current.filter((k) => k !== key && k !== acc.bank_name && k !== acc.bank_account_number)
                          : [...current, key];
                        return { ...ex, selected_banks: updated };
                      });
                    };

                    return (
                      <div
                        key={idx}
                        onClick={toggleBank}
                        className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer select-none transition-all ${
                          isChecked
                            ? "border-blue-500 bg-white text-slate-900 shadow-2xs ring-1 ring-blue-500/20"
                            : "border-slate-200 bg-slate-100/60 text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                        />
                        <div className="min-w-0 flex-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{acc.bank_name}</span>
                            <span className="font-mono text-[11px] font-semibold text-slate-700">
                              {acc.bank_account_number}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">a.n. {acc.bank_account_holder}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50/90 p-3 rounded-md border border-amber-200/80">
                  Belum ada rekening bank yang tersimpan. Silakan atur rekening Anda di{" "}
                  <Link href="/settings" className="underline font-bold text-amber-900" target="_blank">
                    Pengaturan Perusahaan &gt; Bank
                  </Link>
                  .
                </p>
              )}
            </div>
          )}

          {/* Syarat & Ketentuan Umum */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-xs font-semibold text-slate-800">Syarat & Ketentuan Umum</Label>
              <ListHelperButtons value={terms} onChange={setTerms} />
            </div>
            <Textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={3}
              placeholder="Contoh: Mohon konfirmasi pembayaran setelah transfer dilakukan."
              className="text-sm font-sans leading-relaxed"
            />
          </div>

          {/* Catatan Tambahan */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-xs font-semibold text-slate-800">Catatan Tambahan</Label>
              <ListHelperButtons value={notes} onChange={setNotes} />
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Contoh: • KTP Pengelola (wajib)&#10;• NIB (wajib)"
              className="text-sm font-sans leading-relaxed"
            />
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Bar khusus Mobile */}
      <div className="no-print fixed inset-x-0 bottom-16 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => (isEdit && doc?.id ? router.push(`/documents/${doc.id}`) : router.push("/documents"))}
            title="Kembali"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as DocStatus)}
            className="w-28"
            options={(Object.keys(DOC_STATUS) as DocStatus[]).map((s) => ({
              value: s,
              label: DOC_STATUS[s].label,
            }))}
          />
          <Button type="submit" className="flex-1 gap-1.5">
            <Save className="h-4 w-4" /> {isEdit ? "Simpan" : "Buat Dokumen"}
          </Button>
        </div>
      </div>
    </form>
  );
}
