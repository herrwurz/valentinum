import Link from "next/link";

import { bookingStatuses } from "@/features/bookings/booking-types";
import { getCurrentActor } from "@/lib/auth/session";
import { bookingService } from "@/server/services/booking-service-instance";
import type { BookingStatus } from "@/generated/prisma/client";

export const metadata = { title: "Buchungen" };
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

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const validStatus = bookingStatuses.includes(status as BookingStatus) ? (status as BookingStatus) : undefined;
  const actor = await getCurrentActor();
  const list = await bookingService.listForAdmin(actor, validStatus ? { status: validStatus } : undefined);

  return (
    <div className="admin-content">
      <section className="admin-heading compact-heading">
        <div>
          <div className="eyebrow">Buchungsverwaltung</div>
          <h1>Alle Buchungen</h1>
          <p>{list.length} Buchungen</p>
        </div>
        <Link className="button button-primary" href="/admin/kuehlwagen/neu">+ Kühlwagen buchen</Link>
      </section>

      <nav className="filter-tabs" aria-label="Status-Filter">
        <Link href="/admin/buchungen" className={!validStatus ? "filter-tab active" : "filter-tab"}>Alle</Link>
        {bookingStatuses.map((s) => (
          <Link key={s} href={`/admin/buchungen?status=${s}`} className={validStatus === s ? "filter-tab active" : "filter-tab"}>
            {statusLabels[s]}
          </Link>
        ))}
      </nav>

      <section className="resource-table-wrap">
        <table className="resource-table">
          <thead>
            <tr>
              <th>Buchung</th>
              <th>Ressourcen</th>
              <th>Zeitraum</th>
              <th>Antragsteller</th>
              <th>Status</th>
              <th><span className="sr-only">Aktionen</span></th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id}>
                <td><strong>{b.title}</strong><small>{formatter.format(b.createdAt)}</small></td>
                <td>{b.resourceNames.join(", ") || "–"}</td>
                <td><small>{formatter.format(b.startAt)}<br />bis {formatter.format(b.endAt)}</small></td>
                <td>{b.requesterName}<small>{b.requesterEmail}</small></td>
                <td><span className={`resource-status ${statusClass[b.status] ?? ""}`}>{statusLabels[b.status]}</span></td>
                <td className="table-actions">
                  <Link href={`/admin/buchungen/${b.id}`}>Details</Link>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={6} className="empty-state">Keine Buchungen vorhanden.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
