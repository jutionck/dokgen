"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, FileType2, Mail, MoreHorizontal, Pencil, Copy, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useState } from "react";
import { deleteDocumentAction, duplicateDocumentAction } from "@/lib/actions/documents";

export function DocumentActions({ docId }: { docId: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleDuplicate = async () => {
    const res = await duplicateDocumentAction(docId);
    if (res.error) return toast.error(res.error);
    toast.success("Dokumen diduplikasi");
    router.refresh();
  };

  const handleDelete = async () => {
    setBusy(true);
    const res = await deleteDocumentAction(docId);
    setBusy(false);
    if (res.error) return toast.error(res.error);
    toast.success("Dokumen dihapus");
    setConfirm(false);
    router.refresh();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem asChild>
            <Link href={`/documents/${docId}`}>
              <Eye /> Lihat
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={`/api/documents/${docId}/pdf`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
              <Download /> Download PDF
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={`/api/documents/${docId}/docx`} download className="flex items-center gap-2 cursor-pointer">
              <FileType2 /> Download DOCX
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/documents/${docId}`}>
              <Mail /> Kirim Email
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/documents/${docId}/edit`}>
              <Pencil /> Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleDuplicate}>
            <Copy /> Duplikat
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setConfirm(true)} className="text-red-600 focus:text-red-700">
            <Trash2 /> Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus dokumen?</AlertDialogTitle>
            <AlertDialogDescription>Dokumen ini akan dihapus permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={busy}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}