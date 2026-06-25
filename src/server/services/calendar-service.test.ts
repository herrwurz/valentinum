import { describe, expect, it, vi } from "vitest";

import type { Actor } from "@/lib/permissions/roles";
import { PermissionError } from "@/server/errors";
import type { CalendarRepository } from "@/server/repositories/calendar-repository";
import { CalendarService } from "./calendar-service";

const range = { start: new Date("2027-01-01T00:00:00Z"), end: new Date("2027-02-01T00:00:00Z") };
const booking = {
  id: "internal-booking-id", title: "Hochzeit Müller", status: "APPROVED" as const,
  startAt: new Date("2027-01-10T10:00:00Z"), endAt: new Date("2027-01-10T12:00:00Z"),
  requesterName: "Maria Müller", requesterEmail: "maria@example.at", requesterPhone: "+43123",
  internalNote: "Interne Notiz", resources: [{ resource: { name: "Foyer", publicVisible: true } }],
};
const blackout = {
  id: "internal-blackout-id", title: "Technische Wartung", reason: "Interner Grund",
  startAt: new Date("2027-01-12T10:00:00Z"), endAt: new Date("2027-01-12T12:00:00Z"),
  resource: { name: "Lounge", publicVisible: true },
};
const repository = (): CalendarRepository => ({
  listBookings: vi.fn().mockResolvedValue([booking]),
  listBlackouts: vi.fn().mockResolvedValue([blackout]),
  listEvents: vi.fn().mockResolvedValue([]),
});

describe("CalendarService", () => {
  it("liefert Public DTOs ohne personenbezogene oder interne Daten", async () => {
    const events = await new CalendarService(repository(), "test-secret", true).getPublicEvents(range);
    const serialized = JSON.stringify(events);
    expect(events).toHaveLength(2);
    expect(events.every((event) => event.title === "Belegt")).toBe(true);
    expect(serialized).not.toContain("Müller");
    expect(serialized).not.toContain("maria@example.at");
    expect(serialized).not.toContain("Interne Notiz");
    expect(serialized).not.toContain("Technische Wartung");
    expect(serialized).not.toContain("internal-booking-id");
  });

  it("liefert Admins vollständige Buchungs- und Sperrzeitdetails", async () => {
    const actor: Actor = { id: "admin", email: "admin@example.at", role: "ADMIN" };
    const events = await new CalendarService(repository(), "secret").getAdminEvents(actor, range);
    expect(events).toEqual(expect.arrayContaining([
      expect.objectContaining({ title: "Hochzeit Müller", extendedProps: expect.objectContaining({ requesterEmail: "maria@example.at" }) }),
      expect.objectContaining({ title: "Technische Wartung", extendedProps: expect.objectContaining({ kind: "BLACKOUT" }) }),
    ]));
  });

  it("beschränkt den User-Kalender auf Benutzerrollen und createdById", async () => {
    const repo = repository();
    const service = new CalendarService(repo, "secret");
    await service.getUserEvents({ id: "user-1", email: "u@example.at", role: "USER" }, range);
    expect(repo.listBookings).toHaveBeenCalledWith(range, { createdById: "user-1" });
    await expect(service.getUserEvents({ id: "staff", email: "s@example.at", role: "STAFF" }, range)).rejects.toBeInstanceOf(PermissionError);
  });

  it("unterdrückt Buchungen ausschließlich nichtöffentlicher Ressourcen", async () => {
    const repo = repository();
    vi.mocked(repo.listBookings).mockResolvedValue([{ ...booking, resources: [{ resource: { name: "Intern", publicVisible: false } }] }]);
    vi.mocked(repo.listBlackouts).mockResolvedValue([]);
    expect(await new CalendarService(repo, "secret").getPublicEvents(range)).toEqual([]);
  });
});
