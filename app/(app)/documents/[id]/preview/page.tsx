import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { documents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCompany } from "@/lib/data";
import { PdfPreview } from "@/components/documents/pdf-preview";

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

  return <PdfPreview docId={id} docNumber={doc.number} />;
}
