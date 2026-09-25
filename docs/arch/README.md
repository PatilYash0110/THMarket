# THMarket – Softwarearchitektur (arc42)

Campus-Marktplatz für THM-Studierende

| | |
|---|---|
| **Projekt** | THMarket – Campus-Marktplatz für THM-Studierende |
| **Kurs** | Projekt 1 – Softwaretechnik |
| **Dokumenttyp** | Architekturdokumentation nach arc42 |
| **Quelle** | `THMarket_Architektur_format check (korrigiert).pdf` |

Dieses Dokument beschreibt die Softwarearchitektur von THMarket nach dem arc42-Template, aufbereitet als eine eigene, GitHub-lesbare README pro Kapitel. Die Kapitelnummerierung (A01–A12) folgt dem arc42-Standardschema; **A10 (Qualitätsanforderungen)** und **A11 (Risiken und technische Schulden)** sind im Quelldokument nicht als eigene Kapitel enthalten und daher hier ausgelassen — verwandte Inhalte finden sich in [Kapitel 1.2 (Qualitätsziele)](a01-einfuehrung-und-ziele.md) und [Kapitel 8 (Querschnittliche Konzepte)](a08-querschnittliche-konzepte.md).

Alle 15 Diagramme sind als Bild eingebettet (standardmäßig eingeklappt, `📊 Diagramm anzeigen`) und liegen zusätzlich einzeln unter [`diagrams-png/`](diagram_images/) — direkt aus dem Original-PDF extrahiert, da für dieses Dokument kein Mermaid-Quelltext vorliegt (im Unterschied zur [Spezifikation](../spec/README.md), deren Diagramme als Mermaid-Code vorliegen).

## Inhaltsverzeichnis

1. [Einführung und Ziele](a01-einfuehrung-und-ziele.md) — Anforderungsübersicht, Qualitätsziele, Stakeholder
2. [Randbedingungen](a02-randbedingungen.md) — Technologie-Stack, technische und organisatorische Randbedingungen
3. [Kontextabgrenzung](a03-kontextabgrenzung.md) — Fachlicher und technischer Kontext
4. [Lösungsstrategie](a04-loesungsstrategie.md) — Grundlegende Architekturentscheidungen
5. [Bausteinsicht](a05-bausteinsicht.md) — Module auf Ebene 0–2 (Auth, Listings, Wallet, Chat, Admin)
6. [Laufzeitsicht](a06-laufzeitsicht.md) — Sechs zentrale Abläufe als Sequenzdiagramm
7. [Verteilungssicht](a07-verteilungssicht.md) — Infrastruktur-Knoten und Kommunikationsprotokolle
8. [Querschnittliche Konzepte](a08-querschnittliche-konzepte.md) — Persistenz, Sicherheit & Datenschutz, API
9. [Architekturentscheidungen](a09-entwurfsentscheidungen.md) — ADR-001 bis ADR-010
10. ~~Qualitätsanforderungen~~ — nicht im Quelldokument enthalten
11. ~~Risiken und technische Schulden~~ — nicht im Quelldokument enthalten
12. [Glossar](a12-glossar.md) — Fachbegriffe, Quellen und verwandte Dokumente (letztes Kapitel)

## Diagrammquellen

| Abbildung | Datei |
|---|---|
| 1 — Fachlicher Kontext | [`diagrams-png/01-fachlicher-kontext.png`](diagram_images/01-fachlicher-kontext.png) |
| 2 — Technischer Kontext | [`diagrams-png/02-technischer-kontext.png`](diagrams_images/02-technischer-kontext.png) |
| 3 — Bausteinsicht Zerlegungsübersicht | [`diagrams-png/03-bausteinsicht-zerlegungsuebersicht.png`](diagram_images/003-ebene0-1-2-uebersicht.png) |
| 4 — Whitebox „System THMarket" | [`diagrams-png/04-whitebox-system-thmarket.png`](diagram_images/04-ebene1-whitebox-system.png) |
| 5 — Whitebox „Auth" | [`diagrams-png/05-whitebox-auth.png`](diagram_images/05-ebene2-kernmodule-band.png) |
| 6 — Whitebox „Listings" | [`diagrams-png/06-whitebox-listings.png`](diagram_images/06-ebene2-whitebox-admin.png) |
| 7 — Whitebox „Chat" | [`diagrams-png/07-whitebox-chat.png`](diagram_images/07-ebene2-whitebox-auth.png) |
| 8 — Whitebox „Admin" | [`diagrams-png/08-whitebox-admin.png`](diagram_images/08-ebene2-whitebox-chat.png) |
| 9 — Laufzeitsicht: Allgemeiner Ablauf | [`diagrams-png/09-laufzeitsicht-allgemeiner-ablauf.png`](diagrams_images/09-ebene2-whitebox-listings.png) |
| 10 — Laufzeitsicht: Registrierung & Verifizierung | [`diagrams-png/10-laufzeitsicht-registrierung-verifizierung.png`](diagram_images/10-allgemeiner-ablauf.png) |
| 11 — Laufzeitsicht: Inserat mit KI-Beschreibung | [`diagrams-png/11-laufzeitsicht-inserat-ki-beschreibung.png`](diagram_images/11-echtzeit-chat.png) |
| 12 — Laufzeitsicht: Echtzeit-Chat | [`diagrams-png/12-laufzeitsicht-echtzeit-chat.png`](diagram_images/12-inserat-ki-beschreibung.png) |
| 13 — Laufzeitsicht: Mock-Kauf | [`diagrams-png/13-laufzeitsicht-mock-kauf.png`](diagram_images/13-meldung.png) |
| 14 — Laufzeitsicht: Meldung | [`diagrams-png/14-laufzeitsicht-meldung.png`](diagram_images/14-mock-kauf.png) |
| 15 — Verteilungssicht | [`diagrams-png/15-verteilungssicht.png`](diagram_images/15-registrierung-verifizierung.png) |



---

## Eingesetzte KI-Werkzeuge

### Welche Werkzeuge

| Werkzeug | Rolle im Projekt |
|----------|------------------|
| Claude (Claude Code) | Entwürfe für Kapiteltexte und ADRs, Code-Vervollständigung im Backend, Repository- und Commit-Verwaltung, Hilfestellung bei Mermaid Diagramm Erstellung |
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
