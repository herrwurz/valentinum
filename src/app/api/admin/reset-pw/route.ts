// TEMPORÄRE ROUTE – nach Passwort-Reset sofort löschen
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

const RESET_TOKEN = "reset-pw-valentinum-2026";
// Hash für: Valentinum2026!
const NEW_HASH_B64 =
  "JDJiJDEyJFNOU3hwcmFMNWJBVDRRcFk2SjJRYS40MzhIREpTQ3UyMmRWdXMvbG1QeE1FNzZWNVJFd2VP";

export async function POST(req: Request) {
  const token = req.headers.get("x-reset-token");
  if (token !== RESET_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const passwordHash = Buffer.from(NEW_HASH_B64, "base64").toString("utf8");

  await prisma.user.update({
    where: { email: "andreas@hofreither.at" },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
