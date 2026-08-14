# 2. Randbedingungen

Dieses Kapitel beschreibt technische, organisatorische und rechtliche Vorgaben, die bei der Architektur und Umsetzung von THMarket berücksichtigt werden müssen.

Randbedingungen sind keine einzelnen Funktionen der Anwendung. Sie legen vielmehr den Rahmen fest, innerhalb dessen THMarket entwickelt und betrieben wird.

## 2.1 Technische Randbedingungen

THMarket wird als browserbasierte Webanwendung umgesetzt. Eine native App und ein Offline-Betrieb sind nach aktuellem Projektstand nicht vorgesehen.

Die Architektur folgt dem Client-Server-Prinzip mit einer Trennung von:

- Benutzeroberfläche im Frontend,
- Anwendungs- und Geschäftslogik im Backend,
- dauerhafter Datenhaltung,
- externen Diensten.

### Vorgesehene Technologien

| Bereich | Vorgesehene Technologie |
|---|---|
| Frontend | React, Vite und TypeScript |
| Backend | Noch abschließend festzulegen |
| Datenbank | PostgreSQL |
| Echtzeit-Kommunikation | Socket.io |
| KI-Beschreibung | Google Gemini |
| Bildspeicherung | Cloudinary |
| E-Mail-Verifizierung | externer E-Mail-/SMTP-Dienst |

<!-- TODO: Im Team verbindlich klären, ob das Backend mit NestJS/Node.js/TypeScript oder mit FastAPI/Python umgesetzt wird. Die aktuelle Architekturvorlage nennt NestJS, während die bisherige Spezifikation FastAPI nennt. Anschließend diese Tabelle und alle weiteren Architekturkapitel vereinheitlichen. -->

### Frontend

Das Frontend wird mit React, Vite und TypeScript umgesetzt. Es stellt die Benutzeroberfläche im Browser bereit und übermittelt Nutzereingaben an das Backend.

Die Benutzeroberfläche soll:

- auf unterschiedlichen Bildschirmgrößen nutzbar sein,
- eine konsistente Dialog- und Navigationsstruktur besitzen,
- Formulareingaben bereits auf der Clientseite prüfen,
- verständliche Rückmeldungen bei Erfolg und Fehlern anzeigen.

### Backend

Das Backend verarbeitet die Geschäftslogik von THMarket. Dazu gehören insbesondere:

- Registrierung und Login,
- E-Mail-Verifizierung,
- Verwaltung von Nutzern und Berechtigungen,
- Erstellen und Verwalten von Inseraten,
- Favoriten und Meldungen,
- Chat-Kommunikation,
- Kommunikation mit externen Diensten,
- Zugriff auf die PostgreSQL-Datenbank.

Alle Aufrufe externer Dienste sollen über das Backend erfolgen. Dadurch werden Zugangsdaten und API-Schlüssel nicht an den Browser übertragen.

<!-- TODO: Nach der Entscheidung zwischen NestJS und FastAPI die konkreten Backend-Begriffe ergänzen. Bei NestJS wären dies beispielsweise Module, Controller, Services und DTOs; bei FastAPI wären Router, Services und Pydantic-Modelle relevant. -->

### Datenbank

Für die dauerhafte Datenhaltung wird PostgreSQL eingesetzt.

Die Datenbank enthält beziehungsweise referenziert insbesondere:

- Benutzerkonten und Rollen,
- Verifizierungsstatus,
- Inserate,
- Kategorien,
- Bild-URLs,
- Favoriten,
- Konversationen,
- Chat-Nachrichten,
- Meldungen.

Die eigentlichen Bilddateien werden bei Cloudinary gespeichert. In PostgreSQL werden die zugehörigen URLs beziehungsweise Referenzen abgelegt.

<!-- TODO: Im Team entscheiden, ob PostgreSQL konkret bei Neon oder Supabase betrieben wird. Bis dahin wird nur PostgreSQL als verbindliche Technologie genannt. -->

### Echtzeit-Kommunikation

Der Chat wird über Socket.io realisiert. Dadurch können Nachrichten zwischen den beteiligten Nutzern in Echtzeit übertragen werden.

Die Nachrichten werden zusätzlich dauerhaft in PostgreSQL gespeichert, damit der Chatverlauf nach einem erneuten Login oder nach einem Verbindungsabbruch wieder geladen werden kann.

### KI-gestützte Beschreibungserstellung

Für die optionale Erstellung eines Beschreibungsvorschlags wird die externe Google-Gemini-API verwendet.

Der grundsätzliche Ablauf ist:

1. Der Nutzer lädt ein Produktbild hoch.
2. Das Backend übermittelt das Bild beziehungsweise eine geeignete Bildreferenz zusammen mit einem Prompt an Gemini.
3. Gemini liefert einen Beschreibungsvorschlag zurück.
4. Der Vorschlag wird im Formular angezeigt.
5. Der Nutzer kann den Text übernehmen, bearbeiten oder vollständig durch einen eigenen Text ersetzen.

Die KI-Funktion ist optional. Ist Gemini nicht erreichbar oder schlägt die Generierung fehl, muss das Inserat weiterhin mit einer manuell eingegebenen Beschreibung erstellt werden können.

<!-- TODO: Prüfen, ob bereits verbindlich das Modell „Gemini 2.5 Flash“ verwendet wird oder ob zunächst nur „Google Gemini“ festgelegt werden soll. -->

### Bildspeicherung

Hochgeladene Inseratsbilder werden über das Backend an Cloudinary übertragen.

Cloudinary speichert und liefert die Bilddateien. THMarket speichert in der eigenen Datenbank lediglich die zurückgegebenen Bild-URLs und die Zuordnung zum jeweiligen Inserat.

API-Schlüssel und andere Cloudinary-Zugangsdaten dürfen nicht im Frontend oder im öffentlichen Repository gespeichert werden.

### Authentifizierung und Schutz von Zugangsdaten

Für sicherheitsrelevante Daten gelten folgende Vorgaben:

- Passwörter dürfen niemals im Klartext gespeichert werden.
- Passwörter werden ausschließlich als sichere Hashwerte gespeichert.
- API-Schlüssel für Gemini und Cloudinary werden ausschließlich serverseitig verwaltet.
- Zugangsdaten dürfen nicht im öffentlichen Repository committed werden.
- Die Registrierung ist auf gültige THM-E-Mail-Adressen beschränkt.
- Ein Konto wird erst nach erfolgreicher E-Mail-Verifizierung freigeschaltet.
- Geschützte Funktionen dürfen nur von angemeldeten und berechtigten Nutzern verwendet werden.

<!-- TODO: Im Team klären, ob JWT bereits verbindlich als Authentifizierungsverfahren festgelegt ist. -->
<!-- TODO: Nach Wahl des Backends festlegen, welche Passwort-Hashing-Bibliothek beziehungsweise welches Verfahren eingesetzt wird, beispielsweise bcrypt oder Argon2. -->

### Validierung und Fehlerverhalten

Formulareingaben sollen sowohl im Frontend als auch im Backend geprüft werden.

Zu prüfen sind insbesondere:

- Pflichtfelder,
- erlaubte Werte und Formate,
- Preisangaben,
- THM-E-Mail-Adresse,
- Bildformat und Bildgröße,
- Berechtigung des Nutzers,
- Länge und Inhalt von Texteingaben.

Bei einem Fehler soll die Anwendung nicht unkontrolliert abbrechen. Stattdessen erhält der Nutzer eine verständliche Fehlermeldung.

Bei Ausfall eines externen Dienstes gilt:

- Bei Ausfall von Gemini bleibt die manuelle Beschreibung möglich.
- Bei Ausfall von Cloudinary kann das betreffende Bild nicht hochgeladen werden; die Anwendung soll den Fehler verständlich anzeigen.
- Bei Ausfall des E-Mail-Dienstes bleibt das Konto unverifiziert und der Versand soll später erneut angestoßen werden können.

### Leistungs- und UI-Vorgaben

Für THMarket gelten nach aktuellem Stand folgende Vorgaben:

- 95 % der Inseratsübersichten sollen bei aktivem Server innerhalb von höchstens zwei Sekunden angezeigt werden.
- Chat-Nachrichten sollen bei aktiver Verbindung innerhalb von höchstens einer Sekunde zugestellt werden.
- Die Benutzeroberfläche soll responsiv sein.
- Dialoge, Navigation und Rückmeldungen sollen konsistent gestaltet sein.

Die genannten Zeiten gelten nicht zwingend für einen möglichen Kaltstart eines kostenlosen Hosting-Dienstes.

## 2.2 Organisatorische Randbedingungen

### Projektorganisation

THMarket wird im Rahmen des Moduls „Projekt 1 – Softwaretechnik“ durch eine Projektgruppe entwickelt.

Für die Zusammenarbeit sind nach aktuellem Stand vorgesehen:

- regelmäßige Abstimmung innerhalb des Teams,
- Aufteilung der Dokumentations- und Entwicklungsaufgaben,
- gemeinsame Nutzung des GitHub-Repositories,
- versionierbare Dokumentation in Markdown,
- regelmäßige Funktionsprüfungen,
- nachvollziehbare Commits nach der vorgegebenen Commit-Konvention.

<!-- TODO: Tatsächliche Gruppengröße und vereinbarte Meeting-Frequenz eintragen. Die Vorlage nennt maximal sechs Mitglieder und wöchentliche Meetings. -->
<!-- TODO: Offizielles Abgabedatum beziehungsweise Projektdeadline eintragen. -->

### Teststrategie

Die Anwendung soll während der Entwicklung regelmäßig geprüft werden. Vorgesehen sind mindestens:

- Tests der zentralen Funktionen,
- Prüfung typischer Fehlerfälle,
- Prüfung der Kommunikation zwischen Frontend und Backend,
- Prüfung der Datenbankzugriffe,
- Prüfung externer Dienste,
- Prüfung der Benutzeroberfläche auf unterschiedlichen Bildschirmgrößen.

Nach der Architekturvorlage sollen Funktionstests mindestens einmal pro Sprint erfolgen.

<!-- TODO: Im Team klären, ob mit festen Sprints gearbeitet wird und wie lang ein Sprint dauert. Falls keine Sprints verwendet werden, die Formulierung an den tatsächlichen Arbeitsprozess anpassen. -->

### Hosting und Betrieb

Für den Prototyp ist ein Betrieb über kostenlose oder kostenarme Cloud-Dienste vorgesehen.

Die Architekturvorlage nennt als mögliche Dienste:

- Frontend: Vercel oder Netlify,
- Backend: Render,
- PostgreSQL-Datenbank: Neon oder Supabase,
- Bildspeicherung: Cloudinary.

<!-- TODO: Verbindlich festlegen, welche Hosting-Dienste tatsächlich genutzt werden. Die genannten Anbieter sind derzeit mögliche beziehungsweise vorgeschlagene Lösungen. -->
<!-- TODO: Die Backend-Hosting-Lösung nach der Entscheidung zwischen NestJS und FastAPI erneut prüfen. -->

Bei kostenlosen Hosting-Tarifen können technische Einschränkungen auftreten, beispielsweise:

- begrenzte Rechen- oder Speicherkapazität,
- Anfragelimits,
- Kaltstarts nach längerer Inaktivität,
- Begrenzungen externer API-Dienste.

Diese Einschränkungen müssen bei der Bewertung der Leistung des Prototyps berücksichtigt werden.

### Zahlungsabwicklung

THMarket bindet keinen realen Zahlungsanbieter ein.

Die Bezahlung, Übergabe und gegebenenfalls der Versand werden außerhalb der Anwendung zwischen den Nutzern vereinbart. THMarket dient lediglich der Vermittlung und Kommunikation.

## 2.3 Datenschutz und rechtliche Randbedingungen

THMarket soll nur Daten verarbeiten, die für die vorgesehenen Funktionen notwendig sind.

Dazu zählen nach aktuellem Stand insbesondere:

- THM-E-Mail-Adresse,
- Benutzername beziehungsweise Anzeigename,
- Passwort-Hash,
- Rollen- und Verifizierungsstatus,
- Inseratsdaten,
- Bild-URLs,
- Favoriten,
- Konversationen und Nachrichten,
- Meldungen.

Die hochgeladenen Bilddateien werden bei Cloudinary gespeichert. THMarket speichert in PostgreSQL die Bild-URLs und die Zuordnung zu den Inseraten.

Zugangsdaten, Passwörter und API-Schlüssel dürfen nicht öffentlich zugänglich gemacht werden.

Da es sich um einen Hochschulprototyp handelt, ist nach aktuellem Projektstand keine externe datenschutzrechtliche Prüfung durch Dritte vorgesehen.

<!-- TODO: Prüfen, ob für Gemini Produktbilder oder Cloudinary-URLs übermittelt werden und welche Informationen dadurch an Google weitergegeben werden. Die endgültige Formulierung muss zur tatsächlichen Implementierung passen. -->
<!-- TODO: Vor der endgültigen Abgabe prüfen, ob Datenschutzhinweise, Löschmöglichkeiten oder Aufbewahrungsfristen als Anforderungen ergänzt werden müssen. -->

