/**
 * Configuración de las 5 partes de la Ética y la vista "Todas".
 */
export const PARTS = [
  { partKey: 'parte1', label: 'Parte 1', folderName: 'Parte 1', graphUrl: '/parte1-graph.json' },
  { partKey: 'parte2', label: 'Parte 2', folderName: 'Parte 2', graphUrl: '/parte2-graph.json' },
  { partKey: 'parte3', label: 'Parte 3', folderName: 'Parte 3', graphUrl: '/parte3-graph.json' },
  { partKey: 'parte4', label: 'Parte 4', folderName: 'Parte 4', graphUrl: '/parte4-graph.json' },
  { partKey: 'parte5', label: 'Parte 5', folderName: 'Parte 5', graphUrl: '/parte5-graph.json' },
]

export const PART_KEYS = PARTS.map((p) => p.partKey)
export const TODAS_KEY = 'todas'

export function getPartConfig(partKey) {
  if (partKey === TODAS_KEY) return { partKey: TODAS_KEY, label: 'Todas las partes', folderName: null, graphUrl: '/todas-graph.json' }
  return PARTS.find((p) => p.partKey === partKey) || PARTS[0]
}

export function getMdBasePath(partKey, folderName) {
  if (partKey === TODAS_KEY && folderName) {
    return '/Obsidian/spi1/' + encodeURIComponent(folderName) + '/'
  }
  const config = getPartConfig(partKey)
  if (!config.folderName) return '/Obsidian/spi1/Parte 1/'
  return '/Obsidian/spi1/' + encodeURIComponent(config.folderName) + '/'
}
