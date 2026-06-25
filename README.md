# Valentinum & Kühlwagen Buchungsplattform

Eigenständige Webanwendung und verbindliche Dokumentationsbasis für:

- Kühlwagen-Verleih
- Raumverwaltung Valentinum
- Veranstaltungsmanagement Valentinum
- öffentliche Kalender
- interne Verwaltungsprozesse
- Dokumente, Exporte, Audit und spätere Erweiterungen

Das Projekt ist technisch und fachlich von der bestehenden Hallenverwaltung getrennt.

## Voraussetzungen

- Node.js LTS
- npm
- Docker mit Docker Compose oder eine eigene PostgreSQL-Instanz

## Lokale Einrichtung

```powershell
Copy-Item .env.example .env
npm install
npm run auth:hash -- "ein-sicheres-admin-passwort"
docker compose up -d
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

Den von `auth:hash` ausgegebenen Base64-Wert als `ADMIN_PASSWORD_HASH_BASE64` in `.env` eintragen. Zusätzlich müssen `AUTH_SECRET` und `ADMIN_EMAIL` gesetzt sein. Der Seed legt dieses Administratorkonto idempotent an beziehungsweise aktualisiert es.

Unter Windows mit restriktiver PowerShell-Ausführungsrichtlinie kann `npm.cmd` anstelle von `npm` verwendet werden.

Die Anwendung ist anschließend unter `http://localhost:3000` erreichbar. Die Anmeldung liegt unter `http://localhost:3000/login`, der geschützte Verwaltungsbereich unter `http://localhost:3000/admin`.

## Qualitätsprüfungen

```powershell
npm run lint
npm run test
npm run test:phase2
npm run test:phase3
npm run test:phase4
npm run test:phase5
npm run test:phase6
npm run build
```

## Datenbank

Phase 1 enthält ausschließlich die Ressourcenbasis. Der Seed ist idempotent und legt diese initialen Ressourcen an:

- Großer Saal
- Foyer
- Lounge
- Kühlwagen

Fachmodelle späterer Phasen werden bewusst noch nicht vorgezogen.

## Ressourcenverwaltung

Administratoren können unter `/admin/ressourcen` Räume, Fahrzeuge und Ausstattung anlegen und bearbeiten. Unterstützt werden Beschreibung, Standort, Kapazität, Fläche, öffentliche Sichtbarkeit sowie Pufferzeiten davor und danach. Entfernen wird entsprechend der API-Spezifikation als Deaktivierung umgesetzt; inaktive Ressourcen können wieder aktiviert werden.

Alle Ressourcenänderungen werden serverseitig validiert, rollenbasiert autorisiert und zusammen mit einem Audit-Eintrag transaktional gespeichert.

## Buchungslogik

Phase 3 stellt den serverseitigen `BookingService` bereit. Genehmigungen prüfen Statusübergang, aktive Ressourcen, ressourcenabhängige Pufferzeiten, bereits genehmigte Buchungen, optional blockierende `OPTION`-Buchungen und Sperrzeiten. Betroffene Ressourcen werden innerhalb der Genehmigungstransaktion in stabiler Reihenfolge gesperrt; parallele, kollidierende Freigaben können dadurch nicht beide erfolgreich sein.

`OPTION_BLOCKS` konfiguriert, ob Optionen blockieren. Sperrzeiten werden unter `/admin/sperrzeiten` verwaltet. Datums-/Zeitwerte der Oberfläche werden verbindlich als `Europe/Vienna` interpretiert und intern als UTC gespeichert.

## Kalender

- `/kalender`: öffentliche, vollständig anonymisierte Frei-/Belegt-Ansicht
- `/admin/kalender`: Buchungen und Sperrzeiten mit internen Details für STAFF und ADMIN
- `/mein-bereich/kalender`: ausschließlich eigene Buchungen eines USER-Kontos

Die Kalenderdaten werden über getrennte DTOs und Endpunkte erzeugt. Öffentliche Ereignis-IDs sind mit `AUTH_SECRET` abgeleitete Kennungen und geben keine Datenbank-IDs preis.

## Buchungsanfragen

Unter `/anfrage` können öffentliche Besucher und angemeldete Benutzer eine unverbindliche Anfrage für öffentlich buchbare Räume und Ausstattung stellen. Die Anfrage erhält immer `REQUESTED`; eine automatische Genehmigung findet nicht statt. Unter `/admin/anfragen` können STAFF und ADMIN offene Anfragen prüfen, konfliktgesichert genehmigen oder mit Pflichtgrund ablehnen.

Kühlwagen-Anfragen werden bewusst erst mit dem spezialisierten Kühlwagen-Prozess in Phase 8 freigeschaltet, da dort die zwingenden Abhol-/Rückgabezeiten und -orte fachlich modelliert werden.

## Valentinum-Raumkombinationen

Phase 6 stellt die dokumentierten Kombinationen `Lounge + Foyer`, `Foyer + Großer Saal` und `Gesamtes Valentinum` bereit. Bei einer Anfrage löst der Service die Gruppe serverseitig in alle enthaltenen Räume auf. Dadurch blockiert eine genehmigte Gruppenbuchung jeden Teilraum und umgekehrt. Frei erfundene Mehrfachauswahlen einzelner Räume werden serverseitig verhindert.

Kapazitäten werden pro Raum in der Ressourcenverwaltung gepflegt. Ausstattungen verwenden die Ressourcenart `EQUIPMENT` und können einer Raum- oder Gruppenanfrage hinzugefügt werden. Eine Gruppenkapazität wird nicht automatisch summiert, da dafür keine fachliche Regel definiert ist.

## Dokumentation

Vor jeder Umsetzung ist [`docs/00-codex-start.md`](docs/00-codex-start.md) zu beachten. Die Dateien `docs/01-pflichtenheft-v3.0.md` bis `docs/15-definition-of-done.md` bilden die verbindliche fachliche und technische Grundlage des Projekts.

Bei Widersprüchen gilt die dokumentierte Priorität:

1. Pflichtenheft
2. Business Rules
3. Architektur
4. API-Spezifikation
5. Implementierungsdetails

Ergänzende Projektdokumente:

- [Architektur- und Anforderungsreview](docs/architecture-review.md)
- [Abschlussdokumentation Phase 1](docs/phase-1.md)
- [Abschlussdokumentation Phase 2](docs/phase-2.md)
- [Abschlussdokumentation Phase 3](docs/phase-3.md)
- [Abschlussdokumentation Phase 4](docs/phase-4.md)
- [Abschlussdokumentation Phase 5](docs/phase-5.md)
- [Abschlussdokumentation Phase 6](docs/phase-6.md)
