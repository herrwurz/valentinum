import { notFound } from "next/navigation";
/* eslint-disable @next/next/no-img-element */

export const dynamic = "force-dynamic";

import { eventCategoryLabels } from "@/features/events/event-types";
import { eventService } from "@/server/services/event-service-instance";

export default async function PublicEventPage({ params }: { params: Promise<{ id: string }> }) {
  const event = await eventService.getPublic((await params).id); if (!event) notFound();
  return <article className="page-shell event-detail"><div className="eyebrow">{eventCategoryLabels[event.category]}</div><h1>{event.title}</h1>{event.subtitle ? <p className="event-subtitle">{event.subtitle}</p> : null}{event.imageUrl ? <img className="event-hero" src={event.imageUrl} alt="" /> : null}<dl><dt>Beginn</dt><dd>{new Date(event.startsAt).toLocaleString("de-AT", { timeZone: "Europe/Vienna", dateStyle: "long", timeStyle: "short" })}</dd>{event.admissionAt ? <><dt>Einlass</dt><dd>{new Date(event.admissionAt).toLocaleString("de-AT", { timeZone: "Europe/Vienna", timeStyle: "short" })}</dd></> : null}{event.organizerName ? <><dt>Veranstalter</dt><dd>{event.organizerName}</dd></> : null}</dl>{event.description ? <p className="event-description">{event.description}</p> : null}{event.ticketUrl ? <a className="button button-primary" href={event.ticketUrl} target="_blank" rel="noreferrer">Tickets</a> : null}</article>;
}
