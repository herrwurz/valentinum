import { describe, expect, it } from "vitest";

import { ValidationError } from "@/server/errors";
import { assertReturnAfterHandover, chargeableFeeTotal, sumFees } from "./vehicle-protocol-rules";

const handover = new Date("2027-11-10T08:00:00.000Z");

describe("assertReturnAfterHandover", () => {
  it("erlaubt eine Rückgabe nach der Übergabe", () => {
    expect(() => assertReturnAfterHandover(handover, new Date("2027-11-10T18:00:00.000Z"))).not.toThrow();
  });
  it("erlaubt eine Rückgabe exakt zum Übergabezeitpunkt", () => {
    expect(() => assertReturnAfterHandover(handover, new Date(handover))).not.toThrow();
  });
  it("verhindert eine Rückgabe vor der Übergabe", () => {
    expect(() => assertReturnAfterHandover(handover, new Date("2027-11-10T07:59:00.000Z"))).toThrow(ValidationError);
  });
});

describe("Gebührensummen", () => {
  const fees = [
    { type: "DEPOSIT" as const, amount: 200 },
    { type: "RENTAL" as const, amount: 120 },
    { type: "DAMAGE" as const, amount: 50 },
  ];
  it("summiert alle Beträge inklusive Kaution", () => {
    expect(sumFees(fees)).toBe(370);
  });
  it("summiert nur die verrechneten Beträge ohne Kaution", () => {
    expect(chargeableFeeTotal(fees)).toBe(170);
  });
  it("liefert null bei fehlenden Gebühren", () => {
    expect(sumFees([])).toBe(0);
    expect(chargeableFeeTotal([])).toBe(0);
  });
});
