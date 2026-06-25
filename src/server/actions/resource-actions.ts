"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentActor } from "@/lib/auth/session";
import { parseResourceFormData } from "@/lib/validation/resource";
import { PermissionError, ValidationError } from "@/server/errors";
import { resourceService } from "@/server/services/resource-service";

export interface ResourceActionState {
  error?: string;
}

function publicError(error: unknown): string {
  if (error instanceof ValidationError || error instanceof PermissionError) {
    return error.message;
  }
  console.error(error);
  return "Die Ressource konnte nicht gespeichert werden.";
}

export async function saveResourceAction(
  _previousState: ResourceActionState,
  formData: FormData,
): Promise<ResourceActionState> {
  try {
    const actor = await getCurrentActor();
    const input = parseResourceFormData(formData);
    const id = formData.get("id");

    if (typeof id === "string" && id.length > 0) {
      await resourceService.update(actor, id, input);
    } else {
      await resourceService.create(actor, input);
    }
  } catch (error) {
    return { error: publicError(error) };
  }

  revalidatePath("/admin/ressourcen");
  redirect("/admin/ressourcen");
}

export async function setResourceActiveAction(formData: FormData): Promise<void> {
  const actor = await getCurrentActor();
  const id = formData.get("id");
  const active = formData.get("active");

  if (typeof id !== "string" || !id || (active !== "true" && active !== "false")) {
    throw new ValidationError("Ungültige Aktivierungsanfrage.");
  }

  await resourceService.setActive(actor, id, active === "true");
  revalidatePath("/admin/ressourcen");
}
