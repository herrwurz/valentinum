import { describe, expect, it } from "vitest";

import { initialResources } from "./initial-resources";

describe("initialResources", () => {
  it("enthält exakt die vier Ressourcen aus Phase 1", () => {
    expect(initialResources.map(({ name, type }) => ({ name, type }))).toEqual([
      { name: "Großer Saal", type: "ROOM" },
      { name: "Foyer", type: "ROOM" },
      { name: "Lounge", type: "ROOM" },
      { name: "Kühlwagen", type: "VEHICLE" },
    ]);
  });

  it("verwendet eindeutige, stabile Seed-IDs", () => {
    const ids = initialResources.map(({ id }) => id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
