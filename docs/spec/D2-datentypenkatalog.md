# 3.2 Datentypenverzeichnis

### Entität: Benutzer

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| id | INTEGER | Eindeutige Identifikation für jeden Benutzer (Primärschlüssel) |
| email | TEXT | THM-E-Mail-Adresse des Benutzers, eindeutig |
| username | TEXT | Anzeigename des Benutzers |
| password_hash | TEXT/HASH | Gehashtes und gesalzenes Passwort |
| verifiziert | BOOLEAN | Gibt an, ob die E-Mail-Adresse bestätigt wurde |
| rolle | TEXT | Rolle des Benutzers (z. B. „user" oder „admin") |
| erstellt_am | TIMESTAMP | Zeitpunkt der Registrierung |

### Entität: Inserat

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| id | INTEGER | Eindeutige ID des Inserats (Primärschlüssel) |
| user_id | INTEGER | Fremdschlüssel auf Benutzer (Anbieter) |
| kategorie_id | INTEGER | Fremdschlüssel auf Kategorie |
| titel | TEXT | Titel des Inserats |
| beschreibung | TEXT | Beschreibung des Artikels |
| preis | NUMERIC | Preis bzw. Mietpreis |
| typ | TEXT | Angebotstyp: „Verkauf" oder „Miete" |
| zustand | TEXT | Zustand des Artikels (z. B. neu, gebraucht) |
| status | TEXT | Status des Inserats (z. B. aktiv, abgeschlossen) |
| erstellt_am | TIMESTAMP | Zeitpunkt der Erstellung |

### Entität: Bild

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| id | INTEGER | Eindeutige ID des Bildes (Primärschlüssel) |
| inserat_id | INTEGER | Fremdschlüssel auf Inserat |
| pfad | TEXT | Speicherort bzw. Referenz der Bilddatei |
| reihenfolge | INTEGER | Anzeigereihenfolge der Bilder eines Inserats |

### Entität: Kategorie

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| id | INTEGER | Eindeutige ID der Kategorie (Primärschlüssel) |
| name | TEXT | Name der Kategorie, eindeutig (z. B. Elektronik, Möbel) |

### Entität: Favorit

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| user_id | INTEGER | Fremdschlüssel auf Benutzer (Teil des Primärschlüssels) |
| inserat_id | INTEGER | Fremdschlüssel auf Inserat (Teil des Primärschlüssels) |
| erstellt_am | TIMESTAMP | Zeitpunkt der Favorisierung |

### Entität: Konversation

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| id | INTEGER | Eindeutige ID der Konversation (Primärschlüssel) |
| inserat_id | INTEGER | Fremdschlüssel auf das betreffende Inserat |
| kaeufer_id | INTEGER | Fremdschlüssel auf Benutzer (Interessent) |
| verkaeufer_id | INTEGER | Fremdschlüssel auf Benutzer (Anbieter) |
| erstellt_am | TIMESTAMP | Zeitpunkt des ersten Kontakts |

### Entität: Nachricht

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| id | INTEGER | Eindeutige ID der Nachricht (Primärschlüssel) |
| konversation_id | INTEGER | Fremdschlüssel auf Konversation |
| sender_id | INTEGER | Fremdschlüssel auf Benutzer (Absender) |
| inhalt | TEXT | Textinhalt der Nachricht |
| gesendet_am | TIMESTAMP | Zeitpunkt des Versands |
| gelesen | BOOLEAN | Gibt an, ob die Nachricht gelesen wurde |

### Entität: Meldung

| Attribut | Datentyp | Beschreibung |
|---|---|---|
| id | INTEGER | Eindeutige ID der Meldung (Primärschlüssel) |
| inserat_id | INTEGER | Fremdschlüssel auf das gemeldete Inserat |
| melder_id | INTEGER | Fremdschlüssel auf Benutzer (Melder) |
| grund | TEXT | Grund der Meldung |
| beschreibung | TEXT | Optionale nähere Beschreibung |
| status | TEXT | Bearbeitungsstatus (offen, bearbeitet, abgelehnt) |
| erstellt_am | TIMESTAMP | Zeitpunkt der Meldung |

Mit diesem Datentypenverzeichnis sind alle für das System relevanten Attribute klar definiert. Es stellt sicher, dass die Daten konsistent, validierbar und entsprechend den funktionalen Anforderungen verarbeitet werden können.
