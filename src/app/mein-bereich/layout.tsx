import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/options";

export default async function UserLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/mein-bereich/kalender");
  return <div className="page-shell user-area">{children}</div>;
}
