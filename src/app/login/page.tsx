import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { LoginForm } from "@/features/auth/login-form";
import { authOptions } from "@/lib/auth/options";

export const metadata = { title: "Anmeldung" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect(session.user.role === "USER" ? "/mein-bereich/kalender" : "/admin");
  const { callbackUrl } = await searchParams;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <img src="/valentinum-logo.png" alt="Valentinum" className="auth-logo" />
          <p className="auth-brand-sub">Buchungsplattform</p>
          <p className="auth-brand-desc">Verwaltungsportal für Räume, Kühlwagen und Veranstaltungen.</p>
        </div>
        <div className="auth-card">
          <p className="auth-eyebrow">Login</p>
          <h1 className="auth-title">Anmeldung</h1>
          <p className="auth-hint">Melden Sie sich mit Ihrer E-Mail-Adresse und Ihrem Passwort an.</p>
          <LoginForm callbackUrl={callbackUrl} />
          <p className="auth-note">Nach der Anmeldung werden Sie automatisch in den passenden Bereich weitergeleitet.</p>
        </div>
      </div>
    </div>
  );
}
