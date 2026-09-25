# F3 Anwendungsfunktionen

Dieser Abschnitt beschreibt Funktionen, die für den Betrieb von THMarket notwendig sind, aber kein eigenständiges Nutzerziel darstellen. Sie laufen im Hintergrund und unterstützen die im vorherigen Kapitel beschriebenen Use Cases.

### 1. E-Mail-Verifizierung

Bei der Registrierung (UC01) erzeugt das System einen zeitlich begrenzten Verifizierungslink und löst über den externen SMTP-Dienst eine Bestätigungs-E-Mail aus. Erst nach Aufruf des Links gilt das Konto als verifiziert und ist login-fähig. Läuft der Link ab oder kommt die E-Mail nicht an, kann ein neuer Link angefordert werden. Derselbe Mechanismus wird für den Passwort-Reset-Link in UC03 verwendet.

### 2. Bildverarbeitung

Beim Erstellen oder Bearbeiten eines Inserats (UC04, UC05) werden ausgewählte Fotos vor dem Hochladen clientseitig komprimiert, bevor sie an Cloudinary übertragen werden. Cloudinary liefert die endgültige, dauerhaft nutzbare Bild-URL zurück. Jedes hochgeladene Foto wird zusätzlich einzeln über Gemini auf unangemessene Inhalte geprüft. Ist der Dienst nicht erreichbar oder liefert einen Fehler, wird der Upload dennoch zugelassen und der Ausfall als Eintrag im Audit-Log vermerkt, statt das Erstellen von Inseraten komplett zu blockieren (siehe NFA-06).

### 3. Echtzeit-Nachrichtenzustellung

Der Chat (UC07) basiert auf Socket.io. Eine gesendete Nachricht wird zunächst in der Datenbank gespeichert und anschließend über eine ereignisgesteuerte Verbindung an den Empfänger zugestellt. Ist der Empfänger die Konversation gerade nicht geöffnet, springt sie in seiner Konversationsliste nach oben, ist er offline, sieht er die Nachricht beim nächsten Öffnen der Konversation. Bei einem Verbindungsabbruch versucht das System automatisch, die Verbindung wiederherzustellen.

### 4. Sitzungs- und Zugriffsverwaltung

Nach dem Login (UC02) wird ein Zugriffstoken ausgestellt, das Identität und Rolle des Nutzers trägt. Anhand der Rolle entscheidet das Frontend, ob der Marktplatz oder der Admin-Bereich angezeigt wird, und das Backend, welche Endpunkte erreichbar sind. Geschützte Bereiche sind ohne gültiges Token nicht erreichbar.

### 5. Automatischer Beschreibungsvorschlag

Beim Erstellen eines Inserats (UC04) kann auf Basis der hochgeladenen Fotos sowie Titel/Kategorie/optionalem Hinweis ein Beschreibungsvorschlag über Gemini erzeugt werden. Der Vorschlag wird dem Nutzer zur Bearbeitung angezeigt und muss nicht unverändert übernommen werden. Schlägt die Anfrage fehl, bleibt die manuelle Eingabe uneingeschränkt möglich.

### 6. Mock-Kauf und Guthaben-Verwaltung

Beim Kaufabschluss (UC08) wählt der Käufer zwischen zwei simulierten Zahlungsmodi: Simulation (feste Testkartennummern, kein Geldfluss) oder In-App-Guthaben. In beiden Fällen wird das Inserat als verkauft markiert und beim Guthaben-Modus wird der Betrag vom Käufer abgebucht und dem Verkäufer gutgeschrieben. Aufladen und Auszahlen (UC09, UC10) folgen demselben Simulationsprinzip. Eine echte Zahlungsabwicklung findet zu keinem Zeitpunkt statt.
