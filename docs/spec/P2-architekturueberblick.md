# 1.3 Systemkontext

THMarket ist die Vermittlungsplattform zwischen Studierenden der THM. Um die App zu nutzen, muss man sich mit seiner THM-Mail registrieren und den Account über einen Bestätigungslink freischalten. Die Bestätigungsmail dafür verschickt das System über einen externen E-Mail-Dienst (SMTP).

Ist man eingeloggt, kann man Inserate erstellen, durchsuchen und über den Chat mit anderen Nutzern schreiben. Zusätzlich gibt es einen Admin, der Nutzerkonten verwaltet und sich um gemeldete Inserate kümmert.

![Systemkontextdiagramm der THMarket-Anwendung](diagram_images/p2-systemkontextdiagramm.png)

*Abbildung 1: Systemkontextdiagramm der THMarket-Anwendung*

# 1.4 Architekturüberblick

THMarket läuft nach dem Client-Server-Prinzip und besteht aus drei Teilen: Frontend, Backend und Datenbank. Das Frontend ist mit React gebaut und wird über Vite gebündelt — es ist das, was der Nutzer im Browser sieht, und schickt seine Eingaben ans Backend weiter. Das Backend läuft mit NestJS (TypeScript) und kümmert sich um Login, Registrierung, das Anlegen und Suchen von Inseraten, Favoriten, Meldungen sowie Kauf- und Bewertungsfunktionen. Für den Echtzeit-Chat ist innerhalb des Backends zusätzlich Socket.io eingebunden.

Gespeichert wird alles in einer PostgreSQL-Datenbank: Nutzer, Inserate samt Bildern, Kategorien, Favoriten, Konversationen, Chat-Nachrichten, Meldungen, Transaktionen und Bewertungen. Über Socket.io läuft eine WebSocket-Verbindung, sodass Chat-Nachrichten sofort ankommen, ohne dass die Seite neu geladen werden muss.

Wir haben die App modular aufgebaut, damit man später leicht weitere Funktionen oder externe Dienste ergänzen kann. Frontend, Backend und Datenbank sind sauber getrennt, das macht es einfacher, das Projekt später zu warten oder weiterzuentwickeln.

**Verwendete Technologien:**

- **Sprachen:** JavaScript, TypeScript, SQL
- **Frameworks/Bibliotheken:** React, NestJS, Socket.io
- **ORM:** Prisma
- **Datenbank:** PostgreSQL (Neon)
- **Build-Tool:** Vite
- **Externe Dienste:** Cloudinary (Bildspeicher), Google Gemini API (KI-Beschreibung), Gmail SMTP (E-Mail-Verifizierung)

![Architekturüberblick der THMarket-Anwendung](diagram_images/p2-architekturueberblick.png)

*Abbildung 2: Architekturüberblick der THMarket-Anwendung*