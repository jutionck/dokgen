import type { TemplateData } from "./shared";
import { fmt, fmtDate, fmtNum, terbilang } from "./shared";

function logo(company: TemplateData["company"]) {
  if (!company.logo_url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={company.logo_url} alt="logo" className="mb-2 h-16 w-auto max-w-[200px] object-contain" />
  );
}

/**
 * Kop dokumen: logo + identitas perusahaan di kiri, judul + nomor di kanan.
 */
export function DocHeader({ data }: { data: TemplateData }) {
  const { company, doc } = data;
  return (
    <header className="flex flex-col gap-4 border-b-2 border-slate-800 pb-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        {logo(company)}
        <h1 className="text-xl font-bold leading-tight">{company.name}</h1>
        {company.tagline && <p className="text-xs italic text-slate-500">{company.tagline}</p>}
        <div className="mt-1.5 space-y-0.5 text-xs text-slate-600">
          {company.address && <p>{company.address}</p>}
          <p>{[company.phone, company.email, company.website].filter(Boolean).join("  ·  ")}</p>
          {company.npwp && <p className="text-slate-500">NPWP: {company.npwp}</p>}
        </div>
      </div>
      <div className="shrink-0 text-left md:text-right">
        <p className="font-serif text-2xl font-bold uppercase tracking-tight text-slate-800">{doc.title}</p>
        {doc.number && <p className="mt-1 font-mono text-sm font-semibold text-slate-700">No. {doc.number}</p>}
      </div>
    </header>
  );
}

/** Blok identitas pihak penerima (klien). */
export function ClientBlock({ data }: { data: TemplateData }) {
  const { client } = data;
  if (!client) return null;
  return (
    <div className="text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kepada Yth.</p>
      <p className="font-semibold">{client.company || client.name}</p>
      {client.name && client.company && <p>U.p. {client.name}</p>}
      {client.address && <p>{client.address}</p>}
      {client.email && <p>{client.email}</p>}
      {client.npwp && <p>NPWP: {client.npwp}</p>}
    </div>
  );
}

/** Tabel item umum (deskripsi, qty, satuan, harga, jumlah). */
export function ItemsTable({ data, showQty = true }: { data: TemplateData; showQty?: boolean }) {
  const { items, doc } = data;
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[500px] sm:min-w-0 border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="bg-slate-800 text-left text-white">
            <th className="border border-slate-300 px-1.5 sm:px-2.5 py-1.5 font-medium text-center w-8">No</th>
            <th className="border border-slate-300 px-1.5 sm:px-2.5 py-1.5 font-medium">Uraian / Deskripsi</th>
            {showQty && (
              <>
                <th className="border border-slate-300 px-1.5 sm:px-2.5 py-1.5 text-center font-medium w-12">Qty</th>
                <th className="border border-slate-300 px-1.5 sm:px-2.5 py-1.5 text-center font-medium w-14">Satuan</th>
              </>
            )}
            <th className="border border-slate-300 px-1.5 sm:px-2.5 py-1.5 text-right font-medium whitespace-nowrap">
              Harga Satuan
            </th>
            <th className="border border-slate-300 px-1.5 sm:px-2.5 py-1.5 text-right font-medium whitespace-nowrap">
              Jumlah
            </th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={showQty ? 6 : 3} className="border border-slate-300 px-2 py-2 text-center text-slate-400">
                (tidak ada rincian)
              </td>
            </tr>
          )}
          {items.map((item, i) => (
            <tr key={i} className="hover:bg-slate-50/50">
              <td className="border border-slate-300 px-1.5 sm:px-2.5 py-1.5 text-center">{i + 1}</td>
              <td className="border border-slate-300 px-1.5 sm:px-2.5 py-1.5 break-words">{item.description}</td>
              {showQty && (
                <>
                  <td className="border border-slate-300 px-1.5 sm:px-2.5 py-1.5 text-center">
                    {fmtNum(Number(item.qty))}
                  </td>
                  <td className="border border-slate-300 px-1.5 sm:px-2.5 py-1.5 text-center">{item.unit}</td>
                </>
              )}
              <td className="border border-slate-300 px-1.5 sm:px-2.5 py-1.5 text-right whitespace-nowrap">
                {fmt(Number(item.unit_price), doc.currency)}
              </td>
              <td className="border border-slate-300 px-1.5 sm:px-2.5 py-1.5 text-right whitespace-nowrap font-medium">
                {fmt(Number(item.qty) * Number(item.unit_price), doc.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Blok subtotal / diskon / pajak / total. */
export function TotalsBlock({ data }: { data: TemplateData }) {
  const { doc, totals } = data;
  return (
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
        <span>Total</span>
        <span>{fmt(totals.total, doc.currency)}</span>
      </div>
      <p className="text-[11px] italic text-slate-500">Terbilang: {terbilang(totals.total)}</p>
    </div>
  );
}

import { cn } from "@/lib/utils";

/** Komponen untuk merender teks berbaris banyak dengan deteksi otomatis daftar angka / bullet */
export function FormattedListText({ text, className }: { text?: string | null; className?: string }) {
  if (!text) return null;

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  return (
    <div className={cn("space-y-1.5 leading-relaxed text-slate-700", className)}>
      {lines.map((line, idx) => {
        const numMatch = line.match(/^(\d+[\.\)])\s*(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2">
              <span className="shrink-0 min-w-[20px] font-semibold text-slate-800">{numMatch[1]}</span>
              <span className="flex-1">{numMatch[2]}</span>
            </div>
          );
        }

        const bulletMatch = line.match(/^([•\-\*]|->)\s*(.*)/);
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-2">
              <span className="shrink-0 font-bold text-slate-500">•</span>
              <span className="flex-1">{bulletMatch[2]}</span>
            </div>
          );
        }

        return <p key={idx}>{line}</p>;
      })}
    </div>
  );
}

/** Helper untuk memecah teks Lingkup Pekerjaan menjadi item tabel (No, Deskripsi, Keterangan) */
export interface ScopeTableItem {
  no: number;
  description: string;
  note: string;
}

export function parseScopeOfWork(text?: string | null): ScopeTableItem[] {
  if (!text || !text.trim()) return [];
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const items: ScopeTableItem[] = [];
  let currentNo = 1;

  lines.forEach((line) => {
    if (line.includes("|")) {
      const parts = line.split("|");
      const desc = parts[0].replace(/^(\d+[\.\)]|[•\-\*]|->)\s*/, "").trim();
      const note = parts.slice(1).join("|").trim();
      items.push({ no: currentNo++, description: desc, note });
    } else {
      const desc = line.replace(/^(\d+[\.\)]|[•\-\*]|->)\s*/, "").trim();
      items.push({ no: currentNo++, description: desc, note: "" });
    }
  });

  return items;
}

/** Tabel Lingkup Pekerjaan khusus Surat Penawaran / Quotation */
export function ScopeTable({ scopeOfWork }: { scopeOfWork?: string | null }) {
  const items = parseScopeOfWork(scopeOfWork);
  if (items.length === 0) return null;

  return (
    <div className="my-4 space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Lingkup Pekerjaan</h3>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[480px] sm:min-w-0 border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-800 text-left text-white">
              <th className="border border-slate-300 px-2 py-1.5 font-medium text-center w-10">No.</th>
              <th className="border border-slate-300 px-2 py-1.5 font-medium">Deskripsi Pekerjaan</th>
              <th className="border border-slate-300 px-2 py-1.5 font-medium w-2/5">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.no} className="hover:bg-slate-50/50">
                <td className="border border-slate-300 px-2 py-1.5 text-center font-medium text-slate-600">
                  {item.no}
                </td>
                <td className="border border-slate-300 px-2 py-1.5 text-slate-800 font-medium break-words">
                  {item.description}
                </td>
                <td className="border border-slate-300 px-2 py-1.5 text-slate-600 italic">
                  <FormattedListText text={item.note} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export interface BankAccountItem {
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;
}

export function parseBankAccounts(
  company: Partial<TemplateData["company"]>,
  selectedBanks?: string[] | null
): BankAccountItem[] {
  const names = (company.bank_name || "").split("\n").map((s) => s.trim());
  const numbers = (company.bank_account_number || "").split("\n").map((s) => s.trim());
  const holders = (company.bank_account_holder || "").split("\n").map((s) => s.trim());

  const count = Math.max(names.length, numbers.length, holders.length);
  if (count === 0 || (!names[0] && !numbers[0] && !holders[0])) return [];

  const items: BankAccountItem[] = [];
  for (let i = 0; i < count; i++) {
    if (names[i] || numbers[i] || holders[i]) {
      const bankName = names[i] || "";
      const bankNumber = numbers[i] || "";
      const bankHolder = holders[i] || holders[0] || "";
      const accountKey = `${bankName}|${bankNumber}`;

      if (
        !selectedBanks ||
        selectedBanks.length === 0 ||
        selectedBanks.includes(accountKey) ||
        selectedBanks.includes(bankName) ||
        selectedBanks.includes(bankNumber)
      ) {
        items.push({
          bank_name: bankName,
          bank_account_number: bankNumber,
          bank_account_holder: bankHolder,
        });
      }
    }
  }
  return items;
}

/** Blok informasi rekening bank (bisa lebih dari 1 bank) */
export function BankBlock({
  company,
  selectedBanks,
}: {
  company: TemplateData["company"];
  selectedBanks?: string[] | null;
}) {
  const accounts = parseBankAccounts(company, selectedBanks);
  if (accounts.length === 0) return null;

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-700">
      <h3 className="mb-2 font-bold uppercase tracking-wider text-slate-600">Pembayaran dapat ditransfer ke</h3>
      <div className={`grid gap-3 ${accounts.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
        {accounts.map((acc, idx) => (
          <div key={idx} className="rounded border border-slate-200/80 bg-white p-2.5 space-y-1 shadow-2xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-1">
              <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Bank</span>
              <span className="font-bold text-slate-900 text-sm">{acc.bank_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-500">No. Rekening</span>
              <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{acc.bank_account_number}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-500">Atas Nama</span>
              <span className="font-semibold text-slate-800">{acc.bank_account_holder}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Blok Ketentuan Pembayaran */
export function TermsBlock({ terms, title = "Ketentuan Pembayaran" }: { terms?: string | null; title?: string }) {
  if (!terms) return null;
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3.5 text-sm text-slate-700">
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">{title}</h4>
      <FormattedListText text={terms} />
    </div>
  );
}

/** Blok Catatan */
export function NotesBlock({ notes, title = "Catatan" }: { notes?: string | null; title?: string }) {
  if (!notes) return null;
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3.5 text-sm text-slate-700">
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">{title}</h4>
      <FormattedListText text={notes} />
    </div>
  );
}

/** Blok tanda tangan penyedia jasa (kiri: pihak I, kanan: pihak II opsional). */
export function SignatureBlock({
  company,
  signerName,
  signerPosition,
  city,
  date,
  leftLabel = (companyName) => `Hormat kami,\n${companyName}`,
  rightLabel,
  rightSignerName,
  rightSignerPosition,
}: {
  company: TemplateData["company"];
  signerName?: string | null;
  signerPosition?: string | null;
  city?: string | null;
  date?: string | null;
  leftLabel?: (companyName: string) => string;
  rightLabel?: string;
  rightSignerName?: string;
  rightSignerPosition?: string;
}) {
  const place = city || company.city || "";
  const formattedDate = date ? fmtDate(date) : "";
  const dateLine = [place, formattedDate].filter(Boolean).join(", ");

  if (!rightLabel) {
    return (
      <div className="mt-8 flex justify-end text-sm">
        <div className="w-64 text-center">
          <p className="whitespace-pre-line font-semibold text-slate-800">{leftLabel(company.name)}</p>
          {dateLine && <p className="mt-1 text-xs text-slate-500">{dateLine}</p>}
          <div className="mt-16 flex flex-col items-center">
            <p className="font-semibold underline text-slate-900">
              {signerName || company.signer_name || company.name}
            </p>
            <p className="text-xs text-slate-600">{signerPosition || company.signer_position}</p>
            {company.signer_nip && <p className="text-xs text-slate-500">NIP. {company.signer_nip}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-8 text-sm">
      <div className="text-center">
        <p className="whitespace-pre-line font-semibold text-slate-800">{leftLabel(company.name)}</p>
        {dateLine && <p className="mt-1 text-xs text-slate-500">{dateLine}</p>}
        <div className="mt-16 flex flex-col items-center">
          <p className="font-semibold underline text-slate-900">{signerName || company.signer_name || company.name}</p>
          <p className="text-xs text-slate-600">{signerPosition || company.signer_position}</p>
          {company.signer_nip && <p className="text-xs text-slate-500">NIP. {company.signer_nip}</p>}
        </div>
      </div>
      <div className="text-center">
        <p className="whitespace-pre-line font-semibold text-slate-800">{rightLabel}</p>
        {dateLine && <p className="mt-1 text-xs text-slate-500">{dateLine}</p>}
        <div className="mt-16 flex flex-col items-center">
          <p className="font-semibold underline text-slate-900">{rightSignerName}</p>
          <p className="text-xs text-slate-600">{rightSignerPosition}</p>
        </div>
      </div>
    </div>
  );
}

/** Footer kecil. */
export function DocFooter({ data }: { data: TemplateData }) {
  const { company } = data;
  return (
    <footer className="mt-6 border-t border-slate-200 pt-2 text-center text-[11px] text-slate-400">
      {company.name} · {company.phone ? `${company.phone} · ` : ""}
      {company.email} · {company.website || ""}
    </footer>
  );
}
