import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

interface DocExtra {
  intro?: string | null;
  scope_of_work?: string | null;
  validity_days?: number | null;
  payment_terms?: string | null;
  po_number?: string | null;
  project_title?: string | null;
  work_description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  location?: string | null;
  contract_ref?: string | null;
  duration_text?: string | null;
  clauses?: string | null;
  result_text?: string | null;
  selected_banks?: string[] | null;
}

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });
const money = (name: string) => doublePrecision(name).default(0).notNull();

// ---------- Better Auth core tables ----------
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: ts("created_at").notNull().defaultNow(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: ts("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: ts("created_at").notNull().defaultNow(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: ts("access_token_expires_at"),
  refreshTokenExpiresAt: ts("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: ts("created_at").notNull().defaultNow(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: ts("expires_at").notNull(),
  createdAt: ts("created_at").notNull().defaultNow(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

// ---------- Business tables ----------
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  tagline: text("tagline"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  npwp: text("npwp"),
  logo_url: text("logo_url"),
  bank_name: text("bank_name"),
  bank_account_number: text("bank_account_number"),
  bank_account_holder: text("bank_account_holder"),
  city: text("city"),
  signer_name: text("signer_name"),
  signer_position: text("signer_position"),
  signer_nip: text("signer_nip"),
  join_code: text("join_code").unique(),
  created_at: ts("created_at").notNull().defaultNow(),
});

export const companyMembers = pgTable(
  "company_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company_id: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["owner", "admin", "member"] }).notNull().default("member"),
    created_at: ts("created_at").notNull().defaultNow(),
  },
  (t) => [
    unique("company_members_company_user_unique").on(t.company_id, t.user_id),
    unique("company_members_user_unique").on(t.user_id),
  ]
);

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  company_id: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  company: text("company"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  npwp: text("npwp"),
  pic: text("pic"),
  notes: text("notes"),
  created_at: ts("created_at").notNull().defaultNow(),
});

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company_id: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    created_by: text("created_by").references(() => user.id, { onDelete: "set null" }),
    client_id: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
    type: text("type", {
      enum: ["penawaran", "quotation", "invoice", "bast", "kontrak"],
    }).notNull(),
    number: text("number").notNull(),
    title: text("title").notNull(),
    status: text("status", {
      enum: ["draft", "sent", "paid", "done", "cancelled"],
    })
      .notNull()
      .default("draft"),
    issue_date: text("issue_date").notNull(),
    due_date: text("due_date"),
    currency: text("currency").notNull().default("IDR"),
    tax_rate: doublePrecision("tax_rate").default(0).notNull(),
    discount: money("discount"),
    notes: text("notes"),
    terms: text("terms"),
    extra: jsonb("extra").$type<DocExtra>().notNull().default(sql`'{}'::jsonb`),
    created_at: ts("created_at").notNull().defaultNow(),
    updated_at: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("documents_company_id_idx").on(t.company_id),
    index("documents_client_id_idx").on(t.client_id),
    index("documents_type_idx").on(t.type),
    index("documents_created_at_idx").on(t.created_at),
  ]
);

export const documentItems = pgTable(
  "document_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    document_id: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    qty: doublePrecision("qty").default(1).notNull(),
    unit: text("unit").notNull().default("pcs"),
    unit_price: money("unit_price"),
    sort_order: integer("sort_order").notNull().default(0),
  },
  (t) => [index("document_items_document_id_idx").on(t.document_id)]
);

export const emailLogs = pgTable(
  "email_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    document_id: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    sent_by: text("sent_by").references(() => user.id, { onDelete: "set null" }),
    to_email: text("to_email").notNull(),
    subject: text("subject"),
    status: text("status", { enum: ["sent", "failed"] }).notNull(),
    error: text("error"),
    resend_id: text("resend_id"),
    sent_at: ts("sent_at").notNull().defaultNow(),
  },
  (t) => [index("email_logs_document_id_idx").on(t.document_id)]
);

export const docSequences = pgTable(
  "doc_sequences",
  {
    company_id: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    doc_type: text("doc_type").notNull(),
    period: text("period").notNull(),
    seq: integer("seq").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.company_id, t.doc_type, t.period], name: "doc_sequences_pk" }),
  ]
);