import { useState, useEffect } from 'react'

const GITHUB_REPO_URL = 'https://github.com/iluna007/spi00'
const ASCII_ART_URL = '/images/ascii.txt'

const CONTENT_WIDTH = 'max-w-2xl'

function useSpinozaAscii() {
  const [text, setText] = useState('')
  useEffect(() => {
    fetch(ASCII_ART_URL)
      .then((r) => r.text())
      .then(setText)
      .catch(() => setText(''))
  }, [])
  return text
}

const HIERARCHY_ITEMS = [
  { label: 'DEFINICIONES', color: '#b45309', role: 'Establecen el significado preciso de los términos. Son el suelo del sistema.', note: 'Spinoza tiende a formularlas genéticamente: no describen atributos sino el proceso que produce la cosa. Una definición mal planteada corrompe todo lo que se construye sobre ella.' },
  { label: 'AXIOMAS', color: '#0d9488', role: 'Verdades que se consideran evidentes por sí mismas. No se demuestran.', note: 'Ej.: "Todo lo que existe, existe en sí mismo o en otra cosa" (Ax. I, Parte I). Son el otro pilar del sistema junto a las definiciones. Su evidencia es, en algunos casos, discutible.' },
  { label: 'PROPOSICIONES', color: '#7c3aed', role: 'Afirmaciones que Spinoza demuestra a partir de lo anterior. Son el cuerpo del argumento.', note: 'Cada proposición cita explícitamente qué definición, axioma o proposición previa la sostiene. La cadena puede rastrearse hacia atrás hasta los primeros principios.' },
  { label: 'DEMOSTRACIONES', color: '#2563eb', role: 'El razonamiento que establece cada proposición. Citan sus fuentes explícitamente.', note: 'El formato geométrico no garantiza que las demostraciones sean válidas — solo que tienen esa forma. Muchas son disputadas por los intérpretes.' },
  { label: 'COROLARIOS', color: '#059669', role: 'Consecuencias que se siguen directamente de una proposición ya demostrada.', note: 'Spinoza los considera suficientemente obvios como para no requerir demostración completa. Son derivaciones inmediatas.' },
  { label: 'ESCOLIOS', color: '#c2410c', role: 'Notas discursivas donde el tono cambia completamente. No tienen función demostrativa formal.', note: 'Aquí Spinoza responde objeciones, aclara malentendidos, y desarrolla consecuencias que el formato demostrativo no permite. Algunos de los pasajes más importantes del libro están en escolios.' },
]

export default function About() {
  const asciiFromFile = useSpinozaAscii()
  const portraitDisplay = asciiFromFile.trim()

  return (
    <main className="page about w-full min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:py-8">
      

      <section className={`about-portrait mb-8 w-full ${CONTENT_WIDTH}`}>
        <pre
          className="font-mono w-full leading-none text-neutral-700 overflow-x-auto"
          style={{
            fontFamily: 'var(--font-app), ui-monospace, monospace',
            fontSize: portraitDisplay.length > 2000 ? '6px' : '10px',
          }}
          aria-hidden
        >
          {portraitDisplay}
        </pre>
     
      </section>

      <div className={`about-description mb-8 ${CONTENT_WIDTH} space-y-4 text-neutral-600`}>
        <p>
          Este sitio es un <strong>mapeo espacial en 3D</strong> de la Parte I,II,III,IV y V de la <em>Ética demostrada
               según el orden geométrico. </em>
          Cada nodo representa un elemento del texto —definiciones, axiomas, proposiciones,
          demostraciones, corolarios y escolios— y las líneas entre ellos muestran las
          referencias y dependencias que articulan la estructura de la obra.
        </p>
        <p>
          Pensado como herramienta de exploración para la clase de filosofía de la
          Universidad de Costa Rica (UCR), bajo la guía de{' '}
          <a href="mailto:SERGIO.ROJAS@ucr.ac.cr" className="text-neutral-700 underline hover:text-neutral-900">
            Sergio Rojas Peralta
          </a>
          . Se puede navegar por el grafo, seleccionar nodos para leer el contenido en
          el panel lateral y usar los enlaces del texto para saltar entre conceptos
          relacionados.
        </p>
      </div>


      <section className={`mb-8 ${CONTENT_WIDTH}`}>
        <h2 className="mb-3 text-lg font-medium text-neutral-800 border-b border-neutral-200 pb-2">
          Jerarquía lógica — cómo se sostiene el sistema
        </h2>
        <div className="border border-neutral-200 rounded overflow-hidden divide-y divide-neutral-200">
          {HIERARCHY_ITEMS.map(({ label, color, role, note }) => (
            <div key={label} className="flex gap-3 p-4 hover:bg-neutral-50 transition-colors sm:grid sm:grid-cols-[140px_1fr]">
              <div className="flex items-start gap-2 shrink-0 sm:border-r sm:border-neutral-200 sm:pr-3">
                <span className="mt-0.5 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{label}</span>
              </div>
              <div className="min-w-0">
                <p className="text-neutral-800 text-sm leading-snug mb-1">{role}</p>
                <p className="text-neutral-500 text-sm italic leading-snug">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      <section className={`mb-8 ${CONTENT_WIDTH}`}>
        <h2 className="mb-2 text-lg font-medium text-neutral-800">Código fuente</h2>
        <p className="text-neutral-600">
          El proyecto está disponible en{' '}
          <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-neutral-700 underline hover:text-neutral-900">
            GitHub
          </a>
          . Desarrollado con React, Three.js y react-force-graph-3d.
        </p>
      </section>

      <section className={`mb-8 ${CONTENT_WIDTH}`}>
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

      <section className={`about-credits ${CONTENT_WIDTH} text-neutral-600`}>
        <p>
          © 2026{' '}
          <a href="https://ikerluna.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-neutral-700 underline hover:text-neutral-900">
            Iker Luna
          </a>
        </p>
      </section>
    </main>
  )
}
