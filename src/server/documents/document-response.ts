import "server-only";

import type { CsvDocument, PdfDocument } from "@/server/services/document-service";
import { NotFoundError, PermissionError } from "@/server/errors";

export function documentErrorResponse(error: unknown): Response {
  if (error instanceof PermissionError) return new Response(error.message, { status: 403 });
  if (error instanceof NotFoundError) return new Response(error.message, { status: 404 });
  console.error(error);
  return new Response("Dokument konnte nicht erstellt werden.", { status: 500 });
}

export function pdfResponse(document: PdfDocument): Response {
  const body = document.bytes as unknown as BodyInit;
  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${document.filename}"`,
    },
  });
}

export function csvResponse(document: CsvDocument): Response {
  return new Response(document.content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${document.filename}"`,
    },
  });
}
