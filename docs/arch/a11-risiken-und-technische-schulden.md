# 11. Risiken und technische Schulden

| Risiko / Schuld | Auswirkung | Gegenmaßnahme |
| :--- | :--- | :--- |
| **Render-Kaltstart (Free Tier)** | Erste Anfrage nach Inaktivität verzögert | Hinweis in der UI; optionaler Health-Ping |
| **Gemini Free-Tier-Limit / Ausfall** | KI-Beschreibung zeitweise nicht verfügbar | Manueller Fallback; Rate-Limiting; Caching |
| **Simulierte statt echte Zahlung** | Keine reale Kaufabwicklung | Bewusste Scope-Entscheidung; klar dokumentiert |
| **Kein THM-SSO** | Verifizierung nur per E-Mail-Domain; Missbrauch fremder @thm.de-Adressen denkbar | Einmal-Token mit Ablauf; Rate-Limiting |
| **Chat-Moderation vs. Datenschutz** | Missbrauch im Chat schwerer verfolgbar | Meldung mit Einwilligung; gezielter Konversations-Bezug |
| **Solo-Projekt** | Begrenzte Testabdeckung | Fokus auf Kernpfade; CI mit Lint/Build/Test |