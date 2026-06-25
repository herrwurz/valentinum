"use client";

import type { BookingStatusValue } from "@/features/bookings/booking-types";
import { cancelBookingAction, completeBookingAction } from "@/server/actions/booking-workflow-actions";

const cancellableForStaff: BookingStatusValue[] = ["REQUESTED", "OPTION", "APPROVED"];
const cancellableForUser: BookingStatusValue[] = ["REQUESTED", "OPTION", "APPROVED"];

export function CalendarBookingActions({
  bookingId,
  status,
  start,
  variant,
}: {
  bookingId: string;
  status: BookingStatusValue;
  start: string;
  variant: "admin" | "user";
}) {
  const isFuture = new Date(start) > new Date();
  const canCancelStaff = variant === "admin" && cancellableForStaff.includes(status);
  const canCancelUser = variant === "user" && cancellableForUser.includes(status) && (status === "REQUESTED" || isFuture);
  const canComplete = variant === "admin" && status === "APPROVED";

  if (!canCancelStaff && !canCancelUser && !canComplete) return null;

  return (
    <div className="calendar-booking-actions">
      {canComplete ? (
        <form action={completeBookingAction}>
          <input type="hidden" name="id" value={bookingId} />
          <button className="button button-primary" type="submit">Als abgeschlossen markieren</button>
        </form>
      ) : null}
      {canCancelStaff || canCancelUser ? (
        <form className="reject-form" action={cancelBookingAction}>
          <input type="hidden" name="id" value={bookingId} />
          <input type="hidden" name="scope" value={variant} />
          <input name="reason" placeholder="Storno-Grund (optional)" maxLength={500} />
          <button className="button button-danger" type="submit">Stornieren</button>
        </form>
      ) : null}
    </div>
  );
}
