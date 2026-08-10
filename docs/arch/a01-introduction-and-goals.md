# 1. Einführung und Ziele

Dieses Dokument beschreibt die Softwarearchitektur von THMarket, einer browserbasierten Kleinanzeigen-Plattform für Angehörige der Technischen Hochschule Mittelhessen.

Registrierte Nutzer mit einer gültigen und verifizierten THM-E-Mail-Adresse können Inserate erstellen, durchsuchen und über einen Echtzeit-Chat direkt mit anderen Nutzern in Kontakt treten. Zusätzlich unterstützt THMarket eine KI-gestützte Beschreibungserstellung: Aus einem hochgeladenen Produktbild kann das System über Google Gemini automatisch einen Beschreibungsvorschlag erzeugen.

Ziel des Systems ist die Bereitstellung eines schnellen, vertrauenswürdigen und geschlossenen Marktplatzes innerhalb der Hochschulgemeinschaft.

Die folgenden übergeordneten Ziele wurden für das System festgelegt:

| Priorität | Ziel |
|---|---|
| 1 | Schnelle und intuitive Bedienung der Kernabläufe, insbesondere beim Durchsuchen und Erstellen von Inseraten sowie beim Chatten. |
| 2 | Zuverlässige Echtzeit-Kommunikation zwischen Interessenten und Anbietern über Socket.io. |
| 3 | Geschlossener Zugang ausschließlich für verifizierte THM-Nutzer sowie sichere Speicherung von Passwörtern und Schutz externer Zugangsdaten. |
| 4 | KI-gestützte Inseratserstellung mit verständlichem Fehlerverhalten bei Ausfall des externen KI-Dienstes. |
| 5 | Erweiterbarkeit um neue Kategorien, Datenfelder und Ansichten ohne grundlegende Änderungen am Gesamtsystem. |

## 1.1 Anforderungsübersicht

THMarket ermöglicht es verifizierten THM-Studierenden, Artikel innerhalb der Hochschule zum Verkauf oder zur Miete anzubieten und entsprechende Inserate anderer Nutzer zu finden.

Nutzer können Inserate mit Titel, Beschreibung, Preis, Kategorie, Zustand und Bildern anlegen. Die Beschreibung kann entweder manuell eingegeben oder optional aus einem hochgeladenen Produktbild mithilfe von Google Gemini vorgeschlagen werden.

Andere Nutzer können die Inserate durchsuchen und nach Kriterien wie Kategorie, Angebotstyp, Preis und Suchbegriff filtern. Über einen integrierten Echtzeit-Chat können Interessenten und Anbieter miteinander kommunizieren.

Ein zentraler Aspekt ist der geschlossene Charakter der Plattform. Registrierung und Nutzung sind deshalb an eine gültige und verifizierte THM-E-Mail-Adresse gebunden.

### Abgrenzung

THMarket umfasst nach aktuellem Projektstand nicht:

- eine Zahlungsabwicklung innerhalb der Anwendung,
- eine Versand- oder Logistikfunktion,
- eine native App,
- einen Offline-Betrieb,
- einen öffentlichen Zugang für nicht verifizierte externe Nutzer.

Zahlung, Übergabe und gegebenenfalls Versand werden außerhalb der Anwendung zwischen den beteiligten Nutzern organisiert.

### Use-Case-Übersicht

<!-- TODO: Die Nummerierung der Use Cases muss mit der Spezifikation vereinheitlicht werden. In der bisherigen Spezifikation ist UC01 Login und UC02 Registrierung, während die Architekturvorlage diese beiden Nummern vertauscht. -->

| ID laut aktueller Architekturvorlage | Use Case | Kurzbeschreibung |
|---|---|---|
| UC01 | Registrierung | Konto mit THM-E-Mail-Adresse anlegen und die Adresse über einen Verifizierungslink bestätigen. |
| UC02 | Login | Nutzer authentifizieren und eine gültige Sitzung beziehungsweise ein Authentifizierungstoken bereitstellen. |
| UC03 | Inserat erstellen | Titel, Beschreibung, Preis, Kategorie, Zustand, Angebotstyp und Bilder erfassen. |
| UC04 | KI-Beschreibung generieren | Aus einem hochgeladenen Produktbild automatisch einen Beschreibungsvorschlag mit Gemini erzeugen. |
| UC05 | Inserate durchsuchen und filtern | Inserate nach Kategorie, Angebotstyp, Preis und Suchbegriff filtern. |
| UC06 | Inseratdetails ansehen | Ein Inserat mit Bildern, Beschreibung, Preis und Anbieterinformationen öffnen. |
| UC07 | Favorit speichern | Ein interessantes Inserat im eigenen Profil merken. |
| UC08 | Chat und Nachrichten | Eine Echtzeit-Konversation zu einem Inserat führen. |
| UC09 | Profil und eigene Inserate verwalten | Eigene Profildaten und Inserate einsehen und bearbeiten. |
| UC10 | Administration | Nutzer, Inserate und gemeldete Inhalte verwalten. |

<!-- TODO: Prüfen, ob Meldungen und Moderation als eigener Use Case bestehen bleiben oder vollständig in UC10 zusammengeführt werden. Die bisherige Spezifikation enthält dafür einen eigenen Admin-Use-Case. -->

## 1.2 Qualitätsziele

Die wichtigsten Qualitätsziele beschreiben, welche Eigenschaften für die Architektur von THMarket besonders wichtig sind.

| Priorität | Qualitätsziel | Mess- oder Prüfkriterium | Nutzen |
|---|---|---|---|
| 1 | Performance | 95 % der Inseratsübersichten sollen bei aktivem Server innerhalb von höchstens zwei Sekunden geladen werden. | Schnelle Nutzung und geringe Wartezeiten |
| 2 | Echtzeit-Chat | Nachrichten sollen bei aktiver Verbindung innerhalb von höchstens einer Sekunde zugestellt werden. | Flüssige Kommunikation zwischen Interessent und Anbieter |
| 3 | Sicherheit | Passwörter werden ausschließlich gehasht gespeichert. Nur verifizierte THM-Konten erhalten Zugriff. API-Schlüssel dürfen nicht im Browser oder öffentlichen Repository erscheinen. | Schutz von Konten, Daten und Zugangsdaten |
| 4 | Robustheit externer Dienste | Bei Ausfall oder Zeitüberschreitung von Gemini bleibt das Inserat weiterhin mit einer manuellen Beschreibung erstellbar. | Kernfunktionen bleiben trotz externer Abhängigkeiten nutzbar |
| 5 | Erweiterbarkeit | Neue Kategorien, Datenfelder oder Ansichten sollen ohne grundlegende Änderungen an bestehenden Funktionen ergänzt werden können. | Leichtere Weiterentwicklung |

<!-- TODO: Nach der Entscheidung über das Backend prüfen, ob konkrete technische Sicherheitsbegriffe wie bcrypt, argon2 und JWT bereits verbindlich genannt werden sollen. -->

## 1.3 Stakeholder

Stakeholder sind Personen oder Gruppen, die THMarket nutzen, entwickeln, betreiben oder bewerten.

### Nutzende Stakeholder

| Stakeholder | Ziel oder Interesse | Erwartungen an System und Architektur |
|---|---|---|
| Gast beziehungsweise unverifizierter Nutzer | Registrierung und Zugang zur Plattform | klare Navigation sowie ein verständlicher und stabiler Registrierungs- und Verifizierungsprozess |
| Verifizierter Nutzer als Interessent | passende Artikel finden und Anbieter kontaktieren | schnelle Suche, zuverlässige Filter, verständliche Detailansichten und einfacher Chat |
| Verifizierter Nutzer als Anbieter | eigene Artikel anbieten | einfaches Erstellen und Verwalten von Inseraten, Bild-Upload, optionale KI-Beschreibung und Verwaltung von Chat-Anfragen |
| Administrator | Betrieb und Moderation | geschützter Adminbereich, Verwaltung von Nutzern, Inseraten und Meldungen sowie nachvollziehbare technische Fehlermeldungen |

### Projekt-Stakeholder

| Stakeholder | Ziel oder Interesse | Erwartungen an System und Architektur |
|---|---|---|
| Entwicklerteam | Entwicklung, Wartung und Erweiterung | klar getrennte Komponenten für Frontend, Backend, Datenbank und externe Dienste; verständliche Schnittstellen; sichere Konfiguration ohne Zugangsdaten im Repository |
| Lehrende und Prüfer | Bewertung des Projekts | nachvollziehbare Architekturentscheidungen, messbare Qualitätsziele, konsistente Dokumentation und verständliche Build- beziehungsweise Startanleitung |

<!-- TODO: Im Entwicklerteam-Eintrag nach der Teamentscheidung konkretisieren, ob das Backend aus NestJS-Modulen oder aus FastAPI-Komponenten besteht. -->