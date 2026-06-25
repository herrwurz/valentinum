# Business Rules

## 1. Ressourcenarten

```text
ROOM
VEHICLE
EQUIPMENT
```

## 2. Initiale Ressourcen

### Räume

- Großer Saal
- Foyer
- Lounge

### Fahrzeuge

- Kühlwagen

## 3. Buchungsstatus

```text
DRAFT
REQUESTED
OPTION
APPROVED
REJECTED
CANCELLED
COMPLETED
ARCHIVED
```

## 4. Blockierungslogik

| Status | Blockiert Zeitraum |
|---|---|
| DRAFT | Nein |
| REQUESTED | Nein |
| OPTION | Konfigurierbar |
| APPROVED | Ja |
| REJECTED | Nein |
| CANCELLED | Nein |
| COMPLETED | Historisch, blockiert nicht für Zukunft |
| ARCHIVED | Nein |

## 5. Konfliktregeln

Eine Buchung darf genehmigt werden, wenn:

- Startzeit vor Endzeit liegt
- alle betroffenen Ressourcen verfügbar sind
- keine bestätigte Buchung überschneidet
- keine Blackout Period überschneidet
- Pufferzeiten eingehalten werden
- Benutzer die nötige Berechtigung hat

## 6. Überschneidungsregel

Zwei Zeiträume überschneiden sich, wenn:

```text
existing.start < candidate.end
AND
existing.end > candidate.start
```

## 7. Pufferzeiten

Pufferzeiten werden ressourcenabhängig konfiguriert.

Beispiele:

- Kühlwagen: 60 Minuten Reinigung/Übergabe nach Rückgabe
- Großer Saal: 180 Minuten Aufbau/Abbau je nach Veranstaltung
- Foyer: 60 Minuten
- Lounge: 30 Minuten

## 8. Blackout Periods

Blackout Periods blockieren immer.

Beispiele:

- Wartung
- Reinigung
- Umbau
- Renovierung
- technische Sperre
- Gemeindesperre
- interne Veranstaltung

## 9. Raumkombinationen Valentinum

Unterstützte logische Varianten:

- Lounge
- Foyer
- Großer Saal
- Lounge + Foyer
- Foyer + Großer Saal
- Gesamtes Valentinum

Eine Buchung mit Raumkombination blockiert alle enthaltenen Räume.

## 10. Veranstaltungen

Eine Veranstaltung kann öffentlich oder intern sein.

Öffentliche Veranstaltung:

- erscheint im öffentlichen Veranstaltungskalender
- zeigt Titel, Beschreibung, Kategorie, Uhrzeit, Ort, Veranstalter, Ticketlink

Interne Buchung:

- erscheint öffentlich nur als „belegt“
- zeigt keine Details

## 11. Kühlwagen

Für Kühlwagen-Buchungen gelten zusätzlich:

- Abholzeit erforderlich
- Rückgabezeit erforderlich
- Abholort erforderlich oder Systemstandard
- Rückgabeort erforderlich oder Systemstandard
- Übergabeprotokoll bei Übergabe
- Rückgabeprotokoll bei Rückgabe
- Schäden müssen dokumentiert werden
- Kaution und Mietgebühr sind konfigurierbar

## 12. Storno

Storno ist erlaubt, wenn:

- Benutzer Admin/Staff ist, oder
- Benutzer eigene Buchung storniert und Stornoregeln erfüllt

Stornofristen werden später in Systemeinstellungen gepflegt.

## 13. Audit

Auditpflichtig:

- Ressource erstellt/geändert/deaktiviert
- Buchung erstellt/geändert/genehmigt/abgelehnt/storniert
- Veranstaltung veröffentlicht/depubliziert
- Protokoll erstellt/geändert
- Systemeinstellung geändert
