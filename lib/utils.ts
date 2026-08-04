import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(value: number, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(value || 0);
}

export function formatNumber(value: number, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(value || 0);
}

export function formatDate(date?: string | Date | null, withDay = false) {
  if (!date) return "-";
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withDay ? { weekday: "long" } : {}),
  };
  return new Intl.DateTimeFormat("id-ID", opts).format(new Date(date));
}

export function formatDateShort(date?: string | Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(date)
  );
}

export function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function addDaysISO(date: string, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function formatDateTime(date?: string | Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function periodOf(date: string) {
  return date.slice(0, 7);
}

export function numberToWordsIDR(amount: number): string {
  const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  const tingkatan = ["", "Ribu", "Juta", "Miliar", "Triliun"];

  const toWords = (n: number): string => {
    if (n < 12) return satuan[n];
    if (n < 20) return `${toWords(n - 10)} Belas`;
    if (n < 100) return `${toWords(Math.floor(n / 10))} Puluh ${toWords(n % 10)}`.trim();
    if (n < 200) return `Seratus ${toWords(n - 100)}`.trim();
    if (n < 1000) return `${toWords(Math.floor(n / 100))} Ratus ${toWords(n % 100)}`.trim();
    return "";
  };

  const splitThousands = (n: number): number[] => {
    const parts: number[] = [];
    let value = n;
    while (value > 0) {
      parts.push(value % 1000);
      value = Math.floor(value / 1000);
    }
    return parts;
  };

  const words = (n: number): string => {
    if (n === 0) return "";
    const parts = splitThousands(n);
    return parts
      .map((part, i) => (part === 0 ? "" : `${toWords(part)} ${tingkatan[i]}`.trim()))
      .reverse()
      .filter(Boolean)
      .join(" ");
  };

  if (amount === 0) return "Nol Rupiah";
  const rounded = Math.floor(amount);
  return `${words(rounded)} Rupiah`.trim();
}
