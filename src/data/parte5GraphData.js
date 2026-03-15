/**
 * Grafo relacional Parte 5 (Del poder del entendimiento o de la libertad humana).
 * Parte 5: 0 Definiciones, 2 Axiomas, 41 Proposiciones. Incluye nodo indice (esfera) como centro.
 */
const FOLDER = { axioma: 'Axiomas', proposicion: 'Proposiciones', demostracion: 'Demostraciones', corolario: 'Corolarios', escolio: 'Escolios' }
const INDICE_ID = 'Parte 5 - De la Libertad'
const indice = { id: INDICE_ID, name: INDICE_ID, type: 'indice', val: 1, path: 'Parte 5 - De la Libertad.md' }
const axioms = Array.from({ length: 2 }, (_, i) => ({ id: `Axioma ${i + 1}`, name: `Axioma ${i + 1}`, type: 'axioma', val: 1, path: `${FOLDER.axioma}/Axioma ${i + 1}.md` }))
const props = Array.from({ length: 41 }, (_, i) => ({ id: `Proposicion ${i + 1}`, name: `Proposición ${i + 1}`, type: 'proposicion', val: 1, path: `${FOLDER.proposicion}/Proposicion ${i + 1}.md` }))
const demos = [
  { id: 'Demostracion 1 - Proposicion 1', name: 'Demostración 1 - Proposición 1', type: 'demostracion', val: 1, path: `${FOLDER.demostracion}/Demostracion 1 - Proposicion 1.md` },
  { id: 'Demostracion 1 - Proposicion 10', name: 'Demostración 1 - Proposición 10', type: 'demostracion', val: 1, path: `${FOLDER.demostracion}/Demostracion 1 - Proposicion 10.md` },
  { id: 'Demostracion 1 - Proposicion 21', name: 'Demostración 1 - Proposición 21', type: 'demostracion', val: 1, path: `${FOLDER.demostracion}/Demostracion 1 - Proposicion 21.md` },
]
const corolarios = [
  { id: 'Corolario 1 - Proposicion 7', name: 'Corolario 1 - Proposición 7', type: 'corolario', val: 1, path: `${FOLDER.corolario}/Corolario 1 - Proposicion 7.md` },
  { id: 'Corolario 1 - Proposicion 18', name: 'Corolario 1 - Proposición 18', type: 'corolario', val: 1, path: `${FOLDER.corolario}/Corolario 1 - Proposicion 18.md` },
]
const escolios = [
  { id: 'Escolio 1 - Proposicion 4', name: 'Escolio 1 - Proposición 4', type: 'escolio', val: 1, path: `${FOLDER.escolio}/Escolio 1 - Proposicion 4.md` },
  { id: 'Escolio 1 - Proposicion 23', name: 'Escolio 1 - Proposición 23', type: 'escolio', val: 1, path: `${FOLDER.escolio}/Escolio 1 - Proposicion 23.md` },
  { id: 'Escolio 1 - Proposicion 36', name: 'Escolio 1 - Proposición 36', type: 'escolio', val: 1, path: `${FOLDER.escolio}/Escolio 1 - Proposicion 36.md` },
]
const contentNodes = [...axioms, ...props, ...demos, ...corolarios, ...escolios]
const nodes = [indice, ...contentNodes]
const indiceLinks = contentNodes.map((n) => ({ source: INDICE_ID, target: n.id, value: 1 }))
// Red de conexiones entre contenido (Axioma → Proposición, Proposición → Proposición), al estilo Parte 1
const contentLinks = []
contentLinks.push({ source: 'Axioma 1', target: 'Proposicion 1', value: 1 })
contentLinks.push({ source: 'Axioma 1', target: 'Proposicion 7', value: 1 })
contentLinks.push({ source: 'Axioma 1', target: 'Proposicion 15', value: 1 })
contentLinks.push({ source: 'Axioma 2', target: 'Proposicion 2', value: 1 })
contentLinks.push({ source: 'Axioma 2', target: 'Proposicion 8', value: 1 })
contentLinks.push({ source: 'Axioma 2', target: 'Proposicion 21', value: 1 })
for (let i = 1; i < 41; i++) contentLinks.push({ source: `Proposicion ${i}`, target: `Proposicion ${i + 1}`, value: 1 })
for (let i = 1; i <= 36; i += 2) contentLinks.push({ source: `Proposicion ${i}`, target: `Proposicion ${Math.min(i + 4, 41)}`, value: 1 })
contentLinks.push({ source: 'Demostracion 1 - Proposicion 1', target: 'Proposicion 1', value: 1 })
contentLinks.push({ source: 'Demostracion 1 - Proposicion 10', target: 'Proposicion 10', value: 1 })
contentLinks.push({ source: 'Demostracion 1 - Proposicion 21', target: 'Proposicion 21', value: 1 })
contentLinks.push({ source: 'Corolario 1 - Proposicion 7', target: 'Proposicion 7', value: 1 })
contentLinks.push({ source: 'Corolario 1 - Proposicion 18', target: 'Proposicion 18', value: 1 })
contentLinks.push({ source: 'Escolio 1 - Proposicion 4', target: 'Proposicion 4', value: 1 })
contentLinks.push({ source: 'Escolio 1 - Proposicion 23', target: 'Proposicion 23', value: 1 })
contentLinks.push({ source: 'Escolio 1 - Proposicion 36', target: 'Proposicion 36', value: 1 })
const links = [...contentLinks, ...indiceLinks]
const degree = {}
nodes.forEach((n) => { degree[n.id] = 0 })
links.forEach((l) => { degree[l.source] = (degree[l.source] || 0) + 1; degree[l.target] = (degree[l.target] || 0) + 1 })
nodes.forEach((n) => { n.val = Math.max(1, degree[n.id]) })
export default { nodes, links }
export { nodes, links }
