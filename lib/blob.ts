import "server-only";

export function getBlobReadWriteToken() {
  // Vercel memakai nama kedua saat store dibuat dengan prefix
  // `BLOB_READ_WRITE_TOKEN` melalui menu Advanced Options.
  return process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;
}

export function isVercelBlobUrl(value?: string | null) {
  if (!value) return false;
  try {
    return new URL(value).hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function isPrivateVercelBlobUrl(value?: string | null) {
  if (!value) return false;
  try {
    return new URL(value).hostname.endsWith(".private.blob.vercel-storage.com");
  } catch {
    return false;
  }
}
