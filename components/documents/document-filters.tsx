"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, RotateCcw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DOC_TYPES, DOC_STATUS } from "@/lib/types";
import type { DocStatus, DocType } from "@/lib/types";

export function DocumentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");

  const apply = useCallback(
    (patch: { type?: string; status?: string; qVal?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (patch.type !== undefined) {
        if (patch.type) params.set("type", patch.type);
        else params.delete("type");
      }
      if (patch.status !== undefined) {
        if (patch.status) params.set("status", patch.status);
        else params.delete("status");
      }
      const searchVal = patch.qVal !== undefined ? patch.qVal : q;
      if (searchVal.trim()) params.set("q", searchVal.trim());
      else params.delete("q");

      router.push(`/documents?${params.toString()}`);
    },
    [q, router, searchParams]
  );

  const reset = () => {
    setQ("");
    router.push("/documents");
  };

  const hasFilter = Boolean(searchParams.get("type") || searchParams.get("status") || searchParams.get("q"));

  return (
    <div className="grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap">
      <div className="relative col-span-2 sm:w-60">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply({})}
          placeholder="Cari nomor / judul..."
          className="h-10 w-full pl-9 pr-8 text-sm sm:h-9"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              apply({ qVal: "" });
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600"
            aria-label="Hapus pencarian"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <Select
        value={searchParams.get("type") || ""}
        onValueChange={(v) => apply({ type: v })}
        placeholder="Semua Jenis"
        className="h-10 w-full text-sm sm:h-9 sm:w-44"
        options={[
          { value: "", label: "Semua Jenis" },
          ...(Object.keys(DOC_TYPES) as DocType[]).map((t) => ({
            value: t,
            label: DOC_TYPES[t].label,
          })),
        ]}
      />

      <Select
        value={searchParams.get("status") || ""}
        onValueChange={(v) => apply({ status: v })}
        placeholder="Semua Status"
        className="h-10 w-full text-sm sm:h-9 sm:w-36"
        options={[
          { value: "", label: "Semua Status" },
          ...(Object.keys(DOC_STATUS) as DocStatus[]).map((s) => ({
            value: s,
            label: DOC_STATUS[s].label,
          })),
        ]}
      />

      {hasFilter && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={reset}
          className="col-span-2 h-10 w-full border-dashed text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:col-auto sm:h-9 sm:w-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filter
        </Button>
      )}
    </div>
  );
}
