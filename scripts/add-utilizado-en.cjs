const fs = require('fs');
const path = require('path');

const parte1Dir = path.join(__dirname, '../public/Obsidian/spi1/Parte 1');
const propDir = path.join(parte1Dir, 'Proposiciones');
const defDir = path.join(parte1Dir, 'Definiciones');
const axiDir = path.join(parte1Dir, 'Axiomas');

const usedByDefinicion = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set(), 6: new Set(), 7: new Set(), 8: new Set() };
const usedByAxioma = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set(), 6: new Set(), 7: new Set() };

const propFiles = fs.readdirSync(propDir).filter((f) => f.startsWith('Proposicion ') && f.endsWith('.md'));

for (const file of propFiles) {
  const n = parseInt(file.replace('Proposicion ', '').replace('.md', ''), 10);
  const content = fs.readFileSync(path.join(propDir, file), 'utf8');
  const defMatches = content.matchAll(/\[\[Definicion\s+(\d+)\]\]/g);
  const axiMatches = content.matchAll(/\[\[Axioma\s+(\d+)\]\]/g);
  for (const m of defMatches) usedByDefinicion[parseInt(m[1], 10)].add(n);
  for (const m of axiMatches) usedByAxioma[parseInt(m[1], 10)].add(n);
}

function sectionUtilizadoEn(propNumbers) {
  const sorted = [...propNumbers].sort((a, b) => a - b);
  const links = sorted.length
    ? sorted.map((n) => `[[Proposicion ${n}]]`).join(', ')
    : '_Ninguna proposición de esta Parte lo cita explícitamente._';
  return '\n\n## Utilizado en\n\n' + links + '\n';
}

for (let d = 1; d <= 8; d++) {
  const filePath = path.join(defDir, `Definicion ${d}.md`);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\n\n## Utilizado en\n\n[\s\S]*?(?=\n---\n|$)/, '');
  const insert = sectionUtilizadoEn(usedByDefinicion[d]);
  content = content.replace(/\n---\n/, insert + '\n---\n');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Definicion', d, '->', [...usedByDefinicion[d]].sort((a,b)=>a-b).join(', '));
}

for (let a = 1; a <= 7; a++) {
  const filePath = path.join(axiDir, `Axioma ${a}.md`);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\n\n## Utilizado en\n\n[\s\S]*?(?=\n---\n|$)/, '');
  const insert = sectionUtilizadoEn(usedByAxioma[a]);
  content = content.replace(/\n---\n/, insert + '\n---\n');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Axioma', a, '->', [...usedByAxioma[a]].sort((a,b)=>a-b).join(', '));
}

console.log('Done.');
