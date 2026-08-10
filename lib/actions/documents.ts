"use server";

import { randomUUID } from "crypto";
import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { clients, docSequences, documentItems, documents } from "@/db/schema";
import { DOC_TYPES } from "@/lib/types";
import type { DocStatus, DocType, DocumentItem, DocExtra } from "@/lib/types";
import { requireCompanyId } from "@/lib/documents/auth";
import {
  documentInputSchema,
  documentStatusSchema,
  idSchema,
  terminInputSchema,
} from "@/lib/validators/actions";

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
  extra?: DocExtra;
  items: DocumentItem[];
}

function toNumber(val: unknown, fallback = 0): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeItems(rawItems: unknown[]): Omit<DocumentItem, "id" | "document_id">[] {
  if (!Array.isArray(rawItems)) return [];
  return rawItems
    .map((i) => ({
      description: String((i as Record<string, unknown>).description || "").trim(),
      qty: toNumber((i as Record<string, unknown>).qty, 1),
      unit: String((i as Record<string, unknown>).unit || "pcs"),
      unit_price: toNumber((i as Record<string, unknown>).unit_price),
    }))
    .filter((i) => i.description);
}

async function isCompanyClient(clientId: string | undefined, companyId: string): Promise<boolean> {
  if (!clientId) return true;

  const [client] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.company_id, companyId)))
    .limit(1);

  return Boolean(client);
}

async function nextDocNumber(company_id: string, type: DocType, issue_date: string): Promise<string> {
  const period = issue_date.slice(0, 7);

  const [existing] = await db
    .select({ seq: docSequences.seq })
    .from(docSequences)
    .where(
      and(eq(docSequences.company_id, company_id), eq(docSequences.doc_type, type), eq(docSequences.period, period))
    )
    .limit(1);

  let seq = 1;
  if (existing) {
    seq = existing.seq + 1;
    await db
      .update(docSequences)
      .set({ seq })
      .where(
        and(eq(docSequences.company_id, company_id), eq(docSequences.doc_type, type), eq(docSequences.period, period))
      );
  } else {
    await db.insert(docSequences).values({ company_id, doc_type: type, period, seq: 1 });
  }

  const code = DOC_TYPES[type].code;
  const month = period.slice(5);
  const year = period.slice(0, 4);
  return `${String(seq).padStart(3, "0")}/${code}/${month}/${year}`;
}

export async function createDocumentAction(input: DocumentInput): Promise<DocActionResult> {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };
  const parsed = documentInputSchema.safeParse(input);
  if (!parsed.success) return { error: "Data dokumen tidak valid" };
  const validInput = parsed.data as DocumentInput;
  if (!(await isCompanyClient(validInput.client_id, company_id))) {
    return { error: "Klien tidak ditemukan di perusahaan aktif" };
  }

  const issue_date = validInput.issue_date;
  const number = await nextDocNumber(company_id, validInput.type, issue_date);
  const items = sanitizeItems(validInput.items);
  const docId = randomUUID();

  await db.insert(documents).values({
    id: docId,
    company_id,
    type: validInput.type,
    number,
    title: validInput.title || DOC_TYPES[validInput.type].defaultTitle,
    client_id: validInput.client_id || null,
    status: validInput.status,
    issue_date,
    due_date: validInput.due_date || null,
    currency: validInput.currency || "IDR",
    tax_rate: validInput.tax_rate || 0,
    discount: validInput.discount || 0,
    notes: validInput.notes || null,
    terms: validInput.terms || null,
    extra: validInput.extra || {},
  });

  if (items.length > 0) {
    await db.insert(documentItems).values(
      items.map((item, idx) => ({
        document_id: docId,
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
  return { success: true, id: docId, number };
}

export async function updateDocumentAction(id: string, input: DocumentInput): Promise<DocActionResult> {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };
  if (!idSchema.safeParse(id).success) return { error: "Dokumen tidak ditemukan" };
  const parsed = documentInputSchema.safeParse(input);
  if (!parsed.success) return { error: "Data dokumen tidak valid" };
  const validInput = parsed.data as DocumentInput;
  const [ownedDocument] = await db
    .select({ id: documents.id })
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.company_id, company_id)))
    .limit(1);
  if (!ownedDocument) return { error: "Dokumen tidak ditemukan" };
  if (!(await isCompanyClient(validInput.client_id, company_id))) {
    return { error: "Klien tidak ditemukan di perusahaan aktif" };
  }
  const items = sanitizeItems(validInput.items);

  await db.transaction(async (tx) => {
    await tx
      .update(documents)
      .set({
        title: validInput.title,
        client_id: validInput.client_id || null,
        status: validInput.status,
        issue_date: validInput.issue_date,
        due_date: validInput.due_date || null,
        currency: validInput.currency || "IDR",
        tax_rate: validInput.tax_rate || 0,
        discount: validInput.discount || 0,
        notes: validInput.notes || null,
        terms: validInput.terms || null,
        extra: validInput.extra || {},
      })
      .where(and(eq(documents.id, id), eq(documents.company_id, company_id)));

    await tx.delete(documentItems).where(eq(documentItems.document_id, id));

    if (items.length > 0) {
      await tx.insert(documentItems).values(
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
  });

  revalidatePath(`/documents/${id}`);
  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { success: true, id };
}

export async function updateDocumentStatusAction(id: string, status: DocStatus) {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };
  if (!idSchema.safeParse(id).success || !documentStatusSchema.safeParse(status).success) {
    return { error: "Status dokumen tidak valid" };
  }

  await db
    .update(documents)
    .set({ status })
    .where(and(eq(documents.id, id), eq(documents.company_id, company_id)));
  revalidatePath(`/documents/${id}`);
  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteDocumentAction(id: string) {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };
  if (!idSchema.safeParse(id).success) return { error: "Dokumen tidak ditemukan" };

  await db.delete(documents).where(and(eq(documents.id, id), eq(documents.company_id, company_id)));
  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function duplicateDocumentAction(id: string): Promise<DocActionResult> {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };
  if (!idSchema.safeParse(id).success) return { error: "Dokumen tidak ditemukan" };

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.company_id, company_id)))
    .limit(1);
  if (!doc) return { error: "Dokumen tidak ditemukan" };

  const items = await db
    .select()
    .from(documentItems)
    .where(eq(documentItems.document_id, id))
    .orderBy(asc(documentItems.sort_order));

  const issue_date = new Date().toISOString().slice(0, 10);
  const number = await nextDocNumber(company_id, doc.type, issue_date);
  const copyId = randomUUID();

  await db.insert(documents).values({
    id: copyId,
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
  });

  if (items.length > 0) {
    await db.insert(documentItems).values(
      items.map((item, idx) => ({
        document_id: copyId,
        description: item.description,
        qty: item.qty,
        unit: item.unit,
        unit_price: item.unit_price,
        sort_order: idx,
      }))
    );
  }

  revalidatePath("/documents");
  return { success: true, id: copyId };
}

export interface TerminInput {
  nominal: number;
  title?: string;
  due_date?: string;
  notes?: string;
}

export async function createNextTerminAction(sourceId: string, input: TerminInput): Promise<DocActionResult> {
  const company_id = await requireCompanyId();
  if (!company_id) return { error: "Akun tidak terhubung ke perusahaan" };
  if (!idSchema.safeParse(sourceId).success) return { error: "Dokumen sumber tidak valid" };
  const parsed = terminInputSchema.safeParse(input);
  if (!parsed.success) return { error: "Data termin tidak valid" };
  const validInput = parsed.data;

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
    validInput.due_date || new Date(new Date(issue_date).getTime() + 30 * 86400000).toISOString().slice(0, 10);
  const number = await nextDocNumber(company_id, "invoice", issue_date);

  const title = validInput.title || "Invoice Termin";
  const docId = randomUUID();

  await db.insert(documents).values({
    id: docId,
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
    notes: validInput.notes || null,
    terms: "",
    extra: {
      payment_terms: src.extra?.payment_terms || "",
    },
  });

  await db.insert(documentItems).values({
    document_id: docId,
    description: `${title} — ${src.title} (${src.number})`,
    qty: 1,
    unit: "ls",
    unit_price: validInput.nominal,
    sort_order: 0,
  });

  revalidatePath(`/documents/${docId}`);
  revalidatePath("/documents");
  return { success: true, id: docId, number };
}
