import type { DocType } from "@/lib/types";
import type { TemplateData } from "./shared";
import { PenawaranTemplate } from "./penawaran";
import { QuotationTemplate } from "./quotation";
import { InvoiceTemplate } from "./invoice";
import { BastTemplate } from "./bast";
import { KontrakTemplate } from "./kontrak";

export function DocPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="doc-page mx-auto min-h-0 sm:min-h-[1122px] w-full max-w-[794px] rounded-sm border border-slate-200 bg-white p-4 sm:p-8 shadow-sm">
      {children}
    </div>
  );
}

export function TemplateSwitch({ data }: { data: TemplateData }) {
  switch (data.doc.type as DocType) {
    case "penawaran":
      return <PenawaranTemplate data={data} />;
    case "quotation":
      return <QuotationTemplate data={data} />;
    case "invoice":
      return <InvoiceTemplate data={data} />;
    case "bast":
      return <BastTemplate data={data} />;
    case "kontrak":
      return <KontrakTemplate data={data} />;
    default:
      return null;
  }
}
