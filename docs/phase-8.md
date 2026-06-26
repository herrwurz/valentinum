# Phase 8 – Kühlwagen-Prozess

Stand: 25.06.2026

## Umgesetzt

- Datenmodell für den Verleihprozess: `VehicleHandoverProtocol`, `VehicleReturnProtocol`, `DamageReport`, `Fee` sowie die Enums `FeeType` und `DamageSeverity`
- Relationen zu `Booking` (1:1 Übergabe, 1:1 Rückgabe, 1:n Gebühren) und `User` (erfassende Person)
- Freischaltung der Kühlwagen-Buchung: die bisherige Sperre für `VEHICLE`-Anfragen aus Phase 5 ist entfernt; der Kühlwagen ist im Anfrageformular als buchbare Ressource auswählbar
- `VehicleProtocolService` mit serverseitiger Rollenprüfung (STAFF/ADMIN) und Geschäftsregeln
- `VehicleProtocolRepository` mit atomarer, auditierter Speicherung von Übergabe und Rückgabe
- Übergabeprotokoll mit Abholort, Übergabezeit, Kilometerstand, Tankfüllung, Zustand, Zubehör, Kaution und Notizen
- Rückgabeprotokoll mit Rückgabeort, Rückgabezeit, Kilometerstand, Tankfüllung, Reinigungsstatus, Zustand, Schäden und Gebühren
- Kaution bei Übergabe wird automatisch als `Fee` vom Typ `DEPOSIT` verbucht
- Admin-/Staff-Oberfläche `/admin/kuehlwagen` zur Erfassung und Übersicht der Protokolle inklusive Gebührensumme
- Smoke-Test `scripts/phase-8-smoke.ts` und Unit-Test der reinen Regeln (`vehicle-protocol-rules.test.ts`)

## Geschäftsregeln

- Ein Übergabeprotokoll ist nur für eine genehmigte Buchung (`APPROVED`) mit Kühlwagen möglich.
- Pro Buchung ist genau ein Übergabe- und ein Rückgabeprotokoll zulässig.
- Eine Rückgabe setzt ein vorhandenes Übergabeprotokoll voraus.
- Die Rückgabe darf zeitlich nicht vor der Übergabe liegen.
- Schäden und Gebühren werden mit der Rückgabe dokumentiert; Kaution und Mietgebühr sind frei konfigurierbar.
- Alle Schreibvorgänge werden transaktional gespeichert und auditiert.

## Fachliche Entscheidung

Die zwingenden Abhol- und Rückgabeorte (Business Rule 11) werden im jeweiligen Protokoll erfasst, nicht als zusätzliche Felder der Buchung. Die Abhol- bzw. Rückgabezeit entspricht dem Buchungszeitraum (`startAt`/`endAt`). Damit bleibt die Buchungsstruktur unverändert und der reale Übergabe-/Rückgabezeitpunkt wird zusätzlich im Protokoll dokumentiert.

## Datenschutz

Kautionen, Gebühren, Schäden und Protokolldaten erscheinen ausschließlich in den durch `requireStaffOrAdmin` geschützten Ansichten. Öffentliche und Benutzer-DTOs bleiben unverändert und enthalten keine dieser Daten.

## Abgrenzung

- keine PDF-Erzeugung von Übergabe-/Rückgabeprotokollen (Phase 9)
- keine CSV-/Excel-Exporte (Phase 9)
- keine automatischen E-Mail-Erinnerungen für Abholung/Rückgabe (spätere Phase)
- keine automatische Statusänderung der Buchung bei Rückgabe (Abschluss erfolgt wie bisher über den Admin-Kalender)

## Migration

Das Datenmodell wurde erweitert. Vor dem Start ist eine Migration erforderlich:

```powershell
npm run db:migrate -- --name phase-8-kuehlwagen-prozess
```

## Prüfungen

```powershell
npm run lint
npm run test
npm run test:phase8
npm run build
```
