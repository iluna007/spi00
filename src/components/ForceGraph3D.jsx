import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import ForceGraph3D from 'react-force-graph-3d'
import ReactMarkdown from 'react-markdown'
import fallbackData from '../data/parte1GraphData'

/** Convierte hex a escala de grises (mantiene #rrggbb) */
function hexToGrayscale(hex) {
  const h = hex.replace(/^#/, '')
  if (h.length !== 6) return '#666666'
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
  const gs = gray.toString(16).padStart(2, '0')
  return `#${gs}${gs}${gs}`
}

/** Dado un href de enlace en el markdown, busca un nodo del grafo que coincida (por path/name/id) */
function findNodeByLinkHref(href, nodes) {
  if (!href || !nodes?.length) return null
  try {
    const decoded = decodeURIComponent(href)
    const pathPart = decoded.split('/').pop() || decoded
    const nameWithoutExt = pathPart.replace(/\.md$/i, '').trim()
    return (
      nodes.find((n) => n.id === nameWithoutExt || n.name === nameWithoutExt) ||
      nodes.find((n) => n.path && (n.path.endsWith(pathPart) || n.path.endsWith(nameWithoutExt + '.md')))
    )
  } catch {
    return null
  }
}

function mdUrlForNode(node) {
  const base = '/Obsidian/spi1/' + encodeURIComponent('Parte 1') + '/'
  const pathSeg = node.path
    ? node.path.split('/').map(encodeURIComponent).join('/')
    : (() => {
        const folder = { definicion: 'Definiciones', axioma: 'Axiomas', proposicion: 'Proposiciones', demostracion: 'Demostraciones', corolario: 'Corolarios', escolio: 'Escolios' }[node.type]
        const p = folder ? `${folder}/${node.id}.md` : `${node.id}.md`
        return p.split('/').map(encodeURIComponent).join('/')
      })()
  return base + pathSeg
}

const NODE_TYPE_LABELS = {
  definicion: 'Definición',
  axioma: 'Axioma',
  proposicion: 'Proposición',
  demostracion: 'Demostración',
  corolario: 'Corolario',
  escolio: 'Escolio',
  indice: 'Parte 1',
}

// Iconos 2D para la leyenda (forma aproximada a la 3D)
const NODE_TYPE_LEGEND_ICONS = {
  definicion: (
    <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0" aria-hidden>
      <rect x="2" y="2" width="10" height="10" fill="currentColor" />
    </svg>
  ),
  axioma: (
    <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0" aria-hidden>
      <path d="M7 1 L13 7 L7 13 L1 7 Z" fill="currentColor" />
    </svg>
  ),
  proposicion: (
    <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0" aria-hidden>
      <polygon points="7,1 13,5 10,13 4,13 1,5" fill="currentColor" />
    </svg>
  ),
  demostracion: (
    <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0" aria-hidden>
      <ellipse cx="7" cy="4" rx="4" ry="2" fill="currentColor" />
      <rect x="3" y="4" width="8" height="7" fill="currentColor" />
    </svg>
  ),
  corolario: (
    <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0" aria-hidden>
      <polygon points="7,1 13,13 1,13" fill="currentColor" />
    </svg>
  ),
  escolio: (
    <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0" aria-hidden>
      <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  ),
  indice: (
    <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0" aria-hidden>
      <circle cx="7" cy="7" r="5" fill="currentColor" />
    </svg>
  ),
}

const DEFAULT_NODE_COLORS = {
  definicion: '#525252',
  axioma: '#737373',
  proposicion: '#a3a3a3',
  demostracion: '#d4d4d4',
  corolario: '#e5e5e5',
  escolio: '#fafafa',
  indice: '#404040',
}

const DEFAULT_GRAPH_BG = '#0a0a0a'

// Geometrías 3D por tipo (igual que en la leyenda)
const NODE_GEOMETRIES = {
  definicion: new THREE.BoxGeometry(1, 1, 1),
  axioma: new THREE.OctahedronGeometry(0.7, 0),
  proposicion: new THREE.IcosahedronGeometry(0.65, 0),
  demostracion: new THREE.CylinderGeometry(0.5, 0.5, 1, 6),
  corolario: new THREE.ConeGeometry(0.6, 1, 6),
  escolio: new THREE.TorusGeometry(0.5, 0.25, 8, 16),
  indice: new THREE.SphereGeometry(0.6, 12, 12),
}

const materialCache = new Map()
function getMaterial(color) {
  if (!materialCache.has(color)) {
    materialCache.set(
      color,
      new THREE.MeshLambertMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 1,
      })
    )
  }
  return materialCache.get(color)
}

/** getColor(node) debe devolver el hex del nodo (puede ser gris si está “apagado”) */
function createNodeMesh(node, nodeRelSize, getColor) {
  const type = node.type || 'indice'
  const geom = NODE_GEOMETRIES[type] || NODE_GEOMETRIES.indice
  const color = getColor(node)
  const mesh = new THREE.Mesh(geom, getMaterial(color))
  const val = node.val ?? 1
  const s = (nodeRelSize || 2) * Math.cbrt(val)
  mesh.scale.set(s, s, s)
  return mesh
}

export default function ForceGraph3DScene() {
  const containerRef = useRef(null)
  const graphRef = useRef(null)

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [graphData, setGraphData] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [nodeRelSize, setNodeRelSize] = useState(2)
  const [linkWidthScale, setLinkWidthScale] = useState(0.8)
  const [linkDistance, setLinkDistance] = useState(50)
  const [chargeStrength, setChargeStrength] = useState(-50)
  const [showControls, setShowControls] = useState(false)
  const [nodeColors, setNodeColors] = useState(() => ({ ...DEFAULT_NODE_COLORS }))
  const [graphBgColor, setGraphBgColor] = useState(DEFAULT_GRAPH_BG)
  const [selectedNode, setSelectedNode] = useState(null)
  const [mdContent, setMdContent] = useState('')
  const [mdLoading, setMdLoading] = useState(false)
  const [graphDataReady, setGraphDataReady] = useState(false)
  const [useCustomShapes, setUseCustomShapes] = useState(false)
  const [showNodeLabels, setShowNodeLabels] = useState(true)

  // Medir contenedor para dar width/height explícitos al canvas 3D (nunca guardar 0 para no ocultar el grafo al abrir el panel)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? {}
      if (width > 0 && height > 0) setDimensions({ width, height })
    })
    ro.observe(el)
    const { width, height } = el.getBoundingClientRect()
    if (width > 0 && height > 0) setDimensions({ width, height })
    return () => ro.disconnect()
  }, [])

  // Cargar grafo desde JSON (todos los .md de Parte 1)
  useEffect(() => {
    let cancelled = false
    setLoadError(null)
    fetch('/parte1-graph.json')
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json()
      })
      .then((data) => {
        if (!cancelled && data?.nodes?.length) setGraphData(data)
        else if (!cancelled) setGraphData(fallbackData)
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err.message)
          setGraphData(fallbackData)
        }
      })
    return () => { cancelled = true }
  }, [])

  const data = graphData || { nodes: [], links: [] }
  const hasData = data.nodes.length > 0
  const hasSize = dimensions.width > 0 && dimensions.height > 0

  useEffect(() => {
    if (!hasData || !hasSize) {
      setGraphDataReady(false)
      setUseCustomShapes(false)
      return
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setGraphDataReady(true))
    })
    return () => cancelAnimationFrame(id)
  }, [hasData, hasSize])

  // Activar formas 3D por tipo después de que el layout esté listo
  useEffect(() => {
    if (!graphDataReady) return
    const t = setTimeout(() => setUseCustomShapes(true), 350)
    return () => clearTimeout(t)
  }, [graphDataReady])

  useEffect(() => {
    const g = graphRef.current
    if (!g || !data?.nodes?.length) return
    const linkForce = g.d3Force('link')
    const chargeForce = g.d3Force('charge')
    if (linkForce) linkForce.distance(linkDistance)
    if (chargeForce) chargeForce.strength(chargeStrength)
    g.d3ReheatSimulation?.()
  }, [data?.nodes?.length, linkDistance, chargeStrength])

  // Nodos relacionados con el seleccionado (conexión directa o por enlaces)
  const relatedNodeIds = useMemo(() => {
    if (!selectedNode || !data.links?.length) return new Set()
    const set = new Set([selectedNode.id])
    let changed = true
    while (changed) {
      changed = false
      data.links.forEach((link) => {
        const a = link.source?.id ?? link.source
        const b = link.target?.id ?? link.target
        if (set.has(a) && !set.has(b)) {
          set.add(b)
          changed = true
        }
        if (set.has(b) && !set.has(a)) {
          set.add(a)
          changed = true
        }
      })
    }
    return set
  }, [selectedNode, data.links])

  const getEffectiveNodeColor = useCallback(
    (node) => {
      const base = nodeColors[node.type] ?? node.color ?? '#737373'
      if (!selectedNode) return base
      if (relatedNodeIds.has(node.id)) return base
      return hexToGrayscale(base)
    },
    [nodeColors, selectedNode, relatedNodeIds]
  )

  const nodeColor = useCallback(
    (node) => getEffectiveNodeColor(node),
    [getEffectiveNodeColor]
  )
  const nodeThreeObject = useCallback(
    (node) => createNodeMesh(node, nodeRelSize, getEffectiveNodeColor),
    [nodeRelSize, getEffectiveNodeColor]
  )
  const nodeLabel = useCallback(
    (n) => (showNodeLabels ? n.name : ''),
    [showNodeLabels]
  )
  const setNodeColorByType = useCallback((type, hex) => {
    setNodeColors((prev) => ({ ...prev, [type]: hex }))
  }, [])
  const linkWidth = useCallback(
    (link) => (link.value || 1) * linkWidthScale,
    [linkWidthScale]
  )

  const linkColor = useCallback(
    (link) => {
      const normal = 'rgba(163, 163, 163, 0.4)'
      if (!selectedNode) return normal
      const a = link.source?.id ?? link.source
      const b = link.target?.id ?? link.target
      if (relatedNodeIds.has(a) && relatedNodeIds.has(b)) return 'rgba(163, 163, 163, 0.6)'
      return 'rgba(100, 100, 100, 0.15)'
    },
    [selectedNode, relatedNodeIds]
  )

  const linkVisibility = useCallback(
    (link) => {
      if (!selectedNode) return true
      const a = link.source?.id ?? link.source
      const b = link.target?.id ?? link.target
      return relatedNodeIds.has(a) && relatedNodeIds.has(b)
    },
    [selectedNode, relatedNodeIds]
  )

  // Al seleccionar un nodo, cargar su .md para el panel
  useEffect(() => {
    if (!selectedNode) {
      setMdContent('')
      return
    }
    setMdLoading(true)
    const url = mdUrlForNode(selectedNode)
    fetch(url)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.statusText))))
      .then((text) => {
        setMdContent(text)
        setMdLoading(false)
      })
      .catch(() => {
        setMdContent('*No se pudo cargar el archivo.*')
        setMdLoading(false)
      })
  }, [selectedNode])

  return (
    <div
      className="flex h-full min-h-0 w-full flex-1 overflow-hidden bg-neutral-900"
      style={{ minHeight: 200, height: '100%' }}
    >
      {/* Panel izquierdo: contenido del .md del nodo seleccionado */}
      <div
        className={`flex h-full shrink-0 flex-col border-r border-neutral-700 bg-neutral-800/98 shadow-xl transition-[width] duration-300 ease-out ${
          selectedNode ? 'w-[min(420px,90vw)]' : 'w-0 overflow-hidden border-r-0'
        }`}
      >
        {selectedNode && (
          <>
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-neutral-700 px-4 py-2">
              <h3 className="truncate text-xs font-medium text-neutral-200">{selectedNode.name}</h3>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="shrink-0 rounded p-1 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                aria-label="Cerrar panel"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              {mdLoading ? (
                <p className="text-neutral-400">Cargando…</p>
              ) : (
                <article className="MarkdownPanel text-sm text-neutral-300 [&_h1]:mb-1.5 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-neutral-100 [&_h2]:mb-1.5 [&_h2]:mt-3 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-neutral-100 [&_p]:mb-1.5 [&_p]:text-xs [&_ul]:list-inside [&_ul]:list-disc [&_ul]:mb-1.5 [&_ul]:text-xs [&_ol]:list-inside [&_ol]:list-decimal [&_ol]:mb-1.5 [&_ol]:text-xs [&_a]:text-neutral-200 [&_a]:underline [&_a]:cursor-pointer [&_strong]:text-neutral-100 [&_hr]:my-2 [&_hr]:border-neutral-600">
                  <ReactMarkdown
                    components={{
                      a: ({ href, ...props }) => {
                        const handleLinkClick = (e) => {
                          const node = findNodeByLinkHref(href, data.nodes)
                          if (node) {
                            e.preventDefault()
                            setSelectedNode(node)
                          }
                        }
                        return (
                          <a
                            href={href}
                            {...props}
                            className="text-neutral-200 hover:text-white underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleLinkClick}
                          />
                        )
                      },
                    }}
                  >
                    {mdContent}
                  </ReactMarkdown>
                </article>
              )}
            </div>
          </>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative min-h-0 min-w-0 flex-1"
        style={{ backgroundColor: graphBgColor }}
      >
        {loadError && (
          <p className="absolute left-3 top-3 z-10 text-xs text-neutral-400">
            Red local: {loadError}. Usando datos de ejemplo.
          </p>
        )}
        {hasData && !hasSize && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-neutral-400">
            Preparando vista 3D…
          </div>
        )}
        {hasData && hasSize && (
          <ForceGraph3D
            key="force-graph-3d"
            ref={graphRef}
            width={Math.max(1, dimensions.width)}
            height={Math.max(1, dimensions.height)}
            graphData={graphDataReady ? data : { nodes: [], links: [] }}
            nodeLabel={nodeLabel}
            nodeColor={nodeColor}
            nodeVal={(n) => n.val ?? 1}
            nodeRelSize={nodeRelSize}
            nodeThreeObject={useCustomShapes ? nodeThreeObject : undefined}
            nodeThreeObjectExtend={useCustomShapes ? false : undefined}
            linkWidth={linkWidth}
            linkColor={linkColor}
            linkVisibility={linkVisibility}
            linkDirectionalParticles={0}
            linkDirectionalArrowLength={2.8}
            linkDirectionalArrowRelPos={1}
            linkDirectionalArrowColor={linkColor}
            backgroundColor={graphBgColor}
            showNavInfo={false}
            onNodeClick={(node) => setSelectedNode(node)}
            onEngineStop={() => {
              const g = graphRef.current
              if (g && typeof g.zoomToFit === 'function') {
                setTimeout(() => g.zoomToFit(500, 80), 100)
              }
            }}
          />
        )}
        {!hasData && !loadError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-neutral-400">
            Cargando red de archivos…
          </div>
        )}

        {/* Leyenda: debajo del botón de controles, esquina superior derecha */}
        {hasData && (
          <div className="absolute right-3 top-14 z-10 rounded-lg border border-neutral-700 bg-neutral-800/95 px-3 py-2 shadow-lg backdrop-blur">
            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
              Leyenda
            </div>
            <div className="flex flex-col gap-1">
              {Object.entries(NODE_TYPE_LABELS).map(([type, label]) => (
                <div
                  key={type}
                  className="flex items-center gap-2 text-xs text-neutral-300"
                  style={{ color: nodeColors[type] ?? DEFAULT_NODE_COLORS[type] }}
                >
                  <span className="opacity-90">
                    {NODE_TYPE_LEGEND_ICONS[type] ?? NODE_TYPE_LEGEND_ICONS.indice}
                  </span>
                  <span className="text-neutral-300">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowControls((v) => !v)}
          className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800/90 text-neutral-300 shadow-lg backdrop-blur hover:bg-neutral-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
          title="Controles del grafo"
          aria-label="Controles del grafo"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>

        {showControls && (
          <div className="absolute top-14 right-3 z-10 w-64 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-800/98 p-4 shadow-xl backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-200">Controles 3D</span>
              <button
                type="button"
                onClick={() => setShowControls(false)}
                className="text-neutral-400 hover:text-white"
                aria-label="Cerrar"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={showNodeLabels}
                  onChange={(e) => setShowNodeLabels(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-600 accent-neutral-500"
                />
                <span className="text-xs text-neutral-300">Ver texto de nodos (al pasar ratón)</span>
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-neutral-400">Tamaño de nodos</span>
                <input
                  type="range"
                  min={0.5}
                  max={6}
                  step={0.25}
                  value={nodeRelSize}
                  onChange={(e) => setNodeRelSize(Number(e.target.value))}
                  className="mt-1 h-2 w-full accent-neutral-500"
                />
                <span className="text-xs text-neutral-500">{nodeRelSize}</span>
              </label>
              <div>
                <span className="mb-2 block text-xs font-medium text-neutral-400">Colores por tipo de nodo</span>
                <div className="space-y-1.5">
                  {Object.entries(NODE_TYPE_LABELS).map(([type, label]) => (
                    <div key={type} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={nodeColors[type] ?? DEFAULT_NODE_COLORS[type]}
                        onChange={(e) => setNodeColorByType(type, e.target.value)}
                        className="h-7 w-9 cursor-pointer rounded border border-neutral-600 bg-transparent"
                        title={label}
                      />
                      <span className="truncate text-xs text-neutral-300">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-1.5 block text-xs font-medium text-neutral-400">Fondo del espacio</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={graphBgColor}
                    onChange={(e) => setGraphBgColor(e.target.value)}
                    className="h-7 w-9 cursor-pointer rounded border border-neutral-600 bg-transparent"
                    title="Fondo 3D"
                  />
                  <span className="text-xs text-neutral-500">{'#' + (graphBgColor || '').replace(/^#/, '')}</span>
                </div>
              </div>
              <label className="block">
                <span className="block text-xs text-neutral-400">Grosor de enlaces</span>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.2}
                  value={linkWidthScale}
                  onChange={(e) => setLinkWidthScale(Number(e.target.value))}
                  className="mt-1 h-2 w-full accent-neutral-500"
                />
                <span className="text-xs text-neutral-500">{linkWidthScale}</span>
              </label>
              <label className="block">
                <span className="block text-xs text-neutral-400">Distancia de enlace</span>
                <input
                  type="range"
                  min={20}
                  max={120}
                  step={5}
                  value={linkDistance}
                  onChange={(e) => setLinkDistance(Number(e.target.value))}
                  className="mt-1 h-2 w-full accent-neutral-500"
                />
                <span className="text-xs text-neutral-500">{linkDistance}</span>
              </label>
              <label className="block">
                <span className="block text-xs text-neutral-400">Repulsión</span>
                <input
                  type="range"
                  min={-120}
                  max={-20}
                  step={5}
                  value={chargeStrength}
                  onChange={(e) => setChargeStrength(Number(e.target.value))}
                  className="mt-1 h-2 w-full accent-neutral-500"
                />
                <span className="text-xs text-neutral-500">{chargeStrength}</span>
              </label>
            </div>
            <p className="mt-3 text-[10px] text-neutral-500">
              Clic en nodo abre el .md a la izquierda. Arrastra para rotar la vista 3D.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
