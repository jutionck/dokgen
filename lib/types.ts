export type DocType = "penawaran" | "quotation" | "invoice" | "bast" | "kontrak";
export type DocStatus = "draft" | "sent" | "paid" | "done" | "cancelled";

export const DOC_TYPES: Record<DocType, { label: string; code: string; defaultTitle: string }> = {
  penawaran: { label: "Surat Penawaran", code: "SP", defaultTitle: "Surat Penawaran" },
  quotation: { label: "Quotation", code: "QUO", defaultTitle: "Quotation" },
  invoice: { label: "Invoice", code: "INV", defaultTitle: "Invoice" },
  bast: { label: "Berita Acara Serah Terima", code: "BAST", defaultTitle: "Berita Acara Serah Terima" },
  kontrak: { label: "Kontrak / SPK", code: "SPK", defaultTitle: "Surat Perjanjian Kerja (SPK)" },
};

export const DOC_STATUS: Record<DocStatus, { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "secondary" },
  sent: { label: "Terkirim", tone: "info" },
  paid: { label: "Lunas", tone: "success" },
  done: { label: "Selesai", tone: "success" },
  cancelled: { label: "Batal", tone: "destructive" },
};

export interface Company {
  id: string;
  name: string;
  tagline?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  npwp?: string | null;
  logo_url?: string | null;
  signature_url?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_holder?: string | null;
  city?: string | null;
  signer_name?: string | null;
  signer_position?: string | null;
  signer_nip?: string | null;
  join_code?: string | null;
  created_at?: string | Date;
}

export interface Client {
  id: string;
  company_id: string;
  name: string;
  company?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  npwp?: string | null;
  pic?: string | null;
  notes?: string | null;
  created_at?: string | Date;
}

export interface DocumentItem {
  id?: string;
  description: string;
  qty: number;
  unit: string;
  unit_price: number;
  sort_order?: number;
}

export interface DocExtra {
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

export interface DocRecord {
  id: string;
  company_id: string;
  created_by?: string | null;
  client_id?: string | null;
  type: DocType;
  number: string;
  title: string;
  status: DocStatus;
  issue_date: string;
  due_date?: string | null;
  currency: string;
  tax_rate: number;
  discount: number;
  notes?: string | null;
  terms?: string | null;
  extra: DocExtra;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface DocWithRelations extends DocRecord {
  items: DocumentItem[];
  client?: Client | null;
}

export interface TeamMember {
  id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  email?: string;
  created_at?: string | Date;
}

export interface EmailLog {
  id: string;
  document_id: string;
  to_email: string;
  subject?: string | null;
  status: "sent" | "failed";
  error?: string | null;
  sent_at?: string | Date;
}
