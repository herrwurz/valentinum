"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentActor } from "@/lib/auth/session";
import {
  parseCreateUserFormData,
  parseUserActiveFormData,
  parseUserRoleFormData,
} from "@/lib/validation/user-management";
import { ConflictError, PermissionError, ValidationError } from "@/server/errors";
import { userService } from "@/server/services/user-service";

export interface UserActionState {
  error?: string;
}

function publicError(error: unknown): string {
  if (error instanceof ValidationError || error instanceof PermissionError || error instanceof ConflictError) {
    return error.message;
  }
  console.error(error);
  return "Der Benutzer konnte nicht gespeichert werden.";
}

export async function saveUserAction(_previousState: UserActionState, formData: FormData): Promise<UserActionState> {
  try {
    const actor = await getCurrentActor();
    const input = parseCreateUserFormData(formData);
    await userService.create(actor, input);
  } catch (error) {
    return { error: publicError(error) };
  }

  revalidatePath("/admin/benutzer");
  redirect("/admin/benutzer");
}

export async function setUserActiveAction(formData: FormData): Promise<void> {
  const actor = await getCurrentActor();
  const { id, active } = parseUserActiveFormData(formData);
  await userService.setActive(actor, id, active);
  revalidatePath("/admin/benutzer");
}

export async function setUserRoleAction(formData: FormData): Promise<void> {
  const actor = await getCurrentActor();
  const { id, role } = parseUserRoleFormData(formData);
  await userService.setRole(actor, id, role);
  revalidatePath("/admin/benutzer");
}
