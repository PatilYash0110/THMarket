# 1. Einführung und Ziele

Dieses Dokument beschreibt die Softwarearchitektur von THMarket, einer reinen Webanwendung, die ausschließlich Studierenden der Technischen Hochschule Mittelhessen (THM) einen campusinternen Marktplatz für gebrauchte Artikel bietet.

Nur Nutzer mit einer gültigen THM-E-Mail-Adresse und anschließender E-Mail-Verifizierung erhalten Zugang zur Plattform. Verifizierte Nutzer können Inserate anlegen, Bilder hochladen, sich mithilfe von KI einen Beschreibungsentwurf erzeugen lassen, Artikel suchen und filtern, Inserate favorisieren, über einen Echtzeit-Chat kommunizieren, Käufe über eine simulierte Zahlungsfunktion abwickeln und sich nach einem Verkauf gegenseitig bewerten.

Ein Melde- und Admin-System unterstützt die Moderation der Plattform.

## 1.1 Anforderungsübersicht

Verifizierte THM-Nutzer können Inserate erstellen und verwalten. Ein Inserat enthält unter anderem Bilder, einen Beschreibungstext, Kategorie, Preis, Zustand und Campus. Die Beschreibung kann optional mithilfe von Google Gemini aus einem Produktbild vorgeschlagen werden.

Andere Nutzer können Inserate durchsuchen und nach verschiedenen Kriterien filtern. Interessante Inserate können als Favoriten gespeichert werden. Über einen Echtzeit-Chat können Käufer und Verkäufer direkt miteinander kommunizieren.

Nach einem Kauf kann eine simulierte Zahlungsfunktion verwendet werden. Es findet jedoch keine reale Zahlungsabwicklung über einen externen Zahlungsanbieter statt. Nach Abschluss eines Verkaufs können sich die beteiligten Nutzer gegenseitig bewerten.

Administratoren können Meldungen bearbeiten und abgestufte Maßnahmen zur Moderation durchführen.

### Abgrenzung

THMarket umfasst nach aktuellem Projektstand nicht:

* eine echte Zahlungsabwicklung; Zahlungen werden lediglich simuliert,
* eine native App,
* einen Offline-Betrieb,
* Push- oder E-Mail-Benachrichtigungen für Kaufvorgänge,
* eine Preisempfehlung durch die KI.

Die KI unterstützt ausschließlich die Generierung von Titel, Beschreibung und Kategorie.

### Use-Case-Übersicht

Die detaillierten Use Cases werden in der Spezifikation beschrieben. Für die Architektur sind insbesondere folgende Funktionsbereiche relevant:

* Registrierung und E-Mail-Verifizierung,
* Login und Authentifizierung,
* Inserate erstellen und verwalten,
* KI-gestützte Beschreibungserstellung,
* Inserate suchen und filtern,
* Favoriten verwalten,
* Echtzeit-Chat,
* simulierte Kaufabwicklung,
* gegenseitige Bewertung nach einem Verkauf,
* Meldungen und administrative Moderation.

### Architekturdiagramm

Das zugehörige Use-Case-Diagramm wird als reproduzierbares Mermaid-Diagramm im Repository abgelegt und zusätzlich als gerenderte Grafik eingebunden.

## 1.2 Qualitätsziele

Die wichtigsten Qualitätsziele von THMarket sind:

| Priorität | Ziel                        | Messkriterium                                                                                                                                                                                                   | Nutzen                                               |
| --------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1         | Performance                 | Such- und Chat-Antworten sollen innerhalb von höchstens zwei Sekunden erfolgen; Echtzeit-Nachrichten sollen ohne spürbare Verzögerung zugestellt werden.                                                        | schnelle und lebendige Nutzung                       |
| 2         | Robustheit externer Dienste | Bei Timeout oder Ausfall von Gemini bleibt das Inserat erstellbar; eine definierte Fehlermeldung wird angezeigt und die manuelle Eingabe bleibt möglich.                                                        | verlässliche Anwendung trotz externer Abhängigkeiten |
| 3         | Sicherheit und Datenschutz  | Passwörter werden mit bcrypt gehasht; nur verifizierte THM-Konten erhalten Zugang; API-Schlüssel erscheinen niemals im Client; Chats sind für Administratoren nicht einsehbar; Bild-Metadaten werden bereinigt. | Schutz von Konten, Daten und Privatsphäre            |
| 4         | Benutzerfreundlichkeit      | Inserate einschließlich KI-Unterstützung sollen in wenigen Schritten erstellt werden können; die Benutzeroberfläche ist deutschsprachig und konsistent gestaltet.                                               | niedrige Einstiegshürde                              |
| 5         | Erweiterbarkeit             | Neue Kategorien, Datenfelder oder Module sollen ohne grundlegende Änderungen an bestehenden Funktionen ergänzt werden können.                                                                                   | schnelle Weiterentwicklung                           |

## 1.3 Stakeholder

### Nutzende Stakeholder

| Stakeholder                        | Ziel / Interesse                 | Erwartungen an System und Architektur                                                                          |
| ---------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Gast (unverifiziert)               | Einstieg und Registrierung       | klare Navigation sowie stabiler Registrierungs- und Verifizierungsprozess                                      |
| Verifizierter Nutzer als Käufer    | Artikel finden und kaufen        | schnelle Suche, zuverlässige Filter, Favoriten und einfacher Chat-Kontakt                                      |
| Verifizierter Nutzer als Verkäufer | Artikel inserieren und verkaufen | einfaches Anlegen von Inseraten, KI-Beschreibung, Bild-Upload sowie Chat- und Kaufverwaltung                   |
| Administrator                      | Betrieb und Moderation           | sichere Admin-Oberfläche, Bearbeitung von Meldungen, abgestufte Maßnahmen und nachvollziehbare Protokollierung |

### Projekt-Stakeholder

| Stakeholder       | Ziel / Interesse        | Erwartungen an System und Architektur                                                                                                     |
| ----------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Entwickler        | Wartung und Erweiterung | klar getrennte Module, verständliche REST-APIs, lokale Einrichtung über Umgebungsvariablen und ein nachvollziehbarer Entwicklungsworkflow |
| Lehrende / Prüfer | Bewertung               | nachvollziehbare Architekturentscheidungen, messbare Qualitätsziele sowie verständliche Build- und Startanleitung                         |
