export function sanitizeFilename(s: string) {
  return s.replace(/[\/\\:*?"<>|]+/g, "-").trim();
}

export function pdfFilename(data: { title: string; number: string }) {
  return `${sanitizeFilename(data.title)}-${sanitizeFilename(data.number)}.pdf`;
}

export function docxFilename(data: { title: string; number: string }) {
  return `${sanitizeFilename(data.title)}-${sanitizeFilename(data.number)}.docx`;
}
