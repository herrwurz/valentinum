# Phase 6 – Valentinum Räume

Stand: 22.06.2026

## Umgesetzt

- `ResourceGroup` und `ResourceGroupMember` im Prisma-Datenmodell
- idempotenter Seed der drei dokumentierten Kombinationen
- `ResourceGroupRepository` und `ResourceGroupService`
- serverseitige Auflösung einer Gruppe in sämtliche Teilraum-IDs
- Buchungsanfrage mit Einzelraum oder unterstützter Raumkombination
- optionale zusätzliche Ressourcen vom Typ `EQUIPMENT`
- Verhinderung frei kombinierter mehrerer Einzelräume
- Verhinderung der Mischung einer Raumgruppe mit zusätzlichen Einzelräumen
- Prüfung auf aktive, öffentlich sichtbare ROOM-Mitglieder
- Admin-Übersicht `/admin/raumkombinationen` mit Teilräumen und gepflegten Kapazitäten
- Kapazitätsfelder und Ausstattung bauen auf der Ressourcenverwaltung aus Phase 2 auf

## Initiale Gruppen

- Lounge + Foyer
- Foyer + Großer Saal
- Gesamtes Valentinum: Lounge, Foyer und Großer Saal

## Fachliche Entscheidung

Die ursprüngliche Gruppenauswahl wird in Phase 6 nicht als zusätzliche Booking-Relation gespeichert, weil der verbindliche Prisma-Entwurf dies nicht vorsieht. Für Konflikte werden die enthaltenen Räume atomar als normale `BookingResource`-Zeilen gespeichert. Damit bleibt die Blockierungslogik unabhängig von späteren Änderungen einer Gruppendefinition nachvollziehbar.

Kapazitäten werden nicht über Gruppenmitglieder summiert. Eine solche Summenregel ist fachlich nicht dokumentiert und könnte bei gemeinsam genutzten Flächen falsche Werte erzeugen.

## Prüfungen

- Unit-Test der vollständigen Gruppenauflösung
- unbekannte, inaktive oder nicht buchbare Gruppen werden abgewiesen
- Anfragevalidierung akzeptiert eine Gruppe ohne direkten Einzelraum
- PostgreSQL-Smoke-Test bestätigt drei initiale Gruppen
- `Gesamtes Valentinum` erzeugt exakt drei `BookingResource`-Zeilen
- genehmigte Gruppenbuchung verhindert eine überlappende Foyer-Genehmigung
- Smoke-Testdaten werden im `finally` vollständig entfernt

## Abgrenzung

- keine Events aus Phase 7
- kein Kühlwagen-Prozess aus Phase 8
- keine automatische Gruppenkapazität ohne fachliche Regel
- keine allgemeine CRUD-Oberfläche für frei definierbare Gruppen, da Version 1 ausschließlich die dokumentierten Kombinationen vorgibt
