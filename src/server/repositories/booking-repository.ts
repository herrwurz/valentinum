import { Prisma, type BookingStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";
import type { ConflictBlackout, ConflictBooking } from "@/features/bookings/booking-types";
import type { BookingRequestInput, RequestedBookingDto } from "@/features/bookings/booking-types";
import { NotFoundError } from "@/server/errors";

export interface ApprovalContext {
  booking: {
    id: string;
    title: string;
    status: BookingStatus;
    startAt: Date;
    endAt: Date;
    resources: Array<{ id: string; active: boolean; bufferBeforeMinutes: number; bufferAfterMinutes: number }>;
  };
  bookings: ConflictBooking[];
  blackouts: ConflictBlackout[];
}

export interface BookingSummary {
  id: string;
  status: BookingStatus;
  startAt: Date;
  createdById: string | null;
}

export interface BookingRepository {
  findById(bookingId: string): Promise<BookingSummary | null>;
  listRequestableResources(): Promise<Array<{ id: string; name: string; type: string }>>;
  listRequested(): Promise<RequestedBookingDto[]>;
  createRequestAtomically(
    input: BookingRequestInput,
    actorId: string | undefined,
    validate: (resources: Array<{ id: string; active: boolean; publicVisible: boolean; type: string }>) => void,
  ): Promise<string>;
  approveAtomically(
    bookingId: string,
    actorId: string,
    validate: (context: ApprovalContext) => void,
  ): Promise<void>;
  rejectAtomically(bookingId: string, actorId: string, reason: string, validate: (status: BookingStatus) => void): Promise<void>;
  cancelAtomically(
    bookingId: string,
    actorId: string,
    reason: string | undefined,
    validate: (status: BookingStatus) => void,
  ): Promise<void>;
  completeAtomically(bookingId: string, actorId: string, validate: (status: BookingStatus) => void): Promise<void>;
}

export class PrismaBookingRepository implements BookingRepository {
  async findById(bookingId: string): Promise<BookingSummary | null> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true, startAt: true, createdById: true },
    });
    return booking ?? null;
  }

  listRequestableResources() {
    return prisma.resource.findMany({
      where: { active: true, publicVisible: true, type: { in: ["ROOM", "EQUIPMENT"] } },
      select: { id: true, name: true, type: true }, orderBy: { name: "asc" },
    });
  }

  async listRequested(): Promise<RequestedBookingDto[]> {
    const bookings = await prisma.booking.findMany({
      where: { status: "REQUESTED" }, include: { resources: { include: { resource: { select: { name: true } } } } },
      orderBy: { createdAt: "asc" },
    });
    return bookings.map((booking) => ({
      id: booking.id, title: booking.title, status: "REQUESTED", startAt: booking.startAt, endAt: booking.endAt,
      requesterName: booking.requesterName, requesterEmail: booking.requesterEmail,
      requesterPhone: booking.requesterPhone ?? undefined, purpose: booking.purpose ?? undefined,
      resourceIds: booking.resources.map(({ resourceId }) => resourceId),
      resourceNames: booking.resources.map(({ resource }) => resource.name), createdAt: booking.createdAt,
    }));
  }

  async createRequestAtomically(
    input: BookingRequestInput,
    actorId: string | undefined,
    validate: (resources: Array<{ id: string; active: boolean; publicVisible: boolean; type: string }>) => void,
  ): Promise<string> {
    return prisma.$transaction(async (transaction) => {
      const resources = await transaction.resource.findMany({ where: { id: { in: input.resourceIds } } });
      validate(resources);
      const booking = await transaction.booking.create({ data: {
        title: input.title, startAt: input.startAt, endAt: input.endAt,
        requesterName: input.requesterName, requesterEmail: input.requesterEmail,
        requesterPhone: input.requesterPhone, purpose: input.purpose, createdById: actorId,
        resources: { create: input.resourceIds.map((resourceId) => ({ resourceId })) },
        history: { create: { toStatus: "REQUESTED", changedById: actorId } },
      } });
      await transaction.auditLog.create({ data: {
        userId: actorId, entityType: "Booking", entityId: booking.id, action: "CREATED",
        newValue: { status: "REQUESTED", startAt: input.startAt.toISOString(), endAt: input.endAt.toISOString(), resourceIds: input.resourceIds },
      } });
      return booking.id;
    });
  }

  async approveAtomically(
    bookingId: string,
    actorId: string,
    validate: (context: ApprovalContext) => void,
  ): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      const candidate = await transaction.booking.findUnique({
        where: { id: bookingId },
        include: { resources: { include: { resource: true } } },
      });
      if (!candidate) throw new NotFoundError("Buchung wurde nicht gefunden.");

      const resourceIds = candidate.resources.map(({ resourceId }) => resourceId).sort();
      if (resourceIds.length > 0) {
        await transaction.$queryRaw(
          Prisma.sql`SELECT id FROM "Resource" WHERE id IN (${Prisma.join(resourceIds)}) ORDER BY id FOR UPDATE`,
        );
      }

      const blockingBookings = await transaction.booking.findMany({
        where: {
          id: { not: bookingId },
          status: { in: ["APPROVED", "OPTION"] },
          resources: { some: { resourceId: { in: resourceIds } } },
        },
        include: { resources: { include: { resource: true } } },
      });
      const blackouts = await transaction.blackoutPeriod.findMany({
        where: { resourceId: { in: resourceIds } },
      });

      validate({
        booking: {
          id: candidate.id,
          title: candidate.title,
          status: candidate.status,
          startAt: candidate.startAt,
          endAt: candidate.endAt,
          resources: candidate.resources.map(({ resource }) => ({
            id: resource.id,
            active: resource.active,
            bufferBeforeMinutes: resource.bufferBeforeMinutes,
            bufferAfterMinutes: resource.bufferAfterMinutes,
          })),
        },
        bookings: blockingBookings.map((booking) => ({
          id: booking.id,
          title: booking.title,
          status: booking.status,
          startAt: booking.startAt,
          endAt: booking.endAt,
          resources: booking.resources.map(({ resource }) => ({
            id: resource.id,
            bufferBeforeMinutes: resource.bufferBeforeMinutes,
            bufferAfterMinutes: resource.bufferAfterMinutes,
          })),
        })),
        blackouts,
      });

      await transaction.booking.update({
        where: { id: bookingId },
        data: { status: "APPROVED", updatedById: actorId },
      });
      await transaction.bookingStatusHistory.create({
        data: {
          bookingId,
          fromStatus: candidate.status,
          toStatus: "APPROVED",
          changedById: actorId,
        },
      });
      await transaction.auditLog.create({
        data: {
          userId: actorId,
          entityType: "Booking",
          entityId: bookingId,
          action: "APPROVED",
          oldValue: { status: candidate.status },
          newValue: { status: "APPROVED" },
        },
      });
    }, { timeout: 15_000 });
  }

  async rejectAtomically(bookingId: string, actorId: string, reason: string, validate: (status: BookingStatus) => void): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      const booking = await transaction.booking.findUnique({ where: { id: bookingId } });
      if (!booking) throw new NotFoundError("Buchung wurde nicht gefunden.");
      validate(booking.status);
      await transaction.booking.update({ where: { id: bookingId }, data: { status: "REJECTED", updatedById: actorId } });
      await transaction.bookingStatusHistory.create({ data: {
        bookingId, fromStatus: booking.status, toStatus: "REJECTED", reason, changedById: actorId,
      } });
      await transaction.auditLog.create({ data: {
        userId: actorId, entityType: "Booking", entityId: bookingId, action: "REJECTED",
        oldValue: { status: booking.status }, newValue: { status: "REJECTED", reason },
      } });
    });
  }

  async cancelAtomically(
    bookingId: string,
    actorId: string,
    reason: string | undefined,
    validate: (status: BookingStatus) => void,
  ): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      const booking = await transaction.booking.findUnique({ where: { id: bookingId } });
      if (!booking) throw new NotFoundError("Buchung wurde nicht gefunden.");
      validate(booking.status);
      await transaction.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED", updatedById: actorId } });
      await transaction.bookingStatusHistory.create({
        data: {
          bookingId,
          fromStatus: booking.status,
          toStatus: "CANCELLED",
          reason: reason ?? undefined,
          changedById: actorId,
        },
      });
      await transaction.auditLog.create({
        data: {
          userId: actorId,
          entityType: "Booking",
          entityId: bookingId,
          action: "CANCELLED",
          oldValue: { status: booking.status },
          newValue: { status: "CANCELLED", reason: reason ?? undefined },
        },
      });
    });
  }

  async completeAtomically(bookingId: string, actorId: string, validate: (status: BookingStatus) => void): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      const booking = await transaction.booking.findUnique({ where: { id: bookingId } });
      if (!booking) throw new NotFoundError("Buchung wurde nicht gefunden.");
      validate(booking.status);
      await transaction.booking.update({ where: { id: bookingId }, data: { status: "COMPLETED", updatedById: actorId } });
      await transaction.bookingStatusHistory.create({
        data: {
          bookingId,
          fromStatus: booking.status,
          toStatus: "COMPLETED",
          changedById: actorId,
        },
      });
      await transaction.auditLog.create({
        data: {
          userId: actorId,
          entityType: "Booking",
          entityId: bookingId,
          action: "COMPLETED",
          oldValue: { status: booking.status },
          newValue: { status: "COMPLETED" },
        },
      });
    });
  }
}
