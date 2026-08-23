# 8. Querschnittliche Konzepte

## 8.1 Persistenz

### Ziel

Einheitliches Muster für Datenbankzugriffe (CRUD) und sichere Passwortspeicherung.

### Technische Umsetzung

- PostgreSQL als persistente Datenbasis; Zugriff über Prisma.
- Kern-Entitäten: Benutzer, Inserat, Bild, Kategorie, Favorit, Konversation, Nachricht, Meldung, Transaktion, Bewertung.
- Passwörter werden mit bcrypt/argon2 gehasht; niemals im Klartext gespeichert.
- Zugriff auf externe Dienste (Gemini, Cloudinary) wird nicht persistiert; nur resultierende Bild-URLs und Texte werden gespeichert.

### Datenmodell (vereinfacht)

| Entität | Wichtige Felder | Beziehung |
|---|---|---|
| Benutzer | id, email, username, password_hash, verifiziert, rolle, guthaben, erstellt_am | 1:n zu Inserat, Nachricht |
| Inserat | id, user_id, kategorie_id, titel, beschreibung, preis, typ, zustand, status, campus, erstellt_am | n:1 zu Benutzer; 1:n zu Bild |
| Bild | id, inserat_id, pfad, reihenfolge | n:1 zu Inserat |
| Kategorie | id, name | 1:n zu Inserat |
| Favorit | user_id, inserat_id, erstellt_am | n:m zwischen Benutzer und Inserat |
| Konversation | id, inserat_id, kaeufer_id, verkaeufer_id, erstellt_am | n:1 zu Inserat; 1:n zu Nachricht |
| Nachricht | id, konversation_id, sender_id, inhalt, gesendet_am, gelesen | n:1 zu Konversation, Benutzer |
| Meldung | id, inserat_id, gemeldeter_nutzer_id, konversation_id, melder_id, grund, status, erstellt_am | n:1 zu Inserat/Benutzer/Konversation |
| Transaktion | id, inserat_id, kaeufer_id, verkaeufer_id, zahlungsmodus, status, erstellt_am | n:1 zu Inserat, Benutzer (x2) |
| Bewertung | id, transaktion_id, bewertender_id, bewerteter_id, sterne, kommentar, erstellt_am | n:1 zu Transaktion, Benutzer (x2) |

*Tabelle 21: Kern-Datenmodell der THMarket-Anwendung*

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
| POST | /payments/checkout | Kauf abschließen |

*Tabelle 20: Übersicht der API-Endpunkte*


