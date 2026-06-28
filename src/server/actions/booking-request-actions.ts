"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentActor, getOptionalActor } from "@/lib/auth/session";
import { parseBookingRequestFormData } from "@/lib/validation/booking-request";
import { BusinessRuleError, ConflictError, PermissionError, ValidationError } from "@/server/errors";
import { bookingService } from "@/server/services/booking-service-instance";
import { parseViennaDateTime } from "@/lib/time/vienna";

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

export async function createAdminBookingAction(
  _state: BookingRequestActionState,
  formData: FormData,
): Promise<BookingRequestActionState> {
  try {
    const title = formData.get("title");
    const startAt = formData.get("startAt");
    const endAt = formData.get("endAt");
    const requesterName = formData.get("requesterName");
    const requesterEmail = formData.get("requesterEmail");
    const requesterPhone = formData.get("requesterPhone");
    const purpose = formData.get("purpose");
    const resourceIds = formData.getAll("resourceId").filter((v): v is string => typeof v === "string" && v.length > 0);

    if (typeof title !== "string" || !title.trim()) return { error: "Titel ist erforderlich." };
    if (typeof startAt !== "string" || typeof endAt !== "string") return { error: "Zeitraum ist ungültig." };
    if (typeof requesterName !== "string" || !requesterName.trim()) return { error: "Name ist erforderlich." };
    if (typeof requesterEmail !== "string" || !requesterEmail.trim()) return { error: "E-Mail ist erforderlich." };
    if (resourceIds.length === 0) return { error: "Mindestens eine Ressource ist erforderlich." };

    const start = parseViennaDateTime(startAt);
    const end = parseViennaDateTime(endAt);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return { error: "Ungültiges Datum." };

    await bookingService.createAdminBooking(await getCurrentActor(), {
      title: title.trim(),
      startAt: start,
      endAt: end,
      requesterName: requesterName.trim(),
      requesterEmail: requesterEmail.trim(),
      requesterPhone: typeof requesterPhone === "string" && requesterPhone.trim() ? requesterPhone.trim() : undefined,
      purpose: typeof purpose === "string" && purpose.trim() ? purpose.trim() : undefined,
      resourceIds,
    });
    revalidatePath("/admin/buchungen");
    revalidatePath("/admin/kuehlwagen");
    revalidatePath("/admin/kalender");
    return { success: "Buchung wurde angelegt und genehmigt." };
  } catch (error) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Die Buchung konnte nicht gespeichert werden." };
  }
}

export async function rejectBookingAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const reason = formData.get("reason");
  if (typeof id !== "string" || typeof reason !== "string") throw new ValidationError("Ungültige Ablehnung.");
  await bookingService.rejectBooking(await getCurrentActor(), id, reason);
  revalidatePath("/admin/anfragen");
  redirect("/admin/anfragen?success=abgelehnt");
}
