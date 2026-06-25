import { describe, expect, it } from "vitest";

import { resourceInputSchema } from "./resource";

describe("resourceInputSchema", () => {
  it("validiert eine vollständige Ressource", () => {
    const result = resourceInputSchema.parse({
      name: "Seminarraum",
      type: "ROOM",
      description: "Ruhiger Raum",
      location: "Erdgeschoss",
      capacity: 30,
      areaSqm: 52.5,
      publicVisible: true,
      bufferBeforeMinutes: 15,
      bufferAfterMinutes: 30,
    });

    expect(result.name).toBe("Seminarraum");
    expect(result.areaSqm).toBe(52.5);
  });

  it("verhindert negative Pufferzeiten", () => {
    const result = resourceInputSchema.safeParse({
      name: "Kühlanhänger",
      type: "VEHICLE",
      publicVisible: true,
      bufferBeforeMinutes: -1,
      bufferAfterMinutes: 0,
    });

    expect(result.success).toBe(false);
  });

  it("verhindert unbekannte Ressourcenarten", () => {
    const result = resourceInputSchema.safeParse({
      name: "Unbekannt",
      type: "BUILDING",
      publicVisible: false,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
    });

    expect(result.success).toBe(false);
  });
});
