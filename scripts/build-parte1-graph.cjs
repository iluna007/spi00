/**
 * Lee todos los .md de public/Obsidian/spi1/Parte 1 (y subcarpetas),
 * extrae enlaces [[...]] y genera parte1-graph.json para el grafo 3D.
 */
const fs = require('fs')
const path = require('path')

const parte1Dir = path.join(__dirname, '../public/Obsidian/spi1/Parte 1')
const outPath = path.join(__dirname, '../public/parte1-graph.json')

const LINK_REGEX = /\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g

function getAllMdFiles(dir, baseDir = dir) {
  const result = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      result.push(...getAllMdFiles(full, baseDir))
    } else if (e.name.endsWith('.md')) {
      const relative = path.relative(baseDir, full)
      result.push({ fullPath: full, relativePath: relative, name: e.name })
    }
  }
  return result
}

function typeFromPath(relativePath) {
  const folder = relativePath.split(path.sep)[0]
  const lower = folder.toLowerCase()
  if (lower === 'axiomas') return 'axioma'
  if (lower === 'definiciones') return 'definicion'
  if (lower === 'proposiciones') return 'proposicion'
  if (lower === 'demostraciones') return 'demostracion'
  if (lower === 'corolarios') return 'corolario'
  if (lower === 'escolios') return 'escolio'
  return 'indice'
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

const files = getAllMdFiles(parte1Dir)
const idByBasename = new Map() // basename (sin .md) -> id (nombre del archivo sin .md)
const nodes = []
const nodeById = new Map()

for (const { fullPath, relativePath, name } of files) {
  const id = name.replace(/\.md$/, '')
  idByBasename.set(id, id)
  const type = typeFromPath(relativePath)
  const node = {
    id,
    name: id,
    type,
    val: 1,
    color: TYPE_COLORS[type] || '#64748b',
    path: relativePath.replace(/\\/g, '/'), // ruta para cargar el .md en el panel
  }
  nodes.push(node)
  nodeById.set(id, node)
}

// Enlaces: por cada archivo, extraer [[X]] y crear link source -> target (id del archivo actual -> X)
const linkSet = new Set()
const links = []

for (const { fullPath, relativePath, name } of files) {
  const sourceId = name.replace(/\.md$/, '')
  const content = fs.readFileSync(fullPath, 'utf8')
  let m
  LINK_REGEX.lastIndex = 0
  while ((m = LINK_REGEX.exec(content)) !== null) {
    const targetName = m[1].trim()
    if (!targetName) continue
    // El enlace puede ser "Proposicion 1" o "Demostracion 1 - Proposicion 1"; el id en nuestra red es el nombre del archivo
    const targetId = idByBasename.get(targetName) || targetName
    if (targetId === sourceId) continue
    if (!nodeById.has(targetId)) continue // solo enlaces a nodos que existen
    const key = `${sourceId}\0${targetId}`
    if (linkSet.has(key)) continue
    linkSet.add(key)
    links.push({ source: sourceId, target: targetId, value: 1 })
  }
}

// Grado por nodo para val (tamaño)
const degree = {}
nodes.forEach((n) => { degree[n.id] = 0 })
links.forEach((l) => {
  degree[l.source] = (degree[l.source] || 0) + 1
  degree[l.target] = (degree[l.target] || 0) + 1
})
nodes.forEach((n) => { n.val = Math.max(1, degree[n.id]) })

const graph = { nodes, links }
fs.writeFileSync(outPath, JSON.stringify(graph, null, 0), 'utf8')
console.log('Written', outPath, '| nodes:', nodes.length, '| links:', links.length)
