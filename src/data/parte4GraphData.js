/**
 * Grafo relacional Parte 4 (De la servidumbre humana). Estructura base.
 */
const FOLDER = { definicion: 'Definiciones', axioma: 'Axiomas', proposicion: 'Proposiciones', demostracion: 'Demostraciones', corolario: 'Corolarios', escolio: 'Escolios' }
const defs = Array.from({ length: 4 }, (_, i) => ({ id: `Definicion ${i + 1}`, name: `Definición ${i + 1}`, type: 'definicion', val: 1, path: `${FOLDER.definicion}/Definicion ${i + 1}.md` }))
const axioms = Array.from({ length: 1 }, (_, i) => ({ id: `Axioma ${i + 1}`, name: `Axioma ${i + 1}`, type: 'axioma', val: 1, path: `${FOLDER.axioma}/Axioma ${i + 1}.md` }))
const props = Array.from({ length: 25 }, (_, i) => ({ id: `Proposicion ${i + 1}`, name: `Proposición ${i + 1}`, type: 'proposicion', val: 1, path: `${FOLDER.proposicion}/Proposicion ${i + 1}.md` }))
const nodes = [...defs, ...axioms, ...props]
const links = [
  { source: 'Definicion 1', target: 'Proposicion 1', value: 1 },
  { source: 'Axioma 1', target: 'Proposicion 2', value: 1 },
  { source: 'Proposicion 1', target: 'Proposicion 3', value: 1 },
  { source: 'Definicion 2', target: 'Proposicion 4', value: 1 },
]
const degree = {}
nodes.forEach((n) => { degree[n.id] = 0 })
links.forEach((l) => { degree[l.source] = (degree[l.source] || 0) + 1; degree[l.target] = (degree[l.target] || 0) + 1 })
nodes.forEach((n) => { n.val = Math.max(1, degree[n.id]) })
export default { nodes, links }
export { nodes, links }
