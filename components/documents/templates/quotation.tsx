import type { TemplateData } from "./shared";
import { fmtDate, fmtDateAfterDays } from "./shared";
import {
  DocHeader,
  ClientBlock,
  ItemsTable,
  TotalsBlock,
  SignatureBlock,
  TermsBlock,
  NotesBlock,
  ScopeTable,
  BankBlock,
} from "./blocks";

export function QuotationTemplate({ data }: { data: TemplateData }) {
  const { company, doc, client } = data;
  const extra = doc.extra;
  const validityDays = Number(extra.validity_days) || 14;

  return (
    <div className="space-y-5">
      <DocHeader data={data} />

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <ClientBlock data={data} />
        <div className="shrink-0 text-sm">
          <p>
            <span className="text-slate-500">Kepada:</span> <span className="font-semibold">{client?.name || "-"}</span>
          </p>
          <p>
            <span className="text-slate-500">Tanggal:</span> {fmtDate(doc.issue_date)}
          </p>
          {extra.po_number && (
            <p>
              <span className="text-slate-500">No. PO:</span> {extra.po_number}
            </p>
          )}
        </div>
      </div>

      {extra.intro && <p className="text-sm leading-relaxed">{extra.intro}</p>}
      {extra.scope_of_work && <ScopeTable scopeOfWork={extra.scope_of_work} />}

      <div className="space-y-4">
        <ItemsTable data={data} />
        <TotalsBlock data={data} />
      </div>

      <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-700">
        <p>
          <span className="font-semibold text-slate-600">Masa berlaku penawaran:</span> {validityDays} hari, berakhir{" "}
          {fmtDateAfterDays(doc.issue_date, validityDays)}.
        </p>
      </div>

      {extra.payment_terms && <TermsBlock terms={extra.payment_terms} />}
      {doc.notes && <NotesBlock notes={doc.notes} />}

      <BankBlock company={company} selectedBanks={extra.selected_banks} />

      <SignatureBlock data={data} date={doc.issue_date} />
    </div>
  );
}
