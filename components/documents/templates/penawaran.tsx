import type { TemplateData } from "./shared";
import { fmtDateAfterDays } from "./shared";
import {
  DocHeader,
  ClientBlock,
  ItemsTable,
  TotalsBlock,
  SignatureBlock,
  TermsBlock,
  NotesBlock,
  ScopeTable,
} from "./blocks";

export function PenawaranTemplate({ data }: { data: TemplateData }) {
  const { company, doc, client } = data;
  const extra = doc.extra;
  const intro = extra.intro?.trim();
  const validityDays = Number(extra.validity_days) || 14;

  return (
    <div className="space-y-5">
      <DocHeader data={data} />

      <div className="text-sm">
        <p>Lampiran: -</p>
        <p className="mt-3 font-semibold">Hal: {extra.project_title || doc.title}</p>
      </div>

      <ClientBlock data={data} />

      <div className="space-y-3 text-sm leading-relaxed">
        <p>Dengan hormat,</p>
        {intro ? (
          <p className="whitespace-pre-line">{intro}</p>
        ) : (
          <p>
            Bersama ini kami sampaikan penawaran jasa {extra.project_title || "sesuai kebutuhan Anda"} kepada{" "}
            {client?.company || client?.name || "calon klien"}. Adapun rincian penawaran kami adalah sebagai berikut:
          </p>
        )}
      </div>

      {extra.scope_of_work && <ScopeTable scopeOfWork={extra.scope_of_work} />}

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide">Rincian Biaya Penawaran</h3>
        <ItemsTable data={data} />
        <TotalsBlock data={data} />
      </div>

      <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-700">
        <div className="flex justify-between">
          <span className="font-semibold text-slate-600">Masa Berlaku Penawaran</span>
          <span className="font-medium">
            {validityDays} hari (s.d. {fmtDateAfterDays(doc.issue_date, validityDays)})
          </span>
        </div>
      </div>

      {extra.payment_terms && <TermsBlock terms={extra.payment_terms} />}
      {doc.notes && <NotesBlock notes={doc.notes} />}

      <div className="space-y-2 text-sm leading-relaxed">
        <p>
          Demikian penawaran ini kami sampaikan. Apabila Bapak/Ibu berkenan, kami siap membahas lebih lanjut dan
          menunggu balasan positif dari pihak {client?.company || client?.name || "Bapak/Ibu"}.
        </p>
        <p className="font-medium">Terima kasih atas kepercayaan dan kerjasamanya.</p>
      </div>

      <SignatureBlock company={company} date={doc.issue_date} />
    </div>
  );
}
