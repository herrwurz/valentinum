import "dotenv/config";

import { prisma } from "../src/lib/prisma/client";
import { bookingService } from "../src/server/services/booking-service-instance";
import { vehicleProtocolService } from "../src/server/services/vehicle-protocol-service-instance";
import { documentService } from "../src/server/services/document-service-instance";

const actor = { id: "initial-admin", email: "admin@valentinum.local", role: "ADMIN" as const };
const suffix = Date.now().toString(36);
let bookingId: string | undefined;
let handoverId: string | undefined;
let returnId: string | undefined;

function assertPdf(bytes: Uint8Array, label: string) {
  const header = Buffer.from(bytes.subarray(0, 5)).toString("latin1");
  if (header !== "%PDF-") throw new Error(`${label} ist kein gültiges PDF (Header: ${header}).`);
  if (bytes.byteLength < 500) throw new Error(`${label} wirkt unvollständig (${bytes.byteLength} Bytes).`);
}

async function main() {
  try {
    const title = `Phase 9 Dokumente ${suffix}`;
    await bookingService.createBookingRequest(null, {
      title,
      startAt: new Date("2027-11-12T08:00:00Z"),
      endAt: new Date("2027-11-12T18:00:00Z"),
      requesterName: "Dokumententest",
      requesterEmail: "dokumente@example.invalid",
      resourceIds: ["initial-vehicle-kuehlwagen"],
    });
    bookingId = (await prisma.booking.findFirstOrThrow({ where: { title } })).id;
    await bookingService.approveBooking(actor, bookingId);

    const confirmation = await documentService.generateBookingConfirmation(actor, bookingId);
    assertPdf(confirmation.bytes, "Buchungsbestätigung");

    handoverId = await vehicleProtocolService.createHandoverProtocol(actor, bookingId, {
      handedOverAt: new Date("2027-11-12T08:00:00Z"),
      pickupLocation: "Bauhof Valentinum",
      condition: "Vollständig",
      depositAmount: 200,
    });
    const handoverPdf = await documentService.generateHandoverProtocol(actor, bookingId);
    assertPdf(handoverPdf.bytes, "Übergabeprotokoll");

    returnId = await vehicleProtocolService.createReturnProtocol(actor, bookingId, {
      returnedAt: new Date("2027-11-12T18:00:00Z"),
      returnLocation: "Bauhof Valentinum",
      cleaningOk: true,
      condition: "In Ordnung",
      damages: [{ description: "Kleiner Kratzer", severity: "MINOR", estimatedCost: 25 }],
      fees: [{ type: "RENTAL", amount: 120 }],
    });
    const returnPdf = await documentService.generateReturnProtocol(actor, bookingId);
    assertPdf(returnPdf.bytes, "Rückgabeprotokoll");

    const csv = await documentService.exportBookingsCsv(actor, {
      from: new Date("2027-11-01T00:00:00Z"),
      to: new Date("2027-12-01T00:00:00Z"),
    });
    if (!csv.content.includes("Beginn")) throw new Error("CSV-Kopfzeile fehlt.");
    if (!csv.content.includes("Dokumententest")) throw new Error("Exportierte Buchung fehlt im CSV.");
    if (!csv.content.includes("320,00")) throw new Error("Gebührensumme (Kaution + Miete) fehlt im CSV.");

    console.log("Buchungsbestätigung, Übergabe-/Rückgabe-PDF und CSV-Export erfolgreich geprüft.");
  } finally {
    const auditIds = [bookingId, handoverId, returnId].filter((value): value is string => Boolean(value));
    if (auditIds.length > 0) {
      await prisma.auditLog.deleteMany({ where: { entityId: { in: auditIds } } });
    }
    if (bookingId) {
      await prisma.booking.deleteMany({ where: { id: bookingId } });
    }
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
