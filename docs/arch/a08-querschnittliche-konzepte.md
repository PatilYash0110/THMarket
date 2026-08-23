# 8. Querschnittliche Konzepte

## 8.1 Persistenz

- PostgreSQL (Neon) als persistente Datenbasis; Zugriff ausschließlich über Prisma (PrismaService).
- Schemaänderungen über Prisma-Migrationen.
- Passwörter mit bcrypt gehasht (kein Klartext).

## 8.2 Sicherheit & Datenschutz

- JWT-Authentifizierung; THM-Domain-Guard lässt nur @thm.de-Adressen zu.
- API-Keys (Gemini, Cloudinary, SMTP) liegen ausschließlich serverseitig.
- Chats sind privat; Admin-Zugriff nur auf gemeldete Konversationen mit Einwilligung.
- Hochgeladene Bilder werden von EXIF-Metadaten (u. a. GPS) bereinigt.
- Impressum, Datenschutzerklärung, Nutzungsbedingungen und Kontolöschung sind vorgesehen.
- ## 8.3 API

Das Backend stellt REST-Endpunkte bereit; der Chat läuft über WebSocket-Events. Antworten erfolgen als JSON; geschützte Endpunkte erfordern ein JWT.

| Methode | Pfad | Zweck | Eingabe → Rückgabe |
|---|---|---|---|
| POST | `/auth/register` | Registrierung | `{email, password}` → `{message}` |
| GET | `/auth/verify` | E-Mail-Verifizierung | `?token` → Bestätigung |
| POST | `/auth/login` | Anmeldung | `{email, password}` → `{accessToken}` |
| GET | `/listings` | Suchen / Filtern | `?q,&kategorie,&campus` → Liste |
| POST | `/listings` | Inserat anlegen | `{titel, beschreibung, preis, ...}` → Inserat |
| POST | `/listings/images` | Bild-Upload | `multipart` → Bild-URLs |
| POST | `/ai/describe` | KI-Entwurf | `{imageUrls}` → `{titel, beschreibung, kategorie}` |
| POST | `/favorites` | Favorit hinzufügen | `{listingId}` → `{success}` |
| POST | `/payments/checkout` | Mock-Kauf | `{listingId, methode}` → Kaufbestätigung |
| POST | `/reviews` | Bewertung abgeben | `{transactionId, rating, kommentar}` → `{success}` |
| POST | `/reports` | Meldung erstellen | `{targetId, grund, conversationId?}` → `{success}` |
| POST | `/admin/actions` | Admin-Maßnahme | `{reportId, typ}` → `{success}` + Audit-Log |

*Tabelle 20: Übersicht der API-Endpunkte*


