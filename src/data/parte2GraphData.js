/**
 * Grafo relacional Parte 2 (De la naturaleza y origen del alma). Estructura base.
 * Incluye nodo indice (esfera) como centro conectado a todo el contenido.
 */
const FOLDER = { definicion: 'Definiciones', axioma: 'Axiomas', proposicion: 'Proposiciones', demostracion: 'Demostraciones', corolario: 'Corolarios', escolio: 'Escolios' }
const INDICE_ID = 'Parte 2 - De la Mente'
const indice = { id: INDICE_ID, name: INDICE_ID, type: 'indice', val: 1, path: 'Parte 2 - De la Mente.md' }
const defs = Array.from({ length: 5 }, (_, i) => ({ id: `Definicion ${i + 1}`, name: `Definición ${i + 1}`, type: 'definicion', val: 1, path: `${FOLDER.definicion}/Definicion ${i + 1}.md` }))
const axioms = Array.from({ length: 5 }, (_, i) => ({ id: `Axioma ${i + 1}`, name: `Axioma ${i + 1}`, type: 'axioma', val: 1, path: `${FOLDER.axioma}/Axioma ${i + 1}.md` }))
const props = Array.from({ length: 15 }, (_, i) => ({ id: `Proposicion ${i + 1}`, name: `Proposición ${i + 1}`, type: 'proposicion', val: 1, path: `${FOLDER.proposicion}/Proposicion ${i + 1}.md` }))
const demos = [
  { id: 'Demostracion 1 - Proposicion 1', name: 'Demostración 1 - Proposición 1', type: 'demostracion', val: 1, path: `${FOLDER.demostracion}/Demostracion 1 - Proposicion 1.md` },
  { id: 'Demostracion 1 - Proposicion 4', name: 'Demostración 1 - Proposición 4', type: 'demostracion', val: 1, path: `${FOLDER.demostracion}/Demostracion 1 - Proposicion 4.md` },
  { id: 'Demostracion 1 - Proposicion 7', name: 'Demostración 1 - Proposición 7', type: 'demostracion', val: 1, path: `${FOLDER.demostracion}/Demostracion 1 - Proposicion 7.md` },
  { id: 'Demostracion 1 - Proposicion 10', name: 'Demostración 1 - Proposición 10', type: 'demostracion', val: 1, path: `${FOLDER.demostracion}/Demostracion 1 - Proposicion 10.md` },
]
const corolarios = [
  { id: 'Corolario 1 - Proposicion 3', name: 'Corolario 1 - Proposición 3', type: 'corolario', val: 1, path: `${FOLDER.corolario}/Corolario 1 - Proposicion 3.md` },
  { id: 'Corolario 1 - Proposicion 6', name: 'Corolario 1 - Proposición 6', type: 'corolario', val: 1, path: `${FOLDER.corolario}/Corolario 1 - Proposicion 6.md` },
  { id: 'Corolario 1 - Proposicion 9', name: 'Corolario 1 - Proposición 9', type: 'corolario', val: 1, path: `${FOLDER.corolario}/Corolario 1 - Proposicion 9.md` },
]
const escolios = [
  { id: 'Escolio 1 - Proposicion 2', name: 'Escolio 1 - Proposición 2', type: 'escolio', val: 1, path: `${FOLDER.escolio}/Escolio 1 - Proposicion 2.md` },
  { id: 'Escolio 1 - Proposicion 5', name: 'Escolio 1 - Proposición 5', type: 'escolio', val: 1, path: `${FOLDER.escolio}/Escolio 1 - Proposicion 5.md` },
  { id: 'Escolio 1 - Proposicion 8', name: 'Escolio 1 - Proposición 8', type: 'escolio', val: 1, path: `${FOLDER.escolio}/Escolio 1 - Proposicion 8.md` },
  { id: 'Escolio 1 - Proposicion 12', name: 'Escolio 1 - Proposición 12', type: 'escolio', val: 1, path: `${FOLDER.escolio}/Escolio 1 - Proposicion 12.md` },
]
const contentNodes = [...defs, ...axioms, ...props, ...demos, ...corolarios, ...escolios]
const nodes = [indice, ...contentNodes]
const indiceLinks = contentNodes.map((n) => ({ source: INDICE_ID, target: n.id, value: 1 }))
// Red de conexiones entre contenido (Def/Axioma → Proposición, Proposición → Proposición), al estilo Parte 1
const contentLinks = [
  { source: 'Definicion 1', target: 'Proposicion 1', value: 1 },
  { source: 'Definicion 1', target: 'Proposicion 2', value: 1 },
  { source: 'Definicion 2', target: 'Proposicion 2', value: 1 },
  { source: 'Definicion 2', target: 'Proposicion 3', value: 1 },
  { source: 'Definicion 3', target: 'Proposicion 4', value: 1 },
  { source: 'Definicion 3', target: 'Proposicion 5', value: 1 },
  { source: 'Definicion 4', target: 'Proposicion 6', value: 1 },
  { source: 'Definicion 4', target: 'Proposicion 7', value: 1 },
  { source: 'Definicion 5', target: 'Proposicion 8', value: 1 },
  { source: 'Definicion 5', target: 'Proposicion 9', value: 1 },
  { source: 'Axioma 1', target: 'Proposicion 1', value: 1 },
  { source: 'Axioma 1', target: 'Proposicion 5', value: 1 },
  { source: 'Axioma 2', target: 'Proposicion 3', value: 1 },
  { source: 'Axioma 2', target: 'Proposicion 6', value: 1 },
  { source: 'Axioma 3', target: 'Proposicion 7', value: 1 },
  { source: 'Axioma 3', target: 'Proposicion 10', value: 1 },
  { source: 'Axioma 4', target: 'Proposicion 9', value: 1 },
  { source: 'Axioma 4', target: 'Proposicion 11', value: 1 },
  { source: 'Axioma 5', target: 'Proposicion 12', value: 1 },
  { source: 'Axioma 5', target: 'Proposicion 13', value: 1 },
  { source: 'Proposicion 1', target: 'Proposicion 4', value: 1 },
  { source: 'Proposicion 2', target: 'Proposicion 4', value: 1 },
  { source: 'Proposicion 3', target: 'Proposicion 5', value: 1 },
  { source: 'Proposicion 4', target: 'Proposicion 6', value: 1 },
  { source: 'Proposicion 5', target: 'Proposicion 7', value: 1 },
  { source: 'Proposicion 6', target: 'Proposicion 8', value: 1 },
  { source: 'Proposicion 7', target: 'Proposicion 9', value: 1 },
  { source: 'Proposicion 8', target: 'Proposicion 10', value: 1 },
  { source: 'Proposicion 9', target: 'Proposicion 11', value: 1 },
  { source: 'Proposicion 10', target: 'Proposicion 12', value: 1 },
  { source: 'Proposicion 11', target: 'Proposicion 13', value: 1 },
  { source: 'Proposicion 12', target: 'Proposicion 14', value: 1 },
  { source: 'Proposicion 13', target: 'Proposicion 15', value: 1 },
  { source: 'Proposicion 1', target: 'Proposicion 6', value: 1 },
  { source: 'Proposicion 3', target: 'Proposicion 8', value: 1 },
  { source: 'Proposicion 5', target: 'Proposicion 10', value: 1 },
  { source: 'Proposicion 7', target: 'Proposicion 12', value: 1 },
  { source: 'Demostracion 1 - Proposicion 1', target: 'Proposicion 1', value: 1 },
  { source: 'Demostracion 1 - Proposicion 4', target: 'Proposicion 4', value: 1 },
  { source: 'Demostracion 1 - Proposicion 7', target: 'Proposicion 7', value: 1 },
  { source: 'Demostracion 1 - Proposicion 10', target: 'Proposicion 10', value: 1 },
  { source: 'Corolario 1 - Proposicion 3', target: 'Proposicion 3', value: 1 },
  { source: 'Corolario 1 - Proposicion 6', target: 'Proposicion 6', value: 1 },
  { source: 'Corolario 1 - Proposicion 9', target: 'Proposicion 9', value: 1 },
  { source: 'Escolio 1 - Proposicion 2', target: 'Proposicion 2', value: 1 },
  { source: 'Escolio 1 - Proposicion 5', target: 'Proposicion 5', value: 1 },
  { source: 'Escolio 1 - Proposicion 8', target: 'Proposicion 8', value: 1 },
  { source: 'Escolio 1 - Proposicion 12', target: 'Proposicion 12', value: 1 },
]
const links = [...contentLinks, ...indiceLinks]
const degree = {}
nodes.forEach((n) => { degree[n.id] = 0 })
links.forEach((l) => { degree[l.source] = (degree[l.source] || 0) + 1; degree[l.target] = (degree[l.target] || 0) + 1 })
nodes.forEach((n) => { n.val = Math.max(1, degree[n.id]) })
export default { nodes, links }
export { nodes, links }
