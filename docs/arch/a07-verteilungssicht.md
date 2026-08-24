# 7. Verteilungssicht

Die Softwarebausteine werden auf verschiedene Infrastruktur-Komponenten verteilt.

> **Abbildung 17 – hier Mermaid-Screenshot einfügen**  
> *Quelle: `abb17_verteilungssicht.mmd`*

*Abbildung 17: Verteilungssicht*

## 7.1 Infrastruktur Ebene 1

Infrastrukturkomponenten:

- **Clientgeräte:** Smartphones und Laptops/PCs mit Browser; Darstellung des Frontends (React, HTML, CSS, JS).
- **Frontend-Host (Vercel/Netlify):** Auslieferung der statischen React/Vite-Anwendung, kein Sleep.
- **Backend-Host (Render, Free):** NestJS-App mit allen fachlichen Modulen inkl. Socket.io-Gateway; persistenter Web-Service. Hinweis: Der Free-Tarif schläft nach ca. 15 min Inaktivität und benötigt beim Aufwachen 30–50 s (Kaltstart).
- **Datenbankserver (Neon/Supabase):** PostgreSQL mit den Entitäten Benutzer, Inserat, Bild, Kategorie, Favorit, Konversation, Nachricht, Meldung, Transaktion und Bewertung.
- **Externe Dienste:** Gemini-API (KI-Beschreibung), Cloudinary (Bildspeicher), SMTP-Mailserver (Verifizierung) – jeweils eigenständige externe Server, per HTTPS bzw. SMTP angebunden und nicht Teil der eigenen Infrastruktur.

Deployment-Zuordnung der Bausteine:

- Frontend (React, Vite, TS) → Clientgeräte (ausgeliefert über Vercel/Netlify)
- User Management, Inserat Management, Kommunikation, Transaktion Management, Admin Management → Backend-Host (NestJS)
- Datenhaltung → Datenbankserver (PostgreSQL)
- Externe Schnittstellen → externe Dienste (Gemini, Cloudinary, SMTP)

## 7.2 Infrastruktur Ebene 2

- **Endgerät ↔ Vercel/Render:** HTTPS bzw. WSS (WebSocket über TLS).
- **Render ↔ Neon:** verschlüsselte SQL-Verbindung (TLS) über Prisma.
- **Render ↔ Cloudinary / Google Gemini:** HTTPS.
- **Render ↔ Gmail SMTP:** SMTP.

**Hinweis:** Der Render-Free-Tier kann nach Inaktivität einen Kaltstart verursachen (erste Anfrage verzögert).
