import type { BookingStatusValue } from "@/features/bookings/booking-types";

export interface CalendarRange { start: Date; end: Date }

export interface PublicBusyCalendarEvent {
  id: string;
  title: "Belegt";
  start: string;
  end: string;
  extendedProps: { kind: "BUSY"; resourceNames: string[] };
}

export interface PublicEventCalendarEvent {
  id: string; title: string; start: string; end: string;
  extendedProps: {
    kind: "PUBLIC_EVENT"; category: string; description?: string; organizerName?: string;
    ticketUrl?: string; resourceNames: string[];
  };
}

export type PublicCalendarEvent = PublicBusyCalendarEvent | PublicEventCalendarEvent;

export interface AdminCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    kind: "BOOKING" | "BLACKOUT" | "PUBLIC_EVENT";
    status?: BookingStatusValue;
    resourceNames: string[];
    requesterName?: string;
    requesterEmail?: string;
    requesterPhone?: string;
    internalNote?: string;
    reason?: string;
  };
}

export interface UserCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: { kind: "BOOKING"; status: BookingStatusValue; resourceNames: string[] };
}

export type CalendarEventDto = PublicCalendarEvent | AdminCalendarEvent | UserCalendarEvent;
