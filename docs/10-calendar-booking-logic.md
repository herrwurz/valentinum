# Kalender- und Buchungslogik

## 1. Zeiträume

Alle Zeiträume werden serverseitig als DateTime gespeichert.

Empfehlung:
- Intern UTC speichern.
- UI in Europe/Vienna anzeigen.

## 2. Konfliktalgorithmus

Eingaben:
- resourceIds
- startAt
- endAt
- status
- bufferBefore
- bufferAfter
- ignoreBookingId optional

Schritte:
1. Zeitraum validieren.
2. Effektiven Zeitraum berechnen:
   - effectiveStart = startAt - max(bufferBefore)
   - effectiveEnd = endAt + max(bufferAfter)
3. Bestätigte Buchungen der Ressourcen laden.
4. OPTION-Buchungen laden, wenn optionBlocks=true.
5. Blackout Periods laden.
6. Überschneidungen prüfen.
7. Konflikte strukturiert zurückgeben.

## 3. Überschneidung

```text
existing.startAt < candidate.endAt
AND
existing.endAt > candidate.startAt
```

## 4. Raumkombinationen

Wenn eine ResourceGroup gebucht wird:

1. Gruppe auf ResourceIds auflösen.
2. Alle enthaltenen Ressourcen buchen.
3. Konfliktprüfung über alle Ressourcen.

## 5. Public Calendar

Public Calendar erzeugt anonymisierte Events.

Beispiel intern:

```json
{
  "title": "Hochzeit Müller",
  "requesterEmail": "x@y.at"
}
```

Public:

```json
{
  "title": "Belegt",
  "start": "...",
  "end": "..."
}
```

Öffentliche Veranstaltung:

```json
{
  "title": "Kabarettabend",
  "category": "KABARETT",
  "start": "...",
  "end": "...",
  "ticketUrl": "..."
}
```

## 6. Statuswechsel

Erlaubte Übergänge:

```text
DRAFT -> REQUESTED
REQUESTED -> APPROVED
REQUESTED -> REJECTED
REQUESTED -> CANCELLED
OPTION -> APPROVED
OPTION -> CANCELLED
APPROVED -> CANCELLED
APPROVED -> COMPLETED
COMPLETED -> ARCHIVED
```

Alle anderen Übergänge sind zu verhindern.
