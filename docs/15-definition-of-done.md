# Definition of Done

Eine Phase gilt nur als abgeschlossen, wenn:

## Fachlich

- Alle Akzeptanzkriterien der Phase erfüllt sind.
- Keine bekannte fachliche Muss-Regel verletzt wird.
- Datenschutzregeln sind eingehalten.
- Rollenprüfung ist serverseitig umgesetzt.

## Technisch

- TypeScript ohne relevante Fehler.
- Lint erfolgreich.
- Tests erfolgreich.
- Build erfolgreich.
- Keine ungenutzten groben Codepfade.
- Keine TODOs für Muss-Funktionalität der aktuellen Phase.

## Architektur

- Fachlogik liegt in Services.
- Datenzugriff ist gekapselt.
- UI-Komponenten enthalten keine Geschäftslogik.
- Public DTOs sind anonymisiert.

## Dokumentation

- README aktualisiert, falls Setup betroffen.
- Relevante docs aktualisiert.
- Änderungen kurz zusammengefasst.

## Codex-Abschlussmeldung

Codex soll am Ende jeder Phase liefern:

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
