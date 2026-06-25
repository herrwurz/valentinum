import { CalendarView } from "@/features/calendar/calendar-view";

export const metadata = { title: "Admin-Kalender" };

export default async function AdminCalendarPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const notice = await searchParams;
  return (
    <div className="admin-content calendar-page">
      <div className="eyebrow">Vollständige Details</div>
      <h1>Admin-Kalender</h1>
      {notice.error ? <p className="form-error">{notice.error}</p> : null}
      {notice.success ? <p className="form-success">Buchung wurde {notice.success}.</p> : null}
      <CalendarView source="/api/calendar/admin" variant="admin" />
    </div>
  );
}
