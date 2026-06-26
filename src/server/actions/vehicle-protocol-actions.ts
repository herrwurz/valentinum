"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentActor } from "@/lib/auth/session";
import { parseHandoverFormData, parseReturnFormData } from "@/lib/validation/vehicle-protocol";
import { BusinessRuleError, NotFoundError, PermissionError, ValidationError } from "@/server/errors";
import { vehicleProtocolService } from "@/server/services/vehicle-protocol-service-instance";

const PATH = "/admin/kuehlwagen";

function messageFor(error: unknown): string {
  if (
    error instanceof ValidationError ||
    error instanceof BusinessRuleError ||
    error instanceof NotFoundError ||
    error instanceof PermissionError
  ) {
    return error.message;
  }
  throw error;
}

export async function createHandoverProtocolAction(formData: FormData): Promise<void> {
  const bookingId = formData.get("bookingId");
  if (typeof bookingId !== "string" || !bookingId) throw new ValidationError("Ungültige Buchung.");
  let errorMessage: string | undefined;
  try {
    await vehicleProtocolService.createHandoverProtocol(
      await getCurrentActor(),
      bookingId,
      parseHandoverFormData(formData),
    );
  } catch (error) {
    errorMessage = messageFor(error);
  }
  revalidatePath(PATH);
  redirect(errorMessage ? `${PATH}?error=${encodeURIComponent(errorMessage)}` : `${PATH}?success=uebergabe`);
}

export async function createReturnProtocolAction(formData: FormData): Promise<void> {
  const bookingId = formData.get("bookingId");
  if (typeof bookingId !== "string" || !bookingId) throw new ValidationError("Ungültige Buchung.");
  let errorMessage: string | undefined;
  try {
    await vehicleProtocolService.createReturnProtocol(
      await getCurrentActor(),
      bookingId,
      parseReturnFormData(formData),
    );
  } catch (error) {
    errorMessage = messageFor(error);
  }
  revalidatePath(PATH);
  redirect(errorMessage ? `${PATH}?error=${encodeURIComponent(errorMessage)}` : `${PATH}?success=rueckgabe`);
}
