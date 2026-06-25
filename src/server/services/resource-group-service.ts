import type { ResourceGroupRepository } from "@/server/repositories/resource-group-repository";
import { BusinessRuleError, NotFoundError } from "@/server/errors";

export class ResourceGroupService {
  constructor(private readonly repository: ResourceGroupRepository) {}

  async listAll() { return this.repository.list(); }

  async listBookable() {
    return (await this.repository.list()).filter((group) => group.active && group.members.length > 0);
  }

  async resolveBookableGroup(id: string): Promise<string[]> {
    const group = await this.repository.findById(id);
    if (!group) throw new NotFoundError("Raumkombination wurde nicht gefunden.");
    if (!group.active || group.members.length === 0 || group.members.some((member) => !member.active || !member.publicVisible || member.type !== "ROOM")) {
      throw new BusinessRuleError("Raumkombination ist nicht buchbar.");
    }
    return group.members.map((member) => member.id);
  }
}
