import Link from "next/link";

import { getCurrentActor } from "@/lib/auth/session";
import { bookingService } from "@/server/services/booking-service-instance";

export const metadata = { title: "Meine Buchungen" };
export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  DRAFT: "Entwurf", REQUESTED: "Angefragt", OPTION: "Option", APPROVED: "Genehmigt",
  REJECTED: "Abgelehnt", CANCELLED: "Storniert", COMPLETED: "Abgeschlossen", ARCHIVED: "Archiviert",
};
const statusClass: Record<string, string> = {
  REQUESTED: "calendar-status-requested", OPTION: "calendar-status-option",
  APPROVED: "calendar-status-approved", REJECTED: "calendar-status-rejected",
  CANCELLED: "calendar-status-cancelled", COMPLETED: "calendar-status-completed",
};
const formatter = new Intl.DateTimeFormat("de-AT", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Vienna" });

export default async function UserBookingsPage() {
  const actor = await getCurrentActor();
  const bookings = await bookingService.listForUser(actor);

  return (
    <div className="admin-content">
      <section className="admin-heading compact-heading">
        <div>
          <div className="eyebrow">Mein Bereich</div>
          <h1>Meine Buchungen</h1>
          <p>{bookings.length} Buchungen</p>
        </div>
        <Link className="button button-primary" href="/anfrage">Neue Anfrage</Link>
      </section>

      {bookings.length === 0 ? (
        <p>Sie haben noch keine Buchungen erstellt. <Link href="/anfrage">Jetzt anfragen →</Link></p>
      ) : (
        <section className="resource-table-wrap">
          <table className="resource-table">
            <thead>
              <tr>
                <th>Buchung</th>
                <th>Ressourcen</th>
                <th>Zeitraum</th>
                <th>Status</th>
                <th><span className="sr-only">Aktionen</span></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.title}</strong><small>{formatter.format(b.createdAt)}</small></td>
                  <td>{b.resourceNames.join(", ") || "–"}</td>
                  <td><small>{formatter.format(b.startAt)}<br />bis {formatter.format(b.endAt)}</small></td>
                  <td><span className={`resource-status ${statusClass[b.status] ?? ""}`}>{statusLabels[b.status]}</span></td>
                  <td className="table-actions">
                    <Link href={`/mein-bereich/buchungen/${b.id}`}>Details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
