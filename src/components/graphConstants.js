/**
 * Constantes y config estática del grafo 3D (evita re-creación en cada render).
 */
import * as THREE from 'three'

export const NODE_TYPE_LABELS_BASE = {
  definicion: 'Definición',
  axioma: 'Axioma',
  proposicion: 'Proposición',
  demostracion: 'Demostración',
  corolario: 'Corolario',
  escolio: 'Escolio',
  indice: 'Índice',
}

export const DEFAULT_NODE_COLORS = {
  definicion: '#2563eb',
  axioma: '#059669',
  proposicion: '#d97706',
  demostracion: '#dc2626',
  corolario: '#7c3aed',
  escolio: '#0d9488',
  indice: '#475569',
}

export const NODE_GEOMETRIES = {
  definicion: new THREE.BoxGeometry(1, 1, 1),
  axioma: new THREE.OctahedronGeometry(0.7, 0),
  proposicion: new THREE.IcosahedronGeometry(0.65, 0),
  demostracion: new THREE.CylinderGeometry(0.5, 0.5, 1, 6),
  corolario: new THREE.ConeGeometry(0.6, 1, 6),
  escolio: new THREE.TorusGeometry(0.5, 0.25, 8, 16),
  indice: new THREE.OctahedronGeometry(0.55, 0),
}

const materialCache = new Map()
export function getMaterial(color, opacity = 1, isHighlighted = false) {
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

const labelTextureCache = new Map()
const DPR = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)

function makeLabelTexture(text, textColor) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const fontSize = 20
  const font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Roboto, sans-serif`
  ctx.font = font
  const m = ctx.measureText(text)
  const pad = 18
  const w = Math.ceil(Math.max(m.width + pad * 2, 1) * DPR)
  const h = Math.ceil(36 * DPR)
  canvas.width = w
  canvas.height = h
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
  const cx = w / DPR / 2
  const cy = h / DPR / 2
  const r = 6
  const x = 4, y = 4, rw = w / DPR - 8, rh = h / DPR - 8
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, rw, rh, r)
  } else {
    ctx.rect(x, y, rw, rh)
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.72)'
  ctx.fill()
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = /^#[0-9a-fA-F]{6}$/.test(textColor) ? textColor : '#ffffff'
  ctx.fillText(text, cx, cy)
  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return tex
}

export function getLabelTexture(name, textColor) {
  const key = (name || '') + '|' + (textColor || '')
  if (!labelTextureCache.has(key)) {
    labelTextureCache.set(key, makeLabelTexture(name || '', textColor))
  }
  return labelTextureCache.get(key)
}
