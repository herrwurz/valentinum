"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createBookingRequestAction, type BookingRequestActionState } from "@/server/actions/booking-request-actions";

function Submit() {
  const { pending } = useFormStatus();
  return <button className="button button-primary" disabled={pending}>{pending ? "Wird gesendet …" : "Unverbindlich anfragen"}</button>;
}

interface BookingOptions {
  rooms: Array<{ id: string; name: string }>;
  equipment: Array<{ id: string; name: string }>;
  groups: Array<{ id: string; name: string; members: Array<{ name: string }> }>;
}

export function BookingRequestForm({ options }: { options: BookingOptions }) {
  const [state, action] = useActionState(createBookingRequestAction, {} as BookingRequestActionState);
  return <form className="resource-form booking-request-form" action={action}>
    <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <div className="form-grid">
      <label className="field-wide">Titel / Anlass<input name="title" required maxLength={160} /></label>
      <fieldset className="field-wide resource-selection"><legend>Raum oder unterstützte Kombination</legend>
        {options.rooms.map((resource) => <label key={resource.id} className="checkbox-field"><input type="radio" name="roomSelection" value={`resource:${resource.id}`} />{resource.name}</label>)}
        {options.groups.map((group) => <label key={group.id} className="checkbox-field"><input type="radio" name="roomSelection" value={`group:${group.id}`} />{group.name}<small>{group.members.map((member) => member.name).join(", ")}</small></label>)}
      </fieldset>
      {options.equipment.length > 0 ? <fieldset className="field-wide resource-selection"><legend>Zusätzliche Ausstattung</legend>{options.equipment.map((resource) => <label key={resource.id} className="checkbox-field"><input type="checkbox" name="equipmentIds" value={resource.id} />{resource.name}</label>)}</fieldset> : null}
      <label>Beginn<input name="startAt" type="datetime-local" required /></label>
      <label>Ende<input name="endAt" type="datetime-local" required /></label>
      <label>Name<input name="requesterName" required maxLength={160} autoComplete="name" /></label>
      <label>E-Mail<input name="requesterEmail" type="email" required maxLength={320} autoComplete="email" /></label>
      <label className="field-wide">Telefon<input name="requesterPhone" maxLength={80} autoComplete="tel" /></label>
      <label className="field-wide">Beschreibung / Zweck<textarea name="purpose" rows={5} maxLength={2000} /></label>
    </div>
    {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
    {state.success ? <p className="form-success" role="status">{state.success}</p> : null}
    <div className="form-actions"><Submit /></div>
  </form>;
}
