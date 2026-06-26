import type { BookingStatusValue } from "@/features/bookings/booking-types";

export const feeTypes = ["DEPOSIT", "RENTAL", "CLEANING", "DAMAGE", "OTHER"] as const;
export type FeeTypeValue = (typeof feeTypes)[number];
export const feeTypeLabels: Record<FeeTypeValue, string> = {
  DEPOSIT: "Kaution", RENTAL: "Mietgebühr", CLEANING: "Reinigung", DAMAGE: "Schaden", OTHER: "Sonstige",
};

export const damageSeverities = ["MINOR", "MODERATE", "SEVERE"] as const;
export type DamageSeverityValue = (typeof damageSeverities)[number];
export const damageSeverityLabels: Record<DamageSeverityValue, string> = {
  MINOR: "Gering", MODERATE: "Mittel", SEVERE: "Schwer",
};

export interface FeeInput {
  type: FeeTypeValue;
  amount: number;
  note?: string;
}

export interface DamageInput {
  description: string;
  severity: DamageSeverityValue;
  estimatedCost?: number;
}

export interface HandoverProtocolInput {
  handedOverAt: Date;
  pickupLocation: string;
  odometer?: number;
  fuelLevel?: number;
  condition: string;
  accessories?: string;
  depositAmount?: number;
  notes?: string;
}

export interface ReturnProtocolInput {
  returnedAt: Date;
  returnLocation: string;
  odometer?: number;
  fuelLevel?: number;
  cleaningOk: boolean;
  condition: string;
  notes?: string;
  damages: DamageInput[];
  fees: FeeInput[];
}

export interface FeeDto {
  id: string;
  type: FeeTypeValue;
  amount: number;
  note?: string;
}

export interface DamageDto {
  id: string;
  description: string;
  severity: DamageSeverityValue;
  estimatedCost?: number;
}

export interface HandoverProtocolDto {
  id: string;
  handedOverAt: Date;
  pickupLocation: string;
  odometer?: number;
  fuelLevel?: number;
  condition: string;
  accessories?: string;
  depositAmount?: number;
  notes?: string;
}

export interface ReturnProtocolDto {
  id: string;
  returnedAt: Date;
  returnLocation: string;
  odometer?: number;
  fuelLevel?: number;
  cleaningOk: boolean;
  condition: string;
  notes?: string;
  damages: DamageDto[];
  fees: FeeDto[];
}

export interface KuehlwagenBookingDto {
  id: string;
  title: string;
  status: BookingStatusValue;
  startAt: Date;
  endAt: Date;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  vehicleNames: string[];
  handover?: HandoverProtocolDto;
  return?: ReturnProtocolDto;
  feeTotal: number;
}
