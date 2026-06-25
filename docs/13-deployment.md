# Deployment

## 1. Zielumgebungen

### Lokal

- VS Code
- Node.js LTS
- PostgreSQL lokal oder Docker
- Prisma

### Testserver

- Hetzner
- Coolify
- PostgreSQL
- Branch: develop

### Produktion

- Gemeindeserver oder separater Server
- Branch: main

## 2. Branching

```text
feature/*
  ↓
develop
  ↓
main
```

## 3. Environment Variables

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
MAIL_FROM=
```

## 4. Deployment-Regeln

- develop deployt auf Testsystem
- main deployt auf Produktion
- Keine Direktentwicklung auf main
- Migrationen vor Deployment prüfen
- Seed nicht automatisch in Produktion überschreiben

## 5. Backup

- PostgreSQL Backup täglich
- Dokumente/Uploads sichern
- Restore-Prozess testen
