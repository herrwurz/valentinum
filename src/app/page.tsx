import Link from "next/link";

export default function Home() {
  return (
    <div className="page-shell">
      <section className="hero">
        <div className="eyebrow">Willkommen im Valentinum</div>
        <h1>Räume und Kühlwagen.<br />Einfach organisiert.</h1>
        <p>
          Die neue, eigenständige Plattform für Ressourcen und Veranstaltungen
          befindet sich im Aufbau.
        </p>
        <div className="actions">
          <Link className="button button-primary" href="/admin">Zur Verwaltung</Link>
          <span className="phase-badge">Projektbasis · Phase 1</span>
        </div>
      </section>
      <section className="feature-grid" aria-label="Geplante Bereiche">
        <article>
          <span className="feature-number">01</span>
          <h2>Valentinum</h2>
          <p>Großer Saal, Foyer und Lounge als klar getrennte Ressourcen.</p>
        </article>
        <article>
          <span className="feature-number">02</span>
          <h2>Kühlwagen</h2>
          <p>Eine solide Basis für den späteren digitalen Verleihprozess.</p>
        </article>
        <article>
          <span className="feature-number">03</span>
          <h2>Eigenständig</h2>
          <p>Technisch und fachlich unabhängig von der bestehenden Hallenverwaltung.</p>
        </article>
      </section>
    </div>
  );
}
