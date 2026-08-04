import { renderToBuffer } from "@react-pdf/renderer";
import { loadTemplateData } from "@/lib/documents/loader";
import { pdfFilename } from "@/lib/documents/filename";
import { PdfRenderer } from "@/lib/pdf/documents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, props: RouteContext<"/api/documents/[id]/pdf">) {
  const { id } = await props.params;
  const data = await loadTemplateData(id);
  if (!data) {
    return Response.json({ error: "Dokumen tidak ditemukan atau Anda tidak punya akses" }, { status: 404 });
  }

  try {
    const buffer = await renderToBuffer(<PdfRenderer data={data} />);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfFilename(data.doc)}"`,
      },
    });
  } catch (e) {
    console.error("PDF render error:", e);
    return Response.json(
      { error: `Gagal membuat PDF: ${e instanceof Error ? e.message : "unknown"}` },
      { status: 500 }
    );
  }
}
