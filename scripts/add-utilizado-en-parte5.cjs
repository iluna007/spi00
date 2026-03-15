/**
 * Anade "## Utilizado en" en Axiomas 1 y 2 de Parte 5. Ejecutar: node scripts/add-utilizado-en-parte5.cjs
 */
const fs = require('fs');
const path = require('path');

const parte5Dir = path.join(__dirname, '../public/Obsidian/spi1/Parte 5');
const propDir = path.join(parte5Dir, 'Proposiciones');
const demDir = path.join(parte5Dir, 'Demostraciones');
const corDir = path.join(parte5Dir, 'Corolarios');
const escDir = path.join(parte5Dir, 'Escolios');
const axiDir = path.join(parte5Dir, 'Axiomas');

const usedByAxioma = { 1: new Set(), 2: new Set() };

function scanContent(content, propNum) {
  const axiMatches = content.matchAll(/\[\[Axioma\s+(\d+)\]\]/g);
  for (const m of axiMatches) {
    const a = parseInt(m[1], 10);
    if (a === 1 || a === 2) usedByAxioma[a].add(propNum);
  }
}

const propFiles = fs.readdirSync(propDir).filter(function (f) { return f.startsWith('Proposicion ') && f.endsWith('.md'); });
propFiles.forEach(function (file) {
  const propNum = parseInt(file.replace('Proposicion ', '').replace('.md', ''), 10);
  scanContent(fs.readFileSync(path.join(propDir, file), 'utf8'), propNum);
});
[
  [demDir, /Demostracion 1 - Proposicion (\d+)\.md/],
  [corDir, /Corolario \d+ - Proposicion (\d+)\.md/],
  [escDir, /Escolio \d+ - Proposicion (\d+)\.md/]
].forEach(function (pair) {
  const dir = pair[0];
  const re = pair[1];
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).filter(function (f) { return f.endsWith('.md'); }).forEach(function (file) {
    const m = file.match(re);
    if (m) scanContent(fs.readFileSync(path.join(dir, file), 'utf8'), parseInt(m[1], 10));
  });
});

function sectionUtilizadoEn(propNumbers) {
  const sorted = Array.from(propNumbers).sort(function (a, b) { return a - b; });
  return '\n\n## Utilizado en\n\n' + (sorted.length ? sorted.map(function (n) { return '[[Proposicion ' + n + ']]'; }).join(', ') : '_Ninguna proposicion de esta Parte lo cita explicitamente._') + '\n';
}

const parte5Link = '\nParte: [[Parte 5 - De la Libertad]]';
[1, 2].forEach(function (a) {
  const filePath = path.join(axiDir, 'Axioma ' + a + '.md');
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\n\n## Utilizado en\n\n[\s\S]*?(?=\nParte:|\n---\n|$)/, '');
  const insert = sectionUtilizadoEn(usedByAxioma[a]);
  if (content.includes('[[Parte 5 - De la Libertad]]')) {
    content = content.replace(parte5Link, insert + parte5Link);
  } else {
    content = content.replace(/\n---\n/, insert + '\n---\n');
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Axioma', a);
});
console.log('Done.');
