import type { DocType } from "@/lib/types";
import { DOC_TYPES } from "@/lib/types";

export interface EmailTemplateInput {
  docType: DocType;
  docTitle: string;
  docNumber: string;
  companyName: string;
  clientName?: string | null;
  total?: string;
  dueDate?: string;
}

const INTRO: Record<DocType, (i: EmailTemplateInput) => string> = {
  penawaran: ({ docNumber }) =>
    `Terlampir kami sampaikan Surat Penawaran nomor ${docNumber} untuk dapat Bapak/Ibu review. Kami siap mendiskusikan lebih lanjut dan menunggu balasan positif Anda.`,
  quotation: ({ docNumber }) =>
    `Terlampir kami sampaikan Quotation nomor ${docNumber} beserta rincian penawaran harga. Mohon dapat dikonfirmasi apabila sudah disetujui, serta beri tahu kami jika ada yang perlu disesuaikan.`,
  invoice: ({ docNumber, total, dueDate }) =>
    `Terlampir kami kirimkan Invoice (tagihan) nomor ${docNumber}${total ? ` dengan total ${total}` : ""}${dueDate ? ` dan jatuh tempo ${dueDate}` : ""}. Mohon dapat dilakukan pembayaran sesuai ketentuan yang tertera.`,
  bast: ({ docNumber }) =>
    `Terlampir kami sampaikan Berita Acara Serah Terima (BAST) nomor ${docNumber}. Mohon dapat ditinjau dan ditandatangani, kemudian dikirimkan kembali kepada kami.`,
  kontrak: ({ docNumber }) =>
    `Terlampir kami sampaikan draf Surat Perjanjian Kerja (SPK) nomor ${docNumber} untuk ditinjau bersama. Mohon konfirmasi apabila sudah sesuai untuk ditandatangani.`,
};

const CLOSING = "Terima kasih atas kepercayaan dan kerjasamanya.\n\nHormat kami,\n";

export function buildEmailTemplate(i: EmailTemplateInput): { subject: string; body: string } {
  const label = DOC_TYPES[i.docType].label;
  const subject = `${label} ${i.docNumber} - ${i.companyName}`;

  const body = [
    `Kepada Yth. ${i.clientName || "Bapak/Ibu"},`,
    "",
    INTRO[i.docType](i),
    "",
    CLOSING,
    i.companyName,
  ].join("\n");

  return { subject, body };
}
