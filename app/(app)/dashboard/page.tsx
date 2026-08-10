import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  ChevronRight,
  FileCheck2,
  FileSignature,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  PlusCircle,
  Receipt,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import {
  getCompany,
  groupDocumentItemAmounts,
  listClients,
  listDocumentItemAmounts,
  listDocuments,
} from "@/lib/data";
import { DOC_TYPES, DOC_STATUS } from "@/lib/types";
import type { DocRecord, DocType } from "@/lib/types";
import { formatIDR, formatDate, formatDateShort, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function computeTotals(doc: DocRecord, items: { qty: number; unit_price: number }[]) {
  const subtotal = items.reduce((sum, i) => sum + Number(i.qty) * Number(i.unit_price), 0);
  const discount = Number(doc.discount) || 0;
  const taxable = Math.max(subtotal - discount, 0);
  const tax = (taxable * (Number(doc.tax_rate) || 0)) / 100;
  return { subtotal, tax, total: taxable + tax };
}

const TYPE_CONFIG: Record<
  DocType,
  {
    icon: typeof Receipt;
    color: string;
    bgLight: string;
    barColor: string;
    textColor: string;
  }
> = {
  penawaran: {
    icon: FileText,
    color: "text-blue-600",
    bgLight: "bg-blue-50/80 border-blue-100",
    barColor: "bg-blue-600",
    textColor: "text-blue-700",
  },
  quotation: {
    icon: FileSpreadsheet,
    color: "text-violet-600",
    bgLight: "bg-violet-50/80 border-violet-100",
    barColor: "bg-violet-600",
    textColor: "text-violet-700",
  },
  invoice: {
    icon: Receipt,
    color: "text-amber-600",
    bgLight: "bg-amber-50/80 border-amber-100",
    barColor: "bg-amber-500",
    textColor: "text-amber-700",
  },
  bast: {
    icon: FileCheck2,
    color: "text-emerald-600",
    bgLight: "bg-emerald-50/80 border-emerald-100",
    barColor: "bg-emerald-600",
    textColor: "text-emerald-700",
  },
  kontrak: {
    icon: FileSignature,
    color: "text-rose-600",
    bgLight: "bg-rose-50/80 border-rose-100",
    barColor: "bg-rose-600",
    textColor: "text-rose-700",
  },
};

export default async function DashboardPage() {
  const companyData = await getCompany();
  const company = companyData!.company;

  const [allDocs, clients] = await Promise.all([listDocuments(company.id), listClients(company.id)]);

  const unpaidInvoices = allDocs.filter((d) => d.type === "invoice" && !["paid", "cancelled"].includes(d.status));
  const recent = allDocs.slice(0, 6);
  const itemRows = await listDocumentItemAmounts([...unpaidInvoices, ...recent].map((doc) => doc.id));
  const itemsByDoc = groupDocumentItemAmounts(itemRows);
  const outstanding = unpaidInvoices.reduce(
    (sum, doc) => sum + computeTotals(doc, itemsByDoc.get(doc.id) || []).total,
    0
  );

  const clientMap = new Map(clients.map((c) => [c.id, c.name]));
  const monthKey = new Date().toISOString().slice(0, 7);

  const stats = [
    {
      label: "Total Dokumen",
      value: String(allDocs.length),
      subtext: "Semua jenis dokumen",
      icon: FileText,
      tone: "bg-blue-50 text-blue-600 border border-blue-100",
    },
    {
      label: "Tagihan Berjalan",
      value: formatIDR(outstanding),
      subtext: `${unpaidInvoices.length} invoice belum lunas`,
      icon: Wallet,
      tone: "bg-amber-50 text-amber-600 border border-amber-100",
    },
    {
      label: "Total Klien",
      value: String(clients.length),
      subtext: "Klien terdaftar",
      icon: Users,
      tone: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    },
    {
      label: "Dokumen Bulan Ini",
      value: String(allDocs.filter((d) => d.issue_date.slice(0, 7) === monthKey).length),
      subtext: "Periode " + formatDateShort(monthKey + "-01"),
      icon: TrendingUp,
      tone: "bg-violet-50 text-violet-600 border border-violet-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ===== Header & Welcome Hero ===== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(new Date().toISOString(), true)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Selamat datang, {company.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola dokumen bisnis, pantau status tagihan, dan hubungi klien Anda dalam satu tempat.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/25 shrink-0 active:scale-[0.98] transition-all"
        >
          <Link href="/documents/new">
            <PlusCircle className="h-5 w-5 mr-1.5" />
            Buat Dokumen Baru
          </Link>
        </Button>
      </div>

      {/* ===== KPI Statistik Grid ===== */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="border-slate-200/80 bg-white shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-2xl overflow-hidden"
          >
            <CardContent className="flex items-start gap-3.5 p-4 sm:p-5">
              <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", s.tone)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500 truncate">{s.label}</p>
                <p className="truncate text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight my-0.5">
                  {s.value}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{s.subtext}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ===== Dokumen Terbaru (2 kolom) ===== */}
        <Card className="lg:col-span-2 border-slate-200/80 shadow-xs rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-5 px-5 sm:px-6 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Dokumen Terbaru</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Aktivitas dokumen bisnis terkini Anda</p>
            </div>
            <Link
              href="/documents"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Lihat semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent
            className={cn("flex flex-1 flex-col p-0", recent.length === 0 ? "justify-center" : "justify-start")}
          >
            {recent.length === 0 ? (
              <div className="py-12 px-6 text-center flex flex-col items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3 border border-blue-100 shadow-2xs">
                  <FolderOpen className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Belum Ada Dokumen</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4">
                  Mulai buat faktur, penawaran, atau SPK pertama Anda untuk perusahaan.
                </p>
                <Button asChild size="sm" className="rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700">
                  <Link href="/documents/new">+ Buat Dokumen Pertama</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recent.map((doc) => {
                  const config = TYPE_CONFIG[doc.type];
                  const Icon = config.icon;
                  const items = itemsByDoc.get(doc.id) || [];
                  const total = computeTotals(doc, items).total;
                  const statusMeta = DOC_STATUS[doc.status];
                  return (
                    <li key={doc.id}>
                      <Link
                        href={`/documents/${doc.id}`}
                        className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/80 sm:px-6"
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                            config.bgLight
                          )}
                        >
                          <Icon className={cn("h-5 w-5", config.color)} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-bold text-slate-900">{DOC_TYPES[doc.type].label}</p>
                            <span className="hidden font-mono text-xs text-slate-400 sm:inline">{doc.number}</span>
                          </div>
                          <p className="truncate text-xs text-slate-500 mt-0.5">
                            {clientMap.get(doc.client_id || "") || "Tanpa klien"} · {formatDateShort(doc.issue_date)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2.5">
                          <span className="text-sm font-extrabold text-slate-900">{formatIDR(total)}</span>
                          <Badge
                            variant={statusMeta.tone as "success" | "info" | "secondary" | "destructive"}
                            className="hidden sm:inline-flex rounded-lg px-2.5 py-0.5 text-[11px] font-semibold"
                          >
                            {statusMeta.label}
                          </Badge>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 sm:hidden" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ===== Dokumen per Jenis (1 kolom) ===== */}
        <Card className="border-slate-200/80 shadow-xs rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="pb-3 pt-5 px-5 sm:px-6 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900">Dokumen per Jenis</CardTitle>
            <p className="text-xs text-slate-500">Persentase & jumlah per kategori</p>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-center">
            {(Object.keys(DOC_TYPES) as DocType[]).map((type) => {
              const config = TYPE_CONFIG[type];
              const Icon = config.icon;
              const count = allDocs.filter((d) => d.type === type).length;
              const pct = allDocs.length ? Math.round((count / allDocs.length) * 100) : 0;
              return (
                <Link
                  key={type}
                  href={`/documents?type=${type}`}
                  className="block group rounded-xl p-2.5 -mx-2.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn("flex h-7 w-7 items-center justify-center rounded-lg border", config.bgLight)}
                      >
                        <Icon className={cn("h-3.5 w-3.5", config.color)} />
                      </span>
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                        {DOC_TYPES[type].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-slate-900">{count}</span>
                      <span className="text-slate-400">({pct}%)</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", config.barColor)}
                      style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ===== Pintasan Cepat (Quick Shortcuts) ===== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link
          href="/documents/new?type=invoice"
          className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-amber-200 hover:bg-amber-50/40 transition-all shadow-2xs group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-105 transition-transform">
            <Receipt className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-700">Buat Invoice</p>
            <p className="text-[11px] text-slate-400 truncate">Faktur penagihan</p>
          </div>
        </Link>

        <Link
          href="/documents/new?type=penawaran"
          className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-200 hover:bg-blue-50/40 transition-all shadow-2xs group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105 transition-transform">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-700">Surat Penawaran</p>
            <p className="text-[11px] text-slate-400 truncate">Penawaran harga</p>
          </div>
        </Link>

        <Link
          href="/clients"
          className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-emerald-200 hover:bg-emerald-50/40 transition-all shadow-2xs group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-105 transition-transform">
            <UserPlus className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">Kelola Klien</p>
            <p className="text-[11px] text-slate-400 truncate">Daftar & kontak</p>
          </div>
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-violet-200 hover:bg-violet-50/40 transition-all shadow-2xs group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 border border-violet-100 group-hover:scale-105 transition-transform">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-violet-700">Profil Perusahaan</p>
            <p className="text-[11px] text-slate-400 truncate">Logo & info bank</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
