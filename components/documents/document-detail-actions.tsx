"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Download,
  FileType2,
  Mail,
  Pencil,
  Copy,
  Trash2,
  Eye,
  Loader2,
  MoreVertical,
  ChevronDown,
  Receipt,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { DOC_STATUS, DOC_TYPES } from "@/lib/types";
import type { DocStatus, DocType } from "@/lib/types";
import { updateDocumentStatusAction, deleteDocumentAction, duplicateDocumentAction } from "@/lib/actions/documents";
import { TerminDialog } from "@/components/documents/termin-dialog";
import { PAPER_SIZES, DEFAULT_PAPER } from "@/lib/documents/paper";

interface Props {
  docId: string;
  docType: DocType;
  status: DocStatus;
  clientEmail?: string | null;
  clientName?: string;
  docNumber: string;
  docTotal: number;
  currency: string;
  terminIndex: number;
}

export function DocumentDetailActions({
  docId,
  docType,
  status,
  clientEmail,
  clientName,
  docNumber,
  docTotal,
  currency,
  terminIndex,
}: Props) {
  const router = useRouter();
  const [emailOpen, setEmailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [terminOpen, setTerminOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const [toEmail, setToEmail] = useState(clientEmail || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [cc, setCc] = useState("");

  const handleOpenEmail = () => {
    setToEmail(clientEmail || "");
    setSubject(`[${DOC_TYPES[docType]?.label || "Dokumen"}] ${docNumber} dari ${clientName || "perusahaan kami"}`);
    setMessage(
      `Kepada Yth. Bapak/Ibu,\n\nTerlampir kami kirimkan ${DOC_TYPES[docType]?.label || "dokumen"} ${docNumber} untuk Anda.\n\nTerima kasih.`
    );
    setEmailOpen(true);
  };

  const pdfUrl = `/api/documents/${docId}/pdf`;
  const docxUrl = `/api/documents/${docId}/docx`;

  const handleStatus = async (value: DocStatus) => {
    setBusy("status");
    const res = await updateDocumentStatusAction(docId, value);
    setBusy(null);
    if (res.error) return toast.error(res.error);
    toast.success("Status diperbarui");
    router.refresh();
  };

  const handleDuplicate = async () => {
    setBusy("duplicate");
    const res = await duplicateDocumentAction(docId);
    setBusy(null);
    if (res.error) return toast.error(res.error);
    toast.success("Dokumen diduplikasi sebagai draft baru");
    router.push(`/documents/${res.id}`);
    router.refresh();
  };

  const handleDelete = async () => {
    setBusy("delete");
    const res = await deleteDocumentAction(docId);
    setBusy(null);
    if (res.error) return toast.error(res.error);
    toast.success("Dokumen dihapus");
    setDeleteOpen(false);
    router.push("/documents");
  };

  const handleSendEmail = async () => {
    if (!toEmail.trim()) return toast.error("Email tujuan wajib diisi");
    setBusy("email");
    try {
      const res = await fetch(`/api/documents/${docId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_email: toEmail.trim(), subject, message, cc }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal mengirim email");
        return;
      }
      toast.success(`Email terkirim ke ${toEmail}`);
      setEmailOpen(false);
      router.refresh();
    } catch {
      toast.error("Gagal mengirim email");
    } finally {
      setBusy(null);
    }
  };

  const handleShareWhatsApp = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const msg = `Halo${clientName ? ` Bapak/Ibu ${clientName}` : ""},\n\nBerikut kami sampaikan dokumen *${docNumber}*.\n\nAnda dapat melihat dokumen lengkap di tautan berikut:\n${origin}/documents/${docId}\n\nTerima kasih.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success("Membuka WhatsApp...");
  };

  const busyEmail = busy === "email";

  return (
    <>
      {/* Desktop & Tablet Toolbar (sm+) */}
      <div className="hidden sm:flex flex-nowrap items-center gap-1.5 md:gap-2 shrink-0">
        {/* Utama: Download PDF (pilih ukuran kertas) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1.5 shadow-xs">
              <Download className="h-4 w-4" />
              <span className="hidden xl:inline">Download PDF</span>
              <span className="xl:hidden">PDF</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Pilih ukuran kertas</div>
            {Object.values(PAPER_SIZES).map((paper) => (
              <DropdownMenuItem key={paper.id} asChild>
                <a
                  href={`${pdfUrl}?size=${paper.id}`}
                  download
                  className="flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileType2 className="h-4 w-4 text-blue-600" /> {paper.label}
                  </span>
                  {paper.id === DEFAULT_PAPER && <span className="text-[10px] text-muted-foreground">Default</span>}
                </a>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={docxUrl} download className="flex items-center gap-2 cursor-pointer">
                <FileType2 className="h-4 w-4 text-slate-500" /> Export Word (.docx)
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit Dokumen */}
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href={`/documents/${docId}/edit`}>
            <Pencil className="h-4 w-4" />
            <span className="hidden xl:inline">Edit</span>
          </Link>
        </Button>

        {/* Kirim Email */}
        <Button variant="outline" size="sm" onClick={handleOpenEmail} className="gap-1.5">
          <Mail className="h-4 w-4" />
          <span className="hidden xl:inline">Kirim Email</span>
          <span className="xl:hidden">Email</span>
        </Button>

        {/* Dropdown Status */}
        <Select
          value={status}
          onValueChange={(v) => handleStatus(v as DocStatus)}
          className="w-28 md:w-32 lg:w-36 font-medium text-xs sm:text-sm"
          options={(Object.keys(DOC_STATUS) as DocStatus[]).map((s) => ({
            value: s,
            label: DOC_STATUS[s].label,
          }))}
        />

        {/* Dropdown Menu Aksi Lainnya */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 px-2 sm:px-2.5">
              <MoreVertical className="h-4 w-4" />
              <span className="hidden xl:inline">Aksi Lainnya</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem
              onClick={handleShareWhatsApp}
              className="flex items-center gap-2 cursor-pointer text-emerald-700 font-medium"
            >
              <MessageSquare className="h-4 w-4 text-emerald-600" /> Kirim via WhatsApp
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <a href={docxUrl} download className="flex items-center gap-2 cursor-pointer">
                <FileType2 className="h-4 w-4 text-blue-600" /> Export Word (.docx)
              </a>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href={`/documents/${docId}/preview`} className="flex items-center gap-2 cursor-pointer">
                <Eye className="h-4 w-4 text-slate-600" /> Preview Full Screen
              </Link>
            </DropdownMenuItem>

            {docType === "invoice" && (
              <DropdownMenuItem onClick={() => setTerminOpen(true)} className="flex items-center gap-2 cursor-pointer">
                <Receipt className="h-4 w-4 text-emerald-600" /> Buat Invoice Termin
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={handleDuplicate}
              disabled={busy === "duplicate"}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Copy className="h-4 w-4 text-purple-600" /> Duplikat Dokumen
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" /> Hapus Dokumen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Floating Bottom Toolbar untuk Mobile (< sm) */}
      <div className="no-print fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-30 border-t border-slate-200 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-md items-center gap-2">
          {/* Download PDF (pilih ukuran kertas) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="flex-1 gap-1.5 text-xs font-semibold shadow-xs">
                <Download className="h-4 w-4" /> PDF
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Pilih ukuran kertas</div>
              {Object.values(PAPER_SIZES).map((paper) => (
                <DropdownMenuItem key={paper.id} asChild>
                  <a
                    href={`${pdfUrl}?size=${paper.id}`}
                    download
                    className="flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileType2 className="h-4 w-4 text-blue-600" /> {paper.label}
                    </span>
                    {paper.id === DEFAULT_PAPER && <span className="text-[10px] text-muted-foreground">Default</span>}
                  </a>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={docxUrl} download className="flex items-center gap-2 cursor-pointer">
                  <FileType2 className="h-4 w-4 text-slate-500" /> Export Word (.docx)
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit */}
          <Button asChild variant="outline" size="sm" className="px-2.5" title="Edit Dokumen">
            <Link href={`/documents/${docId}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>

          {/* Kirim Email */}
          <Button variant="outline" size="sm" className="px-2.5" onClick={handleOpenEmail} title="Kirim Email">
            <Mail className="h-4 w-4" />
          </Button>

          {/* Select Status */}
          <Select
            value={status}
            onValueChange={(v) => handleStatus(v as DocStatus)}
            className="w-28 text-xs font-medium"
            options={(Object.keys(DOC_STATUS) as DocStatus[]).map((s) => ({
              value: s,
              label: DOC_STATUS[s].label,
            }))}
          />

          {/* Menu Lainnya */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={handleShareWhatsApp}
                className="flex items-center gap-2 cursor-pointer text-emerald-700 font-medium"
              >
                <MessageSquare className="h-4 w-4 text-emerald-600" /> Kirim via WhatsApp
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <a href={docxUrl} download className="flex items-center gap-2 cursor-pointer">
                  <FileType2 className="h-4 w-4 text-blue-600" /> Export Word (.docx)
                </a>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href={`/documents/${docId}/preview`} className="flex items-center gap-2 cursor-pointer">
                  <Eye className="h-4 w-4 text-slate-600" /> Preview Full Screen
                </Link>
              </DropdownMenuItem>

              {docType === "invoice" && (
                <DropdownMenuItem
                  onClick={() => setTerminOpen(true)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Receipt className="h-4 w-4 text-emerald-600" /> Buat Invoice Termin
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={handleDuplicate}
                disabled={busy === "duplicate"}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Copy className="h-4 w-4 text-purple-600" /> Duplikat Dokumen
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" /> Hapus Dokumen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {docType === "invoice" && (
        <TerminDialog
          docId={docId}
          docTotal={docTotal}
          currency={currency}
          defaultTerminIndex={terminIndex}
          open={terminOpen}
          onOpenChange={setTerminOpen}
        />
      )}

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Kirim {DOC_TYPES[docType]?.label || "Dokumen"} {docNumber} via Email
            </DialogTitle>
            <DialogDescription>
              Berkas PDF resmi dokumen akan dilampirkan secara otomatis ke dalam email pengiriman ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="to">Kepada *</Label>
              <Input
                id="to"
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="email@klien.com"
              />
              {clientEmail ? (
                <p className="text-[11px] text-emerald-600 font-medium">
                  ✓ Otomatis terisi dari email klien ({clientEmail})
                </p>
              ) : (
                <p className="text-[11px] text-amber-600 font-medium">
                  * Klien belum memiliki email tersimpan. Silakan ketik alamat email penerima.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cc">CC (opsional, pisah koma)</Label>
              <Input
                id="cc"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="cc1@email.com, cc2@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subjek</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={`Dokumen ${docNumber} dari ${clientName || "perusahaan kami"}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Pesan</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder={"Kepada Yth. Bapak/Ibu,\n\nTerlampir kami kirimkan dokumen untuk Anda.\n\nTerima kasih."}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSendEmail} disabled={busyEmail}>
              {busyEmail ? <Loader2 className="animate-spin" /> : <Mail />}
              {busyEmail ? "Mengirim..." : "Kirim Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus dokumen?</AlertDialogTitle>
            <AlertDialogDescription>
              {docNumber} akan dihapus permanen beserta seluruh item dan log email-nya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={busy === "delete"}
            >
              {busy === "delete" ? <Loader2 className="animate-spin" /> : <Trash2 />} Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
