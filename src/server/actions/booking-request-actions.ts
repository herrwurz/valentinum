"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentActor, getOptionalActor } from "@/lib/auth/session";
import { parseBookingRequestFormData } from "@/lib/validation/booking-request";
import { BusinessRuleError, ConflictError, PermissionError, ValidationError } from "@/server/errors";
import { bookingService } from "@/server/services/booking-service-instance";

export interface BookingRequestActionState { error?: string; success?: string }

export async function createBookingRequestAction(
  _state: BookingRequestActionState,
  formData: FormData,
): Promise<BookingRequestActionState> {
  if (formData.get("website")) return { success: "Ihre Anfrage wurde entgegengenommen." };
  try {
    await bookingService.createBookingRequest(await getOptionalActor(), parseBookingRequestFormData(formData));
    return { success: "Ihre Anfrage wurde gespeichert und wartet auf Freigabe." };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof BusinessRuleError) return { error: error.message };
    console.error(error);
    return { error: "Die Anfrage konnte nicht gespeichert werden." };
  }
}

export async function approveBookingAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new ValidationError("Ungültige Buchung.");
  let errorMessage: string | undefined;
  try {
    await bookingService.approveBooking(await getCurrentActor(), id);
  } catch (error) {
    if (error instanceof ConflictError || error instanceof BusinessRuleError || error instanceof PermissionError) errorMessage = error.message;
    else throw error;
  }
  revalidatePath("/admin/anfragen");
  redirect(errorMessage ? `/admin/anfragen?error=${encodeURIComponent(errorMessage)}` : "/admin/anfragen?success=genehmigt");
}

export async function rejectBookingAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const reason = formData.get("reason");
  if (typeof id !== "string" || typeof reason !== "string") throw new ValidationError("Ungültige Ablehnung.");
  await bookingService.rejectBooking(await getCurrentActor(), id, reason);
  revalidatePath("/admin/anfragen");
  redirect("/admin/anfragen?success=abgelehnt");
}
