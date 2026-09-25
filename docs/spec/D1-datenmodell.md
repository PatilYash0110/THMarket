# D1 Datenmodell

Zentrale Entität ist USER. Jeder Nutzer kann mehrere Inserate als Verkäufer anlegen (sellerId) und nach einem Kauf als Käufer referenziert werden (buyerId). Favoriten bilden die n:m-Beziehung zwischen Nutzer und Inserat ab. Meldungen (REPORT) referenzieren wahlweise ein Inserat oder einen Nutzer als Ziel und protokollieren zusätzlich einen Snapshot des gemeldeten Namens/Titels, damit die Meldung auch nach einer späteren Löschung noch lesbar bleibt. Für den Chat wird pro Inserat und Interessent eine CONVERSATION angelegt, die mehrere MESSAGE-Einträge enthält. Jede Admin-Aktion wird als AUDITLOGENTRY protokolliert. Ändert ein Nutzer sein Passwort, wird USER.passwordChangedAt gesetzt — alle zuvor ausgestellten Sitzungstoken (JWTs) werden dadurch serverseitig ungültig.

Die meisten Fremdschlüssel-Beziehungen sind bewusst nullable und nutzen SET NULL beim Löschen der referenzierten Seite (z. B. LISTING.sellerId, REPORT.reporterId, CONVERSATION.buyerId). Dadurch bleiben abhängige Datensätze gelöschter Konten oder Inserate (wie abgeschlossene Käufe, Meldungen oder Chatverläufe) weiterhin lesbar, anstatt kaskadierend gelöscht zu werden.

Es gibt bewusst keine eigenständigen Entitäten für Bilder, Kategorien, Transaktionen oder Bewertungen. Bilder sind eine einfache URL-Liste direkt am Inserat, die Kategorie ist ein Textfeld mit fester Werteliste, ein Kauf wird durch das Setzen von status/buyerId am Inserat selbst abgebildet.

*Abbildung 1: Datenmodell von THMarket (ER-Diagramm)*

<details>
<summary>Diagramm anzeigen</summary>

```mermaid
erDiagram
    USER {
        string id PK
        string email UK "eindeutig, nur @thm.de"
        string name
        string passwordHash "intern, nie an Frontend gesendet"
        string role "STUDENT oder ADMIN"
        boolean verified
        string emailVerificationToken UK "intern, nullable"
        datetime emailVerificationExpires "nullable, Token-Ablauf 24 h"
        datetime emailVerificationSentAt "nullable, für 60-Sekunden-Resend-Cooldown"
        string passwordResetToken UK "intern, nullable"
        datetime passwordResetExpires "nullable, Token-Ablauf 1 h"
        datetime passwordChangedAt "nullable, entwertet ältere Sitzungen (JWTs)"
        int balanceCents
        string warningMessage "nullable, sichtbar nur im eigenen Profil"
        datetime createdAt
        datetime updatedAt
    }

    LISTING {
        string id PK
        string title
        string description
        int priceCents
        string category
        string_array images "Cloudinary-URLs, kein eigenes Bild-Modell"
        boolean sofortkaufMoeglich
        string status "AKTIV oder VERKAUFT"
        string sellerId FK "nullable, SetNull bei Konto-Löschung"
        string buyerId FK "nullable, nur bei VERKAUFT gesetzt"
        datetime createdAt
        datetime updatedAt
    }

    FAVORITE {
        string id PK
        string userId FK "erforderlich, Cascade, UK(userId+listingId)"
        string listingId FK "erforderlich, Cascade, UK(userId+listingId)"
        datetime createdAt
    }

    REPORT {
        string id PK
        string targetType "LISTING oder USER"
        string reason
        string message "optional"
        string status "OFFEN oder GESCHLOSSEN"
        string targetLabel "Snapshot, bleibt lesbar nach Löschung"
        string reporterId FK "nullable, SetNull"
        string listingId FK "nullable — Ziel bei LISTING, Kontext bei USER"
        string reportedUserId FK "nullable, SetNull"
        string conversationId FK "nullable, nur bei USER-Meldung aus Chat"
        datetime createdAt
        datetime resolvedAt "nullable"
    }

    AUDITLOGENTRY {
        string id PK
        string actorId FK "nullable, SetNull — welcher Admin"
        string action "Freitext-Beschreibung"
        string targetType "nullable, kein Live-FK"
        string targetId "nullable, kein Live-FK"
        datetime createdAt
    }

    CONVERSATION {
        string id PK
        string listingId FK "nullable, SetNull"
        string listingTitle "Snapshot, nullable"
        string buyerId FK "nullable, SetNull, UK(listingId+buyerId)"
        string sellerId FK "nullable, SetNull"
        datetime buyerLastReadAt "nullable, für Ungelesen-Zähler"
        datetime sellerLastReadAt "nullable, für Ungelesen-Zähler"
        datetime createdAt
    }

    MESSAGE {
        string id PK
        string conversationId FK "erforderlich, Cascade"
        string senderId FK "nullable, SetNull"
        string text
        datetime createdAt
    }

    USER |o--o{ LISTING : "verkauft"
    USER |o--o{ LISTING : "kauft"
    USER ||--o{ FAVORITE : "merkt"
    LISTING ||--o{ FAVORITE : "gemerkt von"
    USER |o--o{ REPORT : "meldet"
    USER |o--o{ REPORT : "gemeldet"
    LISTING |o--o{ REPORT : "Ziel von"
    CONVERSATION |o--o{ REPORT : "Kontext von"
    USER |o--o{ AUDITLOGENTRY : "führt aus"
    LISTING |o--o{ CONVERSATION : "betrifft"
    USER |o--o{ CONVERSATION : "kauft in"
    USER |o--o{ CONVERSATION : "verkauft in"
    CONVERSATION ||--o{ MESSAGE : "enthält"
    USER |o--o{ MESSAGE : "sendet"
```

</details>

*(Mermaid-Quelldatei: [`diagrams-code/d1-datenmodell.mermaid`](diagrams-code/d1-datenmodell.mermaid))*
