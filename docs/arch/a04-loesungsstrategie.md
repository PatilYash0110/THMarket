# 4. Lösungsstrategie

Die wichtigsten Architekturentscheidungen wurden so getroffen, dass sich THMarket schnell umsetzen lässt, sicher ist, zuverlässig läuft und sich später noch erweitern lässt.

**Grundlegende Entscheidungen:**

- **Fachlich getrennte Module:** Das Backend ist in fünf fachliche Module aufgeteilt — User Management, Inserat Management, Kommunikation, Transaktion Management und Admin Management (siehe Kapitel 5). Jedes Modul ist für seinen eigenen fachlichen Bereich zuständig und greift für seine Daten auf eine zentrale Datenbank zu, statt dass mehrere Module wild auf dieselben Tabellen zugreifen.
- **Frontend und Backend getrennt:** Das Frontend ist ein eigenständiges Deployment und redet ausschließlich über REST-API und WebSockets mit dem Backend — es hat keinen direkten Zugriff auf die Datenbank oder auf externe Dienste.
- **Externe Dienste als eigene Bausteine:** Gmail SMTP, Cloudinary, die Google Gemini API und die Neon-PostgreSQL-Datenbank sind klar abgegrenzte externe Bausteine. Nur die Module, die sie wirklich brauchen, sprechen direkt mit ihnen (z. B. nur Inserat Management mit Cloudinary und Gemini) — so bleibt sichtbar, an welchen Stellen THMarket von außen abhängig ist.

**Wie die Qualitätsziele erreicht werden:**

| Qualitätsziel | Umsetzung |
|---|---|
| Benutzerfreundlichkeit | Klare, deutschsprachige Oberfläche; die KI-gestützte Beschreibungserstellung reduziert den Tippaufwand beim Erstellen eines Inserats deutlich. |
| Performance | Suche und Filter laufen serverseitig direkt in der Datenbank, nicht im Frontend; der Chat läuft über eine dauerhafte WebSocket-Verbindung statt ständigem Nachfragen (Polling), damit Nachrichten ohne spürbare Verzögerung ankommen. |
| Sicherheit & Datenschutz | JWT-Authentifizierung mit Prüfung der THM-E-Mail-Domain (`.thm.de`); Passwörter werden gehasht, nie im Klartext gespeichert; Chats sind privat, der Admin hat standardmäßig keinen generellen Zugriff darauf; hochgeladene Bilder werden von EXIF-Metadaten befreit; Rate-Limiting schützt vor Missbrauch der Endpunkte. |
| Robustheit | Fällt die Gemini-API aus oder antwortet nicht rechtzeitig, bricht das Erstellen eines Inserats trotzdem nicht ab — der Nutzer kann die Beschreibung dann einfach manuell eingeben, statt auf die KI angewiesen zu sein. |
| Erweiterbarkeit | Durch die klare fachliche Trennung der fünf Module lässt sich jedes Modul einzeln erweitern oder ändern, ohne die anderen anzufassen — z. B. könnte man Admin Management um neue Maßnahmen erweitern, ohne User Management oder Inserat Management zu verändern. |