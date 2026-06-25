import { describe, expect, it } from "vitest";

import { parseCalendarRange } from "./calendar";
import { ValidationError } from "@/server/errors";

describe("parseCalendarRange", () => {
  it("akzeptiert einen gültigen FullCalendar-Zeitraum", () => {
    const params = new URLSearchParams({ start: "2027-01-01T00:00:00Z", end: "2027-02-01T00:00:00Z" });
    expect(parseCalendarRange(params).start.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });

  it("verhindert umgekehrte und übergroße Zeiträume", () => {
    expect(() => parseCalendarRange(new URLSearchParams({ start: "2027-02-01", end: "2027-01-01" }))).toThrow(ValidationError);
    expect(() => parseCalendarRange(new URLSearchParams({ start: "2027-01-01", end: "2028-02-01" }))).toThrow(ValidationError);
  });
});
