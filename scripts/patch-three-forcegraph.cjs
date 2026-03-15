/**
 * Parche para three-forcegraph: evita el error "Cannot read properties of undefined (reading 'tick')"
 * cuando el bucle de animación arranca antes de que el layout (d3) esté inicializado.
 */
const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '../node_modules/three-forcegraph/dist/three-forcegraph.mjs')
const guard = "        if (!state.layout) return; // guard: layout not ready yet (race with React mount)\n        "

if (!fs.existsSync(file)) {
  console.warn('patch-three-forcegraph: no existe', file)
  process.exit(0)
}

let code = fs.readFileSync(file, 'utf8')
if (code.includes('if (!state.layout) return;')) {
  console.log('patch-three-forcegraph: parche ya aplicado')
  process.exit(0)
}

const target = "      function layoutTick() {\n        if (++state.cntTicks"
if (!code.includes(target)) {
  console.warn('patch-three-forcegraph: no se encontró el punto de inserción (¿versión distinta?)')
  process.exit(1)
}

code = code.replace(
  "      function layoutTick() {\n        if (++state.cntTicks",
  "      function layoutTick() {\n        if (!state.layout) return;\n        if (++state.cntTicks"
)
fs.writeFileSync(file, code)
console.log('patch-three-forcegraph: parche aplicado correctamente')
