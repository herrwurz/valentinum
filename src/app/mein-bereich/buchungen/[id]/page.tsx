import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentActor } from "@/lib/auth/session";
import { cancelBookingAction } from "@/server/actions/booking-workflow-actions";
import { bookingService } from "@/server/services/booking-service-instance";

export const metadata = { title: "Buchungsdetail" };
export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  DRAFT: "Entwurf", REQUESTED: "Angefragt", OPTION: "Option", APPROVED: "Genehmigt",
  REJECTED: "Abgelehnt", CANCELLED: "Storniert", COMPLETED: "Abgeschlossen", ARCHIVED: "Archiviert",
};
const fmt = new Intl.DateTimeFormat("de-AT", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Vienna" });

export default async function UserBookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const notice = await searchParams;
  const actor = await getCurrentActor();

  let booking: Awaited<ReturnType<typeof bookingService.getForUser>>;
  try {
    booking = await bookingService.getForUser(actor, id);
  } catch {
    notFound();
  }

  const canCancel =
    booking.status === "REQUESTED" ||
    (["APPROVED", "OPTION"].includes(booking.status) && booking.startAt > new Date());

  return (
    <div className="admin-content">
      <section className="admin-heading compact-heading">
        <div>
          <div className="eyebrow"><Link href="/mein-bereich/buchungen">← Meine Buchungen</Link></div>
          <h1>{booking.title}</h1>
          <p>
            <span className={`resource-status calendar-status-${booking.status.toLowerCase()}`}>{statusLabels[booking.status]}</span>
            {" "}· {fmt.format(booking.startAt)} – {fmt.format(booking.endAt)}
          </p>
        </div>
      </section>

      {notice.error && <p className="form-error">{notice.error}</p>}
      {notice.success && <p className="form-success">{notice.success}</p>}

      <div className="detail-grid">
        <section className="admin-card">
          <h2>Buchungsdetails</h2>
          <dl className="detail-list">
            <dt>Ressourcen</dt>
            <dd>{booking.resourceNames.join(", ") || "–"}</dd>
            <dt>Beginn</dt><dd>{fmt.format(booking.startAt)}</dd>
            <dt>Ende</dt><dd>{fmt.format(booking.endAt)}</dd>
            {booking.purpose && <><dt>Zweck</dt><dd>{booking.purpose}</dd></>}
          </dl>
        </section>

        {canCancel && (
          <section className="admin-card">
            <h2>Aktionen</h2>
            <form action={cancelBookingAction}>
              <input type="hidden" name="id" value={booking.id} />
              <input type="hidden" name="scope" value="user" />
              <button className="button button-danger" type="submit">Buchung stornieren</button>
            </form>
          </section>
        )}

        <section className="admin-card">
          <h2>Statusverlauf</h2>
          <ol className="history-list">
            {booking.history.map((h) => (
              <li key={h.id}>
                <span className={`resource-status calendar-status-${h.toStatus.toLowerCase()}`}>{statusLabels[h.toStatus]}</span>
                {" "}{fmt.format(h.changedAt)}
                {h.reason && <p className="history-reason">{h.reason}</p>}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
