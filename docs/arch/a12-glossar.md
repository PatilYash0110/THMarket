# 12. Glossar


| Begriff | Bedeutung |
|---|---|
| Anti-Enumeration | Entwurfsprinzip: identische System-Antwort unabhängig davon, ob ein Konto zu einer E-Mail existiert, um das Erraten registrierter Adressen zu verhindern. |
| Audit-Log | Chronologisches Protokoll aller Admin-Maßnahmen (`AuditLogEntry`). |
| Blackbox | Baustein nur mit Schnittstellen/Verhalten, ohne innere Details. |
| DSGVO | Datenschutz-Grundverordnung. |
| Fail-open | Entwurfsprinzip: Schlägt eine optionale externe Prüfung (z. B. Bildmoderation) fehl, wird die Kernfunktion trotzdem zugelassen statt blockiert. |
| In-App-Guthaben | Simulierter Kontostand eines Nutzers (`balanceCents`) für Mock-Zahlungen. |
| Inserat | Von einem Nutzer erstelltes Verkaufsangebot (Listing). |
| JWT | JSON Web Token zur Authentifizierung; trägt Identität und Rolle des Nutzers. |
| KI-Beschreibung | Von Google Gemini generierter Beschreibungsentwurf aus Fotos, Titel, Kategorie und optionalem Hinweis. |
| Mock | Nachbildung einer Funktion ohne echte externe Anbindung. |
| Prisma | ORM für den typsicheren Datenbankzugriff. |
| Rate-Limiting | Drosselung der Anfragehäufigkeit; im Projekt gezielt auf sensible Endpunkte angewendet (siehe [Kapitel 8.2](A08-cross-cutting-concepts.md#82-sicherheit--datenschutz)). |
| Simulation (Zahlungsmodus) | Kauf per Test-Kreditkarte ohne jeglichen Geldfluss. |
| Sofortkauf | Vom Verkäufer aktivierbare Option; steuert, ob „Kaufen" oder nur „Anbieter kontaktieren" angezeigt wird. |
| Socket.io | Bibliothek für Echtzeit-Kommunikation über WebSockets. |
| SPA | Single Page Application (React-Frontend). |
| Verfeinerungsebene | Detaillierungsgrad der Bausteinsicht (0, 1, 2). |
| Whitebox | Baustein mit seinen inneren Strukturen und Unterbausteinen. |

*Glossar der verwendeten Begriffe*

## Quellen und verwandte Dokumente

**Diagrammquelldateien**

Die 15 Abbildungen dieses Dokuments liegen als PNG (direkt aus dem Original-PDF extrahiert) unter [`docs/arch/diagram_images/`](diagram_images/) vor. Für das im Quelldokument referenzierte Datenmodell wird auf die Mermaid-Quelldatei [`docs/spec/diagrams-code/datenmodell.mmd`](../spec/diagrams-code/datenmodell.mmd) der Spezifikation verwiesen — beide Dokumente teilen sich dasselbe Datenmodell.

**Verwandte Dokumente**

Für die fachliche Spezifikation (Use Cases, Dialoge, Datentypenverzeichnis) siehe die [Spezifikation](../spec/README.md). Dieses Architekturdokument ersetzt inhaltlich die älteren arc42-Bausteine a01–a12, die während der frühen Konzeptphase entstanden und teils nicht umgesetzte Funktionen beschrieben (Bewertungssystem, Inserat-Felder „Zustand"/„Campus", EXIF-/GPS-Entfernung, ein eigenständiges „Transaktion"-Modul). Alle technischen Aussagen dieses Dokuments (Modulstruktur, Routen, Klassennamen, Admin-Aktionen) wurden gegen den Code unter `backend/src` verifiziert.

