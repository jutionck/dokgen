export interface LogoImage {
  data: Buffer;
  mime: string;
  type: "png" | "jpg" | "gif";
  width: number;
  height: number;
}

const MIME_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
};

function pngSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24 || buf.toString("latin1", 1, 4) !== "PNG") return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf: Buffer): { width: number; height: number } | null {
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      i += 2;
      continue;
    }
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
    }
    i += 2 + len;
  }
  return null;
}

export function parseLogoDataUri(uri?: string | null): LogoImage | null {
  if (!uri) return null;
  const m = /^data:(image\/[a-z+]+);base64,(.+)$/.exec(uri);
  if (!m) return null;
  const mime = m[1];
  const ext = MIME_EXT[mime];
  if (!ext) return null;

  const data = Buffer.from(m[2], "base64");
  const size = ext === "png" ? pngSize(data) : jpegSize(data);
  if (!size) return null;

  return { data, mime, type: ext as LogoImage["type"], ...size };
}

export function fitSize(width: number, height: number, maxW = 150, maxH = 60) {
  const ratio = Math.min(maxW / width, maxH / height, 1);
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}
