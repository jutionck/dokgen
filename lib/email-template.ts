import type { TemplateData } from "@/components/documents/templates/shared";
import { formatIDR, formatDateShort } from "@/lib/utils";

export function renderDocumentEmailHtml({
  data,
  customMessage,
}: {
  data: TemplateData;
  customMessage?: string;
}): string {
  const { doc, company, client, totals } = data;

  const formattedMessage = (
    customMessage ||
    `Kepada Yth. Bapak/Ibu,\n\nTerlampir kami kirimkan ${doc.title.toLowerCase()} dengan nomor ${doc.number}.\n\nTerima kasih atas perhatian dan kerjasamanya.`
  )
    .trim()
    .replace(/\n/g, "<br />");

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title} ${doc.number}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 32px 16px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
      padding: 28px 32px;
      color: #ffffff;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-sub {
      font-size: 12px;
      color: #93c5fd;
      margin-top: 4px;
    }
    .content {
      padding: 32px;
    }
    .message-body {
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
      margin-bottom: 28px;
    }
    .doc-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .doc-type {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #2563eb;
      margin: 0 0 4px 0;
    }
    .doc-number {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 12px 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .doc-meta-grid {
      display: table;
      width: 100%;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed #cbd5e1;
    }
    .doc-meta-col {
      display: table-cell;
      vertical-align: top;
    }
    .meta-label {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 2px;
    }
    .meta-value {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }
    .meta-value-total {
      font-size: 15px;
      font-weight: 800;
      color: #2563eb;
    }
    .attachment-box {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 13px;
      color: #1e40af;
      font-weight: 500;
      margin-bottom: 28px;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 20px 32px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img
          src="https://docgen.mipdevp.com/icons/icon-192.png"
          width="48"
          height="48"
          alt="Docgen Logo"
          style="display: block; margin: 0 0 10px 0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); border: 2px solid rgba(255, 255, 255, 0.2);"
        />
        <h1 class="brand-title">${company.name}</h1>
        <p class="brand-sub">${doc.title} #${doc.number}</p>
      </div>
      
      <div class="content">
        <div class="message-body">
          ${formattedMessage}
        </div>

        <div class="doc-card">
          <p class="doc-type">${doc.title}</p>
          <h2 class="doc-number">${doc.number}</h2>
          
          <div class="doc-meta-grid">
            <div class="doc-meta-col" style="width: 50%;">
              <p class="meta-label">Ditujukan Kepada</p>
              <p class="meta-value">${client?.company || client?.name || "Klien"}</p>
            </div>
            <div class="doc-meta-col" style="width: 50%; text-align: right;">
              <p class="meta-label">Tanggal Terbit</p>
              <p class="meta-value">${formatDateShort(doc.issue_date)}</p>
            </div>
          </div>

          <div class="doc-meta-grid" style="margin-top: 10px; padding-top: 10px; border-top: none;">
            <div class="doc-meta-col" style="width: 50%;">
              <p class="meta-label">Status</p>
              <p class="meta-value" style="text-transform: capitalize;">${doc.status}</p>
            </div>
            <div class="doc-meta-col" style="width: 50%; text-align: right;">
              <p class="meta-label">Total Nilai</p>
              <p class="meta-value-total">${formatIDR(totals.total)}</p>
            </div>
          </div>
        </div>

        <div class="attachment-box">
          📌 Dokumen PDF resmi terlampir pada email ini.
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0 0 6px 0;">Email ini dikirim secara otomatis oleh <strong>${company.name}</strong> melalui <a href="https://docgen.mipdevp.com">Docgen</a>.</p>
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">© ${new Date().getFullYear()} ${company.name}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
