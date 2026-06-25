import { describe, expect, it } from "vitest";

import { bookingRequestSchema } from "./booking-request";

const valid = {
  title: "Vereinsabend", startAt: "2027-07-10T18:00", endAt: "2027-07-10T22:00",
  requesterName: "Max Mustermann", requesterEmail: "MAX@EXAMPLE.AT",
  resourceIds: ["room-1"],
};

describe("bookingRequestSchema", () => {
  it("validiert und konvertiert eine Anfrage in Europe/Vienna", () => {
    const result = bookingRequestSchema.parse(valid);
    expect(result.startAt.toISOString()).toBe("2027-07-10T16:00:00.000Z");
  });

  it("verlangt Ressource, Kontakt und positiven Zeitraum", () => {
    expect(bookingRequestSchema.safeParse({ ...valid, resourceIds: [] }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...valid, requesterEmail: "ungültig" }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...valid, endAt: "2027-07-10T17:00" }).success).toBe(false);
  });

  it("akzeptiert eine Raumkombination ohne direkte Ressource", () => {
    expect(bookingRequestSchema.safeParse({ ...valid, resourceIds: [], resourceGroupId: "group-all" }).success).toBe(true);
  });
});
