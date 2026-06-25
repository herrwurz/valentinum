import { createHmac } from "node:crypto";

import type { BookingStatus } from "@/generated/prisma/client";
import type {
  AdminCalendarEvent, CalendarRange, PublicCalendarEvent, UserCalendarEvent,
} from "@/features/calendar/calendar-types";
import type { Actor } from "@/lib/permissions/roles";
import { requireStaffOrAdmin } from "@/lib/permissions/roles";
import { PermissionError } from "@/server/errors";
import type { CalendarRepository } from "@/server/repositories/calendar-repository";

const iso = (date: Date) => date.toISOString();

export class CalendarService {
  constructor(
    private readonly repository: CalendarRepository,
    private readonly publicIdSecret: string,
    private readonly optionBlocks = process.env.OPTION_BLOCKS !== "false",
  ) {}

  private publicId(type: string, id: string) {
    return createHmac("sha256", this.publicIdSecret).update(`${type}:${id}`).digest("hex").slice(0, 20);
  }

  async getPublicEvents(range: CalendarRange): Promise<PublicCalendarEvent[]> {
    const statuses: BookingStatus[] = this.optionBlocks ? ["APPROVED", "OPTION"] : ["APPROVED"];
    const [bookings, blackouts, events] = await Promise.all([
      this.repository.listBookings(range, { statuses }), this.repository.listBlackouts(range), this.repository.listEvents(range),
    ]);
    const publishedBookingIds = new Set(events.flatMap((event) => event.bookingId ? [event.bookingId] : []));
    const bookingEvents = bookings.flatMap((booking) => {
      if (publishedBookingIds.has(booking.id)) return [];
      const resourceNames = booking.resources.filter(({ resource }) => resource.publicVisible).map(({ resource }) => resource.name);
      return resourceNames.length === 0 ? [] : [{
        id: this.publicId("booking", booking.id), title: "Belegt" as const,
        start: iso(booking.startAt), end: iso(booking.endAt),
        extendedProps: { kind: "BUSY" as const, resourceNames },
      }];
    });
    const blackoutEvents = blackouts.flatMap((blackout) => blackout.resource.publicVisible ? [{
      id: this.publicId("blackout", blackout.id), title: "Belegt" as const,
      start: iso(blackout.startAt), end: iso(blackout.endAt),
      extendedProps: { kind: "BUSY" as const, resourceNames: [blackout.resource.name] },
    }] : []);
    const publicEvents = events.map((event) => ({
      id: event.id, title: event.title, start: iso(event.startsAt), end: iso(event.endsAt),
      extendedProps: {
        kind: "PUBLIC_EVENT" as const, category: event.category,
        description: event.description ?? undefined,
        organizerName: event.publishOrganizer ? event.organizerName ?? undefined : undefined,
        ticketUrl: event.publishTicketLink ? event.ticketUrl ?? undefined : undefined,
        resourceNames: event.booking?.resources.map(({ resource }) => resource.name) ?? [],
      },
    }));
    return [...bookingEvents, ...blackoutEvents, ...publicEvents];
  }

  async getAdminEvents(actor: Actor, range: CalendarRange): Promise<AdminCalendarEvent[]> {
    requireStaffOrAdmin(actor);
    const [bookings, blackouts, events] = await Promise.all([this.repository.listBookings(range), this.repository.listBlackouts(range), this.repository.listEvents(range)]);
    return [
      ...bookings.map((booking) => ({
        id: booking.id, title: booking.title, start: iso(booking.startAt), end: iso(booking.endAt),
        extendedProps: {
          kind: "BOOKING" as const, status: booking.status,
          resourceNames: booking.resources.map(({ resource }) => resource.name),
          requesterName: booking.requesterName, requesterEmail: booking.requesterEmail,
          requesterPhone: booking.requesterPhone ?? undefined, internalNote: booking.internalNote ?? undefined,
        },
      })),
      ...blackouts.map((blackout) => ({
        id: `blackout-${blackout.id}`, title: blackout.title, start: iso(blackout.startAt), end: iso(blackout.endAt),
        extendedProps: { kind: "BLACKOUT" as const, resourceNames: [blackout.resource.name], reason: blackout.reason ?? undefined },
      })),
      ...events.map((event) => ({
        id: `event-${event.id}`, title: event.title, start: iso(event.startsAt), end: iso(event.endsAt),
        extendedProps: { kind: "PUBLIC_EVENT" as const, resourceNames: event.booking?.resources.map(({ resource }) => resource.name) ?? [] },
      })),
    ];
  }

  async getUserEvents(actor: Actor, range: CalendarRange): Promise<UserCalendarEvent[]> {
    if (actor.role !== "USER") throw new PermissionError("Dieser Kalender ist Benutzerkonten vorbehalten.");
    const bookings = await this.repository.listBookings(range, { createdById: actor.id });
    return bookings.map((booking) => ({
      id: booking.id, title: booking.title, start: iso(booking.startAt), end: iso(booking.endAt),
      extendedProps: { kind: "BOOKING", status: booking.status, resourceNames: booking.resources.map(({ resource }) => resource.name) },
    }));
  }
}
