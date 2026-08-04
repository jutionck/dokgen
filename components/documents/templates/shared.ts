import type { Company, Client, DocRecord, DocumentItem } from "@/lib/types";

export interface Totals {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  total: number;
}

export interface TemplateData {
  company: Company;
  client?: Client | null;
  doc: DocRecord;
  items: DocumentItem[];
  totals: Totals;
}

export function computeTotals(doc: DocRecord, items: DocumentItem[]): Totals {
  const subtotal = items.reduce((sum, i) => sum + Number(i.qty) * Number(i.unit_price), 0);
  const discount = Number(doc.discount) || 0;
  const taxable = Math.max(subtotal - discount, 0);
  const tax = (taxable * (Number(doc.tax_rate) || 0)) / 100;
  return { subtotal, discount, taxable, tax, total: taxable + tax };
}

export function fmt(n: number, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(n || 0);
}

export function fmtDate(d?: string | null) {
  if (!d) return "";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

export function fmtDateLong(d?: string | null) {
  if (!d) return "";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(d));
}

export function fmtNum(n: number, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(n || 0);
}

export function terbilang(n: number) {
  const satuan = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];
  const tingkat = ["", "Ribu", "Juta", "Miliar", "Triliun"];

  const words = (num: number): string => {
    if (num < 12) return satuan[num];
    if (num < 20) return `${words(num - 10)} Belas`;
    if (num < 100) return `${words(Math.floor(num / 10))} Puluh ${words(num % 10)}`.trim();
    if (num < 200) return `Seratus ${words(num - 100)}`.trim();
    if (num < 1000) return `${words(Math.floor(num / 100))} Ratus ${words(num % 100)}`.trim();
    return "";
  };

  const parts: number[] = [];
  let value = Math.floor(n);
  while (value > 0) {
    parts.push(value % 1000);
    value = Math.floor(value / 1000);
  }
  if (parts.length === 0) return "Nol Rupiah";

  const result = parts
    .map((p, i) => (p === 0 ? "" : `${words(p)} ${tingkat[i]}`.trim()))
    .reverse()
    .filter(Boolean)
    .join(" ");
  return `${result} Rupiah`;
}
