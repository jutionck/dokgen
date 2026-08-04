import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  FileCheck2,
  FileSignature,
  FileSpreadsheet,
  FileText,
  PlusCircle,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { getCompany, listClients, listDocuments, listDocumentItems } from "@/lib/data";
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

const TYPE_STYLE: Record<DocType, { icon: typeof Receipt; row: string }> = {
  invoice: { icon: Receipt, row: "bg-amber-50 text-amber-600" },
  penawaran: { icon: FileText, row: "bg-blue-50 text-blue-600" },
  quotation: { icon: FileSpreadsheet, row: "bg-violet-50 text-violet-600" },
  bast: { icon: FileCheck2, row: "bg-emerald-50 text-emerald-600" },
  kontrak: { icon: FileSignature, row: "bg-rose-50 text-rose-600" },
};

export default async function DashboardPage() {
  const companyData = await getCompany();
  const company = companyData!.company;

  const [allDocs, clients] = await Promise.all([listDocuments(company.id), listClients(company.id)]);

  let outstanding = 0;
  const unpaidInvoices = allDocs.filter((d) => d.type === "invoice" && !["paid", "cancelled"].includes(d.status));
  for (const doc of unpaidInvoices) {
    const items = await listDocumentItems(doc.id);
    outstanding += computeTotals(doc, items).total;
  }

  const recent = allDocs.slice(0, 6);
  const itemsByDoc = new Map<string, { qty: number; unit_price: number }[]>();
  for (const doc of recent) {
    itemsByDoc.set(doc.id, await listDocumentItems(doc.id));
  }

  const clientMap = new Map(clients.map((c) => [c.id, c.name]));
  const monthKey = new Date().toISOString().slice(0, 7);

  const stats = [
    {
      label: "Total Dokumen",
      value: String(allDocs.length),
      icon: FileText,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Tagihan Berjalan",
      value: formatIDR(outstanding),
      icon: Wallet,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Klien",
      value: String(clients.length),
      icon: Users,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Dokumen Bulan Ini",
      value: String(allDocs.filter((d) => d.issue_date.slice(0, 7) === monthKey).length),
      icon: TrendingUp,
      tone: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ===== Header: versi mobile (native) — hanya HP ===== */}
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{formatDate(new Date().toISOString(), true)}</p>
          <h1 className="truncate text-xl font-bold tracking-tight">Halo, {company.name}</h1>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link href="/documents/new">+ Buat</Link>
        </Button>
      </div>

      {/* ===== Header: versi desktop & tablet (tidak berubah) ===== */}
      <div className="hidden flex-wrap items-center justify-between gap-3 sm:flex">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Selamat datang di {company.name} — semua dokumen bisnis dalam satu pintu.
          </p>
        </div>
        <Button asChild>
          <Link href="/documents/new">
            <PlusCircle />
            Buat Dokumen Baru
          </Link>
        </Button>
      </div>

      {/* ===== Statistik ===== */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-5">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", s.tone)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="truncate text-lg font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ===== Dokumen terbaru ===== */}
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Dokumen Terbaru</CardTitle>
          <Link href="/documents" className="flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
            Lihat semua <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
              <p className="sm:hidden">Belum ada dokumen. Ketuk tombol Buat untuk mulai.</p>
              <p className="hidden sm:block">Belum ada dokumen. Buat dokumen pertama Anda.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {recent.map((doc) => {
                const style = TYPE_STYLE[doc.type];
                const Icon = style.icon;
                const items = itemsByDoc.get(doc.id) || [];
                const total = computeTotals(doc, items).total;
                const statusMeta = DOC_STATUS[doc.status];
                return (
                  <li key={doc.id}>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 sm:px-6"
                    >
                      {/* Ikon jenis — hanya HP */}
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:hidden",
                          style.row
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {DOC_TYPES[doc.type].label}
                          <span className="ml-2 hidden font-mono text-xs text-muted-foreground sm:inline">
                            {doc.number}
                          </span>
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {clientMap.get(doc.client_id || "") || "Tanpa klien"} · {formatDateShort(doc.issue_date)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-sm font-semibold">{formatIDR(total)}</span>
                        {/* Badge status — hanya tablet & desktop */}
                        <Badge
                          variant={statusMeta.tone as "success" | "info" | "secondary" | "destructive"}
                          className="hidden sm:inline-flex"
                        >
                          {statusMeta.label}
                        </Badge>
                      </div>
                      {/* Chevron — hanya HP */}
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 sm:hidden" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ===== Dokumen per jenis ===== */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dokumen per Jenis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(Object.keys(DOC_TYPES) as DocType[]).map((type) => {
            const count = allDocs.filter((d) => d.type === type).length;
            const pct = allDocs.length ? Math.round((count / allDocs.length) * 100) : 0;
            return (
              <Link key={type} href={`/documents?type=${type}`} className="block">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{DOC_TYPES[type].label}</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
