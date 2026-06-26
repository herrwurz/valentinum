# Phase 7 – Veranstaltungen

Stand: 25.06.2026

## Umgesetzt

- `Event`-Entität und Prisma-Model ergänzt um Kategorie, Veröffentlichungsstatus, Veröffentlichung von Veranstalter- und Ticket-Link, Bild-URL, Beschreibung und Absage-Flag.
- Admin-Event-Modul mit Übersicht, Erstellung und Bearbeitung unter `/admin/veranstaltungen`.
- Public-Event-Ansicht unter `/veranstaltungen` sowie Detailseiten `/veranstaltungen/[id]`.
- Event-Veröffentlichung / Depublikation über serverseitige Action mit Audit-Logging.
- Event-Verknüpfung mit Buchungen: nur `APPROVED`/`COMPLETED` Buchungen können verknüpft werden.
- Event-Service und Repository implementieren `listAdmin`, `getAdmin`, `listPublic`, `getPublic`, `listLinkableBookings`, `create`, `update`, `setPublished`.
- Öffentliche Events werden anonym veröffentlicht und nur angezeigt, wenn `publicVisible = true` und `cancelled = false`.
- Events können ohne zugeordnete Buchung gespeichert werden; Buchungsverknüpfung ist optional und kann explizit entfernt werden.
- Service-Tests zeigen Funktionsfähigkeit von Event-Liste, Event-Aktualisierung und Veröffentlichungslogik.

## Prüfungen

- `npm run lint` erfolgreich.
- `npm run test` erfolgreich.
- `npm run build` erfolgreich.
- Event-Feature ist im Build als Route enthalten und wird serverseitig gerendert.

## Abgrenzung

- Kein Ticketverkaufsworkflow oder E-Commerce-Checkout vorhanden.
- Keine E-Mail-/Benachrichtigungslogik für veröffentlichte oder abgesagte Veranstaltungen.
- Keine automatisierte Zuordnung von Events zu Räumen über spezielle Event-Raum-Logik.
- Kein spezifischer Event-Kalender außerhalb der bestehenden öffentlichen Veranstaltungsseiten.
- Kein `ARCHIVED`-Workflow für Buchungen eingesetzt; das Modell behält den Status jedoch als mögliche Erweiterung.

## Weiteres

- Die Stabilisierungspunkte aus `docs/stabilization-2026-06.md` greifen oberhalb der Phase-7-Implementierung und betreffen Storno-/Abschluss-Workflows.
- Phase 8 (Kühlwagen-Prozess) ist noch offen und sollte nun als nächstes Thema angegangen werden.
