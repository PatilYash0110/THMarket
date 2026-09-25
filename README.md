# THMarket

Geschlossener Marktplatz für Studierende und Angehörige der THM.

Inserate für Studienmaterialien, Möbel und Elektronik, handelbar ausschließlich innerhalb der Hochschule — abgesichert über E-Mail-Verifizierung mit THM-Adresse, mit Echtzeit-Chat zwischen Käufer und Verkäufer und simulierter Zahlung über ein internes Guthabenkonto.

## Projektkontext

THMarket ist das Projekt einer fünfköpfigen Gruppe im Modul **WK_1106 — Wirtschaftsinformatik-Projekt I (Softwaretechnik)** im [B.Sc. Wirtschaftsinformatik](https://www.thm.de/site/studium/unsere-studienangebote/wirtschaftsinformatik-bachelor-bsc-mnd-friedberg.html) an der Technischen Hochschule Mittelhessen (THM), Sommersemester 2026, betreut von Prof. Dr. Carsten Lucke.

Spezifikation und Architektur sind Teil der Abgabe und liegen in [`docs/`](docs/) — Einstieg über [`docs/README.md`](docs/README.md). Team und Rollen stehen in [`TEAMINFO.md`](TEAMINFO.md).

## Konzept

```
Inserat anlegen  -->  KI-Textvorschlag  -->  Suche/Detail  -->  Chat  -->  Kauf
(Bild-Upload)         (Gemini, optional)     (Filter)         (Socket.io)   (Guthaben)
```

Verkaufen, finden, verhandeln und abschließen bleibt innerhalb eines verifizierten Nutzerkreises. Es gibt keine offene Registrierung und keine echte Zahlungsabwicklung.

## Funktionen

- **Registrierung mit E-Mail-Verifizierung** — Zugang nur nach Bestätigung per Verifizierungslink
- **Inserate** — anlegen, bearbeiten, durchsuchen, filtern, als verkauft markieren
- **Bild-Upload** mit MIME-Sniffing und Komprimierung, Ablage über Cloudinary
- **KI-Textvorschlag** für Titel und Beschreibung (Gemini) — ausschließlich Textfelder, keine Preisschätzung
- **Favoriten** — Inserate merken und wiederfinden
- **Echtzeit-Chat** über Socket.io, an ein Inserat gebunden; Konversationen sind privat und für Admins nicht einsehbar
- **Simulierter Kauf** über ein internes Guthabenkonto (Aufladen, Auszahlen, Checkout) — kein echter Zahlungsdienstleister
- **Meldesystem** für Inserate und Nutzerkonten
- **Administration** — Nutzerkonten und Meldungen bearbeiten, Aktionen werden protokolliert
- **Härtung** — JWT in partitioniertem Cookie, bcrypt-Hashing, Helmet, Rate Limiting

## Rollen

| Rolle | Rechte |
|-------|--------|
| **STUDENT** | Inserate anlegen und verwalten, suchen, favorisieren, chatten, kaufen, melden |
| **ADMIN** | Nutzerkonten sperren und verwalten, Meldungen bearbeiten, Inserate moderieren — kein Zugriff auf private Konversationen |

Der erste Admin wird beim Seeding aus `ADMIN_EMAIL` / `ADMIN_PASSWORD` angelegt.

## Zustände

Inserat:

```
AKTIV  -->  VERKAUFT
```

Meldung (`LISTING` oder `USER`):

```
OFFEN  -->  GESCHLOSSEN
```

## Tech Stack

| Komponente | Technologie | Version |
|------------|-------------|---------|
| Backend | NestJS | 11 |
| Sprache (Backend) | TypeScript | 5.7 |
| ORM | Prisma | 6.19 |
| Datenbank | PostgreSQL | |
| Frontend | React | 19.2 |
| Routing | React Router | 7.18 |
| Build | Vite | 8.2 |
| UI | Tailwind CSS | 4.3 |
| Echtzeit | Socket.io | 4.8 |
| Auth | JWT + Passport, bcrypt | |
| Bildspeicher | Cloudinary | |
| Mailversand | Nodemailer (Gmail SMTP) | |
| KI-Textvorschlag | Google GenAI (Gemini) | |
| Tests | Jest + Supertest | |
| Laufzeit | Node.js | 20.19.0 |

Deployment-Ziel laut ADR-010: Frontend auf Vercel, Backend auf Render, Datenbank auf Neon.

## Voraussetzungen

- Node.js 20.19.0 (`.nvmrc` vorhanden — `nvm use`)
- Erreichbare PostgreSQL-Datenbank
- Cloudinary-Account (Cloud Name, API Key, API Secret)
- Gmail-Adresse mit App-Passwort für den Mailversand
- Gemini API Key

## Setup

```bash
git clone https://github.com/PatilYash0110/THMarket.git
cd THMarket
nvm use
```

Backend:

```bash
cd backend
cp .env.example .env
# .env ausfuellen: DATABASE_URL, JWT_SECRET, GMAIL_USER, GMAIL_APP_PASSWORD,
# CLOUDINARY_*, GEMINI_API_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

Frontend, in einem zweiten Terminal:

```bash
cd frontend
cp .env.example .env     # VITE_API_URL=http://localhost:3000
npm install
npm run dev
```

Anwendung: <http://localhost:5173> · API: <http://localhost:3000>

`npx prisma db seed` legt den Admin-Zugang aus den `ADMIN_*`-Variablen an und schlägt fehl, wenn diese nicht gesetzt sind.

## Entwicklung

```bash
# Backend
npm run start:dev        # Watch-Modus
npm run test             # Unit-Tests
npm run test:e2e         # End-to-End-Tests
npm run lint             # ESLint mit --fix
npx prisma migrate dev   # neue Migration erzeugen
npx prisma studio        # Datenbank im Browser inspizieren

# Frontend
npm run dev              # Vite Dev Server mit HMR
npm run build            # Produktions-Build
npm run lint             # oxlint
```

## Projektstruktur

```
THMarket/
  docs/
    spec/                 # Spezifikation nach Siedersleben (P, F, D, B, S, N)
    arch/                 # Architektur nach arc42 (a01-a12) inkl. ADRs
  backend/
    prisma/
      schema.prisma       # Datenmodell
      migrations/         # Versionierte Schemaaenderungen
      seed.ts             # Initialer Admin-Zugang
    src/
      auth/               # Registrierung, Login, JWT, E-Mail-Verifizierung
      listings/           # Inserate, Suche, Bild-Upload
      chat/               # Konversationen und Nachrichten (Socket.io)
      admin/              # Nutzer- und Meldungsverwaltung, Audit-Log
      payments/           # Simulierter Kaufabschluss
      wallet/             # Guthabenkonto, Aufladen, Auszahlen
      cloudinary/         # Adapter Bildspeicher
      gemini/             # Adapter KI-Textvorschlag
      mail/               # Adapter Mailversand
      prisma/             # Datenbankzugriff
      common/             # Guards, Filter, Interceptors
  frontend/
    src/
      pages/              # Seiten (Home, ListingDetail, Messages, Admin, ...)
      components/         # Wiederverwendbare Bausteine
      context/            # Auth- und App-State
      api/                # HTTP-Client zum Backend
      types/              # Gemeinsame TypeScript-Typen
  TEAMINFO.md
```

## Dokumentation

| Dokument | Inhalt |
|----------|--------|
| [`docs/README.md`](docs/README.md) | Einstieg, Aufteilung Spezifikation / Architektur |
| [`docs/spec/README.md`](docs/spec/README.md) | Bausteinindex der Spezifikation |
| [`docs/arch/README.md`](docs/arch/README.md) | Kapitelindex der Architektur |
| [`docs/arch/a09-entwurfsentscheidungen.md`](docs/arch/a09-entwurfsentscheidungen.md) | Architekturentscheidungen (ADR-001 bis ADR-010) |

## Lizenz

Studienprojekt im Rahmen des Moduls WK_1106 an der THM. Keine Lizenz zur Weiterverwendung; alle Rechte liegen bei den Autoren.
