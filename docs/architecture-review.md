# Architektur- und Anforderungsreview

Stand: 25.06.2026 (aktualisiert nach Stabilisierungspaket)  
Grundlage: vollständige Dokumentation `docs/00-codex-start.md` bis `15-definition-of-done.md`

## Kurzstand Juni 2026

Phasen 1–6 sind abgeschlossen und dokumentiert. Phase 7 (Veranstaltungen) ist im Code umgesetzt. Das Stabilisierungspaket vom 25.06.2026 ergänzt Storno, Abschluss (`COMPLETED`) und den Event-Buchungs-Trenn-Fix. Offen bleiben Phasen 8–10 sowie Betriebs-NFRs.

### Bereits umgesetzt (ehemals kritisch im Erstreview)

| Punkt | Umsetzung |
|---|---|
| Atomare Genehmigung / Parallelität | `FOR UPDATE` in `approveAtomically`, transaktional |
| Public DTOs / Datenschutz | Kalender anonymisiert, Event-Feldfreigaben |
| Zeitzonen | `Europe/Vienna`, UTC-Speicherung, DST-Tests |
| Blackout vs. Buchung | Ablehnung bei Überschneidung mit genehmigter Buchung |
| Repository-Grenze | Prisma nur in Repositories |
| Puffer beider Seiten | `effectiveInterval` für Kandidat und bestehende Buchung |
| Veröffentlichungsfreigaben Events | `publishOrganizer`, `publishTicketLink` |
| Storno / Abschluss | `cancelBooking`, `completeBooking`, Audit, Historie |
| Event-Buchung trennen | `bookingId: null` beim Update |

### Weiterhin offen (geplant oder Spezifikation)

| Punkt | Zielphase / Aktion |
|---|---|
| Kühlwagen-Felder, Protokolle, Gebühren | Phase 8 |
| PDF/CSV/Excel | Phase 9 |
| Rate Limits, E2E, Audit-UI, Betrieb | Phase 10 |
| Organisationen / Ownership öffentlicher Anfragen | Fachentscheid |
| Stornofristen konfigurierbar | Systemeinstellungen (später) |
| Puffer bei Blackouts | Fachentscheid |
| `ARCHIVED`-Workflow | Phase 8/10 |
| `DRAFT` / `OPTION` UI | optional, nicht Muss v1.0 |

---

Stand Erstreview: 20.06.2026  
Grundlage Erstreview: vollständige Dokumentation `C:\Projekte\valentinum\docs\00-codex-start.md` bis `15-definition-of-done.md`

## 1. Ergebnis

Die Zielarchitektur ist für die geplante Anwendung grundsätzlich geeignet: eine eigenständige Next.js-Anwendung mit klarer Trennung zwischen UI, Application Services, Datenzugriff und PostgreSQL. Die Phasenfolge ist sinnvoll und verhindert, dass fachlich riskante Funktionen ohne tragfähige Basis entstehen.

Vor späteren Fachphasen müssen jedoch mehrere Regeln präzisiert werden. Besonders kritisch sind die noch nicht atomar definierte Konfliktprüfung, unvollständige Statusübergänge, fehlende Eigentumsregeln für Buchungen und Lücken zwischen fachlichem Datenmodell und Prisma-Entwurf. Diese Punkte blockieren Phase 1 nicht, dürfen aber spätestens vor der jeweils betroffenen Phase nicht durch freie Annahmen ersetzt werden.

Die bestehende Hallenverwaltungssoftware bleibt vollständig außerhalb des Projekts. Der aktuelle Workspace enthält außer `.git` noch keine Anwendung und ist damit als eigenständige Projektbasis geeignet.

## 2. Architektur-Review

### Stärken

- Die Schichten `UI -> Actions/API -> Services -> Repositories -> Prisma` geben eine klare Verantwortungsgrenze vor.
- Fachlogik und serverseitige Rechteprüfung sind ausdrücklich außerhalb der React-Komponenten vorgesehen.
- Rollenabhängige Kalender-DTOs und die Whitelist für öffentliche Daten bilden eine gute Datenschutzbasis.
- PostgreSQL und Prisma passen zu relationalen Buchungen, N:M-Ressourcenzuordnung und transaktionalen Statuswechseln.
- Unit-, Integrations- und E2E-Tests sind passend nach Risiko aufgeteilt.
- Die inkrementelle Phasenplanung verschiebt Konfliktlogik, Kalender, Anfragen und Spezialprozesse bewusst in getrennte Schritte.

### Architekturentscheidungen, die vor späteren Phasen festzuschreiben sind

1. **Atomare Genehmigung:** Konfliktprüfung, Statuswechsel, Statushistorie und Audit müssen in einer Transaktion erfolgen. Zusätzlich ist ein Schutz gegen zwei gleichzeitig genehmigte, überlappende Buchungen nötig. Eine reine Vorabprüfung im Service verhindert Race Conditions nicht.
2. **Repository-Grenze:** `03-architecture.md` verlangt Repositories, `00-codex-start.md` erlaubt Datenzugriff in „Repositories oder Services“. Für Konsistenz und testbare Services sollte Prisma ausschließlich hinter Repositories liegen.
3. **Fehlervertrag:** Die Fehlerklassen sind benannt, aber HTTP-/Action-Mapping, stabile Fehlercodes und die sichere Darstellung interner Fehler fehlen.
4. **Zeitmodell:** UTC-Speicherung und `Europe/Vienna`-Anzeige sind nur empfohlen. Verbindlich festzulegen sind Zeitzone, Sommerzeitverhalten, Genauigkeit und Intervallgrenzen.
5. **Sicherheitsmodell:** Auth.js ist gesetzt, aber Loginverfahren, Sessionstrategie, Passwort-/Providerregeln, Account-Aktivierung und Schutz öffentlicher Formulare fehlen.
6. **Betriebsarchitektur:** Upload-/Dokumentenspeicher, Mail-Queue bzw. Retry-Verhalten, Monitoring, Logaufbewahrung und Restore-Ziele sind nicht spezifiziert.

## 3. Fachliche Lücken und Inkonsistenzen

### Hohe Priorität

- **Statusmodell unvollständig:** `OPTION` ist ein gültiger Status und kann genehmigt werden, aber es gibt keinen definierten Übergang nach `OPTION`. `REQUESTED -> OPTION`, `DRAFT -> CANCELLED` und mögliche Korrekturpfade sind nicht geregelt.
- **Eigentum einer Buchung:** Ein `USER` darf eigene Buchungen sehen und stornieren. Der Entwurf kennt nur optional `createdById`; bei öffentlichen Anfragen ist nicht definiert, ob und wie eine spätere Zuordnung zu einem Benutzer erfolgt. Organisationseigentum und Vertretungsrechte sind ebenfalls offen.
- **Konflikte unter Parallelität:** Es fehlt eine verbindliche Transaktions-/Sperrstrategie. Ohne sie können zwei zeitgleiche Freigaben beide eine konfliktfreie Vorprüfung bestehen.
- **Pufferberechnung:** Die Verwendung von `max(bufferBefore)` und `max(bufferAfter)` über mehrere Ressourcen ist beschrieben, aber nicht, wie Puffer der bestehenden Buchung gegenüber dem Kandidaten wirken. Auch Puffer bei Blackouts und unterschiedliche Puffer je gemeinsamer Ressource sind offen.
- **Blackout-Erstellung widersprüchlich:** UC-009 verlangt „verhindert ... oder warnt“. Das ist keine eindeutige Regel. Business Rules erklären Blackouts als immer blockierend, aber nicht, ob sie über bereits genehmigte Buchungen gelegt werden dürfen.
- **Kühlwagen-Pflichtdaten fehlen im Entwurf:** Abhol-/Rückgabezeit und -ort sind fachlich verpflichtend, existieren aber nicht als eindeutige Felder. Das Verhältnis zu `Booking.startAt/endAt` ist ungeklärt.
- **Datenmodell nicht vollständig umgesetzt:** Im fachlichen Modell genannte Entitäten `OrganizationMember`, `DamageReport`, `Document` und `NotificationLog` fehlen im Prisma-Entwurf. `updatedById` fehlt ebenfalls. Umgekehrt ist die Event-Kategorie im fachlichen Modell als Entität, im Entwurf als Enum modelliert.
- **Veröffentlichungsfreigaben:** Veranstalter und Ticketlink dürfen nur nach Freigabe öffentlich sein. Der Entwurf besitzt dafür nur ein globales `publicVisible`, keine feldbezogenen Freigaben.

### Mittlere Priorität

- Raumgruppen werden bei Buchung auf Ressourcen aufgelöst, aber die ursprünglich gewählte Kombination wird nicht gespeichert. Das erschwert Nachvollziehbarkeit, Preisbildung und spätere Änderungen der Gruppenzusammensetzung.
- Es ist nicht definiert, ob deaktivierte Ressourcen bestehende Buchungen behalten, noch auswählbar sind oder genehmigt werden dürfen.
- Events können ohne Buchung existieren; Ort, Ressourcenbezug und Konfliktwirkung eines solchen Events sind nicht festgelegt. Ebenso fehlt eine Regel bei abweichenden Event- und Buchungszeiten.
- `COMPLETED` „blockiert nicht für Zukunft“ ist plausibel, sollte aber als zeitbezogene Aussage präzisiert werden: Historische Intervalle dürfen nicht rückwirkend wieder verfügbar erscheinen, falls Auswertungen einen Stichtag betrachten.
- Stornofristen werden „später“ konfiguriert, aber Default, Zeitzone, Ausnahmebefugnis und Verhalten ohne Einstellung fehlen.
- Gebühren/Kautionen benötigen Währung, Typ, Fälligkeit, Zahlungs-/Rückzahlungsstatus, Steuerbehandlung und Rundungsregeln. `amountCents` allein reicht für die Soll-Ziele nicht.
- Übergabe- und Rückgabeprotokolle brauchen Regeln für Änderbarkeit, Versionierung, Unterschriften und die Trennung strukturierter Schäden vom Freitext.
- Öffentliche Kalender-IDs können Korrelation ermöglichen. Es fehlt die Entscheidung, ob interne IDs, stabile Public IDs oder nur synthetische Kalenderereignisse ausgegeben werden.
- Lösch-, Aufbewahrungs- und Auskunftsregeln für personenbezogene Daten, Auditdaten, Dokumente und Benachrichtigungsprotokolle fehlen.

### Nichtfunktionale Anforderungen

Nicht oder nicht messbar festgelegt sind:

- unterstützte Browser, Responsive-Verhalten und Barrierefreiheit,
- Performanceziele und erwartete Datenmengen,
- Verfügbarkeit, RPO/RTO und getestete Restore-Frequenz,
- Rate Limits, Bot-/Spam-Schutz und CSRF-Schutz für öffentliche Anfragen,
- Observability, Alarmierung und Umgang mit personenbezogenen Daten in Logs,
- Idempotenz von Actions, Mailversand und Dokumenterzeugung,
- Abnahmekriterien für PDF/CSV/Excel-Format und Zeichencodierung.

## 4. Verbesserungsvorschläge

1. Vor Phase 3 einen verbindlichen Entscheidungsdatensatz für Statusautomat, Zeit-/Puffersemantik und atomare Konfliktprüfung ergänzen.
2. Vor Phase 5 ein Ownership-Modell für Benutzer, öffentliche Anfragen und Organisationen sowie Anti-Abuse- und Einwilligungsregeln festlegen.
3. Vor Phase 7 Public DTOs als explizite Whitelist-Schemas definieren und Feldfreigaben für Veranstalter/Ticketlink modellieren.
4. Vor Phase 8 den Kühlwagenprozess als Zustandsablauf mit strukturierten Pflichtfeldern, Gebühren- und Schadensmodell spezifizieren.
5. Den Prisma-Entwurf erst in den jeweiligen Phasen erweitern; fehlende spätere Entitäten nicht in Phase 1 vorziehen.
6. Datenbankmigrationen, Seed und Builds versionsfest und reproduzierbar machen; Seed muss idempotent sein und exakt die vier initialen Ressourcen erzeugen bzw. aktualisieren.
7. Sicherheits- und Betriebskonzept mit Auth-Verfahren, Secret-Handling, Backups, Restore-Test, Monitoring und Datenaufbewahrung ergänzen.
8. Für jede Phase eine kleine Traceability-Tabelle `Anforderung -> Implementierung -> Test` führen.

## 5. Konsequenzen für Phase 1

Phase 1 kann ohne fachliche Vorwegnahmen umgesetzt werden. Ihr Umfang bleibt strikt auf Projektbasis, Grundlayout, Prisma/PostgreSQL und den Seed der vier initialen Ressourcen begrenzt.

- `/` und `/admin` werden als erreichbare Grundseiten erstellt, ohne Verwaltungsfunktionen späterer Phasen.
- Das initiale Prisma-Schema enthält nur die für den Seed notwendige Ressourcenbasis. Spätere Buchungs-, Rollen-, Event- und Protokollfunktionen werden nicht vorgezogen.
- Ressourcen-Gruppen werden noch nicht angelegt; sie gehören fachlich zu Phase 6.
- Authentifizierung und Admin-Rechte werden noch nicht implementiert; die Phase verlangt nur die Erreichbarkeit der Route. Die Seite enthält keine geschützte Funktion.
- Die lokale Datenbankkonfiguration wird dokumentiert, aber keine bestehende Hallenverwaltungssoftware oder deren Datenbank eingebunden.

## 6. Offene fachliche Entscheidungen für spätere Phasen

Die folgenden Punkte benötigen vor ihrer jeweiligen Umsetzung eine fachliche Festlegung: vollständiger Statusautomat, OPTION-Blockierungsdefault, Blackout-Verhalten bei bestehenden Freigaben, Ownership/Organisationen, Puffersemantik, Kühlwagen-Zeitfelder, Veröffentlichungsfreigaben, Stornoregeln sowie Gebühren- und Aufbewahrungsmodell.
