# Implementierungsphasen

## Phase 1: Projektbasis

Ziele:
- Next.js Projekt
- TypeScript
- Tailwind
- Prisma
- PostgreSQL
- Grundlayout
- Seed initialer Ressourcen

Akzeptanz:
- App startet
- Migration läuft
- Seed erzeugt Kühlwagen, Großer Saal, Foyer, Lounge
- / und /admin erreichbar

## Phase 2: Ressourcenverwaltung

Ziele:
- CRUD Ressourcen
- Ressourcenarten
- Pufferzeiten
- Aktiv/Inaktiv

Akzeptanz:
- Admin kann Ressourcen verwalten

## Phase 3: Buchungslogik

Ziele:
- BookingService
- Konfliktprüfung
- Statushistorie
- Blackout Periods

Akzeptanz:
- Doppelbuchungen werden verhindert
- Tests vorhanden

## Phase 4: Kalender

Ziele:
- FullCalendar
- Public Calendar
- Admin Calendar
- User Calendar

Akzeptanz:
- Public Ansicht anonymisiert
- Admin sieht Details

## Phase 5: Buchungsanfragen

Ziele:
- Anfrageformular
- Validierung
- Admin-Liste offener Anfragen

Akzeptanz:
- REQUESTED Buchungen können erstellt werden

## Phase 6: Valentinum Räume

Ziele:
- Raumkombinationen
- Kapazitäten
- Ausstattungen

Akzeptanz:
- Gruppenbuchung blockiert Teilräume korrekt

## Phase 7: Veranstaltungen

Ziele:
- Event-Modul
- öffentliche Veranstaltungen
- Kategorien
- Ticketlinks

Akzeptanz:
- Event erscheint öffentlich, wenn freigegeben

## Phase 8: Kühlwagen-Prozess

Ziele:
- Übergabe
- Rückgabe
- Schäden
- Kaution/Gebühren

Akzeptanz:
- Protokolle speicherbar

## Phase 9: Dokumente & Export

Ziele:
- PDF-Bestätigung
- Übergabe-PDF
- Rückgabe-PDF
- CSV/Excel

Akzeptanz:
- Admin kann Dokumente erzeugen

## Phase 10: Hardening

Ziele:
- Rechte finalisieren
- Audit vervollständigen
- Tests erweitern
- Build stabilisieren
- README finalisieren

Akzeptanz:
- lint/test/build erfolgreich
