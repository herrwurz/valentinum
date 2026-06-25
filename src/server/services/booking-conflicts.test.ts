import { describe, expect, it } from "vitest";

import { checkBookingConflicts } from "./booking-conflicts";

const date = (value: string) => new Date(`2026-07-01T${value}:00.000Z`);
const room = { id: "room", bufferBeforeMinutes: 0, bufferAfterMinutes: 0 };
const booking = (status: "REQUESTED" | "APPROVED" | "CANCELLED" | "OPTION", start = "10:00", end = "12:00") => ({
  id: `${status}-${start}`,
  title: status,
  status,
  startAt: date(start),
  endAt: date(end),
  resources: [room],
});

function conflicts(overrides: Partial<Parameters<typeof checkBookingConflicts>[0]> = {}) {
  return checkBookingConflicts({
    startAt: date("11:00"), endAt: date("13:00"), resources: [room], bookings: [], blackouts: [],
    optionBlocks: false, ...overrides,
  });
}

describe("checkBookingConflicts", () => {
  it("erlaubt parallele REQUESTED-Buchungen", () => expect(conflicts({ bookings: [booking("REQUESTED")] })).toHaveLength(0));
  it("blockiert überlappende APPROVED-Buchungen", () => expect(conflicts({ bookings: [booking("APPROVED")] })).toHaveLength(1));
  it("ignoriert CANCELLED-Buchungen", () => expect(conflicts({ bookings: [booking("CANCELLED")] })).toHaveLength(0));
  it("behandelt OPTION konfigurierbar", () => {
    expect(conflicts({ bookings: [booking("OPTION")], optionBlocks: false })).toHaveLength(0);
    expect(conflicts({ bookings: [booking("OPTION")], optionBlocks: true })).toHaveLength(1);
  });
  it("erlaubt angrenzende Intervalle ohne Puffer", () => expect(conflicts({ startAt: date("12:00"), endAt: date("13:00"), bookings: [booking("APPROVED")] })).toHaveLength(0));
  it("blockiert angrenzende Intervalle bei Pufferverletzung", () => expect(conflicts({ startAt: date("12:00"), endAt: date("13:00"), resources: [{ ...room, bufferBeforeMinutes: 30 }], bookings: [booking("APPROVED")] })).toHaveLength(1));
  it("blockiert Blackout Periods", () => expect(conflicts({ blackouts: [{ id: "blackout", title: "Wartung", resourceId: "room", startAt: date("12:30"), endAt: date("14:00") }] })).toEqual([expect.objectContaining({ type: "BLACKOUT" })]));
  it("ignoriert die bearbeitete Buchung", () => expect(conflicts({ bookings: [booking("APPROVED")], ignoreBookingId: "APPROVED-10:00" })).toHaveLength(0));
});
