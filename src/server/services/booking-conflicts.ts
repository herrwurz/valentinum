import type {
  BookingConflict,
  BufferedResource,
  ConflictBlackout,
  ConflictBooking,
} from "@/features/bookings/booking-types";
import { ValidationError } from "@/server/errors";

const minute = 60_000;

function effectiveInterval(startAt: Date, endAt: Date, resources: BufferedResource[]) {
  const before = Math.max(0, ...resources.map((resource) => resource.bufferBeforeMinutes));
  const after = Math.max(0, ...resources.map((resource) => resource.bufferAfterMinutes));
  return {
    startAt: new Date(startAt.getTime() - before * minute),
    endAt: new Date(endAt.getTime() + after * minute),
  };
}

export function intervalsOverlap(
  first: { startAt: Date; endAt: Date },
  second: { startAt: Date; endAt: Date },
): boolean {
  return first.startAt < second.endAt && first.endAt > second.startAt;
}

export function checkBookingConflicts(input: {
  startAt: Date;
  endAt: Date;
  resources: BufferedResource[];
  bookings: ConflictBooking[];
  blackouts: ConflictBlackout[];
  optionBlocks: boolean;
  ignoreBookingId?: string;
}): BookingConflict[] {
  if (!(input.startAt < input.endAt)) {
    throw new ValidationError("Der Buchungsbeginn muss vor dem Buchungsende liegen.");
  }
  if (input.resources.length === 0) {
    throw new ValidationError("Mindestens eine Ressource ist erforderlich.");
  }

  const resourceIds = new Set(input.resources.map((resource) => resource.id));
  const candidate = effectiveInterval(input.startAt, input.endAt, input.resources);
  const conflicts: BookingConflict[] = [];

  for (const booking of input.bookings) {
    if (booking.id === input.ignoreBookingId) continue;
    if (booking.status !== "APPROVED" && !(input.optionBlocks && booking.status === "OPTION")) continue;
    if (!booking.resources.some((resource) => resourceIds.has(resource.id))) continue;

    const existing = effectiveInterval(booking.startAt, booking.endAt, booking.resources);
    if (intervalsOverlap(candidate, existing)) {
      conflicts.push({
        type: "BOOKING",
        id: booking.id,
        title: booking.title,
        startAt: booking.startAt,
        endAt: booking.endAt,
      });
    }
  }

  for (const blackout of input.blackouts) {
    if (!resourceIds.has(blackout.resourceId)) continue;
    if (intervalsOverlap(candidate, blackout)) {
      conflicts.push({
        type: "BLACKOUT",
        id: blackout.id,
        title: blackout.title,
        startAt: blackout.startAt,
        endAt: blackout.endAt,
      });
    }
  }

  return conflicts;
}
