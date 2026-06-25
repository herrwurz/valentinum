# Phase 2 – Ressourcenverwaltung

Stand: 20.06.2026

## Umgesetzt

- geschützte Admin-Routen mit minimaler Auth.js-Credentials-Anmeldung
- serverseitige Admin-Rollenprüfung für Seiten, Services und Schreibaktionen
- Ressourcen-Repository als einzige Prisma-Zugriffsschicht
- ResourceService für Listen, Anzeigen, Anlegen, Bearbeiten und Aktiv/Inaktiv
- serverseitige Zod-Validierung aller Ressourceneingaben
- Ressourcenarten `ROOM`, `VEHICLE` und `EQUIPMENT`
- Pflege von Beschreibung, Standort, Kapazität, Fläche und öffentlicher Sichtbarkeit
- ressourcenabhängige Pufferzeiten davor und danach
- Admin-Oberflächen `/admin/ressourcen`, `/admin/ressourcen/neu` und `/admin/ressourcen/[id]`
- transaktionale Audit-Einträge für Erstellen, Ändern, Deaktivieren und Reaktivieren
- idempotenter Seed des konfigurierten Administratorkontos

Das „D“ aus CRUD wird entsprechend der höherrangigen API-Spezifikation als logische Deaktivierung umgesetzt. Es gibt bewusst keine physische Löschung und keine Funktionen aus Buchungs-, Kalender- oder späteren Fachphasen.

## Migration

`20260620105252_phase_2_resources` ergänzt:

- `UserRole`
- `User` mit Passwort-Hash und Rolle
- `AuditLog`
- automatisch erzeugte IDs für neue Ressourcen

Die Migration wurde erfolgreich auf PostgreSQL 17 angewendet; `prisma migrate status` meldet den aktuellen Stand als synchron.

## Prüfungen

- Auth.js-Anmeldung per Credentials: HTTP 200
- geschützte Ressourcenliste nach Anmeldung: HTTP 200
- Seed-Ressourcen in der Admin-Ansicht vorhanden
- CRUD-Service-Smoke-Test: Anlegen und Bearbeiten erfolgreich
- Aktiv/Inaktiv-Smoke-Test: Deaktivieren und Reaktivieren erfolgreich
- Audit-Smoke-Test: vier erwartete Audit-Einträge erzeugt
- Smoke-Testdaten wurden anschließend vollständig entfernt
- `npm run lint`: erfolgreich
- `npm run test`: erfolgreich, 8 Tests
- `npm run build`: erfolgreich

## Abgrenzung

- keine Buchungen oder Konfliktprüfung aus Phase 3
- keine Blackout Periods aus Phase 3
- keine Kalender aus Phase 4
- keine allgemeine Benutzer- oder Rollenverwaltung
- Audit-Protokollierung nur im für Phase 2 fachlich verpflichtenden Ressourcenumfang
