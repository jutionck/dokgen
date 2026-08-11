export function sanitizeFilename(s: string) {
  return s
    .replace(/[\u0000-\u001f\u007f]+/g, "")
    .replace(/[\/\\:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

interface FilenameOptions {
  clientName?: string | null;
  sizeLabel?: string;
}

function baseName(data: { title: string; number: string }, options: FilenameOptions = {}) {
  const client = options.clientName ? `-${sanitizeFilename(options.clientName)}` : "";
  const size = options.sizeLabel ? `-${sanitizeFilename(options.sizeLabel).toUpperCase()}` : "";
  return `${sanitizeFilename(data.title)}${client}-${sanitizeFilename(data.number)}${size}`;
}

export function pdfFilename(data: { title: string; number: string }, options?: FilenameOptions) {
  return `${baseName(data, options)}.pdf`;
}

export function docxFilename(data: { title: string; number: string }, options?: FilenameOptions) {
  return `${baseName(data, options)}.docx`;
}
