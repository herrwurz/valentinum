import { describe, expect, it } from "vitest";

import { eventInputSchema } from "./event";

const valid = { title: "Konzert", category: "KONZERT", startsAt: "2027-07-01T19:00", endsAt: "2027-07-01T21:00", publishOrganizer: false, publishTicketLink: false };

describe("eventInputSchema", () => {
  it("validiert Eventzeiten in Europe/Vienna", () => expect(eventInputSchema.parse(valid).startsAt.toISOString()).toBe("2027-07-01T17:00:00.000Z"));
  it("verhindert ungültige Zeiträume und URL-Protokolle", () => {
    expect(eventInputSchema.safeParse({ ...valid, endsAt: "2027-07-01T18:00" }).success).toBe(false);
    expect(eventInputSchema.safeParse({ ...valid, ticketUrl: "javascript:alert(1)" }).success).toBe(false);
  });
});
