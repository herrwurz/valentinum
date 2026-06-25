import "dotenv/config";

import { prisma } from "../src/lib/prisma/client";
import { ConflictError } from "../src/server/errors";
import { blackoutService } from "../src/server/services/blackout-service";
import { bookingService } from "../src/server/services/booking-service-instance";

const actor = { id: "initial-admin", email: "admin@valentinum.local", role: "ADMIN" as const };
const ids: string[] = [];
const blackoutIds: string[] = [];
const at = (day: number, hour: number) => new Date(Date.UTC(2027, 0, day, hour));

async function createBooking(resourceId: string, title: string, startAt: Date, endAt: Date) {
  const booking = await prisma.booking.create({
    data: {
      title, startAt, endAt, requesterName: "Integrationstest",
      requesterEmail: "integration@example.invalid", createdById: actor.id,
      resources: { create: { resourceId } },
    },
  });
  ids.push(booking.id);
  return booking;
}

async function expectConflict(action: () => Promise<void>) {
  try {
    await action();
  } catch (error) {
    if (error instanceof ConflictError) return;
    throw error;
  }
  throw new Error("Erwarteter Konflikt wurde nicht ausgelöst.");
}

async function main() {
  const foyer = await prisma.resource.findUniqueOrThrow({ where: { id: "initial-room-foyer" } });
  const lounge = await prisma.resource.findUniqueOrThrow({ where: { id: "initial-room-lounge" } });

  try {
    const approved = await createBooking(foyer.id, "Phase 3 genehmigt", at(10, 10), at(10, 12));
    await bookingService.approveBooking(actor, approved.id);
    const overlap = await createBooking(foyer.id, "Phase 3 Konflikt", at(10, 11), at(10, 13));
    await expectConflict(() => bookingService.approveBooking(actor, overlap.id));
    await expectConflict(() => blackoutService.create(actor, {
      resourceId: foyer.id, title: "Unzulässige Sperre", startAt: at(10, 11), endAt: at(10, 12),
    }));

    await blackoutService.create(actor, {
      resourceId: foyer.id, title: "Phase 3 Wartung", startAt: at(11, 14), endAt: at(11, 16),
    });
    const blackout = await prisma.blackoutPeriod.findFirstOrThrow({ where: { title: "Phase 3 Wartung" } });
    blackoutIds.push(blackout.id);
    const blocked = await createBooking(foyer.id, "Phase 3 Blackout-Konflikt", at(11, 15), at(11, 17));
    await expectConflict(() => bookingService.approveBooking(actor, blocked.id));

    const concurrentA = await createBooking(lounge.id, "Phase 3 parallel A", at(12, 10), at(12, 12));
    const concurrentB = await createBooking(lounge.id, "Phase 3 parallel B", at(12, 11), at(12, 13));
    const concurrent = await Promise.allSettled([
      bookingService.approveBooking(actor, concurrentA.id),
      bookingService.approveBooking(actor, concurrentB.id),
    ]);
    if (concurrent.filter((result) => result.status === "fulfilled").length !== 1) {
      throw new Error("Parallele Genehmigung hat nicht exakt eine Buchung zugelassen.");
    }

    const history = await prisma.bookingStatusHistory.count({ where: { bookingId: approved.id, toStatus: "APPROVED" } });
    const audit = await prisma.auditLog.count({ where: { entityType: "Booking", entityId: approved.id, action: "APPROVED" } });
    if (history !== 1 || audit !== 1) throw new Error("Statushistorie oder Audit fehlt.");

    console.log("Genehmigung, Doppelbuchungsschutz, Parallelität, Historie, Audit und Blackouts erfolgreich geprüft.");
  } finally {
    await prisma.auditLog.deleteMany({ where: { OR: [{ entityType: "Booking", entityId: { in: ids } }, { entityType: "BlackoutPeriod", entityId: { in: blackoutIds } }] } });
    await prisma.blackoutPeriod.deleteMany({ where: { id: { in: blackoutIds } } });
    await prisma.booking.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => { console.error(error); process.exit(1); });
