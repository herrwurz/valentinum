import { NextResponse } from "next/server";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Einmaliger Seed-Endpunkt – nach Verwendung löschen
// Aufruf: POST /api/admin/seed mit Header X-Seed-Token: seed-valentinum-2026
const SEED_TOKEN = "seed-valentinum-2026";

async function runMigrations(connectionString: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require("pg") as typeof import("pg");
  const pool = new Pool({ connectionString });
  const log: string[] = [];
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        id VARCHAR(36) PRIMARY KEY,
        checksum VARCHAR(64) NOT NULL,
        finished_at TIMESTAMPTZ,
        migration_name VARCHAR(255) NOT NULL,
        logs TEXT,
        rolled_back_at TIMESTAMPTZ,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        applied_steps_count INTEGER NOT NULL DEFAULT 0
      )
    `);

    const migrationsDir = join(process.cwd(), "prisma", "migrations");
    if (!existsSync(migrationsDir)) {
      return "prisma/migrations nicht gefunden";
    }

    const migrationFolders = readdirSync(migrationsDir)
      .filter(f => f !== "migration_lock.toml")
      .sort();

    for (const folder of migrationFolders) {
      const sqlFile = join(migrationsDir, folder, "migration.sql");
      if (!existsSync(sqlFile)) continue;

      const existing = await pool.query(
        `SELECT id FROM "_prisma_migrations" WHERE migration_name = $1 AND finished_at IS NOT NULL`,
        [folder]
      );
      if (existing.rows.length > 0) {
        log.push(`skip: ${folder}`);
        continue;
      }

      const sql = readFileSync(sqlFile, "utf8");
      await pool.query(sql);
      await pool.query(
        `INSERT INTO "_prisma_migrations" (id, checksum, migration_name, finished_at, applied_steps_count)
         VALUES (gen_random_uuid()::text, '', $1, NOW(), 1)`,
        [folder]
      );
      log.push(`applied: ${folder}`);
    }
  } finally {
    await pool.end();
  }
  return log.join(", ") || "keine ausstehenden Migrationen";
}

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

  let migrateResult = "";
  try {
    migrateResult = await runMigrations(connectionString);
  } catch (err) {
    migrateResult = `Fehler: ${err instanceof Error ? err.message : String(err)}`;
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
      migrate: migrateResult,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg, migrate: migrateResult }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
