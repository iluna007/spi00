/**
 * Grafo relacional Parte 1 (De Dios): Definiciones, Axiomas, Proposiciones y sus referencias.
 * Nodos con val = grado (número de enlaces) para tamaño por relaciones.
 * Enlaces con value para grosor por “fuerza” de relación.
 */
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

// Referencias "utilizado en" (Def/Axioma → Proposicion). value = 1 base, 2 si hay múltiples citas.
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
]

const nodes = [...definiciones, ...axiomas, ...proposiciones]
const links = linksData.map((l) => ({ ...l, source: l.source, target: l.target }))

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
