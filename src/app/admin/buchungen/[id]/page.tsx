import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentActor } from "@/lib/auth/session";
import { approveBookingAction, rejectBookingAction } from "@/server/actions/booking-request-actions";
import { cancelBookingAction, completeBookingAction } from "@/server/actions/booking-workflow-actions";
import { bookingService } from "@/server/services/booking-service-instance";

export const metadata = { title: "Buchungsdetail" };
export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  DRAFT: "Entwurf", REQUESTED: "Angefragt", OPTION: "Option", APPROVED: "Genehmigt",
  REJECTED: "Abgelehnt", CANCELLED: "Storniert", COMPLETED: "Abgeschlossen", ARCHIVED: "Archiviert",
};
const resourceTypeLabels: Record<string, string> = { ROOM: "Raum", VEHICLE: "Fahrzeug", EQUIPMENT: "Ausstattung" };
const fmt = new Intl.DateTimeFormat("de-AT", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Vienna" });

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const notice = await searchParams;
  const actor = await getCurrentActor();

  let booking: Awaited<ReturnType<typeof bookingService.getForAdmin>>;
  try {
    booking = await bookingService.getForAdmin(actor, id);
  } catch {
    notFound();
  }

  const canApprove = booking.status === "REQUESTED" || booking.status === "OPTION";
  const canReject = booking.status === "REQUESTED" || booking.status === "OPTION";
  const canCancel = booking.status === "REQUESTED" || booking.status === "OPTION" || booking.status === "APPROVED";
  const canComplete = booking.status === "APPROVED";
  const isVehicle = booking.resourceTypes.includes("VEHICLE");

  return (
    <div className="admin-content">
      <section className="admin-heading compact-heading">
        <div>
          <div className="eyebrow"><Link href="/admin/buchungen">← Buchungen</Link></div>
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
            <dd>{booking.resources.map((r) => `${r.name} (${resourceTypeLabels[r.type] ?? r.type})`).join(", ") || "–"}</dd>
            <dt>Beginn</dt><dd>{fmt.format(booking.startAt)}</dd>
            <dt>Ende</dt><dd>{fmt.format(booking.endAt)}</dd>
            {booking.purpose && <><dt>Zweck</dt><dd>{booking.purpose}</dd></>}
            {booking.locationText && <><dt>Ort</dt><dd>{booking.locationText}</dd></>}
            {booking.internalNote && <><dt>Interne Notiz</dt><dd>{booking.internalNote}</dd></>}
          </dl>
        </section>

        <section className="admin-card">
          <h2>Kontaktperson</h2>
          <dl className="detail-list">
            <dt>Name</dt><dd>{booking.requesterName}</dd>
            <dt>E-Mail</dt><dd><a href={`mailto:${booking.requesterEmail}`}>{booking.requesterEmail}</a></dd>
            {booking.requesterPhone && <><dt>Telefon</dt><dd>{booking.requesterPhone}</dd></>}
          </dl>
        </section>

        <section className="admin-card">
          <h2>Aktionen</h2>
          <div className="request-actions">
            {canApprove && (
              <form action={approveBookingAction}>
                <input type="hidden" name="id" value={booking.id} />
                <button className="button button-primary">Genehmigen</button>
              </form>
            )}
            {canComplete && (
              <form action={completeBookingAction}>
                <input type="hidden" name="id" value={booking.id} />
                <input type="hidden" name="scope" value="admin" />
                <button className="button button-primary">Abschließen</button>
              </form>
            )}
            {isVehicle && (booking.status === "APPROVED" || booking.status === "COMPLETED") && (
              <Link className="button" href="/admin/kuehlwagen">Protokolle verwalten</Link>
            )}
            {canReject && (
              <form action={rejectBookingAction} className="reject-form">
                <input type="hidden" name="id" value={booking.id} />
                <input name="reason" required placeholder="Ablehnungsgrund" />
                <button className="button button-danger">Ablehnen</button>
              </form>
            )}
            {canCancel && (
              <form action={cancelBookingAction}>
                <input type="hidden" name="id" value={booking.id} />
                <input type="hidden" name="scope" value="admin" />
                <button className="button button-danger" type="submit">Stornieren</button>
              </form>
            )}
          </div>
        </section>

        <section className="admin-card">
          <h2>Statusverlauf</h2>
          <ol className="history-list">
            {booking.history.map((h) => (
              <li key={h.id}>
                <span className={`resource-status calendar-status-${h.toStatus.toLowerCase()}`}>{statusLabels[h.toStatus]}</span>
                {" "}{fmt.format(h.changedAt)}
                {h.changedByEmail && <small> · {h.changedByEmail}</small>}
                {h.reason && <p className="history-reason">{h.reason}</p>}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
