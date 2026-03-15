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
  indice: new THREE.SphereGeometry(0.6, 12, 12),
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

export function getLabelTexture(name) {
  const key = name || ''
  if (!labelTextureCache.has(key)) {
    labelTextureCache.set(key, makeLabelTexture(key))
  }
  return labelTextureCache.get(key)
}
