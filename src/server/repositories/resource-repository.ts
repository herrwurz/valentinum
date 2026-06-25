import type { Resource } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";
import type { ResourceInput } from "@/features/resources/resource-types";
import { NotFoundError } from "@/server/errors";

function auditSnapshot(resource: Resource) {
  return {
    id: resource.id,
    name: resource.name,
    type: resource.type,
    description: resource.description,
    location: resource.location,
    capacity: resource.capacity,
    areaSqm: resource.areaSqm?.toString() ?? null,
    active: resource.active,
    publicVisible: resource.publicVisible,
    bufferBeforeMinutes: resource.bufferBeforeMinutes,
    bufferAfterMinutes: resource.bufferAfterMinutes,
  };
}

export interface ResourceRepository {
  listAll(): Promise<Resource[]>;
  findById(id: string): Promise<Resource | null>;
  create(input: ResourceInput, actorId: string): Promise<Resource>;
  update(id: string, input: ResourceInput, actorId: string): Promise<Resource>;
  setActive(id: string, active: boolean, actorId: string): Promise<Resource>;
}

export class PrismaResourceRepository implements ResourceRepository {
  listAll() {
    return prisma.resource.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
    });
  }

  findById(id: string) {
    return prisma.resource.findUnique({ where: { id } });
  }

  create(input: ResourceInput, actorId: string) {
    return prisma.$transaction(async (transaction) => {
      const resource = await transaction.resource.create({ data: input });
      await transaction.auditLog.create({
        data: {
          action: "CREATED",
          entityId: resource.id,
          entityType: "Resource",
          newValue: auditSnapshot(resource),
          userId: actorId,
        },
      });
      return resource;
    });
  }

  update(id: string, input: ResourceInput, actorId: string) {
    return prisma.$transaction(async (transaction) => {
      const previous = await transaction.resource.findUnique({ where: { id } });
      if (!previous) throw new NotFoundError("Ressource wurde nicht gefunden.");

      const resource = await transaction.resource.update({ where: { id }, data: input });
      await transaction.auditLog.create({
        data: {
          action: "UPDATED",
          entityId: id,
          entityType: "Resource",
          oldValue: auditSnapshot(previous),
          newValue: auditSnapshot(resource),
          userId: actorId,
        },
      });
      return resource;
    });
  }

  setActive(id: string, active: boolean, actorId: string) {
    return prisma.$transaction(async (transaction) => {
      const previous = await transaction.resource.findUnique({ where: { id } });
      if (!previous) throw new NotFoundError("Ressource wurde nicht gefunden.");

      const resource = await transaction.resource.update({ where: { id }, data: { active } });
      await transaction.auditLog.create({
        data: {
          action: active ? "REACTIVATED" : "DEACTIVATED",
          entityId: id,
          entityType: "Resource",
          oldValue: auditSnapshot(previous),
          newValue: auditSnapshot(resource),
          userId: actorId,
        },
      });
      return resource;
    });
  }
}
