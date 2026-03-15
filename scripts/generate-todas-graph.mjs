/**
 * Genera todas-graph.json uniendo los 5 grafos (parte1 a parte5) con prefijos
 * y enlaces entre partes. Requiere que existan parte1-graph.json ... parte5-graph.json en public/.
 * Uso: node scripts/generate-todas-graph.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.join(__dirname, '..', 'public')

const TYPE_COLORS = {
  definicion: '#7c3aed',
  axioma: '#059669',
  proposicion: '#0ea5e9',
  demostracion: '#f59e0b',
  corolario: '#ec4899',
  escolio: '#8b5cf6',
  indice: '#64748b',
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
    const indiceNode = nodes.find((n) => n.type === 'indice')
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
    nodes.forEach((n) => {
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
    links.forEach((l) => {
      const src = typeof l.source === 'object' ? l.source.id : l.source
      const tgt = typeof l.target === 'object' ? l.target.id : l.target
      const srcId = idMap.get(src) || (indiceId === src ? key : key + '-' + src)
      const tgtId = idMap.get(tgt) || (indiceId === tgt ? key : key + '-' + tgt)
      addLink(srcId, tgtId, l.value)
    })
    nodes.forEach((n) => {
      if (n.type === 'indice') return
      addLink(key, key + '-' + n.id, 1)
    })
  }

  addLink('parte1', 'parte2', 1)
  addLink('parte2', 'parte3', 1)
  addLink('parte3', 'parte4', 1)
  addLink('parte4', 'parte5', 1)

  const degree = {}
  allNodes.forEach((n) => { degree[n.id] = 0 })
  allLinks.forEach((l) => {
    degree[l.source] = (degree[l.source] || 0) + 1
    degree[l.target] = (degree[l.target] || 0) + 1
  })
  allNodes.forEach((n) => { n.val = Math.max(1, degree[n.id]) })

  return { nodes: allNodes, links: allLinks }
}

const todas = buildTodasGraph()
const todasPath = path.join(PUBLIC, 'todas-graph.json')
fs.writeFileSync(todasPath, JSON.stringify(todas), 'utf8')
console.log('todas-graph.json: ' + todas.nodes.length + ' nodes, ' + todas.links.length + ' links')
