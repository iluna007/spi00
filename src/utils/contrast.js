export const DEFAULT_GRAPH_BG = '#000000'

export function getContrastBorderClass(hex) {
  const h = String(hex || DEFAULT_GRAPH_BG).replace(/^#/, '')
  if (h.length !== 6) return 'border-white/90'
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  return lum < 128 ? 'border-white/90' : 'border-black/90'
}

export function getContrastBorderRClass(hex) {
  const h = String(hex || DEFAULT_GRAPH_BG).replace(/^#/, '')
  if (h.length !== 6) return 'border-r-white/90'
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  return lum < 128 ? 'border-r-white/90' : 'border-r-black/90'
}

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
