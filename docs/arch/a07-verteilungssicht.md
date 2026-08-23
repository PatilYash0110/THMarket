# 7. Verteilungssicht

Die Softwarebausteine werden auf verschiedene Infrastruktur-Komponenten verteilt.

> **Abbildung 17 – hier Mermaid-Screenshot einfügen**  
> *Quelle: `abb17_verteilungssicht.mmd`*

*Abbildung 17: Verteilungssicht*

## 7.1 Infrastruktur Ebene 1

- **Endgerät:** Browser der Studierenden (Darstellung des React/Vite-Frontends).
- **Vercel:** Auslieferung des statischen Frontends.
- **Render:** Betrieb des NestJS-Backends (Node.js).
- **Neon:** PostgreSQL-Datenbank in der Cloud.
- **Externe Dienste:** Cloudinary, Google Gemini, Gmail SMTP – über standardisierte Schnittstellen angebunden.

## 7.2 Infrastruktur Ebene 2

- **Endgerät ↔ Vercel/Render:** HTTPS bzw. WSS (WebSocket über TLS).
- **Render ↔ Neon:** verschlüsselte SQL-Verbindung (TLS) über Prisma.
- **Render ↔ Cloudinary / Google Gemini:** HTTPS.
- **Render ↔ Gmail SMTP:** SMTP.

**Hinweis:** Der Render-Free-Tier kann nach Inaktivität einen Kaltstart verursachen (erste Anfrage verzögert).
