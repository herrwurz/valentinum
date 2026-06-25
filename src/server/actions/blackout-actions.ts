"use server";

import { revalidatePath } from "next/cache";

import { getCurrentActor } from "@/lib/auth/session";
import { parseBlackoutFormData } from "@/lib/validation/blackout";
import { ConflictError, PermissionError, ValidationError } from "@/server/errors";
import { blackoutService } from "@/server/services/blackout-service";

export interface BlackoutActionState { error?: string; success?: string }

export async function createBlackoutAction(
  _state: BlackoutActionState,
  formData: FormData,
): Promise<BlackoutActionState> {
  try {
    await blackoutService.create(await getCurrentActor(), parseBlackoutFormData(formData));
    revalidatePath("/admin/sperrzeiten");
    return { success: "Sperrzeit wurde angelegt." };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof PermissionError || error instanceof ConflictError) {
      return { error: error.message };
    }
    console.error(error);
    return { error: "Sperrzeit konnte nicht angelegt werden." };
  }
}

export async function deleteBlackoutAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new ValidationError("Ungültige Sperrzeit.");
  await blackoutService.delete(await getCurrentActor(), id);
  revalidatePath("/admin/sperrzeiten");
}
