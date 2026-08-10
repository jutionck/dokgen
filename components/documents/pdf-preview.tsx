"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DEFAULT_PAPER, PAPER_SIZES } from "@/lib/documents/paper";

export function PdfPreview({ docId, docNumber }: { docId: string; docNumber: string }) {
  const [paperId, setPaperId] = useState(DEFAULT_PAPER);
  const options = useMemo(
    () => Object.values(PAPER_SIZES).map((paper) => ({ value: paper.id, label: paper.label })),
    []
  );
  const baseUrl = `/api/documents/${docId}/pdf?size=${paperId}`;
  const previewUrl = `${baseUrl}&disposition=inline`;

  return (
    <main className="min-h-screen bg-slate-200">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b bg-white px-3 py-2.5 shadow-sm sm:px-4">
        <Link
          href={`/documents/${docId}`}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>

        <p className="hidden font-mono text-xs text-muted-foreground md:block">{docNumber}</p>

        <div className="flex items-center gap-2">
          <Select value={paperId} onValueChange={setPaperId} options={options} className="w-44 sm:w-56" />
          <Button asChild variant="outline" size="sm" className="hidden gap-1.5 sm:inline-flex">
            <a href={baseUrl} download>
              <Download className="h-4 w-4" /> Download
            </a>
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Cetak / Simpan PDF</span>
              <span className="sm:hidden">Cetak</span>
            </a>
          </Button>
        </div>
      </div>

      <iframe
        key={previewUrl}
        src={`${previewUrl}#view=FitH&toolbar=1&navpanes=0`}
        title={`Preview PDF ${docNumber} - ${paperId.toUpperCase()}`}
        className="h-[calc(100vh-58px)] w-full border-0 bg-slate-200"
      />
    </main>
  );
}
