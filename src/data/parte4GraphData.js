/**
 * Grafo relacional Parte 4 (De la servidumbre humana). Estructura base.
 * Incluye nodo indice (esfera) como centro conectado a todo el contenido.
 */
const FOLDER = { definicion: 'Definiciones', axioma: 'Axiomas', proposicion: 'Proposiciones', demostracion: 'Demostraciones', corolario: 'Corolarios', escolio: 'Escolios' }
const INDICE_ID = 'Parte 4 - De la Servidumbre'
const indice = { id: INDICE_ID, name: INDICE_ID, type: 'indice', val: 1, path: 'Parte 4 - De la Servidumbre.md' }
const defs = Array.from({ length: 8 }, (_, i) => ({ id: `Definicion ${i + 1}`, name: `Definición ${i + 1}`, type: 'definicion', val: 1, path: `${FOLDER.definicion}/Definicion ${i + 1}.md` }))
const axioms = Array.from({ length: 1 }, (_, i) => ({ id: `Axioma ${i + 1}`, name: `Axioma ${i + 1}`, type: 'axioma', val: 1, path: `${FOLDER.axioma}/Axioma ${i + 1}.md` }))
const props = Array.from({ length: 67 }, (_, i) => ({ id: `Proposicion ${i + 1}`, name: `Proposición ${i + 1}`, type: 'proposicion', val: 1, path: `${FOLDER.proposicion}/Proposicion ${i + 1}.md` }))
const demos = [
  { id: 'Demostracion 1 - Proposicion 1', name: 'Demostración 1 - Proposición 1', type: 'demostracion', val: 1, path: `${FOLDER.demostracion}/Demostracion 1 - Proposicion 1.md` },
  { id: 'Demostracion 1 - Proposicion 18', name: 'Demostración 1 - Proposición 18', type: 'demostracion', val: 1, path: `${FOLDER.demostracion}/Demostracion 1 - Proposicion 18.md` },
  { id: 'Demostracion 1 - Proposicion 35', name: 'Demostración 1 - Proposición 35', type: 'demostracion', val: 1, path: `${FOLDER.demostracion}/Demostracion 1 - Proposicion 35.md` },
  { id: 'Demostracion 1 - Proposicion 50', name: 'Demostración 1 - Proposición 50', type: 'demostracion', val: 1, path: `${FOLDER.demostracion}/Demostracion 1 - Proposicion 50.md` },
]
const corolarios = [
  { id: 'Corolario 1 - Proposicion 5', name: 'Corolario 1 - Proposición 5', type: 'corolario', val: 1, path: `${FOLDER.corolario}/Corolario 1 - Proposicion 5.md` },
  { id: 'Corolario 1 - Proposicion 11', name: 'Corolario 1 - Proposición 11', type: 'corolario', val: 1, path: `${FOLDER.corolario}/Corolario 1 - Proposicion 11.md` },
  { id: 'Corolario 1 - Proposicion 28', name: 'Corolario 1 - Proposición 28', type: 'corolario', val: 1, path: `${FOLDER.corolario}/Corolario 1 - Proposicion 28.md` },
]
const escolios = [
  { id: 'Escolio 1 - Proposicion 4', name: 'Escolio 1 - Proposición 4', type: 'escolio', val: 1, path: `${FOLDER.escolio}/Escolio 1 - Proposicion 4.md` },
  { id: 'Escolio 1 - Proposicion 17', name: 'Escolio 1 - Proposición 17', type: 'escolio', val: 1, path: `${FOLDER.escolio}/Escolio 1 - Proposicion 17.md` },
  { id: 'Escolio 1 - Proposicion 33', name: 'Escolio 1 - Proposición 33', type: 'escolio', val: 1, path: `${FOLDER.escolio}/Escolio 1 - Proposicion 33.md` },
  { id: 'Escolio 1 - Proposicion 49', name: 'Escolio 1 - Proposición 49', type: 'escolio', val: 1, path: `${FOLDER.escolio}/Escolio 1 - Proposicion 49.md` },
]
const contentNodes = [...defs, ...axioms, ...props, ...demos, ...corolarios, ...escolios]
const nodes = [indice, ...contentNodes]
const indiceLinks = contentNodes.map((n) => ({ source: INDICE_ID, target: n.id, value: 1 }))
// Red de conexiones entre contenido (Def/Axioma → Proposición, Proposición → Proposición), al estilo Parte 1
const contentLinks = []
for (let i = 1; i <= 8; i++) {
  contentLinks.push({ source: `Definicion ${i}`, target: `Proposicion ${i}`, value: 1 })
  contentLinks.push({ source: `Definicion ${i}`, target: `Proposicion ${Math.min(i + 8, 67)}`, value: 1 })
  contentLinks.push({ source: `Definicion ${i}`, target: `Proposicion ${Math.min(i + 16, 67)}`, value: 1 })
}
contentLinks.push({ source: 'Axioma 1', target: 'Proposicion 1', value: 1 })
contentLinks.push({ source: 'Axioma 1', target: 'Proposicion 18', value: 1 })
contentLinks.push({ source: 'Axioma 1', target: 'Proposicion 35', value: 1 })
for (let i = 1; i < 67; i++) contentLinks.push({ source: `Proposicion ${i}`, target: `Proposicion ${i + 1}`, value: 1 })
for (let i = 1; i <= 60; i += 3) contentLinks.push({ source: `Proposicion ${i}`, target: `Proposicion ${Math.min(i + 5, 67)}`, value: 1 })
contentLinks.push({ source: 'Demostracion 1 - Proposicion 1', target: 'Proposicion 1', value: 1 })
contentLinks.push({ source: 'Demostracion 1 - Proposicion 18', target: 'Proposicion 18', value: 1 })
contentLinks.push({ source: 'Demostracion 1 - Proposicion 35', target: 'Proposicion 35', value: 1 })
contentLinks.push({ source: 'Demostracion 1 - Proposicion 50', target: 'Proposicion 50', value: 1 })
contentLinks.push({ source: 'Corolario 1 - Proposicion 5', target: 'Proposicion 5', value: 1 })
contentLinks.push({ source: 'Corolario 1 - Proposicion 11', target: 'Proposicion 11', value: 1 })
contentLinks.push({ source: 'Corolario 1 - Proposicion 28', target: 'Proposicion 28', value: 1 })
contentLinks.push({ source: 'Escolio 1 - Proposicion 4', target: 'Proposicion 4', value: 1 })
contentLinks.push({ source: 'Escolio 1 - Proposicion 17', target: 'Proposicion 17', value: 1 })
contentLinks.push({ source: 'Escolio 1 - Proposicion 33', target: 'Proposicion 33', value: 1 })
contentLinks.push({ source: 'Escolio 1 - Proposicion 49', target: 'Proposicion 49', value: 1 })
const links = [...contentLinks, ...indiceLinks]
const degree = {}
nodes.forEach((n) => { degree[n.id] = 0 })
links.forEach((l) => { degree[l.source] = (degree[l.source] || 0) + 1; degree[l.target] = (degree[l.target] || 0) + 1 })
nodes.forEach((n) => { n.val = Math.max(1, degree[n.id]) })
export default { nodes, links }
export { nodes, links }
