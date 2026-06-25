# Teststrategie

## 1. Unit Tests

Pflicht für:

- checkBookingConflicts
- status transitions
- permission checks
- public DTO sanitizing
- resource group resolution
- blackout conflict checks

## 2. Integration Tests

Pflicht für:

- createBookingRequest
- approveBooking
- rejectBooking
- cancelBooking
- createEvent
- publishEvent
- createHandoverProtocol
- createReturnProtocol

## 3. E2E Smoke Tests

Mit Playwright:

- Startseite lädt
- Public Kalender lädt
- Anfrageformular lässt sich öffnen
- Admin Login möglich
- Admin Dashboard lädt
- Buchung kann durch Admin gesehen werden

## 4. Testfälle Buchungskonflikte

| Fall | Erwartung |
|---|---|
| Zwei REQUESTED parallel | erlaubt |
| APPROVED und REQUESTED parallel | Anfrage erlaubt, Genehmigung später blockiert |
| Zwei APPROVED überlappend | verboten |
| APPROVED angrenzend ohne Puffer | erlaubt |
| APPROVED angrenzend mit Pufferverletzung | verboten |
| Blackout überschneidet | verboten |
| CANCELLED überschneidet | erlaubt |
| Raumgruppe überschneidet Teilraum | verboten |

## 5. Definition Test bestanden

- `npm run lint` erfolgreich
- `npm run test` erfolgreich
- `npm run build` erfolgreich
