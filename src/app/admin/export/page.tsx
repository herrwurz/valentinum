import { bookingStatuses } from "@/features/bookings/booking-types";

export const metadata = { title: "Export" };

const statusLabels: Record<string, string> = {
  DRAFT: "Entwurf",
  REQUESTED: "Angefragt",
  OPTION: "Option",
  APPROVED: "Genehmigt",
  REJECTED: "Abgelehnt",
  CANCELLED: "Storniert",
  COMPLETED: "Abgeschlossen",
  ARCHIVED: "Archiviert",
};

export default function ExportPage() {
  return (
    <div className="admin-content">
      <section className="admin-heading compact-heading">
        <div>
          <div className="eyebrow">Dokumente &amp; Export</div>
          <h1>Buchungen exportieren</h1>
          <p>CSV-Datei (Semikolon-getrennt, für Excel) über den gewählten Zeitraum erzeugen.</p>
        </div>
      </section>
      <form className="resource-form" method="get" action="/api/exports/bookings">
        <div className="form-grid">
          <label>Von (Beginn ab)<input name="from" type="date" /></label>
          <label>Bis (Beginn bis)<input name="to" type="date" /></label>
          <label>Status
            <select name="status" defaultValue="">
              <option value="">Alle</option>
              {bookingStatuses.map((status) => <option key={status} value={status}>{statusLabels[status] ?? status}</option>)}
            </select>
          </label>
        </div>
        <div className="form-actions"><button className="button button-primary">CSV herunterladen</button></div>
      </form>
    </div>
  );
}
