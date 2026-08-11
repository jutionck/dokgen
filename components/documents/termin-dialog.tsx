"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createNextTerminAction } from "@/lib/actions/documents";
import { formatIDR, addDaysISO, todayISO } from "@/lib/utils";

interface Props {
  docId: string;
  docTotal: number;
  currency: string;
  defaultTerminIndex: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function TerminDialog({
  docId,
  docTotal,
  currency,
  defaultTerminIndex,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: Props) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (setControlledOpen) setControlledOpen(val);
    if (!isControlled) setInternalOpen(val);
  };

  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState(`Invoice Termin ${defaultTerminIndex}`);
  const [nominal, setNominal] = useState("");
  const [dueDate, setDueDate] = useState(addDaysISO(todayISO(), 30));
  const [notes, setNotes] = useState("");

  const setPercent = (pct: number) => setNominal(String(Math.round((docTotal * pct) / 100)));

  const handleSubmit = async () => {
    const value = Number(nominal);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Isi nominal termin lebih dari 0");
      return;
    }
    setBusy(true);
    const res = await createNextTerminAction(docId, {
      nominal: value,
      title,
      due_date: dueDate,
      notes,
    });
    setBusy(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(`Invoice termin dibuat: ${res.number}`);
    setOpen(false);
    router.push(`/documents/${res.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : !isControlled ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Receipt /> Buat Termin
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Buat Invoice Termin Berikutnya</DialogTitle>
          <DialogDescription>
            Invoice baru dibuat otomatis dengan nomor baru. Total invoice ini:{" "}
            <span className="font-semibold">{formatIDR(docTotal, currency)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2 col-span-2">
              <Label>Judul Invoice</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Nominal Termin (Rp)</Label>
              <Input
                type="number"
                min={0}
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                placeholder="Contoh: 5000000"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[10, 25, 50, 75, 100].map((pct) => (
                  <Button key={pct} type="button" variant="secondary" size="sm" onClick={() => setPercent(pct)}>
                    {pct}%
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Jatuh Tempo</Label>
              <DateInput value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Contoh: Tahap 1 — DP" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Receipt />}
            {busy ? "Membuat..." : "Buat Invoice Termin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
