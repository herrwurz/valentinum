# Phase 4 – Kalender

Stand: 20.06.2026

## Umgesetzt

- FullCalendar mit Monats-, Wochen- und Listenansicht
- öffentliche Route `/kalender`
- Admin-/Staff-Route `/admin/kalender` mit Detailanzeige
- Benutzerroute `/mein-bereich/kalender` für eigene Buchungen
- drei getrennte Serverendpunkte und DTO-Typen für PUBLIC, ADMIN/STAFF und USER
- `CalendarService` als alleinige fachliche Transformationsschicht
- `CalendarRepository` als gekapselte Prisma-Zugriffsschicht
- öffentliche Darstellung genehmigter und – abhängig von `OPTION_BLOCKS` – optionaler Buchungen als „Belegt“
- öffentliche Darstellung von Blackout Periods als „Belegt“
- Ausschluss nicht öffentlich sichtbarer Ressourcen aus dem Public Calendar
- HMAC-basierte öffentliche Ereignis-IDs statt interner Datenbank-IDs
- UTC-Datenübertragung und Anzeige in `Europe/Vienna`
- Zeitraumvalidierung mit maximal 370 Tagen pro Abfrage

Öffentliche DTOs enthalten ausschließlich synthetische ID, „Belegt“, Zeitraum und veröffentlichbare Ressourcennamen. Buchungstitel, Antragsteller, Kontaktinformationen, interne Notizen, Blackout-Titel/-Grund, Status und interne IDs werden nicht übertragen.

## Tests

- vollständige Serialisierung öffentlicher DTOs auf personenbezogene und interne Werte geprüft
- interne Buchungs- und Blackout-IDs im Public DTO ausgeschlossen
- nicht öffentliche Ressourcen unterdrückt
- Admin DTO enthält vollständige Buchungs- und Sperrzeitdetails
- User DTO wird nach `createdById` gefiltert und ist USER-Konten vorbehalten
- ungültige, umgekehrte und übergroße Kalenderzeiträume abgelehnt
- PostgreSQL-Smoke-Test für Public-Anonymisierung, Admin-Details und User-Filter
- Smoke-Testdaten werden im `finally` vollständig entfernt

## Abgrenzung

- öffentliche Veranstaltungstitel und Ticketlinks folgen erst mit dem Event-Modul in Phase 7
- Anfrageformular und Admin-Anfragenliste folgen erst in Phase 5
- Raumgruppenauflösung folgt erst in Phase 6
- keine Drag-and-drop-Mutationen im Kalender
