# S1 – Nachbarsysteme

S1 beschreibt die Schnittstellen zwischen THMarket und externen Nachbarsystemen. THMarket greift auf drei externe Dienste zurück, um Kernfunktionen wie E-Mail-Versand, Bildspeicherung und KI-gestützte Beschreibungsvorschläge/Bildmoderation umzusetzen. Diese Dienste sind aus Sicht von THMarket Nachbarsysteme. Das System kommuniziert lose gekoppelt mit ihnen, hat aber keinen Einfluss auf deren Verfügbarkeit oder Weiterentwicklung.

### Google Gemini (`@google/genai`)

| Attribut | Beschreibung |
|---|---|
| **Zweck** | Automatischer Beschreibungsvorschlag beim Erstellen eines Inserats (UC04) sowie Inhaltsprüfung hochgeladener Fotos auf unangemessene Inhalte. |
| **Zugriffsart** | REST-Aufruf über das offizielle SDK `@google/genai`, ausschließlich serverseitig aus dem NestJS-Backend heraus. |
| **Datenformat** | JSON-Request mit Titel/Kategorie/Hinweistext sowie Bilddaten. JSON-Response mit generiertem Beschreibungstext bzw. Moderationsergebnis. |
| **Authentifizierung** | API-Key, serverseitig als Umgebungsvariable verwaltet. |
| **Fehlerverhalten** | Ist der Dienst nicht erreichbar oder liefert einen Fehler, wird der Upload dennoch zugelassen und der Ausfall im Audit-Log vermerkt, statt das Erstellen von Inseraten zu blockieren. Beim Beschreibungsvorschlag bleibt bei einem Fehlschlag die manuelle Eingabe uneingeschränkt möglich. |

### Cloudinary

| Attribut | Beschreibung |
|---|---|
| **Zweck** | Persistente Speicherung und Auslieferung von Inseratbildern (UC04, UC05). |
| **Zugriffsart** | REST-Upload über das offizielle Cloudinary-Node-SDK, ausschließlich serverseitig, der Client lädt nie direkt zu Cloudinary hoch. |
| **Datenformat** | `multipart/form-data` beim Upload. JSON-Response mit der dauerhaften Bild-URL, die im Feld `LISTING.images` gespeichert wird. |
| **Authentifizierung** | API-Key und API-Secret, serverseitig verwaltet. |
| **Fehlerverhalten** | Schlägt der Upload fehl, wird das Inserat nicht gespeichert, da `images` ein Pflichtfeld mit 1–6 Einträgen ist, daher wird dem Nutzer eine Fehlermeldung angezeigt. |

### Gmail SMTP

| Attribut | Beschreibung |
|---|---|
| **Zweck** | Versand von Verifizierungs-E-Mails (UC01) und Passwort-Reset-E-Mails (UC03). |
| **Zugriffsart** | SMTP-Protokoll mit App-Passwort-Authentifizierung, angesteuert aus dem Backend über `nodemailer`. |
| **Datenformat** | Inhalte werden serverseitig aus Textbausteinen zusammengesetzt. |
| **Authentifizierung** | Google-App-Passwort, serverseitig als Umgebungsvariable hinterlegt. |
| **Fehlerverhalten** | Der Datenbankeintrag (neues Konto bei UC01, Reset-Token bei UC03) wird angelegt, bevor der Mailversand ausgelöst wird; schlägt `sendMail` fehl, bricht die Anfrage mit einer Serverfehlermeldung ab, der zuvor angelegte Datensatz bleibt aber bestehen. Ist `GMAIL_USER`/`GMAIL_APP_PASSWORD` nicht gesetzt (z. B. in einer lokalen Entwicklungsumgebung), wird gar keine E-Mail versendet, sondern der Link nur serverseitig geloggt. |
