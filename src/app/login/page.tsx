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
    <div className="login-shell">
      <section className="login-card">
        <div className="eyebrow">Sicherer Bereich</div>
        <h1>Verwaltung</h1>
        <p>Melden Sie sich mit Ihrem Administratorkonto an.</p>
        <LoginForm callbackUrl={callbackUrl} />
      </section>
    </div>
  );
}
