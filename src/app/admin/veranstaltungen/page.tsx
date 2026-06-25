import Link from "next/link";

import { eventCategoryLabels } from "@/features/events/event-types";
import { getCurrentActor } from "@/lib/auth/session";
import { setEventPublishedAction } from "@/server/actions/event-actions";
import { eventService } from "@/server/services/event-service-instance";

export const metadata = { title: "Veranstaltungen" };

export default async function AdminEventsPage() {
  const events = await eventService.listAdmin(await getCurrentActor());
  return <div className="admin-content"><section className="admin-heading compact-heading"><div><div className="eyebrow">Event-Modul</div><h1>Veranstaltungen</h1><p>{events.length} Einträge</p></div><Link className="button button-primary" href="/admin/veranstaltungen/neu">Neue Veranstaltung</Link></section>
    <div className="resource-table-wrap"><table className="resource-table"><thead><tr><th>Titel</th><th>Kategorie</th><th>Status</th><th /></tr></thead><tbody>{events.map((event) => <tr key={event.id}><td><strong>{event.title}</strong><small>{event.startsAt.toLocaleString("de-AT", { timeZone: "Europe/Vienna" })}</small></td><td>{eventCategoryLabels[event.category]}</td><td><span className={`resource-status ${event.publicVisible ? "is-active" : "is-inactive"}`}>{event.publicVisible ? "Veröffentlicht" : "Intern"}</span></td><td className="table-actions"><Link href={`/admin/veranstaltungen/${event.id}`}>Bearbeiten</Link><form action={setEventPublishedAction}><input type="hidden" name="id" value={event.id} /><input type="hidden" name="published" value={String(!event.publicVisible)} /><button className="text-button">{event.publicVisible ? "Depublizieren" : "Veröffentlichen"}</button></form></td></tr>)}</tbody></table></div>
  </div>;
}
