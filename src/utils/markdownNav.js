import { TODAS_KEY } from '../data/partsConfig'

/** Quita tildes y unifica mayúsculas para emparejar enlaces con ids de nodo. */
export function normalizeForNodeMatch(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

/** Slug estable para anclar encabezados (## Utilizado en → utilizado-en). */
export function slugifyHeading(text) {
  return normalizeForNodeMatch(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'seccion'
}

export function plainTextFromChildren(children) {
  if (children == null) return ''
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(plainTextFromChildren).join('')
  if (typeof children === 'object' && children.props != null) {
    return plainTextFromChildren(children.props.children)
  }
  return ''
}

/** Parte el markdown en bloques por líneas ## (título sin # iniciales). */
export function splitMarkdownSections(md) {
  if (!md) return []
  const lines = md.split(/\r?\n/)
  const sections = []
  let title = 'Inicio'
  let buf = []
  const flush = () => {
    const body = buf.join('\n').trim()
    if (body) sections.push({ title, body })
    buf = []
  }
  for (const line of lines) {
    const m = line.match(/^##\s+(.+)$/)
    if (m) {
      flush()
      title = m[1].trim()
    } else {
      buf.push(line)
    }
  }
  flush()
  return sections.length ? sections : [{ title: 'Inicio', body: md.trim() }]
}

/** p.ej. parte3-Proposicion 1 → parte3; parte3 → parte3 */
export function getPartKeyFromGraphNodeId(nodeId) {
  if (!nodeId) return null
  const m = String(nodeId).match(/^(parte[1-5])(?:$|-)/)
  return m ? m[1] : null
}

/** parte4-Demostracion 1 - Proposicion 2 → Demostracion 1 - Proposicion 2 */
export function stripTodasPrefixFromNodeId(nodeId) {
  const s = String(nodeId || '')
  const m = s.match(/^parte[1-5]-(.+)$/)
  return m ? m[1] : s
}

export function graphLooksLikeTodasUniverse(nodes) {
  return (nodes || []).some((n) => /^parte[1-5]-/.test(n.id))
}

/** Detecta «Parte N» cerca de un enlace wiki (texto antes/después del [[...]]). */
export function inferPartKeyFromWikiContext(surroundingText) {
  const t = String(surroundingText || '')
  const patterns = [/\[\[Parte\s*(\d)\s*[-–]/i, /Parte\s+(\d)\s*[-–]\s*De/i, /\bParte\s+(\d)\s*[-–]/i]
  for (const re of patterns) {
    const m = t.match(re)
    if (m) return `parte${m[1]}`
  }
  return null
}

function uniqueNodesById(list) {
  const m = new Map()
  for (const n of list) m.set(n.id, n)
  return [...m.values()]
}

function collectLabelMatches(innerTrimmed, nodes, isTodas) {
  const norm = normalizeForNodeMatch(innerTrimmed)
  let found = nodes.filter(
    (n) =>
      n.id === innerTrimmed ||
      normalizeForNodeMatch(n.id) === norm ||
      normalizeForNodeMatch(n.name) === norm
  )
  if (isTodas && !found.length) {
    found = nodes.filter((n) => normalizeForNodeMatch(stripTodasPrefixFromNodeId(n.id)) === norm)
  }
  return uniqueNodesById(found)
}

function pickDisambiguated(candidates, { contextPartKey, documentPartKey }) {
  if (candidates.length <= 1) return candidates[0] || null
  if (contextPartKey) {
    const c = candidates.find((n) => getPartKeyFromGraphNodeId(n.id) === contextPartKey)
    if (c) return c
  }
  if (documentPartKey) {
    const c = candidates.find((n) => getPartKeyFromGraphNodeId(n.id) === documentPartKey)
    if (c) return c
  }
  return candidates[0]
}

/**
 * Resuelve el texto de un [[enlace wiki]] al nodo correcto (vista "Todas" incluida).
 */
export function resolveWikiLinkToNode(innerRaw, graphNodes, contextNode, matchOffset, fullMarkdown) {
  if (!innerRaw || !graphNodes?.length) return null
  const inner = innerRaw.trim()
  const isTodas = graphLooksLikeTodasUniverse(graphNodes)
  const candidates = collectLabelMatches(inner, graphNodes, isTodas)
  if (!candidates.length) return null
  const documentPartKey = getPartKeyFromGraphNodeId(contextNode?.id)
  let contextPartKey = null
  if (typeof matchOffset === 'number' && fullMarkdown) {
    const before = fullMarkdown.slice(Math.max(0, matchOffset - 140), matchOffset)
    const after = fullMarkdown.slice(
      matchOffset,
      Math.min(fullMarkdown.length, matchOffset + inner.length + 140)
    )
    contextPartKey = inferPartKeyFromWikiContext(`${before} ${after}`)
  }
  return pickDisambiguated(candidates, { contextPartKey, documentPartKey })
}

/**
 * Resuelve href o nombre de enlace al nodo del grafo (id, nombre, ruta .md).
 * En vista "Todas", desambigua ids sin prefijo usando el nodo de contexto (panel actual).
 */
export function findGraphNodeByLinkHref(href, nodes, contextNode) {
  if (!href || !nodes?.length) return null
  try {
    const decoded = decodeURIComponent(String(href).trim())
    const pathPart = decoded.split('/').pop() || decoded
    const nameWithoutExt = pathPart.replace(/\.md$/i, '').trim()
    const norm = normalizeForNodeMatch(nameWithoutExt)

    const byExact =
      nodes.find((n) => n.id === nameWithoutExt || n.name === nameWithoutExt) ||
      nodes.find(
        (n) =>
          n.path &&
          (n.path.endsWith(pathPart) || n.path.endsWith(nameWithoutExt + '.md'))
      )
    if (byExact) return byExact

    const loose = nodes.filter(
      (n) =>
        normalizeForNodeMatch(n.id) === norm || normalizeForNodeMatch(n.name) === norm
    )
    if (loose.length === 1) return loose[0]
    if (loose.length > 1) {
      const documentPartKey = getPartKeyFromGraphNodeId(contextNode?.id)
      return pickDisambiguated(loose, {
        contextPartKey: null,
        documentPartKey,
      })
    }

    if (graphLooksLikeTodasUniverse(nodes)) {
      const byBase = collectLabelMatches(nameWithoutExt, nodes, true)
      if (byBase.length) {
        return pickDisambiguated(byBase, {
          contextPartKey: null,
          documentPartKey: getPartKeyFromGraphNodeId(contextNode?.id),
        })
      }
    }

    return null
  } catch {
    return null
  }
}

/** Etiqueta corta de parte para UI (P3) en vista Todas. */
export function formatTodasPartBadge(nodeId, partKey) {
  if (partKey !== TODAS_KEY) return ''
  const pk = getPartKeyFromGraphNodeId(nodeId)
  if (!pk) return ''
  return pk.replace(/^parte/i, 'P')
}

export function excerptAround(text, query, radius = 80) {
  const t = text
  const q = query.trim()
  if (!t || !q) return ''
  const lower = t.toLocaleLowerCase('es')
  const i = lower.indexOf(q.toLocaleLowerCase('es'))
  if (i < 0) return t.slice(0, Math.min(radius * 2, t.length)) + (t.length > radius * 2 ? '…' : '')
  const start = Math.max(0, i - radius)
  const end = Math.min(t.length, i + q.length + radius)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < t.length ? '…' : ''
  return prefix + t.slice(start, end) + suffix
}
