import { getPartConfig, getMdBasePath, TODAS_KEY } from '../data/partsConfig'

/** URL absoluta (desde el origen del sitio) del .md de un nodo del grafo. */
export function mdUrlForNode(node, partKey) {
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
