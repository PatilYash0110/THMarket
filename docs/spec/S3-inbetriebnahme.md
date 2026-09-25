# S3 Inbetriebnahme

Die Inbetriebnahme beschreibt den Übergang von THMarket aus der Entwicklungs- in die produktive Nutzung durch THM-Studierende. Da reale Nutzerkonten, Inserate und Guthabenstände entstehen, sobald das System freigegeben wird, folgt die Einführung einem gestuften Vorgehen. Als Einzelprojekt ohne separate Staging-Infrastruktur (es existiert nur die eine produktive Umgebung aus Vercel-Frontend, Render-Backend und einer Neon-Datenbank) fallen die Stufen „Testen" und „Vorschau" bewusst schlanker aus:

### Stufen

1. Implementierung nötiger Zahlungsfunktionen
2. **Interner Funktionstest:** Alle 14 Use Cases werden lokal gegen eine mit Seed-Skript befüllte Datenbank durchgespielt, inklusive des per Seed-Skript angelegten Admin-Kontos.
3. **Vorschau-Deployment:** Vercel erzeugt für jeden Push automatisch eine Preview-Umgebung des Frontends, sie läuft gegen dasselbe Backend/dieselbe Datenbank wie die Produktivumgebung, da kein separater Render- oder Neon-Staging-Dienst eingerichtet ist. Diese Stufe prüft daher UI-Änderungen, nicht das Zusammenspiel mit den externen Diensten unter isolierten Bedingungen.
4. **Beta-Phase:** Eine kleine Gruppe verifizierter THM-Studierender erhält Zugang zur Produktivumgebung, um Usability-Feedback zu sammeln und bislang unentdeckte Fehler zu erfassen, bevor die Plattform breiter beworben wird.
5. **Produktivfreigabe:** Öffnung für alle Studierenden mit gültiger `@thm.de`-Adresse.

### Vor dem Produktivstart geprüfte Fehlerszenarien

- Nicht erreichbare oder fehlerhafte Antworten von Cloudinary, Gemini oder Gmail SMTP.
- Ungültige oder abgelaufene Verifizierungs- bzw. Passwort-Reset-Links (siehe UC01, UC03).
- Gleichzeitiger Zugriff auf dasselbe Inserat, etwa wenn zwei Nutzer nahezu zeitgleich einen Kauf abschließen wollen (siehe die zweite serverseitige Guthabenprüfung in UC08 bzw. UC10).
- Darstellung auf unterschiedlichen Endgeräten (Desktop/Mobil), da THMarket ausschließlich browserbasiert und nicht als native App verfügbar ist.

### Absichernde Maßnahmen

- Fail-open-Verhalten bei der Bildmoderation, damit ein Ausfall von Gemini das Erstellen von Inseraten nicht komplett blockiert (NFA-06).
- Klare, feldspezifische Fehlermeldungen mit Nutzerführung statt generischer Fehlertexte.
- Idempotente Prüfungen bei sicherheitsrelevanten Abläufen, etwa die erneute Guthabenprüfung unmittelbar vor der Verrechnung beim Kauf.
- Audit-Log zur nachträglichen Analyse von Admin-Aktionen und protokollierten Ausfällen externer Dienste.

Der „Point of no Return" ist mit der Produktivfreigabe für alle THM-Studierenden erreicht. Ab diesem Zeitpunkt existieren reale Nutzerkonten, Inserate und Guthabenstände in derselben Datenbank, die auch während der Entwicklung genutzt wurde, sodass tiefgreifende Änderungen am Datenbankschema nur noch mit Migrationsaufwand und nicht mehr durch einfaches Zurücksetzen der Datenbank möglich sind.

Nach dem Go-Live schließt sich eine Beobachtungsphase an, in der insbesondere die Fehlerraten der drei externen Dienste, die Ladezeit der Inseratübersicht (NFA-01) sowie die Audit-Log-Einträge zu fehlgeschlagenen Bildmoderationen beobachtet werden. So lassen sich Probleme frühzeitig erkennen und beheben, ohne die grundsätzliche Verfügbarkeit der Plattform zu gefährden.
