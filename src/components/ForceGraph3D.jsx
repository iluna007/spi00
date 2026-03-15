import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import ForceGraph3D from 'react-force-graph-3d'
import fallbackData from '../data/parte1GraphData'
import NodeContentPanel from './NodeContentPanel'

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
  definicion: '#2563eb',
  axioma: '#059669',
  proposicion: '#d97706',
  demostracion: '#dc2626',
  corolario: '#7c3aed',
  escolio: '#0d9488',
  indice: '#475569',
}

const DEFAULT_GRAPH_BG = '#ffffff'

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
function getMaterial(color, opacity = 1, isHighlighted = false) {
  const key = `${color}-${opacity}-${isHighlighted}`
  if (!materialCache.has(key)) {
    const mat = new THREE.MeshLambertMaterial({
      color: new THREE.Color(color),
      transparent: opacity < 1,
      opacity,
      emissive: isHighlighted ? new THREE.Color(color) : undefined,
      emissiveIntensity: isHighlighted ? 0.35 : 0,
    })
    materialCache.set(key, mat)
  }
  return materialCache.get(key)
}

/** Crea la malla del nodo; getColor, getOpacity y getIsHighlighted dependen de la selección (puede ser gris si está “apagado”) */
/** Crea una textura de canvas con el texto del nodo para usar en Sprite */
function makeLabelTexture(text) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const font = '14px system-ui, sans-serif'
  ctx.font = font
  const m = ctx.measureText(text)
  const w = Math.ceil(Math.max(m.width + 16, 1))
  const h = 24
  canvas.width = w
  canvas.height = h
  ctx.font = font
  ctx.fillStyle = '#1f2937'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, w / 2, h / 2)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

const labelTextureCache = new Map()
function getLabelTexture(name) {
  const key = name || ''
  if (!labelTextureCache.has(key)) {
    labelTextureCache.set(key, makeLabelTexture(key))
  }
  return labelTextureCache.get(key)
}

/** Crea la malla del nodo; opcionalmente con etiqueta de nombre (cuando showLabel). */
function createNodeMesh(node, nodeRelSize, getColor, getOpacity, getIsHighlighted, showLabel) {
  const type = node.type || 'indice'
  const geom = NODE_GEOMETRIES[type] || NODE_GEOMETRIES.indice
  const color = getColor(node)
  const opacity = getOpacity(node)
  const isHighlighted = getIsHighlighted(node)
  const mesh = new THREE.Mesh(geom, getMaterial(color, opacity, isHighlighted))
  const val = node.val ?? 1
  const s = (nodeRelSize || 2) * Math.cbrt(val)
  mesh.scale.set(s, s, s)
  if (!showLabel) return mesh
  const group = new THREE.Group()
  group.add(mesh)
  const spriteMat = new THREE.SpriteMaterial({
    map: getLabelTexture(node.name || node.id),
    transparent: true,
    depthWrite: false,
  })
  const sprite = new THREE.Sprite(spriteMat)
  const scale = 5
  sprite.scale.set(scale, scale * 0.45, 1)
  sprite.position.y = -s * 1.4 - 1.2
  group.add(sprite)
  return group
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

  // Asignar val = número de conexiones (grado) para tamaño proporcional
  const enrichDataWithDegree = useCallback((raw) => {
    if (!raw?.nodes?.length) return raw
    const degree = {}
    raw.nodes.forEach((n) => { degree[n.id] = 0 })
    ;(raw.links || []).forEach((l) => {
      const a = l.source?.id ?? l.source
      const b = l.target?.id ?? l.target
      degree[a] = (degree[a] || 0) + 1
      degree[b] = (degree[b] || 0) + 1
    })
    raw.nodes.forEach((n) => { n.val = Math.max(1, degree[n.id]) })
    return raw
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
        if (!cancelled && data?.nodes?.length) setGraphData(enrichDataWithDegree(data))
        else if (!cancelled) setGraphData(enrichDataWithDegree(fallbackData))
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err.message)
          setGraphData(enrichDataWithDegree(fallbackData))
        }
      })
    return () => { cancelled = true }
  }, [enrichDataWithDegree])

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

  const relatedNodeIds = useMemo(() => {
    if (!selectedNode || !data.links?.length) return new Set()
    const sid = selectedNode.id
    const set = new Set([sid])
    data.links.forEach((link) => {
      const a = link.source?.id ?? link.source
      const b = link.target?.id ?? link.target
      if (a === sid) set.add(b)
      if (b === sid) set.add(a)
    })
    return set
  }, [selectedNode, data.links])

  const getEffectiveNodeColor = useCallback(
    (node) => nodeColors[node.type] ?? node.color ?? '#737373',
    [nodeColors]
  )

  const getEffectiveOpacity = useCallback(
    (node) => {
      if (!selectedNode) return 1
      return relatedNodeIds.has(node.id) ? 1 : 0.18
    },
    [selectedNode, relatedNodeIds]
  )

  const getIsHighlighted = useCallback(
    (node) => !!selectedNode && relatedNodeIds.has(node.id),
    [selectedNode, relatedNodeIds]
  )

  const nodeColor = useCallback((node) => getEffectiveNodeColor(node), [getEffectiveNodeColor])
  const nodeThreeObject = useCallback(
    (node) => {
      const showLabel = !!selectedNode && relatedNodeIds.has(node.id)
      return createNodeMesh(
        node,
        nodeRelSize,
        getEffectiveNodeColor,
        getEffectiveOpacity,
        getIsHighlighted,
        showLabel
      )
    },
    [
      nodeRelSize,
      getEffectiveNodeColor,
      getEffectiveOpacity,
      getIsHighlighted,
      selectedNode,
      relatedNodeIds,
    ]
  )
  const nodeLabel = useCallback(
    (n) =>
      selectedNode && relatedNodeIds.has(n.id)
        ? n.name
        : showNodeLabels
          ? n.name
          : '',
    [showNodeLabels, selectedNode, relatedNodeIds]
  )
  const setNodeColorByType = useCallback((type, hex) => {
    setNodeColors((prev) => ({ ...prev, [type]: hex }))
  }, [])
  const linkWidth = useCallback(
    (link) => {
      const base = (link.value || 1) * linkWidthScale
      if (!selectedNode) return base
      const a = link.source?.id ?? link.source
      const b = link.target?.id ?? link.target
      return relatedNodeIds.has(a) && relatedNodeIds.has(b) ? base * 1.8 : base * 0.4
    },
    [linkWidthScale, selectedNode, relatedNodeIds]
  )

  const linkColor = useCallback(
    (link) => {
      const normal = 'rgba(100, 100, 100, 0.35)'
      if (!selectedNode) return normal
      const a = link.source?.id ?? link.source
      const b = link.target?.id ?? link.target
      if (relatedNodeIds.has(a) && relatedNodeIds.has(b)) return 'rgba(59, 130, 246, 0.9)'
      return 'rgba(150, 150, 150, 0.08)'
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
      <NodeContentPanel
        node={selectedNode}
        content={mdContent}
        loading={mdLoading}
        graphNodes={data.nodes}
        onSelectNode={setSelectedNode}
        onClose={() => setSelectedNode(null)}
        open={!!selectedNode}
        accentColor={
          selectedNode
            ? nodeColors[selectedNode.type] ?? selectedNode.color ?? '#737373'
            : undefined
        }
      />

      <div
        ref={containerRef}
        className="relative min-h-0 min-w-0 flex-1"
        style={{ backgroundColor: graphBgColor }}
      >
        {loadError && (
          <p className="absolute left-3 top-3 z-10 text-xs text-neutral-600">
            Red local: {loadError}. Usando datos de ejemplo.
          </p>
        )}
        {hasData && !hasSize && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-neutral-600">
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
          <div className="absolute inset-0 z-10 flex items-center justify-center text-neutral-600">
            Cargando red de archivos…
          </div>
        )}

        {/* Leyenda y, al seleccionar, lista de nodos conectados */}
        {hasData && (
          <div className="absolute right-3 top-14 z-10 flex max-h-[calc(100vh-5rem)] flex-col gap-2 overflow-hidden">
            <div className="rounded-lg border border-neutral-300 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
              <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                Leyenda
              </div>
              <div className="flex flex-col gap-1">
                {Object.entries(NODE_TYPE_LABELS).map(([type, label]) => (
                  <div
                    key={type}
                    className="flex items-center gap-2 text-xs text-neutral-700"
                    style={{ color: nodeColors[type] ?? DEFAULT_NODE_COLORS[type] }}
                  >
                    <span className="opacity-90">
                      {NODE_TYPE_LEGEND_ICONS[type] ?? NODE_TYPE_LEGEND_ICONS.indice}
                    </span>
                    <span className="text-neutral-700">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowControls((v) => !v)}
          className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 text-neutral-600 shadow-lg backdrop-blur hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
          title="Controles del grafo"
          aria-label="Controles del grafo"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>

        {showControls && (
          <div className="absolute top-14 right-3 z-10 w-64 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-neutral-300 bg-white/98 p-4 shadow-xl backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-800">Controles 3D</span>
              <button
                type="button"
                onClick={() => setShowControls(false)}
                className="text-neutral-500 hover:text-neutral-900"
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
                  className="h-4 w-4 rounded border-neutral-400 accent-neutral-500"
                />
                <span className="text-xs text-neutral-600">Ver texto de nodos (al pasar ratón)</span>
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-neutral-600">Tamaño de nodos</span>
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
                <span className="mb-2 block text-xs font-medium text-neutral-600">Colores por tipo de nodo</span>
                <div className="space-y-1.5">
                  {Object.entries(NODE_TYPE_LABELS).map(([type, label]) => (
                    <div key={type} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={nodeColors[type] ?? DEFAULT_NODE_COLORS[type]}
                        onChange={(e) => setNodeColorByType(type, e.target.value)}
                        className="h-7 w-9 cursor-pointer rounded border border-neutral-400 bg-transparent"
                        title={label}
                      />
                      <span className="truncate text-xs text-neutral-600">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-1.5 block text-xs font-medium text-neutral-600">Fondo del espacio</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={graphBgColor}
                    onChange={(e) => setGraphBgColor(e.target.value)}
                    className="h-7 w-9 cursor-pointer rounded border border-neutral-400 bg-transparent"
                    title="Fondo 3D"
                  />
                  <span className="text-xs text-neutral-500">{'#' + (graphBgColor || '').replace(/^#/, '')}</span>
                </div>
              </div>
              <label className="block">
                <span className="block text-xs text-neutral-600">Grosor de enlaces</span>
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
                <span className="block text-xs text-neutral-600">Distancia de enlace</span>
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
                <span className="block text-xs text-neutral-600">Repulsión</span>
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
