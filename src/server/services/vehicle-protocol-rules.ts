import type { FeeTypeValue } from "@/features/vehicle/vehicle-types";
import { ValidationError } from "@/server/errors";

export interface FeeAmount {
  type: FeeTypeValue;
  amount: number;
}

/**
 * Die Rückgabe darf zeitlich nicht vor der Übergabe liegen.
 */
export function assertReturnAfterHandover(handedOverAt: Date, returnedAt: Date): void {
  if (!(returnedAt.getTime() >= handedOverAt.getTime())) {
    throw new ValidationError("Die Rückgabe darf nicht vor der Übergabe liegen.");
  }
}

/**
 * Summe aller erfassten Beträge (inklusive Kaution).
 */
export function sumFees(fees: ReadonlyArray<FeeAmount>): number {
  return fees.reduce((total, fee) => total + fee.amount, 0);
}

/**
 * Summe der tatsächlich verrechneten Beträge ohne die rückzahlbare Kaution.
 */
export function chargeableFeeTotal(fees: ReadonlyArray<FeeAmount>): number {
  return fees.filter((fee) => fee.type !== "DEPOSIT").reduce((total, fee) => total + fee.amount, 0);
}
