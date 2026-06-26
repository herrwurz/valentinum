import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

export interface DocumentField {
  label: string;
  value: string;
}

export interface DocumentSection {
  heading?: string;
  fields?: DocumentField[];
  paragraphs?: string[];
}

export interface DocumentSpec {
  title: string;
  subtitle?: string;
  sections: DocumentSection[];
  footer?: string;
}

/** Ersetzt Zeichen, die der WinAnsi-Standardfont nicht darstellen kann. */
function sanitize(text: string): string {
  return text
    .replace(/€/g, "EUR")
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/·/g, "-")
    .replace(/[^\n -ÿ]/g, "?");
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const words = rawLine.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (!line || font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines.length > 0 ? lines : [""];
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;
const INK = rgb(0.1, 0.1, 0.1);

export async function renderDocumentPdf(spec: DocumentSpec): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let cursorY = PAGE_HEIGHT - MARGIN;

  const ensure = (space: number) => {
    if (cursorY - space < MARGIN) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      cursorY = PAGE_HEIGHT - MARGIN;
    }
  };

  const write = (text: string, options: { size?: number; font?: PDFFont; gap?: number } = {}) => {
    const size = options.size ?? 11;
    const usedFont = options.font ?? font;
    const gap = options.gap ?? 4;
    for (const line of wrapText(sanitize(text), usedFont, size, MAX_WIDTH)) {
      ensure(size + gap);
      page.drawText(line, { x: MARGIN, y: cursorY - size, size, font: usedFont, color: INK });
      cursorY -= size + gap;
    }
  };

  write(spec.title, { size: 20, font: bold, gap: 8 });
  if (spec.subtitle) write(spec.subtitle, { size: 12, gap: 12 });
  cursorY -= 6;

  for (const section of spec.sections) {
    if (section.heading) {
      cursorY -= 6;
      write(section.heading, { size: 13, font: bold, gap: 6 });
    }
    for (const paragraph of section.paragraphs ?? []) {
      write(paragraph, { size: 11, gap: 6 });
    }
    for (const field of section.fields ?? []) {
      write(field.label, { size: 9, font: bold, gap: 1 });
      write(field.value || "-", { size: 11, gap: 6 });
    }
  }

  if (spec.footer) {
    cursorY -= 10;
    write(spec.footer, { size: 8, gap: 2 });
  }

  return pdf.save();
}
