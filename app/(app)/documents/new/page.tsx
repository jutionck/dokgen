import { Suspense } from "react";
import { NewDocumentWizard } from "@/components/documents/new-document-wizard";
import { getCompany, listClients } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewDocumentPage() {
  const companyData = await getCompany();
  const company = companyData!.company;
  const clients = await listClients(company.id);

  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-slate-100" />}>
      <NewDocumentWizard clients={clients} company={company} />
    </Suspense>
  );
}
