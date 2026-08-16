# 3. Kontextabgrenzung

Die Kontextabgrenzung beschreibt die Grenzen des Systems THMarket und seine Beziehungen zur Außenwelt.

Dabei wird zwischen zwei Sichtweisen unterschieden:

- Der **fachliche Kontext** zeigt, welche Personen und externen Systeme mit THMarket interagieren und welche Informationen ausgetauscht werden.
- Der **technische Kontext** zeigt, über welche technischen Kanäle und Protokolle diese Kommunikation erfolgt.

THMarket wird in diesem Kapitel als Blackbox betrachtet. Die internen Bausteine des Systems werden erst in den späteren Architekturkapiteln beschrieben.

## 3.1 Fachlicher Kontext

Im fachlichen Kontext wird THMarket als geschlossenes Marktplatzsystem für Studierende der Technischen Hochschule Mittelhessen betrachtet.

### Beteiligte Personen und Rollen

| Rolle | Beziehung zu THMarket |
|---|---|
| Gast beziehungsweise unverifizierter Nutzer | Kann die Registrierung und den Login aufrufen, hat aber keinen Zugriff auf den Marktplatz. |
| Verifizierter Nutzer | Kann Inserate erstellen, durchsuchen, favorisieren, andere Nutzer kontaktieren und eigene Inhalte verwalten. |
| Administrator | Verwaltet Nutzerkonten, Inserate, Meldungen und administrative Funktionen. |

<!-- TODO: Die Rollenbezeichnungen mit der Spezifikation vereinheitlichen. Dort wird teilweise zwischen „User“, „eingeloggtem Nutzer“ und „Admin“ unterschieden. -->

### Externe Nachbarsysteme

Nach aktuellem Architekturstand kommuniziert THMarket mit drei externen Diensten:

1. Google Gemini zur Generierung von Beschreibungsvorschlägen,
2. Cloudinary zur Speicherung und Auslieferung von Bildern,
3. einem E-Mail-/SMTP-Dienst zur Verifizierung von THM-E-Mail-Adressen.

Diese Dienste gehören nicht zu THMarket und werden deshalb als externe Nachbarsysteme betrachtet.

### NB-01 – Google Gemini

Google Gemini wird für die optionale KI-gestützte Beschreibungserstellung verwendet.

Der Nutzer kann ein Produktbild hochladen und die automatische Erstellung eines Beschreibungsvorschlags auslösen. THMarket übermittelt dazu ein Bild beziehungsweise eine Bildreferenz zusammen mit einer geeigneten Anweisung an Gemini.

Gemini liefert einen Beschreibungstext zurück. Dieser Text wird lediglich als Vorschlag im Inseratsformular angezeigt und kann vom Nutzer bearbeitet oder verworfen werden.

| Aspekt | Beschreibung |
|---|---|
| Zweck | Erstellung eines Beschreibungsvorschlags aus einem Produktbild |
| Eingabe | Produktbild beziehungsweise Bildreferenz und Prompt |
| Ausgabe | vorgeschlagener Beschreibungstext |
| Auslöser | Nutzer startet die KI-Beschreibung beim Erstellen eines Inserats |
| Fehlerverhalten | Manuelle Beschreibung bleibt bei Ausfall des Dienstes möglich |

<!-- TODO: Im Team klären, ob Gemini direkt die Bilddatei oder eine bereits bei Cloudinary gespeicherte Bild-URL erhält. -->
<!-- TODO: Prüfen, ob das konkrete Modell „Gemini 2.5 Flash“ bereits verbindlich festgelegt ist. -->

### NB-02 – Cloudinary

Cloudinary wird zur externen Speicherung und Auslieferung der Inseratsbilder verwendet.

Beim Hochladen eines Bildes übermittelt THMarket die Bilddatei an Cloudinary. Cloudinary speichert das Bild und liefert eine URL zurück. THMarket speichert anschließend nur diese URL und ihre Zuordnung zum jeweiligen Inserat in PostgreSQL.

| Aspekt | Beschreibung |
|---|---|
| Zweck | Speicherung und Auslieferung von Inseratsbildern |
| Eingabe | Bilddatei |
| Ausgabe | URL des gespeicherten Bildes |
| Auslöser | Nutzer lädt beim Erstellen oder Bearbeiten eines Inserats ein Bild hoch |
| Gespeicherte Information in THMarket | Bild-URL und Zuordnung zum Inserat |

### NB-03 – E-Mail-/SMTP-Dienst

Der E-Mail-/SMTP-Dienst wird für den Versand der Verifizierungs-E-Mails verwendet.

Nach der Registrierung erzeugt THMarket einen Verifizierungslink und lässt diesen an die angegebene THM-E-Mail-Adresse senden. Erst nach erfolgreicher Bestätigung kann das Konto vollständig genutzt werden.

| Aspekt | Beschreibung |
|---|---|
| Zweck | Versand von Verifizierungs-E-Mails |
| Eingabe | Empfängeradresse und Verifizierungslink |
| Ausgabe | E-Mail-Versand oder Rückmeldung eines Versandfehlers |
| Auslöser | Registrierung oder erneute Anforderung eines Verifizierungslinks |
| Fehlerverhalten | Konto bleibt unverifiziert; erneuter Versand soll möglich sein |

### Fachliche Kommunikationsbeziehungen

| Kommunikationspartner | Informationen beziehungsweise Interaktionen |
|---|---|
| Gast → THMarket | Registrierungsdaten, Login-Daten |
| Verifizierter Nutzer → THMarket | Inseratsdaten, Suchanfragen, Bilder, Favoriten, Meldungen und Chat-Nachrichten |
| THMarket → Nutzer | Inserate, Suchergebnisse, Profilinformationen, Chat-Nachrichten und Rückmeldungen |
| Administrator → THMarket | Verwaltungs- und Moderationsaktionen |
| THMarket ↔ Gemini | Produktbild beziehungsweise Bildreferenz und Beschreibungsvorschlag |
| THMarket ↔ Cloudinary | Bilddatei und Bild-URL |
| THMarket → SMTP-Dienst | Empfängeradresse und Verifizierungslink |

### Abgrenzung

Nicht Teil von THMarket sind:

- Google Gemini,
- Cloudinary,
- der externe E-Mail-/SMTP-Dienst,
- Zahlungsanbieter,
- Versand- oder Logistikdienste,
- die Browser und Endgeräte der Nutzer.

Zahlung, Übergabe und gegebenenfalls Versand werden außerhalb des Systems zwischen den Nutzern organisiert.

## 3.2 Technischer Kontext

Der technische Kontext beschreibt die technischen Kommunikationswege zwischen Browser, Backend, Datenbank und externen Diensten.

Das Frontend wird im Browser ausgeführt. Es kommuniziert mit dem Backend für normale Anwendungsfunktionen über eine HTTP-basierte API. Für den Echtzeit-Chat wird zusätzlich Socket.io eingesetzt.

Das Backend verarbeitet die Anfragen, greift auf PostgreSQL zu und kommuniziert serverseitig mit Gemini, Cloudinary und dem E-Mail-Dienst.

<!-- TODO: Nach der Teamentscheidung „Backend“ entweder durch „NestJS-Backend“ oder „FastAPI-Backend“ ersetzen. Die Architekturvorlage nennt NestJS, die bisherige Spezifikation FastAPI. -->

### Technische Kommunikationswege

| Fachliche Schnittstelle | Technischer Kanal |
|---|---|
| Nutzerinteraktion und CRUD-Funktionen | HTTPS und REST mit GET, POST, PATCH und DELETE |
| Echtzeit-Chat | Socket.io über eine bidirektionale Echtzeitverbindung |
| KI-Beschreibung | serverseitiger HTTPS-/REST-Aufruf an Google Gemini |
| Bild-Upload und Bildspeicherung | serverseitiger HTTPS-Upload zu Cloudinary |
| E-Mail-Verifizierung | SMTP zum E-Mail-Dienst |
| Persistente Datenhaltung | SQL-Verbindung zur PostgreSQL-Datenbank |

### Browser und Frontend

Der Nutzer greift über einen Browser auf die React-Anwendung zu.

Das Frontend ist insbesondere verantwortlich für:

- Darstellung der Benutzeroberfläche,
- Entgegennahme von Nutzereingaben,
- clientseitige Validierung,
- Senden von Anfragen an das Backend,
- Darstellung von Antworten und Fehlermeldungen,
- Aufbau der Socket.io-Verbindung für den Chat.

Der Browser kommuniziert nicht direkt mit Gemini, Cloudinary oder der PostgreSQL-Datenbank. Externe Aufrufe werden über das Backend geführt, damit Zugangsdaten nicht an den Client übertragen werden.

### Kommunikation zwischen Frontend und Backend

Für normale Funktionen wird eine REST-API verwendet.

Dazu zählen insbesondere:

- Registrierung und Login,
- Abrufen und Bearbeiten von Profildaten,
- Erstellen, Abrufen, Filtern, Ändern und Löschen von Inseraten,
- Favoriten,
- Meldungen,
- administrative Funktionen.

Die Daten werden grundsätzlich in einem strukturierten Format wie JSON übertragen.

<!-- TODO: Im Team bestätigen, ob HTTPS bereits für alle Umgebungen verbindlich verlangt wird oder nur für die spätere bereitgestellte Anwendung. -->
<!-- TODO: Die konkreten REST-Endpunkte werden in einem späteren Architekturkapitel beschrieben und müssen zur tatsächlichen Implementierung passen. -->

### Echtzeit-Chat

Der Chat wird über Socket.io umgesetzt.

Zwischen Frontend und Backend wird eine bidirektionale Verbindung aufgebaut. Dadurch kann das Backend neue Nachrichten direkt an die beteiligten Nutzer übertragen, ohne dass der Browser ständig neue REST-Anfragen senden muss.

Nachrichten werden zusätzlich in PostgreSQL gespeichert, damit der Verlauf nach einem Verbindungsabbruch oder einem späteren Login erneut geladen werden kann.

<!-- TODO: Im Team klären, ob JWT verbindlich beim Socket.io-Handshake eingesetzt wird. -->
<!-- TODO: Konkrete Socket.io-Ereignisse wie `join_conversation` und `send_message` erst nach Abstimmung mit der tatsächlichen Implementierung endgültig festlegen. -->

### Verbindung zur PostgreSQL-Datenbank

Das Backend greift über eine SQL-Verbindung auf PostgreSQL zu.

Dort werden nach aktuellem Stand insbesondere gespeichert:

- Benutzer- und Rollendaten,
- Verifizierungsstatus,
- Inserate,
- Kategorien,
- Cloudinary-Bild-URLs,
- Favoriten,
- Konversationen,
- Chat-Nachrichten,
- Meldungen.

Das Frontend erhält keinen direkten Zugriff auf die Datenbank.

<!-- TODO: Nach Wahl des Backends festlegen, ob TypeORM, Prisma oder eine andere Zugriffstechnologie verwendet wird. -->

### Verbindung zu Google Gemini

Der Zugriff auf Gemini erfolgt ausschließlich serverseitig über HTTPS.

Das Backend sendet die für die Beschreibungserstellung notwendigen Daten an Gemini und verarbeitet den zurückgegebenen Beschreibungsvorschlag.

Der Gemini-API-Schlüssel darf nicht an das Frontend übertragen oder im öffentlichen Repository gespeichert werden.

### Verbindung zu Cloudinary

Der Upload zu Cloudinary erfolgt über das Backend und eine HTTPS-Verbindung.

Cloudinary liefert nach einem erfolgreichen Upload eine Bild-URL zurück. Diese URL wird in PostgreSQL gespeichert und später zur Darstellung des Bildes verwendet.

Der Cloudinary-Schlüssel darf nicht an das Frontend übertragen oder öffentlich gespeichert werden.

### Verbindung zum E-Mail-Dienst

Der Versand der Verifizierungs-E-Mails erfolgt über einen externen Mailserver beziehungsweise E-Mail-Dienst.

Die Architekturvorlage nennt dafür SMTP. Das Backend übermittelt die Empfängeradresse und den Verifizierungslink an den Maildienst.

<!-- TODO: Prüfen, welcher konkrete E-Mail-Anbieter verwendet wird und ob die technische Anbindung direkt per SMTP oder über eine HTTPS-Mail-API erfolgt. -->

## 3.3 Vereinfachter Kontextüberblick

Der grundsätzliche Kommunikationsfluss kann wie folgt zusammengefasst werden:

```text
Nutzer oder Administrator
          |
          | Browser
          v
React-Frontend
          |
          | REST / Socket.io
          v
THMarket-Backend
    |         |          |          |
    | SQL     | HTTPS    | HTTPS    | SMTP
    v         v          v          v
PostgreSQL  Gemini   Cloudinary   E-Mail-Dienst