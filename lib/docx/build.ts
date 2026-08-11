import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  ImageRun,
  type IParagraphOptions,
  type IRunOptions,
} from "docx";
import type { TemplateData } from "@/components/documents/templates/shared";
import {
  fmt,
  fmtDate,
  fmtDateAfterDays,
  fmtDateLong,
  fmtNum,
  terbilang,
} from "@/components/documents/templates/shared";
import { parseScopeOfWork, parseBankAccounts } from "@/components/documents/templates/blocks";
import { parseLogoDataUri, fitSize } from "@/lib/documents/logo";
import { DOCUMENT_GENERATED_NOTICE } from "@/lib/documents/branding";

const FONT = "Helvetica";
const DEFAULT_PAGE = { width: 11906, height: 16838 }; // A4 (twips)

function run(text: string, opts: IRunOptions = {}): TextRun {
  return new TextRun({ text, font: FONT, size: 20, ...opts });
}

/**
 * Render teks multi-baris sebagai run dengan line break yang benar.
 * `\n` mentah di dalam <w:t> tidak dikenali Word sebagai baris baru.
 */
function ml(text: string, opts: IRunOptions = {}): (TextRun | string)[] {
  const lines = text.split("\n");
  const runs: (TextRun | string)[] = [];
  lines.forEach((line, i) => {
    if (i > 0) runs.push(run("", { ...opts, break: 1 }));
    runs.push(line);
  });
  return runs;
}

function p(children: (TextRun | string)[], opts: IParagraphOptions = {}): Paragraph {
  return new Paragraph({
    children: children.map((c) => (typeof c === "string" ? run(c) : c)),
    spacing: { after: 120, line: 276 },
    ...opts,
  });
}

function title(text: string): Paragraph {
  return p([run(text, { bold: true, size: 30 })], {
    alignment: AlignmentType.RIGHT,
    spacing: { after: 40 },
  });
}

function h3(text: string): Paragraph {
  return p([run(text.toUpperCase(), { bold: true, size: 19 })], { spacing: { before: 200, after: 100 } });
}

function generatedFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: {
          top: { color: "CBD5E1", style: BorderStyle.SINGLE, size: 4, space: 4 },
        },
        children: [run(DOCUMENT_GENERATED_NOTICE, { color: "94A3B8", size: 15 })],
        spacing: { before: 80, after: 0 },
      }),
    ],
  });
}

function cell(
  text: string,
  opts: {
    bold?: boolean;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    fill?: string;
    color?: string;
  } = {}
): TableCell {
  return new TableCell({
    width: { size: 100 / 6, type: WidthType.PERCENTAGE },
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [
      new Paragraph({
        alignment: opts.align || AlignmentType.LEFT,
        children: [run(text, { bold: opts.bold, color: opts.color })],
        spacing: { after: 0 },
      }),
    ],
  });
}

function itemsTable(data: TemplateData, showQty = true): Table {
  const { items, doc } = data;
  const head = [
    cell("No", { bold: true, fill: "1f2937", color: "ffffff", align: AlignmentType.CENTER }),
    cell("Uraian", { bold: true, fill: "1f2937", color: "ffffff" }),
    ...(showQty
      ? [
          cell("Qty", { bold: true, fill: "1f2937", color: "ffffff", align: AlignmentType.CENTER }),
          cell("Satuan", { bold: true, fill: "1f2937", color: "ffffff", align: AlignmentType.CENTER }),
        ]
      : []),
    cell("Harga Satuan", { bold: true, fill: "1f2937", color: "ffffff", align: AlignmentType.RIGHT }),
    cell("Jumlah", { bold: true, fill: "1f2937", color: "ffffff", align: AlignmentType.RIGHT }),
  ];
  const body = items.map((item, i) => [
    cell(String(i + 1), { align: AlignmentType.CENTER }),
    cell(item.description),
    ...(showQty
      ? [
          cell(fmtNum(Number(item.qty)), { align: AlignmentType.CENTER }),
          cell(item.unit, { align: AlignmentType.CENTER }),
        ]
      : []),
    cell(fmt(Number(item.unit_price), doc.currency), { align: AlignmentType.RIGHT }),
    cell(fmt(Number(item.qty) * Number(item.unit_price), doc.currency), { align: AlignmentType.RIGHT }),
  ]);
  if (body.length === 0) {
    body.push([cell("(tidak ada rincian)", { align: AlignmentType.CENTER })]);
  }

  const borders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "94a3b8" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "94a3b8" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "94a3b8" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "94a3b8" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "cbd5e1" },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "cbd5e1" },
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders,
    rows: [
      new TableRow({ tableHeader: true, children: head }),
      ...body.map((cells) => new TableRow({ children: cells })),
    ],
  });
}

function totalsBlock(data: TemplateData): Paragraph[] {
  const { doc, totals } = data;
  const lines: Paragraph[] = [];
  const row = (label: string, value: string, opts: { bold?: boolean; fill?: string; color?: string } = {}) =>
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [run(`${label.padEnd(28, " ")}`, opts), run(value, opts)],
      spacing: { after: 40 },
    });
  lines.push(row("Subtotal", fmt(totals.subtotal, doc.currency)));
  if (totals.discount > 0) lines.push(row("Diskon", `-${fmt(totals.discount, doc.currency)}`));
  if (Number(doc.tax_rate) > 0) lines.push(row(`PPN ${fmtNum(Number(doc.tax_rate))}%`, fmt(totals.tax, doc.currency)));
  lines.push(row("Total", fmt(totals.total, doc.currency), { bold: true }));
  lines.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [run(`Terbilang: ${terbilang(totals.total)}`, { italics: true, size: 18, color: "64748b" })],
      spacing: { after: 200 },
    })
  );
  return lines;
}

function signatureBlock(data: TemplateData, left: string[], right?: string[]): Paragraph[] {
  const { company, doc } = data;
  const place = company.city || "";
  const dateLine = [place, doc.issue_date ? fmtDate(doc.issue_date) : ""].filter(Boolean).join(", ");
  const signature = parseLogoDataUri(data.signatureDataUri);
  const signatureSize = signature ? fitSize(signature.width, signature.height, 120, 48) : null;

  const col = (
    lines: string[],
    align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.RIGHT,
    includeSignature = false
  ) => [
    p([run(lines[0], { bold: true })], { alignment: align, spacing: { after: 20 } }),
    ...(dateLine
      ? [
          p([run(dateLine, { size: 17, color: "64748b" })], {
            alignment: align,
            spacing: { after: includeSignature && signature ? 40 : 240 },
          }),
        ]
      : []),
    ...(includeSignature && signature && signatureSize
      ? [
          new Paragraph({
            alignment: align,
            children: [
              new ImageRun({
                type: signature.type,
                data: signature.data,
                transformation: signatureSize,
              }),
            ],
            spacing: { after: 20 },
          }),
        ]
      : []),
    p([run(lines[1] || "", { bold: true, underline: {} })], { alignment: align, spacing: { after: 20 } }),
    p([run(lines[2] || "", { size: 17, color: "475569" })], { alignment: align, spacing: { after: 0 } }),
  ];

  if (!right) {
    return [new Paragraph({ spacing: { before: 240 }, children: [] }), ...col(left, AlignmentType.RIGHT, true)];
  }

  return [
    new Paragraph({ spacing: { before: 240 }, children: [] }),
    ...col(left, AlignmentType.LEFT, true),
    new Paragraph({ spacing: { before: 160 }, children: [] }),
    ...col(right, AlignmentType.RIGHT),
  ];
}

function formattedListDocx(title: string, text?: string | null): Paragraph[] {
  if (!text) return [];
  const res: Paragraph[] = [h3(title)];
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  lines.forEach((line) => {
    res.push(p([run(line)], { spacing: { after: 40 } }));
  });
  return res;
}

function header(data: TemplateData): Paragraph[] {
  const { company, doc } = data;
  const logo = parseLogoDataUri(data.logoDataUri);
  const logoParagraph = logo
    ? new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 80 },
        children: [
          new ImageRun({
            type: logo.type,
            data: logo.data,
            transformation: fitSize(logo.width, logo.height, 160, 60),
          }),
        ],
      })
    : null;

  return [
    ...(logoParagraph ? [logoParagraph] : []),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [run(company.name, { bold: true, size: 30 })],
      spacing: { after: 40 },
    }),
    ...(company.tagline ? [p([run(company.tagline, { italics: true, size: 17, color: "475569" })])] : []),
    ...(company.address ? [p([run(company.address, { size: 17, color: "475569" })], { spacing: { after: 20 } })] : []),
    ...([company.phone, company.email, company.website].filter(Boolean).length
      ? [
          p(
            [
              run([company.phone, company.email, company.website].filter(Boolean).join("  ·  "), {
                size: 17,
                color: "475569",
              }),
            ],
            { spacing: { after: 20 } }
          ),
        ]
      : []),
    ...(company.npwp
      ? [p([run(`NPWP: ${company.npwp}`, { size: 17, color: "64748b" })], { spacing: { after: 20 } })]
      : []),
    title(doc.title),
    ...(doc.number
      ? [
          p([run(`No. ${doc.number}`, { bold: true, size: 20 })], {
            alignment: AlignmentType.RIGHT,
            spacing: { after: 120 },
          }),
        ]
      : []),
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "1f2937" } },
      spacing: { before: 120, after: 240 },
      children: [],
    }),
  ];
}

function clientBlock(data: TemplateData): Paragraph[] {
  const { client } = data;
  if (!client) return [];
  return [
    p([run("Kepada Yth.", { bold: true, size: 17, color: "64748b" })], { spacing: { after: 20 } }),
    p([run(client.company || client.name, { bold: true })]),
    ...(client.name && client.company ? [p([run(`U.p. ${client.name}`)])] : []),
    ...(client.address ? [p([run(client.address)])] : []),
    ...(client.email ? [p([run(client.email)])] : []),
    ...(client.npwp ? [p([run(`NPWP: ${client.npwp}`)])] : []),
  ];
}

function partyBox(party: string, lines: string[]): Paragraph[] {
  return [
    new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: "f8fafc" },
      border: {
        top: { style: BorderStyle.SINGLE, size: 4, color: "e2e8f0" },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: "e2e8f0" },
        left: { style: BorderStyle.SINGLE, size: 4, color: "e2e8f0" },
        right: { style: BorderStyle.SINGLE, size: 4, color: "e2e8f0" },
      },
      children: [run(party, { bold: true })],
      spacing: { before: 120, after: 20 },
    }),
    ...lines.map((l) => p([run(l)], { spacing: { after: 20 } })),
  ];
}

function pasal(no: string, title: string, children: (Paragraph | Table)[]): (Paragraph | Table)[] {
  return [
    p([run(`${no}. ${title}`.toUpperCase(), { bold: true })], { spacing: { before: 160, after: 60 } }),
    ...children,
  ];
}

function buildScopeTableDocx(scopeOfWork?: string | null): (Paragraph | Table)[] {
  const items = parseScopeOfWork(scopeOfWork);
  if (items.length === 0) return [];

  const head = [
    cell("No.", { bold: true, fill: "1f2937", color: "ffffff", align: AlignmentType.CENTER }),
    cell("Deskripsi Pekerjaan", { bold: true, fill: "1f2937", color: "ffffff" }),
    cell("Keterangan", { bold: true, fill: "1f2937", color: "ffffff" }),
  ];

  const body = items.map((item) => [
    cell(String(item.no), { align: AlignmentType.CENTER }),
    cell(item.description, { bold: true }),
    cell(item.note),
  ]);

  const borders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "94a3b8" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "94a3b8" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "94a3b8" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "94a3b8" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "cbd5e1" },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "cbd5e1" },
  };

  return [
    h3("Lingkup Pekerjaan"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders,
      rows: [
        new TableRow({ tableHeader: true, children: head }),
        ...body.map((cells) => new TableRow({ children: cells })),
      ],
    }),
  ];
}

function buildBankBlockDocx(company: TemplateData["company"], selectedBanks?: string[] | null): Paragraph[] {
  const accounts = parseBankAccounts(company, selectedBanks);
  if (accounts.length === 0) return [];
  const lines: Paragraph[] = [h3("Pembayaran Dapat Ditransfer Ke")];
  accounts.forEach((acc) => {
    lines.push(
      p(
        [
          run(`${acc.bank_name}`, { bold: true }),
          run(` - No. Rekening: `),
          run(acc.bank_account_number, { bold: true, color: "0f172a" }),
          run(` (a.n. ${acc.bank_account_holder})`),
        ],
        { spacing: { after: 40 } }
      )
    );
  });
  return lines;
}

// ---------------- TYPE BUILDERS ----------------

export function buildPenawaran(data: TemplateData, paper: { width: number; height: number } = DEFAULT_PAGE) {
  const { company, doc, client } = data;
  const extra = doc.extra;
  const intro = extra.intro?.trim();
  const validityDays = Number(extra.validity_days) || 14;
  return new Document({
    creator: company.name,
    title: `${doc.title} - ${doc.number}`,
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections: [
      {
        properties: { page: { size: paper } },
        footers: { default: generatedFooter() },
        children: [
          ...header(data),
          p([run(`Lampiran : -`)], { spacing: { after: 40 } }),
          p([run(`Hal : ${extra.project_title || doc.title}`, { bold: true })], { spacing: { after: 200 } }),
          ...clientBlock(data),
          p([run("Dengan hormat,")]),
          ...(intro
            ? [p([...ml(intro)])]
            : [
                p([
                  run(`Bersama ini kami sampaikan penawaran jasa `),
                  ...ml(extra.project_title || "sesuai kebutuhan Anda"),
                  run(
                    ` kepada ${client?.company || client?.name || "calon klien"}. Adapun rincian penawaran kami adalah sebagai berikut:`
                  ),
                ]),
              ]),
          ...(extra.scope_of_work ? buildScopeTableDocx(extra.scope_of_work) : []),
          h3("Rincian Biaya Penawaran"),
          itemsTable(data),
          ...totalsBlock(data),
          p([
            run(
              `Masa berlaku penawaran: ${validityDays} hari (s.d. ${fmtDateAfterDays(doc.issue_date, validityDays)})`,
              { color: "64748b" }
            ),
          ]),
          ...(extra.payment_terms ? formattedListDocx("Ketentuan Pembayaran", extra.payment_terms) : []),
          ...(doc.notes ? formattedListDocx("Catatan", doc.notes) : []),
          p([
            run(
              "Demikian penawaran ini kami sampaikan. Apabila Bapak/Ibu berkenan, kami siap membahas lebih lanjut dan menunggu balasan positif dari pihak Anda."
            ),
          ]),
          p([run("Terima kasih atas kepercayaan dan kerjasamanya.", { bold: true })]),
          ...signatureBlock(data, [
            `Hormat kami,\n${company.name}`.split("\n")[0],
            company.signer_name || company.name,
            company.signer_position || "",
          ]),
        ],
      },
    ],
  });
}

export function buildQuotation(data: TemplateData, paper: { width: number; height: number } = DEFAULT_PAGE) {
  const { company, doc } = data;
  const extra = doc.extra;
  const validityDays = Number(extra.validity_days) || 14;
  return new Document({
    creator: company.name,
    title: `${doc.title} - ${doc.number}`,
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections: [
      {
        properties: { page: { size: paper } },
        footers: { default: generatedFooter() },
        children: [
          ...header(data),
          ...clientBlock(data),
          ...(extra.po_number ? [p([run(`No. PO: ${extra.po_number}`)])] : []),
          ...(extra.intro ? [p([...ml(extra.intro)])] : []),
          ...(extra.scope_of_work ? buildScopeTableDocx(extra.scope_of_work) : []),
          itemsTable(data),
          ...totalsBlock(data),
          p([
            run(
              `Masa berlaku penawaran: ${validityDays} hari, berakhir ${fmtDateAfterDays(doc.issue_date, validityDays)}.`,
              { color: "64748b" }
            ),
          ]),
          ...(extra.payment_terms ? formattedListDocx("Ketentuan Pembayaran", extra.payment_terms) : []),
          ...(doc.notes ? formattedListDocx("Catatan", doc.notes) : []),
          ...buildBankBlockDocx(company, extra.selected_banks),
          ...signatureBlock(data, [
            `Hormat kami,\n${company.name}`.split("\n")[0],
            company.signer_name || company.name,
            company.signer_position || "",
          ]),
        ],
      },
    ],
  });
}

export function buildInvoice(data: TemplateData, paper: { width: number; height: number } = DEFAULT_PAGE) {
  const { company, doc } = data;
  const extra = doc.extra;
  return new Document({
    creator: company.name,
    title: `${doc.title} - ${doc.number}`,
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections: [
      {
        properties: { page: { size: paper } },
        footers: { default: generatedFooter() },
        children: [
          ...header(data),
          ...clientBlock(data),
          ...(extra.po_number ? [p([run(`No. PO / Referensi: ${extra.po_number}`)])] : []),
          p([
            run(doc.status === "paid" ? "LUNAS" : doc.status === "cancelled" ? "DIBATALKAN" : "BELUM DIBAYAR", {
              bold: true,
              color: doc.status === "paid" ? "047857" : "b45309",
            }),
          ]),
          itemsTable(data),
          ...totalsBlock(data),
          ...buildBankBlockDocx(company, extra.selected_banks),
          ...(extra.payment_terms ? formattedListDocx("Ketentuan Pembayaran", extra.payment_terms) : []),
          ...(doc.notes ? formattedListDocx("Catatan", doc.notes) : []),
          ...signatureBlock(data, [
            `Hormat kami,\n${company.name}`.split("\n")[0],
            company.signer_name || company.name,
            company.signer_position || "",
          ]),
        ],
      },
    ],
  });
}

export function buildBast(data: TemplateData, paper: { width: number; height: number } = DEFAULT_PAGE) {
  const { company, doc, client } = data;
  const extra = doc.extra;
  return new Document({
    creator: company.name,
    title: `${doc.title} - ${doc.number}`,
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections: [
      {
        properties: { page: { size: paper } },
        footers: { default: generatedFooter() },
        children: [
          ...header(data),
          p([run(`Nomor: ${doc.number}`, { italics: true, bold: true })], {
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          p([
            run(
              `Pada hari ini, ${fmtDateLong(doc.issue_date)}, bertempat di ${extra.location || company.city || "-"}, yang bertanda tangan di bawah ini:`
            ),
          ]),
          ...partyBox("PIHAK PERTAMA (PENYEDIA JASA)", [
            `Nama : ${company.signer_name || company.name}`,
            `Jabatan : ${company.signer_position || "Direktur"}`,
            `Perusahaan : ${company.name}`,
            `Alamat : ${company.address || "-"}`,
          ]),
          ...partyBox("PIHAK KEDUA (PENERIMA)", [
            `Nama : ${client?.name || "-"}`,
            `Jabatan : ${client?.pic || "-"}`,
            `Perusahaan : ${client?.company || "-"}`,
            `Alamat : ${client?.address || "-"}`,
          ]),
          p([run("Dengan ini menyatakan bahwa pekerjaan dengan rincian sebagai berikut:")]),
          ...(extra.work_description ? [h3("Uraian Pekerjaan"), p([...ml(extra.work_description)])] : []),
          itemsTable(data),
          ...totalsBlock(data),
          ...(extra.start_date || extra.end_date
            ? [p([run(`Tanggal Mulai : ${fmtDate(extra.start_date)}    Tanggal Selesai : ${fmtDate(extra.end_date)}`)])]
            : []),
          ...(extra.contract_ref ? [p([run(`Referensi Kontrak / SPK : ${extra.contract_ref}`)])] : []),
          p([
            ...ml(
              extra.result_text ||
                "Bahwa seluruh pekerjaan tersebut telah diselesaikan dengan baik dan telah diterima oleh PIHAK KEDUA. Dengan diserahkannya pekerjaan tersebut, maka dianggap selesainya seluruh kewajiban PIHAK PERTAMA kepada PIHAK KEDUA."
            ),
          ]),
          p([
            run(
              "Demikian berita acara ini dibuat dalam rangkap dua (2) dengan kekuatan hukum yang sama untuk dipergunakan sebagaimana mestinya.",
              { bold: true }
            ),
          ]),
          ...signatureBlock(
            data,
            ["PIHAK PERTAMA,", company.signer_name || company.name, company.signer_position || ""],
            ["PIHAK KEDUA,", client?.name || "..........................", client?.pic || ".........................."]
          ),
        ],
      },
    ],
  });
}

export function buildKontrak(data: TemplateData, paper: { width: number; height: number } = DEFAULT_PAGE) {
  const { company, doc, client, totals } = data;
  const extra = doc.extra;
  const city = extra.location || company.city || "-";
  return new Document({
    creator: company.name,
    title: `${doc.title} - ${doc.number}`,
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections: [
      {
        properties: { page: { size: paper } },
        footers: { default: generatedFooter() },
        children: [
          ...header(data),
          p([run(`Nomor: ${doc.number}`, { italics: true, bold: true })], {
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
          }),
          p([
            run(`Pada hari ini, ${fmtDate(doc.issue_date)}, bertempat di ${city}, yang bertanda tangan di bawah ini:`),
          ]),
          ...partyBox("PIHAK PERTAMA", [
            `Nama : ${company.signer_name || company.name}`,
            `Jabatan : ${company.signer_position || "Direktur"}`,
            `Perusahaan : ${company.name}, berkedudukan di ${company.city || "-"}`,
            `Alamat : ${company.address || "-"}`,
            `Telepon/Email : ${company.phone || "-"} / ${company.email || "-"}`,
            "Selanjutnya disebut PIHAK PERTAMA.",
          ]),
          ...partyBox("PIHAK KEDUA", [
            `Nama : ${client?.name || "-"}`,
            `Jabatan : ${client?.pic || "-"}`,
            `Perusahaan : ${client?.company || "-"}`,
            `Alamat : ${client?.address || "-"}`,
            `Telepon/Email : ${client?.phone || "-"} / ${client?.email || "-"}`,
            "Selanjutnya disebut PIHAK KEDUA.",
          ]),
          p([
            run(
              "PIHAK PERTAMA dan PIHAK KEDUA secara bersama-sama disebut PARA PIHAK, terlebih dahulu menerangkan bahwa kedua belah pihak sepakat untuk mengikatkan diri dalam Perjanjian Kerja dengan ketentuan sebagai berikut:"
            ),
          ]),
          ...pasal("Pasal 1", "Ruang Lingkup Pekerjaan", [
            ...(extra.project_title
              ? [
                  p([
                    run(`PIHAK PERTAMA menerima penunjukan dari PIHAK KEDUA untuk melaksanakan pekerjaan `),
                    run(extra.project_title),
                    ...ml(extra.scope_of_work ? "," : "."),
                  ]),
                ]
              : []),
            ...(extra.scope_of_work ? [p([...ml(extra.scope_of_work)])] : []),
            ...(extra.work_description ? [p([...ml(extra.work_description)])] : []),
          ]),
          ...pasal("Pasal 2", "Jangka Waktu Pelaksanaan", [
            p([
              run(
                `Pekerjaan dilaksanakan mulai ${fmtDate(extra.start_date)} sampai dengan ${fmtDate(extra.end_date)}${extra.duration_text ? ` (${extra.duration_text})` : ""}, atau sesuai kesepakatan bersama yang dituangkan dalam addendum.`
              ),
            ]),
          ]),
          ...pasal("Pasal 3", "Nilai Pekerjaan", [
            p([run("Rincian nilai pekerjaan adalah sebagai berikut:")]),
            itemsTable(data),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [run(`Total Nilai Kontrak : ${fmt(totals.total, doc.currency)}`, { bold: true })],
              spacing: { after: 60 },
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [run(`Terbilang: ${terbilang(totals.total)}`, { italics: true, size: 18, color: "64748b" })],
              spacing: { after: 200 },
            }),
          ]),
          ...pasal("Pasal 4", "Cara Pembayaran", [
            p([
              ...ml(
                extra.payment_terms ||
                  "Pembayaran dilakukan secara bertahap sesuai kesepakatan PARA PIHAK, melalui transfer bank ke rekening PIHAK PERTAMA."
              ),
            ]),
            ...(company.bank_name
              ? [
                  p([
                    run(
                      `Rekening: ${company.bank_name} a.n. ${company.bank_account_holder} (No. ${company.bank_account_number})`
                    ),
                  ]),
                ]
              : []),
          ]),
          ...(extra.clauses ? pasal("Pasal 5", "Ketentuan Lain", [p([...ml(extra.clauses)])]) : []),
          ...pasal(extra.clauses ? "Pasal 6" : "Pasal 5", "Penutup", [
            p([
              run(
                "Hal-hal yang belum diatur dalam perjanjian ini akan diatur kemudian atas kesepakatan PARA PIHAK. Perjanjian ini dibuat dan ditandatangani dalam rangkap dua (2) dengan kekuatan hukum yang sama."
              ),
            ]),
          ]),
          ...signatureBlock(
            data,
            ["PIHAK PERTAMA,", company.signer_name || company.name, company.signer_position || ""],
            ["PIHAK KEDUA,", client?.name || "..........................", client?.pic || ".........................."]
          ),
        ],
      },
    ],
  });
}

export async function buildDocx(
  data: TemplateData,
  paper: { width: number; height: number } = DEFAULT_PAGE
): Promise<Buffer> {
  let doc: Document;
  switch (data.doc.type) {
    case "penawaran":
      doc = buildPenawaran(data, paper);
      break;
    case "quotation":
      doc = buildQuotation(data, paper);
      break;
    case "invoice":
      doc = buildInvoice(data, paper);
      break;
    case "bast":
      doc = buildBast(data, paper);
      break;
    case "kontrak":
      doc = buildKontrak(data, paper);
      break;
    default:
      doc = buildInvoice(data, paper);
  }
  return Packer.toBuffer(doc);
}
