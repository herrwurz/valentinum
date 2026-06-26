import type { HandoverProtocolInput, ReturnProtocolInput } from "@/features/vehicle/vehicle-types";
import type { Actor } from "@/lib/permissions/roles";
import { requireStaffOrAdmin } from "@/lib/permissions/roles";
import { BusinessRuleError } from "@/server/errors";
import type { VehicleProtocolRepository } from "@/server/repositories/vehicle-protocol-repository";
import { assertReturnAfterHandover } from "@/server/services/vehicle-protocol-rules";

export class VehicleProtocolService {
  constructor(private readonly repository: VehicleProtocolRepository) {}

  async listKuehlwagenBookings(actor: Actor) {
    requireStaffOrAdmin(actor);
    return this.repository.listKuehlwagenBookings();
  }

  async createHandoverProtocol(actor: Actor, bookingId: string, input: HandoverProtocolInput): Promise<string> {
    requireStaffOrAdmin(actor);
    return this.repository.createHandoverAtomically(bookingId, input, actor.id, (context) => {
      if (!context.hasVehicle) {
        throw new BusinessRuleError("Für diese Buchung ist kein Kühlwagen hinterlegt.");
      }
      if (context.status !== "APPROVED") {
        throw new BusinessRuleError("Ein Übergabeprotokoll ist nur für genehmigte Buchungen möglich.");
      }
      if (context.handoverExists) {
        throw new BusinessRuleError("Für diese Buchung existiert bereits ein Übergabeprotokoll.");
      }
    });
  }

  async createReturnProtocol(actor: Actor, bookingId: string, input: ReturnProtocolInput): Promise<string> {
    requireStaffOrAdmin(actor);
    return this.repository.createReturnAtomically(bookingId, input, actor.id, (context) => {
      if (!context.hasVehicle) {
        throw new BusinessRuleError("Für diese Buchung ist kein Kühlwagen hinterlegt.");
      }
      if (!context.handoverAt) {
        throw new BusinessRuleError("Vor der Rückgabe muss ein Übergabeprotokoll erfasst werden.");
      }
      if (context.returnExists) {
        throw new BusinessRuleError("Für diese Buchung existiert bereits ein Rückgabeprotokoll.");
      }
      assertReturnAfterHandover(context.handoverAt, input.returnedAt);
    });
  }
}
