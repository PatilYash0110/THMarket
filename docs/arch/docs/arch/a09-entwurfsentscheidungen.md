# 9. Entwurfsentscheidungen

| Entscheidung | Gründe / Konsequenzen / Alternativen |
|---|---|
| Modularer Monolith (NestJS) | Angemessen für den Projektumfang; einfacher Betrieb, Alternative Microservices: unnötiger Overhead. |
| Fachliche Module in technischem Rahmen | Klare Verantwortlichkeiten (fachliche Module) plus wiederverwendbare technische Schichten (API Edge, Persistence, Common). |
| Prisma statt TypeORM | Bessere Migrations- und Typ-Erfahrung; klare Trennung von Datenmodell und SQL. |
| Prisma-Generator „prisma-client-js“ | Prisma 7 nutzt standardmäßig einen neuen Generator mit eigenem Output-Pfad, was Import-/Typprobleme verursachte; die klassische Variante ist stabil. |
| KI nur für Beschreibung | Preisschätzung aus Bildern ist unzuverlässig; nur Titel, Beschreibung und Kategorie. |
| Simulierte Zahlung (2 Modi) | Experimenteller Rahmen; keine Finanzregulatorik nötig. |
| Private Chats ohne Admin-Zugriff | Datenschutz; Moderation nur über gemeldete Konversationen mit Einwilligung. |
| Socket.io für Echtzeit-Chat | Robuste WebSocket-Abstraktion mit Räumen und Fallbacks. |
| Monorepo + Feature-Branch-Workflow | Gemeinsame Versionierung; revertierbare Features via Squash-Merge-PR. |
| Deployment Vercel / Render / Neon | Kostenlose Tarife; einfache Anbindung an das Monorepo. |

*Tabelle 21: Entwurfsentscheidungen*
