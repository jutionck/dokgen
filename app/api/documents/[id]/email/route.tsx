import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { emailLogs } from "@/db/schema";
import { loadTemplateData } from "@/lib/documents/loader";
import { pdfFilename } from "@/lib/documents/filename";
import { PdfRenderer } from "@/lib/pdf/documents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, props: RouteContext<"/api/documents/[id]/email">) {
  const { id } = await props.params;
  const data = await loadTemplateData(id);
  if (!data) {
    return Response.json({ error: "Dokumen tidak ditemukan atau Anda tidak punya akses" }, { status: 404 });
  }

  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: "RESEND_API_KEY belum dikonfigurasi di Settings → Environment Variables" }, { status: 500 });
  }
  if (!process.env.RESEND_FROM) {
    return Response.json({ error: "RESEND_FROM (email pengirim) belum dikonfigurasi. Contoh: Dokgen <noreply@domain.com>" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const toEmail = String(body.to_email || "").trim();
  if (!toEmail) {
    return Response.json({ error: "Email tujuan wajib diisi" }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: await headers() });

  const subject =
    String(body.subject || "").trim() ||
    `${data.doc.title} ${data.doc.number} - ${data.company.name}`;
  const message =
    String(body.message || "").trim() ||
    `Kepada Yth. Bapak/Ibu,\n\nTerlampir kami kirimkan ${data.doc.title.toLowerCase()} dengan nomor ${data.doc.number}.\n\nTerima kasih atas perhatian dan kerjasamanya.\n\nHormat kami,\n${data.company.name}`;

  try {
    const pdfBuffer = await renderToBuffer(<PdfRenderer data={data} />);
    const resend = new Resend(process.env.RESEND_API_KEY);
    const ccList = String(body.cc || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const { data: res, error } = await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: [toEmail],
      cc: ccList.length ? ccList : undefined,
      subject,
      text: message,
      attachments: [
        {
          filename: pdfFilename(data.doc),
          content: Buffer.from(pdfBuffer),
        },
      ],
    });

    if (error) {
      await db.insert(emailLogs).values({
        document_id: id,
        sent_by: session?.user?.id || null,
        to_email: toEmail,
        subject,
        status: "failed",
        error: error.message,
      });
      return Response.json({ error: `Gagal mengirim: ${error.message}` }, { status: 500 });
    }

    await db.insert(emailLogs).values({
      document_id: id,
      sent_by: session?.user?.id || null,
      to_email: toEmail,
      subject,
      status: "sent",
      resend_id: res?.id || null,
    });

    return Response.json({ success: true, id: res?.id });
  } catch (e) {
    console.error("Email error:", e);
    await db.insert(emailLogs).values({
      document_id: id,
      sent_by: session?.user?.id || null,
      to_email: toEmail,
      subject,
      status: "failed",
      error: e instanceof Error ? e.message : "unknown",
    });
    return Response.json({ error: `Gagal mengirim email: ${e instanceof Error ? e.message : "unknown"}` }, { status: 500 });
  }
}