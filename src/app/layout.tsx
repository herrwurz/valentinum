import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Valentinum Buchungsplattform",
    template: "%s | Valentinum",
  },
  description: "Eigenständige Buchungsplattform für Valentinum und Kühlwagen.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="Valentinum Startseite">
            <span className="brand-mark" aria-hidden="true">V</span>
            <span>
              <strong>Valentinum</strong>
              <small>Buchungsplattform</small>
            </span>
          </Link>
          <nav aria-label="Hauptnavigation">
            <Link href="/">Start</Link>
            <Link href="/kalender">Kalender</Link>
            <Link href="/veranstaltungen">Veranstaltungen</Link>
            <Link href="/anfrage">Anfrage</Link>
            <Link href="/admin">Verwaltung</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <span>Stadtgemeinde Mattighofen</span>
          <span>Valentinum &amp; Kühlwagen</span>
        </footer>
      </body>
    </html>
  );
}
