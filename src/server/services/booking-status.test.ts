import { describe, expect, it } from "vitest";

import { assertStatusTransition, canTransition } from "./booking-status";
import { BusinessRuleError } from "@/server/errors";

describe("booking status transitions", () => {
  it.each([
    ["DRAFT", "REQUESTED"], ["REQUESTED", "APPROVED"], ["REQUESTED", "REJECTED"],
    ["REQUESTED", "CANCELLED"], ["OPTION", "APPROVED"], ["OPTION", "CANCELLED"],
    ["APPROVED", "CANCELLED"], ["APPROVED", "COMPLETED"], ["COMPLETED", "ARCHIVED"],
  ] as const)("erlaubt %s -> %s", (from, to) => expect(canTransition(from, to)).toBe(true));

  it("verhindert nicht dokumentierte Übergänge", () => {
    expect(() => assertStatusTransition("REJECTED", "APPROVED")).toThrow(BusinessRuleError);
    expect(canTransition("DRAFT", "APPROVED")).toBe(false);
  });
});
