"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentActor } from "@/lib/auth/session";
import { BusinessRuleError, PermissionError, ValidationError } from "@/server/errors";
import { bookingService } from "@/server/services/booking-service-instance";

function revalidateBookingPaths(scope: "admin" | "user") {
  if (scope === "admin") {
    revalidatePath("/admin/kalender");
    revalidatePath("/admin/anfragen");
  } else {
    revalidatePath("/mein-bereich/kalender");
  }
}

export async function cancelBookingAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const scope = formData.get("scope");
  const reason = formData.get("reason");
  if (typeof id !== "string" || !id) throw new ValidationError("Ungültige Buchung.");
  if (scope !== "admin" && scope !== "user") throw new ValidationError("Ungültiger Kontext.");
  try {
    await bookingService.cancelBooking(
      await getCurrentActor(),
      id,
      typeof reason === "string" ? reason : undefined,
    );
  } catch (error) {
    if (error instanceof BusinessRuleError || error instanceof PermissionError) {
      const base = scope === "admin" ? "/admin/kalender" : "/mein-bereich/kalender";
      redirect(`${base}?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }
  revalidateBookingPaths(scope);
  const base = scope === "admin" ? "/admin/kalender" : "/mein-bereich/kalender";
  redirect(`${base}?success=storniert`);
}

export async function completeBookingAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new ValidationError("Ungültige Buchung.");
  try {
    await bookingService.completeBooking(await getCurrentActor(), id);
  } catch (error) {
    if (error instanceof BusinessRuleError || error instanceof PermissionError) {
      redirect(`/admin/kalender?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }
  revalidatePath("/admin/kalender");
  redirect("/admin/kalender?success=abgeschlossen");
}
