import "dotenv/config";

import { prisma } from "../src/lib/prisma/client";
import { bookingService } from "../src/server/services/booking-service-instance";

const actor = { id: "initial-admin", email: "admin@valentinum.local", role: "ADMIN" as const };
const ids: string[] = [];
const suffix = Date.now().toString(36);

async function find(title: string) {
  const booking = await prisma.booking.findFirstOrThrow({ where: { title } });
  ids.push(booking.id);
  return booking;
}

async function main() {
  try {
    const resources = await bookingService.listRequestableResources();
    if (resources.some((resource) => resource.type === "VEHICLE")) throw new Error("Kühlwagen wurde vor Phase 8 freigeschaltet.");

    const rejectedTitle = `Phase 5 Ablehnung ${suffix}`;
    await bookingService.createBookingRequest(null, {
      title: rejectedTitle, startAt: new Date("2027-08-10T10:00:00Z"), endAt: new Date("2027-08-10T12:00:00Z"),
      requesterName: "Öffentlicher Test", requesterEmail: "public@example.invalid",
      purpose: "Integrationstest", resourceIds: ["initial-room-foyer"],
    });
    const rejected = await find(rejectedTitle);
    const initialHistory = await prisma.bookingStatusHistory.count({ where: { bookingId: rejected.id, toStatus: "REQUESTED" } });
    const initialAudit = await prisma.auditLog.count({ where: { entityId: rejected.id, action: "CREATED" } });
    if (rejected.status !== "REQUESTED" || rejected.createdById !== null || initialHistory !== 1 || initialAudit !== 1) {
      throw new Error("REQUESTED, Initialhistorie oder Audit ist unvollständig.");
    }
    if (!(await bookingService.listRequested(actor)).some((booking) => booking.id === rejected.id)) throw new Error("Admin-Liste enthält Anfrage nicht.");
    await bookingService.rejectBooking(actor, rejected.id, "Test-Ablehnung");

    const approvedTitle = `Phase 5 Genehmigung ${suffix}`;
    await bookingService.createBookingRequest(null, {
      title: approvedTitle, startAt: new Date("2027-08-11T10:00:00Z"), endAt: new Date("2027-08-11T12:00:00Z"),
      requesterName: "Öffentlicher Test", requesterEmail: "public@example.invalid",
      resourceIds: ["initial-room-lounge"],
    });
    const approved = await find(approvedTitle);
    await bookingService.approveBooking(actor, approved.id);

    const states = await prisma.booking.findMany({ where: { id: { in: ids } }, select: { id: true, status: true } });
    if (!states.some((item) => item.id === rejected.id && item.status === "REJECTED")) throw new Error("Ablehnung fehlgeschlagen.");
    if (!states.some((item) => item.id === approved.id && item.status === "APPROVED")) throw new Error("Genehmigung fehlgeschlagen.");
    console.log("Public REQUESTED, Initialhistorie, Audit, Admin-Liste, Genehmigung und Ablehnung erfolgreich geprüft.");
  } finally {
    await prisma.auditLog.deleteMany({ where: { entityType: "Booking", entityId: { in: ids } } });
    await prisma.booking.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => { console.error(error); process.exit(1); });
