import { loadTemplateData } from "@/lib/documents/loader";
import { docxFilename } from "@/lib/documents/filename";
import { resolvePaper } from "@/lib/documents/paper";
import { buildDocx } from "@/lib/docx/build";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, props: RouteContext<"/api/documents/[id]/docx">) {
  const { id } = await props.params;
  const data = await loadTemplateData(id);
  if (!data) {
    return Response.json({ error: "Dokumen tidak ditemukan atau Anda tidak punya akses" }, { status: 404 });
  }

  const query = new URL(request.url).searchParams;
  const paper = resolvePaper(query.get("size"));

  try {
    const buffer = await buildDocx(data, paper.docx);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${docxFilename(data.doc, paper.id)}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Document-Paper-Size": paper.id,
      },
    });
  } catch (e) {
    console.error("DOCX render error:", e);
    return Response.json(
      { error: `Gagal membuat DOCX: ${e instanceof Error ? e.message : "unknown"}` },
      { status: 500 }
    );
  }
}
