import { EventForm } from "@/features/events/event-form";
import { getCurrentActor } from "@/lib/auth/session";
import { eventService } from "@/server/services/event-service-instance";

export default async function NewEventPage() {
  const bookings = await eventService.listLinkableBookings(await getCurrentActor());
  return <div className="admin-content form-page"><div className="eyebrow">Event-Modul</div><h1>Neue Veranstaltung</h1><EventForm bookings={bookings} /></div>;
}
