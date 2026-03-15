import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import ForceGraph3D from 'react-force-graph-3d'
import { getPartConfig, getMdBasePath, TODAS_KEY } from '../data/partsConfig'
import { useGraphControls, getContrastBorderClass, getContrastTextClasses } from '../context/GraphControlsContext'
import fallbackParte1 from '../data/parte1GraphData'
import fallbackParte2 from '../data/parte2GraphData'
import fallbackParte3 from '../data/parte3GraphData'
import fallbackParte4 from '../data/parte4GraphData'
import fallbackParte5 from '../data/parte5GraphData'
import fallbackTodas from '../data/todasGraphData'
import NodeContentPanel from './NodeContentPanel'
import { NODE_TYPE_LABELS_BASE, DEFAULT_NODE_COLORS, NODE_GEOMETRIES, getMaterial, getLabelTexture } from './graphConstants'

const FALLBACK_BY_PART = {
  parte1: fallbackParte1,
  parte2: fallbackParte2,
  parte3: fallbackParte3,
  parte4: fallbackParte4,
  parte5: fallbackParte5,
  [TODAS_KEY]: fallbackTodas,
}

function mdUrlForNode(node, partKey) {
  const folderName = node.folderName || (partKey === TODAS_KEY ? null : getPartConfig(partKey).folderName)
  const base = getMdBasePath(partKey, folderName)
  const rawId = node.rawId || node.id
  const pathSeg = node.path
    ? node.path.split('/').map(encodeURIComponent).join('/')
    : (() => {
        const folder = { definicion: 'Definiciones', axioma: 'Axiomas', proposicion: 'Proposiciones', demostracion: 'Demostraciones', corolario: 'Corolarios', escolio: 'Escolios' }[node.type]
        const p = folder ? `${folder}/${rawId}.md` : `${rawId}.md`
        return p.split('/').map(encodeURIComponent).join('/')
      })()
  return base + pathSeg
}

function getNodeTypeLabels(partKey) {
  const config = getPartConfig(partKey)
  return {
    ...NODE_TYPE_LABELS_BASE,
    indice: partKey === TODAS_KEY ? 'Parte (índice)' : config.label,
  }
}

/** Devuelve etiqueta abreviada para el nodo (Def-1, Ax-3, Prop 4, Demo 1-1, etc.). */
function getAbbreviatedLabel(node) {
  const id = (node?.id || node?.name || '').toString()
  const type = (node?.type || '').toString()
  if (/^parte\d$/i.test(id)) return id.replace(/parte/i, 'P')
  if (id.match(/^Parte\s*\d/i)) return id.replace(/Parte\s*(\d).*/i, 'P$1')
  if (type === 'definicion' || /^Definicion\s*\d+/i.test(id)) return id.replace(/Definicion\s*(\d+).*/i, 'Def-$1')
  if (type === 'axioma' || /^Axioma\s*\d+/i.test(id)) return id.replace(/Axioma\s*(\d+).*/i, 'Ax-$1')
  if (type === 'proposicion' || /^Proposicion\s*\d+$/i.test(id)) return id.replace(/Proposicion\s*(\d+)/i, 'Prop $1')
  if (type === 'demostracion' || /^Demostracion\s*\d+/i.test(id)) return id.replace(/Demostracion\s*(\d+)\s*-\s*Proposicion\s*(\d+).*/i, 'Demo $1-$2')
  if (type === 'corolario' || /^Corolario\s*\d+/i.test(id)) return id.replace(/Corolario\s*(\d+)\s*-\s*Proposicion\s*(\d+).*/i, 'Cor $1-$2')
  if (type === 'escolio' || /^Escolio\s*\d+/i.test(id)) return id.replace(/Escolio\s*(\d+)\s*-\s*Proposicion\s*(\d+).*/i, 'Esc $1-$2')
  return id.length > 12 ? id.slice(0, 10) + '…' : id
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

/** Crea la malla del nodo; getColor, getOpacity y getIsHighlighted dependen de la selección (puede ser gris si está “apagado”) */
/** Crea una textura de canvas con el texto del nodo para usar en Sprite */

const LABEL_BASE_SCALE = 5
const LABEL_REF_DISTANCE = 80

function createNodeMesh(node, nodeRelSize, getColor, getOpacity, getIsHighlighted, showLabel, labelText, labelScale, labelTextColor) {
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
  const text = labelText != null ? String(labelText) : (node.name || node.id)
  const spriteMat = new THREE.SpriteMaterial({
    map: getLabelTexture(text, labelTextColor ?? '#ffffff'),
    transparent: true,
    depthWrite: false,
    depthTest: false,
  })
  const sprite = new THREE.Sprite(spriteMat)
  sprite.renderOrder = 1000
  const base = (LABEL_BASE_SCALE * (labelScale ?? 1))
  sprite.scale.set(base, base * 0.45, 1)
  sprite.position.y = -s * 1.4 - 1.2
  sprite.userData.isLabelSprite = true
  group.add(sprite)
  return group
}

export default function ForceGraph3DScene({ partKey = 'parte1' }) {
  const containerRef = useRef(null)
  const graphRef = useRef(null)
  const searchTypeDropdownRef = useRef(null)
  const partConfig = getPartConfig(partKey)
  const nodeTypeLabels = useMemo(() => getNodeTypeLabels(partKey), [partKey])

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [graphData, setGraphData] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [nodeRelSize, setNodeRelSize] = useState(2)
  const [linkWidthScale, setLinkWidthScale] = useState(0.8)
  const [linkDistance, setLinkDistance] = useState(50)
  const [chargeStrength, setChargeStrength] = useState(-50)
  const { showControls, setShowControls, graphBgColor, setGraphBgColor } = useGraphControls()
  const [nodeColors, setNodeColors] = useState(() => ({ ...DEFAULT_NODE_COLORS }))
  const [selectedNode, setSelectedNode] = useState(null)
  const [mdContent, setMdContent] = useState('')
  const [mdLoading, setMdLoading] = useState(false)
  const [graphDataReady, setGraphDataReady] = useState(false)
  const [useCustomShapes] = useState(true)
  const [showNodeLabels, setShowNodeLabels] = useState(true)
  const [labelScale, setLabelScale] = useState(1)
  const [labelTextColor, setLabelTextColor] = useState('#ffffff')
  const [linkColorNormal, setLinkColorNormal] = useState('#646464')
  const [linkColorHighlight, setLinkColorHighlight] = useState('#3b82f6')
  const [visibleTypes, setVisibleTypes] = useState(() =>
    Object.keys(NODE_TYPE_LABELS_BASE).reduce((acc, t) => ({ ...acc, [t]: true }), {})
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTypeFilter, setSearchTypeFilter] = useState('')
  const [searchTypeOpen, setSearchTypeOpen] = useState(false)

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

  // Cargar grafo desde JSON de la parte actual (ruta con base para que funcione en subrutas)
  useEffect(() => {
    let cancelled = false
    setLoadError(null)
    const fallback = FALLBACK_BY_PART[partKey] || fallbackParte1
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    const url = `${base}${partConfig.graphUrl.startsWith('/') ? partConfig.graphUrl : '/' + partConfig.graphUrl}`
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText)
        return r.text()
      })
      .then((text) => {
        if (cancelled) return
        const trimmed = text.trim()
        if (trimmed.startsWith('<') || !trimmed.startsWith('{')) {
          // Solo mostrar mensaje de error en Parte 1 (única con JSON); Partes 2-5 y Todas usan fallback siempre
          if (partKey === 'parte1') setLoadError('Grafo no disponible en el servidor.')
          setGraphData(enrichDataWithDegree(fallback))
          return
        }
        try {
          const data = JSON.parse(text)
          if (data?.nodes?.length) setGraphData(enrichDataWithDegree(data))
          else setGraphData(enrichDataWithDegree(fallback))
        } catch {
          if (partKey === 'parte1') setLoadError('Grafo no disponible en el servidor.')
          setGraphData(enrichDataWithDegree(fallback))
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (partKey === 'parte1') setLoadError(err.message || 'Grafo no disponible en el servidor.')
          setGraphData(enrichDataWithDegree(fallback))
        }
      })
    return () => { cancelled = true }
  }, [partKey, partConfig.graphUrl, enrichDataWithDegree])

  useEffect(() => {
    if (labelTextColor && graphRef.current?.refresh) graphRef.current.refresh()
  }, [labelTextColor])

  useEffect(() => {
    if (!searchTypeOpen) return
    const onOutside = (e) => {
      if (searchTypeDropdownRef.current && !searchTypeDropdownRef.current.contains(e.target)) {
        setSearchTypeOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [searchTypeOpen])

  const data = graphData || { nodes: [], links: [] }
  const hasData = data.nodes.length > 0
  const hasSize = dimensions.width > 0 && dimensions.height > 0

  useEffect(() => {
    if (!hasData || !hasSize) {
      setGraphDataReady(false)
      return
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setGraphDataReady(true))
    })
    return () => cancelAnimationFrame(id)
  }, [hasData, hasSize])

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

  const filteredData = useMemo(() => {
    if (!data?.nodes?.length) return { nodes: [], links: [] }
    const visibleIds = new Set(
      data.nodes.filter((n) => visibleTypes[n.type] !== false).map((n) => n.id)
    )
    const nodes = data.nodes.filter((n) => visibleIds.has(n.id))
    const links = (data.links || []).filter((l) => {
      const a = l.source?.id ?? l.source
      const b = l.target?.id ?? l.target
      return visibleIds.has(a) && visibleIds.has(b)
    })
    return { nodes, links }
  }, [data, visibleTypes])

  const searchResults = useMemo(() => {
    if (!data?.nodes?.length) return []
    const q = (searchQuery || '').trim().toLowerCase()
    const typeFilter = (searchTypeFilter || '').trim()
    return data.nodes
      .filter((n) => {
        if (typeFilter && n.type !== typeFilter) return false
        if (!q) return true
        const id = (n.id || '').toString().toLowerCase()
        const name = (n.name || '').toString().toLowerCase()
        const abbr = getAbbreviatedLabel(n).toLowerCase()
        return id.includes(q) || name.includes(q) || abbr.includes(q)
      })
      .slice(0, 30)
  }, [data?.nodes, searchQuery, searchTypeFilter])

  const handleSearchSelect = useCallback((node) => {
    setSelectedNode(node)
    setTimeout(() => {
      const g = graphRef.current
      if (g?.zoomToFit && node?.id) {
        g.zoomToFit(500, 80, (n) => (n.id ?? n) === node.id)
      }
    }, 150)
  }, [])

  const toggleTypeVisibility = useCallback((type) => {
    setVisibleTypes((prev) => ({ ...prev, [type]: !prev[type] }))
  }, [])

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
      const showLabel = showNodeLabels
      const labelText = getAbbreviatedLabel(node)
      return createNodeMesh(
        node,
        nodeRelSize,
        getEffectiveNodeColor,
        getEffectiveOpacity,
        getIsHighlighted,
        showLabel,
        labelText,
        labelScale,
        labelTextColor
      )
    },
    [
      nodeRelSize,
      getEffectiveNodeColor,
      getEffectiveOpacity,
      getIsHighlighted,
      showNodeLabels,
      labelScale,
      labelTextColor,
    ]
  )
  /** Tooltip al pasar el ratón: nombre completo */
  const nodeLabel = useCallback((n) => n?.name || n?.id || '', [])

  /** Escala la etiqueta del nodo según la distancia a la cámara (más grande cerca, más pequeña lejos). */
  const nodePositionUpdate = useCallback(
    (obj, coords) => {
      if (!useCustomShapes || !graphRef.current) return
      const cam = graphRef.current.camera?.()
      if (!cam) return
      const sprite = obj?.children?.[1]
      if (!sprite?.userData?.isLabelSprite) return
      const dx = cam.position.x - coords.x
      const dy = cam.position.y - coords.y
      const dz = cam.position.z - coords.z
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
      const t = distance / LABEL_REF_DISTANCE
      const scale = Math.max(1.5, Math.min(20, LABEL_BASE_SCALE * t * labelScale))
      sprite.scale.set(scale, scale * 0.45, 1)
    },
    [useCustomShapes, labelScale]
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

  const hexToRgba = useCallback((hex, a) => {
    const h = String(hex).replace(/^#/, '')
    if (h.length !== 6) return `rgba(100,100,100,${a})`
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return `rgba(${r},${g},${b},${a})`
  }, [])

  const linkColor = useCallback(
    (link) => {
      const normal = hexToRgba(linkColorNormal, 0.35)
      if (!selectedNode) return normal
      const a = link.source?.id ?? link.source
      const b = link.target?.id ?? link.target
      if (relatedNodeIds.has(a) && relatedNodeIds.has(b)) return hexToRgba(linkColorHighlight, 0.9)
      return hexToRgba(linkColorNormal, 0.08)
    },
    [selectedNode, relatedNodeIds, linkColorNormal, linkColorHighlight, hexToRgba]
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
    const url = mdUrlForNode(selectedNode, partKey)
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
  }, [selectedNode, partKey])

  const panelTextClass = getContrastTextClasses(graphBgColor).text
  const panelBorderClass = getContrastBorderClass(graphBgColor)
  const isDarkBg = (() => {
    const h = String(graphBgColor || '#000000').replace(/^#/, '')
    if (h.length !== 6) return true
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return 0.299 * r + 0.587 * g + 0.114 * b < 128
  })()
  const panelBorderRClass = isDarkBg ? 'border-r-white/90' : 'border-r-black/90'
  const panelBorderLClass = isDarkBg ? 'border-l-white/90' : 'border-l-black/90'
  const panelBorderBClass = isDarkBg ? 'border-b-white/90' : 'border-b-black/90'
  const searchInputStyle = {
    backgroundColor: isDarkBg ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    borderColor: isDarkBg ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)',
    color: isDarkBg ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)',
  }

  return (
    <div
      className={`relative flex h-full min-h-0 w-full flex-1 overflow-hidden border-b-2 ${panelBorderBClass}`}
      style={{ minHeight: 200, height: '100%', backgroundColor: graphBgColor }}
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
        graphBgColor={graphBgColor}
        borderClass={panelBorderRClass}
        borderBottomClass={panelBorderBClass}
        textClass={panelTextClass}
      />

      <div
        ref={containerRef}
        className="relative min-h-0 min-w-0 flex-1"
        style={{ backgroundColor: graphBgColor }}
      >
        {loadError && (
          <p className={`absolute left-3 top-3 z-10 text-xs ${panelTextClass}`}>
            {loadError} Usando datos de ejemplo.
          </p>
        )}
        {hasData && !hasSize && (
          <div className={`absolute inset-0 z-10 flex items-center justify-center ${panelTextClass}`}>
            Preparando vista 3D…
          </div>
        )}
        {hasData && hasSize && (
          <ForceGraph3D
            key="force-graph-3d"
            ref={graphRef}
            width={Math.max(1, dimensions.width)}
            height={Math.max(1, dimensions.height)}
            graphData={graphDataReady ? filteredData : { nodes: [], links: [] }}
            nodeLabel={nodeLabel}
            nodeColor={nodeColor}
            nodeVal={(n) => n.val ?? 1}
            nodeRelSize={nodeRelSize}
            nodeThreeObject={useCustomShapes ? nodeThreeObject : undefined}
            nodeThreeObjectExtend={useCustomShapes ? false : undefined}
            nodePositionUpdate={useCustomShapes ? nodePositionUpdate : undefined}
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
          <div className={`absolute inset-0 z-10 flex items-center justify-center ${panelTextClass}`}>
            Cargando red de archivos…
          </div>
        )}

        {/* Leyenda: en móvil abajo a la izquierda para no tapar; en md+ arriba derecha */}
        {hasData && (
          <div className="absolute bottom-3 left-3 z-10 flex max-h-[40vh] flex-col overflow-auto sm:bottom-auto sm:left-auto sm:right-3 sm:top-14 sm:max-h-[calc(100vh-5rem)] md:max-h-[calc(100vh-5rem)]">
            <div
              className={`rounded-lg border px-2 py-1.5 sm:px-3 sm:py-2 ${panelBorderClass}`}
              style={{ backgroundColor: graphBgColor }}
            >
              <div className={`mb-1 text-[10px] font-medium uppercase tracking-wider sm:mb-1.5 ${getContrastTextClasses(graphBgColor).text}`}>
                Leyenda · {partConfig.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {Object.entries(nodeTypeLabels).map(([type, label]) => {
                  const isVisible = visibleTypes[type] !== false
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleTypeVisibility(type)}
                      className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-xs opacity-90 hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-inset sm:min-h-0 sm:px-1 sm:py-1"
                      style={{ color: isVisible ? (nodeColors[type] ?? DEFAULT_NODE_COLORS[type]) : undefined }}
                      title={isVisible ? `Ocultar ${label}` : `Mostrar ${label}`}
                    >
                      <span className={isVisible ? 'opacity-90' : 'opacity-40'}>
                        {NODE_TYPE_LEGEND_ICONS[type] ?? NODE_TYPE_LEGEND_ICONS.indice}
                      </span>
                      <span className={panelTextClass}>{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            {/* Buscador: zoom a nodo al seleccionar */}
            <div
              className={`mt-2 rounded-lg border px-2 py-1.5 sm:px-3 sm:py-2 ${panelBorderClass}`}
              style={{ backgroundColor: graphBgColor }}
            >
              <div className={`mb-1.5 text-[10px] font-medium uppercase tracking-wider ${getContrastTextClasses(graphBgColor).text}`}>
                Buscar
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Def-1, Prop 5, Demo 1-2…"
                className="mb-1.5 w-full rounded border px-2 py-1 text-xs placeholder:opacity-60 focus:outline-none focus:ring-1 focus:ring-inset"
                style={searchInputStyle}
                aria-label="Buscar nodo"
              />
              <div className="relative mb-1.5" ref={searchTypeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setSearchTypeOpen((o) => !o)}
                  className="flex w-full items-center justify-between rounded border px-2 py-1 text-left text-xs focus:outline-none focus:ring-1 focus:ring-inset"
                  style={searchInputStyle}
                  aria-label="Filtrar por tipo"
                  aria-expanded={searchTypeOpen}
                >
                  <span>{searchTypeFilter ? (nodeTypeLabels[searchTypeFilter] || searchTypeFilter) : 'Todos'}</span>
                  <svg className="h-3.5 w-3.5 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={searchTypeOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                  </svg>
                </button>
                {searchTypeOpen && (
                  <div
                    className="absolute left-0 right-0 top-full z-20 mt-0.5 max-h-[140px] overflow-y-auto rounded border shadow-lg"
                    style={{ backgroundColor: graphBgColor, borderColor: searchInputStyle.borderColor }}
                  >
                    <button
                      type="button"
                      onClick={() => { setSearchTypeFilter(''); setSearchTypeOpen(false) }}
                      className={`flex w-full items-center gap-1.5 rounded-none px-2 py-1.5 text-left text-xs ${panelTextClass} hover:opacity-100`}
                      style={{ backgroundColor: graphBgColor }}
                    >
                      Todos
                    </button>
                    {Object.entries(nodeTypeLabels)
                      .filter(([t]) => t !== 'indice')
                      .map(([type, label]) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => { setSearchTypeFilter(type); setSearchTypeOpen(false) }}
                          className={`flex w-full items-center gap-1.5 rounded-none px-2 py-1.5 text-left text-xs ${panelTextClass} hover:opacity-100`}
                          style={{ backgroundColor: graphBgColor, color: nodeColors[type] ?? undefined }}
                        >
                          <span className="shrink-0 opacity-90">{NODE_TYPE_LEGEND_ICONS[type] ?? NODE_TYPE_LEGEND_ICONS.indice}</span>
                          {label}
                        </button>
                      ))}
                  </div>
                )}
              </div>
              <div
                className="max-h-[120px] overflow-y-auto rounded border"
                style={{ backgroundColor: searchInputStyle.backgroundColor, borderColor: searchInputStyle.borderColor }}
              >
                {searchResults.length === 0 ? (
                  <p className={`py-1 px-1 text-[10px] opacity-70 ${panelTextClass}`}>
                    {searchQuery || searchTypeFilter ? 'Sin resultados' : 'Escribe o elige tipo'}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-0.5 p-0.5">
                    {searchResults.map((node) => (
                      <li key={node.id}>
                        <button
                          type="button"
                          onClick={() => handleSearchSelect(node)}
                          className={`flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-[11px] transition-colors hover:opacity-100 ${panelTextClass}`}
                          style={{ color: nodeColors[node.type] ?? node.color ?? undefined }}
                          title={node.name || node.id}
                        >
                          <span className="shrink-0 opacity-80">
                            {NODE_TYPE_LEGEND_ICONS[node.type] ?? NODE_TYPE_LEGEND_ICONS.indice}
                          </span>
                          <span className="truncate">{getAbbreviatedLabel(node)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel derecho: en móvil overlay; en md+ en flujo */}
      <div
        className={`absolute right-0 top-0 z-20 flex h-full shrink-0 flex-col overflow-hidden border-l-2 ${panelBorderLClass} shadow-xl transition-[width] duration-300 ease-out md:relative md:z-auto ${
          showControls ? 'w-[min(280px,92vw)]' : 'w-0 border-l-0'
        }`}
        style={{ backgroundColor: graphBgColor }}
      >
        {showControls && (
          <>
            <div className={`flex shrink-0 items-center justify-between gap-1 border-b-2 px-2 py-2 sm:py-1.5 ${panelBorderBClass}`}>
              <span className={`text-[11px] font-medium ${getContrastTextClasses(graphBgColor).active}`}>Controles 3D</span>
              <button
                type="button"
                onClick={() => setShowControls(false)}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded p-1 opacity-70 hover:opacity-100 sm:min-h-0 sm:min-w-0 sm:p-0.5 ${panelTextClass}`}
                aria-label="Cerrar"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden px-2 py-2">
              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={showNodeLabels}
                  onChange={(e) => setShowNodeLabels(e.target.checked)}
                  className="h-3 w-3 rounded border-neutral-400 accent-neutral-500"
                />
                <span className={`text-[10px] ${panelTextClass}`}>Texto en nodos</span>
              </label>
              <div className="flex items-center gap-1">
                <span className={`w-14 shrink-0 text-[10px] ${panelTextClass}`}>Etiquetas</span>
                <input
                  type="range"
                  min={0.4}
                  max={2}
                  step={0.1}
                  value={labelScale}
                  onChange={(e) => setLabelScale(Number(e.target.value))}
                  className="h-1.5 flex-1 accent-neutral-500"
                />
                <span className={`w-5 text-right text-[10px] ${panelTextClass}`}>{labelScale.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  value={labelTextColor}
                  onChange={(e) => setLabelTextColor(e.target.value)}
                  className="h-6 w-8 shrink-0 cursor-pointer rounded border border-neutral-400 bg-transparent"
                  title="Color del texto"
                />
                <span className={`truncate text-[10px] ${panelTextClass}`}>Color texto</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`shrink-0 text-[10px] ${panelTextClass}`}>Nodos</span>
                <input
                  type="range"
                  min={0.5}
                  max={6}
                  step={0.25}
                  value={nodeRelSize}
                  onChange={(e) => setNodeRelSize(Number(e.target.value))}
                  className="h-1.5 flex-1 accent-neutral-500"
                />
                <span className={`w-5 text-right text-[10px] ${panelTextClass}`}>{nodeRelSize}</span>
              </div>
              <div>
                <span className={`mb-0.5 block text-[10px] font-medium ${panelTextClass}`}>Colores tipo</span>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                  {Object.entries(nodeTypeLabels).map(([type, label]) => (
                    <div key={type} className="flex items-center gap-1">
                      <input
                        type="color"
                        value={nodeColors[type] ?? DEFAULT_NODE_COLORS[type]}
                        onChange={(e) => setNodeColorByType(type, e.target.value)}
                        className="h-5 w-6 cursor-pointer rounded border border-neutral-400 bg-transparent"
                        title={label}
                      />
                      <span className={`truncate text-[9px] ${panelTextClass}`}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={graphBgColor}
                    onChange={(e) => setGraphBgColor(e.target.value)}
                    className="h-5 w-6 shrink-0 cursor-pointer rounded border border-neutral-400 bg-transparent"
                    title="Fondo"
                  />
                  <span className={`truncate text-[9px] ${panelTextClass}`}>Fondo</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={linkColorNormal}
                    onChange={(e) => setLinkColorNormal(e.target.value)}
                    className="h-5 w-6 shrink-0 cursor-pointer rounded border border-neutral-400 bg-transparent"
                    title="Enlaces"
                  />
                  <span className={`truncate text-[9px] ${panelTextClass}`}>Enlaces</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={linkColorHighlight}
                    onChange={(e) => setLinkColorHighlight(e.target.value)}
                    className="h-5 w-6 shrink-0 cursor-pointer rounded border border-neutral-400 bg-transparent"
                    title="Enlaces (sel.)"
                  />
                  <span className={`truncate text-[9px] ${panelTextClass}`}>Sel.</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={`w-14 shrink-0 text-[10px] ${panelTextClass}`}>Grosor</span>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.2}
                  value={linkWidthScale}
                  onChange={(e) => setLinkWidthScale(Number(e.target.value))}
                  className="h-1.5 flex-1 accent-neutral-500"
                />
                <span className={`w-5 text-right text-[10px] ${panelTextClass}`}>{linkWidthScale}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`w-14 shrink-0 text-[10px] ${panelTextClass}`}>Distancia</span>
                <input
                  type="range"
                  min={20}
                  max={120}
                  step={5}
                  value={linkDistance}
                  onChange={(e) => setLinkDistance(Number(e.target.value))}
                  className="h-1.5 flex-1 accent-neutral-500"
                />
                <span className={`w-6 text-right text-[10px] ${panelTextClass}`}>{linkDistance}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`w-14 shrink-0 text-[10px] ${panelTextClass}`}>Repulsión</span>
                <input
                  type="range"
                  min={-120}
                  max={-20}
                  step={5}
                  value={chargeStrength}
                  onChange={(e) => setChargeStrength(Number(e.target.value))}
                  className="h-1.5 flex-1 accent-neutral-500"
                />
                <span className={`w-6 text-right text-[10px] ${panelTextClass}`}>{chargeStrength}</span>
              </div>
            </div>
            
          </>
        )}
      </div>
    </div>
  )
}
