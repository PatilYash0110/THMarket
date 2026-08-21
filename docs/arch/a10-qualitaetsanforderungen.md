# 10. Qualitätsanforderungen

| Qualität | Szenario | Erwartete Reaktion |
| :--- | :--- | :--- |
| **Performance** | Nutzer sucht einen Artikel | Ergebnisliste erscheint in unter 2 s. |
| **Performance** | Nutzer sendet eine Chat-Nachricht | Empfänger sieht sie in unter 1 s. |
| **Robustheit** | Gemini ist nicht erreichbar | Inserat bleibt erstellbar; klare Meldung; manuelle Eingabe möglich. |
| **Sicherheit** | Nicht-THM- oder unverifiziertes Konto versucht Login | Anmeldung wird abgelehnt. |
| **Datenschutz** | Admin versucht, einen fremden Chat zu lesen | Kein Zugriff ohne Meldung und Einwilligung. |
| **Erweiterbarkeit** | Neue Kategorie soll ergänzt werden | Integration in einem Sprint ohne Breaking Change. |