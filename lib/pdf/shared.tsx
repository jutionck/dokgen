import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { PageSize } from "@react-pdf/types";
import type { TemplateData } from "@/components/documents/templates/shared";
import { fmt, fmtDate, fmtNum, terbilang } from "@/components/documents/templates/shared";
import { parseScopeOfWork, parseBankAccounts } from "@/components/documents/templates/blocks";

export const pdfStyles = StyleSheet.create({
  page: {
    padding: "42 46",
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#1f2937",
    paddingBottom: 10,
    marginBottom: 14,
  },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: "flex-end" },
  companyName: { fontSize: 15, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  companyLine: { fontSize: 8.5, color: "#475569", marginBottom: 1 },
  docTitle: { fontSize: 16, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  docMeta: { fontSize: 9, color: "#475569", marginTop: 2 },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    marginTop: 8,
    textTransform: "uppercase",
  },
  text: { fontSize: 9.5, lineHeight: 1.55, marginBottom: 6 },
  bold: { fontFamily: "Helvetica-Bold" },
  gray: { color: "#64748b" },
  italic: { fontStyle: "italic", fontSize: 9 },
  table: { width: "100%", marginTop: 8, marginBottom: 8 },
  th: {
    backgroundColor: "#1f2937",
    color: "#ffffff",
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    padding: "4 6",
  },
  td: { fontSize: 8.5, padding: "3.5 6", borderBottomWidth: 1, borderBottomColor: "#cbd5e1" },
  tdRight: { fontSize: 8.5, padding: "3.5 6", textAlign: "right", borderBottomWidth: 1, borderBottomColor: "#cbd5e1" },
  tdCenter: {
    fontSize: 8.5,
    padding: "3.5 6",
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
  },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 1.5 },
  totalsBox: { width: "55%", alignSelf: "flex-end", marginTop: 6 },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1f2937",
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    padding: "4 6",
    marginTop: 4,
  },
  signature: { flexDirection: "row", marginTop: 36, marginBottom: 8 },
  sigCol: { flex: 1, alignItems: "center" },
  sigLabel: { fontSize: 9, marginBottom: 2 },
  sigPlace: { fontSize: 8, color: "#64748b", marginBottom: 24 },
  sigName: { fontSize: 9, fontFamily: "Helvetica-Bold", textDecoration: "underline", marginBottom: 2 },
  sigTitle: { fontSize: 8.5, color: "#475569" },
  infoBox: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    padding: 8,
    marginTop: 8,
    marginBottom: 6,
    fontSize: 9,
  },
  row: { flexDirection: "row" },
  col: { flex: 1 },
});

export function PdfHeader({ data }: { data: TemplateData }) {
  const { company, doc } = data;
  return (
    <View style={pdfStyles.header}>
      <View style={pdfStyles.headerLeft}>
        {data.logoDataUri ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image
            src={data.logoDataUri}
            style={{ width: 150, height: 56, objectFit: "contain", marginBottom: 4 }}
          />
        ) : null}
        <Text style={pdfStyles.companyName}>{company.name}</Text>
        {company.tagline ? <Text style={pdfStyles.companyLine}>{company.tagline}</Text> : null}
        {company.address ? <Text style={pdfStyles.companyLine}>{company.address}</Text> : null}
        <Text style={pdfStyles.companyLine}>
          {[company.phone, company.email, company.website].filter(Boolean).join("  ·  ")}
        </Text>
        {company.npwp ? <Text style={pdfStyles.companyLine}>NPWP: {company.npwp}</Text> : null}
      </View>
      <View style={pdfStyles.headerRight}>
        <Text style={pdfStyles.docTitle}>{doc.title}</Text>
        {doc.number ? <Text style={pdfStyles.docMeta}>No. {doc.number}</Text> : null}
      </View>
    </View>
  );
}

export function PdfClient({ data }: { data: TemplateData }) {
  const { client } = data;
  if (!client) return null;
  return (
    <View style={pdfStyles.text}>
      <Text style={[pdfStyles.gray, pdfStyles.bold, { fontSize: 8, textTransform: "uppercase" }]}>Kepada Yth.</Text>
      <Text style={pdfStyles.bold}>{client.company || client.name}</Text>
      {client.name && client.company ? <Text>U.p. {client.name}</Text> : null}
      {client.address ? <Text>{client.address}</Text> : null}
      {client.email ? <Text>{client.email}</Text> : null}
      {client.npwp ? <Text>NPWP: {client.npwp}</Text> : null}
    </View>
  );
}

export function PdfItemsTable({ data, showQty = true }: { data: TemplateData; showQty?: boolean }) {
  const { items, doc } = data;
  return (
    <View style={pdfStyles.table} minPresenceAhead={48}>
      <View style={[pdfStyles.row, { backgroundColor: "#1f2937" }]} wrap={false}>
        <Text style={[pdfStyles.th, { width: "4%" }]}>No</Text>
        <Text style={[pdfStyles.th, showQty ? { width: "46%" } : { width: "58%" }]}>Uraian / Deskripsi</Text>
        {showQty ? (
          <>
            <Text style={[pdfStyles.th, { width: "10%", textAlign: "center" }]}>Qty</Text>
            <Text style={[pdfStyles.th, { width: "10%", textAlign: "center" }]}>Satuan</Text>
          </>
        ) : null}
        <Text style={[pdfStyles.th, { width: "15%", textAlign: "right" }]}>Harga Satuan</Text>
        <Text style={[pdfStyles.th, { width: "15%", textAlign: "right" }]}>Jumlah</Text>
      </View>
      {items.length === 0 ? (
        <View style={pdfStyles.row}>
          <Text style={[pdfStyles.td, { width: "100%", textAlign: "center", color: "#94a3b8" }]}>
            (tidak ada rincian)
          </Text>
        </View>
      ) : null}
      {items.map((item, i) => (
        <View key={i} style={pdfStyles.row} wrap={false}>
          <Text style={[pdfStyles.td, { width: "4%" }]}>{i + 1}</Text>
          <Text style={[pdfStyles.td, showQty ? { width: "46%" } : { width: "58%" }]}>{item.description}</Text>
          {showQty ? (
            <>
              <Text style={[pdfStyles.tdCenter, { width: "10%" }]}>{fmtNum(Number(item.qty))}</Text>
              <Text style={[pdfStyles.tdCenter, { width: "10%" }]}>{item.unit}</Text>
            </>
          ) : null}
          <Text style={[pdfStyles.tdRight, { width: "15%" }]}>{fmt(Number(item.unit_price), doc.currency)}</Text>
          <Text style={[pdfStyles.tdRight, { width: "15%" }]}>
            {fmt(Number(item.qty) * Number(item.unit_price), doc.currency)}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function PdfTotals({ data }: { data: TemplateData }) {
  const { doc, totals } = data;
  return (
    <View style={pdfStyles.totalsBox} wrap={false}>
      <View style={pdfStyles.totalsRow}>
        <Text style={pdfStyles.gray}>Subtotal</Text>
        <Text>{fmt(totals.subtotal, doc.currency)}</Text>
      </View>
      {totals.discount > 0 ? (
        <View style={pdfStyles.totalsRow}>
          <Text style={pdfStyles.gray}>Diskon</Text>
          <Text>-{fmt(totals.discount, doc.currency)}</Text>
        </View>
      ) : null}
      {Number(doc.tax_rate) > 0 ? (
        <View style={pdfStyles.totalsRow}>
          <Text style={pdfStyles.gray}>PPN {fmtNum(Number(doc.tax_rate))}%</Text>
          <Text>{fmt(totals.tax, doc.currency)}</Text>
        </View>
      ) : null}
      <View style={pdfStyles.totalLine}>
        <Text>Total Tagihan</Text>
        <Text>{fmt(totals.total, doc.currency)}</Text>
      </View>
      <Text style={[pdfStyles.italic, { color: "#64748b", marginTop: 3 }]}>Terbilang: {terbilang(totals.total)}</Text>
    </View>
  );
}

export function PdfBankBlock({
  company,
  selectedBanks,
}: {
  company: TemplateData["company"];
  selectedBanks?: string[] | null;
}) {
  const accounts = parseBankAccounts(company, selectedBanks);
  if (accounts.length === 0) return null;

  return (
    <View style={pdfStyles.infoBox}>
      <Text style={[pdfStyles.bold, pdfStyles.gray, { fontSize: 8, textTransform: "uppercase", marginBottom: 4 }]}>
        Pembayaran dapat ditransfer ke
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {accounts.map((acc, idx) => (
          <View
            key={idx}
            style={{
              width: accounts.length > 1 ? "49%" : "100%",
              marginRight: accounts.length > 1 && idx % 2 === 0 ? "2%" : "0%",
              marginBottom: 4,
              borderWidth: 1,
              borderColor: "#cbd5e1",
              borderRadius: 2,
              padding: 4,
              backgroundColor: "#ffffff",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
              <Text style={[pdfStyles.gray, { fontSize: 7.5 }]}>Bank</Text>
              <Text style={[pdfStyles.bold, { color: "#1e293b", fontSize: 8 }]}>{acc.bank_name}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
              <Text style={[pdfStyles.gray, { fontSize: 7.5 }]}>No. Rekening</Text>
              <Text style={[pdfStyles.bold, { color: "#0f172a", fontSize: 8 }]}>{acc.bank_account_number}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={[pdfStyles.gray, { fontSize: 7.5 }]}>Atas Nama</Text>
              <Text style={[pdfStyles.bold, { color: "#1e293b", fontSize: 8 }]}>{acc.bank_account_holder}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function PdfSignature({
  data,
  leftLabel,
  leftName,
  leftTitle,
  rightLabel,
  rightName,
  rightTitle,
}: {
  data: TemplateData;
  leftLabel: string;
  leftName?: string | null;
  leftTitle?: string | null;
  rightLabel?: string;
  rightName?: string;
  rightTitle?: string;
}) {
  const { company, doc } = data;
  const place = company.city || "";
  const dateStr = [place, doc.issue_date ? fmtDate(doc.issue_date) : ""].filter(Boolean).join(", ");

  if (!rightLabel) {
    return (
      <View style={[pdfStyles.signature, { justifyContent: "flex-end" }]} wrap={false}>
        <View style={{ width: "45%", alignItems: "center" }}>
          <Text style={pdfStyles.sigLabel}>{leftLabel}</Text>
          {dateStr ? <Text style={pdfStyles.sigPlace}>{dateStr}</Text> : null}
          <View style={{ marginTop: 24 }}>
            <Text style={pdfStyles.sigName}>{leftName || company.signer_name || company.name}</Text>
            <Text style={pdfStyles.sigTitle}>{leftTitle || company.signer_position}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={pdfStyles.signature} wrap={false}>
      <View style={pdfStyles.sigCol}>
        <Text style={pdfStyles.sigLabel}>{leftLabel}</Text>
        {dateStr ? <Text style={pdfStyles.sigPlace}>{dateStr}</Text> : null}
        <View style={{ marginTop: 24 }}>
          <Text style={pdfStyles.sigName}>{leftName || company.signer_name || company.name}</Text>
          <Text style={pdfStyles.sigTitle}>{leftTitle || company.signer_position}</Text>
        </View>
      </View>
      <View style={pdfStyles.sigCol}>
        <Text style={pdfStyles.sigLabel}>{rightLabel}</Text>
        {dateStr ? <Text style={pdfStyles.sigPlace}>{dateStr}</Text> : null}
        <View style={{ marginTop: 24 }}>
          <Text style={pdfStyles.sigName}>{rightName || ".........................."}</Text>
          <Text style={pdfStyles.sigTitle}>{rightTitle || ".........................."}</Text>
        </View>
      </View>
    </View>
  );
}

export function PdfFormattedListText({ text }: { text?: string | null }) {
  if (!text) return null;
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  return (
    <View style={{ marginTop: 2 }}>
      {lines.map((line, idx) => {
        const numMatch = line.match(/^(\d+[\.\)])\s*(.*)/);
        if (numMatch) {
          return (
            <View key={idx} style={{ flexDirection: "row", marginBottom: 2 }}>
              <Text style={[pdfStyles.bold, { width: 16 }]}>{numMatch[1]}</Text>
              <Text style={{ flex: 1 }}>{numMatch[2]}</Text>
            </View>
          );
        }

        const bulletMatch = line.match(/^([•\-\*]|->)\s*(.*)/);
        if (bulletMatch) {
          return (
            <View key={idx} style={{ flexDirection: "row", marginBottom: 2 }}>
              <Text style={[pdfStyles.bold, { width: 12, color: "#64748b" }]}>•</Text>
              <Text style={{ flex: 1 }}>{bulletMatch[2]}</Text>
            </View>
          );
        }

        return (
          <Text key={idx} style={{ marginBottom: 2 }}>
            {line}
          </Text>
        );
      })}
    </View>
  );
}

export function PdfScopeTable({ scopeOfWork }: { scopeOfWork?: string | null }) {
  const items = parseScopeOfWork(scopeOfWork);
  if (items.length === 0) return null;

  return (
    <View style={{ marginTop: 6, marginBottom: 8 }}>
      <Text style={pdfStyles.sectionTitle} minPresenceAhead={72}>
        Lingkup Pekerjaan
      </Text>
      <View style={{ borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 2, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", backgroundColor: "#1e293b", paddingVertical: 4, paddingHorizontal: 6 }}>
          <Text style={[pdfStyles.bold, { color: "#ffffff", width: 24, textAlign: "center" }]}>No.</Text>
          <Text style={[pdfStyles.bold, { color: "#ffffff", flex: 1 }]}>Deskripsi Pekerjaan</Text>
          <Text style={[pdfStyles.bold, { color: "#ffffff", width: "35%" }]}>Keterangan</Text>
        </View>
        {items.map((item) => (
          <View
            key={item.no}
            wrap={false}
            style={{
              flexDirection: "row",
              borderTopWidth: 1,
              borderTopColor: "#e2e8f0",
              paddingVertical: 4,
              paddingHorizontal: 6,
            }}
          >
            <Text style={{ width: 24, textAlign: "center", color: "#64748b" }}>{item.no}</Text>
            <Text style={{ flex: 1, color: "#1e293b", fontWeight: "bold" }}>{item.description}</Text>
            <View style={{ width: "35%" }}>
              <PdfFormattedListText text={item.note} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function PdfTermsBlock({ terms, title = "Ketentuan Pembayaran" }: { terms?: string | null; title?: string }) {
  if (!terms) return null;
  return (
    <View style={pdfStyles.infoBox}>
      <Text style={[pdfStyles.bold, pdfStyles.gray, { fontSize: 8, textTransform: "uppercase", marginBottom: 3 }]}>
        {title}
      </Text>
      <PdfFormattedListText text={terms} />
    </View>
  );
}

export function PdfNotesBlock({ notes, title = "Catatan" }: { notes?: string | null; title?: string }) {
  if (!notes) return null;
  return (
    <View style={pdfStyles.infoBox}>
      <Text style={[pdfStyles.bold, pdfStyles.gray, { fontSize: 8, textTransform: "uppercase", marginBottom: 3 }]}>
        {title}
      </Text>
      <PdfFormattedListText text={notes} />
    </View>
  );
}

export function PdfDocumentShell({
  data,
  children,
  paperSize = "A4",
}: {
  data: TemplateData;
  children?: React.ReactNode;
  paperSize?: PageSize;
}) {
  return (
    <Document title={`${data.doc.title} - ${data.doc.number}`} author={data.company.name} creator="Dokgen">
      <Page size={paperSize} style={pdfStyles.page}>
        <PdfHeader data={data} />
        {children}
      </Page>
    </Document>
  );
}
