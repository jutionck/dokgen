import type { TemplateData } from "./shared";
import { fmt, fmtDate, fmtNum, terbilang } from "./shared";
import { DocHeader, ClientBlock, ItemsTable, SignatureBlock, TermsBlock, NotesBlock, BankBlock } from "./blocks";

export function InvoiceTemplate({ data }: { data: TemplateData }) {
  const { company, doc, totals } = data;
  const extra = doc.extra;

  return (
    <div className="space-y-5">
      <DocHeader data={data} />

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <ClientBlock data={data} />
        <div className="shrink-0 text-sm">
          {extra.po_number && (
            <p>
              <span className="text-slate-500">No. PO / Referensi:</span> {extra.po_number}
            </p>
          )}
          <p>
            <span className="text-slate-500">Tanggal Invoice:</span> {fmtDate(doc.issue_date)}
          </p>
          {doc.due_date && (
            <p>
              <span className="text-slate-500">Jatuh Tempo:</span> {fmtDate(doc.due_date)}
            </p>
          )}
          <p className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
            {doc.status === "paid" ? "LUNAS" : doc.status === "cancelled" ? "DIBATALKAN" : "BELUM DIBAYAR"}
          </p>
        </div>
      </div>

      <ItemsTable data={data} />

      <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Subtotal</span>
          <span>{fmt(totals.subtotal, doc.currency)}</span>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">Diskon</span>
            <span>-{fmt(totals.discount, doc.currency)}</span>
          </div>
        )}
        {Number(doc.tax_rate) > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">PPN {fmtNum(Number(doc.tax_rate))}%</span>
            <span>{fmt(totals.tax, doc.currency)}</span>
          </div>
        )}
        <div className="mt-1 flex justify-between rounded bg-slate-800 px-2 py-1.5 font-bold text-white">
          <span>Total Tagihan</span>
          <span>{fmt(totals.total, doc.currency)}</span>
        </div>
        <p className="text-[11px] italic text-slate-500">Terbilang: {terbilang(totals.total)}</p>
      </div>

      <BankBlock company={company} selectedBanks={extra.selected_banks} />

      {extra.payment_terms && <TermsBlock terms={extra.payment_terms} />}
      {doc.notes && <NotesBlock notes={doc.notes} />}

      <SignatureBlock company={company} date={doc.issue_date} />
    </div>
  );
}