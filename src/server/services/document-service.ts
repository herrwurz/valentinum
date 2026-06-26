import { eventCategoryLabels, type EventCategoryValue } from "@/features/events/event-types";
import type { BookingStatusValue } from "@/features/bookings/booking-types";
import {
  damageSeverityLabels,
  feeTypeLabels,
  type HandoverProtocolDto,
  type ReturnProtocolDto,
} from "@/features/vehicle/vehicle-types";
import { renderDocumentPdf, type DocumentSpec } from "@/lib/documents/pdf";
import { buildCsv } from "@/lib/exports/csv";
import type { Actor } from "@/lib/permissions/roles";
import { requireStaffOrAdmin } from "@/lib/permissions/roles";
import { NotFoundError } from "@/server/errors";
import type {
  ConfirmationData,
  DocumentRepository,
  ExportFilter,
  ExportRow,
  HandoverDocData,
  ReturnDocData,
} from "@/server/repositories/document-repository";

const dateTime = new Intl.DateTimeFormat("de-AT", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Vienna" });
const euro = new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" });

const statusLabels: Record<BookingStatusValue, string> = {
  DRAFT: "Entwurf",
  REQUESTED: "Angefragt",
  OPTION: "Option",
  APPROVED: "Genehmigt",
  REJECTED: "Abgelehnt",
  CANCELLED: "Storniert",
  COMPLETED: "Abgeschlossen",
  ARCHIVED: "Archiviert",
};

const categoryLabel = (category?: string): string =>
  category ? (eventCategoryLabels[category as EventCategoryValue] ?? category) : "";

export interface PdfDocument {
  filename: string;
  bytes: Uint8Array;
}

export interface CsvDocument {
  filename: string;
  content: string;
}

function handoverFields(handover: HandoverProtocolDto) {
  return [
    { label: "Übergabezeitpunkt", value: dateTime.format(handover.handedOverAt) },
    { label: "Abholort", value: handover.pickupLocation },
    { label: "Kilometerstand", value: handover.odometer !== undefined ? String(handover.odometer) : "-" },
    { label: "Tankfüllung", value: handover.fuelLevel !== undefined ? `${handover.fuelLevel} %` : "-" },
    { label: "Zustand", value: handover.condition },
    { label: "Zubehör", value: handover.accessories ?? "-" },
    { label: "Kaution", value: handover.depositAmount !== undefined ? euro.format(handover.depositAmount) : "-" },
    { label: "Notizen", value: handover.notes ?? "-" },
  ];
}

function returnFields(value: ReturnProtocolDto) {
  return [
    { label: "Rückgabezeitpunkt", value: dateTime.format(value.returnedAt) },
    { label: "Rückgabeort", value: value.returnLocation },
    { label: "Kilometerstand", value: value.odometer !== undefined ? String(value.odometer) : "-" },
    { label: "Tankfüllung", value: value.fuelLevel !== undefined ? `${value.fuelLevel} %` : "-" },
    { label: "Reinigung", value: value.cleaningOk ? "in Ordnung" : "beanstandet" },
    { label: "Zustand", value: value.condition },
    { label: "Notizen", value: value.notes ?? "-" },
  ];
}

function buildConfirmationSpec(data: ConfirmationData): DocumentSpec {
  return {
    title: "Buchungsbestätigung",
    subtitle: data.title,
    sections: [
      {
        heading: "Buchung",
        fields: [
          { label: "Buchungsnummer", value: data.id },
          { label: "Status", value: statusLabels[data.status] },
          { label: "Zeitraum", value: `${dateTime.format(data.startAt)} – ${dateTime.format(data.endAt)}` },
          { label: "Ressourcen", value: data.resourceNames.join(", ") || "-" },
        ],
      },
      {
        heading: "Antragsteller",
        fields: [
          { label: "Name", value: data.requesterName },
          { label: "E-Mail", value: data.requesterEmail },
          { label: "Telefon", value: data.requesterPhone ?? "-" },
          { label: "Zweck", value: data.purpose ?? "-" },
        ],
      },
      {
        heading: "Hinweise",
        paragraphs: [
          "Diese Bestätigung bezieht sich auf den oben genannten Status. Verbindliche Buchungen liegen erst im Status „Genehmigt“ vor.",
        ],
      },
    ],
    footer: `Erstellt am ${dateTime.format(new Date())} · Valentinum & Kühlwagen Buchungsplattform`,
  };
}

function buildHandoverSpec(data: HandoverDocData): DocumentSpec {
  return {
    title: "Übergabeprotokoll",
    subtitle: data.bookingTitle,
    sections: [
      { heading: "Buchung", fields: [
        { label: "Buchungsnummer", value: data.bookingId },
        { label: "Antragsteller", value: data.requesterName },
      ] },
      { heading: "Übergabe", fields: handoverFields(data.handover) },
      { heading: "Unterschriften", fields: [
        { label: "Übergeben durch", value: "______________________________" },
        { label: "Übernommen durch", value: "______________________________" },
      ] },
    ],
    footer: `Erstellt am ${dateTime.format(new Date())} · Valentinum & Kühlwagen Buchungsplattform`,
  };
}

function buildReturnSpec(data: ReturnDocData): DocumentSpec {
  const damageParagraphs = data.return.damages.length > 0
    ? data.return.damages.map((damage) =>
        `${damageSeverityLabels[damage.severity]}: ${damage.description}` +
        (damage.estimatedCost !== undefined ? ` (${euro.format(damage.estimatedCost)})` : ""))
    : ["Keine Schäden dokumentiert."];
  const feeParagraphs = data.return.fees.length > 0
    ? data.return.fees.map((fee) =>
        `${feeTypeLabels[fee.type]}: ${euro.format(fee.amount)}` + (fee.note ? ` – ${fee.note}` : ""))
    : ["Keine Zusatzkosten."];
  return {
    title: "Rückgabeprotokoll",
    subtitle: data.bookingTitle,
    sections: [
      { heading: "Buchung", fields: [
        { label: "Buchungsnummer", value: data.bookingId },
        { label: "Antragsteller", value: data.requesterName },
      ] },
      { heading: "Rückgabe", fields: returnFields(data.return) },
      { heading: "Schäden", paragraphs: damageParagraphs },
      { heading: "Zusatzkosten", paragraphs: feeParagraphs },
      { heading: "Unterschriften", fields: [
        { label: "Zurückgegeben durch", value: "______________________________" },
        { label: "Geprüft durch", value: "______________________________" },
      ] },
    ],
    footer: `Erstellt am ${dateTime.format(new Date())} · Valentinum & Kühlwagen Buchungsplattform`,
  };
}

const exportHeaders = [
  "Beginn", "Ende", "Ressourcen", "Status", "Antragsteller", "E-Mail", "Organisation", "Gebühren (EUR)", "Kategorie",
] as const;

export function exportRowToCsv(row: ExportRow): string[] {
  return [
    dateTime.format(row.startAt),
    dateTime.format(row.endAt),
    row.resourceNames.join(", "),
    statusLabels[row.status],
    row.requesterName,
    row.requesterEmail,
    "",
    row.feeTotal.toFixed(2).replace(".", ","),
    categoryLabel(row.category),
  ];
}

export class DocumentService {
  constructor(private readonly repository: DocumentRepository) {}

  async generateBookingConfirmation(actor: Actor, id: string): Promise<PdfDocument> {
    requireStaffOrAdmin(actor);
    const data = await this.repository.findConfirmation(id);
    if (!data) throw new NotFoundError("Buchung wurde nicht gefunden.");
    return { filename: `Buchungsbestaetigung-${id}.pdf`, bytes: await renderDocumentPdf(buildConfirmationSpec(data)) };
  }

  async generateHandoverProtocol(actor: Actor, bookingId: string): Promise<PdfDocument> {
    requireStaffOrAdmin(actor);
    const data = await this.repository.findHandover(bookingId);
    if (!data) throw new NotFoundError("Für diese Buchung existiert kein Übergabeprotokoll.");
    return { filename: `Uebergabeprotokoll-${bookingId}.pdf`, bytes: await renderDocumentPdf(buildHandoverSpec(data)) };
  }

  async generateReturnProtocol(actor: Actor, bookingId: string): Promise<PdfDocument> {
    requireStaffOrAdmin(actor);
    const data = await this.repository.findReturn(bookingId);
    if (!data) throw new NotFoundError("Für diese Buchung existiert kein Rückgabeprotokoll.");
    return { filename: `Rueckgabeprotokoll-${bookingId}.pdf`, bytes: await renderDocumentPdf(buildReturnSpec(data)) };
  }

  async exportBookingsCsv(actor: Actor, filter: ExportFilter): Promise<CsvDocument> {
    requireStaffOrAdmin(actor);
    const rows = await this.repository.listExport(filter);
    const content = buildCsv(exportHeaders, rows.map(exportRowToCsv));
    return { filename: `Buchungen-Export-${new Date().toISOString().slice(0, 10)}.csv`, content };
  }
}
