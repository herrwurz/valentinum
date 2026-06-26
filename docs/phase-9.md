# Phase 9 – Dokumente & Export

Stand: 25.06.2026

## Umgesetzt

- PDF-Erzeugung über `pdf-lib` (reines JavaScript, kein nativer Build) mit einem wiederverwendbaren Renderer `src/lib/documents/pdf.ts`
- Buchungsbestätigung als PDF (Buchungsnummer, Antragsteller, Ressourcen, Zeitraum, Status, Hinweise)
- Übergabeprotokoll als PDF (Buchung, Übergabezeit, Abholort, Zustand, Zubehör, Kaution, Notizen, Unterschriftsfelder)
- Rückgabeprotokoll als PDF (Rückgabezeit, Rückgabeort, Reinigung, Zustand, Schäden, Zusatzkosten, Unterschriftsfelder)
- CSV-Export der Buchungen (`src/lib/exports/csv.ts`) mit Semikolon-Trennung und UTF-8-BOM für Excel
- `DocumentService` mit serverseitiger Rollenprüfung (STAFF/ADMIN) und gekapseltem Datenzugriff (`DocumentRepository`)
- Node-Route-Handler für Downloads:
  - `GET /api/documents/booking/[id]`
  - `GET /api/documents/handover/[id]`
  - `GET /api/documents/return/[id]`
  - `GET /api/exports/bookings?from=&to=&status=`
- Download-Buttons in `/admin/kuehlwagen` und neue Exportseite `/admin/export` inklusive Navigationslink
- Unit-Test des CSV-Builders und Smoke-Test `scripts/phase-9-smoke.ts` (PDF-Bytes und CSV-Inhalt)

## Berechtigungen und Datenschutz

Sämtliche Dokument- und Exportendpunkte prüfen den angemeldeten Benutzer serverseitig über `getCurrentActor` und `requireStaffOrAdmin`. Kautionen, Gebühren, Schäden und Protokolldaten verlassen damit nie den geschützten Bereich. Die Endpunkte erzeugen ausschließlich lesende Ableitungen bestehender Daten und schreiben nicht in die Datenbank.

## Fachliche Entscheidung

Der Export nutzt CSV mit Semikolon und BOM, da dieses Format in Österreich direkt in Excel geöffnet werden kann. Eine native `.xlsx`-Datei wurde bewusst nicht umgesetzt, um keine zusätzliche schwergewichtige Abhängigkeit einzuführen; das Pflichtenheft fordert die „Basis für PDF-/Excel-/CSV-Exporte“, die mit CSV erfüllt ist. Die Spalte „Organisation“ ist enthalten, bleibt jedoch leer, da das Organisationsmodell in Version 1 noch nicht umgesetzt ist.

## Abgrenzung

- keine automatischen E-Mail-Versände oder -Erinnerungen (Modul Benachrichtigungen)
- keine native Excel-Datei (CSV deckt den Bedarf ab)
- keine Rechnungs- oder Zahlungslogik (Nicht-Ziel v1.0)

## Abhängigkeit

`pdf-lib` wurde zu den Abhängigkeiten ergänzt. Vor dem Start ist einmalig `npm install` erforderlich.

## Prüfungen

```powershell
npm install
npm run lint
npm run test
npm run test:phase9
npm run build
```
