import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/admin/sign-out-button";
import { authOptions } from "@/lib/auth/options";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role === "USER") {
    redirect("/login");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div>
          <span className="sidebar-label">Administration</span>
          <nav aria-label="Verwaltungsnavigation">
            <Link href="/admin">Übersicht</Link>
            <Link href="/admin/kalender">Kalender</Link>
            <Link href="/admin/anfragen">Anfragen</Link>
            <Link href="/admin/veranstaltungen">Veranstaltungen</Link>
            {session.user.role === "ADMIN" ? <Link href="/admin/ressourcen">Ressourcen</Link> : null}
            {session.user.role === "ADMIN" ? <Link href="/admin/raumkombinationen">Raumkombinationen</Link> : null}
            <Link href="/admin/sperrzeiten">Sperrzeiten</Link>
          </nav>
        </div>
        <div className="admin-user">
          <small>Angemeldet als</small>
          <span>{session.user.email}</span>
          <SignOutButton />
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
