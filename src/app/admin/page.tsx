import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { getCurrentActor } from "@/lib/auth/session";
import { bookingService } from "@/server/services/booking-service-instance";

export const metadata = { title: "Verwaltung" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [session, actor] = await Promise.all([getServerSession(authOptions), getCurrentActor()]);
  const stats = await bookingService.getDashboardStats(actor);

  return (
    <div className="admin-content">
      <section className="admin-heading">
        <div>
          <div className="eyebrow">Verwaltung</div>
          <h1>Guten Tag{session?.user.name ? `, ${session.user.name}` : ""}.</h1>
        </div>
        <span className="status-pill"><i aria-hidden="true" /> System bereit</span>
      </section>

      <section className="admin-card-grid">
        <Link className="admin-card" href="/admin/kalender">
          <span className="feature-number">Kalender</span>
          <h2>Kalender</h2>
          <p>Buchungen und Sperrzeiten mit vollständigen Details.</p>
          <strong>Öffnen →</strong>
        </Link>

        <Link className="admin-card" href="/admin/buchungen">
          <span className="feature-number">Buchungen</span>
          <h2>Alle Buchungen</h2>
          <p>Vollständige Buchungsliste mit Statusfilter und Aktionen.</p>
          <strong>Öffnen →</strong>
        </Link>

        <Link className="admin-card highlight" href="/admin/anfragen">
          <span className="feature-number">{stats.requestedCount > 0 ? `${stats.requestedCount} offen` : "Keine offen"}</span>
          <h2>Offene Anfragen</h2>
          <p>Neue Buchungsanfragen genehmigen oder ablehnen.</p>
          <strong>Öffnen →</strong>
        </Link>

        <Link className="admin-card" href="/admin/kuehlwagen">
          <span className="feature-number">{stats.vehicleActiveCount > 0 ? `${stats.vehicleActiveCount} aktiv` : "Kein aktiver Verleih"}</span>
          <h2>Kühlwagen</h2>
          <p>Übergabe- und Rückgabeprotokolle für aktive Verleihvorgänge.</p>
          <strong>Öffnen →</strong>
        </Link>

        <Link className="admin-card" href="/admin/veranstaltungen">
          <span className="feature-number">Veranstaltungen</span>
          <h2>Veranstaltungen</h2>
          <p>Veranstaltungen erstellen, bearbeiten und veröffentlichen.</p>
          <strong>Öffnen →</strong>
        </Link>

        <Link className="admin-card" href="/admin/sperrzeiten">
          <span className="feature-number">Sperrzeiten</span>
          <h2>Sperrzeiten</h2>
          <p>Wartungen und blockierende Zeiträume verwalten.</p>
          <strong>Öffnen →</strong>
        </Link>

        {session?.user.role === "ADMIN" ? <Link className="admin-card" href="/admin/ressourcen">
          <span className="feature-number">Ressourcen</span>
          <h2>Ressourcen</h2>
          <p>Räume, Fahrzeuge und Ausstattung verwalten.</p>
          <strong>Öffnen →</strong>
        </Link> : null}

        {session?.user.role === "ADMIN" ? <Link className="admin-card" href="/admin/raumkombinationen">
          <span className="feature-number">Räume</span>
          <h2>Raumkombinationen</h2>
          <p>Valentinum-Kombinations&shy;belegungen einsehen.</p>
          <strong>Öffnen →</strong>
        </Link> : null}

        {session?.user.role === "ADMIN" ? <Link className="admin-card" href="/admin/benutzer">
          <span className="feature-number">Benutzer</span>
          <h2>Benutzer</h2>
          <p>Mitarbeiter- und Administrator-Konten verwalten.</p>
          <strong>Öffnen →</strong>
        </Link> : null}

        <Link className="admin-card" href="/admin/export">
          <span className="feature-number">Export</span>
          <h2>Export</h2>
          <p>Buchungen als CSV-Datei exportieren.</p>
          <strong>Öffnen →</strong>
        </Link>
      </section>
    </div>
  );
}

