"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
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
    (patch: { type?: string; status?: string }) => {
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
      if (q.trim()) params.set("q", q.trim());
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
      <div className="relative col-span-2 sm:w-56">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply({})}
          placeholder="Cari nomor / judul..."
          className="w-full pl-9"
        />
      </div>
      <Select
        value={searchParams.get("type") || ""}
        onValueChange={(v) => apply({ type: v })}
        placeholder="Semua Jenis"
        className="w-full sm:w-48"
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
        className="w-full sm:w-36"
        options={[
          { value: "", label: "Semua Status" },
          ...(Object.keys(DOC_STATUS) as DocStatus[]).map((s) => ({
            value: s,
            label: DOC_STATUS[s].label,
          })),
        ]}
      />
      <Button type="button" variant="secondary" size="sm" onClick={() => apply({})} className="hidden sm:inline-flex">
        <Search /> Filter
      </Button>
      {hasFilter && (
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          <RotateCcw /> Reset
        </Button>
      )}
    </div>
  );
}
