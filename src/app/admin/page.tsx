import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";

export const metadata = { title: "Verwaltung" };

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  return (
    <div className="admin-content">
      <section className="admin-heading">
        <div>
          <div className="eyebrow">Verwaltung</div>
          <h1>Guten Tag.</h1>
        </div>
        <span className="status-pill"><i aria-hidden="true" /> System bereit</span>
      </section>
      <section className="admin-card-grid">
        <Link className="admin-card" href="/admin/kalender">
          <span className="feature-number">Phase 4</span>
          <h2>Kalender</h2>
          <p>Buchungen und Sperrzeiten mit vollständigen Details.</p>
          <strong>Öffnen →</strong>
        </Link>
        {session?.user.role === "ADMIN" ? <Link className="admin-card" href="/admin/ressourcen">
          <span className="feature-number">Phase 2</span>
          <h2>Ressourcen</h2>
          <p>Räume, Fahrzeuge und Ausstattung verwalten.</p>
          <strong>Öffnen →</strong>
        </Link> : null}
        <Link className="admin-card" href="/admin/sperrzeiten">
          <span className="feature-number">Phase 3</span>
          <h2>Sperrzeiten</h2>
          <p>Wartungen und andere blockierende Zeiträume verwalten.</p>
          <strong>Öffnen →</strong>
        </Link>
      </section>
    </div>
  );
}
