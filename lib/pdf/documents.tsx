import { View, Text } from "@react-pdf/renderer";
import type { PageSize } from "@react-pdf/types";
import type { TemplateData } from "@/components/documents/templates/shared";
import { fmtDate, fmtDateAfterDays, fmtDateLong } from "@/components/documents/templates/shared";
import {
  pdfStyles,
  PdfClient,
  PdfItemsTable,
  PdfSignature,
  PdfTotals,
  PdfDocumentShell,
  PdfTermsBlock,
  PdfNotesBlock,
  PdfScopeTable,
  PdfBankBlock,
} from "./shared";

function PartyBox({ party, title }: { party: string; title: string }) {
  return (
    <View style={pdfStyles.infoBox}>
      <Text style={pdfStyles.bold}>{party}</Text>
      <Text>{title}</Text>
    </View>
  );
}

export function PenawaranPdf({ data, paperSize }: { data: TemplateData; paperSize?: PageSize }) {
  const { company, doc, client } = data;
  const extra = doc.extra;
  const validityDays = Number(extra.validity_days) || 14;
  return (
    <PdfDocumentShell data={data} paperSize={paperSize}>
      <Text style={[pdfStyles.text, { marginTop: 4 }]}>Hal: {extra.project_title || doc.title}</Text>
      <PdfClient data={data} />
      <Text style={pdfStyles.text}>Dengan hormat,</Text>
      <Text style={pdfStyles.text}>
        Bersama ini kami sampaikan penawaran jasa {extra.project_title || "sesuai kebutuhan Anda"} kepada{" "}
        {client?.company || client?.name || "calon klien"}. Adapun rincian penawaran kami adalah sebagai berikut:
      </Text>
      {extra.intro ? <Text style={pdfStyles.text}>{extra.intro}</Text> : null}
      {extra.scope_of_work ? <PdfScopeTable scopeOfWork={extra.scope_of_work} /> : null}
      <Text style={pdfStyles.sectionTitle} minPresenceAhead={72}>
        Rincian Biaya Penawaran
      </Text>
      <PdfItemsTable data={data} />
      <PdfTotals data={data} />
      <View style={pdfStyles.infoBox}>
        <Text>
          <Text style={pdfStyles.gray}>Masa Berlaku Penawaran: </Text>
          {validityDays} hari (s.d. {fmtDateAfterDays(doc.issue_date, validityDays)})
        </Text>
      </View>
      {extra.payment_terms ? <PdfTermsBlock terms={extra.payment_terms} /> : null}
      {doc.notes ? <PdfNotesBlock notes={doc.notes} /> : null}
      <View wrap={false}>
        <Text style={pdfStyles.text}>
          Demikian penawaran ini kami sampaikan. Apabila Bapak/Ibu berkenan, kami siap membahas lebih lanjut dan
          menunggu balasan positif dari pihak {client?.company || client?.name || "Bapak/Ibu"}.
        </Text>
        <Text style={pdfStyles.text}>
          <Text style={pdfStyles.bold}>Terima kasih atas kepercayaan dan kerjasamanya.</Text>
        </Text>
        <PdfSignature
          data={data}
          leftLabel={`Hormat kami,\n${company.name}`}
          leftName={company.signer_name}
          leftTitle={company.signer_position}
        />
      </View>
    </PdfDocumentShell>
  );
}

export function QuotationPdf({ data, paperSize }: { data: TemplateData; paperSize?: PageSize }) {
  const { company, doc, client } = data;
  const extra = doc.extra;
  const validityDays = Number(extra.validity_days) || 14;
  return (
    <PdfDocumentShell data={data} paperSize={paperSize}>
      <View style={[pdfStyles.row, { marginBottom: 6 }]}>
        <View style={pdfStyles.col}>
          <PdfClient data={data} />
        </View>
        <View style={pdfStyles.col}>
          <Text>Kepada: {client?.name || "-"}</Text>
          <Text>Tanggal: {fmtDate(doc.issue_date)}</Text>
          {extra.po_number ? <Text>No. PO: {extra.po_number}</Text> : null}
        </View>
      </View>
      {extra.intro ? <Text style={pdfStyles.text}>{extra.intro}</Text> : null}
      {extra.scope_of_work ? <PdfScopeTable scopeOfWork={extra.scope_of_work} /> : null}
      <PdfItemsTable data={data} />
      <PdfTotals data={data} />
      <View style={pdfStyles.infoBox}>
        <Text>
          <Text style={pdfStyles.gray}>Masa berlaku penawaran:</Text> {validityDays} hari, berakhir{" "}
          {fmtDateAfterDays(doc.issue_date, validityDays)}.
        </Text>
      </View>
      {extra.payment_terms ? <PdfTermsBlock terms={extra.payment_terms} /> : null}
      {doc.notes ? <PdfNotesBlock notes={doc.notes} /> : null}
      {company.bank_name ? (
        <View style={pdfStyles.infoBox}>
          <Text style={[pdfStyles.bold, pdfStyles.gray, { fontSize: 8, textTransform: "uppercase", marginBottom: 3 }]}>
            Pembayaran dapat ditransfer ke
          </Text>
          <Text style={pdfStyles.bold}>
            {company.bank_name} a.n. {company.bank_account_holder}
          </Text>
          <Text style={pdfStyles.bold}>No. Rekening: {company.bank_account_number}</Text>
        </View>
      ) : null}
      <PdfSignature
        data={data}
        leftLabel={`Hormat kami,\n${company.name}`}
        leftName={company.signer_name}
        leftTitle={company.signer_position}
      />
    </PdfDocumentShell>
  );
}

export function InvoicePdf({ data, paperSize }: { data: TemplateData; paperSize?: PageSize }) {
  const { company, doc } = data;
  const extra = doc.extra;
  return (
    <PdfDocumentShell data={data} paperSize={paperSize}>
      <View style={[pdfStyles.row, { marginBottom: 6 }]}>
        <View style={pdfStyles.col}>
          <PdfClient data={data} />
        </View>
        <View style={pdfStyles.col}>
          {extra.po_number ? <Text>No. PO / Referensi: {extra.po_number}</Text> : null}
          <Text>Tanggal Invoice: {fmtDate(doc.issue_date)}</Text>
          {doc.due_date ? <Text>Jatuh Tempo: {fmtDate(doc.due_date)}</Text> : null}
          <Text style={[pdfStyles.bold, { color: doc.status === "paid" ? "#047857" : "#b45309", marginTop: 4 }]}>
            {doc.status === "paid" ? "LUNAS" : doc.status === "cancelled" ? "DIBATALKAN" : "BELUM DIBAYAR"}
          </Text>
        </View>
      </View>
      <PdfItemsTable data={data} />
      <PdfTotals data={data} />
      <PdfBankBlock company={company} selectedBanks={extra.selected_banks} />
      {extra.payment_terms ? <PdfTermsBlock terms={extra.payment_terms} /> : null}
      {doc.notes ? <PdfNotesBlock notes={doc.notes} /> : null}
      <PdfSignature
        data={data}
        leftLabel={`Hormat kami,\n${company.name}`}
        leftName={company.signer_name}
        leftTitle={company.signer_position}
      />
    </PdfDocumentShell>
  );
}

export function BastPdf({ data, paperSize }: { data: TemplateData; paperSize?: PageSize }) {
  const { company, doc, client } = data;
  const extra = doc.extra;
  return (
    <PdfDocumentShell data={data} paperSize={paperSize}>
      <Text style={[pdfStyles.text, { textAlign: "center", fontStyle: "italic", fontWeight: "bold" }]}>
        Nomor: {doc.number}
      </Text>
      <Text style={pdfStyles.text}>
        Pada hari ini, {fmtDateLong(doc.issue_date)}, bertempat di {extra.location || company.city || "-"}, yang
        bertanda tangan di bawah ini:
      </Text>
      <PartyBox
        party="PIHAK PERTAMA (PENYEDIA JASA)"
        title={`${company.signer_name || company.name}\n${company.signer_position || "Direktur"}\n${company.name}\n${company.address}`}
      />
      <PartyBox
        party="PIHAK KEDUA (PENERIMA)"
        title={`${client?.name || "-"}\n${client?.pic || "-"}\n${client?.company || "-"}\n${client?.address || "-"}`}
      />
      <Text style={pdfStyles.text}>Dengan ini menyatakan bahwa pekerjaan dengan rincian sebagai berikut:</Text>
      {extra.work_description ? (
        <View>
          <Text style={pdfStyles.sectionTitle}>Uraian Pekerjaan</Text>
          <Text style={pdfStyles.text}>{extra.work_description}</Text>
        </View>
      ) : null}
      <PdfItemsTable data={data} />
      <PdfTotals data={data} />
      {extra.start_date || extra.end_date ? (
        <View style={[pdfStyles.row, { marginBottom: 6 }]}>
          <View style={pdfStyles.col}>
            <Text style={pdfStyles.gray}>Tanggal Mulai</Text>
            <Text style={pdfStyles.bold}>{fmtDate(extra.start_date)}</Text>
          </View>
          <View style={pdfStyles.col}>
            <Text style={pdfStyles.gray}>Tanggal Selesai</Text>
            <Text style={pdfStyles.bold}>{fmtDate(extra.end_date)}</Text>
          </View>
        </View>
      ) : null}
      {extra.contract_ref ? (
        <Text style={pdfStyles.text}>
          <Text style={pdfStyles.gray}>Referensi Kontrak / SPK: </Text>
          {extra.contract_ref}
        </Text>
      ) : null}
      <Text style={pdfStyles.text}>
        {extra.result_text ||
          "Bahwa seluruh pekerjaan tersebut telah diselesaikan dengan baik dan telah diterima oleh PIHAK KEDUA. Dengan diserahkannya pekerjaan tersebut, maka dianggap selesainya seluruh kewajiban PIHAK PERTAMA kepada PIHAK KEDUA."}
      </Text>
      <Text style={[pdfStyles.text, { fontWeight: "bold" }]}>
        Demikian berita acara ini dibuat dalam rangkap dua (2) dengan kekuatan hukum yang sama untuk dipergunakan
        sebagaimana mestinya.
      </Text>
      <PdfSignature
        data={data}
        leftLabel="PIHAK PERTAMA,"
        leftName={company.signer_name}
        leftTitle={company.signer_position}
        rightLabel="PIHAK KEDUA,"
        rightName={client?.name ?? undefined}
        rightTitle={client?.pic || undefined}
      />
    </PdfDocumentShell>
  );
}

export function KontrakPdf({ data, paperSize }: { data: TemplateData; paperSize?: PageSize }) {
  const { company, doc, client } = data;
  const extra = doc.extra;
  const city = extra.location || company.city || "-";
  return (
    <PdfDocumentShell data={data} paperSize={paperSize}>
      <Text style={[pdfStyles.text, { textAlign: "center", fontStyle: "italic", fontWeight: "bold" }]}>
        Nomor: {doc.number}
      </Text>
      <Text style={pdfStyles.text}>
        Pada hari ini, {fmtDate(doc.issue_date)}, bertempat di {city}, yang bertanda tangan di bawah ini:
      </Text>
      <View style={pdfStyles.text}>
        <Text>
          <Text style={pdfStyles.bold}>Nama</Text> : {company.signer_name || company.name}
        </Text>
        <Text>
          <Text style={pdfStyles.bold}>Jabatan</Text> : {company.signer_position || "Direktur"}
        </Text>
        <Text>
          <Text style={pdfStyles.bold}>Perusahaan</Text> : {company.name}, berkedudukan di {company.city}
        </Text>
        <Text>
          <Text style={pdfStyles.bold}>Alamat</Text> : {company.address}
        </Text>
        <Text>
          <Text style={pdfStyles.bold}>Telepon/Email</Text> : {company.phone || "-"} / {company.email || "-"}
        </Text>
        <Text style={{ marginTop: 4 }}>
          Selanjutnya disebut <Text style={pdfStyles.bold}>PIHAK PERTAMA</Text>.
        </Text>
      </View>
      <View style={[pdfStyles.text, { marginTop: 4 }]}>
        <Text>
          <Text style={pdfStyles.bold}>Nama</Text> : {client?.name || "-"}
        </Text>
        <Text>
          <Text style={pdfStyles.bold}>Jabatan</Text> : {client?.pic || "-"}
        </Text>
        <Text>
          <Text style={pdfStyles.bold}>Perusahaan</Text> : {client?.company || "-"}
        </Text>
        <Text>
          <Text style={pdfStyles.bold}>Alamat</Text> : {client?.address || "-"}
        </Text>
        <Text>
          <Text style={pdfStyles.bold}>Telepon/Email</Text> : {client?.phone || "-"} / {client?.email || "-"}
        </Text>
        <Text style={{ marginTop: 4 }}>
          Selanjutnya disebut <Text style={pdfStyles.bold}>PIHAK KEDUA</Text>.
        </Text>
      </View>
      <Text style={[pdfStyles.text, { marginTop: 8 }]}>
        PIHAK PERTAMA dan PIHAK KEDUA secara bersama-sama disebut <Text style={pdfStyles.bold}>PARA PIHAK</Text>,
        terlebih dahulu menerangkan bahwa kedua belah pihak sepakat untuk mengikatkan diri dalam Perjanjian Kerja dengan
        ketentuan sebagai berikut:
      </Text>

      <PasalPdf no="Pasal 1" title="Ruang Lingkup Pekerjaan">
        {extra.project_title ? (
          <Text style={pdfStyles.text}>
            PIHAK PERTAMA menerima penunjukan dari PIHAK KEDUA untuk melaksanakan pekerjaan{" "}
            <Text style={pdfStyles.bold}>{extra.project_title}</Text>
            {extra.scope_of_work ? "," : "."}
          </Text>
        ) : null}
        {extra.scope_of_work ? <Text style={pdfStyles.text}>{extra.scope_of_work}</Text> : null}
        {extra.work_description ? <Text style={pdfStyles.text}>{extra.work_description}</Text> : null}
      </PasalPdf>
      <PasalPdf no="Pasal 2" title="Jangka Waktu Pelaksanaan">
        <Text style={pdfStyles.text}>
          Pekerjaan dilaksanakan mulai <Text style={pdfStyles.bold}>{fmtDate(extra.start_date)}</Text> sampai dengan{" "}
          <Text style={pdfStyles.bold}>{fmtDate(extra.end_date)}</Text>
          {extra.duration_text ? ` (${extra.duration_text})` : ""}, atau sesuai kesepakatan bersama yang dituangkan
          dalam addendum.
        </Text>
      </PasalPdf>
      <PasalPdf no="Pasal 3" title="Nilai Pekerjaan">
        <PdfItemsTable data={data} />
        <PdfTotals data={data} />
      </PasalPdf>
      <PasalPdf no="Pasal 4" title="Cara Pembayaran">
        <Text style={pdfStyles.text}>
          {extra.payment_terms ||
            "Pembayaran dilakukan secara bertahap sesuai kesepakatan PARA PIHAK, melalui transfer bank ke rekening PIHAK PERTAMA."}
        </Text>
        {company.bank_name ? (
          <Text style={pdfStyles.text}>
            Rekening: {company.bank_name} a.n. {company.bank_account_holder} (No. {company.bank_account_number})
          </Text>
        ) : null}
      </PasalPdf>
      {extra.clauses ? (
        <PasalPdf no="Pasal 5" title="Ketentuan Lain">
          <Text style={pdfStyles.text}>{extra.clauses}</Text>
        </PasalPdf>
      ) : null}
      <PasalPdf no={extra.clauses ? "Pasal 6" : "Pasal 5"} title="Penutup">
        <Text style={pdfStyles.text}>
          Hal-hal yang belum diatur dalam perjanjian ini akan diatur kemudian atas kesepakatan PARA PIHAK. Perjanjian
          ini dibuat dan ditandatangani dalam rangkap dua (2) dengan kekuatan hukum yang sama.
        </Text>
      </PasalPdf>

      <PdfSignature
        data={data}
        leftLabel="PIHAK PERTAMA,"
        leftName={company.signer_name}
        leftTitle={company.signer_position}
        rightLabel="PIHAK KEDUA,"
        rightName={client?.name ?? undefined}
        rightTitle={client?.pic || undefined}
      />
    </PdfDocumentShell>
  );
}

function PasalPdf({ no, title, children }: { no: string; title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={[pdfStyles.bold, { fontSize: 9.5, marginTop: 6 }]}>
        {no}. {title}
      </Text>
      <View>{children}</View>
    </View>
  );
}

export function PdfRenderer({ data, paperSize }: { data: TemplateData; paperSize?: PageSize }) {
  switch (data.doc.type) {
    case "penawaran":
      return <PenawaranPdf data={data} paperSize={paperSize} />;
    case "quotation":
      return <QuotationPdf data={data} paperSize={paperSize} />;
    case "invoice":
      return <InvoicePdf data={data} paperSize={paperSize} />;
    case "bast":
      return <BastPdf data={data} paperSize={paperSize} />;
    case "kontrak":
      return <KontrakPdf data={data} paperSize={paperSize} />;
    default:
      return <PdfDocumentShell data={data} paperSize={paperSize} />;
  }
}
