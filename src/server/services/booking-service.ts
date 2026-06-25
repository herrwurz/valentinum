import type { Actor } from "@/lib/permissions/roles";
import { requireStaffOrAdmin } from "@/lib/permissions/roles";
import { ConflictError, BusinessRuleError, ValidationError, NotFoundError, PermissionError } from "@/server/errors";
import type { BookingRequestInput, BookingStatusValue } from "@/features/bookings/booking-types";
import type { BookingRepository } from "@/server/repositories/booking-repository";
import { checkBookingConflicts } from "@/server/services/booking-conflicts";
import { assertStatusTransition } from "@/server/services/booking-status";
import type { ResourceGroupService } from "@/server/services/resource-group-service";

export class BookingService {
  constructor(
    private readonly repository: BookingRepository,
    private readonly optionBlocks = process.env.OPTION_BLOCKS !== "false",
    private readonly now: () => Date = () => new Date(),
    private readonly groups?: ResourceGroupService,
  ) {}

  listRequestableResources() {
    return this.repository.listRequestableResources();
  }

  async listBookingOptions() {
    if (!this.groups) throw new BusinessRuleError("Raumkombinationen sind nicht verfügbar.");
    const [resources, groups] = await Promise.all([this.repository.listRequestableResources(), this.groups.listBookable()]);
    return {
      rooms: resources.filter((resource) => resource.type === "ROOM"),
      equipment: resources.filter((resource) => resource.type === "EQUIPMENT"),
      groups,
    };
  }

  async listRequested(actor: Actor) {
    requireStaffOrAdmin(actor);
    return this.repository.listRequested();
  }

  async createBookingRequest(actor: Actor | null, input: BookingRequestInput): Promise<void> {
    if (!(input.startAt < input.endAt)) throw new ValidationError("Beginn muss vor dem Ende liegen.");
    if (input.startAt < this.now()) throw new ValidationError("Buchungen in der Vergangenheit sind nicht möglich.");
    const directResourceIds = [...new Set(input.resourceIds)];
    if (directResourceIds.length !== input.resourceIds.length) {
      throw new ValidationError("Ungültige Ressourcenauswahl.");
    }
    if (input.resourceGroupId && !this.groups) {
      throw new BusinessRuleError("Raumkombinationen sind nicht verfügbar.");
    }
    const groupResourceIds = input.resourceGroupId
      ? await this.groups!.resolveBookableGroup(input.resourceGroupId)
      : [];
    const uniqueResourceIds = [...new Set([...directResourceIds, ...groupResourceIds])];
    if (uniqueResourceIds.length === 0) throw new ValidationError("Mindestens eine Ressource ist erforderlich.");
    await this.repository.createRequestAtomically({ ...input, resourceIds: uniqueResourceIds }, actor?.id, (resources) => {
      if (resources.length !== uniqueResourceIds.length) throw new ValidationError("Mindestens eine Ressource wurde nicht gefunden.");
      if (resources.some((resource) => !resource.active || !resource.publicVisible)) {
        throw new BusinessRuleError("Mindestens eine Ressource ist nicht buchbar.");
      }
      if (resources.some((resource) => resource.type === "VEHICLE")) {
        throw new BusinessRuleError("Kühlwagen-Anfragen werden mit dem Kühlwagen-Prozess in Phase 8 freigeschaltet.");
      }
      const directResources = resources.filter((resource) => directResourceIds.includes(resource.id));
      if (input.resourceGroupId && directResources.some((resource) => resource.type === "ROOM")) {
        throw new BusinessRuleError("Eine Raumkombination darf nicht mit weiteren Einzelräumen vermischt werden.");
      }
      if (!input.resourceGroupId && directResources.filter((resource) => resource.type === "ROOM").length > 1) {
        throw new BusinessRuleError("Mehrere Räume dürfen nur über eine unterstützte Raumkombination gebucht werden.");
      }
    });
  }

  async approveBooking(actor: Actor, bookingId: string): Promise<void> {
    requireStaffOrAdmin(actor);

    await this.repository.approveAtomically(bookingId, actor.id, (context) => {
      assertStatusTransition(context.booking.status, "APPROVED");
      if (context.booking.resources.length === 0) {
        throw new BusinessRuleError("Eine Buchung ohne Ressource kann nicht genehmigt werden.");
      }
      if (context.booking.resources.some((resource) => !resource.active)) {
        throw new BusinessRuleError("Mindestens eine Ressource ist inaktiv.");
      }

      const conflicts = checkBookingConflicts({
        startAt: context.booking.startAt,
        endAt: context.booking.endAt,
        resources: context.booking.resources,
        bookings: context.bookings,
        blackouts: context.blackouts,
        optionBlocks: this.optionBlocks,
        ignoreBookingId: context.booking.id,
      });

      if (conflicts.length > 0) {
        const first = conflicts[0];
        throw new ConflictError(
          first?.type === "BLACKOUT"
            ? `Genehmigung wegen Sperrzeit „${first.title}“ nicht möglich.`
            : `Genehmigung wegen Buchung „${first?.title}“ nicht möglich.`,
        );
      }
    });
  }

  async rejectBooking(actor: Actor, bookingId: string, reason: string): Promise<void> {
    requireStaffOrAdmin(actor);
    const normalizedReason = reason.trim();
    if (!normalizedReason) throw new ValidationError("Ein Ablehnungsgrund ist erforderlich.");
    await this.repository.rejectAtomically(bookingId, actor.id, normalizedReason, (status) => {
      assertStatusTransition(status, "REJECTED");
    });
  }

  async cancelBooking(actor: Actor, bookingId: string, reason?: string): Promise<void> {
    const booking = await this.repository.findById(bookingId);
    if (!booking) throw new NotFoundError("Buchung wurde nicht gefunden.");
    this.assertCancelAllowed(actor, booking);
    const normalizedReason = reason?.trim() || undefined;
    await this.repository.cancelAtomically(bookingId, actor.id, normalizedReason, (status) => {
      assertStatusTransition(status, "CANCELLED");
    });
  }

  async completeBooking(actor: Actor, bookingId: string): Promise<void> {
    requireStaffOrAdmin(actor);
    const booking = await this.repository.findById(bookingId);
    if (!booking) throw new NotFoundError("Buchung wurde nicht gefunden.");
    await this.repository.completeAtomically(bookingId, actor.id, (status) => {
      assertStatusTransition(status, "COMPLETED");
    });
  }

  private assertCancelAllowed(
    actor: Actor,
    booking: { status: BookingStatusValue; startAt: Date; createdById: string | null },
  ): void {
    const isStaff = actor.role === "ADMIN" || actor.role === "STAFF";
    if (isStaff) return;

    if (booking.createdById !== actor.id) {
      throw new PermissionError("Sie dürfen nur eigene Buchungen stornieren.");
    }

    const now = this.now();
    if (booking.status === "REQUESTED") return;
    if (
      (booking.status === "APPROVED" || booking.status === "OPTION") &&
      booking.startAt > now
    ) {
      return;
    }

    throw new BusinessRuleError("Diese Buchung kann derzeit nicht storniert werden.");
  }
}
