import Link from "next/link";
import {
  Building2,
  ChevronRight,
  FileCheck2,
  FileSignature,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  PlusCircle,
  Receipt,
  RotateCcw,
} from "lucide-react";
import {
  getCompany,
  groupDocumentItemAmounts,
  listClients,
  listDocumentItemAmounts,
  listDocumentsPage,
  PAGE_SIZE,
} from "@/lib/data";
import { DOC_TYPES, DOC_STATUS } from "@/lib/types";
import type { DocRecord, DocType } from "@/lib/types";
import { formatIDR, formatDateShort, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DocumentActions } from "@/components/documents/document-actions";
import { DocumentFilters } from "@/components/documents/document-filters";
import { Pagination } from "@/components/ui/pagination";

function computeTotal(doc: DocRecord, items: { qty: number; unit_price: number }[]) {
  const subtotal = items.reduce((sum, i) => sum + Number(i.qty) * Number(i.unit_price), 0);
  const discount = Number(doc.discount) || 0;
  const taxable = Math.max(subtotal - discount, 0);
  return taxable + (taxable * (Number(doc.tax_rate) || 0)) / 100;
}

const TYPE_CONFIG: Record<
  DocType,
  {
    icon: typeof Receipt;
    color: string;
    bgLight: string;
  }
> = {
  penawaran: {
    icon: FileText,
    color: "text-blue-600",
    bgLight: "bg-blue-50/80 border-blue-100",
  },
  quotation: {
    icon: FileSpreadsheet,
    color: "text-violet-600",
    bgLight: "bg-violet-50/80 border-violet-100",
  },
  invoice: {
    icon: Receipt,
    color: "text-amber-600",
    bgLight: "bg-amber-50/80 border-amber-100",
  },
  bast: {
    icon: FileCheck2,
    color: "text-emerald-600",
    bgLight: "bg-emerald-50/80 border-emerald-100",
  },
  kontrak: {
    icon: FileSignature,
    color: "text-rose-600",
    bgLight: "bg-rose-50/80 border-rose-100",
  },
};

export default async function DocumentsPage({ searchParams }: PageProps<"/documents">) {
  const query = await searchParams;
  const typeFilter = (query.type as string) || "";
  const statusFilter = (query.status as string) || "";
  const search = (query.q as string) || "";
  const page = Math.max(1, Number(query.page) || 1);

  const companyData = await getCompany();
  const company = companyData!.company;

  const [{ rows: docs, total, totalPages }, allClients] = await Promise.all([
    listDocumentsPage(company.id, page, {
      type: typeFilter || undefined,
      status: statusFilter || undefined,
      q: search || undefined,
    }),
    listClients(company.id),
  ]);

  const clientMap = new Map(allClients.map((c) => [c.id, c.name]));

  const itemRows = await listDocumentItemAmounts(docs.map((doc) => doc.id));
  const itemsByDoc = groupDocumentItemAmounts(itemRows);

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("q", search);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/documents?${qs}` : "/documents";
  };

  const hasFilter = Boolean(typeFilter || statusFilter || search);

  const categoryTabs: { label: string; value: string }[] = [
    { label: "Semua Dokumen", value: "" },
    ...(Object.keys(DOC_TYPES) as DocType[]).map((t) => ({
      label: DOC_TYPES[t].label,
      value: t,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* ===== Header & Action ===== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Dokumen</h1>
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700"
            >
              {total} Total
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola dan cari semua dokumen bisnis Anda: penawaran, quotation, invoice, BAST, dan SPK.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/25 shrink-0 active:scale-[0.98] transition-all"
        >
          <Link href="/documents/new">
            <PlusCircle className="h-5 w-5 mr-1.5" /> Buat Dokumen
          </Link>
        </Button>
      </div>

      {/* ===== Category Tabs ===== */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categoryTabs.map((tab) => {
          const isActive = typeFilter === tab.value;
          const params = new URLSearchParams();
          if (tab.value) params.set("type", tab.value);
          if (statusFilter) params.set("status", statusFilter);
          if (search) params.set("q", search);
          const href = params.toString() ? `/documents?${params.toString()}` : "/documents";

          return (
            <Link
              key={tab.value || "all"}
              href={href}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0",
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* ===== Filter & Search Bar ===== */}
      <DocumentFilters />

      {/* ===== Main Table Card ===== */}
      <Card className="border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
        {docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3 border border-blue-100 shadow-2xs">
              <FolderOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {hasFilter ? "Dokumen Tidak Ditemukan" : "Belum Ada Dokumen"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-5">
              {hasFilter
                ? "Tidak ada dokumen yang sesuai dengan filter atau kata kunci pencarian Anda."
                : "Mulai buat dokumen bisnis pertama Anda untuk mengelola faktur & transaksi perusahaan."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {hasFilter && (
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <Link href="/documents">
                    <RotateCcw className="h-4 w-4 mr-1.5 text-slate-500" /> Reset Filter
                  </Link>
                </Button>
              )}
              <Button asChild size="sm" className="rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                <Link href="/documents/new">+ Buat Dokumen Baru</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* ===== Tabel Desktop & Tablet ===== */}
            <CardContent className="hidden p-0 sm:block">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="border-slate-200/80">
                    <TableHead className="font-semibold text-slate-700">Dokumen</TableHead>
                    <TableHead className="font-semibold text-slate-700">Klien</TableHead>
                    <TableHead className="font-semibold text-slate-700">Tanggal</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Nilai Total</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {docs.map((doc) => {
                    const config = TYPE_CONFIG[doc.type];
                    const Icon = config.icon;
                    const statusMeta = DOC_STATUS[doc.status];
                    const totalDoc = computeTotal(doc, itemsByDoc.get(doc.id) || []);
                    const clientName = clientMap.get(doc.client_id || "") || "-";

                    return (
                      <TableRow key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell>
                          <Link href={`/documents/${doc.id}`} className="flex items-center gap-3 group">
                            <span
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                                config.bgLight
                              )}
                            >
                              <Icon className={cn("h-4 w-4", config.color)} />
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                                {DOC_TYPES[doc.type].label}
                              </p>
                              <p className="font-mono text-xs text-slate-400">{doc.number}</p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-700">
                          {clientName !== "-" ? (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]">{clientName}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-medium">
                          {formatDateShort(doc.issue_date)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-extrabold text-slate-900">
                          {formatIDR(totalDoc)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusMeta.tone as "success" | "info" | "secondary" | "destructive"}
                            className="rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                          >
                            {statusMeta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DocumentActions docId={doc.id} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>

            {/* ===== List Mobile Touch-Friendly ===== */}
            <CardContent className="p-0 sm:hidden">
              <ul className="divide-y divide-slate-100">
                {docs.map((doc) => {
                  const config = TYPE_CONFIG[doc.type];
                  const Icon = config.icon;
                  const statusMeta = DOC_STATUS[doc.status];
                  const totalDoc = computeTotal(doc, itemsByDoc.get(doc.id) || []);
                  return (
                    <li key={doc.id}>
                      <Link
                        href={`/documents/${doc.id}`}
                        className="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-slate-50"
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
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-bold text-slate-900">{DOC_TYPES[doc.type].label}</p>
                          </div>
                          <p className="truncate font-mono text-[11px] text-slate-400">{doc.number}</p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="truncate">{clientMap.get(doc.client_id || "") || "Tanpa klien"}</span>
                            <span className="shrink-0 text-slate-300">·</span>
                            <span className="shrink-0">{formatDateShort(doc.issue_date)}</span>
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-extrabold text-slate-900">{formatIDR(totalDoc)}</p>
                          <Badge
                            variant={statusMeta.tone as "success" | "info" | "secondary" | "destructive"}
                            className="mt-1 px-2 py-0.5 text-[10px] font-semibold"
                          >
                            {statusMeta.label}
                          </Badge>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </>
        )}

        {docs.length > 0 && (
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} buildHref={buildHref} />
        )}
      </Card>
    </div>
  );
}
