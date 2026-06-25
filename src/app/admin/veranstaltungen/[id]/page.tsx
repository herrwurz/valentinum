import { notFound } from "next/navigation";

import { EventForm } from "@/features/events/event-form";
import { getCurrentActor } from "@/lib/auth/session";
import { NotFoundError } from "@/server/errors";
import { eventService } from "@/server/services/event-service-instance";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getCurrentActor(); const { id } = await params;
  let event;
  let bookings;
  try {
    [event, bookings] = await Promise.all([eventService.getAdmin(actor, id), eventService.listLinkableBookings(actor)]);
  } catch (error) { if (error instanceof NotFoundError) notFound(); throw error; }
  return <div className="admin-content form-page"><div className="eyebrow">Event-Modul</div><h1>{event.title}</h1><EventForm event={event} bookings={bookings} /></div>;
}
