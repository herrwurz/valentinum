import { getCurrentActor } from "@/lib/auth/session";
import { damageSeverities, damageSeverityLabels, feeTypeLabels, feeTypes } from "@/features/vehicle/vehicle-types";
import { createHandoverProtocolAction, createReturnProtocolAction } from "@/server/actions/vehicle-protocol-actions";
import { vehicleProtocolService } from "@/server/services/vehicle-protocol-service-instance";

export const metadata = { title: "Kühlwagen-Prozess" };
export const dynamic = "force-dynamic";

const dateTime = new Intl.DateTimeFormat("de-AT", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Vienna" });
const euro = new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" });
const noticeText: Record<string, string> = {
  uebergabe: "Das Übergabeprotokoll wurde gespeichert.",
  rueckgabe: "Das Rückgabeprotokoll wurde gespeichert.",
};

function HandoverForm({ bookingId }: { bookingId: string }) {
  return (
    <form className="resource-form" action={createHandoverProtocolAction}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <h3>Übergabe erfassen</h3>
      <div className="form-grid">
        <label>Übergabezeitpunkt<input name="handedOverAt" type="datetime-local" required /></label>
        <label>Abholort<input name="pickupLocation" required maxLength={200} /></label>
        <label>Kilometerstand<input name="odometer" type="number" min={0} step={1} /></label>
        <label>Tankfüllung (%)<input name="fuelLevel" type="number" min={0} max={100} step={1} /></label>
        <label>Kaution (€)<input name="depositAmount" type="number" min={0} step="0.01" inputMode="decimal" /></label>
        <label className="field-wide">Zustand<textarea name="condition" rows={2} required maxLength={2000} /></label>
        <label className="field-wide">Zubehör<input name="accessories" maxLength={2000} /></label>
        <label className="field-wide">Notizen<textarea name="notes" rows={2} maxLength={2000} /></label>
      </div>
      <div className="form-actions"><button className="button button-primary">Übergabe speichern</button></div>
    </form>
  );
}

function ReturnForm({ bookingId }: { bookingId: string }) {
  return (
    <form className="resource-form" action={createReturnProtocolAction}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <h3>Rückgabe erfassen</h3>
      <div className="form-grid">
        <label>Rückgabezeitpunkt<input name="returnedAt" type="datetime-local" required /></label>
        <label>Rückgabeort<input name="returnLocation" required maxLength={200} /></label>
        <label>Kilometerstand<input name="odometer" type="number" min={0} step={1} /></label>
        <label>Tankfüllung (%)<input name="fuelLevel" type="number" min={0} max={100} step={1} /></label>
        <label className="checkbox-field"><input type="checkbox" name="cleaningOk" defaultChecked /> Reinigung in Ordnung</label>
        <label className="field-wide">Zustand<textarea name="condition" rows={2} required maxLength={2000} /></label>
        <label className="field-wide">Notizen<textarea name="notes" rows={2} maxLength={2000} /></label>
      </div>
      <fieldset className="resource-selection field-wide">
        <legend>Schäden (optional)</legend>
        {[0, 1, 2].map((row) => (
          <div className="form-grid" key={row}>
            <label className="field-wide">Beschreibung<input name="damageDescription" maxLength={2000} /></label>
            <label>Schwere
              <select name="damageSeverity" defaultValue="MINOR">
                {damageSeverities.map((severity) => <option key={severity} value={severity}>{damageSeverityLabels[severity]}</option>)}
              </select>
            </label>
            <label>Geschätzte Kosten (€)<input name="damageCost" type="number" min={0} step="0.01" inputMode="decimal" /></label>
          </div>
        ))}
      </fieldset>
      <fieldset className="resource-selection field-wide">
        <legend>Gebühren / Kaution (optional)</legend>
        {[0, 1, 2].map((row) => (
          <div className="form-grid" key={row}>
            <label>Art
              <select name="feeType" defaultValue="RENTAL">
                {feeTypes.map((type) => <option key={type} value={type}>{feeTypeLabels[type]}</option>)}
              </select>
            </label>
            <label>Betrag (€)<input name="feeAmount" type="number" min={0} step="0.01" inputMode="decimal" /></label>
            <label>Hinweis<input name="feeNote" maxLength={500} /></label>
          </div>
        ))}
      </fieldset>
      <div className="form-actions"><button className="button button-primary">Rückgabe speichern</button></div>
    </form>
  );
}

export default async function KuehlwagenPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const bookings = await vehicleProtocolService.listKuehlwagenBookings(await getCurrentActor());
  const notice = await searchParams;
  return (
    <div className="admin-content">
      <section className="admin-heading compact-heading">
        <div>
          <div className="eyebrow">Kühlwagen-Verleih</div>
          <h1>Kühlwagen-Prozess</h1>
          <p>{bookings.length} genehmigte oder abgeschlossene Kühlwagen-Buchungen</p>
        </div>
      </section>
      {notice.error ? <p className="form-error">{notice.error}</p> : null}
      {notice.success ? <p className="form-success">{noticeText[notice.success] ?? "Vorgang gespeichert."}</p> : null}
      {bookings.length === 0 ? <p>Derzeit liegen keine Kühlwagen-Buchungen vor.</p> : null}
      <div className="request-list">
        {bookings.map((booking) => (
          <article className="request-card" key={booking.id}>
            <div>
              <h2>{booking.title}</h2>
              <p>{booking.vehicleNames.join(", ")} · {dateTime.format(booking.startAt)} – {dateTime.format(booking.endAt)}</p>
            </div>
            <dl>
              <dt>Antragsteller</dt><dd>{booking.requesterName}</dd>
              <dt>E-Mail</dt><dd>{booking.requesterEmail}</dd>
              {booking.requesterPhone ? <><dt>Telefon</dt><dd>{booking.requesterPhone}</dd></> : null}
              <dt>Erfasste Beträge</dt><dd>{euro.format(booking.feeTotal)}</dd>
            </dl>

            {booking.handover ? (
              <div className="protocol-summary">
                <h3>Übergabe</h3>
                <p>{dateTime.format(booking.handover.handedOverAt)} · {booking.handover.pickupLocation}</p>
                <p>Zustand: {booking.handover.condition}</p>
                {booking.handover.depositAmount !== undefined ? <p>Kaution: {euro.format(booking.handover.depositAmount)}</p> : null}
              </div>
            ) : (
              <HandoverForm bookingId={booking.id} />
            )}

            {booking.handover && !booking.return ? <ReturnForm bookingId={booking.id} /> : null}

            {booking.return ? (
              <div className="protocol-summary">
                <h3>Rückgabe</h3>
                <p>{dateTime.format(booking.return.returnedAt)} · {booking.return.returnLocation}</p>
                <p>Reinigung: {booking.return.cleaningOk ? "in Ordnung" : "beanstandet"}</p>
                {booking.return.damages.length > 0 ? (
                  <ul>
                    {booking.return.damages.map((damage) => (
                      <li key={damage.id}>{damageSeverityLabels[damage.severity]}: {damage.description}{damage.estimatedCost !== undefined ? ` (${euro.format(damage.estimatedCost)})` : ""}</li>
                    ))}
                  </ul>
                ) : <p>Keine Schäden dokumentiert.</p>}
                {booking.return.fees.length > 0 ? (
                  <ul>
                    {booking.return.fees.map((fee) => (
                      <li key={fee.id}>{feeTypeLabels[fee.type]}: {euro.format(fee.amount)}{fee.note ? ` – ${fee.note}` : ""}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            <div className="request-actions">
              <a className="button" href={`/api/documents/booking/${booking.id}`}>Bestätigung (PDF)</a>
              {booking.handover ? <a className="button" href={`/api/documents/handover/${booking.id}`}>Übergabe (PDF)</a> : null}
              {booking.return ? <a className="button" href={`/api/documents/return/${booking.id}`}>Rückgabe (PDF)</a> : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
