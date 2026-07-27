# F3 Anwendungsfunktionen

In diesem Abschnitt werden Funktionen beschrieben, die für den Betrieb von THMarket wesentlich sind, aber keine eigenständigen Benutzerziele darstellen. Sie unterstützen die Anwendungsfälle durch interne Abläufe, automatische Prüfprozesse oder technische Logiken.

### 1. E-Mail-Verifizierung

Bei der Registrierung erzeugt das System einen zeitlich begrenzten Verifizierungstoken und versendet über den externen E-Mail-/SMTP-Dienst eine Bestätigungs-E-Mail mit einem Link. Erst nach Aufruf des Links wird das Konto als verifiziert markiert und für die Anmeldung freigeschaltet. Nicht bestätigte Konten bleiben inaktiv. Wurde die E-Mail nicht zugestellt oder ist der Link abgelaufen, kann ein neuer Verifizierungslink angefordert werden.

### 2. Bildverarbeitung und -speicherung

Beim Erstellen eines Inserats werden hochgeladene Bilder auf zulässiges Format und Größe geprüft und gegebenenfalls komprimiert. Die Bilddateien werden im vorgesehenen Speicher abgelegt; ihre Speicherpfade und die Zuordnung zum jeweiligen Inserat werden in der Datenbank gespeichert. Jedem Inserat können mehrere Bilder zugeordnet werden.

### 3. Echtzeit-Nachrichtenzustellung

Der Chat basiert auf Socket.io. Eingehende Nachrichten werden über eine bidirektionale Verbindung ereignisgesteuert an die beteiligten Nutzer zugestellt und gleichzeitig persistiert. So bleiben Nachrichten auch nach dem Neuladen der Seite verfügbar. Bei einem Verbindungsabbruch versucht das System, die Verbindung automatisch wiederherzustellen.

### 4. Sitzungs- und Zugriffsverwaltung

Nach dem Login wird eine Sitzung verwaltet, die die Zugriffsrechte des Nutzers bestimmt. Geschützte Bereiche (Marktplatz, Chat, Adminbereich) sind nur für angemeldete bzw. berechtigte Nutzer erreichbar.
