/**
 * Cliente para Context7.
 * Por ahora devuelve datos mock; cuando exista API real, sustituir fetch por llamada HTTP.
 * La UI solo consume del store Flux (slice context7), nunca llama directamente a este módulo
 * desde componentes — se usa desde action creators o efectos.
 *
 * @see state/store.js - slice context7
 */

/**
 * Obtiene hints/contexto para un nodo del grafo.
 * @param {string} nodeId - ID del nodo (ej. "Proposicion 1", "Axioma 1")
 * @returns {Promise<Array<{ title: string, text: string }>>}
 */
export async function fetchNodeHints(nodeId) {
  if (!nodeId) return []
  await new Promise((r) => setTimeout(r, 300))
  return [
    { title: 'Contexto', text: `Información adicional para "${nodeId}" (mock). Conectar con Context7 cuando la API esté disponible.` },
  ]
}

/**
 * Obtiene conceptos relacionados para un nodo.
 * @param {string} nodeId - ID del nodo
 * @returns {Promise<Array<{ id: string, label: string }>>}
 */
export async function fetchRelatedConcepts(nodeId) {
  if (!nodeId) return []
  await new Promise((r) => setTimeout(r, 200))
  return []
}
