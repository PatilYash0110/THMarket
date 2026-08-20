# 2. Randbedingungen

Dieses Kapitel beschreibt die technischen und organisatorischen Randbedingungen, die bei Entwicklung und Betrieb von THMarket berücksichtigt werden.

## 2.1 Technische Randbedingungen

THMarket ist eine reine Webanwendung und wird ausschließlich über einen Browser genutzt. Eine native App und ein Offline-Betrieb sind nicht vorgesehen.

Als Entwicklungsumgebung wird Visual Studio Code eingesetzt.

Die Architektur folgt dem Client-Server-Prinzip mit einer Trennung von Frontend, Backend, Datenhaltung und externen Diensten.

### Technologie-Stack

* **Frontend:** React, Vite und TypeScript
* **Backend:** NestJS auf Basis von Node.js und TypeScript
* **Datenbank:** PostgreSQL auf Neon
* **ORM:** Prisma
* **Echtzeit-Kommunikation:** Socket.io
* **Bildspeicherung:** Cloudinary
* **KI-Beschreibung:** Google Gemini API
* **E-Mail-Verifizierung:** SMTP über Gmail

### Frontend

Das Frontend stellt die Benutzeroberfläche im Browser bereit. Es verarbeitet Nutzereingaben, führt clientseitige Validierungen durch und kommuniziert mit dem Backend über REST sowie über Socket.io für den Echtzeit-Chat.

Die Oberfläche soll responsiv, deutschsprachig und konsistent gestaltet sein.

### Backend

Das NestJS-Backend enthält die Geschäftslogik der Anwendung und bildet die zentrale Schnittstelle zwischen Frontend, Datenbank und externen Diensten.

Zu seinen Aufgaben gehören insbesondere:

* Registrierung und Login,
* E-Mail-Verifizierung,
* Verwaltung von Nutzern und Rollen,
* Verwaltung von Inseraten,
* Favoriten,
* Kauf- und Bewertungsfunktionen,
* Meldungen und Moderation,
* Echtzeit-Chat,
* Kommunikation mit Cloudinary,
* Kommunikation mit Google Gemini,
* Zugriff auf PostgreSQL über Prisma.

Externe Dienste werden ausschließlich serverseitig angesprochen.

### Datenbank

Für die persistente Datenhaltung wird PostgreSQL verwendet. Die Datenbank wird über Neon bereitgestellt und über Prisma angesprochen.

Gespeichert werden unter anderem:

* Benutzer- und Rollendaten,
* Verifizierungsstatus,
* Inserate,
* Kategorien,
* Campus-Zuordnungen,
* Favoriten,
* Konversationen und Nachrichten,
* Kaufdaten der simulierten Zahlungsfunktion,
* Bewertungen,
* Meldungen und Moderationsinformationen,
* URLs der bei Cloudinary gespeicherten Bilder.

### Bildspeicherung

Inseratsbilder werden bei Cloudinary gespeichert.

Vor beziehungsweise während der Verarbeitung werden sensible EXIF-Metadaten aus Bildern entfernt. In der eigenen PostgreSQL-Datenbank werden die Bilddateien nicht direkt gespeichert; dort werden lediglich die von Cloudinary bereitgestellten URLs und die Zuordnung zum jeweiligen Inserat abgelegt.

### KI-Integration

Google Gemini wird zur KI-gestützten Unterstützung beim Erstellen eines Inserats eingesetzt.

Die KI darf Vorschläge für:

* Titel,
* Beschreibung,
* Kategorie

erzeugen.

Eine automatische Preisempfehlung ist ausdrücklich nicht vorgesehen.

Bei Ausfall von Gemini bleibt die manuelle Erstellung eines Inserats möglich.

### Echtzeit-Chat

Der Echtzeit-Chat wird mit Socket.io umgesetzt.

Nachrichten werden zwischen den beteiligten Nutzern in Echtzeit übertragen und zusätzlich persistent gespeichert.

Chat-Inhalte sind für Administratoren nicht einsehbar.

### Sicherheit

Für die Architektur gelten folgende Sicherheitsvorgaben:

* Passwörter werden ausschließlich als bcrypt-Hash gespeichert.
* Nur erfolgreich verifizierte THM-E-Mail-Adressen erhalten Zugang.
* API-Schlüssel und andere vertrauliche Zugangsdaten werden ausschließlich serverseitig gespeichert.
* API-Schlüssel dürfen niemals im Client erscheinen.
* Eingaben werden sowohl client- als auch serverseitig validiert.
* Sensible Endpunkte, insbesondere Authentifizierung, KI und Meldungen, werden durch Rate-Limiting geschützt.
* EXIF-Metadaten hochgeladener Bilder werden entfernt.

### Fehlerverhalten externer Dienste

Bei Ausfällen externer Dienste soll die Anwendung kontrolliert reagieren und definierte Fehlermeldungen anzeigen.

Insbesondere darf ein Ausfall von Gemini nicht verhindern, dass ein Inserat manuell erstellt werden kann.

### Leistungs- und UI-Vorgaben

* Such- und Chat-Antworten sollen innerhalb von höchstens zwei Sekunden erfolgen.
* Echtzeit-Nachrichten sollen ohne spürbare Verzögerung zugestellt werden.
* Die Benutzeroberfläche soll responsiv und konsistent sein.
* Die wichtigsten Abläufe sollen mit möglichst wenigen Schritten durchführbar sein.

## 2.2 Organisatorische Randbedingungen

THMarket wird im Rahmen der Veranstaltung Softwaretechnik entwickelt.

Für Entwicklung und Betrieb gelten folgende organisatorische Vorgaben:

* Versionsverwaltung erfolgt über GitHub.
* Es wird ein Feature-Branch-Workflow verwendet.
* Änderungen werden über Pull Requests zusammengeführt.
* Squash-Merges sollen für einen übersichtlichen Commit-Verlauf verwendet werden.
* Frontend und Backend sollen auf kostenlosen Hosting-Tarifen betrieben werden.
* Das Frontend wird auf Vercel bereitgestellt.
* Das Backend wird auf Render betrieben.
* PostgreSQL wird über Neon bereitgestellt.
* Für die KI wird der kostenlose Gemini-Tarif verwendet.
* Eine echte Zahlungsabwicklung über einen externen Zahlungsanbieter ist nicht vorgesehen; die Zahlung wird lediglich simuliert.

### Datenschutz

Für den Umgang mit personenbezogenen und technischen Daten gelten insbesondere folgende Vorgaben:

* Chat-Inhalte sind privat und für Administratoren nicht einsehbar.
* EXIF-Metadaten aus Bildern werden entfernt.
* Es werden nur für die Anwendung notwendige Daten gespeichert.
* API-Schlüssel und Passwörter dürfen nicht öffentlich zugänglich sein.
* Für die Anwendung sind ein Impressum und eine Datenschutzerklärung vorgesehen.
