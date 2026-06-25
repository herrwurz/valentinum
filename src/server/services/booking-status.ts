import type { BookingStatusValue } from "@/features/bookings/booking-types";
import { BusinessRuleError } from "@/server/errors";

const transitions: Readonly<Record<BookingStatusValue, readonly BookingStatusValue[]>> = {
  DRAFT: ["REQUESTED"],
  REQUESTED: ["APPROVED", "REJECTED", "CANCELLED"],
  OPTION: ["APPROVED", "CANCELLED"],
  APPROVED: ["CANCELLED", "COMPLETED"],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: ["ARCHIVED"],
  ARCHIVED: [],
};

export function canTransition(from: BookingStatusValue, to: BookingStatusValue): boolean {
  return transitions[from].includes(to);
}

export function assertStatusTransition(from: BookingStatusValue, to: BookingStatusValue): void {
  if (!canTransition(from, to)) {
    throw new BusinessRuleError(`Statuswechsel von ${from} nach ${to} ist nicht erlaubt.`);
  }
}
