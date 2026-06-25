# Phase 3 – Buchungslogik

Stand: 20.06.2026

## Umgesetzt

- `BookingService` mit serverseitiger STAFF-/ADMIN-Prüfung
- atomare Genehmigung mit PostgreSQL-Zeilensperren auf allen betroffenen Ressourcen
- Konfliktprüfung für mehrere Ressourcen, Pufferzeiten, genehmigte Buchungen, konfigurierbare Optionen und Blackout Periods
- exakt dokumentierter Statusautomat mit Ablehnung aller nicht erlaubten Übergänge
- transaktionaler Statuswechsel nach `APPROVED` inklusive `BookingStatusHistory` und `AuditLog`
- strukturierte, fachlich verständliche Konfliktfehler
- `BlackoutService` für Auflisten, Erstellen und Löschen
- Verhinderung neuer Sperrzeiten über bestehenden genehmigten Buchungen
- Admin-Seite `/admin/sperrzeiten` mit serverseitig validiertem Formular
- feste Interpretation lokaler Formulardaten in `Europe/Vienna`, UTC-Speicherung und Prüfung nicht existierender Sommerzeit-Uhrzeiten
- `OPTION_BLOCKS` als explizite Konfiguration; lokaler Standard ist konservativ `true`

## Migration

`20260620152636_phase_3_booking_logic` ergänzt:

- `BookingStatus`
- `Booking`
- `BookingResource`
- `BookingStatusHistory`
- `BlackoutPeriod`
- notwendige Relationen und Abfrageindizes

## Sicherheits- und Parallelitätsentscheidung

Eine reine Konfliktprüfung vor dem Statuswechsel würde zwei parallele Genehmigungen nicht sicher verhindern. Der Repository-Ablauf sperrt daher innerhalb derselben Transaktion alle betroffenen Ressourcenzeilen sortiert mit `FOR UPDATE`, lädt Konflikte erst unter dieser Sperre und schreibt Status, Historie und Audit atomar.

Blackouts, die eine genehmigte Buchung überschneiden, werden abgelehnt. Dies löst die in UC-009 offene Alternative „verhindert oder warnt“ zugunsten der datensicheren Variante, ohne bestehende Freigaben still nachträglich zu invalidieren.

## Prüfungen

- Konfliktalgorithmus: genehmigte Überschneidung, REQUESTED, CANCELLED und OPTION
- angrenzende Intervalle mit und ohne Puffer
- Blackout-Konflikte und `ignoreBookingId`
- alle erlaubten und unerlaubte Statusübergänge
- STAFF-/ADMIN-Berechtigungen
- Zeitzonen-Konvertierung für Winterzeit, Sommerzeit und DST-Lücke
- Integrations-Smoke-Test gegen PostgreSQL: Genehmigung, Konflikt, Blackout, Historie und Audit
- Paralleltest: Von zwei gleichzeitig genehmigten Überschneidungen wird exakt eine zugelassen
- Integrations-Testdaten werden im `finally` vollständig entfernt

## Abgrenzung

- kein Anfrageformular oder Admin-Anfragenliste aus Phase 5
- keine Kalenderansichten aus Phase 4
- keine Raumgruppenauflösung aus Phase 6
- Ablehnung, Storno und weitere Workflows werden erst mit den zugehörigen Oberflächen-/Anfragephasen aktiviert
