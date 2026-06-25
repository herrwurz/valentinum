# Stabilisierungspaket

Stand: 25.06.2026

## Umgesetzt

- `cancelBooking` im `BookingService` mit serverseitiger Rechteprüfung
- STAFF/ADMIN: Storno von `REQUESTED`, `OPTION` und `APPROVED`
- USER: Storno eigener Buchungen bei `REQUESTED` oder bei `APPROVED`/`OPTION` mit Beginn in der Zukunft (Default bis Systemeinstellungen für Stornofristen)
- `completeBooking` für STAFF/ADMIN: `APPROVED` → `COMPLETED`
- transaktionale Statushistorie und Audit-Einträge für Storno und Abschluss
- Kalender-Aktionen im Admin- und Benutzerkalender (Detailpanel)
- Event-Update: Buchungsverknüpfung kann mit „Keine“ explizit getrennt werden (`bookingId: null`)
- `architecture-review.md` auf aktuellen Stand gebracht

## Fachliche Default-Regel Storno

Bis Systemeinstellungen existieren, gilt für `USER`:

- `REQUESTED`: jederzeit stornierbar
- `APPROVED` / `OPTION`: nur wenn `startAt` nach dem aktuellen Zeitpunkt liegt

## Prüfungen

- `npm run lint`
- `npm run test`
- `npm run build`

## Abgrenzung

- kein `ARCHIVED`-Workflow
- keine konfigurierbaren Stornofristen
- keine E-Mail-Benachrichtigungen bei Storno
