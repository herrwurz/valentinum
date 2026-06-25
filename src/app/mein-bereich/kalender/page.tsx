import { CalendarView } from "@/features/calendar/calendar-view";

export const metadata = { title: "Mein Kalender" };

export default async function UserCalendarPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const notice = await searchParams;
  return (
    <div className="calendar-page">
      <div className="eyebrow">Mein Bereich</div>
      <h1>Meine Buchungen</h1>
      {notice.error ? <p className="form-error">{notice.error}</p> : null}
      {notice.success ? <p className="form-success">Buchung wurde {notice.success}.</p> : null}
      <CalendarView source="/api/calendar/user" variant="user" />
    </div>
  );
}
