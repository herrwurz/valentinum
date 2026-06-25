"use client";

import FullCalendar from "@fullcalendar/react";
import { useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import deLocale from "@fullcalendar/core/locales/de";
import type { EventClickArg, EventContentArg, EventSourceFuncArg } from "@fullcalendar/core";

import { CalendarBookingActions } from "@/features/calendar/calendar-booking-actions";
import type { BookingStatusValue } from "@/features/bookings/booking-types";

const colors: Record<string, string> = {
  REQUESTED: "#b7791f", OPTION: "#9a6b16", APPROVED: "#175a48", CANCELLED: "#747b77",
  COMPLETED: "#3e6358", REJECTED: "#9f3028", ARCHIVED: "#6e716d", DRAFT: "#65758b",
  BLACKOUT: "#9f3028", BUSY: "#175a48",
  PUBLIC_EVENT: "#315f85",
};

export function CalendarView({ source, variant }: { source: string; variant: "public" | "admin" | "user" }) {
  const [selected, setSelected] = useState<{
    id: string;
    title: string;
    start: string;
    props: Record<string, unknown>;
  }>();
  function eventSource(info: EventSourceFuncArg, success: (events: object[]) => void, failure: (error: Error) => void) {
    const url = new URL(source, window.location.origin);
    url.searchParams.set("start", info.start.toISOString());
    url.searchParams.set("end", info.end.toISOString());
    fetch(url).then(async (response) => {
      if (!response.ok) throw new Error("Kalenderdaten konnten nicht geladen werden.");
      success(await response.json());
    }).catch(failure);
  }

  function eventContent(info: EventContentArg) {
    const props = info.event.extendedProps;
    const resources = Array.isArray(props.resourceNames) ? props.resourceNames.join(", ") : "";
    return <div className="calendar-event"><strong>{info.event.title}</strong>{resources ? <small>{resources}</small> : null}</div>;
  }

  function selectEvent(info: EventClickArg) {
    setSelected({
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      props: info.event.extendedProps,
    });
  }

  return (
    <div className={`calendar-frame calendar-${variant}`}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        initialView="dayGridMonth"
        locales={[deLocale]}
        locale="de"
        timeZone="Europe/Vienna"
        firstDay={1}
        height="auto"
        nowIndicator
        eventSources={[eventSource]}
        eventContent={eventContent}
        eventClick={variant === "public" ? undefined : selectEvent}
        eventColor={colors.BUSY}
        eventClassNames={(info) => {
          const key = info.event.extendedProps.kind === "BLACKOUT"
            ? "BLACKOUT"
            : info.event.extendedProps.status ?? info.event.extendedProps.kind ?? "BUSY";
          return [`calendar-status-${String(key).toLowerCase()}`];
        }}
        headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,listMonth" }}
        buttonText={{ today: "Heute", month: "Monat", week: "Woche", list: "Liste" }}
      />
      {selected ? <aside className="calendar-details" aria-live="polite">
        <div><small>Ausgewählter Eintrag</small><h2>{selected.title}</h2></div>
        <dl>
          {selected.props.status ? <><dt>Status</dt><dd>{String(selected.props.status)}</dd></> : null}
          {selected.props.resourceNames ? <><dt>Ressourcen</dt><dd>{(selected.props.resourceNames as string[]).join(", ")}</dd></> : null}
          {variant === "admin" && selected.props.requesterName ? <><dt>Antragsteller</dt><dd>{String(selected.props.requesterName)}</dd></> : null}
          {variant === "admin" && selected.props.requesterEmail ? <><dt>E-Mail</dt><dd>{String(selected.props.requesterEmail)}</dd></> : null}
          {variant === "admin" && selected.props.requesterPhone ? <><dt>Telefon</dt><dd>{String(selected.props.requesterPhone)}</dd></> : null}
          {variant === "admin" && selected.props.internalNote ? <><dt>Interne Notiz</dt><dd>{String(selected.props.internalNote)}</dd></> : null}
          {variant === "admin" && selected.props.reason ? <><dt>Grund</dt><dd>{String(selected.props.reason)}</dd></> : null}
        </dl>
        {selected.props.kind === "BOOKING" && selected.props.status ? (
          <CalendarBookingActions
            bookingId={selected.id}
            status={selected.props.status as BookingStatusValue}
            start={selected.start}
            variant={variant === "admin" ? "admin" : "user"}
          />
        ) : null}
      </aside> : null}
    </div>
  );
}
