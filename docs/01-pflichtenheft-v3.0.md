# Pflichtenheft v3.0

## 1. Einleitung

Die Anwendung „Valentinum & Kühlwagen Buchungsplattform“ ist eine eigenständige Webanwendung zur digitalen Verwaltung von Ressourcen, Buchungen und Veranstaltungen der Stadtgemeinde bzw. des Veranstaltungszentrums Valentinum.

Sie ersetzt keine bestehende Hallenverwaltung und darf technisch nicht von dieser abhängen.

## 2. Zielsetzung

Die Plattform soll folgende Verwaltungsbereiche abdecken:

- Kühlwagen-Verleih
- Raumverwaltung Valentinum
- Veranstaltungsverwaltung
- Öffentlicher Veranstaltungskalender
- Öffentliche Frei-/Belegt-Anzeige
- Interne Bearbeitung von Anfragen
- Buchungsfreigabe durch berechtigte Personen
- Protokolle für Übergabe und Rückgabe
- Export und Dokumentenerstellung
- Auditierbare Nachvollziehbarkeit aller relevanten Aktionen

## 3. Muss-Ziele

- Buchungsanfragen digital erfassen
- Doppelbuchungen verhindern
- Räume und mobile Ressourcen einheitlich verwalten
- Öffentliche Kalender datenschutzkonform anzeigen
- Admin-Kalender mit vollständigen Details bereitstellen
- Rollen- und Rechtekonzept umsetzen
- Statushistorie je Buchung speichern
- Sperrzeiten und Wartungen berücksichtigen
- Raumkombinationen des Valentinums korrekt abbilden
- Kühlwagen-Übergabe und Rückgabe dokumentieren
- Basis für PDF-/Excel-/CSV-Exporte schaffen
- Tests für zentrale Buchungslogik bereitstellen

## 4. Soll-Ziele

- E-Mail-Benachrichtigungen
- Buchungsbestätigungen als PDF
- Übergabeprotokolle als PDF
- Rückgabeprotokolle als PDF
- Gebühren, Kaution und Zusatzkosten verwalten
- Veranstaltungsbilder und Ticketlinks pflegen
- Interne Notizen und öffentliche Beschreibungen trennen
- Mehrere Ressourcen pro Buchung unterstützen

## 5. Kann-Ziele

- Online-Zahlung
- Ticketing
- QR-Code-Check-in
- Sitzplatzverwaltung
- Mehrere Standorte
- Erweiterung auf weitere Gemeinderessourcen
- Schnittstelle zu externen Veranstaltungskalendern

## 6. Nicht-Ziele für Version 1.0

- Keine direkte Integration der bestehenden Hallenverwaltung
- Kein verpflichtender Online-Zahlungsprozess
- Kein vollständiges Ticketing
- Keine native Mobile-App
- Keine automatische Buchhaltungsschnittstelle
- Keine automatische Rechnungserstellung ohne fachliche Preisfreigabe

## 7. Benutzergruppen

- Öffentliche Besucher
- Vereine
- Firmen
- Privatpersonen
- Mitarbeiter Valentinum
- Gemeindemitarbeiter
- Administratoren

## 8. Hauptmodule

1. Authentifizierung und Rollen
2. Ressourcenverwaltung
3. Buchungsverwaltung
4. Kalender
5. Valentinum-Raumverwaltung
6. Veranstaltungsverwaltung
7. Kühlwagen-Verleihprozess
8. Dokumente und Export
9. Benachrichtigungen
10. Audit und Historie
11. Systemeinstellungen

## 9. Datenschutz

Öffentliche Ansichten dürfen niemals folgende Daten anzeigen:

- Namen von Antragstellern
- Telefonnummern
- E-Mail-Adressen
- interne Notizen
- Kautionen
- Gebühren
- Schäden
- Protokolle
- Bearbeiter
- interne Statuskommentare

Öffentlich erlaubt sind:

- Frei / belegt
- öffentliche Veranstaltungstitel
- Veranstaltungsbeschreibung
- Kategorie
- Zeitraum
- Ort
- Veranstalter, sofern zur Veröffentlichung freigegeben
- Ticketlink, sofern zur Veröffentlichung freigegeben

## 10. Qualitätsanforderungen

- TypeScript Strict Mode
- Serverseitige Validierung
- Rollenprüfung auf Serverebene
- Audit-Logging
- Unit-Tests für Buchungslogik
- Integrationstests für zentrale Services
- E2E-Smoke-Tests
- Build muss jederzeit reproduzierbar sein
- Keine bewusst bekannten Fehler vor Phasenabschluss
