import type { Metadata } from "next";

import SiteShell from "@/components/site-shell";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Valentinum",
    template: "%s | Valentinum",
  },
  description: "Buchungsplattform für Valentinum und Kühlwagen.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
