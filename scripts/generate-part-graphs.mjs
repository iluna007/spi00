/**
 * Genera parte2-graph.json, parte3-graph.json, parte4-graph.json, parte5-graph.json
 * escaneando public/Obsidian/spi1/Parte N/ y creando un nodo por cada .md.
 * Uso: node scripts/generate-part-graphs.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.join(__dirname, '..', 'public')
const OBSIDIAN_BASE = path.join(PUBLIC, 'Obsidian', 'spi1')

const FOLDER_TO_TYPE = {
  Definiciones: 'definicion',
  Axiomas: 'axioma',
  Proposiciones: 'proposicion',
  Demostraciones: 'demostracion',
  Corolarios: 'corolario',
  Escolios: 'escolio',
}

const TYPE_COLORS = {
  definicion: '#7c3aed',
  axioma: '#059669',
  proposicion: '#0ea5e9',
  demostracion: '#f59e0b',
  corolario: '#ec4899',
  escolio: '#8b5cf6',
  indice: '#64748b',
}

const PART_INDICE_NAMES = {
  2: 'Parte 2 - De la Mente',
  3: 'Parte 3 - De Los Afectos',
  4: 'Parte 4 - De la Servidumbre',
  5: 'Parte 5 - De la Libertad',
}

function collectMdFiles(dir, baseDir, list) {
  list = list || []
  if (!fs.existsSync(dir)) return list
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    const rel = path.relative(baseDir, full).replace(/\\/g, '/')
    if (e.isDirectory()) {
      collectMdFiles(full, baseDir, list)
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
      list.push(rel)
    }
  }
  return list
}

function relToTypeAndPath(rel) {
  const parts = rel.split('/')
  if (parts.length === 1) {
    return { type: 'indice', path: rel }
  }
  const folder = parts[0]
  const type = FOLDER_TO_TYPE[folder] || 'proposicion'
  return { type, path: rel }
}

function buildGraph(partNum) {
  const partDir = path.join(OBSIDIAN_BASE, 'Parte ' + partNum)
  const mdFiles = collectMdFiles(partDir, partDir)
  const nodes = []
  const nodeIds = new Set()

  for (const rel of mdFiles) {
    const info = relToTypeAndPath(rel)
    const nameWithoutExt = path.basename(rel, '.md')
    const id = nameWithoutExt
    if (nodeIds.has(id)) continue
    nodeIds.add(id)
    nodes.push({
      id,
      name: id,
      type: info.type,
      val: 1,
      color: TYPE_COLORS[info.type],
      path: rel,
    })
  }

  const indiceNode = nodes.find(function (n) { return n.type === 'indice' })
  const contentNodes = indiceNode ? nodes.filter(function (n) { return n.id !== indiceNode.id }) : nodes
  const links = []
  if (indiceNode) {
    for (const n of contentNodes) {
      links.push({ source: indiceNode.id, target: n.id, value: 1 })
    }
  }

  const degree = {}
  nodes.forEach(function (n) { degree[n.id] = 0 })
  links.forEach(function (l) {
    degree[l.source] = (degree[l.source] || 0) + 1
    degree[l.target] = (degree[l.target] || 0) + 1
  })
  nodes.forEach(function (n) { n.val = Math.max(1, degree[n.id]) })

  return { nodes, links }
}

function main() {
  for (const partNum of [2, 3, 4, 5]) {
    const graph = buildGraph(partNum)
    const outPath = path.join(PUBLIC, 'parte' + partNum + '-graph.json')
    fs.writeFileSync(outPath, JSON.stringify(graph), 'utf8')
    console.log('parte' + partNum + '-graph.json: ' + graph.nodes.length + ' nodes, ' + graph.links.length + ' links')
  }
}

main()
