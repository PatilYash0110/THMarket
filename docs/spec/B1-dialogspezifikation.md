# 4. Benutzerschnittstelle

## 4.1 Dialoglandkarte

Die Dialoglandkarte zeigt alle Seiten, die ein Nutzer besuchen kann, gegliedert in einen öffentlichen Bereich, einen angemeldeten Bereich und den Admin-Bereich. Ein Logout ist von jeder Seite im angemeldeten bzw. Admin-Bereich aus möglich und wird der Übersichtlichkeit halber nur als ein Übergang zurück zur Landingpage dargestellt.

Die Übergänge zwischen den Dialogen sind nummeriert (①–⑫). Dieselben Nummern tauchen im Abschnitt „Navigationsmöglichkeiten" der jeweiligen Dialogspezifikation (Kapitel 4.2) wieder auf, sodass sich jederzeit nachvollziehen lässt, welcher Pfad in der Übersicht gemeint ist. Die folgende Tabelle löst die Nummern zusätzlich in Textform auf:

| Nr. | Von → Nach | Beschreibung |
|---|---|---|
| ① | Landingpage → Login-Dialog / Registrierungs-Dialog | Einstiegspunkt aus dem öffentlichen Bereich ([4.2.1](#421-landingpage)). |
| ② | Login-Dialog ↔ Registrierungs-Dialog | Wechselseitiger Sprung über „Jetzt registrieren" bzw. „Schon registriert?" ([4.2.2](#422-login-dialog), [4.2.3](#423-registrierungs-dialog)). |
| ③ | Login-Dialog ↔ Passwort-vergessen-/-zurücksetzen-Dialog | Reset-Ablauf inkl. E-Mail-Link ([4.2.4](#424-passwort-vergessen---zurücksetzen-dialog)). |
| ④ | Login-Dialog → Marktplatz-Dialog bzw. Adminbereich-Dialog | Rollenabhängige Weiterleitung nach erfolgreichem Login ([4.2.2](#422-login-dialog), [4.2.16](#4216-adminbereich-dialog)). |
| ⑤ | Marktplatz-Dialog → Profil-/Favoriten-/Chat-/Erstellen-Dialog | Navigationsleiste des Marktplatzes ([4.2.6](#426-marktplatz-dialog-startseite)). |
| ⑥ | Marktplatz-/Profil-/Favoriten-Dialog → Inseratdetail-Dialog | Öffnen eines konkreten Inserats ([4.2.6](#426-marktplatz-dialog-startseite), [4.2.7](#427-inseratdetail-dialog), [4.2.11](#4211-profil-dialog), [4.2.12](#4212-favoriten-dialog)). |
| ⑦ | Inseratdetail-Dialog ↔ Kauf-Dialog | Kaufabschluss und Rücksprung nach Erfolg ([4.2.7](#427-inseratdetail-dialog), [4.2.9](#429-kauf-dialog-checkout)). |
| ⑧ | Inseratdetail-Dialog → Chat-Dialog | „Anbieter kontaktieren" ([4.2.7](#427-inseratdetail-dialog), [4.2.10](#4210-chat-dialog)). |
| ⑨ | Inseratdetail-/Profil-Dialog ↔ Erstellen-/Bearbeiten-Dialog | Neues Inserat anlegen bzw. bestehendes bearbeiten ([4.2.7](#427-inseratdetail-dialog), [4.2.8](#428-inserat-erstellen--bearbeiten-dialog), [4.2.11](#4211-profil-dialog)). |
| ⑩ | Profil-Dialog ↔ Aufladen-/Auszahlen-/Kontoeinstellungen-Dialog | Kontofunktionen im Profilbereich ([4.2.11](#4211-profil-dialog), [4.2.13](#4213-guthaben-aufladen-dialog)–[4.2.15](#4215-kontoeinstellungen-dialog)). |
| ⑪ | Adminbereich-Dialog → Inseratdetail-Dialog | Nur lesender Meldungskontext aus dem Tab „Meldungen" ([4.2.16](#4216-adminbereich-dialog)). |
| ⑫ | Angemeldeter Bereich / Adminbereich → Landingpage | Abmelden, von jedem angemeldeten Dialog aus möglich. |

## 4.2 Dialogspezifikation

### 4.2.1 Landingpage

**Allgemeine Beschreibung**
- Zweck des Dialogs: Marketing-/Einstiegsseite für nicht angemeldete Besucher.
- Anwendungsfall: Einstiegspunkt vor UC01/UC02, kein eigener Use Case.
- Ergebnis: Weiterleitung zu Registrierung oder Login.
- Sichtbar für: Gäste (keine aktive Sitzung).

**Navigationsmöglichkeiten**

Von hier gelangt man zu: „Registrieren" → Registrierungs-Dialog (S02), „Anmelden" → Login-Dialog (S01). Rücksprungmöglichkeit gibt es keine, dies ist der Einstiegspunkt (S00) der Dialoglandkarte.

**Statik**

Kein Formular, rein informative Seite.

**Dynamik – Aktionsliste**

| Aktion | Auslöser | Wirkung | Datenmodell | Use Case |
|---|---|---|---|---|
| Registrierung öffnen | Button „Registrieren" | Navigation zum Registrierungs-Dialog | Kein Bezug | UC01 |
| Anmeldung öffnen | Button „Anmelden" | Navigation zum Login-Dialog | Kein Bezug | UC02 |
| Impressum öffnen | Button „Impressum" | Navigation zum Impressum-Dialog | Kein Bezug | – |

### 4.2.2 Login-Dialog

**Allgemeine Beschreibung**
- Zweck des Dialogs: Anmeldung registrierter, verifizierter Nutzer.
- Anwendungsfall: „Nutzer meldet sich an".
- Ergebnis: Erfolgreiche Anmeldung führt zur Weiterleitung auf den Marktplatz (Student) oder den Admin-Bereich (Admin).
- Sichtbar für: Gäste.

**Navigationsmöglichkeiten**

Von hier gelangt man zu: „Jetzt registrieren" → Registrierungs-Dialog, „Passwort vergessen?" → Passwort-vergessen-Dialog, nach erfolgreichem Login → Marktplatz-Dialog (Student) oder Adminbereich-Dialog (Admin). Rücksprungmöglichkeit: keine.

**Statik – Formular (Felder)**

| Feldname | Typ | Pflicht | Vorbelegung | Validierung | Datenmodell |
|---|---|---|---|---|---|
| E-Mail | Textfeld | Ja | Nein | muss gültiges E-Mail-Format haben | `USER.email` |
| Passwort | Passwortfeld | Ja | Nein | Pflichtfeld | `USER.passwordHash` |

**Dynamik – Aktionsliste**

| Aktion | Auslöser | Wirkung | Datenmodell | Use Case |
|---|---|---|---|---|
| Anmeldung starten | Button „Anmelden" | Validierung → Authentifizierung → Weiterleitung oder Fehlermeldung | `USER.email`, `USER.passwordHash` | UC02 |
| Registrierung öffnen | Link „Jetzt registrieren" | Navigation zum Registrierungs-Dialog | Kein Bezug | UC01 |
| Passwort-Reset öffnen | Link „Passwort vergessen?" | Navigation zum Passwort-vergessen-Dialog | Kein Bezug | UC03 |
| Impressum öffnen | Button „Impressum" | Navigation zum Impressum-Dialog | Kein Bezug | – |

**Zustände**
- Fehler „Ungültige E-Mail oder Passwort".
- Hinweis bei unverifiziertem Konto.

### 4.2.3 Registrierungs-Dialog

**Allgemeine Beschreibung**
- Zweck des Dialogs: Anlegen eines neuen Kontos mit THM-E-Mail-Adresse.
- Anwendungsfall: „Nutzer registriert sich".
- Ergebnis: Ein neues, unverifiziertes Konto wird angelegt; nach Bestätigung der E-Mail ist es login-fähig.
- Sichtbar für: Gäste.

**Navigationsmöglichkeiten**

Von hier gelangt man zu: „Schon registriert? Jetzt anmelden" → Login-Dialog, nach erfolgreicher Registrierung → Hinweis „Bitte bestätige deine E-Mail-Adresse" (verbleibt im selben Dialog, bis der Link geöffnet wird), danach ebenfalls zurück zum Login-Dialog. Rücksprungmöglichkeit: über den Link zum Login-Dialog.

**Statik – Formular (Felder)**

| Feldname | Typ | Pflicht | Vorbelegung | Validierung | Datenmodell |
|---|---|---|---|---|---|
| Name | Textfeld | Ja | Nein | Pflichtfeld | `USER.name` |
| E-Mail | Textfeld | Ja | Nein | muss auf `@thm.de` enden (inkl. Subdomains) | `USER.email` |
| Passwort | Passwortfeld | Ja | Nein | mind. 8 Zeichen, mit mindestens einem Klein-, einem Großbuchstaben und einer Ziffer | `USER.passwordHash` |

**Dynamik – Aktionsliste**

| Aktion | Auslöser | Wirkung | Datenmodell | Use Case |
|---|---|---|---|---|
| Registrierung starten | Button „Registrieren" | Validierung → unverifiziertes Konto anlegen → Bestätigungsmail versenden | `USER.name`, `USER.email`, `USER.passwordHash` | UC01 |
| Anmeldung öffnen | Link „Schon registriert? Jetzt anmelden" | Navigation zum Login-Dialog | Kein Bezug | UC02 |
| Impressum öffnen | Button „Impressum" | Navigation zum Impressum-Dialog | Kein Bezug | – |

**Zustände**
- Fehler bei ungültiger, bereits vergebener Adresse oder zu kurzem Passwort.
- Erfolg „Bitte bestätige deine E-Mail-Adresse".

### 4.2.4 Passwort-vergessen- / Zurücksetzen-Dialog

**Allgemeine Beschreibung**
- Zweck des Dialogs: Neues Passwort setzen, wenn das alte vergessen wurde.
- Anwendungsfall: „Nutzer setzt Passwort zurück".
- Ergebnis: Nutzer erhält bei Bedarf einen Reset-Link per E-Mail und kann darüber ein neues Passwort setzen.
- Sichtbar für: Gäste.

**Navigationsmöglichkeiten**

Von hier gelangt man zu: nach dem Setzen des neuen Passworts → Login-Dialog. Rücksprungmöglichkeit: über Browser-Navigation zurück zum Login-Dialog.

**Statik – Formular (Felder)**

| Feldname | Typ | Pflicht | Vorbelegung | Validierung | Datenmodell |
|---|---|---|---|---|---|
| Schritt 1 – E-Mail | Textfeld | Ja | Nein | muss gültiges E-Mail-Format haben | `USER.email` |
| Schritt 2 – Neues Passwort | Passwortfeld | Ja | Nein | mind. 8 Zeichen, mit mindestens einem Klein-, einem Großbuchstaben und einer Ziffer | `USER.passwordHash` |

**Dynamik – Aktionsliste**

| Aktion | Auslöser | Wirkung | Datenmodell | Use Case |
|---|---|---|---|---|
| Link anfordern | Button „Link anfordern" | Sucht Konto, versendet bei Treffer einen Reset-Link, zeigt in jedem Fall denselben Hinweis | `USER.email`, `USER.passwordResetToken` | UC03 |
| Neues Passwort setzen | Button „Passwort setzen" | Prüft Reset-Link, setzt bei Erfolg neues Passwort | `USER.passwordHash` | UC03 |
| Impressum öffnen | Button „Impressum" | Navigation zum Impressum-Dialog | Kein Bezug | – |

**Zustände**
- Hinweis „E-Mail wurde versendet".
- Hinweis bei unverifiziertem Konto.
- Fehler bei ungültigem/abgelaufenem Link.
- Erfolg.

### 4.2.5 Impressum

**Allgemeine Beschreibung**
- Zweck des Dialogs: Rechtlich vorgeschriebene Anbieterkennzeichnung.
- Anwendungsfall: Kein Use-Case-Bezug.
- Sichtbar für: Alle (Gäste und angemeldete Nutzer).

**Navigationsmöglichkeiten**

Über Browser-Navigation zurück zur vorherigen Seite.

**Statik**

Kein Formular, keine Aktionen außer Navigation.

### 4.2.6 Marktplatz-Dialog (Startseite)

**Allgemeine Beschreibung**
- Zweck des Dialogs: Anzeige, Suche und Filterung aller aktiven Inserate.
- Anwendungsfall: „Nutzer durchsucht den Marktplatz".
- Ergebnis: Anzeige der passenden Inserate, Einstieg in Detailansicht, Inserat-Erstellung und Navigation.
- Sichtbar für: Alle angemeldeten Studenten (Admins werden stattdessen direkt in den Admin-Bereich geleitet).

**Navigationsmöglichkeiten**

Von hier gelangt man zu:
- einem Inserat → Inseratdetail-Dialog
- „Inserat erstellen" → Erstellen-Dialog
- „Profil" → Profil-Dialog
- „Favoriten" → Favoriten-Dialog
- „Nachrichten" → Chat-Dialog

Rücksprungmöglichkeit: dies ist die Startseite nach dem Login, es gibt keinen übergeordneten Dialog.

**Statik – Formular (Felder)**

| Feldname | Typ | Pflicht | Vorbelegung | Validierung | Datenmodell |
|---|---|---|---|---|---|
| Suchbegriff | Textfeld | Nein | Nein | Freitext | `LISTING.title`, `LISTING.description` |
| Kategorie | Dropdown | Nein | „Alle" | Auswahl aus fester Liste (6 Kategorien) | `LISTING.category` |
| Sortierung | Dropdown | Nein | Standard | Auswahl aus fester Liste | Kein Bezug |

**Dynamik – Aktionsliste**

| Aktion | Auslöser | Wirkung | Datenmodell | Use Case |
|---|---|---|---|---|
| Inserate durchsuchen/filtern | Eingabe/Auswahl in Suchleiste | Sofortige clientseitige Aktualisierung der Liste | `LISTING.*` | UC06 |
| Inserat öffnen | Klick auf Inseratkachel | Navigation zur Inseratdetailseite | `LISTING.id` | UC06 |
| Inserat erstellen | Button „Inserat erstellen" | Navigation zum Erstellen-Dialog | Kein Bezug | UC04 |
| Profil/Favoriten/Nachrichten öffnen | Klick in Navigationsleiste | Navigation zum jeweiligen Dialog | Kein Bezug | UC05 / UC06 / UC07 |
| Impressum öffnen | Button „Impressum" | Navigation zum Impressum-Dialog | Kein Bezug | – |

**Zustände**
- Standard (Inserate werden angezeigt).
- kein Treffer (Hinweis „Keine Inserate gefunden").
- Fehler beim initialen Laden (Datenbank nicht erreichbar).

### 4.2.7 Inseratdetail-Dialog

**Allgemeine Beschreibung**
- Zweck des Dialogs: Anzeige aller Details eines Inserats und Einstieg in Folgeaktionen.
- Anwendungsfall: „Nutzer sieht sich ein Inserat an".
- Ergebnis: Anzeige der Inseratdetails, Kaufen, Kontaktieren, Favorisieren, Melden oder Bearbeiten möglich.
- Sichtbar für: Alle angemeldeten Nutzer.

**Navigationsmöglichkeiten**

Von hier gelangt man zu:
- „Kaufen" → Kauf-Dialog
- „Anbieter kontaktieren" → Chat-Dialog
- „Bearbeiten" (nur Eigentümer) → Erstellen-/Bearbeiten-Dialog

Rücksprungmöglichkeit: über „Zurück" bzw. Browser-Navigation zum Marktplatz-Dialog.

**Statik**

Keine Eingabefelder, nur Anzeige der Inseratdaten.

**Sichtbarkeitsbedingungen der Aktions-Buttons**

| Aktion | Ausgeblendet wenn |
|---|---|
| Kaufen | Admin, Eigentümer, bereits verkauft oder Sofortkauf deaktiviert |
| Anbieter kontaktieren | Eigenes Inserat oder bereits verkauft |
| Favorit (Herz-Symbol) | Eigenes Inserat (unabhängig vom Verkaufsstatus) |
| Inserat melden | Admin oder eigenes Inserat |
| Bearbeiten | Nur sichtbar für den Eigentümer |

**Dynamik – Aktionsliste**

| Aktion | Auslöser | Wirkung | Datenmodell | Use Case |
|---|---|---|---|---|
| Kaufen | Button „Kaufen" | Navigation zum Kauf-Dialog | `LISTING.id` | UC08 |
| Anbieter kontaktieren | Button „Anbieter kontaktieren" | Öffnet/erstellt Konversation, Navigation zum Chat-Dialog | `CONVERSATION.*` | UC07 |
| Favorisieren | Klick auf Herz-Symbol | Merkt/entmerkt Inserat | `FAVORITE.*` | UC06 |
| Inserat melden | Button „Melden" | Öffnet Meldeformular, speichert Meldung | `REPORT.*` | UC11 |
| Bearbeiten | Button „Bearbeiten" | Navigation zum Bearbeiten-Dialog | `LISTING.*` | UC05 |
| Impressum öffnen | Button „Impressum" | Navigation zum Impressum-Dialog | Kein Bezug | – |

**Zustände**
- Standard.
- Favorisiert (Herz-Symbol aktiv markiert).
- Verkauft (Status-Badge, Kaufen/Kontaktieren ausgeblendet).
- Fehler, falls Inserat zwischenzeitlich gelöscht wurde.

### 4.2.8 Inserat-erstellen-/-bearbeiten-Dialog

**Allgemeine Beschreibung**
- Zweck des Dialogs: Anlegen bzw. Bearbeiten eines Inserats inklusive Bild-Upload.
- Anwendungsfall: „Nutzer erstellt/bearbeitet ein Inserat".
- Ergebnis: Ein neues Inserat wird veröffentlicht bzw. ein bestehendes aktualisiert.
- Sichtbar für: Alle angemeldeten Studenten (Erstellen) und der Eigentümer (Bearbeiten).
- Besonderheiten: Mehrfach-Bild-Upload mit clientseitiger Kompression, optionaler KI-Beschreibungsvorschlag.

**Navigationsmöglichkeiten**

Von hier gelangt man zu:
- nach erfolgreichem Speichern → Inseratdetail-Dialog des Inserats
- über „Abbrechen" → Marktplatz- bzw. Inseratdetail-Dialog.

Rücksprungmöglichkeit: über „Abbrechen".

**Statik – Formular (Felder)**

| Feldname | Typ | Pflicht | Vorbelegung | Validierung | Datenmodell |
|---|---|---|---|---|---|
| Titel | Textfeld | Ja | Nein (bzw. bestehender Titel bei Bearbeiten) | Pflichtfeld | `LISTING.title` |
| Kategorie | Dropdown | Ja | Erste Kategorie der Liste | Auswahl aus fester Liste (6 Werte) | `LISTING.category` |
| Preis | Zahlenfeld | Ja | Nein | Numerisch, ≥ 0 | `LISTING.priceCents` |
| Beschreibung | Textbereich | Ja | Nein bzw. KI-Vorschlag | Pflichtfeld | `LISTING.description` |
| Sofortkauf möglich | Checkbox | Nein | Aktiviert | Kein Bezug | `LISTING.sofortkaufMoeglich` |
| Bilder | Datei-Upload (mehrfach) | Ja | Nein | 1 bis 6 Bilder | `LISTING.images` |

**Dynamik – Aktionsliste**

| Aktion | Auslöser | Wirkung | Datenmodell | Use Case |
|---|---|---|---|---|
| Beschreibung vorschlagen | Button „Vorschlag generieren" | Ruft Gemini mit Titel/Kategorie/Hinweis und Fotos auf, füllt Beschreibungsfeld | `LISTING.description` | UC04 |
| Bild hinzufügen | Datei-Upload | Bild wird komprimiert und der Vorschau hinzugefügt | `LISTING.images` | UC04 |
| Inserat speichern | Button „Veröffentlichen"/„Speichern" | Validierung → Inserat (und Bilder) werden gespeichert oder Fehler angezeigt | `LISTING.*` | UC04 / UC05 |
| Abbrechen | Button „Abbrechen" | Rückkehr ohne Speichern | Kein Bezug | Kein Bezug |
| Impressum öffnen | Button „Impressum" | Navigation zum Impressum-Dialog | Kein Bezug | – |

**Zustände**
- Standard.
- Fehler (leere Pflichtfelder, kein Bild).
- KI-Fehler.
- Erfolg.

### 4.2.9 Kauf-Dialog (Checkout)

**Allgemeine Beschreibung**
- Zweck des Dialogs: Abschluss des simulierten Kaufs.
- Anwendungsfall: „Nutzer schließt einen Kauf ab".
- Ergebnis: Inserat wird als verkauft markiert und bei Guthaben-Modus wird der Betrag verrechnet.
- Sichtbar für: Angemeldete Nutzer, die nicht Eigentümer des Inserats sind, sofern Sofortkauf aktiviert und das Inserat noch nicht verkauft ist.

**Navigationsmöglichkeiten**

Von hier gelangt man zu:
- über „Kaufen" im Inseratdetail-Dialog hierher
- nach Abschluss → zurück zum Inseratdetail-Dialog

Rücksprungmöglichkeit: über „Abbrechen".

**Statik – Formular (Felder)**

| Feldname | Typ | Pflicht | Vorbelegung | Validierung | Datenmodell |
|---|---|---|---|---|---|
| Zahlungsmodus | Radiobutton (Simulation / Guthaben) | Ja | „Simulation" | Auswahl treffen | Steuert weiteren Ablauf |
| Kartennummer | Textfeld (nur Simulation) | Ja | Nein | Formatprüfung (Testkarte: `4242 4242 4242 4242`) | Nicht persistiert |
| Ablaufdatum | Textfeld (nur Simulation) | Ja | Nein | Formatprüfung | Nicht persistiert |
| CVC | Textfeld (nur Simulation) | Ja | Nein | Formatprüfung | Nicht persistiert |

**Dynamik – Aktionsliste**

| Aktion | Auslöser | Wirkung | Datenmodell | Use Case |
|---|---|---|---|---|
| Kauf bestätigen | Button „Kauf bestätigen" | Je nach Modus: Testkarte validieren oder Guthaben prüfen → Inserat als verkauft markieren | `LISTING.status`, `LISTING.buyerId`, `USER.balanceCents` | UC08 |
| Abbrechen | Button „Abbrechen" | Rückkehr ohne Kaufabschluss | Kein Bezug | Kein Bezug |
| Impressum öffnen | Button „Impressum" | Navigation zum Impressum-Dialog | Kein Bezug | – |

**Zustände**
- Standard.
- Fehler (ungültige Testkarte oder nicht genügend Guthaben).
- Erfolg.

### 4.2.10 Chat-Dialog

**Allgemeine Beschreibung**
- Zweck des Dialogs: Echtzeit-Nachrichtenaustausch zwischen Interessent und Anbieter zu einem Inserat.
- Anwendungsfall: „Nutzer kommuniziert mit einem anderen Nutzer".
- Ergebnis: Nachrichten werden in Echtzeit ausgetauscht und dauerhaft gespeichert.
- Sichtbar für: die beiden an einer Konversation beteiligten angemeldeten Nutzer.

**Navigationsmöglichkeiten**

Von hier gelangt man zu:
- über das verknüpfte Inserat → Inseratdetail-Dialog
- „Melden" → Meldeformular für den gemeldeten Nutzer.

Rücksprungmöglichkeit: über die Navigationsleiste zum Marktplatz-Dialog.

**Statik – Formular (Felder)**

| Feldname | Typ | Pflicht | Vorbelegung | Validierung | Datenmodell |
|---|---|---|---|---|---|
| Nachricht | Textfeld | Ja | Nein | Nicht leer | `MESSAGE.text` |

**Dynamik – Aktionsliste**

| Aktion | Auslöser | Wirkung | Datenmodell | Use Case |
|---|---|---|---|---|
| Nachricht senden | Button „Senden" | Validierung → Nachricht wird in Echtzeit übertragen und gespeichert | `MESSAGE.*` | UC07 |
| Konversation wählen | Klick in der Liste | Anzeige des Nachrichtenverlaufs | `CONVERSATION.id` | UC07 |
| Nutzer melden | Button „Melden" im Chat | Öffnet Meldeformular, speichert Meldung mit Chat-Kontext | `REPORT.*` | UC12 |
| Impressum öffnen | Button „Impressum" | Navigation zum Impressum-Dialog | Kein Bezug | – |

**Zustände**
- Standard.
- Empfänger nicht in der Unterhaltung (Nachricht wird als Benachrichtigung markiert, Konversation springt nach oben).
- Verbindungsabbruch (Hinweis, automatischer Wiederverbindungsversuch).

### 4.2.11 Profil-Dialog

**Allgemeine Beschreibung**
- Zweck des Dialogs: Verwaltung der eigenen Inserate und Zugang zu Kontofunktionen.
- Anwendungsfall: „Nutzer verwaltet eigene Inserate und Konto".
- Ergebnis: Eigene Inserate sind aktuell. Aufladen/Auszahlen/Kontoeinstellungen sind erreichbar.
- Sichtbar für: Alle angemeldeten Nutzer.
- Besonderheiten: Trennung in die Bereiche „Aktive Inserate" und „Verkaufte Inserate".

**Navigationsmöglichkeiten**

Von hier gelangt man zu:
- einem eigenen Inserat → Inseratdetail-Dialog
- „Aufladen" → Aufladen-Dialog
- „Auszahlen" → Auszahlen-Dialog
- „Kontoeinstellungen" → Kontoeinstellungen-Dialog
- „Neues Inserat" → Erstellen-Dialog.

Rücksprungmöglichkeit: über die Navigationsleiste zum Marktplatz-Dialog.

**Statik**

Kein Eingabeformular, nur die beiden Listenbereiche „Aktive Inserate" und „Verkaufte Inserate" (`LISTING.*` gefiltert nach `sellerId` und `status`).

**Dynamik – Aktionsliste**

| Aktion | Auslöser | Wirkung | Datenmodell | Use Case |
|---|---|---|---|---|
| Eigenes Inserat öffnen | Klick auf Inserat in „Aktive/Verkaufte Inserate" | Navigation zur Inseratdetailseite | `LISTING.id` | UC05 |
| Aufladen öffnen | Button „Aufladen" | Navigation zum Aufladen-Dialog | Kein Bezug | UC09 |
| Auszahlen öffnen | Button „Auszahlen" | Navigation zum Auszahlen-Dialog | Kein Bezug | UC10 |
| Kontoeinstellungen öffnen | Link „Kontoeinstellungen" | Navigation zum Kontoeinstellungen-Dialog | Kein Bezug | Kein Bezug |
| Neues Inserat | Button „Neues Inserat" | Navigation zum Erstellen-Dialog | Kein Bezug | UC04 |
| Impressum öffnen | Button „Impressum" | Navigation zum Impressum-Dialog | Kein Bezug | – |

**Zustände**
- Standard.
- keine eigenen Inserate vorhanden (Hinweis statt Liste).

### 4.2.12 Favoriten-Dialog

**Allgemeine Beschreibung**
- Zweck des Dialogs: Übersicht der gemerkten Inserate für den schnellen Wiederzugriff.
- Anwendungsfall: „Nutzer sieht seine Favoriten ein".
- Ergebnis: Favorisierte Inserate sind direkt abrufbar.
- Sichtbar für: Alle angemeldeten Nutzer.

**Navigationsmöglichkeiten**

Von hier gelangt man zu:
- einem favorisierten Inserat → Inseratdetail-Dialog

Rücksprungmöglichkeit: über die Navigationsleiste zum Marktplatz-Dialog.

**Statik**

Kein Eingabeformular, nur die Liste der favorisierten Inserate (`FAVORITE.*` verknüpft mit `LISTING.*`).

**Dynamik – Aktionsliste**

| Aktion | Auslöser | Wirkung | Datenmodell | Use Case |
|---|---|---|---|---|
| Favorit öffnen | Klick auf Favorit | Navigation zur Inseratdetailseite | `FAVORITE.listingId` | UC06 |
| Impressum öffnen | Button „Impressum" | Navigation zum Impressum-Dialog | Kein Bezug | – |

**Zustände**
- Standard.
- keine Favoriten vorhanden (Hinweis statt Liste).

### 4.2.13 Guthaben-aufladen-Dialog

**Allgemeine Beschreibung**
- Zweck des Dialogs: Mock-Einzahlung auf das In-App-Guthaben.
- Anwendungsfall: „Nutzer lädt Guthaben auf".
- Ergebnis: Guthaben ist um den eingezahlten Betrag erhöht.
- Sichtbar für: Alle angemeldeten Nutzer.

**Navigationsmöglichkeiten**

Von hier gelangt man zu:
- über „Aufladen" im Profil-Dialog hierher
- nach Abschluss → zurück zum Profil-Dialog

**Statik – Formular (Felder)**

| Feldname | Typ | Pflicht | Vorbelegung | Validierung | Datenmodell |
|---|---|---|---|---|---|
| Betrag | Zahlenfeld | Ja | 25 € | min. 5 €, max. 500 € | `USER.balanceCents` |
| Kartennummer | Textfeld | Ja | Nein | Formatprüfung | Nicht persistiert |
| Ablaufdatum | Textfeld | Ja | Nein | Formatprüfung | Nicht persistiert |
| CVC | Textfeld | Ja | Nein | Formatprüfung | Nicht persistiert |

**Dynamik – Aktionsliste**

| Aktion | Auslöser | Wirkung | Datenmodell | Use Case |
|---|---|---|---|---|
| Aufladen bestätigen | Button „Aufladen" | Prüft Betrag und Testkarte → erhöht Guthaben | `USER.balanceCents` | UC09 |
| Impressum öffnen | Button „Impressum" | Navigation zum Impressum-Dialog | Kein Bezug | – |

**Zustände**
- Standard.
- Fehler (Betrag außerhalb 5–500 €, ungültige Testkarte).
- Erfolg (neuer Kontostand wird angezeigt).

### 4.2.14 Guthaben-auszahlen-Dialog

**Allgemeine Beschreibung**
- Zweck des Dialogs: Mock-Auszahlung des In-App-Guthabens.
- Anwendungsfall: „Nutzer zahlt Guthaben aus".
- Ergebnis: Guthaben ist um den ausgezahlten Betrag verringert.
- Sichtbar für: Alle angemeldeten Nutzer.

**Navigationsmöglichkeiten**

Von hier gelangt man zu:
- über „Auszahlen" im Profil-Dialog hierher
- nach Abschluss → zurück zum Profil-Dialog

**Statik – Formular (Felder)**

| Feldname | Typ | Pflicht | Vorbelegung | Validierung | Datenmodell |
|---|---|---|---|---|---|
| Betrag | Zahlenfeld | Ja | Aktuelles Guthaben (siehe Hinweis) | min. 0,01 €, max. aktuelles Guthaben | `USER.balanceCents` |
| Kartennummer | Textfeld | Ja | Nein | Formatprüfung | Nicht persistiert |
| Ablaufdatum | Textfeld | Ja | Nein | Formatprüfung | Nicht persistiert |
| CVC | Textfeld | Ja | Nein | Formatprüfung | Nicht persistiert |

**Dynamik – Aktionsliste**

| Aktion | Auslöser | Wirkung | Datenmodell | Use Case |
|---|---|---|---|---|
| Auszahlen bestätigen | Button „Auszahlen" | Prüft Betrag und Testkarte → verringert Guthaben | `USER.balanceCents` | UC10 |
| Impressum öffnen | Button „Impressum" | Navigation zum Impressum-Dialog | Kein Bezug | – |

**Zustände**
- Kein Guthaben (Hinweis „Kein Guthaben zum Auszahlen vorhanden" statt Formular).
- Standard.
- Fehler (Betrag ungültig oder über verfügbarem Guthaben).
- Erfolg.

### 4.2.15 Kontoeinstellungen-Dialog

**Allgemeine Beschreibung**
- Zweck des Dialogs: Ändern von Anzeigename und Passwort.
- Anwendungsfall: Querschnittsfunktion ohne direkten Use-Case-Bezug.
- Ergebnis: Name bzw. Passwort sind aktualisiert.
- Sichtbar für: Alle angemeldeten Nutzer.

**Navigationsmöglichkeiten**

Von hier gelangt man zu:
- über den Link „Kontoeinstellungen" im Profil-Dialog hierher

Rücksprungmöglichkeit: über die Navigationsleiste zum Profil-Dialog.

**Statik – Formular (Felder)**

| Feldname | Typ | Pflicht | Vorbelegung | Validierung | Datenmodell |
|---|---|---|---|---|---|
| Name (Formular 1) | Textfeld | Ja | Aktueller Name | Pflichtfeld | `USER.name` |
| Aktuelles Passwort (Formular 2) | Passwortfeld | Ja | Nein | Muss mit gespeichertem Hash übereinstimmen | `USER.passwordHash` |
| Neues Passwort (Formular 2) | Passwortfeld | Ja | Nein | mind. 8 Zeichen, mit mindestens einem Klein-, einem Großbuchstaben und einer Ziffer | `USER.passwordHash` |

**Dynamik – Aktionsliste**

| Aktion | Auslöser | Wirkung | Datenmodell | Use Case |
|---|---|---|---|---|
| Name speichern | Button „Speichern" (Name) | Validierung → Name wird aktualisiert | `USER.name` | Kein Bezug |
| Passwort speichern | Button „Speichern" (Passwort) | Prüft aktuelles Passwort → setzt neues Passwort | `USER.passwordHash` | Kein Bezug |
| Impressum öffnen | Button „Impressum" | Navigation zum Impressum-Dialog | Kein Bezug | – |

**Zustände**
- Standard, getrennt pro Formular.
- Erfolg bzw. Fehler (z. B. falsches aktuelles Passwort) je Formular unabhängig voneinander.

### 4.2.16 Adminbereich-Dialog

**Allgemeine Beschreibung**
- Zweck des Dialogs: Zentrale Verwaltungsaufgaben für Meldungen, Nutzer, Inserate und Audit-Log.
- Anwendungsfall: „Admin verwaltet Meldungen, Nutzer und Inserate".
- Ergebnis: Meldungen sind bearbeitet, Nutzer-/Inseratbestand ist gepflegt.
- Sichtbar für: Nur Nutzer mit Rolle `ADMIN`.

**Navigationsmöglichkeiten**

Interne Navigation über die Sidebar zwischen den vier Tabs „Meldungen", „Nutzer", „Inserate" und „Audit-Log". Aus dem Tab „Meldungen" gelangt man bei Inserat-Kontext zum (nur lesbaren) Inseratdetail-Dialog. Rücksprungmöglichkeit über „Abmelden" zurück zur Landingpage.

**Statik – Sidebar**

| Element | Typ | Funktion | Datenmodell | Use Case |
|---|---|---|---|---|
| Meldungen | Link/Button | Zeigt offene und geschlossene Meldungen | `REPORT.*` | UC13 |
| Nutzer | Link/Button | Zeigt alle registrierten Nutzerkonten | `USER.*` | UC14 |
| Inserate | Link/Button | Zeigt alle Inserate | `LISTING.*` | UC14 |
| Audit-Log | Link/Button | Zeigt chronologische Liste aller Admin-Aktionen | `AUDITLOGENTRY.*` | UC14 |

**Dynamik – Aktionsliste**

| Aktion | Auslöser | Wirkung | Datenmodell | Use Case |
|---|---|---|---|---|
| Bereich wechseln | Klick auf Sidebar-Element | Anzeige des gewählten Tabs | Kein Bezug | UC13 / UC14 |
| Meldung bearbeiten | Buttons im Tab „Meldungen" (schließen / löschen / verwarnen) | Setzt Meldung auf geschlossen, führt ggf. Maßnahme aus | `REPORT.*`, `LISTING.*`, `USER.warningMessage` | UC13 |
| Nutzer löschen | Button „Löschen" im Tab „Nutzer" | Prüft Selbst-/Admin-/aktive-Inserate-Regeln, löscht bei Erfolg das Konto | `USER.*` | UC14 |
| Inserat löschen | Button „Löschen" im Tab „Inserate" | Löscht das Inserat | `LISTING.*` | UC14 |
| Audit-Log lesen | Tab „Audit-Log" | Zeigt Log-Einträge (nur Lesefunktion) | `AUDITLOGENTRY.*` | UC14 |
| Impressum öffnen | Button „Impressum" | Navigation zum Impressum-Dialog | Kein Bezug | – |

**Zustände**
- Standard je Tab, Daten sind geladen.
- Fehler bei Löschversuch (z. B. Selbstlöschung, anderes Admin-Konto, noch aktive Inserate vorhanden — Aktion wird abgelehnt).
