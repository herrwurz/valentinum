import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/options";

export default async function UserLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/mein-bereich/kalender");
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div>
          <span className="sidebar-label">Mein Bereich</span>
          <nav aria-label="Benutzernavigation">
            <Link href="/mein-bereich/kalender">Kalender</Link>
            <Link href="/mein-bereich/buchungen">Meine Buchungen</Link>
          </nav>
        </div>
        <div className="admin-user">
          <small>Angemeldet als</small>
          <span>{session.user.email}</span>
          <Link href="/admin" className="text-button">Administration</Link>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
