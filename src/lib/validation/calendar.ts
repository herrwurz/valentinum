import { z } from "zod";

import { ValidationError } from "@/server/errors";

const rangeSchema = z.object({ start: z.coerce.date(), end: z.coerce.date() })
  .refine(({ start, end }) => start < end, "Ungültiger Kalenderzeitraum.")
  .refine(({ start, end }) => end.getTime() - start.getTime() <= 370 * 24 * 60 * 60 * 1000, "Kalenderzeitraum ist zu groß.");

export function parseCalendarRange(searchParams: URLSearchParams) {
  const result = rangeSchema.safeParse({ start: searchParams.get("start"), end: searchParams.get("end") });
  if (!result.success) throw new ValidationError(result.error.issues[0]?.message ?? "Ungültiger Kalenderzeitraum.");
  return result.data;
}
