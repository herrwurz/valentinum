import "dotenv/config";

import { prisma } from "../src/lib/prisma/client";
import { bookingService } from "../src/server/services/booking-service-instance";
import { vehicleProtocolService } from "../src/server/services/vehicle-protocol-service-instance";
import { BusinessRuleError } from "../src/server/errors";

const actor = { id: "initial-admin", email: "admin@valentinum.local", role: "ADMIN" as const };
const suffix = Date.now().toString(36);
let bookingId: string | undefined;
let handoverId: string | undefined;
let returnId: string | undefined;

async function expectRejection(promise: Promise<unknown>, label: string) {
  try {
    await promise;
  } catch (error) {
    if (error instanceof BusinessRuleError) return;
    throw error;
  }
  throw new Error(`Erwartete Ablehnung fehlt: ${label}`);
}

async function main() {
  try {
    const title = `Phase 8 Kühlwagen ${suffix}`;
    await bookingService.createBookingRequest(null, {
      title,
      startAt: new Date("2027-11-10T08:00:00Z"),
      endAt: new Date("2027-11-10T18:00:00Z"),
      requesterName: "Kühlwagentest",
      requesterEmail: "kuehlwagen@example.invalid",
      resourceIds: ["initial-vehicle-kuehlwagen"],
    });
    bookingId = (await prisma.booking.findFirstOrThrow({ where: { title } })).id;
    await bookingService.approveBooking(actor, bookingId);

    handoverId = await vehicleProtocolService.createHandoverProtocol(actor, bookingId, {
      handedOverAt: new Date("2027-11-10T08:00:00Z"),
      pickupLocation: "Bauhof Valentinum",
      odometer: 120_500,
      fuelLevel: 100,
      condition: "Sauber und vollständig",
      accessories: "2 Spanngurte, Ladekabel",
      depositAmount: 200,
      notes: "Kunde eingewiesen",
    });

    await expectRejection(
      vehicleProtocolService.createHandoverProtocol(actor, bookingId, {
        handedOverAt: new Date("2027-11-10T09:00:00Z"),
        pickupLocation: "Bauhof Valentinum",
        condition: "Doppelte Übergabe",
      }),
      "Zweites Übergabeprotokoll",
    );

    returnId = await vehicleProtocolService.createReturnProtocol(actor, bookingId, {
      returnedAt: new Date("2027-11-10T18:00:00Z"),
      returnLocation: "Bauhof Valentinum",
      odometer: 120_640,
      fuelLevel: 80,
      cleaningOk: false,
      condition: "Kühlraum leicht verschmutzt",
      notes: "Reinigung verrechnet",
      damages: [{ description: "Kratzer an der Heckklappe", severity: "MINOR", estimatedCost: 50 }],
      fees: [
        { type: "RENTAL", amount: 120 },
        { type: "CLEANING", amount: 30, note: "Endreinigung" },
      ],
    });

    const bookings = await vehicleProtocolService.listKuehlwagenBookings(actor);
    const current = bookings.find((entry) => entry.id === bookingId);
    if (!current?.handover) throw new Error("Übergabeprotokoll wurde nicht gespeichert.");
    if (!current.return) throw new Error("Rückgabeprotokoll wurde nicht gespeichert.");
    if (current.return.damages.length !== 1) throw new Error("Schaden wurde nicht gespeichert.");
    // Kaution 200 + Miete 120 + Reinigung 30 = 350
    if (current.feeTotal !== 350) throw new Error(`Gebührensumme falsch: ${current.feeTotal}`);

    console.log("Kühlwagen-Übergabe, Rückgabe, Schaden und Gebühren erfolgreich geprüft.");
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
