"use client";

import { useActionState } from "react";
import Link from "next/link";

import { createAdminBookingAction } from "@/server/actions/booking-request-actions";

const VEHICLE_ID = "initial-vehicle-kuehlwagen";

export default function NeueKuehlwagenBuchungPage() {
  const [state, action, pending] = useActionState(createAdminBookingAction, {});

  return (
    <div className="admin-content">
      <section className="admin-heading compact-heading">
        <div>
          <div className="eyebrow"><Link href="/admin/kuehlwagen">← Kühlwagen</Link></div>
          <h1>Neue Kühlwagen-Buchung</h1>
          <p>Buchung wird direkt als genehmigt angelegt.</p>
        </div>
      </section>

      {state.error && <p className="form-error">{state.error}</p>}
      {state.success && <p className="form-success">{state.success}</p>}

      <form className="resource-form" action={action}>
        <input type="hidden" name="resourceId" value={VEHICLE_ID} />

        <div className="form-grid">
          <label className="field-wide">
            Buchungstitel
            <input name="title" required maxLength={200} placeholder="z. B. Vereinsfest Sommer 2026" />
          </label>

          <label>
            Abholung (Beginn)
            <input name="startAt" type="datetime-local" required />
          </label>
          <label>
            Rückgabe (Ende)
            <input name="endAt" type="datetime-local" required />
          </label>

          <label>
            Antragsteller / Mieter
            <input name="requesterName" required maxLength={200} />
          </label>
          <label>
            E-Mail
            <input name="requesterEmail" type="email" required maxLength={200} />
          </label>
          <label>
            Telefon
            <input name="requesterPhone" type="tel" maxLength={50} />
          </label>
          <label className="field-wide">
            Verwendungszweck
            <textarea name="purpose" rows={2} maxLength={1000} />
          </label>
        </div>

        <div className="form-actions">
          <button className="button button-primary" disabled={pending}>
            {pending ? "Wird gespeichert…" : "Buchung anlegen"}
          </button>
          <Link href="/admin/kuehlwagen" className="button">Abbrechen</Link>
        </div>
      </form>
    </div>
  );
}
