/**
 * Genera parte2-graph.json, parte3-graph.json, parte4-graph.json, parte5-graph.json
 * escaneando public/Obsidian/spi1/Parte N/ y creando un nodo por cada .md.
 * enlaces [[...]] del contenido para generar las conexiones entre nodos (como en Parte 1).
 * Uso: node scripts/generate-part-graphs.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.join(__dirname, '..', 'public')
const OBSIDIAN_BASE = path.join(PUBLIC, 'Obsidian', 'spi1')

const LINK_REGEX = /\[\[([^\]]+)(?:\|[^\]]*)?\]\]/g

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

function normalizeId(s) {
  return (s || '').trim().replace(/ó/g, 'o').replace(/í/g, 'i').replace(/á/g, 'a').replace(/é/g, 'e').replace(/ú/g, 'u')
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
  const nodeById = new Map()
  const idByBasename = new Map()

  for (const rel of mdFiles) {
    const info = relToTypeAndPath(rel)
    const nameWithoutExt = path.basename(rel, '.md')
    const id = nameWithoutExt
    if (nodeIds.has(id)) continue
    nodeIds.add(id)
    const node = {
      id,
      name: id,
      type: info.type,
      val: 1,
      color: TYPE_COLORS[info.type],
      path: rel,
    }
    nodes.push(node)
    nodeById.set(id, node)
    idByBasename.set(id, id)
    idByBasename.set(normalizeId(id), id)
  }

  const linkSet = new Set()
  const links = []

  for (const node of nodes) {
    const fullPath = path.join(partDir, node.path)
    if (!fs.existsSync(fullPath)) continue
    let content
    try {
      content = fs.readFileSync(fullPath, 'utf8')
    } catch (_) {
      continue
    }
    const sourceId = node.id
    let m
    LINK_REGEX.lastIndex = 0
    while ((m = LINK_REGEX.exec(content)) !== null) {
      const targetName = m[1].trim()
      if (!targetName) continue
      const targetId = idByBasename.get(targetName) || idByBasename.get(normalizeId(targetName)) || targetName
      if (targetId === sourceId) continue
      if (!nodeById.has(targetId)) continue
      const key = sourceId + '\0' + targetId
      if (linkSet.has(key)) continue
      linkSet.add(key)
      links.push({ source: sourceId, target: targetId, value: 1 })
    }
  }

  const indiceNode = nodes.find(function (n) { return n.type === 'indice' })
  if (indiceNode) {
    for (const n of nodes) {
      if (n.id === indiceNode.id) continue
      const key = indiceNode.id + '\0' + n.id
      if (!linkSet.has(key)) {
        linkSet.add(key)
        links.push({ source: indiceNode.id, target: n.id, value: 1 })
      }
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

const PART_INDEX_NAMES = {
  1: 'Parte 1 - De Dios',
  2: 'Parte 2 - De la Mente',
  3: 'Parte 3 - De Los Afectos',
  4: 'Parte 4 - De la Servidumbre',
  5: 'Parte 5 - De la Libertad',
}

function buildTodasGraph() {
  const allNodes = []
  const allLinks = []
  const linkSet = new Set()

  function addLink(source, target, value) {
    value = value ?? 1
    const key = source + '\0' + target
    if (linkSet.has(key)) return
    linkSet.add(key)
    allLinks.push({ source, target, value })
  }

  for (const partNum of [1, 2, 3, 4, 5]) {
    const key = 'parte' + partNum
    const folderName = 'Parte ' + partNum
    const jsonPath = path.join(PUBLIC, 'parte' + partNum + '-graph.json')
    if (!fs.existsSync(jsonPath)) continue
    let data
    try {
      data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    } catch (_) {
      continue
    }
    const nodes = data.nodes || []
    const links = data.links || []
    const indiceNode = nodes.find(function (n) { return n.type === 'indice' })
    const indiceId = indiceNode ? indiceNode.id : null
    const idMap = new Map()
    if (indiceNode) {
      allNodes.push({
        id: key,
        name: PART_INDEX_NAMES[partNum] || indiceNode.name,
        type: 'indice',
        val: 1,
        color: TYPE_COLORS.indice,
        folderName,
        path: indiceNode.path || folderName + ' - .md',
      })
      idMap.set(indiceId, key)
    }
    nodes.forEach(function (n) {
      if (n.type === 'indice') return
      const prefixedId = key + '-' + n.id
      idMap.set(n.id, prefixedId)
      allNodes.push({
        id: prefixedId,
        name: n.name,
        type: n.type,
        val: n.val ?? 1,
        color: n.color || TYPE_COLORS[n.type],
        folderName,
        path: n.path,
      })
    })
    links.forEach(function (l) {
      const src = typeof l.source === 'object' ? l.source.id : l.source
      const tgt = typeof l.target === 'object' ? l.target.id : l.target
      const srcId = idMap.get(src) || (indiceId === src ? key : key + '-' + src)
      const tgtId = idMap.get(tgt) || (indiceId === tgt ? key : key + '-' + tgt)
      addLink(srcId, tgtId, l.value)
    })
    nodes.forEach(function (n) {
      if (n.type === 'indice') return
      addLink(key, key + '-' + n.id, 1)
    })
  }

  addLink('parte1', 'parte2', 1)
  addLink('parte2', 'parte3', 1)
  addLink('parte3', 'parte4', 1)
  addLink('parte4', 'parte5', 1)

  const degree = {}
  allNodes.forEach(function (n) { degree[n.id] = 0 })
  allLinks.forEach(function (l) {
    degree[l.source] = (degree[l.source] || 0) + 1
    degree[l.target] = (degree[l.target] || 0) + 1
  })
  allNodes.forEach(function (n) { n.val = Math.max(1, degree[n.id]) })

  return { nodes: allNodes, links: allLinks }
}

function main() {
  for (const partNum of [2, 3, 4, 5]) {
    const graph = buildGraph(partNum)
    const outPath = path.join(PUBLIC, 'parte' + partNum + '-graph.json')
    fs.writeFileSync(outPath, JSON.stringify(graph), 'utf8')
    console.log('parte' + partNum + '-graph.json: ' + graph.nodes.length + ' nodes, ' + graph.links.length + ' links')
  }
  const todas = buildTodasGraph()
  const todasPath = path.join(PUBLIC, 'todas-graph.json')
  fs.writeFileSync(todasPath, JSON.stringify(todas), 'utf8')
  console.log('todas-graph.json: ' + todas.nodes.length + ' nodes, ' + todas.links.length + ' links')
}

main()
