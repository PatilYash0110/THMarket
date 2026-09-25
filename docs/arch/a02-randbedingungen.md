# 2. Randbedingungen

Dieses Kapitel beschreibt die technischen und organisatorischen Randbedingungen, die bei Entwicklung und Betrieb von THMarket berücksichtigt werden.

## 2.1 Technische Randbedingungen

THMarket ist eine reine Webanwendung und wird ausschließlich über einen Browser genutzt. Eine App ist nicht vorgesehen. Die Architektur folgt dem Client-Server-Prinzip mit einer Trennung von Frontend, Backend, Datenhaltung und externen Diensten.

**Technologie-Stack**

| Bereich | Technologie / Deployment |
|---|---|
| Frontend | React 19, Vite, TypeScript, React Router; Deployment: Vercel |
| Backend | NestJS 11 (Node.js, TypeScript); Deployment: Render |
| Datenbank | PostgreSQL auf Neon |
| ORM | Prisma 6 |
| Echtzeit-Kommunikation | Socket.io v4 |
| Bildspeicherung | Cloudinary (Node-SDK v2) |
| KI-Beschreibung/-Moderation | Google Gemini (`@google/genai`) |
| E-Mail-Versand | Gmail SMTP |

*Technologie-Stack von THMarket*

**Frontend**

Das Frontend stellt die Benutzeroberfläche im Browser bereit. Es verarbeitet Nutzereingaben, führt clientseitige Validierungen durch und kommuniziert mit dem Backend über REST sowie über Socket.io für den Echtzeit-Chat. Die Oberfläche ist responsiv, deutschsprachig und konsistent gestaltet.

**Backend**

Das NestJS-Backend enthält die Geschäftslogik und bildet die zentrale Schnittstelle zwischen Frontend, Datenbank und externen Diensten. Zu seinen Aufgaben gehören Registrierung, Login und E-Mail-Verifizierung, Verwaltung von Nutzern und Rollen (`STUDENT`, `ADMIN`), Inserate inkl. Bild-Upload und KI-Beschreibung, Favoriten, Kauf- und Guthabenfunktionen, Meldungen und Moderation, Echtzeit-Chat sowie die Anbindung von Cloudinary, Google Gemini und Gmail SMTP. Externe Dienste werden ausschließlich serverseitig angesprochen.

**Datenbank & Bildspeicherung**

Für die persistente Datenhaltung wird PostgreSQL (Neon) über Prisma verwendet. Gespeichert werden Benutzer- und Rollendaten, Verifizierungsstatus, Inserate (inkl. der Cloudinary-Bild-URLs als String-Array direkt am Inserat), Favoriten, Konversationen und Nachrichten, Meldungen sowie Audit-Log-Einträge. Die Bilddateien selbst liegen nicht in der Datenbank, sondern bei Cloudinary, dort wird die Liste der URLs abgelegt. Fotos werden vor dem Upload clientseitig komprimiert und zusätzlich serverseitig über Gemini auf unangemessene Inhalte geprüft.

**KI-Integration & Echtzeit-Chat**

Google Gemini erzeugt auf Wunsch einen Beschreibungsvorschlag und prüft jedes Foto auf unangemessene Inhalte. Eine automatische Preis-, Titel- oder Kategorieempfehlung ist nicht vorgesehen. Bei Ausfall von Gemini bleibt die manuelle Erstellung uneingeschränkt möglich. Der Echtzeit-Chat wird mit Socket.io umgesetzt. Nachrichten werden zwischen den beteiligten Nutzern in Echtzeit übertragen und zusätzlich persistent gespeichert. Chat-Inhalte sind für Administratoren nicht generell einsehbar — nur bei einer Nutzer-Meldung mit Chat-Kontext kann ein Admin die betroffene Konversation lesend einsehen.

**Sicherheit**

- Passwörter werden ausschließlich als bcrypt-Hash gespeichert (mind. 8 Zeichen, Klein-/Großbuchstabe und Ziffer erzwungen).
- Nur erfolgreich verifizierte `@thm.de`-Adressen erhalten Zugang.
- API-Schlüssel und vertrauliche Zugangsdaten liegen ausschließlich serverseitig als Umgebungsvariablen und erscheinen nie im Client.
- Eingaben werden sowohl client- als auch serverseitig validiert.
- Missbrauchsanfällige Endpunkte (mailversendende Auth-Routen, KI-Beschreibung, Meldungserstellung) sind per Rate-Limiting gedrosselt.
- Ein per Passwortänderung gesetzter Zeitstempel (`passwordChangedAt`) entwertet zuvor ausgestellte Sitzungstoken.

## 2.2 Organisatorische Randbedingungen

- THMarket wird im Rahmen der Veranstaltung „Projekt 1 – Softwaretechnik" als Einzelprojekt entwickelt.
- Versionsverwaltung erfolgt über GitHub. Änderungen werden direkt auf `main` committet bzw. über Pull Requests zusammengeführt.
- Frontend und Backend laufen auf kostenlosen Hosting-Tarifen (Vercel, Render, Neon), für die KI wird der kostenlose Gemini-Tarif verwendet.
- Eine echte Zahlungsabwicklung über einen externen Zahlungsanbieter ist nicht vorgesehen; die Zahlung wird ausschließlich simuliert.

**Datenschutz**

- Chat-Inhalte sind privat und für Administratoren ohne Meldungskontext nicht einsehbar.
- Es werden nur für die Anwendung notwendige Daten gespeichert.
- API-Schlüssel und Passwort-Hashes dürfen nicht öffentlich zugänglich sein, `.env`-Dateien sind git-ignoriert.
- Für die Anwendung ist ein Impressum vorgesehen.
