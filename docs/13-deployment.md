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
- Testdomain: https://valentinum.hofreither.at

## 1.1 Coolify-Testumgebung

Die Testumgebung wird als eigenständige Coolify-App auf dem Hetzner-Server betrieben und deployt ausschließlich den Branch `develop`.

Empfohlene Grundkonfiguration:

- Repository: GitHub-Repository `herrwurz/valentinum`
- Branch: `develop`
- Build command: über `Dockerfile` oder alternativ `npm run build`
- Start command: `node server.js` im Standalone-Container oder alternativ `npm run start`
- Dockerfile: im Repository enthalten, auf Next.js Standalone optimiert
- Node.js: 22 LTS
- Healthcheck: auf die Next.js-App-Wurzel oder `/login`
- Domain: `valentinum.hofreither.at`
- SSL: in Coolify aktivieren

Benötigte Umgebungsvariablen in der Testumgebung:

```env
DATABASE_URL=postgresql://<user>:<password>@<coolify-postgres-host>:5432/<database>?schema=public
AUTH_SECRET=<long-random-secret>
AUTH_URL=https://valentinum.hofreither.at
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
MAIL_FROM=
OPTION_BLOCKS=true
```

Hinweise:

- `DATABASE_URL` wird von der in Coolify angelegten PostgreSQL-Instanz bereitgestellt.
- `AUTH_URL` muss in der Testumgebung auf die Testdomain zeigen.
- Die Testumgebung verwendet ihren eigenen Secret-Wert und ist unabhängig von der Produktion.
- Migrationen werden vor dem Umschalten auf die Testdomain mit `prisma migrate deploy` geprüft.
- Seeds werden in der Testumgebung nur bewusst und kontrolliert ausgeführt.

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

## 2.1 GitHub-Arbeitsfluss

- `develop` ist der Standard-Entwicklungs- und Test-Branch.
- Direktes Arbeiten auf `main` bleibt gesperrt.
- Pull Requests laufen normalerweise von `develop` nach `main`.
- Coolify deployt die Testumgebung von `develop` auf `valentinum.hofreither.at`.
- Produktion wird erst nach Freigabe und Merge von `develop` nach `main` aktualisiert.

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
