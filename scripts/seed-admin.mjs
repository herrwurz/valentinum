#!/usr/bin/env node
// Admin-User anlegen/aktualisieren – ohne tsx
// Im Container ausführen: node scripts/seed-admin.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH_BASE64 = process.env.ADMIN_PASSWORD_HASH_BASE64;

if (!DATABASE_URL) throw new Error('DATABASE_URL nicht gesetzt');
if (!ADMIN_EMAIL) throw new Error('ADMIN_EMAIL nicht gesetzt');
if (!ADMIN_PASSWORD_HASH_BASE64) throw new Error('ADMIN_PASSWORD_HASH_BASE64 nicht gesetzt');

const email = ADMIN_EMAIL.toLowerCase();
const passwordHash = Buffer.from(ADMIN_PASSWORD_HASH_BASE64, 'base64').toString('utf8');

const pool = new Pool({ connectionString: DATABASE_URL });

try {
  await pool.query(`
    INSERT INTO "User" (id, email, name, "passwordHash", role, active, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, 'ADMIN'::"UserRole", true, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET
      name         = EXCLUDED.name,
      "passwordHash" = EXCLUDED."passwordHash",
      role         = 'ADMIN'::"UserRole",
      active       = true,
      "updatedAt"  = NOW()
  `, ['initial-admin', email, 'Administrator', passwordHash]);
  console.log(`Admin-User angelegt/aktualisiert: ${email}`);
} finally {
  await pool.end();
}
