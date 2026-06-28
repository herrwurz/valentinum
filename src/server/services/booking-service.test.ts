import { describe, expect, it, vi } from "vitest";

import type { Actor } from "@/lib/permissions/roles";
import type { BookingRepository } from "@/server/repositories/booking-repository";
import { BusinessRuleError, PermissionError } from "@/server/errors";
import { BookingService } from "./booking-service";

const admin: Actor = { id: "admin", email: "admin@example.at", role: "ADMIN" };
const user: Actor = { id: "user-1", email: "user@example.at", role: "USER" };
const otherUser: Actor = { id: "user-2", email: "other@example.at", role: "USER" };
const future = new Date("2030-01-15T18:00:00Z");
const past = new Date("2020-01-15T18:00:00Z");

const repository = (overrides: Partial<BookingRepository> = {}): BookingRepository => ({
  findById: vi.fn(),
  listRequestableResources: vi.fn(),
  listRequested: vi.fn(),
  createRequestAtomically: vi.fn(),
  approveAtomically: vi.fn(),
  rejectAtomically: vi.fn(),
  cancelAtomically: vi.fn(),
  completeAtomically: vi.fn(),
  listForAdmin: vi.fn(),
  getDetailForAdmin: vi.fn(),
  createAdminBookingAtomically: vi.fn(),
  listForUser: vi.fn(),
  getDetailForUser: vi.fn(),
  getDashboardStats: vi.fn(),
  ...overrides,
});

describe("BookingService Storno und Abschluss", () => {
  it("erlaubt STAFF das Stornieren genehmigter Buchungen", async () => {
    const repo = repository({
      findById: vi.fn().mockResolvedValue({ id: "b1", status: "APPROVED", startAt: future, createdById: null }),
      cancelAtomically: vi.fn().mockResolvedValue(undefined),
    });
    const service = new BookingService(repo, true, () => new Date("2025-01-01"));
    await service.cancelBooking(admin, "b1", "Termin abgesagt");
    expect(repo.cancelAtomically).toHaveBeenCalledWith("b1", admin.id, "Termin abgesagt", expect.any(Function));
  });

  it("erlaubt USER das Zurückziehen eigener Anfragen", async () => {
    const repo = repository({
      findById: vi.fn().mockResolvedValue({ id: "b1", status: "REQUESTED", startAt: future, createdById: user.id }),
      cancelAtomically: vi.fn().mockResolvedValue(undefined),
    });
    const service = new BookingService(repo, true, () => new Date("2025-01-01"));
    await service.cancelBooking(user, "b1");
    expect(repo.cancelAtomically).toHaveBeenCalled();
  });

  it("verweigert USER-Storno fremder Buchungen", async () => {
    const repo = repository({
      findById: vi.fn().mockResolvedValue({ id: "b1", status: "REQUESTED", startAt: future, createdById: user.id }),
    });
    const service = new BookingService(repo, true, () => new Date("2025-01-01"));
    await expect(service.cancelBooking(otherUser, "b1")).rejects.toBeInstanceOf(PermissionError);
  });

  it("verweigert USER-Storno vergangener genehmigter Buchungen", async () => {
    const repo = repository({
      findById: vi.fn().mockResolvedValue({ id: "b1", status: "APPROVED", startAt: past, createdById: user.id }),
    });
    const service = new BookingService(repo, true, () => new Date("2025-01-01"));
    await expect(service.cancelBooking(user, "b1")).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it("markiert genehmigte Buchungen als abgeschlossen", async () => {
    const repo = repository({
      findById: vi.fn().mockResolvedValue({ id: "b1", status: "APPROVED", startAt: past, createdById: null }),
      completeAtomically: vi.fn().mockResolvedValue(undefined),
    });
    const service = new BookingService(repo);
    await service.completeBooking(admin, "b1");
    expect(repo.completeAtomically).toHaveBeenCalledWith("b1", admin.id, expect.any(Function));
  });

  it("verweigert USER den Abschluss", async () => {
    const repo = repository({
      findById: vi.fn().mockResolvedValue({ id: "b1", status: "APPROVED", startAt: future, createdById: user.id }),
    });
    const service = new BookingService(repo);
    await expect(service.completeBooking(user, "b1")).rejects.toBeInstanceOf(PermissionError);
  });
});
