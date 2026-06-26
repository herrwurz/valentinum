"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

  if (isAuthPage) return <>{children}</>;

  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Valentinum Startseite">
          <img src="/valentinum-logo.png" alt="Valentinum" className="brand-logo" />
        </Link>
        <nav aria-label="Hauptnavigation">
          <Link href="/kalender">Kalender</Link>
          <Link href="/veranstaltungen">Veranstaltungen</Link>
          <Link href="/anfrage">Anfrage stellen</Link>
          <Link href="/admin">Verwaltung</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <span>Stadtgemeinde Mattighofen</span>
        <span>Valentinum &amp; Kühlwagen</span>
      </footer>
    </>
  );
}
