/**
 * Extrae Parte 5 (Del poder del entendimiento o de la libertad humana) de Texto completo.txt
 * y genera Axiomas (2), Proposiciones (42), Demostraciones, Corolarios, Escolios.
 * Parte 5 no tiene Definiciones. Fin del extracto: antes de "BARUCH SPINOZA".
 * Ejecutar: node scripts/extract-parte5-from-texto-completo.cjs
 */
const fs = require('fs');
const path = require('path');

const txtPath = path.join(__dirname, '../public/Texto completo/Texto completo.txt');
const outDir = path.join(__dirname, '../public/Obsidian/spi1/Parte 5');
const subtitle = 'Del poder del entendimiento o de la libertad humana';
const footer = '\n\n---\n*Spinoza, Ética demostrada según el orden geométrico. Traducción Vidal Peña.*';

const raw = fs.readFileSync(txtPath, 'utf8');
const startMark = 'PARTE QUINTA: Del poder del';
const endMark = 'BARUCH SPINOZA';
const startIdx = raw.indexOf(startMark);
const endIdx = raw.indexOf(endMark, startIdx);
if (startIdx === -1 || endIdx === -1) throw new Error('Parte 5 boundaries not found');
const text = raw.slice(startIdx, endIdx);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
['Axiomas', 'Proposiciones', 'Demostraciones', 'Corolarios', 'Escolios'].forEach(function (d) {
  ensureDir(path.join(outDir, d));
});

const axiomSectionStart = text.indexOf('\nAxiomas ');
const propSectionStart = text.indexOf('\nProposiciones ');
const axiomBlock = text.slice(axiomSectionStart, propSectionStart);
let propBlock = text.slice(propSectionStart).replace(/\r\n/g, '\n');

// Axiomas I y II (Parte 5 tiene 2)
const axiomIEnd = axiomBlock.indexOf('\n\nII. —');
let axiom1Body = axiomBlock.replace(/^[^\n]*\n+Axiomas\s*\n+/i, '').trim();
if (axiomIEnd > 0) axiom1Body = axiomBlock.slice(0, axiomIEnd).replace(/^[^\n]*\n+Axiomas\s*\n+/i, '').trim();
axiom1Body = axiom1Body.replace(/^I\.\s*—\s*/, '').trim();
const axiom1Clean = axiom1Body.replace(/\n\n\d+\s*\n\n/g, '\n\n').trim();
fs.writeFileSync(path.join(outDir, 'Axiomas', 'Axioma 1.md'), '# Axioma I — Parte 5 (' + subtitle + ')\n#axioma\n\n' + axiom1Clean + footer, 'utf8');
console.log('Axioma', 1);

const axiom2Start = axiomBlock.indexOf('II. —');
const axiom2Block = axiomBlock.slice(axiom2Start);
const axiom2End = axiom2Block.indexOf('\n\nProposiciones ');
const axiom2Body = (axiom2End > 0 ? axiom2Block.slice(0, axiom2End) : axiom2Block).replace(/^II\.\s*—\s*/, '').trim();
const axiom2Clean = axiom2Body.replace(/\n\n\d+\s*\n\n/g, '\n\n').trim();
fs.writeFileSync(path.join(outDir, 'Axiomas', 'Axioma 2.md'), '# Axioma II — Parte 5 (' + subtitle + ')\n#axioma\n\n' + axiom2Clean + footer, 'utf8');
console.log('Axioma', 2);

function getSectionType(line) {
  const t = line.trim().replace(/\r$/, '');
  if (/^Demostraci[oó]n\s*:/.test(t)) return 'demostracion';
  if (/^De otra manera\s*:/.test(t)) return 'de_otra_manera';
  if (/^Corolario\s*:\s*/.test(t)) return 'corolario';
  if (/^Corolario\s+(?:I{1,3}|IV|V|VI{0,3}|\d+)\s*[\.:]/.test(t)) return 'corolario';
  if (/^Escolio\s*:/.test(t)) return 'escolio';
  if (/^Escolio\s+(?:I|II)\s*[\.:]/.test(t)) return 'escolio';
  if (/^Escolio\s*[;:]?\s*[A-Z]/.test(t)) return 'escolio';
  return null;
}

const propRegex = /\nPROPOSICIÓN\s+([IVXLCDMilH]+)\s*\n/g;
const propStarts = [];
let m;
while ((m = propRegex.exec(propBlock)) !== null) {
  const roman = m[1].replace(/l/g, 'I').replace(/H/g, 'I');
  propStarts.push({ pos: m.index + 1, roman: roman });
}
const numProps = propStarts.length;
for (let i = 0; i < propStarts.length; i++) {
  const from = propStarts[i].pos;
  const to = propStarts[i + 1] ? propStarts[i + 1].pos : propBlock.length;
  let block = propBlock.slice(from, to).trim().replace(/\r\n/g, '\n');
  const blockLines = block.split('\n');
  let sectionStartIdx = -1;
  for (let k = 0; k < blockLines.length; k++) {
    if (getSectionType(blockLines[k])) {
      sectionStartIdx = k;
      break;
    }
  }
  const statementLines = sectionStartIdx >= 0 ? blockLines.slice(0, sectionStartIdx) : blockLines;
  const statement = statementLines.join('\n').replace(/^PROPOSICIÓN\s+[IVXLCDMilH]+\s*\n/i, '').trim();
  const rest = sectionStartIdx >= 0 ? blockLines.slice(sectionStartIdx).join('\n').trim() : '';

  const propNum = i + 1;
  const roman = propStarts[i].roman;
  const propPath = path.join(outDir, 'Proposiciones', 'Proposicion ' + propNum + '.md');
  fs.writeFileSync(propPath, '# [[Proposicion ' + propNum + ']] — Parte 5 (' + subtitle + ')\n#proposicion\n\n' + statement + '\n\n' + rest + footer, 'utf8');
  console.log('Proposicion', propNum);

  const restLines = rest.split(/\r?\n/);
  const result = { demostracion: null, corolarios: [], escolios: [] };
  let current = null;
  let currentLines = [];
  for (let j = 0; j < restLines.length; j++) {
    const type = getSectionType(restLines[j]);
    if (type) {
      if (current) {
        const txt = currentLines.join('\n').trim();
        if (current === 'demostracion' || current === 'de_otra_manera') {
          if (!result.demostracion) result.demostracion = txt;
          else result.demostracion += '\n\n---\n\n' + txt.replace(/^De otra manera\s*:\s*/i, '').trim();
        } else if (current === 'corolario') result.corolarios.push(txt);
        else if (current === 'escolio') result.escolios.push(txt);
      }
      current = type;
      currentLines = [restLines[j]];
      continue;
    }
    if (current) currentLines.push(restLines[j]);
  }
  if (current) {
    const txt = currentLines.join('\n').trim();
    if (current === 'demostracion' || current === 'de_otra_manera') {
      if (!result.demostracion) result.demostracion = txt;
      else result.demostracion += '\n\n---\n\n' + txt.replace(/^De otra manera\s*:\s*/i, '').trim();
    } else if (current === 'corolario') result.corolarios.push(txt);
    else if (current === 'escolio') result.escolios.push(txt);
  }

  if (result.demostracion) {
    fs.writeFileSync(path.join(outDir, 'Demostraciones', 'Demostracion 1 - Proposicion ' + propNum + '.md'), '# Demostración 1 — [[Proposicion ' + propNum + ']] (Parte 5)\n#demostracion\n\n' + result.demostracion + footer, 'utf8');
  }
  result.corolarios.forEach(function (body, k) {
    const name = 'Corolario ' + (k + 1) + ' - Proposicion ' + propNum;
    fs.writeFileSync(path.join(outDir, 'Corolarios', name + '.md'), '# Corolario ' + (k + 1) + ' — [[Proposicion ' + propNum + ']] (Parte 5)\n#corolario\n\n' + body + footer, 'utf8');
  });
  result.escolios.forEach(function (body, k) {
    const name = 'Escolio ' + (k + 1) + ' - Proposicion ' + propNum;
    fs.writeFileSync(path.join(outDir, 'Escolios', name + '.md'), '# Escolio ' + (k + 1) + ' — [[Proposicion ' + propNum + ']] (Parte 5)\n#escolio\n\n' + body + footer, 'utf8');
  });
}

console.log('Parte 5 extraida: Axiomas 2, Proposiciones', numProps);
