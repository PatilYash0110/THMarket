export function Impressum() {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-10 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Impressum</h1>
          <p className="mt-2 text-xs text-foreground-muted">
            Platzhalterinhalt (Phase 1) — wird vor Veröffentlichung durch die echten Angaben ersetzt.
          </p>
        </div>
  
        <section className="flex flex-col gap-2 text-sm text-foreground-muted">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Angaben gemäß § 5 TMG
          </h2>
          <p>
            Max Mustermann
            <br />
            Musterstraße 1
            <br />
            35390 Gießen
          </p>
        </section>
  
        <section className="flex flex-col gap-2 text-sm text-foreground-muted">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Kontakt</h2>
          <p>
            E-Mail: max.mustermann@mnd.thm.de
            <br />
            Telefon: +49 (0) 000 00000
          </p>
        </section>
  
        <section className="flex flex-col gap-2 text-sm text-foreground-muted">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
          </h2>
          <p>
            Max Mustermann
            <br />
            Musterstraße 1
            <br />
            35390 Gießen
          </p>
        </section>
  
        <section className="flex flex-col gap-2 text-sm text-foreground-muted">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Hinweis zum Projektstatus
          </h2>
          <p>
            THMarket ist ein studentisches Projekt im Rahmen des Kurses „Projekt 1 –
            Softwaretechnik“ an der Technischen Hochschule Mittelhessen (THM) und dient
            ausschließlich Demonstrations- und Lehrzwecken. Es besteht kein kommerzieller Betrieb.
          </p>
        </section>
  
        <section className="flex flex-col gap-2 text-sm text-foreground-muted">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Haftungsausschluss
          </h2>
          <p>
            <strong className="text-foreground">Haftung für Inhalte:</strong> Als Diensteanbieter
            sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
            verantwortlich. Für nutzergenerierte Inserate und Chatnachrichten sind die jeweiligen
            Nutzer:innen selbst verantwortlich.
          </p>
          <p>
            <strong className="text-foreground">Haftung für Links:</strong> Unser Angebot enthält
            ggf. Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
          </p>
          <p>
            <strong className="text-foreground">Urheberrecht:</strong> Die durch die Betreiber
            erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
          </p>
        </section>
      </div>
    )
  }
