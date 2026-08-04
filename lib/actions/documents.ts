"use server";

import { and, asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { docSequences, documentItems, documents } from "@/db/schema";
import { DOC_TYPES } from "@/lib/types";
import type { DocStatus, DocType, DocumentItem, DocExtra } from "@/lib/types";
import { requireCompanyId } from "@/lib/documents/auth";

export type DocActionResult =
  { success: true; id: string; number?: string; error?: never } | { success?: never; error: string; id?: never };

export interface DocumentInput {
  type: DocType;
  title: string;
  client_id?: string;
  status: DocStatus;
  issue_date: string;
  due_date?: string;
  currency: string;
  tax_rate: number;
  discount: number;
  notes?: string;
  terms?: string;
  extra: DocExtra;
  items: DocumentItem[];
}

function toNumber(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeItems(items: unknown): DocumentItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((i) => i && typeof i === "object")
    .map((i) => ({
      description: String((i as Record<string, unknown>).description || "").trim(),
      qty: toNumber((i as Record<string, unknown>).qty, 1),
      unit: String((i as Record<string, unknown>).unit || "pcs"),
      unit_price: toNumber((i as Record<string, unknown>).unit_price),
    }))
    .filter((i) => i.description);
}

async function nextDocNumber(company_id: string, type: DocType, issue_date: string): Promise<string> {
  const period = issue_date.slice(0, 7);
  const [seqRow] = await db
    .insert(docSequences)
    .values({ company_id, doc_type: type, period, seq: 1 })
    .onConflictDoUpdate({
      target: [docSequences.company_id, docSequences.doc_type, docSequences.period],
      set: { seq: sql`${docSequences.seq} + 1` },
    })
    .returning({ seq: docSequences.seq });

  const seq = seqRow?.seq ?? 1;
  const code = DOC_TYPES[type].code;
  const month = period.slice(5);
  const year = period.slice(0, 4);
  return `${String(seq).padStart(3, "0")}/${code}/${month}/${year}`;
}

export async function createDocumentAction(input: DocumentInput): Promise<DocActionResult> {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };

  const issue_date = input.issue_date || new Date().toISOString().slice(0, 10);
  const number = await nextDocNumber(company_id, input.type, issue_date);
  const items = sanitizeItems(input.items);

  const [doc] = await db
    .insert(documents)
    .values({
      company_id,
      type: input.type,
      number,
      title: input.title || DOC_TYPES[input.type].defaultTitle,
      client_id: input.client_id || null,
      status: input.status,
      issue_date,
      due_date: input.due_date || null,
      currency: input.currency || "IDR",
      tax_rate: input.tax_rate || 0,
      discount: input.discount || 0,
      notes: input.notes || null,
      terms: input.terms || null,
      extra: input.extra || {},
    })
    .returning({ id: documents.id });

  if (!doc) return { error: "Gagal menyimpan dokumen" };

  if (items.length > 0) {
    await db.insert(documentItems).values(
      items.map((item, idx) => ({
        document_id: doc.id,
        description: item.description,
        qty: item.qty,
        unit: item.unit,
        unit_price: item.unit_price,
        sort_order: idx,
      }))
    );
  }

  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { success: true, id: doc.id, number };
}

export async function updateDocumentAction(id: string, input: DocumentInput): Promise<DocActionResult> {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };
  const items = sanitizeItems(input.items);

  await db
    .update(documents)
    .set({
      title: input.title,
      client_id: input.client_id || null,
      status: input.status,
      issue_date: input.issue_date,
      due_date: input.due_date || null,
      currency: input.currency || "IDR",
      tax_rate: input.tax_rate || 0,
      discount: input.discount || 0,
      notes: input.notes || null,
      terms: input.terms || null,
      extra: input.extra || {},
    })
    .where(eq(documents.id, id));

  await db.delete(documentItems).where(eq(documentItems.document_id, id));

  if (items.length > 0) {
    await db.insert(documentItems).values(
      items.map((item, idx) => ({
        document_id: id,
        description: item.description,
        qty: item.qty,
        unit: item.unit,
        unit_price: item.unit_price,
        sort_order: idx,
      }))
    );
  }

  revalidatePath(`/documents/${id}`);
  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { success: true, id };
}

export async function updateDocumentStatusAction(id: string, status: DocStatus) {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };

  await db.update(documents).set({ status }).where(eq(documents.id, id));
  revalidatePath(`/documents/${id}`);
  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteDocumentAction(id: string) {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };

  await db.delete(documents).where(eq(documents.id, id));
  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function duplicateDocumentAction(id: string): Promise<DocActionResult> {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };

  const [doc] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  if (!doc) return { error: "Dokumen tidak ditemukan" };

  const items = await db
    .select()
    .from(documentItems)
    .where(eq(documentItems.document_id, id))
    .orderBy(asc(documentItems.sort_order));

  const issue_date = new Date().toISOString().slice(0, 10);
  const number = await nextDocNumber(company_id, doc.type, issue_date);

  const [copy] = await db
    .insert(documents)
    .values({
      company_id,
      type: doc.type,
      number,
      title: doc.title,
      client_id: doc.client_id,
      status: "draft",
      issue_date,
      currency: doc.currency,
      tax_rate: doc.tax_rate,
      discount: doc.discount,
      notes: doc.notes,
      terms: doc.terms,
      extra: doc.extra,
    })
    .returning({ id: documents.id });

  if (!copy) return { error: "Gagal menduplikasi dokumen" };

  if (items.length > 0) {
    await db.insert(documentItems).values(
      items.map((item, idx) => ({
        document_id: copy.id,
        description: item.description,
        qty: item.qty,
        unit: item.unit,
        unit_price: item.unit_price,
        sort_order: idx,
      }))
    );
  }

  revalidatePath("/documents");
  return { success: true, id: copy.id };
}

export interface TerminInput {
  nominal: number;
  title?: string;
  due_date?: string;
  notes?: string;
}

/**
 * Membuat invoice termin berikutnya dari sebuah invoice sumber:
 * - nomor baru otomatis (urutan per bulan)
 * - 1 item tunggal: "Termin N — {judul sumber}" senilai nominal
 * - jatuh tempo default +30 hari dari tanggal terbit
 * - item, pajak, diskon di-set 0 — bisa diedit setelahnya
 */
export async function createNextTerminAction(sourceId: string, input: TerminInput): Promise<DocActionResult> {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };
  if (!Number.isFinite(input.nominal) || input.nominal <= 0) {
    return { error: "Nominal termin wajib lebih dari 0" };
  }

  const [src] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, sourceId), eq(documents.company_id, company_id)))
    .limit(1);
  if (!src || src.type !== "invoice") {
    return { error: "Dokumen sumber tidak valid — hanya bisa dari Invoice" };
  }

  const issue_date = new Date().toISOString().slice(0, 10);
  const due_date =
    input.due_date || new Date(new Date(issue_date).getTime() + 30 * 86400000).toISOString().slice(0, 10);
  const number = await nextDocNumber(company_id, "invoice", issue_date);

  const title = input.title?.trim() || "Invoice Termin";
  const [doc] = await db
    .insert(documents)
    .values({
      company_id,
      type: "invoice",
      number,
      title,
      client_id: src.client_id,
      status: "draft",
      issue_date,
      due_date,
      currency: src.currency,
      tax_rate: 0,
      discount: 0,
      notes: input.notes?.trim() || null,
      terms: "",
      extra: {
        payment_terms: src.extra?.payment_terms || "",
      },
    })
    .returning({ id: documents.id });
  if (!doc) return { error: "Gagal membuat invoice termin" };

  await db.insert(documentItems).values({
    document_id: doc.id,
    description: `${title} — ${src.title} (${src.number})`,
    qty: 1,
    unit: "ls",
    unit_price: input.nominal,
    sort_order: 0,
  });

  revalidatePath(`/documents/${doc.id}`);
  revalidatePath("/documents");
  return { success: true, id: doc.id, number };
}
