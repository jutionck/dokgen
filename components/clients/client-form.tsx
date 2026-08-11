"use client";

import { useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createClientAction, updateClientAction, deleteClientAction } from "@/lib/actions/clients";
import type { Client } from "@/lib/types";

interface ClientFormProps {
  mode: "create" | "edit";
  client?: Client;
  trigger?: React.ReactNode;
  onSaved?: () => void;
}

const initial = {
  name: "",
  company: "",
  address: "",
  phone: "",
  email: "",
  npwp: "",
  pic: "",
  notes: "",
};

export function ClientForm({ mode, client, trigger, onSaved }: ClientFormProps) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [form, setForm] = useState(
    mode === "edit" && client
      ? {
          name: client.name || "",
          company: client.company || "",
          address: client.address || "",
          phone: client.phone || "",
          email: client.email || "",
          npwp: client.npwp || "",
          pic: client.pic || "",
          notes: client.notes || "",
        }
      : initial
  );
  const [pendingAction, setPendingAction] = useState<"save" | "delete" | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingAction) return;
    setPendingAction("save");
    try {
      const res = mode === "create" ? await createClientAction(form) : await updateClientAction(client!.id, form);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(mode === "create" ? "Klien ditambahkan" : "Klien diperbarui");
      setOpen(false);
      onSaved?.();
    } catch {
      toast.error("Gagal menyimpan data klien");
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async () => {
    if (pendingAction) return;
    setPendingAction("delete");
    try {
      const res = await deleteClientAction(client!.id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Klien dihapus");
      setConfirm(false);
      setOpen(false);
    } catch {
      toast.error("Gagal menghapus klien");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Tambah Klien" : `Edit ${client?.name}`}</DialogTitle>
            <DialogDescription>Lengkapi identitas klien. Data ini akan dipakai di semua dokumen.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Nama / Kontak Person *</Label>
              <Input id="name" value={form.name} onChange={set("name")} placeholder="Nama PIC" required />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="company">Nama Perusahaan</Label>
              <Input id="company" value={form.company} onChange={set("company")} placeholder="PT Klien Sejahtera" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea id="address" value={form.address} onChange={set("address")} placeholder="Alamat lengkap" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telepon / HP</Label>
              <Input id="phone" value={form.phone} onChange={set("phone")} placeholder="08xx-xxxx-xxxx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="nama@email.com" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="npwp">NPWP</Label>
              <Input id="npwp" value={form.npwp} onChange={set("npwp")} placeholder="00.000.000.0-000.000" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={set("notes")}
                placeholder="Catatan internal (opsional)"
              />
            </div>
            <DialogFooter className="col-span-2">
              {mode === "edit" && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setConfirm(true)}
                  disabled={pendingAction !== null}
                  className="mr-auto"
                >
                  <Trash2 className="h-4 w-4" /> Hapus
                </Button>
              )}
              <Button type="submit" disabled={pendingAction !== null}>
                {pendingAction === "save" && <Loader2 className="h-4 w-4 animate-spin" />}
                {pendingAction === "save" ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus klien?</AlertDialogTitle>
            <AlertDialogDescription>
              {client?.name} akan dihapus permanen. Dokumen lama tetap tersimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pendingAction !== null}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={pendingAction !== null}
            >
              {pendingAction === "delete" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {pendingAction === "delete" ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
