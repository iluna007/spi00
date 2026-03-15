/**
 * Genera todos los .md de Partes 2–5 según la estructura del grafo.
 * Ejecutar: node scripts/generate-part-md.cjs
 */
const fs = require('fs')
const path = require('path')

const PARTS = [
  { folder: 'Parte 2', title: 'De la naturaleza y origen del alma', defs: 5, axioms: 5, props: 15 },
  { folder: 'Parte 3', title: 'Del origen y naturaleza de los afectos', defs: 3, axioms: 2, props: 20 },
  { folder: 'Parte 4', title: 'De la servidumbre humana', defs: 4, axioms: 1, props: 25 },
  { folder: 'Parte 5', title: 'De la potencia del entendimiento', defs: 2, axioms: 1, props: 20 },
]

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV']

const baseDir = path.join(__dirname, '..', 'public', 'Obsidian', 'spi1')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function writeMd(filePath, content) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, content, 'utf8')
}

function defContent(part, i) {
  const r = ROMAN[i] || String(i + 1)
  return `# Definición ${r} — ${part.folder} (${part.title})
#definicion

Contenido por añadir.

---
*Spinoza, Ética demostrada según el orden geométrico.*
`
}

function axiomContent(part, i) {
  const r = ROMAN[i] || String(i + 1)
  return `# Axioma ${r} — ${part.folder}
#axioma

Contenido por añadir.

---
*Spinoza, Ética demostrada según el orden geométrico.*
`
}

function propContent(part, i) {
  const r = ROMAN[i] || String(i + 1)
  return `# Proposición ${r} — ${part.folder}
#proposicion

Contenido por añadir.

---
*Spinoza, Ética demostrada según el orden geométrico.*
`
}

PARTS.forEach((part) => {
  const root = path.join(baseDir, part.folder)
  for (let i = 0; i < part.defs; i++) {
    writeMd(path.join(root, 'Definiciones', `Definicion ${i + 1}.md`), defContent(part, i))
  }
  for (let i = 0; i < part.axioms; i++) {
    writeMd(path.join(root, 'Axiomas', `Axioma ${i + 1}.md`), axiomContent(part, i))
  }
  for (let i = 0; i < part.props; i++) {
    writeMd(path.join(root, 'Proposiciones', `Proposicion ${i + 1}.md`), propContent(part, i))
  }
})

console.log('Generados todos los .md de Partes 2–5.')
