import "dotenv/config";

import { prisma } from "../src/lib/prisma/client";
import { ConflictError } from "../src/server/errors";
import { bookingService } from "../src/server/services/booking-service-instance";

const actor = { id: "initial-admin", email: "admin@valentinum.local", role: "ADMIN" as const };
const ids: string[] = [];
const suffix = Date.now().toString(36);

async function byTitle(title: string) {
  const booking = await prisma.booking.findFirstOrThrow({ where: { title }, include: { resources: true } });
  ids.push(booking.id);
  return booking;
}

async function main() {
  try {
    const groups = await prisma.resourceGroup.findMany({ include: { members: true } });
    if (groups.length !== 3 || !groups.some((group) => group.id === "initial-group-gesamt" && group.members.length === 3)) {
      throw new Error("Initiale Raumkombinationen sind unvollständig.");
    }

    const groupTitle = `Phase 6 Gesamt ${suffix}`;
    await bookingService.createBookingRequest(null, {
      title: groupTitle, startAt: new Date("2027-09-10T10:00:00Z"), endAt: new Date("2027-09-10T12:00:00Z"),
      requesterName: "Gruppentest", requesterEmail: "group@example.invalid",
      resourceIds: [], resourceGroupId: "initial-group-gesamt",
    });
    const groupBooking = await byTitle(groupTitle);
    if (groupBooking.resources.length !== 3) throw new Error("Gruppenbuchung enthält nicht alle drei Teilräume.");
    await bookingService.approveBooking(actor, groupBooking.id);

    const partTitle = `Phase 6 Foyer ${suffix}`;
    await bookingService.createBookingRequest(null, {
      title: partTitle, startAt: new Date("2027-09-10T11:00:00Z"), endAt: new Date("2027-09-10T13:00:00Z"),
      requesterName: "Teilraumtest", requesterEmail: "part@example.invalid",
      resourceIds: ["initial-room-foyer"],
    });
    const partBooking = await byTitle(partTitle);
    try {
      await bookingService.approveBooking(actor, partBooking.id);
      throw new Error("Teilraum wurde trotz genehmigter Gruppenbuchung freigegeben.");
    } catch (error) {
      if (!(error instanceof ConflictError)) throw error;
    }
    console.log("Drei Raumkombinationen, Gruppenauflösung und Teilraumblockierung erfolgreich geprüft.");
  } finally {
    await prisma.auditLog.deleteMany({ where: { entityType: "Booking", entityId: { in: ids } } });
    await prisma.booking.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => { console.error(error); process.exit(1); });
