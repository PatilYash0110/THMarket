# THMarket — Dokumentation

Dieses Verzeichnis enthält die Projektdokumentation zu **THMarket**, einem geschlossenen Marktplatz für Studierende und Angehörige der THM (NestJS 11 + Prisma 6 + PostgreSQL im Backend, React 19 + Vite + Tailwind im Frontend, Echtzeit-Chat über Socket.io). Die Dokumentation ist in zwei Schichten geteilt:

| Verzeichnis | Schicht | Struktur | Zweck |
|-------------|---------|----------|-------|
| [`spec/`](spec/) | Spezifikation — *was* und *warum* | [Siedersleben-Bausteine](spec/README.md) | Implementierungsfreie Beschreibung von Zielen, Geschäftsprozessen, Anwendungsfällen, Daten, Benutzeroberfläche, Nachbarsystemen und nichtfunktionalen Anforderungen. |
| [`arch/`](arch/) | Architektur — *wie* | [arc42](https://arc42.org/) + ADRs | Lösungsstrategie, Bausteinsicht, Laufzeitsicht, Verteilungssicht, querschnittliche Konzepte und Architekturentscheidungen. |

Die Trennung ist bewusst gesetzt und verbindlich: Detail auf Code-Ebene (Dateipfade, Klassennamen, Bibliotheks-APIs, konkrete SQL-Abfragen) gehört **nicht** in `spec/`. Es lebt in `arch/` — insbesondere in den ADRs — oder im Code selbst. Die Begründung und der Bausteinindex stehen in [`spec/README.md`](spec/README.md), die laufende Liste der Entscheidungen in [`arch/a09-entwurfsentscheidungen.md`](arch/a09-entwurfsentscheidungen.md).

Diagramme sind als Quelltext versioniert und liegen neben den Dokumenten in `*/diagrams-code/` — Mermaid (`.mermaid`, `.mmd`) für Use-Case-, Aktivitäts- und Sequenzdiagramme, PlantUML (`.plantuml`) für die Bausteinsicht. Die gerenderten Bilder liegen im jeweiligen Schwesterverzeichnis `*/diagram_images/` und werden aus den Dokumenten heraus referenziert. Wer ein Diagramm ändert, ändert die Quelle und rendert das Bild neu — nicht umgekehrt.

---

## Einordnung in WK_1106

Diese Dokumentation ist das Abgabeartefakt der Säulen 1 und 2 im Modul **WK_1106 — Wirtschaftsinformatik-Projekt I (Softwaretechnik)** an der THM (B.Sc. Wirtschaftsinformatik, Prof. Dr. Carsten Lucke). Kursrepository: <https://github.com/carstenlucke/thm_wkb_wk-1106>.

Sie folgt den dort gesetzten Anforderungen:

- **Spezifikation nach Siedersleben** — siehe [`spec/`](spec/) und den Bausteinindex in [`spec/README.md`](spec/README.md). Der Index weist für jeden Baustein den Bearbeitungsstand aus; nicht anwendbare Bausteine sind dort als solche gekennzeichnet und nicht stillschweigend weggelassen.
- **Architektur nach arc42 + ADRs** — siehe [`arch/`](arch/). Die Entscheidungen stehen in [`arch/a09-entwurfsentscheidungen.md`](arch/a09-entwurfsentscheidungen.md); jeder ADR hält Kontext, geprüfte Alternativen, Entscheidung, Begründung und Konsequenzen fest, einschließlich der negativen.
- **Nachvollziehbarkeit Spezifikation ↔ Architektur ↔ Code** — die Anwendungsfälle aus [`spec/F2-anwendungsfaelle.md`](spec/F2-anwendungsfaelle.md) werden in der Architektur als **Zusammenspiel mehrerer Bausteine** realisiert (Laufzeitsicht in [`arch/a06-laufzeitsicht.md`](arch/a06-laufzeitsicht.md)), nicht als 1:1-Abbildung auf je einen Baustein. Die logischen Bausteine aus [`arch/a05-bausteinsicht.md`](arch/a05-bausteinsicht.md) sind im Quellcode als Module wiedererkennbar (`backend/src/auth`, `listings`, `chat`, `admin`, `payments`, `wallet`). Bezeichner — Use-Case-IDs und die Datentypnamen aus [`spec/D2-datentypenverzeichnis.md`](spec/D2-datentypenverzeichnis.md) — sind über alle drei Schichten hinweg gleich benannt.
- **Diagramme als versionierte Quellen**, nicht als undurchsichtige Bilder.

Die formalen Rahmenbedingungen des Moduls — Meilensteine, Abgabeform, Bewertung — stehen im [Kursrepository WK_1106](https://github.com/carstenlucke/thm_wkb_wk-1106) und in den Kursmaterialien in Moodle.
