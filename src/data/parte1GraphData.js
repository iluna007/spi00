/**
 * Grafo relacional Parte 1 (De Dios): Definiciones, Axiomas, Proposiciones y sus referencias.
 * Nodos con val = grado (número de enlaces) para tamaño por relaciones.
 * Enlaces con value para grosor por “fuerza” de relación.
 */
const INDICE_ID = 'Parte 1 - De Dios'
const indice = { id: INDICE_ID, name: INDICE_ID, type: 'indice', val: 1 }

const definiciones = Array.from({ length: 8 }, (_, i) => ({
  id: `Definicion ${i + 1}`,
  name: `Definición ${i + 1}`,
  type: 'definicion',
  val: 1,
}))

const axiomas = Array.from({ length: 7 }, (_, i) => ({
  id: `Axioma ${i + 1}`,
  name: `Axioma ${i + 1}`,
  type: 'axioma',
  val: 1,
}))

const proposiciones = Array.from({ length: 24 }, (_, i) => ({
  id: `Proposicion ${i + 1}`,
  name: `Proposición ${i + 1}`,
  type: 'proposicion',
  val: 1,
}))

const demostraciones = [
  { id: 'Demostracion 1 - Proposicion 1', name: 'Demostración 1 - Proposición 1', type: 'demostracion', val: 1 },
  { id: 'Demostracion 1 - Proposicion 4', name: 'Demostración 1 - Proposición 4', type: 'demostracion', val: 1 },
  { id: 'Demostracion 1 - Proposicion 6', name: 'Demostración 1 - Proposición 6', type: 'demostracion', val: 1 },
  { id: 'Demostracion 1 - Proposicion 11', name: 'Demostración 1 - Proposición 11', type: 'demostracion', val: 1 },
  { id: 'Demostracion 1 - Proposicion 15', name: 'Demostración 1 - Proposición 15', type: 'demostracion', val: 1 },
]

const corolarios = [
  { id: 'Corolario 1 - Proposicion 6', name: 'Corolario 1 - Proposición 6', type: 'corolario', val: 1 },
  { id: 'Corolario 1 - Proposicion 13', name: 'Corolario 1 - Proposición 13', type: 'corolario', val: 1 },
  { id: 'Corolario 1 - Proposicion 14', name: 'Corolario 1 - Proposición 14', type: 'corolario', val: 1 },
  { id: 'Corolario 1 - Proposicion 16', name: 'Corolario 1 - Proposición 16', type: 'corolario', val: 1 },
  { id: 'Corolario 1 - Proposicion 25', name: 'Corolario 1 - Proposición 25', type: 'corolario', val: 1 },
]

const escolios = [
  { id: 'Escolio 1 - Proposicion 8', name: 'Escolio 1 - Proposición 8', type: 'escolio', val: 1 },
  { id: 'Escolio 1 - Proposicion 10', name: 'Escolio 1 - Proposición 10', type: 'escolio', val: 1 },
  { id: 'Escolio 1 - Proposicion 15', name: 'Escolio 1 - Proposición 15', type: 'escolio', val: 1 },
  { id: 'Escolio 1 - Proposicion 17', name: 'Escolio 1 - Proposición 17', type: 'escolio', val: 1 },
  { id: 'Escolio 1 - Proposicion 28', name: 'Escolio 1 - Proposición 28', type: 'escolio', val: 1 },
]

const contentNodes = [...definiciones, ...axiomas, ...proposiciones, ...demostraciones, ...corolarios, ...escolios]
const indiceLinks = contentNodes.map((n) => ({ source: INDICE_ID, target: n.id, value: 1 }))

// Referencias Def/Axioma → Proposición y Proposición ↔ Demostración/Corolario/Escolio
const linksData = [
  { source: 'Definicion 3', target: 'Proposicion 1', value: 1 },
  { source: 'Definicion 5', target: 'Proposicion 1', value: 1 },
  { source: 'Definicion 3', target: 'Proposicion 2', value: 1 },
  { source: 'Axioma 4', target: 'Proposicion 3', value: 1 },
  { source: 'Axioma 5', target: 'Proposicion 3', value: 1 },
  { source: 'Definicion 3', target: 'Proposicion 4', value: 1 },
  { source: 'Definicion 4', target: 'Proposicion 4', value: 1 },
  { source: 'Definicion 5', target: 'Proposicion 4', value: 1 },
  { source: 'Axioma 1', target: 'Proposicion 4', value: 1 },
  { source: 'Axioma 6', target: 'Proposicion 5', value: 1 },
  { source: 'Definicion 3', target: 'Proposicion 5', value: 1 },
  { source: 'Definicion 5', target: 'Proposicion 5', value: 1 },
  { source: 'Axioma 1', target: 'Proposicion 6', value: 1 },
  { source: 'Axioma 4', target: 'Proposicion 6', value: 1 },
  { source: 'Definicion 1', target: 'Proposicion 7', value: 1 },
  { source: 'Definicion 2', target: 'Proposicion 8', value: 1 },
  { source: 'Definicion 4', target: 'Proposicion 9', value: 1 },
  { source: 'Definicion 3', target: 'Proposicion 10', value: 1 },
  { source: 'Definicion 4', target: 'Proposicion 10', value: 1 },
  { source: 'Definicion 6', target: 'Proposicion 10', value: 1 },
  { source: 'Axioma 1', target: 'Proposicion 11', value: 1 },
  { source: 'Axioma 7', target: 'Proposicion 11', value: 1 },
  { source: 'Definicion 4', target: 'Proposicion 12', value: 1 },
  { source: 'Definicion 6', target: 'Proposicion 13', value: 1 },
  { source: 'Axioma 1', target: 'Proposicion 14', value: 1 },
  { source: 'Definicion 6', target: 'Proposicion 14', value: 1 },
  { source: 'Definicion 3', target: 'Proposicion 15', value: 1 },
  { source: 'Definicion 5', target: 'Proposicion 15', value: 1 },
  { source: 'Axioma 1', target: 'Proposicion 15', value: 1 },
  { source: 'Definicion 6', target: 'Proposicion 16', value: 1 },
  { source: 'Definicion 7', target: 'Proposicion 17', value: 1 },
  { source: 'Definicion 3', target: 'Proposicion 18', value: 1 },
  { source: 'Definicion 4', target: 'Proposicion 19', value: 1 },
  { source: 'Definicion 6', target: 'Proposicion 19', value: 1 },
  { source: 'Definicion 8', target: 'Proposicion 19', value: 1 },
  { source: 'Definicion 4', target: 'Proposicion 20', value: 1 },
  { source: 'Definicion 8', target: 'Proposicion 20', value: 1 },
  { source: 'Definicion 2', target: 'Proposicion 21', value: 1 },
  { source: 'Definicion 5', target: 'Proposicion 23', value: 1 },
  { source: 'Definicion 6', target: 'Proposicion 23', value: 1 },
  { source: 'Definicion 8', target: 'Proposicion 23', value: 1 },
  { source: 'Axioma 4', target: 'Proposicion 25', value: 1 },
  { source: 'Definicion 5', target: 'Proposicion 25', value: 1 },
  { source: 'Definicion 5', target: 'Proposicion 28', value: 1 },
  { source: 'Definicion 3', target: 'Proposicion 28', value: 1 },
  { source: 'Axioma 1', target: 'Proposicion 28', value: 1 },
  { source: 'Definicion 6', target: 'Proposicion 31', value: 1 },
  { source: 'Demostracion 1 - Proposicion 1', target: 'Proposicion 1', value: 1 },
  { source: 'Demostracion 1 - Proposicion 4', target: 'Proposicion 4', value: 1 },
  { source: 'Demostracion 1 - Proposicion 6', target: 'Proposicion 6', value: 1 },
  { source: 'Demostracion 1 - Proposicion 11', target: 'Proposicion 11', value: 1 },
  { source: 'Demostracion 1 - Proposicion 15', target: 'Proposicion 15', value: 1 },
  { source: 'Corolario 1 - Proposicion 6', target: 'Proposicion 6', value: 1 },
  { source: 'Corolario 1 - Proposicion 13', target: 'Proposicion 13', value: 1 },
  { source: 'Corolario 1 - Proposicion 14', target: 'Proposicion 14', value: 1 },
  { source: 'Corolario 1 - Proposicion 16', target: 'Proposicion 16', value: 1 },
  { source: 'Corolario 1 - Proposicion 25', target: 'Proposicion 25', value: 1 },
  { source: 'Escolio 1 - Proposicion 8', target: 'Proposicion 8', value: 1 },
  { source: 'Escolio 1 - Proposicion 10', target: 'Proposicion 10', value: 1 },
  { source: 'Escolio 1 - Proposicion 15', target: 'Proposicion 15', value: 1 },
  { source: 'Escolio 1 - Proposicion 17', target: 'Proposicion 17', value: 1 },
  { source: 'Escolio 1 - Proposicion 28', target: 'Proposicion 28', value: 1 },
]

const nodes = [indice, ...contentNodes]
const links = [...linksData.map((l) => ({ ...l, source: l.source, target: l.target })), ...indiceLinks]

// Calcular grado (número de enlaces) por nodo para val
const degree = {}
nodes.forEach((n) => { degree[n.id] = 0 })
links.forEach((l) => {
  degree[l.source] = (degree[l.source] || 0) + 1
  degree[l.target] = (degree[l.target] || 0) + 1
})
nodes.forEach((n) => { n.val = Math.max(1, degree[n.id]) })

export default { nodes, links }
export { nodes, links }
