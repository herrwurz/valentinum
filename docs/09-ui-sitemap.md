# UI Sitemap

## Public

```text
/
├── /kalender
├── /veranstaltungen
├── /veranstaltungen/[id]
├── /anfrage
└── /login
```

## User

```text
/mein-bereich
├── /mein-bereich/buchungen
├── /mein-bereich/buchungen/[id]
└── /mein-bereich/profil
```

## Staff/Admin

```text
/admin
├── /admin/dashboard
├── /admin/kalender
├── /admin/buchungen
├── /admin/buchungen/[id]
├── /admin/anfragen
├── /admin/veranstaltungen
├── /admin/veranstaltungen/[id]
├── /admin/ressourcen
├── /admin/ressourcen/[id]
├── /admin/sperrzeiten
├── /admin/kuehlwagen
├── /admin/export
├── /admin/einstellungen
└── /admin/audit
```

## Dashboard-Kacheln

- Offene Anfragen
- Heute belegte Ressourcen
- Nächste Veranstaltungen
- Kühlwagen aktuell verliehen
- Offene Rückgaben
- Konfliktwarnungen

## Kalenderfarben

- REQUESTED: Anfrage
- OPTION: Option
- APPROVED: bestätigt
- CANCELLED: storniert
- BLACKOUT: Sperre
- PUBLIC_EVENT: öffentliche Veranstaltung

Konkrete Farben werden im UI definiert.
