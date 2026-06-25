# Codex Startanweisung

## Pflicht vor jeder Umsetzung

Lies zuerst vollständig:

1. `docs/01-pflichtenheft-v3.0.md`
2. `docs/02-business-rules.md`
3. `docs/03-architecture.md`
4. `docs/04-data-model.md`
5. `docs/06-roles-permissions.md`
6. `docs/14-implementation-phases.md`
7. `docs/15-definition-of-done.md`

## Projektname

`valentinum-kuehlwagen-buchung`

## Grundregel

Die bestehende Hallenverwaltung bleibt getrennt. Dieses Projekt ist eigenständig.

## Arbeitsweise

- Immer nur die aktuell beauftragte Phase umsetzen.
- Keine Funktionen späterer Phasen vorziehen.
- Fachlogik gehört in Services.
- Datenzugriff gehört in Repositories oder Services.
- Keine Prisma-Zugriffe in React-Komponenten.
- Serverseitige Validierung ist verpflichtend.
- Öffentliche Kalender dürfen keine personenbezogenen Daten anzeigen.
- Nach jeder Phase: Lint, Tests, Build.
- Fehler werden behoben, bevor weiterentwickelt wird.

## Start mit Phase 1

Wenn keine andere Phase ausdrücklich genannt ist, beginne mit Phase 1 aus `docs/14-implementation-phases.md`.
