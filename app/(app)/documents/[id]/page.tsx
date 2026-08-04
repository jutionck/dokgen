import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { clients, documents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCompany, listDocumentItems, listEmailLogs } from "@/lib/data";
import { DOC_TYPES, DOC_STATUS } from "@/lib/types";
import type { DocRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TemplateSwitch, DocPage } from "@/components/documents/templates";
import { computeTotals, type TemplateData } from "@/components/documents/templates/shared";
import { DocumentDetailActions } from "@/components/documents/document-detail-actions";
import { formatDateTime } from "@/lib/utils";
import { Mail, ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function DocumentDetailPage(props: PageProps<"/documents/[id]">) {
  const { id } = await props.params;
  const companyData = await getCompany();
  const company = companyData!.company;

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.company_id, company.id)))
    .limit(1);
  if (!doc) notFound();

  const [items, emailLogs, clientRows] = await Promise.all([
    listDocumentItems(id),
    listEmailLogs(id),
    doc.client_id
      ? db.select().from(clients).where(eq(clients.id, doc.client_id)).limit(1)
      : Promise.resolve([]),
  ]);

  const client = clientRows[0] ?? null;
  const relItems = items.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const templateData: TemplateData = {
    company,
    client,
    doc: doc as unknown as DocRecord,
    items: relItems,
    totals: computeTotals(doc as unknown as DocRecord, relItems),
  };

  const terminIndex =
    doc.type === "invoice" && doc.client_id
      ? (await db
          .select({ id: documents.id })
          .from(documents)
          .where(
            and(
              eq(documents.company_id, company.id),
              eq(documents.type, "invoice"),
              eq(documents.client_id, doc.client_id)
            )
          )).length + 1
      : 1;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Link href="/documents">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 sm:w-auto sm:px-3 sm:py-1.5 sm:gap-1.5 text-xs font-semibold">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kembali</span>
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-bold">{DOC_TYPES[doc.type].label}</h1>
              <Badge variant={DOC_STATUS[doc.status].tone as "success" | "info" | "secondary" | "destructive"}>
                {DOC_STATUS[doc.status].label}
              </Badge>
            </div>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground">{doc.number}</p>
          </div>
        </div>
        <DocumentDetailActions
          docId={doc.id}
          docType={doc.type}
          status={doc.status}
          clientEmail={client?.email}
          clientName={client?.company || client?.name}
          docNumber={doc.number}
          docTotal={templateData.totals.total}
          currency={doc.currency}
          terminIndex={terminIndex}
        />
      </div>

      <Card className="overflow-hidden p-4 sm:p-6">
        <DocPage>
          <TemplateSwitch data={templateData} />
        </DocPage>
      </Card>

      {emailLogs.length > 0 && (
        <Card className="p-0">
          <div className="border-b px-5 py-3 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Riwayat Pengiriman Email
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kepada</TableHead>
                <TableHead>Subjek</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.to_email}</TableCell>
                  <TableCell className="max-w-sm truncate">{log.subject || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={log.status === "sent" ? "success" : "destructive"}>
                      {log.status === "sent" ? "Terkirim" : "Gagal"}
                    </Badge>
                    {log.status === "failed" && <p className="mt-1 max-w-xs truncate text-xs text-red-500">{log.error}</p>}
                  </TableCell>
                  <TableCell>{log.sent_at ? formatDateTime(log.sent_at) : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}