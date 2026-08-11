import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional();
const normalizeClientText = (value: string) =>
  value
    .normalize("NFC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
const clientText = (max: number) => z.string().transform(normalizeClientText).pipe(z.string().max(max));
const optionalClientText = (max: number) => clientText(max).optional();
const dateString = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]);

export const idSchema = z.string().uuid();

export const clientInputSchema = z.object({
  name: clientText(500).pipe(z.string().min(1)),
  company: optionalClientText(500),
  address: optionalClientText(5_000),
  phone: optionalClientText(100),
  email: clientText(320)
    .pipe(z.union([z.literal(""), z.string().email()]))
    .optional(),
  npwp: optionalClientText(100),
  pic: optionalClientText(500),
  notes: optionalClientText(10_000),
});

export const companyInputSchema = z.object({
  name: z.string().trim().min(1).max(500),
  tagline: optionalText(2_000),
  address: optionalText(5_000),
  phone: optionalText(100),
  email: z.union([z.literal(""), z.string().trim().email().max(320)]).optional(),
  website: optionalText(2_000),
  npwp: optionalText(100),
  bank_name: optionalText(5_000),
  bank_account_number: optionalText(5_000),
  bank_account_holder: optionalText(5_000),
  city: optionalText(500),
  signer_name: optionalText(500),
  signer_position: optionalText(500),
  signer_nip: optionalText(100),
});

const documentItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().trim().min(1).max(5_000),
  qty: z.number().finite().positive().max(1_000_000_000),
  unit: z.string().trim().min(1).max(100),
  unit_price: z.number().finite().nonnegative().max(1_000_000_000_000_000),
  sort_order: z.number().int().nonnegative().optional(),
});

const docExtraSchema = z
  .object({
    intro: z.string().max(20_000).nullable().optional(),
    scope_of_work: z.string().max(50_000).nullable().optional(),
    validity_days: z.number().int().nonnegative().max(3_650).nullable().optional(),
    payment_terms: z.string().max(20_000).nullable().optional(),
    po_number: z.string().max(500).nullable().optional(),
    project_title: z.string().max(2_000).nullable().optional(),
    work_description: z.string().max(50_000).nullable().optional(),
    start_date: z.string().max(100).nullable().optional(),
    end_date: z.string().max(100).nullable().optional(),
    location: z.string().max(5_000).nullable().optional(),
    contract_ref: z.string().max(2_000).nullable().optional(),
    duration_text: z.string().max(2_000).nullable().optional(),
    clauses: z.string().max(50_000).nullable().optional(),
    result_text: z.string().max(50_000).nullable().optional(),
    selected_banks: z.array(z.string().max(500)).max(20).nullable().optional(),
  })
  .strict();

export const documentInputSchema = z.object({
  type: z.enum(["penawaran", "quotation", "invoice", "bast", "kontrak"]),
  title: z.string().trim().min(1).max(2_000),
  client_id: z.union([z.literal(""), z.string().uuid()]).optional(),
  status: z.enum(["draft", "sent", "paid", "done", "cancelled"]),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  due_date: dateString.optional(),
  currency: z.string().trim().min(3).max(10),
  tax_rate: z.number().finite().min(0).max(100),
  discount: z.number().finite().nonnegative().max(1_000_000_000_000_000),
  notes: optionalText(50_000),
  terms: optionalText(50_000),
  extra: docExtraSchema.optional(),
  items: z.array(documentItemSchema).max(500),
});

export const documentStatusSchema = z.enum(["draft", "sent", "paid", "done", "cancelled"]);

export const terminInputSchema = z.object({
  nominal: z.number().finite().positive().max(1_000_000_000_000_000),
  title: optionalText(2_000),
  due_date: dateString.optional(),
  notes: optionalText(50_000),
});
