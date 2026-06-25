import { CalendarView } from "@/features/calendar/calendar-view";

export const metadata = { title: "Kalender" };

export default function PublicCalendarPage() {
  return <div className="page-shell calendar-page"><div className="eyebrow">Frei / Belegt</div><h1>Kalender</h1><p className="calendar-intro">Belegte Zeiten werden ohne personenbezogene oder interne Angaben dargestellt.</p><CalendarView source="/api/calendar/public" variant="public" /></div>;
}
