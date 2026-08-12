import type { DocStatus, DocType, StampDutyMode } from "@/lib/types";

export const STAMP_DUTY_THRESHOLD_IDR = 5_000_000;
export const STAMP_DUTY_TARIFF_IDR = 10_000;

export interface StampDutyDecision {
  required: boolean;
  needsReview: boolean;
  reason: string;
}

export function resolveStampDuty({
  type,
  status,
  currency,
  total,
  mode = "auto",
}: {
  type: DocType;
  status: DocStatus;
  currency: string;
  total: number;
  mode?: StampDutyMode | null;
}): StampDutyDecision {
  if (mode === "required") {
    return { required: true, needsReview: false, reason: "Meterai diaktifkan secara manual." };
  }

  if (mode === "none") {
    return { required: false, needsReview: false, reason: "Meterai dinonaktifkan secara manual." };
  }

  if (type === "kontrak") {
    return {
      required: true,
      needsReview: false,
      reason: "Kontrak/perjanjian merupakan objek Bea Meterai tanpa bergantung pada nominal.",
    };
  }

  if (type === "bast") {
    return {
      required: true,
      needsReview: false,
      reason: "BAST merupakan dokumen perdata/surat keterangan yang perlu dibubuhi meterai.",
    };
  }

  if (type === "invoice" && status === "paid") {
    if (currency !== "IDR") {
      return {
        required: false,
        needsReview: true,
        reason: "Invoice mata uang asing perlu diperiksa memakai kurs Menteri Keuangan pada tanggal dokumen.",
      };
    }

    if (total > STAMP_DUTY_THRESHOLD_IDR) {
      return {
        required: true,
        needsReview: false,
        reason: "Invoice lunas menyatakan penerimaan/pelunasan uang lebih dari Rp5.000.000.",
      };
    }
  }

  if (type === "invoice" && currency === "IDR" && total > STAMP_DUTY_THRESHOLD_IDR) {
    return {
      required: false,
      needsReview: false,
      reason: "Ruang meterai akan aktif otomatis ketika invoice ditandai Lunas.",
    };
  }

  return {
    required: false,
    needsReview: false,
    reason: "Dokumen ini tidak terindikasi wajib meterai secara otomatis.",
  };
}
