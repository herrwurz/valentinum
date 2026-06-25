import { z } from "zod";

import { eventCategories } from "@/features/events/event-types";
import { parseViennaDateTime } from "@/lib/time/vienna";
import { ValidationError } from "@/server/errors";

const optionalText = (max: number) => z.preprocess(
  (value) => typeof value === "string" && value.trim() ? value : undefined,
  z.string().trim().max(max).optional(),
);
const optionalUrl = z.preprocess(
  (value) => typeof value === "string" && value.trim() ? value : undefined,
  z.url().refine((url) => ["http:", "https:"].includes(new URL(url).protocol), "Nur HTTP-/HTTPS-URLs sind erlaubt.").optional(),
);
const optionalDate = z.preprocess(
  (value) => typeof value === "string" && value ? parseViennaDateTime(value) : undefined,
  z.date().optional(),
);

export const eventInputSchema = z.object({
  bookingId: optionalText(100), title: z.string().trim().min(1, "Titel ist erforderlich.").max(200),
  subtitle: optionalText(240), description: optionalText(5000), category: z.enum(eventCategories),
  organizerName: optionalText(240), startsAt: z.preprocess(parseViennaDateTime, z.date()),
  endsAt: z.preprocess(parseViennaDateTime, z.date()), admissionAt: optionalDate,
  ticketUrl: optionalUrl, imageUrl: optionalUrl,
  publishOrganizer: z.boolean(), publishTicketLink: z.boolean(),
}).refine(({ startsAt, endsAt }) => startsAt < endsAt, { message: "Beginn muss vor dem Ende liegen.", path: ["endsAt"] })
  .refine(({ admissionAt, startsAt }) => !admissionAt || admissionAt <= startsAt, { message: "Einlass darf nicht nach Veranstaltungsbeginn liegen.", path: ["admissionAt"] });

export function parseEventFormData(formData: FormData) {
  const result = eventInputSchema.safeParse({
    bookingId: formData.get("bookingId"), title: formData.get("title"), subtitle: formData.get("subtitle"),
    description: formData.get("description"), category: formData.get("category"), organizerName: formData.get("organizerName"),
    startsAt: formData.get("startsAt"), endsAt: formData.get("endsAt"), admissionAt: formData.get("admissionAt"),
    ticketUrl: formData.get("ticketUrl"), imageUrl: formData.get("imageUrl"),
    publishOrganizer: formData.get("publishOrganizer") === "on", publishTicketLink: formData.get("publishTicketLink") === "on",
  });
  if (!result.success) throw new ValidationError(result.error.issues[0]?.message ?? "Ungültige Veranstaltungsdaten.");
  return result.data;
}
