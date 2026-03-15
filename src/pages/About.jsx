export default function About() {
  return (
    <main className="page about w-full flex-1 px-4 py-8">
      <h1 className="page-title mb-4 text-2xl font-semibold text-neutral-800">
        About
      </h1>

      <p className="about-description mb-6 max-w-2xl text-neutral-600">
        Diagrama o mapeo 3D espacial de la Parte I de la <em>Ética</em> de Spinoza:
        nodos por tipo (definiciones, axiomas, proposiciones, etc.) y enlaces por
        referencias entre ellos. Proyecto para la clase de filosofía de la
        Universidad de Costa Rica (UCR), impartida por{' '}
        <a
          href="mailto:SERGIO.ROJAS@ucr.ac.cr"
          className="text-neutral-700 underline hover:text-neutral-900"
        >
          Sergio Rojas Peralta
        </a>{' '}
        (SERGIO.ROJAS@ucr.ac.cr).
      </p>

      <section className="about-credits mb-8 max-w-2xl text-neutral-600">
        <p>
          © 2026{' '}
          <a
            href="https://ikerluna.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-700 underline hover:text-neutral-900"
          >
            Iker Luna
          </a>
        </p>
      </section>

      <section className="max-w-2xl">
        <h2 className="mb-2 text-lg font-medium text-neutral-800">Bibliografía</h2>
        <p className="text-neutral-600">
          Spinoza, Baruch. <em>Ética demostrada según el orden geométrico</em>. Edición
          digital ePubLibre, 2013.{' '}
          <a
            href="https://archive.org/details/spinoza-baruch.-etica-demostrada-segun-el-orden-geometrico-epl-fs-2013/mode/2up"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-700 underline hover:text-neutral-900"
          >
            Internet Archive
          </a>
          .
        </p>
      </section>
    </main>
  )
}
