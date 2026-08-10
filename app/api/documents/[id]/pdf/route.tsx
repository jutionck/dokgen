import { renderToBuffer } from "@react-pdf/renderer";
import { loadTemplateData } from "@/lib/documents/loader";
import { pdfFilename } from "@/lib/documents/filename";
import { resolvePaper } from "@/lib/documents/paper";
import { PdfRenderer } from "@/lib/pdf/documents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, props: RouteContext<"/api/documents/[id]/pdf">) {
  const { id } = await props.params;
  const data = await loadTemplateData(id);
  if (!data) {
    return Response.json({ error: "Dokumen tidak ditemukan atau Anda tidak punya akses" }, { status: 404 });
  }

  const query = new URL(request.url).searchParams;
  const paper = resolvePaper(query.get("size"));
  const disposition = query.get("disposition") === "inline" ? "inline" : "attachment";

  try {
    const buffer = await renderToBuffer(<PdfRenderer data={data} paperSize={paper.pdf} />);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${pdfFilename(data.doc, paper.id)}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Document-Paper-Size": paper.id,
        "X-Document-Paper-Width": String(paper.points.width),
        "X-Document-Paper-Height": String(paper.points.height),
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
