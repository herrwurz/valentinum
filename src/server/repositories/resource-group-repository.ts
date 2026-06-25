import type { ResourceGroupDto } from "@/features/resources/resource-group-types";
import { prisma } from "@/lib/prisma/client";

export interface ResourceGroupRepository {
  list(): Promise<ResourceGroupDto[]>;
  findById(id: string): Promise<ResourceGroupDto | null>;
}

export class PrismaResourceGroupRepository implements ResourceGroupRepository {
  async list() {
    const groups = await prisma.resourceGroup.findMany({
      include: { members: { include: { resource: true } } }, orderBy: { name: "asc" },
    });
    return groups.map((group) => ({
      id: group.id, name: group.name, active: group.active,
      members: group.members.map(({ resource }) => ({ id: resource.id, name: resource.name, type: resource.type, active: resource.active, publicVisible: resource.publicVisible, capacity: resource.capacity ?? undefined })),
    }));
  }

  async findById(id: string) {
    const group = await prisma.resourceGroup.findUnique({
      where: { id }, include: { members: { include: { resource: true } } },
    });
    return group ? {
      id: group.id, name: group.name, active: group.active,
      members: group.members.map(({ resource }) => ({ id: resource.id, name: resource.name, type: resource.type, active: resource.active, publicVisible: resource.publicVisible, capacity: resource.capacity ?? undefined })),
    } : null;
  }
}
