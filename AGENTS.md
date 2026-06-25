# Valentinum & Kühlwagen Buchungsplattform

## Projekt

Eigenständige Webanwendung für:

- Kühlwagen-Verleih
- Raumverwaltung Valentinum
- Veranstaltungsverwaltung
- öffentliche und interne Kalender
- Dokumente, Exporte und Audit

Die bestehende Hallenverwaltungssoftware ist ein separates Projekt. Sie darf weder technisch integriert noch als fachliche Quelle verwendet werden.

## Verbindliche Dokumentation

Vor jeder Umsetzung vollständig lesen:

1. `docs/01-pflichtenheft-v3.0.md`
2. `docs/02-business-rules.md`
3. `docs/03-architecture.md`
4. `docs/04-data-model.md`
5. `docs/06-roles-permissions.md`
6. `docs/14-implementation-phases.md`
7. `docs/15-definition-of-done.md`

Zusätzlich die für die aktuelle Aufgabe relevanten Spezifikationen lesen. Bei Widersprüchen gilt:

1. Pflichtenheft
2. Business Rules
3. Architektur
4. API-Spezifikation
5. Implementierungsdetails

`docs/architecture-review.md` enthält bekannte Lücken und Risiken. Bereits entschiedene oder geprüfte Punkte nicht ohne Anlass erneut breit analysieren.

## Technologie

- Next.js App Router
- TypeScript Strict Mode
- PostgreSQL und Prisma
- Auth.js
- Tailwind CSS
- Zod
- Vitest und Playwright
- Docker Compose

## Architektur

- Geschäftslogik liegt ausschließlich in Application Services.
- React-Komponenten und API-/Action-Einstiegspunkte enthalten keine Geschäftslogik.
- Prisma-Zugriffe liegen ausschließlich hinter Repositories.
- Alle Eingaben werden serverseitig validiert.
- Alle Schreiboperationen prüfen Rollen und Rechte serverseitig.
- Jede `/admin/*`-Seite prüft die Admin-/Staff-Berechtigung serverseitig.
- Mutationen mit Historie und Audit werden atomar gespeichert.
- Public DTOs verwenden eine explizite Whitelist und enthalten keine personenbezogenen oder internen Daten.
- Fehler werden als `ValidationError`, `PermissionError`, `ConflictError`, `NotFoundError` oder `BusinessRuleError` fachlich verständlich abgebildet.

## Fachliche Kernregeln

- Ressourcenarten: `ROOM`, `VEHICLE`, `EQUIPMENT`.
- Buchungen werden nicht physisch gelöscht, sondern über Statusänderungen historisiert.
- Erlaubte Statusübergänge folgen ausschließlich `docs/10-calendar-booking-logic.md`.
- Genehmigungen müssen Konflikte, Blackout Periods, Puffer und Rechte erneut prüfen.
- Konfliktprüfung und Genehmigung müssen transaktional gegen parallele Freigaben geschützt sein.
- Zeitraumüberschneidung: `existing.startAt < candidate.endAt AND existing.endAt > candidate.startAt`.
- Raumgruppen werden in enthaltene Ressourcen aufgelöst; Logik aus Phase 6 nicht vorziehen.
- Öffentliche Ansichten zeigen interne Buchungen ausschließlich anonymisiert als „Belegt“.
- Ressourcen-, Buchungs-, Event-, Protokoll- und Systemeinstellungsänderungen werden entsprechend den Business Rules auditiert.

## Phasenreinheit

- Immer nur die ausdrücklich beauftragte Phase umsetzen.
- Keine Funktionen späterer Phasen vorziehen.
- Aktuelle Reihenfolge steht in `docs/14-implementation-phases.md`.
- Jede Phase erfüllt `docs/15-definition-of-done.md`.
- Nach jeder Phase: Migration/Prisma prüfen, Tests, Lint und Build ausführen, Fehler beheben und Änderungen dokumentieren.

## Kritische Arbeitsweise

- Korrektheit, Sicherheit, Datenintegrität und Wartbarkeit gehen vor Stil.
- Problematische Anforderungen oder Lösungen klar benennen und eine bessere Alternative vorschlagen.
- Annahmen nicht stillschweigend erfinden; unklare Fachregeln als offene Entscheidung dokumentieren.
- Einfachste wartbare Lösung wählen; keine vorsorglichen Erweiterungen oder Abstraktionen.
- Nur betroffene Bereiche ändern; keine ungefragten Refactorings.
- Durch eigene Änderungen entstandenen Dead Code entfernen, fremden Dead Code nur melden.
- Besonders prüfen: Race Conditions, Nullzugriffe, Grenzfälle, Zeitzonen, Intervallgrenzen und Datenlecks.

## Credit-Sparmodus

Ziel ist minimale Laufzeit und minimaler Kontextverbrauch ohne Qualitätsverlust.

- Nur relevante Dateien lesen; bekannte Reviews und Abschlussdokumente wiederverwenden.
- Tool-Aufrufe bündeln und redundante Status-/Dateiprüfungen vermeiden.
- Während der Entwicklung gezielte Tests und TypeScript-Prüfung verwenden.
- Volle Test-, Lint- und Build-Matrix nur beim Phasenabschluss oder vor Commit/Push ausführen.
- Für bekannte Langläufer direkt realistische Timeouts verwenden: gezielte Checks 2–4 Minuten, Build/volle Tests 6–10 Minuten.
- Bekannte Windows-/OneDrive- oder Docker-Probleme nicht wiederholt von Grund auf diagnostizieren.
- Keine automatischen Commits oder Pushes, wenn nur lokale Umsetzung verlangt ist.
- Große Phasen knapp in Service, Datenbank, UI, Tests und Dokumentation zerlegen.

## Erlaubte Standardbefehle

Ohne zusätzliche Rückfrage im beauftragten Projektumfang:

```text
npm install
npm ci
npm run lint
npm run test
npm run build
npx tsc --noEmit
npx prisma validate
npx prisma generate
npx prisma format
npx prisma migrate dev
npx prisma db seed
docker compose config
docker compose up -d
git status
git branch
git log --oneline --decorate -20
git diff
git diff --stat
git remote -v
```

## Verbotene oder rückfragepflichtige Aktionen

Ohne ausdrückliche Freigabe nicht ausführen:

```text
git reset --hard
git clean -fd
git push --force
git rebase
git checkout main
git merge main
npx prisma migrate reset
npx prisma db push --force-reset
rekursive Löschbefehle
```

Ebenfalls verboten:

- `.env`, Secrets oder Passwörter committen oder in Logs ausgeben
- Migrationen löschen oder bereits angewendete Migrationen verändern
- Datenbanken destruktiv leeren
- direkt auf `main` entwickeln oder committen

## Git-Regeln

- Branches standardmäßig mit `codex/` beginnen, sofern der Nutzer nichts anderes verlangt.
- Kleine, nachvollziehbare Commits und Pull Request vor Merge.
- `develop` ist Test-/Integrationsbranch, `main` Produktionsbranch.
- Vor Commit/Push: relevante Tests, Prisma-Validierung, TypeScript, Lint und Build erfolgreich; keine Secrets.

## Abschlussmeldung je Phase

```text
Umgesetzt:
- ...

Tests:
- npm run lint: ...
- npm run test: ...
- npm run build: ...

Offene Punkte:
- ...
```

Zusätzlich geänderte/neue Dateien und behobene Fehler knapp nennen.
