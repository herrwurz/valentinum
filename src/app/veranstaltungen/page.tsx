import Link from "next/link";
/* eslint-disable @next/next/no-img-element */

import { eventCategoryLabels } from "@/features/events/event-types";
import { eventService } from "@/server/services/event-service-instance";

export const metadata = { title: "Veranstaltungen" };
export const dynamic = "force-dynamic";

export default async function PublicEventsPage() {
  const events = await eventService.listPublic();
  return <div className="page-shell events-page"><div className="eyebrow">Valentinum Programm</div><h1>Veranstaltungen</h1><div className="public-event-grid">{events.map((event) => <Link className="public-event-card" href={`/veranstaltungen/${event.id}`} key={event.id}>{event.imageUrl ? <img src={event.imageUrl} alt="" /> : null}<div><span>{eventCategoryLabels[event.category]}</span><h2>{event.title}</h2>{event.subtitle ? <p>{event.subtitle}</p> : null}<time>{new Date(event.startsAt).toLocaleString("de-AT", { timeZone: "Europe/Vienna", dateStyle: "long", timeStyle: "short" })}</time></div></Link>)}</div></div>;
}
