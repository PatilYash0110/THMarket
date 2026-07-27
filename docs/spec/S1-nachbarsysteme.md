# S1 – Nachbarsysteme

S1 beschreibt die Schnittstellen zwischen THMarket und externen Nachbarsystemen. Nach aktuellem Projektstand wird für die Registrierung und Verifizierung ein externer E-Mail-/SMTP-Dienst verwendet.

## S1.1 Allgemeine Festlegungen

Der Mailversand wird durch das FastAPI-Backend ausgelöst. Der E-Mail-Dienst wird ereignisgesteuert verwendet:

- bei der Registrierung eines neuen Nutzers,
- bei einer erneuten Anforderung des Verifizierungslinks.

Verifizierungstokens sollen zeitlich begrenzt und nur für die vorgesehene Verifizierung nutzbar sein. Zugangsdaten zum E-Mail-Dienst dürfen nicht im öffentlich einsehbaren Repository gespeichert werden. Die konkrete Verwaltung der Zugangsdaten wird im weiteren Projektverlauf festgelegt.

## S1.2 NB-01 – E-Mail-/SMTP-Dienst

Der externe E-Mail-/SMTP-Dienst dient dem Versand von Bestätigungs-E-Mails. Über den enthaltenen Verifizierungslink bestätigt der Nutzer seine THM-E-Mail-Adresse. Erst nach erfolgreicher Verifizierung kann das Konto für die Anmeldung verwendet werden.

| Aspekt | Inhalt |
|---|---|
| Nachbarsystem | Externer E-Mail-/SMTP-Dienst |
| Zweck | Versand von E-Mails zur Verifizierung der THM-E-Mail-Adresse |
| Kommunikationsrichtung | Ausgehend vom THMarket-Backend zum E-Mail-Dienst |
| Auslöser | Registrierung oder erneute Anforderung des Verifizierungslinks |
| Eingaben | Empfängeradresse und Verifizierungslink |
| Ergebnis | E-Mail wird versendet oder ein Versandfehler wird gemeldet |
| Betroffener Anwendungsfall | UC02 – Registrierung |
| Kommunikationsfrequenz | Ereignisgesteuert |

## S1.3 Fehlerbehandlung und Sicherheit

Für die Anbindung gelten nach aktuellem Projektstand folgende Anforderungen:

- Ist der E-Mail-Dienst nicht erreichbar, darf die Anwendung nicht abstürzen.
- Der Nutzer soll eine verständliche Fehlermeldung erhalten.
- Ein Benutzerkonto bleibt unverifiziert, bis der Verifizierungslink erfolgreich aufgerufen wurde.
- Kann eine E-Mail nicht zugestellt werden oder ist der Link nicht mehr gültig, soll ein neuer Verifizierungslink angefordert werden können.
- Verifizierungstokens sollen zeitlich begrenzt sein.
- Zugangsdaten zum E-Mail-Dienst dürfen nicht im öffentlichen Repository gespeichert werden.
- An den E-Mail-Dienst sollen nur die für den Versand erforderlichen Daten übermittelt werden.

## S1.4 Abgrenzung der Chat-Kommunikation

Die Echtzeit-Kommunikation des Chats wird über Socket.io realisiert. Dabei handelt es sich um eine bidirektionale und ereignisgesteuerte Verbindung zwischen dem React-Frontend und dem Backend.

Socket.io ist kein externes Nachbarsystem, da sowohl das Frontend als auch das Backend Bestandteile von THMarket sind. Die Verbindung wird hier nur zur Abgrenzung erwähnt. Die konkrete technische Ausgestaltung gehört zur Architektur der Anwendung.

Bei einem Verbindungsabbruch soll der Nutzer informiert werden. Außerdem ist ein automatischer Wiederverbindungsversuch vorgesehen. Nachrichten werden entsprechend der Spezifikation in der PostgreSQL-Datenbank gespeichert und bleiben dadurch auch nach einem erneuten Aufruf des Chats verfügbar.

## S1.5 Nicht Bestandteil von S1

Weitere externe Nachbarsysteme sind für die derzeit beschriebene Version von THMarket nicht vorgesehen.

Insbesondere sind nicht Bestandteil von THMarket:

- Zahlungsabwicklung,
- Versand- oder Logistikanbindung.

## S1.6 Querverweise

- UC02 – Registrierung
- UC07 – Chat mit Nutzer führen
- P2 – Architekturüberblick
- N1 – Nichtfunktionale Anforderungen