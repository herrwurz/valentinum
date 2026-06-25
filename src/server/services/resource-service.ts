import type { Resource } from "@/generated/prisma/client";
import type { ResourceDto, ResourceInput } from "@/features/resources/resource-types";
import type { Actor } from "@/lib/permissions/roles";
import { requireAdmin } from "@/lib/permissions/roles";
import {
  PrismaResourceRepository,
  type ResourceRepository,
} from "@/server/repositories/resource-repository";
import { NotFoundError } from "@/server/errors";

function toDto(resource: Resource): ResourceDto {
  return {
    id: resource.id,
    name: resource.name,
    type: resource.type,
    description: resource.description ?? undefined,
    location: resource.location ?? undefined,
    capacity: resource.capacity ?? undefined,
    areaSqm: resource.areaSqm ? Number(resource.areaSqm) : undefined,
    active: resource.active,
    publicVisible: resource.publicVisible,
    bufferBeforeMinutes: resource.bufferBeforeMinutes,
    bufferAfterMinutes: resource.bufferAfterMinutes,
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
  };
}

export class ResourceService {
  constructor(private readonly repository: ResourceRepository) {}

  async listForAdmin(actor: Actor): Promise<ResourceDto[]> {
    requireAdmin(actor);
    return (await this.repository.listAll()).map(toDto);
  }

  async getForAdmin(actor: Actor, id: string): Promise<ResourceDto> {
    requireAdmin(actor);
    const resource = await this.repository.findById(id);
    if (!resource) throw new NotFoundError("Ressource wurde nicht gefunden.");
    return toDto(resource);
  }

  async create(actor: Actor, input: ResourceInput): Promise<ResourceDto> {
    requireAdmin(actor);
    return toDto(await this.repository.create(input, actor.id));
  }

  async update(actor: Actor, id: string, input: ResourceInput): Promise<ResourceDto> {
    requireAdmin(actor);
    return toDto(await this.repository.update(id, input, actor.id));
  }

  async setActive(actor: Actor, id: string, active: boolean): Promise<ResourceDto> {
    requireAdmin(actor);
    return toDto(await this.repository.setActive(id, active, actor.id));
  }
}

export const resourceService = new ResourceService(new PrismaResourceRepository());
