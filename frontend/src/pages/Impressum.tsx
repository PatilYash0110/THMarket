export function Impressum() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 py-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Impressum</h1>
      </div>

      <section className="flex flex-col gap-2 text-sm text-foreground-muted">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
          Angaben gemäß § 5 TMG
        </h2>
        <p>
          Yash Patil
          <br />
          Konrad-Adenauer-Straße 20
          <br />
          61191 Rosbach
        </p>
      </section>

      <section className="flex flex-col gap-2 text-sm text-foreground-muted">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Kontakt</h2>
        <p>E-Mail: yash.umesh.patil@mnd.thm.de</p>
      </section>

      <section className="flex flex-col gap-2 text-sm text-foreground-muted">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
        </h2>
        <p>
          Yash Patil
          <br />
          Konrad-Adenauer-Straße 20
          <br />
          61191 Rosbach
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
    </div>
  )
}
