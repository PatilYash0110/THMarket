# THMarket – Softwarearchitektur (arc42)

Campus-Marktplatz für THM-Studierende

| | |
|---|---|
| **Projekt** | THMarket – Campus-Marktplatz für THM-Studierende |
| **Kurs** | Projekt 1 – Softwaretechnik |
| **Dokumenttyp** | Architekturdokumentation nach arc42 |
| **Quelle** | `THMarket_Architektur_format check (korrigiert).pdf` |

Dieses Dokument beschreibt die Softwarearchitektur von THMarket nach dem arc42-Template, aufbereitet als eine eigene, GitHub-lesbare README pro Kapitel. Die Kapitelnummerierung (A01–A12) folgt dem arc42-Standardschema; **A10 (Qualitätsanforderungen)** und **A11 (Risiken und technische Schulden)** sind im Quelldokument nicht als eigene Kapitel enthalten und daher hier ausgelassen — verwandte Inhalte finden sich in [Kapitel 1.2 (Qualitätsziele)](A01-introduction-and-goals.md#12-qualitätsziele) und [Kapitel 8 (Querschnittliche Konzepte)](A08-cross-cutting-concepts.md).

Alle 15 Diagramme sind als Bild eingebettet (standardmäßig eingeklappt, `📊 Diagramm anzeigen`) und liegen zusätzlich einzeln unter [`diagrams-png/`](diagrams-png/) — direkt aus dem Original-PDF extrahiert, da für dieses Dokument kein Mermaid-Quelltext vorliegt (im Unterschied zur [Spezifikation](../spec/README.md), deren Diagramme als Mermaid-Code vorliegen).

## Inhaltsverzeichnis

1. [Einführung und Ziele](A01-introduction-and-goals.md) — Anforderungsübersicht, Qualitätsziele, Stakeholder
2. [Randbedingungen](A02-architecture-constraints.md) — Technologie-Stack, technische und organisatorische Randbedingungen
3. [Kontextabgrenzung](A03-context-and-scope.md) — Fachlicher und technischer Kontext
4. [Lösungsstrategie](A04-solution-strategy.md) — Grundlegende Architekturentscheidungen
5. [Bausteinsicht](A05-building-block-view.md) — Module auf Ebene 0–2 (Auth, Listings, Wallet, Chat, Admin)
6. [Laufzeitsicht](A06-runtime-view.md) — Sechs zentrale Abläufe als Sequenzdiagramm
7. [Verteilungssicht](A07-deployment-view.md) — Infrastruktur-Knoten und Kommunikationsprotokolle
8. [Querschnittliche Konzepte](A08-cross-cutting-concepts.md) — Persistenz, Sicherheit & Datenschutz, API
9. [Architekturentscheidungen](A09-architecture-decisions.md) — ADR-001 bis ADR-010
10. ~~Qualitätsanforderungen~~ — nicht im Quelldokument enthalten
11. ~~Risiken und technische Schulden~~ — nicht im Quelldokument enthalten
12. [Glossar](A12-glossary.md) — Fachbegriffe, Quellen und verwandte Dokumente (letztes Kapitel)

## Diagrammquellen

| Abbildung | Datei |
|---|---|
| 1 — Fachlicher Kontext | [`diagrams-png/01-fachlicher-kontext.png`](diagrams-png/01-fachlicher-kontext.png) |
| 2 — Technischer Kontext | [`diagrams-png/02-technischer-kontext.png`](diagrams-png/02-technischer-kontext.png) |
| 3 — Bausteinsicht Zerlegungsübersicht | [`diagrams-png/03-bausteinsicht-zerlegungsuebersicht.png`](diagrams-png/03-bausteinsicht-zerlegungsuebersicht.png) |
| 4 — Whitebox „System THMarket" | [`diagrams-png/04-whitebox-system-thmarket.png`](diagrams-png/04-whitebox-system-thmarket.png) |
| 5 — Whitebox „Auth" | [`diagrams-png/05-whitebox-auth.png`](diagrams-png/05-whitebox-auth.png) |
| 6 — Whitebox „Listings" | [`diagrams-png/06-whitebox-listings.png`](diagrams-png/06-whitebox-listings.png) |
| 7 — Whitebox „Chat" | [`diagrams-png/07-whitebox-chat.png`](diagrams-png/07-whitebox-chat.png) |
| 8 — Whitebox „Admin" | [`diagrams-png/08-whitebox-admin.png`](diagrams-png/08-whitebox-admin.png) |
| 9 — Laufzeitsicht: Allgemeiner Ablauf | [`diagrams-png/09-laufzeitsicht-allgemeiner-ablauf.png`](diagrams-png/09-laufzeitsicht-allgemeiner-ablauf.png) |
| 10 — Laufzeitsicht: Registrierung & Verifizierung | [`diagrams-png/10-laufzeitsicht-registrierung-verifizierung.png`](diagrams-png/10-laufzeitsicht-registrierung-verifizierung.png) |
| 11 — Laufzeitsicht: Inserat mit KI-Beschreibung | [`diagrams-png/11-laufzeitsicht-inserat-ki-beschreibung.png`](diagrams-png/11-laufzeitsicht-inserat-ki-beschreibung.png) |
| 12 — Laufzeitsicht: Echtzeit-Chat | [`diagrams-png/12-laufzeitsicht-echtzeit-chat.png`](diagrams-png/12-laufzeitsicht-echtzeit-chat.png) |
| 13 — Laufzeitsicht: Mock-Kauf | [`diagrams-png/13-laufzeitsicht-mock-kauf.png`](diagrams-png/13-laufzeitsicht-mock-kauf.png) |
| 14 — Laufzeitsicht: Meldung | [`diagrams-png/14-laufzeitsicht-meldung.png`](diagrams-png/14-laufzeitsicht-meldung.png) |
| 15 — Verteilungssicht | [`diagrams-png/15-verteilungssicht.png`](diagrams-png/15-verteilungssicht.png) |

Das Datenmodell (ER-Diagramm) ist nicht Teil dieses Dokuments — es wird mit der [Spezifikation](../spec/README.md) geteilt, siehe [`docs/spec/diagrams-code/datenmodell.mmd`](../spec/diagrams-code/datenmodell.mmd).


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
