# THMarket — Spezifikation

### Status Legende für die Übersicht unten

| Symbol | Bedeutung |
|---|---|
| ✅ | Baustein existiert in diesem Verzeichnis. |
| 🛠 | Baustein ist geplant, aber noch nicht geschrieben. |
| ⛔ | Baustein ist für THMarket nicht anwendbar (Begründung unten). |

## Bausteinübersicht

### 1. Projektgrundlagen

| Baustein | Titel | Status | Datei |
|---|---|---|---|
| P1 | Ziele und Rahmenbedingungen | ✅ | [`P1-ziele-rahmenbedingungen.md`](P1-ziele-rahmenbedingungen.md) |
| P2 | Architekturüberblick | ✅ | [`P2-architekturueberblick.md`](P2-architekturueberblick.md) |

### 2. Prozesse und Funktionen

| Baustein | Titel | Status | Datei |
|---|---|---|---|
| F1 | Geschäftsprozesse | ✅ | [`F1-geschaeftsprozesse.md`](F1-geschaeftsprozesse.md) |
| F2 | Anwendungsfälle | ✅ | [`F2-anwendungsfaelle.md`](F2-anwendungsfaelle.md) |
| F3 | Anwendungsfunktionen | ✅ | [`F3-anwendungsfunktionen.md`](F3-anwendungsfunktionen.md) |

### 3. Daten

| Baustein | Titel | Status | Datei |
|---|---|---|---|
| D1 | Datenmodell | ✅ | [`D1-datenmodell.md`](D1-datenmodell.md) |
| D2 | Datentypenverzeichnis | ✅ | [`D2-datentypenverzeichnis.md`](D2-datentypenverzeichnis.md) |

### 4. Benutzeroberfläche

| Baustein | Titel | Status | Datei |
|---|---|---|---|
| B1 | Dialogspezifikation | ✅ | [`B1-dialogspezifikation.md`](B1-dialogspezifikation.md) |
| B2 | Stapelverarbeitung | ⛔ | — |
| B3 | Druckausgabe | ⛔ | — |

### 5. Schnittstellen zu Alt- und Nachbarsystemen

| Baustein | Titel | Status | Datei |
|---|---|---|---|
| S1 | Nachbarsysteme | ✅ | [`S1-nachbarsysteme.md`](S1-nachbarsysteme.md) |
| S2 | Datenmigration | ⛔ | — |
| S3 | Inbetriebnahme | ✅ | [`S3-inbetriebnahme.md`](S3-inbetriebnahme.md) |

### 6. Querschnittliche Aspekte

| Baustein | Titel | Status | Datei |
|---|---|---|---|
| N1 | Nichtfunktionale Anforderungen | ✅ | [`N1-nichtfunktional.md`](N1-nichtfunktional.md) |
| N2 | Querschnittskonzepte | ✅ | [`N2-querschnittskonzepte.md`](N2-querschnittsknozepte.md) |

### 7. Ergänzende Bausteine

| Baustein | Titel | Status | Datei |
|---|---|---|---|
| E1 | Leitfaden zum Lesen | ✅ | Diese Readme File |
| E2 | Glossar | 🛠 | `` |

## Nicht anwendbare Bausteine

---

## Eingesetzte KI-Werkzeuge

### Welche Werkzeuge

| Werkzeug | Rolle im Projekt |
|----------|------------------|
| Claude (Claude Code) | Entwürfe und Umformulierungen von Bausteintexten, Repository- und Commit-Verwaltung, Hilfestellung bei Mermaid Diagramm Erstellung |
| Google Gemini | Recherche, Formulierungsvorschläge |
| ChatGPT | Formulierungsvorschläge, Gegenlesen einzelner Abschnitte |

### Wofür

- **Doku-Erzeugung:** Erstentwürfe und Umformulierungen einzelner Bausteintexte.
- **Recherche:** Klärung von Begriffen und Vorgehensweisen bei der Strukturierung nach Siedersleben.
- **Diagramme:** Erzeugung von Mermaid-Quelltext als Ausgangspunkt für Use-Case-, Aktivitäts- und Sequenzdiagramme.
- **Nicht KI-gestützt:** die fachlichen Festlegungen selbst — Projektidee, Abgrenzung des Nutzerkreises, Anwendungsfälle, Datenmodell und nichtfunktionale Anforderungen sind Entscheidungen der Gruppe.

### Wie die Ergebnisse geprüft wurden

- Jeder mit KI-Unterstützung entstandene Abschnitt wurde von mindestens einem Gruppenmitglied gegen die eigene Projektidee gelesen und überarbeitet.
- Bezeichner — Use-Case-IDs und die Datentypnamen aus [`D2-datentypenverzeichnis.md`](D2-datentypenverzeichnis.md) — wurden manuell gegen Architektur und Code abgeglichen, nicht aus Vorschlägen übernommen.
- Diagramme wurden im Mermaid- bzw. PlantUML-Quelltext von Hand nachgearbeitet, bis Anordnung und Beschriftung lesbar waren.
- Vorschläge, die nicht zum tatsächlichen Stand des Projekts passten, wurden verworfen statt eingebaut.

> **Abgrenzung:** Google Gemini ist außerdem Bestandteil der Anwendung selbst — als Dienst für den Beschreibungsvorschlag beim Anlegen eines Inserats. Das ist eine fachliche Funktion von THMarket und kein Entwicklungswerkzeug; die Entscheidung dazu ist in [`../arch/a09-entwurfsentscheidungen.md`](../arch/a09-entwurfsentscheidungen.md) als ADR-005 dokumentiert.
