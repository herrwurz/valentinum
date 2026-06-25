import { describe, expect, it } from "vitest";

import type { ResourceGroupRepository } from "@/server/repositories/resource-group-repository";
import { BusinessRuleError, NotFoundError } from "@/server/errors";
import { ResourceGroupService } from "./resource-group-service";

const group = {
  id: "all", name: "Gesamtes Valentinum", active: true,
  members: [
    { id: "lounge", name: "Lounge", type: "ROOM", active: true, publicVisible: true },
    { id: "foyer", name: "Foyer", type: "ROOM", active: true, publicVisible: true },
    { id: "hall", name: "Großer Saal", type: "ROOM", active: true, publicVisible: true },
  ],
};

describe("ResourceGroupService", () => {
  it("löst eine Raumkombination in alle Teilräume auf", async () => {
    const repository: ResourceGroupRepository = { list: async () => [group], findById: async () => group };
    await expect(new ResourceGroupService(repository).resolveBookableGroup("all")).resolves.toEqual(["lounge", "foyer", "hall"]);
  });

  it("verhindert unbekannte und nicht buchbare Gruppen", async () => {
    const missing: ResourceGroupRepository = { list: async () => [], findById: async () => null };
    await expect(new ResourceGroupService(missing).resolveBookableGroup("missing")).rejects.toBeInstanceOf(NotFoundError);
    const inactive: ResourceGroupRepository = { list: async () => [], findById: async () => ({ ...group, members: [{ ...group.members[0]!, active: false }] }) };
    await expect(new ResourceGroupService(inactive).resolveBookableGroup("all")).rejects.toBeInstanceOf(BusinessRuleError);
  });
});
