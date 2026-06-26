import { z } from "zod";

import {
  damageSeverities,
  feeTypes,
  type HandoverProtocolInput,
  type ReturnProtocolInput,
} from "@/features/vehicle/vehicle-types";
import { parseViennaDateTime } from "@/lib/time/vienna";
import { ValidationError } from "@/server/errors";

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value : undefined),
    z.string().trim().max(max).optional(),
  );

const requiredText = (max: number, message: string) => z.string().trim().min(1, message).max(max);

const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? Number(value) : undefined),
    z.number().int("Bitte eine ganze Zahl angeben.").min(min).max(max).optional(),
  );

const optionalAmount = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? Number(value.replace(",", ".")) : undefined),
  z.number().min(0).max(1_000_000).optional(),
);

const requiredAmount = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? Number(value.replace(",", ".")) : value),
  z.number().min(0).max(1_000_000),
);

const handoverSchema = z.object({
  handedOverAt: z.preprocess(parseViennaDateTime, z.date()),
  pickupLocation: requiredText(200, "Abholort ist erforderlich."),
  odometer: optionalInt(0, 10_000_000),
  fuelLevel: optionalInt(0, 100),
  condition: requiredText(2000, "Zustand bei Übergabe ist erforderlich."),
  accessories: optionalText(2000),
  depositAmount: optionalAmount,
  notes: optionalText(2000),
});

const returnSchema = z.object({
  returnedAt: z.preprocess(parseViennaDateTime, z.date()),
  returnLocation: requiredText(200, "Rückgabeort ist erforderlich."),
  odometer: optionalInt(0, 10_000_000),
  fuelLevel: optionalInt(0, 100),
  cleaningOk: z.preprocess((value) => value === "on" || value === "true" || value === true, z.boolean()),
  condition: requiredText(2000, "Zustand bei Rückgabe ist erforderlich."),
  notes: optionalText(2000),
});

const damageRowSchema = z.object({
  description: z.string().trim().min(1).max(2000),
  severity: z.enum(damageSeverities),
  estimatedCost: optionalAmount,
});

const feeRowSchema = z.object({
  type: z.enum(feeTypes),
  amount: requiredAmount,
  note: optionalText(500),
});

function firstIssueMessage(error: z.ZodError, fallback: string): string {
  return error.issues[0]?.message ?? fallback;
}

export function parseHandoverFormData(formData: FormData): HandoverProtocolInput {
  const result = handoverSchema.safeParse({
    handedOverAt: formData.get("handedOverAt"),
    pickupLocation: formData.get("pickupLocation"),
    odometer: formData.get("odometer"),
    fuelLevel: formData.get("fuelLevel"),
    condition: formData.get("condition"),
    accessories: formData.get("accessories"),
    depositAmount: formData.get("depositAmount"),
    notes: formData.get("notes"),
  });
  if (!result.success) throw new ValidationError(firstIssueMessage(result.error, "Ungültiges Übergabeprotokoll."));
  return result.data;
}

export function parseReturnFormData(formData: FormData): ReturnProtocolInput {
  const base = returnSchema.safeParse({
    returnedAt: formData.get("returnedAt"),
    returnLocation: formData.get("returnLocation"),
    odometer: formData.get("odometer"),
    fuelLevel: formData.get("fuelLevel"),
    cleaningOk: formData.get("cleaningOk"),
    condition: formData.get("condition"),
    notes: formData.get("notes"),
  });
  if (!base.success) throw new ValidationError(firstIssueMessage(base.error, "Ungültiges Rückgabeprotokoll."));

  const descriptions = formData.getAll("damageDescription").map(String);
  const severities = formData.getAll("damageSeverity").map(String);
  const costs = formData.getAll("damageCost").map(String);
  const damages = descriptions
    .map((description, index) => ({ description, severity: severities[index], estimatedCost: costs[index] }))
    .filter((row) => row.description.trim().length > 0)
    .map((row) => {
      const parsed = damageRowSchema.safeParse(row);
      if (!parsed.success) throw new ValidationError(firstIssueMessage(parsed.error, "Ungültiger Schadenseintrag."));
      return parsed.data;
    });

  const feeTypeValues = formData.getAll("feeType").map(String);
  const feeAmounts = formData.getAll("feeAmount").map(String);
  const feeNotes = formData.getAll("feeNote").map(String);
  const fees = feeTypeValues
    .map((type, index) => ({ type, amount: feeAmounts[index], note: feeNotes[index] }))
    .filter((row) => row.amount !== undefined && row.amount.trim().length > 0)
    .map((row) => {
      const parsed = feeRowSchema.safeParse(row);
      if (!parsed.success) throw new ValidationError(firstIssueMessage(parsed.error, "Ungültiger Gebühreneintrag."));
      return parsed.data;
    });

  return { ...base.data, damages, fees };
}
