# Phase 5 – Buchungsanfragen

Stand: 22.06.2026

## Umgesetzt

- öffentliches Anfrageformular `/anfrage`
- Mehrfachauswahl aktiver, öffentlich sichtbarer Räume und Ausstattung
- serverseitige Zod-Validierung von Zeitraum, Kontakt, Ressourcen und Textfeldern
- verbindliche Interpretation lokaler Eingaben als `Europe/Vienna`
- Verhinderung von Anfragen in der Vergangenheit
- atomare Speicherung mit Status `REQUESTED`, Ressourcenrelationen, initialer Statushistorie und Audit-Eintrag
- Zuordnung zu einem angemeldeten Benutzer; öffentliche Anfragen bleiben ohne `createdById`
- Honeypot gegen einfache Formularbots
- Admin-/Staff-Liste `/admin/anfragen` mit vollständigen Kontaktdaten
- konfliktgesicherte Genehmigung über den bestehenden Phase-3-Workflow
- Ablehnung mit verpflichtendem Grund, Statushistorie und Audit
- Kühlwagen wird bis Phase 8 nicht als öffentliche Anfrageoption angeboten

## Fachliche Abgrenzung

REQUESTED-Buchungen blockieren laut Business Rules nicht. Eine zeitgleiche Anfrage neben einer genehmigten Buchung darf deshalb gespeichert werden; die erneute Konfliktprüfung bei Genehmigung verhindert anschließend die Doppelbuchung.

Kühlwagen-Buchungen verlangen zwingend getrennte Abhol-/Rückgabezeiten und -orte. Diese Felder gehören zum spezialisierten Prozess in Phase 8 und werden nicht vorgezogen. Bis dahin verhindert der Service auch bei manipulierten Requests serverseitig die Auswahl einer `VEHICLE`-Ressource.

## Prüfungen

- Validierung von Zeitraum, E-Mail und Ressourcenauswahl
- Europe/Vienna-zu-UTC-Konvertierung
- PostgreSQL-Smoke-Test einer öffentlichen Anfrage
- Status `REQUESTED`, öffentliche Eigentümerlosigkeit, Initialhistorie und Audit geprüft
- Anfrage in der Admin-Liste nachgewiesen
- Genehmigungs- und Ablehnungsweg geprüft
- Kühlwagen-Ausschluss serverseitig geprüft
- Smoke-Testdaten werden im `finally` vollständig entfernt

## Abgrenzung

- keine Raumgruppen aus Phase 6
- keine Events aus Phase 7
- keine Kühlwagen-Protokolle oder Gebühren aus Phase 8
- keine E-Mail-Benachrichtigungen oder Dokumente späterer Phasen
