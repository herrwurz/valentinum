import { z } from "zod";

import { parseViennaDateTime } from "@/lib/time/vienna";
import { ValidationError } from "@/server/errors";

const optionalText = (max: number) => z.preprocess(
  (value) => typeof value === "string" && value.trim() ? value : undefined,
  z.string().trim().max(max).optional(),
);

export const bookingRequestSchema = z.object({
  title: z.string().trim().min(1, "Titel ist erforderlich.").max(160),
  startAt: z.preprocess(parseViennaDateTime, z.date()),
  endAt: z.preprocess(parseViennaDateTime, z.date()),
  requesterName: z.string().trim().min(1, "Name ist erforderlich.").max(160),
  requesterEmail: z.email("Gültige E-Mail-Adresse ist erforderlich.").max(320),
  requesterPhone: optionalText(80),
  purpose: optionalText(2000),
  resourceIds: z.array(z.string().min(1)).max(20),
  resourceGroupId: z.string().min(1).optional(),
}).refine(({ startAt, endAt }) => startAt < endAt, { message: "Beginn muss vor dem Ende liegen.", path: ["endAt"] })
  .refine(({ resourceIds, resourceGroupId }) => resourceIds.length > 0 || Boolean(resourceGroupId), {
    message: "Mindestens eine Ressource oder Raumkombination ist erforderlich.", path: ["resourceIds"],
  });

export function parseBookingRequestFormData(formData: FormData) {
  const roomSelection = formData.get("roomSelection");
  const resourceIds = formData.getAll("equipmentIds").map(String);
  if (typeof roomSelection === "string" && roomSelection.startsWith("resource:") && roomSelection.slice(9)) {
    resourceIds.push(roomSelection.slice(9));
  }
  const result = bookingRequestSchema.safeParse({
    title: formData.get("title"), startAt: formData.get("startAt"), endAt: formData.get("endAt"),
    requesterName: formData.get("requesterName"), requesterEmail: formData.get("requesterEmail"),
    requesterPhone: formData.get("requesterPhone"), purpose: formData.get("purpose"),
    resourceIds,
    resourceGroupId: typeof roomSelection === "string" && roomSelection.startsWith("group:")
      ? roomSelection.slice(6) : undefined,
  });
  if (!result.success) throw new ValidationError(result.error.issues[0]?.message ?? "Ungültige Buchungsanfrage.");
  return { ...result.data, requesterEmail: result.data.requesterEmail.toLowerCase() };
}
