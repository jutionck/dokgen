import {
  boolean,
  double,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

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
  stamp_duty_mode?: "auto" | "required" | "none" | null;
  header_identity_mode?: "full" | "logo_only" | null;
}

const ts = (name: string) => timestamp(name, { mode: "date" });
const money = (name: string) => double(name).default(0).notNull();
const idUuid = (name: string = "id") => varchar(name, { length: 36 }).$defaultFn(() => crypto.randomUUID());

// ---------- Better Auth core tables ----------
export const user = mysqlTable("user", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: ts("created_at").notNull().defaultNow(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

export const session = mysqlTable("session", {
  id: varchar("id", { length: 255 }).primaryKey(),
  expiresAt: ts("expires_at").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: ts("created_at").notNull().defaultNow(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = mysqlTable("account", {
  id: varchar("id", { length: 255 }).primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: varchar("user_id", { length: 255 })
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

export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 255 }).primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: ts("expires_at").notNull(),
  createdAt: ts("created_at").notNull().defaultNow(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

// ---------- Business tables ----------
export const companies = mysqlTable("companies", {
  id: idUuid("id").primaryKey(),
  name: text("name").notNull(),
  tagline: text("tagline"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  npwp: text("npwp"),
  logo_url: text("logo_url"),
  signature_url: text("signature_url"),
  bank_name: text("bank_name"),
  bank_account_number: text("bank_account_number"),
  bank_account_holder: text("bank_account_holder"),
  city: text("city"),
  signer_name: text("signer_name"),
  signer_position: text("signer_position"),
  signer_nip: text("signer_nip"),
  join_code: varchar("join_code", { length: 255 }).unique(),
  created_at: ts("created_at").notNull().defaultNow(),
});

export const companyMembers = mysqlTable(
  "company_members",
  {
    id: idUuid("id").primaryKey(),
    company_id: varchar("company_id", { length: 36 })
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    user_id: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: mysqlEnum("role", ["owner", "admin", "member"]).notNull().default("member"),
    created_at: ts("created_at").notNull().defaultNow(),
  },
  (t) => [
    unique("company_members_company_user_unique").on(t.company_id, t.user_id),
    unique("company_members_user_unique").on(t.user_id),
  ]
);

export const clients = mysqlTable("clients", {
  id: idUuid("id").primaryKey(),
  company_id: varchar("company_id", { length: 36 })
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

export const documents = mysqlTable(
  "documents",
  {
    id: idUuid("id").primaryKey(),
    company_id: varchar("company_id", { length: 36 })
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    created_by: varchar("created_by", { length: 255 }).references(() => user.id, { onDelete: "set null" }),
    client_id: varchar("client_id", { length: 36 }).references(() => clients.id, { onDelete: "set null" }),
    type: mysqlEnum("type", ["penawaran", "quotation", "invoice", "bast", "kontrak"]).notNull(),
    number: text("number").notNull(),
    title: text("title").notNull(),
    status: mysqlEnum("status", ["draft", "sent", "paid", "done", "cancelled"]).notNull().default("draft"),
    issue_date: text("issue_date").notNull(),
    due_date: text("due_date"),
    currency: text("currency").notNull().default("IDR"),
    tax_rate: double("tax_rate").default(0).notNull(),
    discount: money("discount"),
    notes: text("notes"),
    terms: text("terms"),
    extra: json("extra").$type<DocExtra>().notNull(),
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

export const documentItems = mysqlTable(
  "document_items",
  {
    id: idUuid("id").primaryKey(),
    document_id: varchar("document_id", { length: 36 })
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    qty: double("qty").default(1).notNull(),
    unit: text("unit").notNull().default("pcs"),
    unit_price: money("unit_price"),
    sort_order: int("sort_order").notNull().default(0),
  },
  (t) => [index("document_items_document_id_idx").on(t.document_id)]
);

export const emailLogs = mysqlTable(
  "email_logs",
  {
    id: idUuid("id").primaryKey(),
    document_id: varchar("document_id", { length: 36 })
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    sent_by: varchar("sent_by", { length: 255 }).references(() => user.id, { onDelete: "set null" }),
    to_email: text("to_email").notNull(),
    subject: text("subject"),
    status: mysqlEnum("status", ["sent", "failed"]).notNull(),
    error: text("error"),
    resend_id: text("resend_id"),
    sent_at: ts("sent_at").notNull().defaultNow(),
  },
  (t) => [index("email_logs_document_id_idx").on(t.document_id)]
);

export const docSequences = mysqlTable(
  "doc_sequences",
  {
    company_id: varchar("company_id", { length: 36 })
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    doc_type: varchar("doc_type", { length: 64 }).notNull(),
    period: varchar("period", { length: 32 }).notNull(),
    seq: int("seq").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.company_id, t.doc_type, t.period], name: "doc_sequences_pk" })]
);
