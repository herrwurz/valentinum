import "dotenv/config";

import { prisma } from "../src/lib/prisma/client";
import { bookingService } from "../src/server/services/booking-service-instance";
import { calendarService } from "../src/server/services/calendar-service-instance";
import { eventService } from "../src/server/services/event-service-instance";

const actor = { id: "initial-admin", email: "admin@valentinum.local", role: "ADMIN" as const };
let bookingId: string | undefined;
let eventId: string | undefined;
const suffix = Date.now().toString(36);

async function main() {
  try {
    const bookingTitle = `Phase 7 Buchung ${suffix}`;
    await bookingService.createBookingRequest(null, {
      title: bookingTitle, startAt: new Date("2027-11-10T18:00:00Z"), endAt: new Date("2027-11-10T21:00:00Z"),
      requesterName: "Eventtest", requesterEmail: "event@example.invalid", resourceIds: ["initial-room-grosser-saal"],
    });
    bookingId = (await prisma.booking.findFirstOrThrow({ where: { title: bookingTitle } })).id;
    await bookingService.approveBooking(actor, bookingId);
    eventId = await eventService.create(actor, {
      bookingId, title: "Öffentlicher Kabarettabend", description: "Öffentliche Beschreibung", category: "KABARETT",
      organizerName: "Noch interner Veranstalter", startsAt: new Date("2027-11-10T18:00:00Z"), endsAt: new Date("2027-11-10T20:00:00Z"),
      ticketUrl: "https://tickets.example.at", publishOrganizer: false, publishTicketLink: true,
    });
    if ((await eventService.listPublic()).some((event) => event.id === eventId)) throw new Error("Unveröffentlichtes Event ist öffentlich.");
    await eventService.setPublished(actor, eventId, true);
    const publicEvent = await eventService.getPublic(eventId);
    if (!publicEvent?.ticketUrl || publicEvent.organizerName) throw new Error("Feldfreigaben sind fehlerhaft.");
    const calendar = await calendarService.getPublicEvents({ start: new Date("2027-11-01"), end: new Date("2027-12-01") });
    if (!calendar.some((event) => event.title === "Öffentlicher Kabarettabend")) throw new Error("Event fehlt im Public Calendar.");
    if (calendar.some((event) => event.title === "Belegt" && event.extendedProps.resourceNames.includes("Großer Saal"))) throw new Error("Verknüpfte Buchung wird doppelt angezeigt.");
    await eventService.setPublished(actor, eventId, false);
    console.log("Event-CRUD, Veröffentlichung, Feldfreigaben und Public-Calendar-Integration erfolgreich geprüft.");
  } finally {
    if (eventId) await prisma.auditLog.deleteMany({ where: { entityType: "Event", entityId: eventId } });
    if (eventId) await prisma.event.deleteMany({ where: { id: eventId } });
    if (bookingId) await prisma.auditLog.deleteMany({ where: { entityType: "Booking", entityId: bookingId } });
    if (bookingId) await prisma.booking.deleteMany({ where: { id: bookingId } });
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => { console.error(error); process.exit(1); });
