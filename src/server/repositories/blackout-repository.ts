import { Prisma } from "@/generated/prisma/client";
import type { ConflictBooking } from "@/features/bookings/booking-types";
import type { BlackoutDto, BlackoutInput } from "@/features/blackouts/blackout-types";
import { prisma } from "@/lib/prisma/client";
import { NotFoundError } from "@/server/errors";

export interface BlackoutCreationContext {
  resource: { id: string; active: boolean; bufferBeforeMinutes: number; bufferAfterMinutes: number };
  bookings: ConflictBooking[];
}

export interface BlackoutRepository {
  list(): Promise<BlackoutDto[]>;
  listActiveResources(): Promise<Array<{ id: string; name: string }>>;
  create(input: BlackoutInput, actorId: string, validate: (context: BlackoutCreationContext) => void): Promise<void>;
  delete(id: string, actorId: string): Promise<void>;
}

export class PrismaBlackoutRepository implements BlackoutRepository {
  async list(): Promise<BlackoutDto[]> {
    const rows = await prisma.blackoutPeriod.findMany({
      include: { resource: { select: { name: true } } },
      orderBy: [{ startAt: "asc" }, { title: "asc" }],
    });
    return rows.map(({ resource, ...row }) => ({ ...row, reason: row.reason ?? undefined, resourceName: resource.name }));
  }

  listActiveResources() {
    return prisma.resource.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  }

  async create(input: BlackoutInput, actorId: string, validate: (context: BlackoutCreationContext) => void) {
    await prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw(Prisma.sql`SELECT id FROM "Resource" WHERE id = ${input.resourceId} FOR UPDATE`);
      const resource = await transaction.resource.findUnique({ where: { id: input.resourceId } });
      if (!resource) throw new NotFoundError("Ressource wurde nicht gefunden.");
      const bookings = await transaction.booking.findMany({
        where: { status: "APPROVED", resources: { some: { resourceId: input.resourceId } } },
        include: { resources: { include: { resource: true } } },
      });
      validate({
        resource,
        bookings: bookings.map((booking) => ({
          id: booking.id, title: booking.title, status: booking.status,
          startAt: booking.startAt, endAt: booking.endAt,
          resources: booking.resources.map(({ resource: item }) => ({
            id: item.id, bufferBeforeMinutes: item.bufferBeforeMinutes, bufferAfterMinutes: item.bufferAfterMinutes,
          })),
        })),
      });
      const blackout = await transaction.blackoutPeriod.create({ data: input });
      await transaction.auditLog.create({
        data: { userId: actorId, entityType: "BlackoutPeriod", entityId: blackout.id, action: "CREATED", newValue: {
          resourceId: input.resourceId, title: input.title, reason: input.reason ?? null,
          startAt: input.startAt.toISOString(), endAt: input.endAt.toISOString(),
        } },
      });
    }, { timeout: 15_000 });
  }

  async delete(id: string, actorId: string) {
    await prisma.$transaction(async (transaction) => {
      const blackout = await transaction.blackoutPeriod.findUnique({ where: { id } });
      if (!blackout) throw new NotFoundError("Sperrzeit wurde nicht gefunden.");
      await transaction.blackoutPeriod.delete({ where: { id } });
      await transaction.auditLog.create({
        data: { userId: actorId, entityType: "BlackoutPeriod", entityId: id, action: "DELETED", oldValue: {
          resourceId: blackout.resourceId, title: blackout.title,
          startAt: blackout.startAt.toISOString(), endAt: blackout.endAt.toISOString(),
        } },
      });
    });
  }
}
