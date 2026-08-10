import type { DocType } from "@/lib/types";
import type { TemplateData } from "./shared";
import { PenawaranTemplate } from "./penawaran";
import { QuotationTemplate } from "./quotation";
import { InvoiceTemplate } from "./invoice";
import { BastTemplate } from "./bast";
import { KontrakTemplate } from "./kontrak";
import { DocFooter } from "./blocks";

export function DocPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="doc-page mx-auto min-h-0 sm:min-h-[1122px] w-full max-w-[794px] rounded-sm border border-slate-200 bg-white p-4 sm:p-8 shadow-sm">
      {children}
    </div>
  );
}

export function TemplateSwitch({ data }: { data: TemplateData }) {
  let template: React.ReactNode;

  switch (data.doc.type as DocType) {
    case "penawaran":
      template = <PenawaranTemplate data={data} />;
      break;
    case "quotation":
      template = <QuotationTemplate data={data} />;
      break;
    case "invoice":
      template = <InvoiceTemplate data={data} />;
      break;
    case "bast":
      template = <BastTemplate data={data} />;
      break;
    case "kontrak":
      template = <KontrakTemplate data={data} />;
      break;
    default:
      return null;
  }

  return (
    <>
      {template}
      <DocFooter data={data} />
    </>
  );
}
