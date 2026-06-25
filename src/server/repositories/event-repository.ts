import type { EventInput, AdminEventDto } from "@/features/events/event-types";
import type { Event } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";
import { NotFoundError } from "@/server/errors";

type EventWithBooking = Event & { booking: { title: string } | null };

const adminDto = (event: EventWithBooking): AdminEventDto => ({
  id: event.id, bookingId: event.bookingId ?? undefined, bookingTitle: event.booking?.title,
  title: event.title, subtitle: event.subtitle ?? undefined, description: event.description ?? undefined,
  category: event.category, organizerName: event.organizerName ?? undefined,
  startsAt: event.startsAt, endsAt: event.endsAt, admissionAt: event.admissionAt ?? undefined,
  ticketUrl: event.ticketUrl ?? undefined, imageUrl: event.imageUrl ?? undefined,
  publishOrganizer: event.publishOrganizer, publishTicketLink: event.publishTicketLink,
  publicVisible: event.publicVisible, cancelled: event.cancelled,
});

export interface EventRepository {
  listAdmin(): Promise<AdminEventDto[]>;
  findAdmin(id: string): Promise<AdminEventDto | null>;
  listPublic(): Promise<AdminEventDto[]>;
  findPublic(id: string): Promise<AdminEventDto | null>;
  listLinkableBookings(): Promise<Array<{ id: string; title: string }>>;
  create(input: EventInput, actorId: string): Promise<string>;
  update(id: string, input: EventInput, actorId: string): Promise<void>;
  setPublished(id: string, published: boolean, actorId: string): Promise<void>;
}

export class PrismaEventRepository implements EventRepository {
  async listAdmin() {
    const events = await prisma.event.findMany({ include: { booking: { select: { title: true } } }, orderBy: { startsAt: "asc" } });
    return events.map((event) => adminDto(event));
  }
  async findAdmin(id: string) {
    const event = await prisma.event.findUnique({ where: { id }, include: { booking: { select: { title: true } } } });
    return event ? adminDto(event) : null;
  }
  async listPublic() {
    const events = await prisma.event.findMany({ where: { publicVisible: true, cancelled: false }, include: { booking: { select: { title: true } } }, orderBy: { startsAt: "asc" } });
    return events.map((event) => adminDto(event));
  }
  async findPublic(id: string) {
    const event = await prisma.event.findFirst({ where: { id, publicVisible: true, cancelled: false }, include: { booking: { select: { title: true } } } });
    return event ? adminDto(event) : null;
  }
  listLinkableBookings() {
    return prisma.booking.findMany({ where: { event: null, status: { in: ["APPROVED", "COMPLETED"] } }, select: { id: true, title: true }, orderBy: { startAt: "asc" } });
  }
  async create(input: EventInput, actorId: string) {
    return prisma.$transaction(async (transaction) => {
      const event = await transaction.event.create({
        data: { ...input, bookingId: input.bookingId ?? null },
      });
      await transaction.auditLog.create({ data: { userId: actorId, entityType: "Event", entityId: event.id, action: "CREATED", newValue: { title: event.title, publicVisible: false } } });
      return event.id;
    });
  }
  async update(id: string, input: EventInput, actorId: string) {
    await prisma.$transaction(async (transaction) => {
      const previous = await transaction.event.findUnique({ where: { id } });
      if (!previous) throw new NotFoundError("Veranstaltung wurde nicht gefunden.");
      const event = await transaction.event.update({
        where: { id },
        data: { ...input, bookingId: input.bookingId ?? null },
      });
      await transaction.auditLog.create({ data: { userId: actorId, entityType: "Event", entityId: id, action: "UPDATED", oldValue: { title: previous.title }, newValue: { title: event.title } } });
    });
  }
  async setPublished(id: string, published: boolean, actorId: string) {
    await prisma.$transaction(async (transaction) => {
      const previous = await transaction.event.findUnique({ where: { id } });
      if (!previous) throw new NotFoundError("Veranstaltung wurde nicht gefunden.");
      await transaction.event.update({ where: { id }, data: { publicVisible: published } });
      await transaction.auditLog.create({ data: { userId: actorId, entityType: "Event", entityId: id, action: published ? "PUBLISHED" : "UNPUBLISHED", oldValue: { publicVisible: previous.publicVisible }, newValue: { publicVisible: published } } });
    });
  }
}
