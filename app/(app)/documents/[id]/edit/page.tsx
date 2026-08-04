import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentForm } from "@/components/documents/document-form";
import { db } from "@/lib/db";
import { documents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCompany, listClients, listDocumentItems } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function EditDocumentPage(props: PageProps<"/documents/[id]/edit">) {
  const { id } = await props.params;
  const companyData = await getCompany();
  const company = companyData!.company;

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.company_id, company.id)))
    .limit(1);
  if (!doc) notFound();

  const [items, clients] = await Promise.all([listDocumentItems(id), listClients(company.id)]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/documents/${doc.id}`}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Dokumen</h1>
          <p className="text-sm text-muted-foreground">
            {doc.number} — ubah data lalu simpan. Nomor dokumen otomatis tidak berubah.
          </p>
        </div>
      </div>
      <DocumentForm mode="edit" clients={clients} doc={doc} items={items} company={company} />
    </div>
  );
}
