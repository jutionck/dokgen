export function sanitizeFilename(s: string) {
  return s.replace(/[\/\\:*?"<>|]+/g, "-").trim();
}

function baseName(data: { title: string; number: string }, sizeLabel?: string) {
  const size = sizeLabel ? `-${sizeLabel.toUpperCase()}` : "";
  return `${sanitizeFilename(data.title)}-${sanitizeFilename(data.number)}${size}`;
}

export function pdfFilename(data: { title: string; number: string }, sizeLabel?: string) {
  return `${baseName(data, sizeLabel)}.pdf`;
}

export function docxFilename(data: { title: string; number: string }, sizeLabel?: string) {
  return `${baseName(data, sizeLabel)}.docx`;
}