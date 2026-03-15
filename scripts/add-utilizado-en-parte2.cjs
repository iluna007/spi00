/**
 * Añade la sección "## Utilizado en" en cada Definición y Axioma de Parte 2,
 * listando las Proposiciones (y Demostraciones/Corolarios/Escolios) que los citan.
 * Ejecutar: node scripts/add-utilizado-en-parte2.cjs
 */
const fs = require('fs');
const path = require('path');

const parte2Dir = path.join(__dirname, '../public/Obsidian/spi1/Parte 2');
const propDir = path.join(parte2Dir, 'Proposiciones');
const demDir = path.join(parte2Dir, 'Demostraciones');
const corDir = path.join(parte2Dir, 'Corolarios');
const escDir = path.join(parte2Dir, 'Escolios');
const defDir = path.join(parte2Dir, 'Definiciones');
const axiDir = path.join(parte2Dir, 'Axiomas');

const usedByDefinicion = {};
const usedByAxioma = {};
for (let i = 1; i <= 7; i++) usedByDefinicion[i] = new Set();
for (let i = 1; i <= 5; i++) usedByAxioma[i] = new Set();

function scanContent(content, propNum) {
  const defMatches = content.matchAll(/\[\[Definicion\s+(\d+)\]\]/g);
  const axiMatches = content.matchAll(/\[\[Axioma\s+(\d+)\]\]/g);
  for (const m of defMatches) {
    const d = parseInt(m[1], 10);
    if (d >= 1 && d <= 7) usedByDefinicion[d].add(propNum);
  }
  for (const m of axiMatches) {
    const a = parseInt(m[1], 10);
    if (a >= 1 && a <= 5) usedByAxioma[a].add(propNum);
  }
}

// Proposiciones
const propFiles = fs.readdirSync(propDir).filter((f) => f.startsWith('Proposicion ') && f.endsWith('.md'));
for (const file of propFiles) {
  const propNum = parseInt(file.replace('Proposicion ', '').replace('.md', ''), 10);
  const content = fs.readFileSync(path.join(propDir, file), 'utf8');
  scanContent(content, propNum);
}

// Demostraciones, Corolarios, Escolios (cada uno pertenece a una Proposicion N)
for (const [dir, namePattern] of [
  [demDir, /Demostracion 1 - Proposicion (\d+)\.md/],
  [corDir, /Corolario \d+ - Proposicion (\d+)\.md/],
  [escDir, /Escolio \d+ - Proposicion (\d+)\.md/],
]) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const m = file.match(namePattern);
    if (!m) continue;
    const propNum = parseInt(m[1], 10);
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    scanContent(content, propNum);
  }
}

function sectionUtilizadoEn(propNumbers) {
  const sorted = [...propNumbers].sort((a, b) => a - b);
  const links = sorted.length
    ? sorted.map((n) => `[[Proposicion ${n}]]`).join(', ')
    : '_Ninguna proposición de esta Parte lo cita explícitamente._';
  return '\n\n## Utilizado en\n\n' + links + '\n';
}

for (let d = 1; d <= 7; d++) {
  const filePath = path.join(defDir, `Definicion ${d}.md`);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\n\n## Utilizado en\n\n[\s\S]*?(?=\nParte:|\n---\n|$)/, '');
  const insert = sectionUtilizadoEn(usedByDefinicion[d]);
  content = content.replace(/\nParte: \[\[Parte 2 - De la Mente\]\]/, insert + '\nParte: [[Parte 2 - De la Mente]]');
  if (!content.includes('## Utilizado en')) {
    content = content.replace(/\n---\n/, insert + '\n---\n');
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Definicion', d, '->', [...usedByDefinicion[d]].sort((a, b) => a - b).join(', '));
}

for (let a = 1; a <= 5; a++) {
  const filePath = path.join(axiDir, `Axioma ${a}.md`);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\n\n## Utilizado en\n\n[\s\S]*?(?=\nParte:|\n---\n|$)/, '');
  const insert = sectionUtilizadoEn(usedByAxioma[a]);
  content = content.replace(/\nParte: \[\[Parte 2 - De la Mente\]\]/, insert + '\nParte: [[Parte 2 - De la Mente]]');
  if (!content.includes('## Utilizado en')) {
    content = content.replace(/\n---\n/, insert + '\n---\n');
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Axioma', a, '->', [...usedByAxioma[a]].sort((a, b) => a - b).join(', '));
}

console.log('Done.');
