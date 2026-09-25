# D2 Datentypenverzeichnis

### USER

| Feld | Typ | Pflicht/Nullable | Beschreibung |
|---|---|---|---|
| `id` | string | PK | Eindeutige Kennung für jeden Benutzer (Primärschlüssel) |
| `email` | string | UK, Pflicht | Nur `@thm.de` (inkl. Subdomains) (Eindeutiger Schlüssel) |
| `name` | string | Pflicht | Anzeigename |
| `passwordHash` | string | Pflicht | bcrypt-Hash, nie an das Frontend gesendet |
| `role` | enum (`STUDENT`, `ADMIN`) | Pflicht | Steuert die sichtbare Oberfläche |
| `verified` | boolean | Pflicht | Muss `true` sein, damit ein Login möglich ist |
| `emailVerificationToken` | string | UK, nullable | Nur während der Verifizierung gesetzt (Eindeutiger Schlüssel) |
| `emailVerificationExpires` | datetime | nullable | Ablaufzeitpunkt des Verifizierungslinks (24 Stunden nach Erstellung) |
| `emailVerificationSentAt` | datetime | nullable | Zeitpunkt des letzten Versands des Verifizierungslinks, für die 60-Sekunden-Sperre beim erneuten Anfordern |
| `passwordResetToken` | string | UK, nullable | Nur während eines aktiven Reset-Vorgangs gesetzt (Eindeutiger Schlüssel) |
| `passwordResetExpires` | datetime | nullable | Ablaufzeitpunkt des Reset-Links (1 Stunde nach Erstellung) |
| `passwordChangedAt` | datetime | nullable | Zeitpunkt der letzten Passwortänderung. Alle vorher ausgestellten Sitzungstoken (JWTs) werden dadurch serverseitig ungültig. |
| `balanceCents` | int | Pflicht | In-App-Guthaben in Cent |
| `warningMessage` | string | nullable | Admin-Verwarnung, sichtbar nur im eigenen Profil |
| `createdAt` / `updatedAt` | datetime | Pflicht | Zeitstempel |

### LISTING

| Feld | Typ | Pflicht/Nullable | Beschreibung |
|---|---|---|---|
| `id` | string | PK | Eindeutige Kennung des Inserats (Primärschlüssel) |
| `title` | string | Pflicht | Titel des Inserats |
| `description` | string | Pflicht | Beschreibungstext (manuell oder KI-generiert) |
| `priceCents` | int | Pflicht | Preis in Cent |
| `category` | enum (6 Werte) | Pflicht | Elektronik, Bücher & Skripte, Möbel, Fahrräder, Kleidung, Sonstiges |
| `images` | string[] | Pflicht (1–6) | Cloudinary-URLs |
| `sofortkaufMoeglich` | boolean | Pflicht | Steuert, ob „Kaufen" oder nur „Anbieter kontaktieren" angezeigt wird |
| `status` | enum (`AKTIV`, `VERKAUFT`) | Pflicht | Wird bei Kaufabschluss auf `VERKAUFT` gesetzt |
| `sellerId` | string (FK → USER) | nullable | Fremdschlüssel (FK) auf `USER.id`. Kennzeichnet den Verkäufer. Wird bei Konto-Löschung des Nutzers auf `NULL` gesetzt. |
| `buyerId` | string (FK → USER) | nullable | Fremdschlüssel (FK) auf `USER.id`; kennzeichnet den Käufer (wird erst bei Kaufabschluss gesetzt). Wird bei Konto-Löschung des Nutzers auf `NULL` gesetzt. |
| `createdAt` / `updatedAt` | datetime | Pflicht | Zeitstempel |

### FAVORITE

| Feld | Typ | Pflicht/Nullable | Beschreibung |
|---|---|---|---|
| `id` | string | PK | Eindeutige Kennung des Favoriten (Primärschlüssel) |
| `userId` | string (FK → USER) | Pflicht | Fremdschlüssel (FK) auf `USER.id`. Kennzeichnet den Nutzer, der den Favoriten gesetzt hat. Wird beim Löschen des Nutzers automatisch mitgelöscht. |
| `listingId` | string (FK → LISTING) | Pflicht | Fremdschlüssel (FK) auf `LISTING.id`. Kennzeichnet das favorisierte Inserat. Wird beim Löschen des Inserats automatisch mitgelöscht. |
| `createdAt` | datetime | Pflicht | Zeitpunkt der Favorisierung |

### REPORT

| Feld | Typ | Pflicht/Nullable | Beschreibung |
|---|---|---|---|
| `id` | string | PK | Eindeutige Kennung der Meldung (Primärschlüssel) |
| `targetType` | enum (`LISTING`, `USER`) | Pflicht | Typ des gemeldeten Ziels |
| `reason` | string | Pflicht | Ausgewählter Grund für die Meldung |
| `message` | string | optional | Zusätzliche Beschreibung |
| `status` | enum (`OFFEN`, `GESCHLOSSEN`) | Pflicht | Bearbeitungsstatus |
| `targetLabel` | string | Pflicht | Snapshot von Titel/Name, bleibt nach Löschung lesbar |
| `reporterId` | string (FK → USER) | nullable, SetNull | Fremdschlüssel (FK) auf `USER.id`. Kennzeichnet den meldenden Nutzer. Wird bei Konto-Löschung auf `NULL` gesetzt. |
| `listingId` | string (FK → LISTING) | nullable | Fremdschlüssel (FK) auf `LISTING.id`. Verweist auf das gemeldete Inserat bzw. den Inseratskontext. Wird bei Löschung des Inserats auf `NULL` gesetzt. |
| `reportedUserId` | string (FK → USER) | nullable, SetNull | Fremdschlüssel (FK) auf `USER.id`. Verweist auf den gemeldeten Nutzer. Wird bei Konto-Löschung auf `NULL` gesetzt. |
| `conversationId` | string (FK → CONVERSATION) | nullable | Fremdschlüssel (FK) auf `CONVERSATION.id`. Verweist auf den Chatverlauf (nur bei Meldungen aus dem Chat heraus). Wird bei Löschung des Chats auf `NULL` gesetzt. |
| `createdAt` | datetime | Pflicht | Zeitpunkt der Meldung |
| `resolvedAt` | datetime | nullable | Zeitpunkt der Bearbeitung |

### AUDITLOGENTRY

| Feld | Typ | Pflicht/Nullable | Beschreibung |
|---|---|---|---|
| `id` | string | PK | Eindeutige Kennung des Protokolleintrags (Primärschlüssel) |
| `actorId` | string (FK → USER) | nullable, SetNull | Fremdschlüssel (FK) auf `USER.id`. Kennzeichnet den ausführenden Admin. Wird bei Konto-Löschung des Admins auf `NULL` gesetzt. |
| `action` | string | Pflicht | Freitext-Beschreibung der Aktion |
| `targetType` | string | nullable | Betroffener Objekttyp. Kein Fremdschlüssel (rein informativ für Audit-Zwecke). |
| `targetId` | string | nullable | Kein Live-Fremdschlüssel, rein informativ |
| `createdAt` | datetime | Pflicht | Zeitpunkt der Aktion |

### CONVERSATION

| Feld | Typ | Pflicht/Nullable | Beschreibung |
|---|---|---|---|
| `id` | string | PK | Eindeutige Kennung der Konversation (Primärschlüssel) |
| `listingId` | string (FK → LISTING) | nullable, SetNull | Fremdschlüssel (FK) auf `LISTING.id`. Verweist auf das Bezugsinserat. Wird bei Löschung des Inserats auf `NULL` gesetzt. |
| `listingTitle` | string | nullable | Snapshot des Inserattitels |
| `buyerId` | string (FK → USER) | nullable, SetNull | Fremdschlüssel (FK) auf `USER.id`. Kennzeichnet den Kaufinteressenten. Wird bei Konto-Löschung des Käufers auf `NULL` gesetzt. |
| `sellerId` | string (FK → USER) | nullable, SetNull | Fremdschlüssel (FK) auf `USER.id`. Kennzeichnet den Anbieter/Verkäufer. Wird bei Konto-Löschung des Verkäufers auf `NULL` gesetzt. |
| `buyerLastReadAt` | datetime | nullable | Für Ungelesen-Zähler |
| `sellerLastReadAt` | datetime | nullable | Für Ungelesen-Zähler |
| `createdAt` | datetime | Pflicht | Zeitpunkt der Erstellung |

### MESSAGE

| Feld | Typ | Pflicht/Nullable | Beschreibung |
|---|---|---|---|
| `id` | string | PK | Eindeutige Kennung der Nachricht (Primärschlüssel) |
| `conversationId` | string (FK → CONVERSATION) | Pflicht | Fremdschlüssel (FK) auf `CONVERSATION.id`. Verweist auf die zugehörige Konversation. Wird beim Löschen der Konversation automatisch mitgelöscht. |
| `senderId` | string (FK → USER) | nullable, SetNull | Fremdschlüssel (FK) auf `USER.id`. Kennzeichnet den Absender der Nachricht. Wird bei Konto-Löschung des Absenders auf `NULL` gesetzt. |
| `text` | string | Pflicht | Nachrichtentext |
| `createdAt` | datetime | Pflicht | Zeitpunkt des Versands |
