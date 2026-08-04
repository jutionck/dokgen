import type { TemplateData } from "./shared";
import { fmtDate, fmtDateLong } from "./shared";
import { DocHeader, ItemsTable, TotalsBlock } from "./blocks";

export function BastTemplate({ data }: { data: TemplateData }) {
  const { company, doc, client } = data;
  const extra = doc.extra;

  return (
    <div className="space-y-5">
      <DocHeader data={data} />

      <p className="text-center text-sm font-semibold italic">Nomor: {doc.number}</p>

      <p className="text-sm leading-relaxed">
        Pada hari ini, {fmtDateLong(doc.issue_date)}, bertempat di {extra.location || company.city || "-"}, yang
        bertanda tangan di bawah ini:
      </p>

      <div className="space-y-2 text-sm">
        <div className="rounded border border-slate-200 p-3">
          <p className="font-bold">PIHAK PERTAMA (PENYEDIA JASA)</p>
          <p>Nama : {company.signer_name || company.name}</p>
          <p>Jabatan : {company.signer_position || "Direktur"}</p>
          <p>Perusahaan : {company.name}</p>
          <p>Alamat : {company.address}</p>
        </div>
        <div className="rounded border border-slate-200 p-3">
          <p className="font-bold">PIHAK KEDUA (PENERIMA)</p>
          <p>Nama : {client?.name || "-"}</p>
          <p>Jabatan : {client?.pic || "-"}</p>
          <p>Perusahaan : {client?.company || "-"}</p>
          <p>Alamat : {client?.address || "-"}</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed">Dengan ini menyatakan bahwa pekerjaan dengan rincian sebagai berikut:</p>

      {extra.work_description && (
        <div className="text-sm">
          <h3 className="mb-1 font-bold uppercase tracking-wide">Uraian Pekerjaan</h3>
          <p className="whitespace-pre-line leading-relaxed">{extra.work_description}</p>
        </div>
      )}

      <div className="space-y-4">
        <ItemsTable data={data} />
        <TotalsBlock data={data} />
      </div>

      {(extra.start_date || extra.end_date) && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-500">Tanggal Mulai</p>
            <p className="font-medium">{fmtDate(extra.start_date)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Tanggal Selesai</p>
            <p className="font-medium">{fmtDate(extra.end_date)}</p>
          </div>
        </div>
      )}

      {extra.contract_ref && (
        <p className="text-sm">
          <span className="text-slate-600">Referensi Kontrak / SPK:</span> {extra.contract_ref}
        </p>
      )}

      <p className="text-sm leading-relaxed">
        {extra.result_text ||
          `Bahwa seluruh pekerjaan tersebut telah diselesaikan dengan baik dan telah diterima
          oleh PIHAK KEDUA. Dengan diserahkannya pekerjaan tersebut, maka dianggap selesainya
          seluruh kewajiban PIHAK PERTAMA kepada PIHAK KEDUA.`}
      </p>

      <p className="text-sm">
        Demikian berita acara ini dibuat dalam rangkap dua (2) dengan kekuatan hukum yang sama untuk dipergunakan
        sebagaimana mestinya.
      </p>

      <div className="grid grid-cols-2 gap-8 text-sm">
        <div className="text-center">
          <p>PIHAK PERTAMA,</p>
          <p className="mt-2 text-xs text-slate-500">
            {company.city || "-"}, {fmtDate(doc.issue_date)}
          </p>
          <div className="mt-16">
            <p className="font-semibold underline">{company.signer_name || company.name}</p>
            <p className="text-xs text-slate-600">{company.signer_position}</p>
          </div>
        </div>
        <div className="text-center">
          <p>PIHAK KEDUA,</p>
          <p className="mt-2 text-xs text-slate-500">
            {company.city || "-"}, {fmtDate(doc.issue_date)}
          </p>
          <div className="mt-16">
            <p className="font-semibold underline">{client?.name || ".........................."}</p>
            <p className="text-xs text-slate-600">{client?.pic || ".........................."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
