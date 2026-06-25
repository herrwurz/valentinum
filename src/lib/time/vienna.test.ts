import { describe, expect, it } from "vitest";

import { parseViennaDateTime } from "./vienna";

describe("parseViennaDateTime", () => {
  it("konvertiert Winterzeit nach UTC", () => {
    expect(parseViennaDateTime("2027-01-10T10:00").toISOString()).toBe("2027-01-10T09:00:00.000Z");
  });

  it("konvertiert Sommerzeit nach UTC", () => {
    expect(parseViennaDateTime("2027-07-10T10:00").toISOString()).toBe("2027-07-10T08:00:00.000Z");
  });

  it("verwirft eine nicht existierende Uhrzeit beim Sommerzeitwechsel", () => {
    expect(parseViennaDateTime("2027-03-28T02:30").getTime()).toBeNaN();
  });
});
