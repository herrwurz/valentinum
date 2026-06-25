import { getCurrentActor } from "@/lib/auth/session";
import { approveBookingAction, rejectBookingAction } from "@/server/actions/booking-request-actions";
import { bookingService } from "@/server/services/booking-service-instance";

export const metadata = { title: "Offene Anfragen" };
const formatter = new Intl.DateTimeFormat("de-AT", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Vienna" });

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const requests = await bookingService.listRequested(await getCurrentActor());
  const notice = await searchParams;
  return <div className="admin-content"><section className="admin-heading compact-heading"><div><div className="eyebrow">Buchungsverwaltung</div><h1>Offene Anfragen</h1><p>{requests.length} warten auf Bearbeitung</p></div></section>
    {notice.error ? <p className="form-error">{notice.error}</p> : null}
    {notice.success ? <p className="form-success">Anfrage wurde {notice.success}.</p> : null}
    <div className="request-list">{requests.map((request) => <article className="request-card" key={request.id}>
      <div><span className="resource-status calendar-status-requested">Anfrage</span><h2>{request.title}</h2><p>{request.resourceNames.join(", ")} · {formatter.format(request.startAt)} – {formatter.format(request.endAt)}</p></div>
      <dl><dt>Antragsteller</dt><dd>{request.requesterName}</dd><dt>E-Mail</dt><dd>{request.requesterEmail}</dd>{request.requesterPhone ? <><dt>Telefon</dt><dd>{request.requesterPhone}</dd></> : null}{request.purpose ? <><dt>Zweck</dt><dd>{request.purpose}</dd></> : null}</dl>
      <div className="request-actions"><form action={approveBookingAction}><input type="hidden" name="id" value={request.id} /><button className="button button-primary">Genehmigen</button></form><form className="reject-form" action={rejectBookingAction}><input type="hidden" name="id" value={request.id} /><input name="reason" required placeholder="Ablehnungsgrund" /><button className="button button-danger">Ablehnen</button></form></div>
    </article>)}</div>
  </div>;
}
