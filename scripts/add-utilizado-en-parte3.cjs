/**
 * Añade "## Utilizado en" en Definiciones y Axiomas de Parte 3.
 * Ejecutar: node scripts/add-utilizado-en-parte3.cjs
 */
const fs = require('fs');
const path = require('path');

const parte3Dir = path.join(__dirname, '../public/Obsidian/spi1/Parte 3');
const propDir = path.join(parte3Dir, 'Proposiciones');
const demDir = path.join(parte3Dir, 'Demostraciones');
const corDir = path.join(parte3Dir, 'Corolarios');
const escDir = path.join(parte3Dir, 'Escolios');
const defDir = path.join(parte3Dir, 'Definiciones');
const axiDir = path.join(parte3Dir, 'Axiomas');

const usedByDefinicion = { 1: new Set(), 2: new Set(), 3: new Set() };
const usedByAxioma = { 1: new Set(), 2: new Set() };

function scanContent(content, propNum) {
  const defMatches = content.matchAll(/\[\[Definicion\s+(\d+)\]\]/g);
  const axiMatches = content.matchAll(/\[\[Axioma\s+(\d+)\]\]/g);
  for (const m of defMatches) {
    const d = parseInt(m[1], 10);
    if (d >= 1 && d <= 3) usedByDefinicion[d].add(propNum);
  }
  for (const m of axiMatches) {
    const a = parseInt(m[1], 10);
    if (a >= 1 && a <= 2) usedByAxioma[a].add(propNum);
  }
}

const propFiles = fs.readdirSync(propDir).filter((f) => f.startsWith('Proposicion ') && f.endsWith('.md'));
for (const file of propFiles) {
  const propNum = parseInt(file.replace('Proposicion ', '').replace('.md', ''), 10);
  scanContent(fs.readFileSync(path.join(propDir, file), 'utf8'), propNum);
}
[[demDir, /Demostracion 1 - Proposicion (\d+)\.md/], [corDir, /Corolario \d+ - Proposicion (\d+)\.md/], [escDir, /Escolio \d+ - Proposicion (\d+)\.md/]].forEach(([dir, re]) => {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).filter((f) => f.endsWith('.md')).forEach((file) => {
    const m = file.match(re);
    if (m) scanContent(fs.readFileSync(path.join(dir, file), 'utf8'), parseInt(m[1], 10));
  });
});

function sectionUtilizadoEn(propNumbers) {
  const sorted = [...propNumbers].sort((a, b) => a - b);
  return '\n\n## Utilizado en\n\n' + (sorted.length ? sorted.map((n) => '[[Proposicion ' + n + ']]').join(', ') : '_Ninguna proposición de esta Parte lo cita explícitamente._') + '\n';
}

const parte3Link = '\nParte: [[Parte 3 - De los Afectos]]';
for (let d = 1; d <= 3; d++) {
  const filePath = path.join(defDir, 'Definicion ' + d + '.md');
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\n\n## Utilizado en\n\n[\s\S]*?(?=\nParte:|\n---\n|$)/, '');
  const insert = sectionUtilizadoEn(usedByDefinicion[d]);
  if (content.includes('[[Parte 3 - De los Afectos]]')) {
    content = content.replace(parte3Link, insert + parte3Link);
  } else {
    content = content.replace(/\n---\n/, insert + '\n---\n');
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Definicion', d);
}

for (let a = 1; a <= 2; a++) {
  const filePath = path.join(axiDir, 'Axioma ' + a + '.md');
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\n\n## Utilizado en\n\n[\s\S]*?(?=\nParte:|\n---\n|$)/, '');
  const insert = sectionUtilizadoEn(usedByAxioma[a]);
  if (content.includes('[[Parte 3 - De los Afectos]]')) {
    content = content.replace(parte3Link, insert + parte3Link);
  } else {
    content = content.replace(/\n---\n/, insert + '\n---\n');
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Axioma', a);
}

console.log('Done.');
