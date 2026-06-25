import type { BlackoutInput } from "@/features/blackouts/blackout-types";
import type { Actor } from "@/lib/permissions/roles";
import { requireStaffOrAdmin } from "@/lib/permissions/roles";
import { ConflictError, BusinessRuleError } from "@/server/errors";
import { PrismaBlackoutRepository, type BlackoutRepository } from "@/server/repositories/blackout-repository";
import { checkBookingConflicts } from "@/server/services/booking-conflicts";

export class BlackoutService {
  constructor(private readonly repository: BlackoutRepository) {}

  async list(actor: Actor) { requireStaffOrAdmin(actor); return this.repository.list(); }
  async listResources(actor: Actor) { requireStaffOrAdmin(actor); return this.repository.listActiveResources(); }

  async create(actor: Actor, input: BlackoutInput): Promise<void> {
    requireStaffOrAdmin(actor);
    await this.repository.create(input, actor.id, ({ resource, bookings }) => {
      if (!resource.active) throw new BusinessRuleError("Für inaktive Ressourcen kann keine Sperrzeit angelegt werden.");
      const conflicts = checkBookingConflicts({
        startAt: input.startAt, endAt: input.endAt,
        resources: [resource], bookings, blackouts: [], optionBlocks: false,
      });
      if (conflicts.length > 0) {
        throw new ConflictError(`Sperrzeit überschneidet die genehmigte Buchung „${conflicts[0]?.title}“.`);
      }
    });
  }

  async delete(actor: Actor, id: string): Promise<void> {
    requireStaffOrAdmin(actor);
    await this.repository.delete(id, actor.id);
  }
}

export const blackoutService = new BlackoutService(new PrismaBlackoutRepository());
