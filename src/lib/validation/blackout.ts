import { z } from "zod";

import { ValidationError } from "@/server/errors";
import { parseViennaDateTime } from "@/lib/time/vienna";

export const blackoutInputSchema = z.object({
  resourceId: z.string().min(1),
  title: z.string().trim().min(1, "Titel ist erforderlich.").max(160),
  reason: z.string().trim().max(1000).optional(),
  startAt: z.preprocess(parseViennaDateTime, z.date()),
  endAt: z.preprocess(parseViennaDateTime, z.date()),
}).refine((input) => input.startAt < input.endAt, {
  message: "Beginn muss vor dem Ende liegen.",
  path: ["endAt"],
});

export function parseBlackoutFormData(formData: FormData) {
  const reason = formData.get("reason");
  const result = blackoutInputSchema.safeParse({
    resourceId: formData.get("resourceId"),
    title: formData.get("title"),
    reason: typeof reason === "string" && reason.trim() ? reason : undefined,
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
  });
  if (!result.success) throw new ValidationError(result.error.issues[0]?.message ?? "Ungültige Sperrzeit.");
  return result.data;
}
