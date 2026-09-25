# A09. Architekturentscheidungen (ADRs)


Die zentralen Entwurfsentscheidungen sind hier in einer einzigen Tabelle zusammengefasst.

| Entscheidung | Begründung | Konsequenzen |
|---|---|---|
| **ADR-001** — Modularer Monolith statt Microservices | Für den Projektumfang ist ein Monolith angemessen. Microservices brächten unnötigen Betriebs- und Kommunikations-Overhead. | Alle Module teilen einen Prozess und eine globale Prisma-Verbindung; eine unabhängige Skalierung wäre nur mit größerem Umbau möglich. |
| **ADR-002** — Fachlich/technisch gemischte Modulgliederung | Fünf fachliche Kernmodule plus drei schlanke Integrationsmodule schaffen klare Verantwortlichkeiten; jede Abhängigkeit nach außen ist an genau einer Stelle sichtbar. | Der Kaufabschluss liegt im Listings-Modul (kein eigenes Transaktionsmodul); zwei Modularten nebeneinander sind erklärungsbedürftig. |
| **ADR-003** — Prisma als ORM | Bessere Migrations- und Typ-Erfahrung als bei TypeORM. | Ein zusätzlicher Build-Schritt (Prisma-Generator) ist bei jeder Schemaänderung nötig. |
| **ADR-004** — Klassischer Prisma-Generator | Der neue Standard-Generator verursachte im Projekt Import-/Typprobleme; die klassische Variante lief stabil. | Bei künftigen Prisma-Updates ist zu prüfen, ob die klassische Variante weiter unterstützt wird. |
| **ADR-005** — KI nur für die Beschreibung, keine Preisschätzung | Eine Preisschätzung allein aus Bildern ist unzuverlässig; die KI beschränkt sich auf den frei bearbeitbaren Beschreibungstext. | Titel, Kategorie und Preis werden manuell eingegeben; Gemini prüft jedes Foto zusätzlich auf unangemessene Inhalte (fail-open). |
| **ADR-006** — Simulierte Zahlung statt echter Abwicklung | Für den experimentellen Projektrahmen ist keine echte Finanzregulatorik nötig. | Es fließt kein echtes Geld; Bezahlung und Übergabe klären Käufer und Verkäufer außerhalb der Plattform. |
| **ADR-007** — Private Chats ohne generellen Admin-Zugriff | Datenschutz hat Vorrang; Moderation erfolgt ausschließlich über die Meldefunktion (nur im Kontext einer Meldung). | Missbrauch in nicht gemeldeten Chats kann nicht proaktiv erkannt werden. |
| **ADR-008** — Socket.io für den Echtzeit-Chat | Robuste, event-basierte Abstraktion (`joinConversation`, `sendMessage`) statt Eigenimplementierung mit nativem WebSocket. | Eine zusätzliche Abhängigkeit; dafür entfällt viel Eigenimplementierung für das Verbindungsmanagement. |
| **ADR-009** — Kleine Commits auf `main` statt striktem Branch-Zwang | Als Einzelprojekt ohne Reviewer bringt ein PR-Zwang pro Änderung keinen Review-Nutzen; kleine, lauffähige Inkremente mit Tags passen besser. | Keine systematische Review-Historie pro Commit; Qualitätssicherung über manuelles Testen und projektbegleitende Dokumentenprüfung. |
| **ADR-010** — Deployment auf Vercel / Render / Neon | Kostenlose Tarife ermöglichen einfachen Betrieb ohne eigene Serververwaltung. | Der Render-Free-Tarif hat nach Inaktivität einen Kaltstart (30–50 s); Produktivbetrieb bräuchte einen bezahlten Tarif. |
