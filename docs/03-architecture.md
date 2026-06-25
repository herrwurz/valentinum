# Architektur

## 1. Zielarchitektur

```text
Browser
  ↓
Next.js App Router
  ↓
Server Actions / API Routes
  ↓
Application Services
  ↓
Repositories
  ↓
Prisma ORM
  ↓
PostgreSQL
```

## 2. Technologiestack

- Next.js App Router
- TypeScript
- PostgreSQL
- Prisma
- Auth.js
- Tailwind CSS
- shadcn/ui
- FullCalendar
- Zod
- Vitest
- Playwright

## 3. Schichten

### UI Layer

- Seiten
- Formulare
- Kalenderkomponenten
- Tabellen
- Dialoge

Keine Geschäftslogik.

### Application Service Layer

- BookingService
- ResourceService
- EventService
- CalendarService
- DocumentService
- NotificationService
- AuditService
- PermissionService

Hier liegt die Fachlogik.

### Repository Layer

Kapselt Datenzugriff.

### Database Layer

PostgreSQL über Prisma.

## 4. Verzeichnisstruktur

```text
src/
├── app/
├── components/
├── features/
│   ├── bookings/
│   ├── resources/
│   ├── events/
│   ├── calendar/
│   ├── vehicles/
│   └── admin/
├── lib/
│   ├── auth/
│   ├── prisma/
│   ├── validation/
│   └── permissions/
├── server/
│   ├── services/
│   ├── repositories/
│   └── actions/
└── tests/
```

## 5. Architekturregeln

- Keine Prisma-Aufrufe in React-Komponenten.
- Keine Geschäftslogik in UI-Komponenten.
- Alle Schreiboperationen prüfen Rechte serverseitig.
- Alle Eingaben serverseitig validieren.
- Kalenderdaten getrennt für PUBLIC, USER, STAFF, ADMIN erzeugen.
- Public DTOs dürfen keine personenbezogenen Felder enthalten.

## 6. Fehlerbehandlung

Fehlerklassen:

- ValidationError
- PermissionError
- ConflictError
- NotFoundError
- BusinessRuleError

Konflikte müssen fachlich verständliche Meldungen liefern.
