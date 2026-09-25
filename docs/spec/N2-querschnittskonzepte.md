# N2 — Querschnittskonzepte

Querschnittskonzepte (Siedersleben, Kap. 4.7): einheitliche Strategien für Belange, die das System als Ganzes betreffen und von mehreren Bausteinen referenziert, aber nie dort definiert werden. Die Strategie eines Belangs zu ändern ist eine einzige Bearbeitung hier.

## Konzepte

| ID | Konzept | Strategie (Kurzfassung) | Betrifft |
|----|---------|-------------------------|----------|
| N2.2 | Zugang, Authentifizierung & Sitzung | Nur verifizierte `@thm.de`-Konten, Sitzung als einheitliches Tor vor jeden angemeldeten Anwendungsfall, kein UC prüft selbst nach. | [UC01](F2-anwendungsfaelle.md), [UC02](F2-anwendungsfaelle.md), [F3](F3-anwendungsfunktionen.md), [NFA-02](N1-nichtfunktional.md), [NFA-03](N1-nichtfunktional.md) |
| N2.3 | Rollen & Zugriffskontrolle | Vier Akteursstufen (Gast, Nutzer, eingeloggt, Admin), Aktion an Rolle und Eigentümerschaft gebunden, Prüfung nach dem Tor, vor der Wirkung. | [F1](F1-geschaeftsprozesse.md), [UC09](F2-anwendungsfaelle.md), [UC10](F2-anwendungsfaelle.md), [UC11](F2-anwendungsfaelle.md) |
| N2.4 | Eingabevalidierung | Strikt und wertelisten-/schemagetrieben (D2), geprüft an der Eingabegrenze, client- und serverseitig, vor jeder Persistierung. | [UC03](F2-anwendungsfaelle.md), [UC09](F2-anwendungsfaelle.md), [D2](D2-datentypenverzeichnis.md), [B1](B1-dialogspezifikation.md) |
| N2.5 | Fehlerbehandlung & Ausfallverhalten | Synchron, bei Fehler bleibt der Status stehen, KI-Dienst fail-open, zwingende Dienste melden klar, Wiederholen ist eine bewusste Nutzeraktion. | [NFA-07](N1-nichtfunktional.md), [S1.3](S1-nachbarsysteme.md), [UC03](F2-anwendungsfaelle.md), [UC12](F2-anwendungsfaelle.md) |
| N2.6 | Datenschutz & Vertraulichkeit | Chats privat (Admin nur im Meldungskontext), Datenminimierung, Standort-Metadaten der Bilder entfernt, Impressum. | [UC07](F2-anwendungsfaelle.md), [UC11](F2-anwendungsfaelle.md), [S1.4](S1-nachbarsysteme.md), [NFA-06](N1-nichtfunktional.md) |
| N2.7 | Sicherheit & Geheimnisverwaltung | Passwörter nur gehasht, Geheimnisse ausschließlich serverseitig, missbrauchsanfällige Aktionen ratenbegrenzt. | [NFA-02](N1-nichtfunktional.md), [NFA-03](N1-nichtfunktional.md), [S1.3](S1-nachbarsysteme.md) |
| N2.8 | Bild- & Inhaltsprüfung | Fotos komprimiert, moderiert, extern gespeichert, nur URLs verbleiben, feste Anzahl-/Größengrenzen, Metadaten entfernt. | [UC03](F2-anwendungsfaelle.md), [F3](F3-anwendungsfunktionen.md), [S1.2b NB-02](S1-nachbarsysteme.md), [NFA-05](N1-nichtfunktional.md) |
| N2.9 | Zahlungssimulation & Guthaben | Kein echter Geldfluss, Testkarte oder In-App-Guthaben, beide mit denselben Prüfungen, Guthaben serverseitig verrechnet. | [UC12](F2-anwendungsfaelle.md), [F3](F3-anwendungsfunktionen.md), [D2 *Transaktion*](D2-datentypenverzeichnis.md), [P1 §1.3](P1-ziele-rahmenbedingungen.md) |
