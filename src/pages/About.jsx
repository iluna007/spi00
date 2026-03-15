const GITHUB_REPO_URL = 'https://github.com/iluna007/spi00'

export default function About() {
  return (
    <main className="page about w-full flex-1 px-4 py-8">
      <h1 className="page-title mb-4 text-2xl font-semibold text-neutral-800">
        Info
      </h1>

      <div className="about-description mb-8 max-w-2xl space-y-4 text-neutral-600">
        <p>
          Este sitio es un <strong>mapeo espacial en 3D</strong> de la Parte I (<em>De
          Dios</em>) de la <em>Ética</em> de Spinoza, demostrada según el orden geométrico.
          Cada nodo representa un elemento del texto —definiciones, axiomas, proposiciones,
          demostraciones, corolarios y escolios— y las líneas entre ellos muestran las
          referencias y dependencias que articulan la estructura de la obra.
        </p>
        <p>
          Pensado como herramienta de exploración para la clase de filosofía de la
          Universidad de Costa Rica (UCR), bajo la guía de{' '}
          <a
            href="mailto:SERGIO.ROJAS@ucr.ac.cr"
            className="text-neutral-700 underline hover:text-neutral-900"
          >
            Sergio Rojas Peralta
          </a>
          . Se puede navegar por el grafo, seleccionar nodos para leer el contenido en
          el panel lateral y usar los enlaces del texto para saltar entre conceptos
          relacionados.
        </p>
      </div>

      <section className="mb-8 max-w-2xl">
        <h2 className="mb-2 text-lg font-medium text-neutral-800">Código fuente</h2>
        <p className="text-neutral-600">
          El proyecto está disponible en{' '}
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-700 underline hover:text-neutral-900"
          >
            GitHub
          </a>
          . Desarrollado con React, Three.js y react-force-graph-3d.
        </p>
      </section>

      <section className="mb-8 max-w-2xl">
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

      <section className="about-credits max-w-2xl text-neutral-600">
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
    </main>
  )
}
