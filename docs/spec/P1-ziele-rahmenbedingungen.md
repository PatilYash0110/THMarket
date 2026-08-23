# 1.1 Projektziel und Rahmenbedingungen

Wir entwickeln THMarket, eine Marktplatz-Website nur für Studierende der THM. Auf der Plattform können Studierende Sachen verkaufen oder vermieten und nach Angeboten von anderen Studierenden suchen. Wenn sich jemand für ein Inserat interessiert, läuft der Kontakt über einen Chat, der direkt in die Anwendung eingebaut ist. Bezahlt wird nicht über die Plattform selbst, das machen Käufer und Verkäufer unter sich aus.

Damit nur Studierende Zugriff haben, kann man sich nur mit einer THM-E-Mail-Adresse registrieren. Nach der Registrierung muss man erst einen Bestätigungslink in der E-Mail anklicken, bevor der Account freigeschaltet wird. So bleibt die Plattform auf den Hochschulkontext beschränkt und es entsteht ein einigermaßen vertrauenswürdiger Rahmen für den Handel zwischen Studierenden. Leute, die nicht eingeloggt sind, sehen nur die Login- und Registrierungsseite, sonst nichts.

Die wichtigsten Funktionen sind: Inserate erstellen (mit Bildern hochladen), den Marktplatz durchsuchen und filtern, Inserate als Favorit speichern, unangemessene Inserate melden und der Chat zur Kommunikation. Das Projekt ist aus unserer Sicht erfolgreich, wenn Registrierung und Verifizierung zuverlässig laufen, Inserate mit Bildern angelegt und wiedergefunden werden können, der Chat in Echtzeit funktioniert und die Oberfläche insgesamt klar und einfach zu bedienen ist.

## 1.2 Stakeholder

### Nutzende Stakeholder

| Stakeholder | Ziel / Interesse | Erwartungen an das System |
|---|---|---|
| Gast (unverifiziert) | Einstieg und Registrierung | klare Navigation sowie stabiler Registrierungs- und Verifizierungsprozess |
| Verifizierter Nutzer als Käufer | Artikel finden und kaufen | schnelle Suche, zuverlässige Filter, Favoriten und einfacher Chat-Kontakt |
| Verifizierter Nutzer als Verkäufer | Artikel inserieren und verkaufen | einfaches Anlegen von Inseraten, Bild-Upload sowie Chat- und Kaufverwaltung |
| Administrator | Betrieb und Moderation | sichere Admin-Oberfläche, Bearbeitung von Meldungen, abgestufte Maßnahmen |

### Projekt-Stakeholder

| Stakeholder | Ziel / Interesse | Erwartungen an das System |
|---|---|---|
| Entwickler | Wartung und Erweiterung | klar getrennte Module, verständliche APIs, nachvollziehbarer Entwicklungsworkflow |
| Lehrende / Prüfer | Bewertung | nachvollziehbare Anforderungen, messbare Ziele, verständliche Dokumentation |

# 1.3 Nicht-Projektziele

Ein paar Dinge haben wir bewusst nicht umgesetzt bzw. nur eingeschränkt:

| Punkt | Beschreibung |
|---|---|
| Echte Zahlungsabwicklung | Es gibt keine Anbindung an einen echten Zahlungsdienstleister. Der Kauf wird innerhalb der App simuliert; die tatsächliche Bezahlung und Übergabe der Ware klären Käufer und Verkäufer außerhalb der Plattform. |
| Versand / Logistik | Kein Versand- oder Liefersystem. Wie die Ware übergeben wird, müssen die Nutzer selbst regeln. |
| Öffentlicher Zugang | Ohne verifizierte THM-Mail kommt man nicht rein, die Plattform ist nicht öffentlich. |
| Mobile App | Nur im Browser nutzbar, keine eigene App fürs Handy. |
| Datenschutzprüfung durch Dritte | Weil es nur ein Prototyp ist, haben wir keine externe Datenschutzprüfung machen lassen. |

*Tabelle 1: Nicht enthaltene bzw. eingeschränkt umgesetzte Funktionen*