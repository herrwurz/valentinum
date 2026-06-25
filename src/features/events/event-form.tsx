"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { eventCategories, eventCategoryLabels, type AdminEventDto } from "@/features/events/event-types";
import { saveEventAction, type EventActionState } from "@/server/actions/event-actions";

const local = (date?: Date) => date ? new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Vienna", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
}).format(new Date(date)).replace(" ", "T") : undefined;

function Submit({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return <button className="button button-primary" disabled={pending}>{pending ? "Wird gespeichert …" : editing ? "Änderungen speichern" : "Veranstaltung anlegen"}</button>;
}

export function EventForm({ event, bookings }: { event?: AdminEventDto; bookings: Array<{ id: string; title: string }> }) {
  const [state, action] = useActionState(saveEventAction, {} as EventActionState);
  return <form className="resource-form" action={action}>
    {event ? <input type="hidden" name="id" value={event.id} /> : null}
    <div className="form-grid">
      <label className="field-wide">Titel<input name="title" defaultValue={event?.title} required maxLength={200} /></label>
      <label className="field-wide">Untertitel<input name="subtitle" defaultValue={event?.subtitle} maxLength={240} /></label>
      <label>Kategorie<select name="category" defaultValue={event?.category ?? "SONSTIGE"}>{eventCategories.map((category) => <option key={category} value={category}>{eventCategoryLabels[category]}</option>)}</select></label>
      <label>Zugehörige Buchung<select name="bookingId" defaultValue={event?.bookingId ?? ""}><option value="">Keine</option>{event?.bookingId ? <option value={event.bookingId}>{event.bookingTitle ?? event.bookingId}</option> : null}{bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.title}</option>)}</select></label>
      <label>Beginn<input name="startsAt" type="datetime-local" defaultValue={local(event?.startsAt)} required /></label>
      <label>Ende<input name="endsAt" type="datetime-local" defaultValue={local(event?.endsAt)} required /></label>
      <label>Einlass<input name="admissionAt" type="datetime-local" defaultValue={local(event?.admissionAt)} /></label>
      <label>Veranstalter<input name="organizerName" defaultValue={event?.organizerName} maxLength={240} /></label>
      <label>Ticketlink<input name="ticketUrl" type="url" defaultValue={event?.ticketUrl} /></label>
      <label>Bild-URL<input name="imageUrl" type="url" defaultValue={event?.imageUrl} /></label>
      <label className="field-wide">Öffentliche Beschreibung<textarea name="description" rows={7} defaultValue={event?.description} maxLength={5000} /></label>
      <label className="checkbox-field"><input name="publishOrganizer" type="checkbox" defaultChecked={event?.publishOrganizer} />Veranstalter veröffentlichen</label>
      <label className="checkbox-field"><input name="publishTicketLink" type="checkbox" defaultChecked={event?.publishTicketLink} />Ticketlink veröffentlichen</label>
    </div>
    {state.error ? <p className="form-error">{state.error}</p> : null}<div className="form-actions"><Submit editing={Boolean(event)} /></div>
  </form>;
}
