# Rollen- und Rechtekonzept

## Rollen

| Rolle | Beschreibung |
|---|---|
| ADMIN | Vollzugriff |
| STAFF | Mitarbeiter Valentinum / Verwaltung |
| USER | Verein, Firma, Privatperson |
| PUBLIC | nicht angemeldeter Besucher |

## Rechte-Matrix

| Funktion | PUBLIC | USER | STAFF | ADMIN |
|---|---:|---:|---:|---:|
| Öffentlichen Kalender sehen | Ja | Ja | Ja | Ja |
| Öffentliche Veranstaltungen sehen | Ja | Ja | Ja | Ja |
| Buchungsanfrage erstellen | Ja | Ja | Ja | Ja |
| Eigene Buchungen sehen | Nein | Ja | Ja | Ja |
| Alle Buchungen sehen | Nein | Nein | Ja | Ja |
| Buchung genehmigen | Nein | Nein | Ja | Ja |
| Buchung ablehnen | Nein | Nein | Ja | Ja |
| Buchung stornieren | Nein | Eigene | Ja | Ja |
| Ressourcen verwalten | Nein | Nein | Nein | Ja |
| Blackout Periods verwalten | Nein | Nein | Ja | Ja |
| Veranstaltungen veröffentlichen | Nein | Nein | Ja | Ja |
| Systemeinstellungen ändern | Nein | Nein | Nein | Ja |
| Audit Log sehen | Nein | Nein | Nein | Ja |
| Exporte erstellen | Nein | Nein | Ja | Ja |

## Sicherheitsregeln

- UI-Rechte sind nur Komfort.
- Server prüft immer erneut.
- Admin darf alles.
- Staff darf operative Verwaltung.
- User darf nur eigene Daten.
- Public bekommt ausschließlich anonymisierte Daten.
