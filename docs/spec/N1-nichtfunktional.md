# N1 Nichtfunktionale Anforderungen

Die nichtfunktionalen Anforderungen definieren die Qualitätsmerkmale von THMarket in Bezug auf Leistung, Sicherheit, Benutzerfreundlichkeit und Wartbarkeit.

### NFA-01: Kurze Ladezeit der Inseratübersicht

| Eigenschaft | Beschreibung |
| :--- | :--- |
| **Kurzbeschreibung** | Der Marktplatz soll die Inseratübersicht innerhalb von 2 Sekunden anzeigen. |
| **Quelle** | Nutzererwartung, Entwicklerteam |
| **Prüfkriterium** | Messung der Zeit vom Aufruf/Filtern bis zur vollständigen Anzeige. Erfolgreich, wenn 95 % der Abrufe ≤ 2 Sekunden benötigen. |
| **Priorität** | Hoch |
| **Abhängigkeiten** | Datenbankleistung, Bildgrößen/-komprimierung |
| **Konflikte** | Höhere Bildqualität kann die Ladezeit verlängern. |


---

### NFA-02: Sichere Speicherung von Passwörtern

| Eigenschaft | Beschreibung |
| :--- | :--- |
| **Kurzbeschreibung** | Nutzerpasswörter müssen gehasht gespeichert werden, um den Zugriff auf Konten zu schützen. |
| **Quelle** | Entwicklerteam, interne Sicherheitsrichtlinien |
| **Prüfkriterium** | Überprüfung der Datenbank zeigt, dass Passwörter ausschließlich als Hash mit Salt vorliegen. |
| **Priorität** | Sehr hoch |
| **Abhängigkeiten** | Datenbank- und Backend Implementierung |
| **Konflikte** | Höhere Sicherheitsmaßnahmen können Registrierung und Login minimal verlangsamen. |


---

### NFA-03: Zugangsbeschränkung auf verifizierte THM Nutzer

| Eigenschaft | Beschreibung |
| :--- | :--- |
| **Kurzbeschreibung** | Nur Nutzer mit verifizierter THM E-Mail-Adresse dürfen die Plattform nutzen. Gäste sehen ausschließlich Login und Registrierung. |
| **Quelle** | Projektziel, Sicherheitsanforderungen |
| **Prüfkriterium** | Zugriffsversuche ohne verifiziertes Konto werden abgewiesen. Registrierung mit Nicht THM-Adresse wird abgelehnt. |
| **Priorität** | Sehr hoch |
| **Abhängigkeiten** | E-Mail Verifizierung, Zugriffs-/Sitzungsverwaltung |
| **Konflikte** | Strikte Zugangskontrolle kann die Einstiegshürde erhöhen. |


---

### NFA-04: Echtzeit-Zustellung von Chat-Nachrichten

| Eigenschaft | Beschreibung |
| :--- | :--- |
| **Kurzbeschreibung** | Chat Nachrichten sollen bei bestehender Verbindung nahezu verzögerungsfrei zugestellt werden. |
| **Quelle** | Nutzererwartung, Entwicklerteam |
| **Prüfkriterium** | Bei bestehender Verbindung werden Nachrichten in unter 1 Sekunde zugestellt; bei Ausfall werden sie gespeichert und später zugestellt. |
| **Priorität** | Hoch |
| **Abhängigkeiten** | Socket.io, Netzwerkverbindung, Backend |
| **Konflikte** | Persistente Speicherung jeder Nachricht erhöht die Systemlast. |


---

### NFA-05: Sicheres und effizientes Bild-Handling

| Eigenschaft | Beschreibung |
| :--- | :--- |
| **Kurzbeschreibung** | Hochgeladene Bilder werden auf Format und Größe geprüft und sicher gespeichert; unzulässige Dateien werden abgewiesen. |
| **Quelle** | Entwicklerteam, Sicherheitsanforderungen |
| **Prüfkriterium** | Nur zulässige Bildformate innerhalb der Größenbeschränkung werden gespeichert; andere Dateien werden mit Hinweis abgelehnt. |
| **Priorität** | Hoch |
| **Abhängigkeiten** | Backend-Validierung, Datenbank/Speicher |
| **Konflikte** | Strengere Prüfung kann den Upload-Vorgang verlängern. |


---

### NFA-06: Standortdaten-Bereinigung bei Bild-Uploads

| Eigenschaft | Beschreibung |
| :--- | :--- |
| **Kurzbeschreibung** | Standortdaten (z. B. GPS-Metadaten) werden aus hochgeladenen Bildern entfernt, bevor sie gespeichert werden. |
| **Quelle** | Datenschutzanforderungen, Architektur |
| **Prüfkriterium** | Stichprobenprüfung gespeicherter Bilder zeigt keine Standort-Metadaten mehr. |
| **Priorität** | Hoch |
| **Abhängigkeiten** | Backend-Verarbeitung, Bildspeicherdienst |
| **Konflikte** | Zusätzliche Verarbeitung kann den Upload-Vorgang geringfügig verlängern. |


---

### NFA-07: Ausfallverhalten des externen KI-Beschreibungsdienstes

| Eigenschaft | Beschreibung |
| :--- | :--- |
| **Kurzbeschreibung** | Ist der externe KI-Beschreibungsdienst nicht erreichbar, bleibt das Erstellen eines Inserats über die manuelle Eingabe uneingeschränkt möglich. |
| **Quelle** | Architektur, Robustheitsanforderung |
| **Prüfkriterium** | Bei simuliertem Ausfall des Dienstes kann ein Inserat ohne Vorschlag vollständig erstellt werden; eine verständliche Fehlermeldung wird angezeigt. |
| **Priorität** | Mittel |
| **Abhängigkeiten** | Externer KI-Beschreibungsdienst, Backend-Fehlerbehandlung |
| **Konflikte** | Kein direkter Konflikt erkennbar. |
