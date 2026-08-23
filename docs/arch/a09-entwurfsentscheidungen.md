# 9. Architekturentscheidungen

Dieses Dokument hält die wichtigsten Architekturentscheidungen des Projekts fest. Jede Entscheidung dokumentiert Kontext, betrachtete Optionen und Begründung.

Für detaillierte Alternativenvergleiche siehe [`adr/*.md`](adr/).

---

## ADR-001: Modularer Monolith statt Microservices

**Status:** Angenommen

**Kontext:** Für den Aufbau des Backends musste entschieden werden, ob die fachlichen Module als eigenständige Microservices oder als ein zusammenhängender Monolith umgesetzt werden.

**Optionen:**

| Option | Beschreibung | Vorteile | Nachteile |
|---|---|---|---|
| **A – Microservices** | Jedes fachliche Modul als eigener, unabhängig deploybarer Service. | Unabhängige Skalierung, technologische Flexibilität | Hoher Betriebsaufwand, komplexe Kommunikation zwischen Services, unnötig für den Projektumfang |
| **B – Modularer Monolith** | Ein NestJS-Backend mit klar getrennten fachlichen Modulen. | Einfacher Betrieb, ein Deployment, klare Modulgrenzen im Code | Weniger unabhängige Skalierbarkeit |

**Entscheidung:** Option B – Modularer Monolith (NestJS).

**Begründung:** Für den Projektumfang von THMarket ist ein Monolith angemessen. Microservices würden unnötigen Betriebs- und Kommunikations-Overhead verursachen, ohne einen echten Vorteil zu bieten.

---

## ADR-002: Fachliche statt technischer Modulgliederung

**Status:** Angenommen

**Kontext:** Die Bausteinsicht musste entweder nach technischen Schichten (z. B. Controller/Service/Repository) oder nach fachlichen Verantwortlichkeiten gegliedert werden.

**Optionen:**

| Option | Beschreibung | Vorteile | Nachteile |
|---|---|---|---|
| **A – Technische Schichten** | Gliederung nach Controller/Service/Repository, quer über alle Features. | Klare technische Trennung | Fachliche Zusammenhänge über mehrere Schichten verteilt, schwerer nachvollziehbar |
| **B – Fachliche Module** | Gliederung nach User Management, Inserat Management, Kommunikation, Transaktion Management, Admin Management. | Klare Verantwortlichkeiten, leicht nachvollziehbar | Wiederverwendbare technische Bausteine müssen bewusst separat gehalten werden |

**Entscheidung:** Option B – fachliche Module.

**Begründung:** Klare Verantwortlichkeiten pro Modul erleichtern Entwicklung und Nachvollziehbarkeit, gerade im Team mit mehreren Bearbeitern pro Bereich.

---

## ADR-003: Prisma als ORM

**Status:** Angenommen

**Kontext:** Für den Zugriff des NestJS-Backends auf die PostgreSQL-Datenbank wird ein ORM benötigt, das TypeScript-Typsicherheit und unkomplizierte Schema-Migrationen unterstützt.

**Optionen:**

| Option | Beschreibung | Vorteile | Nachteile |
|---|---|---|---|
| **A – TypeORM** | Verbreitetes ORM im NestJS-Ökosystem. | Enge NestJS-Integration | Migrations-Handling weniger ausgereift, schwächere Typsicherheit bei komplexen Queries |
| **B – Prisma** | Eigenständiges ORM mit generiertem, typsicherem Client. | Bessere Migrations- und Typ-Erfahrung, klare Trennung von Datenmodell und SQL | Zusätzliches Build-Tool nötig |

**Entscheidung:** Option B – Prisma.

**Begründung:** Prisma bietet eine bessere Migrations- und Typ-Erfahrung als TypeORM und trennt Datenmodell und SQL klarer voneinander.

---

## ADR-004: Klassischer Prisma-Generator statt Standard-Generator

**Status:** Angenommen

**Kontext:** Prisma 7 nutzt standardmäßig einen neuen Generator ("prisma-client-js" mit eigenem Output-Pfad). Beim Einsatz traten Import- und Typprobleme im Projekt auf.

**Optionen:**

| Option | Beschreibung | Vorteile | Nachteile |
|---|---|---|---|
| **A – Neuer Standard-Generator** | Von Prisma 7 vorgegebener Generator mit eigenem Output-Pfad. | Aktueller Standard | Verursachte Import-/Typprobleme im Projekt |
| **B – Klassischer Generator** | Bewährte, ältere Generator-Variante. | Stabil, keine bekannten Probleme im Projekt | Nicht der neue Standard |

**Entscheidung:** Option B – klassischer Generator.

**Begründung:** Die klassische Variante lief im Projekt stabil, während der neue Standard-Generator zu Import-/Typproblemen führte.

---

## ADR-005: KI-Unterstützung nur für Textfelder, keine Preisschätzung

**Status:** Angenommen

**Kontext:** Beim Einsatz der KI-Unterstützung beim Inserat-Erstellen musste festgelegt werden, welche Felder automatisch befüllt werden.

**Optionen:**

| Option | Beschreibung | Vorteile | Nachteile |
|---|---|---|---|
| **A – Inkl. Preisschätzung** | KI schlägt zusätzlich einen Preis vor. | Zusätzlicher Komfort | Preisschätzung aus Bildern ist unzuverlässig |
| **B – Nur Titel, Beschreibung, Kategorie** | KI beschränkt sich auf Textfelder. | Zuverlässige Vorschläge | Kein automatischer Preisvorschlag |

**Entscheidung:** Option B – nur Titel, Beschreibung, Kategorie.

**Begründung:** Eine Preisschätzung allein aus Bildern ist unzuverlässig und hätte die Qualität der KI-Unterstützung insgesamt verschlechtert.

---

## ADR-006: Simulierte Zahlung statt echter Zahlungsabwicklung

**Status:** Angenommen

**Kontext:** Für den Kaufabschluss musste entschieden werden, ob eine echte Zahlungsabwicklung über einen externen Anbieter angebunden wird.

**Optionen:**

| Option | Beschreibung | Vorteile | Nachteile |
|---|---|---|---|
| **A – Echter Zahlungsdienstleister** | Anbindung z. B. an Stripe oder PayPal. | Realistischer Ablauf | Finanzregulatorische Anforderungen, hoher Aufwand für ein Uni-Projekt |
| **B – Simulierte Zahlung (2 Modi)** | Simulation ohne Geldfluss oder Verrechnung über In-App-Guthaben. | Kein regulatorischer Aufwand, einfach umzusetzen | Kein echter Zahlungsfluss |

**Entscheidung:** Option B – simulierte Zahlung.

**Begründung:** Für den experimentellen Rahmen des Projekts ist keine echte Finanzregulatorik nötig; die Simulation reicht aus, um den Ablauf zu demonstrieren.

---

## ADR-007: Private Chats ohne Admin-Zugriff

**Status:** Angenommen

**Kontext:** Es musste festgelegt werden, ob Administratoren generellen Zugriff auf alle Chat-Konversationen haben.

**Optionen:**

| Option | Beschreibung | Vorteile | Nachteile |
|---|---|---|---|
| **A – Voller Admin-Zugriff** | Admins können alle Konversationen einsehen. | Einfachere Moderation | Erheblicher Eingriff in die Privatsphäre |
| **B – Kein genereller Zugriff** | Admins sehen Konversationen nur bei gemeldeten Chats mit Einwilligung. | Datenschutz gewahrt | Eingeschränkte Moderationsmöglichkeiten |

**Entscheidung:** Option B – kein genereller Zugriff.

**Begründung:** Datenschutz hat Vorrang; Moderation erfolgt ausschließlich über gemeldete Konversationen mit Einwilligung des Meldenden.

---

## ADR-008: Socket.io für Echtzeit-Chat

**Status:** Angenommen

**Kontext:** Für die Echtzeit-Übertragung von Chat-Nachrichten wurde eine WebSocket-Lösung benötigt.

**Optionen:**

| Option | Beschreibung | Vorteile | Nachteile |
|---|---|---|---|
| **A – Natives WebSocket-API** | Direkte Nutzung der Browser-WebSocket-API ohne Bibliothek. | Keine zusätzliche Abhängigkeit | Kein automatisches Fallback, kein Raum-Konzept, mehr Eigenimplementierung nötig |
| **B – Socket.io** | Etablierte WebSocket-Abstraktion mit Räumen und Fallback-Mechanismen. | Robuste Abstraktion, Räume für Konversationen, automatischer Fallback | Zusätzliche Abhängigkeit |

**Entscheidung:** Option B – Socket.io.

**Begründung:** Socket.io bietet eine robuste WebSocket-Abstraktion mit Räumen (für einzelne Konversationen) und Fallback-Mechanismen, die eine Eigenimplementierung nicht ohne Weiteres leisten würde.

---

## ADR-009: Monorepo mit Feature-Branch-Workflow

**Status:** Angenommen

**Kontext:** Für die Versionsverwaltung im Team musste ein Repository-Aufbau und Workflow festgelegt werden.

**Optionen:**

| Option | Beschreibung | Vorteile | Nachteile |
|---|---|---|---|
| **A – Mehrere Repositories** | Frontend und Backend in getrennten Repositories. | Unabhängige Versionierung | Koordination zwischen Repos bei Änderungen aufwendiger |
| **B – Monorepo + Feature-Branch-Workflow** | Ein gemeinsames Repository, Änderungen über Feature-Branches und Pull Requests mit Squash-Merge. | Gemeinsame Versionierung, revertierbare Features, übersichtlicher Verlauf | Größeres Repository |

**Entscheidung:** Option B – Monorepo mit Feature-Branch-Workflow.

**Begründung:** Ein gemeinsames Repository vereinfacht die Versionierung im Team; Squash-Merge-Pull-Requests halten den Commit-Verlauf übersichtlich und einzelne Features sind bei Bedarf revertierbar.

---

## ADR-010: Deployment auf Vercel / Render / Neon

**Status:** Angenommen

**Kontext:** Für den Betrieb von Frontend, Backend und Datenbank musste eine für ein studentisches Projekt geeignete Hosting-Lösung gefunden werden.

**Optionen:**

| Option | Beschreibung | Vorteile | Nachteile |
|---|---|---|---|
| **A – Eigener Server** | Selbst verwalteter Server für alle Komponenten. | Volle Kontrolle | Kosten, Wartungsaufwand, für Projektumfang unverhältnismäßig |
| **B – Vercel / Render / Neon (kostenlose Tarife)** | Frontend auf Vercel, Backend auf Render, Datenbank auf Neon. | Kostenlos, einfache Anbindung, kein Server-Management | Render-Free-Tier hat Kaltstart nach Inaktivität |

**Entscheidung:** Option B – Vercel / Render / Neon.

**Begründung:** Die kostenlosen Tarife ermöglichen einfachen Betrieb ohne eigene Serververwaltung, passend zum studentischen Rahmen des Projekts. Der gelegentliche Kaltstart bei Render wird in Kauf genommen.