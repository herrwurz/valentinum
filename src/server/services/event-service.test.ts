import { describe, expect, it, vi } from "vitest";

import type { AdminEventDto } from "@/features/events/event-types";
import type { Actor } from "@/lib/permissions/roles";
import type { EventRepository } from "@/server/repositories/event-repository";
import { EventService, toPublicDto } from "./event-service";

const event: AdminEventDto = {
  id: "event-1", title: "Kabarettabend", category: "KABARETT",
  startsAt: new Date("2027-10-10T18:00:00Z"), endsAt: new Date("2027-10-10T20:00:00Z"),
  organizerName: "Interner Veranstalter", ticketUrl: "https://tickets.example.at", imageUrl: "https://images.example.at/a.jpg",
  publishOrganizer: false, publishTicketLink: false, publicVisible: true, cancelled: false,
};
const repository = (): EventRepository => ({
  listAdmin: vi.fn().mockResolvedValue([event]), findAdmin: vi.fn().mockResolvedValue(event),
  listPublic: vi.fn().mockResolvedValue([event]), findPublic: vi.fn().mockResolvedValue(event),
  listLinkableBookings: vi.fn().mockResolvedValue([]), create: vi.fn().mockResolvedValue("event-1"),
  update: vi.fn().mockResolvedValue(undefined), setPublished: vi.fn().mockResolvedValue(undefined),
});
const staff: Actor = { id: "staff", email: "staff@example.at", role: "STAFF" };

describe("EventService", () => {
  it("gibt Veranstalter und Ticketlink nur mit eigener Freigabe aus", () => {
    expect(toPublicDto(event)).not.toHaveProperty("organizerName");
    expect(toPublicDto(event)).not.toHaveProperty("ticketUrl");
    expect(toPublicDto({ ...event, publishOrganizer: true, publishTicketLink: true })).toEqual(expect.objectContaining({
      organizerName: "Interner Veranstalter", ticketUrl: "https://tickets.example.at",
    }));
  });
  it("erlaubt STAFF die Eventverwaltung", async () => {
    const repo = repository(); const service = new EventService(repo);
    await service.setPublished(staff, event.id, true);
    expect(repo.setPublished).toHaveBeenCalledWith(event.id, true, staff.id);
  });
});
