import { notFound } from "next/navigation";
import Link from "next/link";
import { TemplateSwitch, DocPage } from "@/components/documents/templates";
import { computeTotals, type TemplateData } from "@/components/documents/templates/shared";
import { ArrowLeft } from "lucide-react";
import { PrintButton } from "@/components/ui/print-button";
import { db } from "@/lib/db";
import { clients, documents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCompany, listDocumentItems } from "@/lib/data";
import type { DocRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PreviewPage(props: PageProps<"/documents/[id]/preview">) {
  const { id } = await props.params;
  const companyData = await getCompany();
  const company = companyData!.company;

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.company_id, company.id)))
    .limit(1);
  if (!doc) notFound();

  const [items, clientRows] = await Promise.all([
    listDocumentItems(id),
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

  return (
    <main className="bg-slate-200">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-2.5 shadow-sm">
        <Link href={`/documents/${id}`} className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <p className="font-mono text-xs text-muted-foreground">{doc.number}</p>
        <PrintButton />
      </div>
      <div className="px-4 py-6">
        <DocPage>
          <TemplateSwitch data={templateData} />
        </DocPage>
      </div>
    </main>
  );
}