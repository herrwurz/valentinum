# Use-Cases

## UC-001 Öffentlichen Kalender anzeigen

Akteur: PUBLIC

Ablauf:
1. Besucher öffnet Kalender.
2. System lädt öffentliche Kalenderdaten.
3. System zeigt öffentliche Veranstaltungen und belegte Ressourcen.
4. Keine personenbezogenen Daten werden übertragen.

Akzeptanz:
- Datenschutz eingehalten.
- Belegte Zeiten sichtbar.
- Öffentliche Veranstaltungen sichtbar.

## UC-002 Buchungsanfrage stellen

Akteur: PUBLIC oder USER

Ablauf:
1. Nutzer wählt Ressource.
2. Nutzer gibt Zeitraum und Kontaktdaten ein.
3. System validiert Pflichtfelder.
4. System prüft offensichtliche Konflikte.
5. System speichert Anfrage mit Status REQUESTED.
6. Verwaltung wird informiert.

Akzeptanz:
- Anfrage wird gespeichert.
- Status ist REQUESTED.
- Keine automatische Genehmigung.

## UC-003 Buchung genehmigen

Akteur: STAFF oder ADMIN

Ablauf:
1. Verwaltung öffnet Anfrage.
2. System prüft Berechtigung.
3. System prüft Konflikte erneut.
4. Bei Konflikt wird Genehmigung verhindert.
5. Ohne Konflikt wird Status APPROVED gesetzt.
6. Statushistorie und Audit werden geschrieben.

Akzeptanz:
- Keine Doppelbuchung möglich.
- Historie vorhanden.

## UC-004 Buchung ablehnen

Akteur: STAFF oder ADMIN

Ablauf:
1. Anfrage öffnen.
2. Ablehnungsgrund erfassen.
3. Status REJECTED setzen.
4. Historie und Audit schreiben.

## UC-005 Buchung stornieren

Akteur: USER, STAFF, ADMIN

Ablauf:
1. Buchung öffnen.
2. Storno auslösen.
3. System prüft Berechtigung.
4. Status CANCELLED setzen.
5. Zeitraum wird wieder frei.

## UC-006 Veranstaltung veröffentlichen

Akteur: STAFF oder ADMIN

Ablauf:
1. Buchung oder neues Event öffnen.
2. Veranstaltungsdaten pflegen.
3. Public Visible aktivieren.
4. Event erscheint im öffentlichen Kalender.

## UC-007 Kühlwagen übergeben

Akteur: STAFF oder ADMIN

Ablauf:
1. Genehmigte Kühlwagenbuchung öffnen.
2. Übergabeprotokoll ausfüllen.
3. Zustand, Zubehör, Notizen speichern.
4. Audit schreiben.

## UC-008 Kühlwagen zurücknehmen

Akteur: STAFF oder ADMIN

Ablauf:
1. Buchung öffnen.
2. Rückgabeprotokoll ausfüllen.
3. Reinigung und Schäden dokumentieren.
4. Buchung optional auf COMPLETED setzen.

## UC-009 Blackout Period anlegen

Akteur: STAFF oder ADMIN

Ablauf:
1. Ressource auswählen.
2. Zeitraum und Grund erfassen.
3. System verhindert Überschneidung mit genehmigten Buchungen oder warnt.
4. Sperrzeit blockiert künftige Genehmigungen.
