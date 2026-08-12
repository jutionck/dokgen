import type { TemplateData } from "./shared";
import { fmt, fmtDate, fmtNum, terbilang } from "./shared";
import { DocHeader, ItemsTable, SignatureMedia } from "./blocks";
import { resolveStampDuty } from "@/lib/documents/stamp-duty";

function Pasal({ no, title, children }: { no: string; title: string; children: React.ReactNode }) {
  return (
    <div className="text-sm">
      <h3 className="font-bold uppercase">
        {no}. {title}
      </h3>
      <div className="mt-1 leading-relaxed">{children}</div>
    </div>
  );
}

export function KontrakTemplate({ data }: { data: TemplateData }) {
  const { company, doc, client, totals } = data;
  const extra = doc.extra;
  const city = extra.location || company.city || "-";
  const stampDuty = resolveStampDuty({
    type: doc.type,
    status: doc.status,
    currency: doc.currency,
    total: totals.total,
    mode: extra.stamp_duty_mode,
  });

  return (
    <div className="space-y-5">
      <DocHeader data={data} />

      <p className="text-center text-sm font-semibold italic">Nomor: {doc.number}</p>
      <p className="text-center text-sm">
        Pada hari ini, {fmtDate(doc.issue_date)}, bertempat di {city}, yang bertanda tangan di bawah ini:
      </p>

      <div className="space-y-2 text-sm">
        <div>
          <p>
            <span className="font-bold">Nama</span> : {company.signer_name || company.name}
          </p>
          <p>
            <span className="font-bold">Jabatan</span> : {company.signer_position || "Direktur"}
          </p>
          <p>
            <span className="font-bold">Perusahaan</span> : {company.name}, berkedudukan di {company.city}
          </p>
          <p>
            <span className="font-bold">Alamat</span> : {company.address}
          </p>
          <p>
            <span className="font-bold">Telepon/Email</span> : {company.phone || "-"} / {company.email || "-"}
          </p>
          <p className="mt-1">
            Selanjutnya disebut <span className="font-bold">PIHAK PERTAMA</span>.
          </p>
        </div>
        <div>
          <p>
            <span className="font-bold">Nama</span> : {client?.name || "-"}
          </p>
          <p>
            <span className="font-bold">Jabatan</span> : {client?.pic || "-"}
          </p>
          <p>
            <span className="font-bold">Perusahaan</span> : {client?.company || "-"}
          </p>
          <p>
            <span className="font-bold">Alamat</span> : {client?.address || "-"}
          </p>
          <p>
            <span className="font-bold">Telepon/Email</span> : {client?.phone || "-"} / {client?.email || "-"}
          </p>
          <p className="mt-1">
            Selanjutnya disebut <span className="font-bold">PIHAK KEDUA</span>.
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed">
        PIHAK PERTAMA dan PIHAK KEDUA secara bersama-sama disebut <span className="font-bold">PARA PIHAK</span>,
        terlebih dahulu menerangkan bahwa kedua belah pihak sepakat untuk mengikatkan diri dalam Perjanjian Kerja dengan
        ketentuan sebagai berikut:
      </p>

      <div className="space-y-4">
        <Pasal no="Pasal 1" title="Ruang Lingkup Pekerjaan">
          <p>
            {extra.project_title && (
              <>
                PIHAK PERTAMA menerima penunjukan dari PIHAK KEDUA untuk melaksanakan pekerjaan
                <span className="font-semibold"> {extra.project_title}</span>
                {extra.scope_of_work ? "," : "."}
              </>
            )}
          </p>
          {extra.scope_of_work && <p className="mt-1 whitespace-pre-line">{extra.scope_of_work}</p>}
          {extra.work_description && <p className="mt-1 whitespace-pre-line">{extra.work_description}</p>}
        </Pasal>

        <Pasal no="Pasal 2" title="Jangka Waktu Pelaksanaan">
          <p>
            Pekerjaan dilaksanakan mulai <span className="font-semibold">{fmtDate(extra.start_date)}</span> sampai
            dengan <span className="font-semibold">{fmtDate(extra.end_date)}</span>
            {extra.duration_text ? ` (${extra.duration_text})` : ""}, atau sesuai kesepakatan bersama yang dituangkan
            dalam addendum.
          </p>
        </Pasal>

        <Pasal no="Pasal 3" title="Nilai Pekerjaan">
          <p>Rincian nilai pekerjaan adalah sebagai berikut:</p>
          <div className="mt-2">
            <ItemsTable data={data} />
          </div>
          <div className="mt-2 ml-auto w-full max-w-xs space-y-1">
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
            <div className="flex justify-between rounded bg-slate-800 px-2 py-1.5 font-bold text-white">
              <span>Total Nilai Kontrak</span>
              <span>{fmt(totals.total, doc.currency)}</span>
            </div>
          </div>
          <p className="mt-1 text-[11px] italic text-slate-500">Terbilang: {terbilang(totals.total)}</p>
        </Pasal>

        <Pasal no="Pasal 4" title="Cara Pembayaran">
          <p className="whitespace-pre-line">
            {extra.payment_terms ||
              "Pembayaran dilakukan secara bertahap sesuai kesepakatan PARA PIHAK, melalui transfer bank ke rekening PIHAK PERTAMA."}
          </p>
          {company.bank_name && (
            <p className="mt-1">
              Rekening: {company.bank_name} a.n. {company.bank_account_holder} (No. {company.bank_account_number})
            </p>
          )}
        </Pasal>

        {extra.clauses && (
          <Pasal no="Pasal 5" title="Ketentuan Lain">
            <p className="whitespace-pre-line">{extra.clauses}</p>
          </Pasal>
        )}

        <Pasal no="Pasal 6" title="Penutup">
          <p className="whitespace-pre-line">
            Hal-hal yang belum diatur dalam perjanjian ini akan diatur kemudian atas kesepakatan PARA PIHAK. Perjanjian
            ini dibuat dan ditandatangani dalam rangkap dua (2) dengan kekuatan hukum yang sama.
          </p>
        </Pasal>
      </div>

      <div className="grid grid-cols-2 gap-8 pt-4 text-sm">
        <div className="text-center">
          <p>PIHAK PERTAMA,</p>
          <p className="mt-2 text-xs text-slate-500">
            {company.city || "-"}, {fmtDate(doc.issue_date)}
          </p>
          <div className={company.signature_url || stampDuty.required ? "mt-2" : "mt-16"}>
            <SignatureMedia company={company} showStampDuty={stampDuty.required} />
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
