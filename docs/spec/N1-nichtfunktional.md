# N1 Nichtfunktionale Anforderungen

Die nichtfunktionalen Anforderungen definieren die Qualitätsmerkmale von THMarket in Bezug auf Leistung, Sicherheit, Benutzerfreundlichkeit und Ausfallverhalten. Jede Anforderung ist einzeln geprüft und prüfbar formuliert.

## NFA-01: Kurze Ladezeit der Inseratübersicht

| Attribut | Beschreibung |
|---|---|
| **Kurzbeschreibung** | Der Marktplatz soll die Inseratübersicht innerhalb von 2 Sekunden anzeigen. |
| **Quelle** | Nutzererwartung, Entwicklerteam |
| **Prüfkriterium** | Messung der Zeit vom Aufruf der Startseite bis zur vollständigen Anzeige. Erfolgreich, wenn 95 % der Abrufe ≤ 2 Sekunden benötigen. |
| **Priorität** | Hoch |
| **Abhängigkeiten** | Datenbankleistung, Anzahl und Größe der Bilder |
| **Konflikte** | Höhere Bildqualität kann die Ladezeit verlängern. |

## NFA-02: Sichere Speicherung von Passwörtern

| Attribut | Beschreibung |
|---|---|
| **Kurzbeschreibung** | Nutzerpasswörter müssen gehasht gespeichert werden, um den Zugriff auf Konten zu schützen. |
| **Quelle** | Entwicklerteam, interne Sicherheitsrichtlinien |
| **Prüfkriterium** | Überprüfung der Datenbank zeigt, dass Passwörter ausschließlich als bcrypt-Hash vorliegen. |
| **Priorität** | Sehr hoch |
| **Abhängigkeiten** | Backend-Implementierung (Auth-Modul) |
| **Konflikte** | Höherer Hash-Aufwand kann Registrierung und Login minimal verlangsamen. |

## NFA-03: Zugangsbeschränkung auf verifizierte THM-Nutzer

| Attribut | Beschreibung |
|---|---|
| **Kurzbeschreibung** | Nur Nutzer mit verifizierter `@thm.de`-Adresse erhalten Zugriff auf die Marktplatzfunktionen. Nicht angemeldete Gäste sehen ausschließlich Landingpage, Login, Registrierung und Impressum. |
| **Quelle** | Projektziel, Sicherheitsanforderung |
| **Prüfkriterium** | Registrierung mit Nicht-THM-Adresse wird abgelehnt; Zugriff auf geschützte Routen ohne gültige Sitzung wird verweigert. |
| **Priorität** | Sehr hoch |
| **Abhängigkeiten** | E-Mail-Verifizierung, Sitzungsverwaltung |
| **Konflikte** | Strikte Zugangskontrolle erhöht die Einstiegshürde. |

## NFA-04: Echtzeit-Zustellung von Chat-Nachrichten

| Attribut | Beschreibung |
|---|---|
| **Kurzbeschreibung** | Chat-Nachrichten sollen bei bestehender Verbindung nahezu verzögerungsfrei zugestellt werden. |
| **Quelle** | Nutzererwartung, Entwicklerteam |
| **Prüfkriterium** | Zustellung < 1 Sekunde bei bestehender Verbindung; bei Verbindungsabbruch bleiben Nachrichten gespeichert und werden beim nächsten Öffnen nachgeladen. |
| **Priorität** | Hoch |
| **Abhängigkeiten** | Socket.io, Netzwerkverbindung |
| **Konflikte** | Persistente Speicherung jeder Nachricht erhöht die Systemlast geringfügig. |

## NFA-05: Sicheres Bild-Handling

| Attribut | Beschreibung |
|---|---|
| **Kurzbeschreibung** | Hochgeladene Bilder werden auf zulässiges Format und Größe geprüft; unzulässige Dateien werden abgewiesen. |
| **Quelle** | Entwicklerteam, Sicherheitsanforderung |
| **Prüfkriterium** | Unzulässige Dateien werden mit verständlicher Fehlermeldung abgelehnt, zulässige werden clientseitig komprimiert und bei Cloudinary gespeichert. |
| **Priorität** | Hoch |
| **Abhängigkeiten** | Frontend-Validierung, Cloudinary-Anbindung |
| **Konflikte** | Strengere Prüfung kann den Upload-Vorgang geringfügig verlängern. |

## NFA-06: Ausfallverhalten des externen KI-Dienstes

| Attribut | Beschreibung |
|---|---|
| **Kurzbeschreibung** | Ist Gemini (Beschreibungsvorschlag oder Bildmoderation) nicht erreichbar oder liefert einen Fehler, bleibt das Erstellen eines Inserats über die manuelle Eingabe uneingeschränkt möglich; eine fehlgeschlagene Moderationsprüfung wird zusätzlich im Audit-Log vermerkt. |
| **Quelle** | Architekturentscheidung, Robustheitsanforderung |
| **Prüfkriterium** | Bei simuliertem Ausfall kann ein Inserat ohne KI-Vorschlag vollständig erstellt werden; im Audit-Log erscheint ein entsprechender Eintrag. |
| **Priorität** | Mittel |
| **Abhängigkeiten** | Externer KI-Dienst (Gemini), Audit-Log |
| **Konflikte** | Kein direkter Konflikt erkennbar. |
