# S3 – Inbetriebnahme

Die Inbetriebnahme beschreibt den Übergang der Anwendung von der Entwicklung in die Nutzung durch Studierende. Da THMarket eine Neuentwicklung ist, ist keine Ablösung eines Vorgängersystems und kein Parallelbetrieb mit einem Altsystem erforderlich.

Nach aktuellem Stand ist ein gestuftes Vorgehen vorgesehen:

1. interner Funktionstest durch das Projektteam,
2. Beta-Phase mit ausgewählten THM-Studierenden,
3. Auswertung des Feedbacks und Behebung wesentlicher Fehler,
4. abschließender Systemtest,
5. Freischaltung der Anwendung für den vorgesehenen Nutzerkreis.

## S3.1 Voraussetzungen für die Inbetriebnahme

Vor der Inbetriebnahme sollen mindestens folgende Voraussetzungen erfüllt sein:

- Das React-Frontend und das Backend sind lauffähig.
- Eine PostgreSQL-Datenbank ist eingerichtet und erreichbar.
- Die Verbindung zwischen Frontend, Backend und Datenbank funktioniert.
- Der E-Mail-/SMTP-Dienst ist für den Versand von Verifizierungs-E-Mails konfiguriert.
- Der Bildspeicherdienst ist für den Bild-Upload konfiguriert.
- Der KI-Beschreibungsdienst ist für den Beschreibungsvorschlag konfiguriert.
- Socket.io ist für die Chat-Kommunikation eingerichtet.
- Die wesentlichen Funktionen der Anwendung wurden getestet.
- Vertrauliche Zugangsdaten sind nicht öffentlich im Repository gespeichert.

Die konkrete Hosting- und Deployment-Umgebung wird im weiteren Projektverlauf festgelegt.

## S3.2 Zu erhaltende Daten

Bei späteren Änderungen oder Aktualisierungen der Anwendung sollen bereits gespeicherte Nutzerdaten erhalten bleiben. Dazu gehören insbesondere:

- Benutzerkonten und Verifizierungsstatus,
- Inserate,
- Bilder beziehungsweise Bildreferenzen,
- Kategorien,
- Favoriten,
- Konversationen,
- Chat-Nachrichten,
- Meldungen und deren Bearbeitungsstatus,
- Transaktionen,
- Bewertungen. 

Die genaue technische Umsetzung der Datensicherung und der Aktualisierung späterer Versionen ist noch festzulegen.

## S3.3 Erstinbetriebnahme

Für die erstmalige Inbetriebnahme ist derzeit folgender grundsätzlicher Ablauf vorgesehen:

1. Technische Voraussetzungen prüfen.
2. PostgreSQL-Datenbank bereitstellen.
3. Das benötigte Datenbankschema anlegen.
4. Notwendige Konfigurationswerte hinterlegen.
5. Backend bereitstellen und Verbindung zur Datenbank prüfen.
6. Frontend bereitstellen und Verbindung zum Backend prüfen.
7. Registrierung und E-Mail-Verifizierung testen.
8. Login und Zugriffsbeschränkungen testen.
9. Erstellen, Suchen und Öffnen von Inseraten testen.
10. Bild-Upload testen.
11. Favoriten und Meldungen testen.
12. Chat-Kommunikation und Nachrichtenspeicherung testen.
13. Verwaltungsfunktionen für Nutzer und Administratoren prüfen.
14. Beta-Phase durchführen.
15. Erkannte Fehler bearbeiten und einen abschließenden Systemtest durchführen.
16. Anwendung für den vorgesehenen Nutzerkreis freischalten.

Die konkrete technische Durchführung der einzelnen Schritte kann sich im weiteren Projektverlauf noch ändern.

## S3.4 Zu prüfende Fehlersituationen

Vor der Freischaltung sollen insbesondere folgende Situationen überprüft werden:

- nicht erreichbarer oder fehlerhaft konfigurierter E-Mail-Dienst,
- nicht erreichbarer oder fehlerhaft konfigurierter Bildspeicherdienst,
- nicht erreichbarer oder fehlerhaft konfigurierter KI-Beschreibungsdienst,
- ungültiger oder abgelaufener Verifizierungslink,
- nicht erreichbare Datenbank,
- Verbindungsabbrüche im Chat,
- ungültige oder zu große Bild-Uploads,
- fehlende oder ungültige Formulareingaben,
- unberechtigte Zugriffe auf geschützte Funktionen,
- Darstellung auf unterschiedlichen Bildschirmgrößen und Endgeräten.

## S3.5 Vorgesehene Maßnahmen

Zur Absicherung sind nach aktuellem Stand folgende Maßnahmen vorgesehen:

- verständliche Fehlermeldungen,
- erneutes Anfordern des Verifizierungslinks,
- automatische Wiederverbindungsversuche im Chat,
- Prüfung von Formulareingaben,
- Prüfung der hochgeladenen Bilder,
- Zugriffskontrolle für geschützte Funktionen,
- responsive Gestaltung der Benutzeroberfläche,
- Protokollierung technischer Fehler zur späteren Analyse.

Die genaue technische Umsetzung dieser Maßnahmen ist teilweise noch offen und wird während der Entwicklung konkretisiert.

## S3.6 Spätere Aktualisierungen

Für spätere Versionen soll sichergestellt werden, dass gespeicherte Nutzerdaten nicht unbeabsichtigt gelöscht oder überschrieben werden.

Ein möglicher grundsätzlicher Ablauf besteht aus:

1. Prüfung des aktuellen Systemzustands,
2. Bereitstellung der neuen Anwendungsversion,
3. gegebenenfalls Anpassung des Datenbankschemas,
4. Prüfung der Verbindungen zu Datenbank und E-Mail-Dienst,
5. Durchführung eines kurzen Funktionstests,
6. Freigabe der neuen Version.

Die konkrete Release-, Sicherungs- und Rollback-Strategie ist noch nicht abschließend festgelegt.

## S3.7 Produktivstart und Rückkehrmöglichkeit

Mit der Freischaltung für die Studierenden beginnt der Produktivbetrieb. Ab diesem Zeitpunkt werden reale Nutzerdaten innerhalb der Anwendung gespeichert.

Die Freischaltung selbst ist kein zwingend irreversibler technischer Schritt. Bei schwerwiegenden Fehlern könnte die Anwendung grundsätzlich wieder vorübergehend deaktiviert werden.

Ein technischer Point of no Return kann insbesondere dann entstehen, wenn später Änderungen an der Datenbank vorgenommen werden, die nicht ohne Weiteres rückgängig gemacht werden können. Wie solche Änderungen abgesichert werden, wird im weiteren Projektverlauf festgelegt.

## S3.8 Beobachtung nach der Freischaltung

Nach der Freischaltung ist eine Beobachtungsphase vorgesehen. Dabei sollen insbesondere folgende Punkte betrachtet werden:

- technische Verfügbarkeit der Anwendung,
- Erreichbarkeit des E-Mail-Dienstes,
- Erreichbarkeit des Bildspeicherdienstes,
- Erreichbarkeit des KI-Beschreibungsdienstes,
- Fehler bei Registrierung und Login,
- Stabilität der Chat-Kommunikation,
- Probleme beim Bild-Upload,
- sonstige technische Fehlermeldungen.

Eine weitergehende Auswertung des Nutzerverhaltens ist in der derzeitigen Spezifikation nicht festgelegt.

## S3.9 Querverweise

- UC01 – Login
- UC02 – Registrierung
- UC03 – Inserat erstellen
- UC07 – Chat mit Nutzer führen
- UC10 – Nutzerkonten verwalten
- UC11 – Meldungen und Inserate moderieren
- P2 – Architekturüberblick
- N1 – Nichtfunktionale Anforderungen