const fs = require('fs');
const path = require('path');

const txtPath = path.join(__dirname, '../public/Texto completo/Texto completo.txt');
const outDir = path.join(__dirname, '../Obsidian/Parte 1');
const text = fs.readFileSync(txtPath, 'utf8');

// Parte 1: desde "PROPOSICIÓN I" hasta "Apéndice" (antes de PARTE SEGUNDA)
const startMarker = 'PROPOSICIÓN I ';
const endMarker = 'Apéndice ';
const startIdx = text.indexOf(startMarker);
const endIdx = text.indexOf(endMarker, startIdx);
if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found', { startIdx, endIdx });
  process.exit(1);
}
const parte1 = text.slice(startIdx, endIdx);

// Find each proposition by "PROPOSICIÓN ROMAN_NUM" at line start (avoid "Proposición 25" in body)
const positions = [0];
// [IVXLCDM]+ matches Roman numerals; "Il" is typo for II in source
const regex = /(?:^|\n)PROPOSICIÓN\s+[IVXLCDMil]+\s*\n/g;
let m;
while ((m = regex.exec(parte1)) !== null) {
  const pos = m[0].startsWith('\n') ? m.index + 1 : m.index;
  if (pos > positions[positions.length - 1]) positions.push(pos);
}
positions.push(parte1.length);
const numBlocks = Math.min(36, positions.length - 1);
const blocks = [];
for (let i = 0; i < numBlocks; i++) {
  blocks.push(parte1.slice(positions[i], positions[i + 1]).trim());
}

for (let i = 0; i < blocks.length; i++) {
  const num = i + 1;
  let content = blocks[i].trim();
  // First line is the Roman numeral (I, Il, III, ...); remove it for body
  content = content.replace(/^PROPOSICIÓN\s+[IVXLCDMil]+\s*\n*/i, '');
  content = content.replace(/\n\n\d+\s*\n\n/g, '\n\n');
  const title = `# Proposición ${num} — Parte 1 (De Dios)\n\n`;
  const footer = '\n\n---\n*Spinoza, Ética demostrada según el orden geométrico. Traducción Vidal Peña.*';
  const full = title + content.trim() + footer;
  const outPath = path.join(outDir, `Proposicion ${num}.md`);
  fs.writeFileSync(outPath, full, 'utf8');
  console.log('Written', outPath);
}
console.log('Done. Propositions:', blocks.length);
