# THMarket — Architektur (arc42)

Architektur-Dokumentation von THMarket, gegliedert nach dem arc42-Template (Version 9.0, Juli 2025). Jedes Kapitel liegt in einer eigenen Datei; dieses Dokument ist der Orchestrator: Es führt in die Struktur ein und indexiert alle Kapitel.

Referenz-Template: https://arc42.org/.

## Status-Legende

| Symbol | Bedeutung |
|---|---|
| 🛠 | Skelett — nur Überschrift, noch kein Inhalt bzw. Datei existiert noch nicht. |
| 🟡 | Teilweise — Inhalt begonnen oder in Arbeit, noch offene Punkte (z. B. TODOs). |
| ✅ | Ausgearbeitet. |

## Kapitelübersicht

| # | Titel | Status | Datei |
|---|---|---|---|
| 1 | Einführung und Ziele | ✅ | [`a01-einfuehrung-und-ziele.md`](a01-einfuehrung-und-ziele.md) |
| 2 | Randbedingungen | ✅ | [`a02-randbedingungen.md`](a02-randbedingungen.md) |
| 3 | Kontextabgrenzung | ✅ | [`a03-kontextabgrenzung.md`](a03-kontextabgrenzung.md) |
| 4 | Lösungsstrategie | ✅ | [`a04-loesungsstrategie.md`](a04-loesungsstrategie.md) |
| 5 | Bausteinsicht | ✅ | [`a05-bausteinsicht.md`](a05-bausteinsicht.md) |
| 6 | Laufzeitsicht | ✅ | [`a06-laufzeitsicht.md`](a06-laufzeitsicht.md) |
| 7 | Verteilungssicht | ✅ | [`a07-verteilungssicht.md`](a07-verteilungssicht.md) |
| 8 | Querschnittliche Konzepte | ✅ | [`a08-querschnittliche-konzepte.md`](a08-querschnittliche-konzepte.md) |
| 9 | Architekturentscheidungen (ADRs) | ✅ | [`a09-entwurfsentscheidungen.md`](a09-entwurfsentscheidungen.md) |
| 10 | Qualitätsanforderungen | ✅ | [`a10-qualitaetsanforderungen.md`](a10-qualitaetsanforderungen.md) |
| 11 | Risiken und technische Schulden | ✅ | [`a11-risiken-und-technische-schulden.md`](a11-risiken-und-technische-schulden.md) |
| 12 | Glossar | ✅ | [`a12-glossar.md`](a12-glossar.md)  |

---

## Eingesetzte KI-Werkzeuge

### Welche Werkzeuge

| Werkzeug | Rolle im Projekt |
|----------|------------------|
| Claude (Claude Code) | Entwürfe für Kapiteltexte und ADRs, Code-Vervollständigung im Backend, Repository- und Commit-Verwaltung |
| Google Gemini | Code-Vervollständigung, Recherche zu Technologiealternativen |
| ChatGPT | Formulierungsvorschläge, Gegenlesen einzelner Kapitel |

### Wofür

- **Doku-Erzeugung:** Erstentwürfe für Kapiteltexte und für die Struktur der ADRs.
- **Recherche:** Sammeln und Vergleichen der Technologiealternativen, die in den ADRs als geprüfte Optionen aufgeführt sind.
- **Code-Vervollständigung:** Unterstützung beim Schreiben von Backend-Code innerhalb der vom Team festgelegten Modulstruktur.
- **Diagramme:** Erzeugung von Mermaid- und PlantUML-Quelltext als Ausgangspunkt für Bausteinsicht, Laufzeitsicht und Verteilungssicht.
- **Nicht KI-gestützt:** die Architekturentscheidungen selbst. Auswahl und Begründung in ADR-001 bis ADR-010 sind Ergebnis der Abstimmung im Team; KI-Werkzeuge dienten der Recherche der Alternativen und der Ausformulierung.

### Wie die Ergebnisse geprüft wurden

- Jeder ADR wurde nach dem Entwurf daraufhin geprüft, ob die genannten Alternativen tatsächlich erwogen wurden und die Konsequenzen — auch die negativen — dem entsprechen, was im Projekt eingetreten ist.
- Bausteinsicht und Laufzeitsicht wurden gegen den tatsächlichen Modulschnitt in `backend/src/` abgeglichen; Abweichungen wurden im Diagramm korrigiert, nicht in der Beschreibung überspielt.
- Diagramme wurden im Quelltext von Hand nachgearbeitet, bis Kantenverläufe und Beschriftungen lesbar waren.
- Generierte Passagen, die Technologien oder Konzepte nannten, die im Projekt nicht eingesetzt werden, wurden entfernt.

> **Abgrenzung:** Google Gemini ist außerdem Bestandteil der Anwendung selbst — siehe ADR-005 in [`a09-entwurfsentscheidungen.md`](a09-entwurfsentscheidungen.md). Das ist eine fachliche Funktion von THMarket, kein Entwicklungswerkzeug.
