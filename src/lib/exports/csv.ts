export interface CsvOptions {
  delimiter?: string;
  bom?: boolean;
}

const BYTE_ORDER_MARK = "﻿";

/**
 * Maskiert ein einzelnes CSV-Feld nach RFC 4180. Felder mit Trennzeichen,
 * Anführungszeichen oder Zeilenumbrüchen werden in Anführungszeichen gesetzt.
 */
export function escapeCsvField(value: string, delimiter: string): string {
  if (value.includes('"') || value.includes(delimiter) || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Baut einen CSV-Text aus Kopfzeile und Datenzeilen. Standardmäßig wird das in
 * Österreich für Excel gebräuchliche Semikolon verwendet und ein UTF-8-BOM
 * vorangestellt, damit Umlaute korrekt geöffnet werden.
 */
export function buildCsv(headers: readonly string[], rows: readonly (readonly string[])[], options: CsvOptions = {}): string {
  const delimiter = options.delimiter ?? ";";
  const useBom = options.bom ?? true;
  const lines = [headers, ...rows].map((row) =>
    row.map((field) => escapeCsvField(field ?? "", delimiter)).join(delimiter),
  );
  const body = lines.join("\r\n");
  return useBom ? `${BYTE_ORDER_MARK}${body}` : body;
}
