# P2 Architekturüberblick

## P2.1 Systemkontext

THMarket besteht aus einem React/Vite-Frontend (Vercel) und einem NestJS-Backend (Render) mit einer PostgreSQL-Datenbank (Neon, über Prisma angebunden). Für drei Aufgaben werden externe Dienste angebunden: Versand von Verifizierungs- und Reset-E-Mails (Gmail SMTP), Speicherung von Inseratbildern (Cloudinary) und automatische Beschreibungsvorschläge sowie Bildmoderation (Google Gemini). Die Datenbank ist kein externes Nachbarsystem, sondern Teil von THMarket selbst, und wird deshalb hier nicht als eigener Akteur dargestellt.

*Abbildung 1: Systemkontextdiagramm von THMarket*

<details>
<summary>Diagramm anzeigen</summary>

```mermaid
graph TD
    Student["«person»<br/><b>Student</b><br/><br/>Verifizierter THM-Student,<br/>Browser (Desktop/Mobil)"]
    Admin["«person»<br/><b>Administrator</b><br/><br/>Seeded Admin-Konto,<br/>moderiert die Plattform"]

    THMarket["«system»<br/><b>THMarket</b><br/><br/>Campus-Marktplatz<br/>exklusiv für THM-Studierende"]

    Gemini["«externe_dienste»<br/><b>Google Gemini</b><br/><br/>KI-Beschreibung,<br/>Bild-Inhaltsmoderation"]
    Cloudinary["«externe_dienste»<br/><b>Cloudinary</b><br/><br/>Bild-Hosting für<br/>Inserats-Fotos"]
    Mail["«externe_dienste»<br/><b>Gmail SMTP</b><br/><br/>Verifizierungs- und<br/>Reset-E-Mails"]

    Student -->|"Nutzt Plattform<br/>[HTTPS, Session-Cookie]"| THMarket
    Admin -->|"Moderiert Plattform<br/>[HTTPS, Session-Cookie]"| THMarket

    THMarket -->|"Beschreibung + Moderation<br/>[HTTPS, API-Key]"| Gemini
    THMarket -->|"Bild-Upload<br/>[HTTPS, API-Key]"| Cloudinary
    THMarket -->|"E-Mail-Versand<br/>[SMTP, App-Passwort]"| Mail

    classDef person fill:#1e3a5f,stroke:#1e3a5f,color:#ffffff
    classDef system fill:#2563eb,stroke:#2563eb,color:#ffffff
    classDef external fill:#6b7280,stroke:#6b7280,color:#ffffff

    class Student,Admin person
    class THMarket system
    class Gemini,Cloudinary,Mail external
```

</details>

*(Mermaid-Quelldatei: [`diagrams-code/p2-systemkontext.mermaid`](diagrams-code/p2-systemkontext.mermaid))*

## P2.2 Technischer Rahmen

| Baustein | Technologie |
|---|---|
| Frontend | React 19, Vite, TypeScript, React Router, Deployment: Vercel |
| Backend | NestJS 11, Deployment: Render |
| Datenbank | PostgreSQL (Neon), Zugriff über Prisma 6 |
| Echtzeit-Chat | Socket.io v4 |
| Bildspeicher | Cloudinary |
| KI-Beschreibung/-Moderation | Google Gemini (`@google/genai`) |
| E-Mail-Versand | Gmail SMTP |
