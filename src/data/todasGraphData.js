/**
 * Grafo unificado para "Todas las partes": nodos y enlaces de las 5 Partes + índices.
 * Cada nodo tiene folderName para que la URL del .md resuelva a /Obsidian/spi1/Parte N/...
 */
import parte1 from './parte1GraphData'
import parte2 from './parte2GraphData'
import parte3 from './parte3GraphData'
import parte4 from './parte4GraphData'
import parte5 from './parte5GraphData'

const FOLDER_BY_TYPE = {
  definicion: 'Definiciones',
  axioma: 'Axiomas',
  proposicion: 'Proposiciones',
  demostracion: 'Demostraciones',
  corolario: 'Corolarios',
  escolio: 'Escolios',
}

const PART_CONFIGS = [
  { key: 'parte1', folderName: 'Parte 1', indexName: 'Parte 1 - De Dios', indexPath: 'Parte 1 - De Dios.md', data: parte1 },
  { key: 'parte2', folderName: 'Parte 2', indexName: 'Parte 2 - De la Mente', indexPath: 'Parte 2 - De la Mente.md', data: parte2 },
  { key: 'parte3', folderName: 'Parte 3', indexName: 'Parte 3 - De los Afectos', indexPath: 'Parte 3 - De Los Afectos.md', data: parte3 },
  { key: 'parte4', folderName: 'Parte 4', indexName: 'Parte 4 - De la Servidumbre', indexPath: 'Parte 4 - De la Servidumbre.md', data: parte4 },
  { key: 'parte5', folderName: 'Parte 5', indexName: 'Parte 5 - De la Libertad', indexPath: 'Parte 5 - De la Libertad.md', data: parte5 },
]

const allNodes = []
const allLinks = []

PART_CONFIGS.forEach(({ key, folderName, indexName, indexPath, data }) => {
  const contentOnly = (data.nodes || []).filter((n) => n.type !== 'indice')
  const partNodes = contentOnly.map((n) => {
    const path = n.path || (FOLDER_BY_TYPE[n.type] ? `${FOLDER_BY_TYPE[n.type]}/${n.id}.md` : `${n.id}.md`)
    return {
      ...n,
      id: `${key}-${n.id}`,
      name: n.name,
      type: n.type,
      val: n.val ?? 1,
      folderName,
      path,
    }
  })
  allNodes.push(...partNodes)

  const contentIds = new Set(contentOnly.map((n) => n.id))
  ;(data.links || []).forEach((l) => {
    const src = typeof l.source === 'object' ? l.source.id : l.source
    const tgt = typeof l.target === 'object' ? l.target.id : l.target
    if (contentIds.has(src) && contentIds.has(tgt)) {
      allLinks.push({
        source: `${key}-${src}`,
        target: `${key}-${tgt}`,
        value: l.value ?? 1,
      })
    }
  })
})

function firstContentNodeId(nodes) {
  const n = (nodes || []).find((x) => x.type !== 'indice')
  return n ? (typeof n === 'object' ? n.id : n) : null
}

const indexNodes = PART_CONFIGS.map(({ key, indexName, indexPath, folderName }) => ({
  id: key,
  name: indexName,
  type: 'indice',
  folderName,
  path: indexPath,
  val: 1,
}))
allNodes.push(...indexNodes)

allLinks.push(
  { source: 'parte1', target: 'parte2', value: 1 },
  { source: 'parte2', target: 'parte3', value: 1 },
  { source: 'parte3', target: 'parte4', value: 1 },
  { source: 'parte4', target: 'parte5', value: 1 }
)

PART_CONFIGS.forEach(({ key, data }) => {
  const firstId = firstContentNodeId(data.nodes)
  if (firstId) allLinks.push({ source: key, target: `${key}-${firstId}`, value: 1 })
})

const degree = {}
allNodes.forEach((n) => { degree[n.id] = 0 })
allLinks.forEach((l) => {
  degree[l.source] = (degree[l.source] || 0) + 1
  degree[l.target] = (degree[l.target] || 0) + 1
})
allNodes.forEach((n) => { n.val = Math.max(1, degree[n.id]) })

const nodes = allNodes
const links = allLinks
export default { nodes, links }
export { nodes, links }
