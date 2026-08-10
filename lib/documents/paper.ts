import type { PageSize } from "@react-pdf/types";

export interface PaperDef {
  id: string;
  label: string;
  pdf: PageSize;
  points: { width: number; height: number };
  docx: { width: number; height: number }; // satuan twips (1/20 pt)
}

export const PAPER_SIZES: Record<string, PaperDef> = {
  a4: {
    id: "a4",
    label: "A4 (210 × 297 mm)",
    pdf: { width: 595.28, height: 841.89 },
    points: { width: 595.28, height: 841.89 },
    docx: { width: 11906, height: 16838 },
  },
  f4: {
    id: "f4",
    label: "F4 / Folio (210 × 330 mm)",
    pdf: { width: 595.28, height: 935.43 },
    points: { width: 595.28, height: 935.43 },
    docx: { width: 11906, height: 18709 },
  },
  letter: {
    id: "letter",
    label: "Letter (216 × 279 mm)",
    pdf: { width: 612, height: 792 },
    points: { width: 612, height: 792 },
    docx: { width: 12240, height: 15840 },
  },
  legal: {
    id: "legal",
    label: "Legal (216 × 356 mm)",
    pdf: { width: 612, height: 1008 },
    points: { width: 612, height: 1008 },
    docx: { width: 12240, height: 20163 },
  },
};

export const DEFAULT_PAPER = "a4";

export function resolvePaper(id?: string | null): PaperDef {
  if (id && PAPER_SIZES[id]) return PAPER_SIZES[id];
  return PAPER_SIZES[DEFAULT_PAPER];
}
