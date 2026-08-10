"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  FileCheck2,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  Receipt,
  Scale,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentForm } from "@/components/documents/document-form";
import { DOC_TEMPLATES, DOC_TYPE_META } from "@/lib/documents/templates";
import { DOC_TYPES } from "@/lib/types";
import type { Client, DocType, Company } from "@/lib/types";
import { balancedCardSpan, cn } from "@/lib/utils";

const TYPE_ICONS = {
  receipt: Receipt,
  "file-text": FileText,
  spreadsheet: FileSpreadsheet,
  "file-check": FileCheck2,
  scale: Scale,
};

const DOCUMENT_TYPE_KEYS = Object.keys(DOC_TYPES) as DocType[];

export function NewDocumentWizard({ clients, company }: { clients: Client[]; company?: Company }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const typeParam = searchParams.get("type") as DocType | null;
  const seedParam = searchParams.get("seed");
  const blank = searchParams.get("blank") === "1";

  const type: DocType | null = typeParam && DOC_TYPES[typeParam] ? typeParam : null;
  const templates = type ? DOC_TEMPLATES[type] : [];
  const seed = type && seedParam ? (templates.find((t) => t.id === seedParam) ?? null) : null;

  const go = (params: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) p.set(k, v);
    }
    const qs = p.toString();
    router.replace(qs ? `/documents/new?${qs}` : "/documents/new");
  };

  const backToTypes = () => go({ type: undefined, seed: undefined, blank: undefined });

  // ---------- Langkah 1: pilih jenis dokumen ----------
  if (!type) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Buat Dokumen Baru</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pilih jenis dokumen yang ingin Anda buat.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-6">
          {DOCUMENT_TYPE_KEYS.map((t, index) => {
            const meta = DOC_TYPE_META[t];
            const Icon = TYPE_ICONS[meta.icon];
            return (
              <button
                key={t}
                type="button"
                onClick={() => go({ type: t, seed: undefined })}
                className={cn(
                  "group rounded-xl border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md",
                  balancedCardSpan(index, DOCUMENT_TYPE_KEYS.length)
                )}
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-semibold">{DOC_TYPES[t].label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{meta.description}</p>
                <p className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-700 opacity-0 transition-opacity group-hover:opacity-100">
                  Pilih jenis ini <ChevronRight className="h-3.5 w-3.5" />
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------- Langkah 2: pilih template atau mulai kosong ----------
  if (!blank && !seed) {
    return (
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={backToTypes}
            className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Pilih jenis dokumen
          </button>
          <h1 className="text-2xl font-bold">Buat {DOC_TYPES[type].label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mulai dari template siap pakai (bisa diedit), atau buat dari kosong.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-6">
          {templates.map((tpl, index) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => go({ type, seed: tpl.id })}
              className={cn(
                "group rounded-xl border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md",
                balancedCardSpan(index, templates.length + 1)
              )}
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="font-semibold">{tpl.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tpl.description}</p>
            </button>
          ))}

          <button
            type="button"
            onClick={() => go({ type, seed: undefined, blank: "1" })}
            className={cn(
              "group rounded-xl border border-dashed bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md",
              balancedCardSpan(templates.length, templates.length + 1)
            )}
          >
            {" "}
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-slate-200">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <p className="font-semibold">Mulai dari Kosong</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Form kosong — isi sendiri sesuai kebutuhan Anda.
            </p>
          </button>
        </div>
      </div>
    );
  }

  // ---------- Langkah 3: isi data (form) ----------
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button type="button" onClick={backToTypes} className="hover:text-foreground">
              Jenis
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
            <button type="button" onClick={() => go({ type, seed: undefined })} className="hover:text-foreground">
              Template
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">Isi Data</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold">
            {DOC_TYPES[type].label}{" "}
            <span
              className={
                "ml-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 align-middle text-xs font-medium " +
                (seed ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600")
              }
            >
              {seed ? (
                <>
                  <Sparkles className="h-3 w-3" /> {seed.name}
                </>
              ) : (
                <>
                  <FilePlus2 className="h-3 w-3" /> Mulai dari Kosong
                </>
              )}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {seed
              ? "Data template sudah terisi — silakan sesuaikan, lalu simpan."
              : "Form kosong — isi data dokumen Anda, lalu simpan."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => go({ type, seed: undefined, blank: undefined })}
        >
          <ArrowLeft className="h-4 w-4" /> Ganti Template
        </Button>
      </div>

      <DocumentForm
        key={`${type}-${seed?.id ?? "blank"}`}
        mode="create"
        clients={clients}
        initialType={type}
        seed={seed}
        company={company}
      />
    </div>
  );
}
