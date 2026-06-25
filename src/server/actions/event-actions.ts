"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentActor } from "@/lib/auth/session";
import { parseEventFormData } from "@/lib/validation/event";
import { ValidationError } from "@/server/errors";
import { eventService } from "@/server/services/event-service-instance";

export interface EventActionState { error?: string }

export async function saveEventAction(_state: EventActionState, formData: FormData): Promise<EventActionState> {
  try {
    const actor = await getCurrentActor();
    const input = parseEventFormData(formData);
    const id = formData.get("id");
    if (typeof id === "string" && id) await eventService.update(actor, id, input);
    else await eventService.create(actor, input);
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message };
    console.error(error); return { error: "Veranstaltung konnte nicht gespeichert werden." };
  }
  revalidatePath("/admin/veranstaltungen");
  redirect("/admin/veranstaltungen");
}

export async function setEventPublishedAction(formData: FormData): Promise<void> {
  const id = formData.get("id"); const published = formData.get("published");
  if (typeof id !== "string" || (published !== "true" && published !== "false")) throw new ValidationError("Ungültige Veröffentlichung.");
  await eventService.setPublished(await getCurrentActor(), id, published === "true");
  revalidatePath("/admin/veranstaltungen"); revalidatePath("/veranstaltungen"); revalidatePath("/kalender");
}
