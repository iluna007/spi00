import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TODAS_KEY } from '../data/partsConfig'
import { mdUrlForNode } from '../utils/mdNodeUrl'
import { slugifyHeading, splitMarkdownSections, excerptAround, formatTodasPartBadge } from '../utils/markdownNav'
import { NODE_TYPE_LABELS_BASE } from './graphConstants'

const SEARCH_TYPES = ['definicion', 'axioma', 'proposicion', 'demostracion', 'corolario', 'escolio']

const TYPE_LABEL = {
  definicion: 'Definiciones',
  axioma: 'Axiomas',
  proposicion: 'Proposiciones',
  demostracion: 'Demostraciones',
  corolario: 'Corolarios',
  escolio: 'Escolios',
}

function getContrastSearchStyle(isDarkBg) {
  return {
    backgroundColor: isDarkBg ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    borderColor: isDarkBg ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)',
    color: isDarkBg ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)',
  }
}

async function fetchAllMarkdowns(nodes, partKey, cacheRef, setProgress) {
  const pending = nodes.filter((n) => cacheRef.current[n.id] == null)
  const total = pending.length
  if (!total) {
    setProgress(1)
    return
  }
  let done = 0
  const concurrency = 10

  async function worker() {
    while (pending.length) {
      const node = pending.shift()
      if (!node) return
      try {
        const url = mdUrlForNode(node, partKey)
        const r = await fetch(url)
        cacheRef.current[node.id] = r.ok ? await r.text() : ''
      } catch {
        cacheRef.current[node.id] = ''
      }
      done += 1
      setProgress(done / total)
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, pending.length) }, () => worker()))
}

/**
 * Búsqueda de palabra(s) en los .md de todos los nodos de contenido del grafo actual.
 */
export default function FullTextSearchPanel({
  partKey,
  graphNodes = [],
  graphBgColor,
  panelTextClass,
  panelBorderClass,
  nodeColors,
  onSelectHit,
  onExpansionChange,
  onMatchesChange,
}) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [indexing, setIndexing] = useState(false)
  const [indexProgress, setIndexProgress] = useState(0)
  const [textCache, setTextCache] = useState(() => ({}))
  const cacheRef = useRef({})
  const [expanded, setExpanded] = useState(() => ({}))

  const isDarkBg = useMemo(() => {
    const h = String(graphBgColor || '#000000').replace(/^#/, '')
    if (h.length !== 6) return true
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return 0.299 * r + 0.587 * g + 0.114 * b < 128
  }, [graphBgColor])

  const searchInputStyle = useMemo(() => getContrastSearchStyle(isDarkBg), [isDarkBg])

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 320)
    return () => clearTimeout(t)
  }, [query])

  const contentNodes = useMemo(
    () => graphNodes.filter((n) => n.type !== 'indice' && SEARCH_TYPES.includes(n.type)),
    [graphNodes]
  )

  useEffect(() => {
    if (!debounced || debounced.length < 2) {
      queueMicrotask(() => setIndexing(false))
      return
    }

    let cancelled = false
    ;(async () => {
      const needFetch = contentNodes.some((n) => cacheRef.current[n.id] == null)
      if (!needFetch) {
        queueMicrotask(() => {
          if (cancelled) return
          setIndexing(false)
          setIndexProgress(1)
          setTextCache({ ...cacheRef.current })
        })
        return
      }
      queueMicrotask(() => {
        if (!cancelled) setIndexing(true)
      })
      setIndexProgress(0)
      await fetchAllMarkdowns([...contentNodes], partKey, cacheRef, (p) => {
        if (!cancelled) setIndexProgress(p)
      })
      if (!cancelled) {
        queueMicrotask(() => {
          setIndexing(false)
          setIndexProgress(1)
          setTextCache({ ...cacheRef.current })
        })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [debounced, partKey, contentNodes])

  const groupedHits = useMemo(() => {
    const q = debounced
    if (!q || q.length < 2 || indexing) return null
    const qLower = q.toLocaleLowerCase('es')
    const groups = {
      definicion: [],
      axioma: [],
      proposicion: [],
      demostracion: [],
      corolario: [],
      escolio: [],
    }

    for (const node of contentNodes) {
      const raw = textCache[node.id]
      if (raw == null || raw === '') continue
      const sections = splitMarkdownSections(raw)
      for (const { title, body } of sections) {
        const lower = body.toLocaleLowerCase('es')
        if (!lower.includes(qLower)) continue
        const slug = slugifyHeading(title)
        const excerpt = excerptAround(body, q, 100)
        const key = `${node.id}::${slug}`
        groups[node.type].push({
          key,
          node,
          sectionTitle: title,
          sectionSlug: slug,
          excerpt,
          full: body.trim(),
        })
      }
    }

    return groups
  }, [debounced, contentNodes, indexing, textCache])

  const totalHits = useMemo(() => {
    if (!groupedHits) return 0
    return SEARCH_TYPES.reduce((acc, t) => acc + (groupedHits[t]?.length || 0), 0)
  }, [groupedHits])

  const toggleExpand = useCallback((key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  useEffect(() => {
    onExpansionChange?.(Object.values(expanded).some(Boolean))
  }, [expanded, onExpansionChange])

  useEffect(() => {
    if (!onMatchesChange) return
    if (!debounced || debounced.length < 2 || indexing) {
      onMatchesChange(null)
      return
    }
    if (!groupedHits) {
      onMatchesChange(null)
      return
    }
    const total = SEARCH_TYPES.reduce((acc, t) => acc + (groupedHits[t]?.length || 0), 0)
    if (total === 0) {
      onMatchesChange(null)
      return
    }
    const ids = new Set()
    for (const t of SEARCH_TYPES) {
      for (const h of groupedHits[t] || []) ids.add(h.node.id)
    }
    onMatchesChange(ids)
  }, [debounced, groupedHits, indexing, onMatchesChange])

  return (
    <div
      className={`flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border px-2 py-1.5 sm:px-3 sm:py-2 ${panelBorderClass}`}
      style={{ backgroundColor: graphBgColor }}
    >
      <div className={`mb-1.5 text-[10px] font-medium uppercase tracking-wider ${panelTextClass}`}>
        Buscar en textos
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Palabra en definiciones, axiomas, demostraciones…"
        className="mb-1.5 w-full rounded border px-2 py-1 text-xs placeholder:opacity-60 focus:outline-none focus:ring-1 focus:ring-inset"
        style={searchInputStyle}
        aria-label="Buscar palabra en los textos"
      />
      {debounced.length >= 2 && indexing && (
        <p className={`mb-1 text-[10px] opacity-80 ${panelTextClass}`}>
          Indexando textos… {Math.round(indexProgress * 100)}%
        </p>
      )}
      {debounced.length >= 2 && !indexing && groupedHits && (
        <div
          className="mt-1 flex min-h-[72px] min-w-0 flex-1 flex-col overflow-y-auto rounded border"
          style={{ backgroundColor: searchInputStyle.backgroundColor, borderColor: searchInputStyle.borderColor }}
        >
          {totalHits === 0 ? (
            <p className={`py-1 px-1 text-[10px] opacity-70 ${panelTextClass}`}>Sin coincidencias en esta vista.</p>
          ) : (
            <ul className="flex flex-col gap-2 p-1.5">
              {SEARCH_TYPES.map((type) => {
                const hits = groupedHits[type]
                if (!hits?.length) return null
                return (
                  <li key={type}>
                    <div
                      className="mb-0.5 text-[10px] font-medium uppercase tracking-wide opacity-80"
                      style={{ color: nodeColors?.[type] }}
                    >
                      {TYPE_LABEL[type] || NODE_TYPE_LABELS_BASE[type] || type} ({hits.length})
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {hits.map((h) => (
                        <li
                          key={h.key}
                          className={`rounded border px-1.5 py-1 text-[10px] ${panelTextClass}`}
                          style={{ borderColor: searchInputStyle.borderColor }}
                        >
                          <div className="flex flex-wrap items-center gap-1">
                            {formatTodasPartBadge(h.node.id, partKey) ? (
                              <span
                                className="rounded border px-1 py-px text-[9px] font-semibold opacity-90"
                                style={{ borderColor: searchInputStyle.borderColor }}
                              >
                                {formatTodasPartBadge(h.node.id, partKey)}
                              </span>
                            ) : null}
                            <span className="font-medium opacity-95">{h.node.name || h.node.id}</span>
                            <span className="opacity-60">· {h.sectionTitle}</span>
                          </div>
                          <p className="mt-0.5 whitespace-pre-wrap opacity-90">
                            {expanded[h.key] ? h.full : h.excerpt}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <button
                              type="button"
                              className="rounded border px-1.5 py-0.5 text-[10px] opacity-90 hover:opacity-100"
                              style={{ borderColor: searchInputStyle.borderColor }}
                              onClick={() => toggleExpand(h.key)}
                            >
                              {expanded[h.key] ? 'Ver menos' : 'Expandir párrafo'}
                            </button>
                            <button
                              type="button"
                              className="rounded border px-1.5 py-0.5 text-[10px] opacity-90 hover:opacity-100"
                              style={{ borderColor: searchInputStyle.borderColor, color: nodeColors?.[h.node.type] }}
                              onClick={() => onSelectHit?.(h.node, h.sectionSlug)}
                            >
                              Abrir y centrar sección
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
      {partKey === TODAS_KEY && (
        <p className={`mt-1 text-[9px] opacity-60 ${panelTextClass}`}>
          En “Todas las partes” la búsqueda usa la carpeta de cada nodo.
        </p>
      )}
    </div>
  )
}
