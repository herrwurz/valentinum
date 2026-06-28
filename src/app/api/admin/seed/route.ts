import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Einmaliger Seed-Endpunkt – nach Verwendung löschen
// Aufruf: POST /api/admin/seed mit Header X-Seed-Token: seed-valentinum-2026
const SEED_TOKEN = "seed-valentinum-2026";

export async function POST(request: Request) {
  const token = request.headers.get("x-seed-token");
  if (token !== SEED_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connectionString = process.env.DATABASE_URL;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHashBase64 = process.env.ADMIN_PASSWORD_HASH_BASE64;

  if (!connectionString || !adminEmail || !adminPasswordHashBase64) {
    return NextResponse.json({ error: "Fehlende Umgebungsvariablen" }, { status: 500 });
  }

  // Migrationen anwenden
  let migrateOutput = "";
  try {
    migrateOutput = execSync(
      "node ./node_modules/prisma/dist/bin.js migrate deploy",
      { cwd: process.cwd(), encoding: "utf8", env: { ...process.env } }
    );
  } catch (err) {
    migrateOutput = err instanceof Error ? err.message : String(err);
  }

  const passwordHash = Buffer.from(adminPasswordHashBase64, "base64").toString("utf8");

  const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });
  try {
    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: { active: true, name: "Administrator", passwordHash, role: "ADMIN" },
      create: {
        id: "initial-admin",
        email: adminEmail.toLowerCase(),
        name: "Administrator",
        passwordHash,
        role: "ADMIN",
      },
    });
    return NextResponse.json({
      ok: true,
      message: `Admin-User angelegt: ${adminEmail}`,
      migrate: migrateOutput,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg, migrate: migrateOutput }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
