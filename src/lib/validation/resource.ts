import { z } from "zod";

import { resourceTypes } from "@/features/resources/resource-types";
import { ValidationError } from "@/server/errors";

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maximum).optional(),
  );

const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) return undefined;
      return typeof value === "string" ? Number(value.replace(",", ".")) : value;
    },
    schema.optional(),
  );

const requiredInteger = z.preprocess(
  (value) => (typeof value === "string" ? Number(value) : value),
  z.number().int().min(0).max(10080),
);

export const resourceInputSchema = z.object({
  name: z.string().trim().min(1, "Name ist erforderlich.").max(120),
  type: z.enum(resourceTypes),
  description: optionalText(2000),
  location: optionalText(240),
  capacity: optionalNumber(z.number().int().min(0).max(100000)),
  areaSqm: optionalNumber(z.number().min(0).max(1000000)),
  publicVisible: z.boolean(),
  bufferBeforeMinutes: requiredInteger,
  bufferAfterMinutes: requiredInteger,
});

export function parseResourceFormData(formData: FormData) {
  const result = resourceInputSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    description: formData.get("description"),
    location: formData.get("location"),
    capacity: formData.get("capacity"),
    areaSqm: formData.get("areaSqm"),
    publicVisible: formData.get("publicVisible") === "on",
    bufferBeforeMinutes: formData.get("bufferBeforeMinutes"),
    bufferAfterMinutes: formData.get("bufferAfterMinutes"),
  });

  if (!result.success) {
    throw new ValidationError(result.error.issues[0]?.message ?? "Ungültige Ressourcendaten.");
  }

  return result.data;
}
