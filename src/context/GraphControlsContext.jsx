import { createContext, useContext, useState } from 'react'

const DEFAULT_GRAPH_BG = '#000000'

/** Devuelve clase de borde blanco o negro según luminancia del fondo (contorno visible). */
export function getContrastBorderClass(hex) {
  const h = String(hex || DEFAULT_GRAPH_BG).replace(/^#/, '')
  if (h.length !== 6) return 'border-white/90'
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  return lum < 128 ? 'border-white/90' : 'border-black/90'
}

/** Borde solo a la derecha (para panel lateral). */
export function getContrastBorderRClass(hex) {
  const h = String(hex || DEFAULT_GRAPH_BG).replace(/^#/, '')
  if (h.length !== 6) return 'border-r-white/90'
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  return lum < 128 ? 'border-r-white/90' : 'border-r-black/90'
}

/** Texto legible sobre el fondo (clases para enlaces normales y activos). */
export function getContrastTextClasses(hex) {
  const h = String(hex || DEFAULT_GRAPH_BG).replace(/^#/, '')
  if (h.length !== 6) return { text: 'text-white/80', active: 'text-white' }
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  return lum < 128
    ? { text: 'text-white/80', active: 'text-white' }
    : { text: 'text-neutral-600', active: 'text-neutral-900' }
}

const GraphControlsContext = createContext(null)

export function GraphControlsProvider({ children }) {
  const [showControls, setShowControls] = useState(false)
  const [graphBgColor, setGraphBgColor] = useState(DEFAULT_GRAPH_BG)
  return (
    <GraphControlsContext.Provider
      value={{ showControls, setShowControls, graphBgColor, setGraphBgColor }}
    >
      {children}
    </GraphControlsContext.Provider>
  )
}

export function useGraphControls() {
  const ctx = useContext(GraphControlsContext)
  return ctx ?? {
    showControls: false,
    setShowControls: () => {},
    graphBgColor: DEFAULT_GRAPH_BG,
    setGraphBgColor: () => {},
  }
}
