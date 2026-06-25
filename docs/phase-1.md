# Phase 1 – Projektbasis

Stand: 20.06.2026

## Umgesetzt

- eigenständiges Next.js-Projekt mit App Router und TypeScript Strict Mode
- Tailwind CSS mit PostCSS
- Grundlayout sowie erreichbare Routen `/` und `/admin`
- Prisma-7-Konfiguration für PostgreSQL
- initiale Migration für das Ressourcenmodell
- idempotenter Seed für Großer Saal, Foyer, Lounge und Kühlwagen
- lokale PostgreSQL-Konfiguration über Docker Compose
- Vitest-Basiskonfiguration und Tests für die initialen Seed-Daten
- ESLint-Konfiguration und reproduzierbare Setup-Dokumentation

Funktionen späterer Phasen, insbesondere Authentifizierung, Ressourcen-CRUD, Buchungen, Raumgruppen und Kalender, wurden nicht vorgezogen.

## Prüfungen

- `npx prisma format`: erfolgreich
- `npx prisma validate`: erfolgreich
- `npx prisma generate`: erfolgreich
- `npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`: erfolgreich
- `npx prisma migrate deploy`: erfolgreich gegen PostgreSQL 17
- `npm run db:seed`: zweimal erfolgreich; Idempotenz nachgewiesen
- Datenbankprüfung: exakt vier aktive initiale Ressourcen vorhanden
- `npm run lint`: erfolgreich
- `npm run test`: erfolgreich, 2 Tests
- `npm run build`: erfolgreich mit Next.js Webpack-Build; `/` und `/admin` werden statisch erzeugt

## Datenbanknachweis

Die initiale Migration wurde am 20.06.2026 erfolgreich gegen den PostgreSQL-17-Container angewendet. Der Seed wurde unmittelbar nacheinander zweimal ausgeführt. Die anschließende Abfrage enthielt unverändert exakt:

- Foyer (`ROOM`)
- Großer Saal (`ROOM`)
- Kühlwagen (`VEHICLE`)
- Lounge (`ROOM`)

Damit sind Migration, Seed-Inhalt und Seed-Idempotenz praktisch nachgewiesen.
