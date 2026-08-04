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
import {
  ChevronRight,
  FileCheck2,
  FileSignature,
  FileSpreadsheet,
  FileText,
  Plus,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import { getCompany, listClients, listDocumentItems, listDocumentsPage, PAGE_SIZE } from "@/lib/data";

function computeTotal(doc: DocRecord, items: { qty: number; unit_price: number }[]) {
  const subtotal = items.reduce((sum, i) => sum + Number(i.qty) * Number(i.unit_price), 0);
  const discount = Number(doc.discount) || 0;
  const taxable = Math.max(subtotal - discount, 0);
  return taxable + (taxable * (Number(doc.tax_rate) || 0)) / 100;
}

const TYPE_STYLE: Record<DocType, { icon: typeof Receipt; tone: string }> = {
  invoice: { icon: Receipt, tone: "bg-amber-50 text-amber-600" },
  penawaran: { icon: FileText, tone: "bg-blue-50 text-blue-600" },
  quotation: { icon: FileSpreadsheet, tone: "bg-violet-50 text-violet-600" },
  bast: { icon: FileCheck2, tone: "bg-emerald-50 text-emerald-600" },
  kontrak: { icon: FileSignature, tone: "bg-rose-50 text-rose-600" },
};

export default async function DocumentsPage({ searchParams }: PageProps<"/documents">) {
  const query = await searchParams;
  const typeFilter = (query.type as string) || "";
  const statusFilter = (query.status as string) || "";
  const search = (query.q as string) || "";
  const page = Math.max(1, Number(query.page) || 1);

  const companyData = await getCompany();
  const company = companyData!.company;

  const { rows: docs, total, totalPages } = await listDocumentsPage(
    company.id,
    page,
    { type: typeFilter || undefined, status: statusFilter || undefined, q: search || undefined }
  );

  const clientMap = new Map((await listClients(company.id)).map((c) => [c.id, c.name]));

  const itemsByDoc = new Map<string, { qty: number; unit_price: number }[]>();
  for (const doc of docs) {
    itemsByDoc.set(doc.id, await listDocumentItems(doc.id));
  }

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("q", search);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/documents?${qs}` : "/documents";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dokumen</h1>
          <p className="text-sm text-muted-foreground">History semua dokumen: penawaran, quotation, invoice, BAST, dan kontrak.</p>
        </div>
        <Button asChild>
          <Link href="/documents/new">
            <Plus /> Buat Dokumen
          </Link>
        </Button>
      </div>

      <DocumentFilters />

      <Card className="overflow-hidden">
        {docs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <FileText className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium">Belum ada dokumen</p>
            <p className="text-sm text-muted-foreground">Buat dokumen pertama, atau ubah filter pencarian.</p>
          </div>
        ) : (
          <>
            {/* ===== Tabel: tablet & desktop (tidak berubah) ===== */}
            <CardContent className="hidden p-0 sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dokumen</TableHead>
                    <TableHead>Klien</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Nilai</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docs.map((doc) => {
                    const statusMeta = DOC_STATUS[doc.status];
                    const totalDoc = computeTotal(doc, itemsByDoc.get(doc.id) || []);
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <Link href={`/documents/${doc.id}`} className="hover:underline">
                            <p className="font-medium">{DOC_TYPES[doc.type].label}</p>
                            <p className="font-mono text-xs text-muted-foreground">{doc.number}</p>
                          </Link>
                        </TableCell>
                        <TableCell>{clientMap.get(doc.client_id || "") || "-"}</TableCell>
                        <TableCell>{formatDateShort(doc.issue_date)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatIDR(totalDoc)}</TableCell>
                        <TableCell>
                          <Badge variant={statusMeta.tone as "success" | "info" | "secondary" | "destructive"}>
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

            {/* ===== List: mobile (native-style) ===== */}
            <CardContent className="p-0 sm:hidden">
              <ul className="divide-y">
                {docs.map((doc) => {
                  const style = TYPE_STYLE[doc.type];
                  const Icon = style.icon;
                  const statusMeta = DOC_STATUS[doc.status];
                  const totalDoc = computeTotal(doc, itemsByDoc.get(doc.id) || []);
                  return (
                    <li key={doc.id}>
                      <Link
                        href={`/documents/${doc.id}`}
                        className="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-slate-50"
                      >
                        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", style.tone)}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{DOC_TYPES[doc.type].label}</p>
                          <p className="truncate font-mono text-[11px] text-muted-foreground">
                            {doc.number}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="truncate">{clientMap.get(doc.client_id || "") || "Tanpa klien"}</span>
                            <span className="shrink-0 text-slate-300">·</span>
                            <span className="shrink-0">{formatDateShort(doc.issue_date)}</span>
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold">{formatIDR(totalDoc)}</p>
                          <Badge variant={statusMeta.tone as "success" | "info" | "secondary" | "destructive"} className="mt-1 px-2 py-0 text-[10px]">
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