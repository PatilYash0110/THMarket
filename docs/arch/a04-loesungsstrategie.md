# A04. Lösungsstrategie


Die wichtigsten Architekturentscheidungen wurden so getroffen, dass sich THMarket im Rahmen eines Einzelprojekts schnell umsetzen lässt, sicher ist, zuverlässig läuft und sich später noch erweitern lässt.

**Grundlegende Entscheidungen**

- **Modulare Softwarearchitektur mit fachlich orientierten NestJS-Modulen:** Das Backend besteht aus fünf fachlichen Kernmodulen (Auth, Listings, Wallet, Chat, Admin) und drei Integrationsmodulen (Mail, Cloudinary, Gemini), die jeweils genau einen externen Dienst kapseln. Jedes Modul greift für seine Daten auf eine zentrale, global bereitgestellte `PrismaModule`-Verbindung zu.
- **Frontend und Backend getrennt:** Das Frontend ist ein eigenständiges Deployment und kommuniziert ausschließlich über REST-API und WebSockets mit dem Backend. Dadurch gibt es keinen direkten Zugriff auf Datenbank oder externe Dienste.
- **Externe Dienste hinter eigenen Adapter-Modulen:** Gmail SMTP, Cloudinary und Gemini werden nie direkt aus einem fachlichen Modul angesprochen, sondern über je ein schlankes Modul. Nur die Module, die sie brauchen, importieren sie — so bleibt jede Abhängigkeit nach außen an genau einer Stelle sichtbar.

**Wie die Qualitätsziele erreicht werden**

| Qualitätsziel | Umsetzung |
|---|---|
| Benutzerfreundlichkeit | Klare, deutschsprachige Oberfläche. Die KI-gestützte Beschreibungserstellung reduziert den Tippaufwand beim Erstellen eines Inserats. |
| Performance | Suche und Filter laufen clientseitig auf der einmalig geladenen Inseratliste. Der Chat läuft über eine dauerhafte WebSocket-Verbindung. |
| Sicherheit | JWT-Authentifizierung mit serverseitiger Prüfung der THM-Domain, Passwörter gehasht, Chats privat, kein genereller Admin-Zugriff, Rate-Limiting schützt sensible Routen. |
| Robustheit | Fällt Gemini aus, bricht das Erstellen eines Inserats nicht ab, eine fehlgeschlagene Bildmoderation lässt den Upload durch und wird im Audit-Log vermerkt. |
| Erweiterbarkeit | Durch die klare fachliche Trennung lässt sich jedes Kernmodul einzeln erweitern, ohne die anderen anzufassen. |

*Umsetzung der Qualitätsziele in der Architektur*

