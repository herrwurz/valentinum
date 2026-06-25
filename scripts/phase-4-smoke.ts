import "dotenv/config";

import { prisma } from "../src/lib/prisma/client";
import { calendarService } from "../src/server/services/calendar-service-instance";

const userId = "phase-4-user";
const bookingIds: string[] = [];
const range = { start: new Date("2027-03-01T00:00:00Z"), end: new Date("2027-04-01T00:00:00Z") };

async function main() {
  await prisma.user.upsert({
    where: { email: "phase4@example.invalid" },
    update: { active: true },
    create: { id: userId, email: "phase4@example.invalid", name: "Phase 4 Test", passwordHash: "not-used", role: "USER" },
  });
  try {
    const approved = await prisma.booking.create({ data: {
      title: "Vertraulicher Geburtstag", status: "APPROVED",
      startAt: new Date("2027-03-10T10:00:00Z"), endAt: new Date("2027-03-10T12:00:00Z"),
      requesterName: "Geheime Person", requesterEmail: "secret@example.invalid", internalNote: "Nicht veröffentlichen",
      createdById: userId, resources: { create: { resourceId: "initial-room-foyer" } },
    } });
    bookingIds.push(approved.id);
    const requested = await prisma.booking.create({ data: {
      title: "Eigene Anfrage", status: "REQUESTED",
      startAt: new Date("2027-03-12T10:00:00Z"), endAt: new Date("2027-03-12T12:00:00Z"),
      requesterName: "Phase 4 Test", requesterEmail: "phase4@example.invalid",
      createdById: userId, resources: { create: { resourceId: "initial-room-lounge" } },
    } });
    bookingIds.push(requested.id);

    const publicEvents = await calendarService.getPublicEvents(range);
    const adminEvents = await calendarService.getAdminEvents({ id: "initial-admin", email: "admin@valentinum.local", role: "ADMIN" }, range);
    const userEvents = await calendarService.getUserEvents({ id: userId, email: "phase4@example.invalid", role: "USER" }, range);
    const publicJson = JSON.stringify(publicEvents);
    if (!publicEvents.some((event) => event.title === "Belegt")) throw new Error("Public-Belegt-Ereignis fehlt.");
    for (const secret of [approved.id, "Vertraulicher Geburtstag", "Geheime Person", "secret@example.invalid", "Nicht veröffentlichen"]) {
      if (publicJson.includes(secret)) throw new Error(`Public DTO enthält vertraulichen Wert: ${secret}`);
    }
    if (!adminEvents.some((event) => event.title === "Vertraulicher Geburtstag")) throw new Error("Admin-Details fehlen.");
    if (userEvents.length !== 2) throw new Error("User-Kalender ist nicht auf eigene Buchungen begrenzt.");
    console.log("Public-Anonymisierung, Admin-Details und User-Filter erfolgreich geprüft.");
  } finally {
    await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => { console.error(error); process.exit(1); });
