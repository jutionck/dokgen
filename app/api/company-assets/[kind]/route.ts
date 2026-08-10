import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { companies } from "@/db/schema";
import { getBlobReadWriteToken, isPrivateVercelBlobUrl } from "@/lib/blob";
import { db } from "@/lib/db";
import { requireCompanyId } from "@/lib/dal/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ kind: string }> }) {
  const companyId = await requireCompanyId();
  if (!companyId) return new Response("Unauthorized", { status: 401 });

  const { kind } = await params;
  if (kind !== "logo" && kind !== "signature") return new Response("Not found", { status: 404 });

  const column = kind === "logo" ? companies.logo_url : companies.signature_url;
  const [company] = await db
    .select({ assetUrl: column })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);
  const assetUrl = company?.assetUrl;
  if (!assetUrl) return new Response("Not found", { status: 404 });

  const dataUrl = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(assetUrl);
  if (dataUrl) {
    return new Response(Buffer.from(dataUrl[2], "base64"), {
      headers: {
        "Cache-Control": "private, max-age=300",
        "Content-Type": dataUrl[1],
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  if (!isPrivateVercelBlobUrl(assetUrl)) {
    return Response.redirect(assetUrl, 307);
  }

  const token = getBlobReadWriteToken();
  if (!token) return new Response("Blob storage is not configured", { status: 503 });

  const result = await get(assetUrl, { access: "private", token });
  if (!result || result.statusCode !== 200) return new Response("Not found", { status: 404 });

  return new Response(result.stream, {
    headers: {
      "Cache-Control": "private, max-age=300",
      "Content-Disposition": "inline",
      "Content-Type": result.blob.contentType,
      ETag: result.blob.etag,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
