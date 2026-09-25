# 1. Einführung und Ziele

THMarket ist eine reine Webanwendung, die ausschließlich Studierenden der Technischen Hochschule Mittelhessen (THM) einen campusinternen Marktplatz für gebrauchte Artikel bietet.

Nur Nutzer mit einer gültigen `@thm.de`-Adresse und anschließender E-Mail-Verifizierung erhalten Zugang zur Plattform. Verifizierte Nutzer können Inserate anlegen, Bilder hochladen, sich mithilfe von KI einen Beschreibungsentwurf erzeugen lassen, Artikel durchsuchen und filtern, Inserate favorisieren, über einen Chat kommunizieren und Käufe über eine simulierte Zahlungsfunktion abwickeln. Ein Melde- und Admin-System unterstützt die Moderation der Plattform.

## 1.1 Anforderungsübersicht

Verifizierte THM-Nutzer können Inserate erstellen und verwalten. Ein Inserat enthält Titel, Beschreibungstext, Kategorie (aus einer festen Werteliste), Preis, ein bis sechs Fotos und die Option, ob ein Sofortkauf möglich ist oder nur eine Kontaktaufnahme. Die Beschreibung kann optional mithilfe von Google Gemini aus den hochgeladenen Fotos und durch den User gegebenen Hinweis vorgeschlagen werden.

Andere Nutzer können Inserate durchsuchen und nach Suchbegriff, Kategorie und Sortierung filtern. Interessante Inserate können als Favoriten gespeichert werden. Über einen Chat können Interessent und Anbieter direkt kommunizieren. Der Kaufabschluss verwendet eine simulierte Zahlungsfunktion mit zwei Modi (Testkarten-Eingabe oder In-App-Guthaben). Administratoren bearbeiten Meldungen zu Inseraten und Nutzern und führen abgestufte Maßnahmen durch.

**Abgrenzung**

THMarket umfasst nach aktuellem Projektstand nicht:

- eine echte Zahlungsabwicklung, Zahlungen werden lediglich simuliert
- eine native App
- einen Offline-Betrieb

Die KI unterstützt ausschließlich die Generierung eines Beschreibungsvorschlags sowie die Inhaltsmoderation hochgeladener Fotos.

## 1.2 Qualitätsziele

| Prio | Ziel | Messkriterium | Nutzen |
|---|---|---|---|
| 1 | Performance | Die Inseratübersicht soll innerhalb von 2 Sekunden ohne spürbare Verzögerung erscheinen. | schnelle, lebendige Nutzung |
| 2 | Robustheit externer Dienste | Bei Timeout/Ausfall von Gemini bleibt das Inserat erstellbar. | verlässlich trotz externer Abhängigkeiten |
| 3 | Sicherheit | Passwörter bcrypt-gehasht, nur verifizierte THM-Konten, API-Schlüssel nie im Client, Chats für Admins ohne Meldungskontext nicht einsehbar. | Schutz von Konten und Daten |
| 4 | Benutzerfreundlichkeit | Inserate in wenigen Schritten inkl. optionaler KI-Unterstützung erstellbar. | niedrige Einstiegshürde |
| 5 | Erweiterbarkeit | Neue Kategorien oder Datenfelder ohne grundlegende Änderungen an bestehenden Modulen ergänzbar. | schnelle Weiterentwicklung |

*Qualitätsziele im Überblick*

## 1.3 Stakeholder

**Nutzende Stakeholder**

| Stakeholder | Ziel / Interesse | Erwartungen an System und Architektur |
|---|---|---|
| Gast (unverifiziert) | Einstieg und Registrierung | klare Navigation, stabiler Registrierungs- und Verifizierungsprozess |
| Verifizierter Nutzer als Käufer | Artikel finden und kaufen | schnelle Suche, zuverlässige Favoriten, einfacher Chat-Kontakt |
| Verifizierter Nutzer als Verkäufer | Artikel inserieren und verkaufen | einfaches Anlegen, KI-Beschreibung, Bild-Upload, Chat- und Kaufverwaltung |
| Administrator | Betrieb und Moderation | sichere Admin-Oberfläche, Meldungsbearbeitung, abgestufte Maßnahmen, Audit-Log |

*Übersicht der nutzenden Stakeholder*

**Projekt-Stakeholder**

| Stakeholder | Ziel / Interesse | Erwartungen an System und Architektur |
|---|---|---|
| Entwickler | Wartung und Erweiterung | klar getrennte Module, verständliche REST-APIs, lokale Einrichtung über Umgebungsvariablen |

*Übersicht der Projekt-Stakeholder*

---

