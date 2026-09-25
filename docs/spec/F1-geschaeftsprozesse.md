# F1 Geschäftsprozesse

THMarket unterstützt den Verkauf und die Vermietung von Gegenständen zwischen Studierenden der THM. Der zentrale Geschäftsprozess beginnt mit der Registrierung eines Nutzers und reicht über die Nutzung des Marktplatzes bis zur Kontaktaufnahme zwischen Interessent und Anbieter. Zusätzlich gibt es Verwaltungs- und Moderationsprozesse, die durch einen Administrator durchgeführt werden.

## F1.1 Akteure

In THMarket gibt es vier Akteure. Jeder hat eigene Rechte und typische Aktionen und bildet die Grundlage für die in Kapitel F2 beschriebenen Use Cases.

<br>

<img src="https://github.com/user-attachments/assets/6d53244e-b717-450f-bd2f-b73aa9c9e509" width="70" align="left">

### 1. Gast

Der Gast ist ein Besucher ohne aktive Sitzung. Er sieht ausschließlich die Landingpage, das Impressum sowie Registrierung und Login — keine Inserate, keine Nutzerdaten.

**Typische Aktionen:**
- Registrierung durchführen (UC01)
- Login starten (UC02)
- Passwort-zurücksetzen-Vorgang starten (UC03)

<br clear="left">
<br>

<img src="https://github.com/user-attachments/assets/ac005b44-bfa9-4ecd-8881-cca7f463e6ad" width="70" align="left">

### 2. Registrierter Nutzer

Der registrierte Nutzer hat ein Konto angelegt, dessen E-Mail-Adresse aber noch nicht über den Bestätigungslink verifiziert wurde. Er kann sich noch nicht anmelden; die einzige mögliche Aktion ist, den Verifizierungslink zu öffnen oder einen neuen anzufordern.

**Typische Aktionen:**
- Verifizierungslink öffnen (Teil von UC01)
- Neuen Verifizierungslink anfordern (Teil von UC01)

<br clear="left">
<br>

<img src="https://github.com/user-attachments/assets/c450bc9b-9f55-437e-b1aa-6c6f47fbff1c" width="70" align="left">

### 3. Student (angemeldet)

Der Student ist die aktive Form eines verifizierten Nutzers nach erfolgreichem Login (Rolle `STUDENT`). Er hat Zugriff auf sämtliche Marktplatzfunktionen: Inserate durchsuchen, erstellen und verwalten, chatten, kaufen, sein In-App-Guthaben verwalten sowie Inserate und Nutzer melden.

**Typische Aktionen:**
- Inserate durchsuchen und favorisieren (UC06)
- Inserat erstellen und verwalten (UC04, UC05)
- Anbieter kontaktieren / chatten (UC07)
- Kauf abschließen (UC08)
- Guthaben aufladen und auszahlen (UC09, UC10)
- Inserat oder Nutzer melden (UC11, UC12)

<br clear="left">
<br>

<img src="https://github.com/user-attachments/assets/6fae5b2b-5042-4211-9399-97b4e80501bb" width="70" align="left">

### 4. Administrator

Der Administrator ist ein spezieller Akteur mit Rolle `ADMIN`, angelegt über ein Seed-Skript. Er meldet sich über denselben Login-Dialog an wie ein Student, sieht nach dem Login aber eine eigene, rollenbasierte Oberfläche statt des Marktplatzes. Er nutzt selbst keine Marktplatzfunktionen und kann insbesondere keine eigenen Inserate erstellen.

**Typische Aktionen:**
- Meldungen bearbeiten (UC13)
- Nutzerkonten verwalten, insbesondere löschen (UC14)
- Inserate verwalten, insbesondere löschen (UC14)
- Audit-Log einsehen (UC14)

<br clear="left">

## F1.2 Typischer Geschäftsprozess

Der typische Lebenszyklus eines Nutzers durchläuft folgende Stationen, die in den Use Cases UC01–UC14 im Detail beschrieben sind:

*Abbildung 1: Geschäftsprozessüberblick von THMarket (gestrichelt = optionaler Pfad, grau = Admin-Pfad)*

<details>
<summary>Diagramm anzeigen</summary>

```mermaid
flowchart TD
    Start(["Start"]) --> UC01["UC01\nRegistrieren"]
    Start --> UC02["UC02\nAnmelden"]
    UC01 --> Verif["E-Mail bestätigen"]
    Verif --> UC02
    UC02 -. "Passwort vergessen?" .-> UC03["UC03\nPasswort zurücksetzen"]
    UC03 -.-> UC02

    UC02 --> UC06["UC06\nInserate durchsuchen\nund favorisieren"]

    UC06 --> Wahl{"eigenes oder\nfremdes Inserat?"}
    Wahl -- "eigenes" --> UC04["UC04\nInserat erstellen"]
    UC04 --> UC05["UC05\nInserat verwalten"]
    Wahl -- "eigenes (bestehend)" --> UC05

    Wahl -- "fremdes" --> Aktion{"direkt kaufen\noder erst fragen?"}
    Aktion -- "Sofortkauf" --> UC08["UC08\nKauf abschließen"]
    Aktion -- "Frage / Verhandlung" --> UC07["UC07\nAnbieter kontaktieren\n(Chat)"]
    UC07 --> UC08

    UC09["UC09\nGuthaben aufladen"] -. " Kauf mit Guthaben" .-> UC08
    UC02 -. "bei Bedarf" .-> UC09
    UC08 == "Verkäufer erhält Guthaben" ==> UC10["UC10\nGuthaben auszahlen"]

    UC06 -. "bei Bedarf" .-> UC11["UC11\nInserat melden"]
    UC07 -. "bei Bedarf" .-> UC12["UC12\nNutzer melden"]

    subgraph AdminPfad["Admin-Pfad"]
        direction TB
        UC13["UC13\nMeldungen bearbeiten"] --> UC14["UC14\nAdmin-Verwaltung\n(Nutzer / Inserate / Audit-Log)"]
    end
    UC02 -. "als Admin" .-> UC13
    UC11 -.-> UC13
    UC12 -.-> UC13

    classDef optional stroke-dasharray: 4 3
    class UC03,UC11,UC12 optional
    classDef admin fill:#6b7280,stroke:#6b7280,color:#ffffff
    class UC13,UC14 admin
```

</details>

*(Mermaid-Quelldatei: [`diagrams-code/f1-geschaeftsprozess.mermaid`](diagrams-code/f1-geschaeftsprozess.mermaid))*
