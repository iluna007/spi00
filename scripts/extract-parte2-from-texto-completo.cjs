/**
 * Extrae Parte 2 (De la naturaleza y origen del alma) de Texto completo.txt
 * y genera las 6 carpetas: Definiciones, Axiomas, Proposiciones, Demostraciones, Corolarios, Escolios.
 * Ejecutar: node scripts/extract-parte2-from-texto-completo.cjs
 */
const fs = require('fs');
const path = require('path');

const txtPath = path.join(__dirname, '../public/Texto completo/Texto completo.txt');
const outDir = path.join(__dirname, '../public/Obsidian/spi1/Parte 2');
const footer = '\n\n---\n*Spinoza, Ética demostrada según el orden geométrico. Traducción Vidal Peña.*';

const raw = fs.readFileSync(txtPath, 'utf8');
const startMark = 'PARTE SEGUNDA: De la naturaleza y';
const endMark = 'PARTE TERCERA: Del origen y';
const startIdx = raw.indexOf(startMark);
const endIdx = raw.indexOf(endMark, startIdx);
if (startIdx === -1 || endIdx === -1) throw new Error('Parte 2 boundaries not found');
const text = raw.slice(startIdx, endIdx);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
['Definiciones', 'Axiomas', 'Proposiciones', 'Demostraciones', 'Corolarios', 'Escolios'].forEach((d) => ensureDir(path.join(outDir, d)));

// --- Definiciones: buscar "Definiciones" y luego bloques I. — hasta VII. —
const defSectionStart = text.indexOf('\nDefiniciones ');
const axiSectionStart = text.indexOf('\nAxiomas ');
const propSectionStart = text.indexOf('\nProposiciones ');
const defBlock = text.slice(defSectionStart, axiSectionStart);
const axiomBlock = text.slice(axiSectionStart, propSectionStart);
const propBlock = text.slice(propSectionStart);

const defRegex = /\n([IVXLCDM]+)\.\s*—\s*/g;
const defParts = [];
let m;
let lastEnd = 0;
while ((m = defRegex.exec(defBlock)) !== null) {
  const num = m[1];
  if (['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].includes(num)) {
    if (defParts.length) defParts[defParts.length - 1].end = m.index;
    defParts.push({ num, start: m.index, end: defBlock.length });
  }
}
defParts.forEach((p, i) => {
  const body = defBlock.slice(p.start, p.end).replace(/^[IVXLCDM]+\.\s*—\s*/, '').trim();
  const clean = body.replace(/\n\n\d+\s*\n\n/g, '\n\n').trim();
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i];
  const out = path.join(outDir, 'Definiciones', `Definicion ${i + 1}.md`);
  fs.writeFileSync(out, `# Definición ${roman} — Parte 2 (De la naturaleza y origen del alma)\n#definicion\n\n${clean}${footer}`, 'utf8');
  console.log('Definicion', i + 1);
});

// --- Axiomas: I. — o Il. — hasta V. —
const axiomRegex = /\n(I{1,3}|IV|V|Il)\.\s*—\s*/g;
const axiomParts = [];
lastEnd = 0;
while ((m = axiomRegex.exec(axiomBlock)) !== null) {
  if (axiomParts.length) axiomParts[axiomParts.length - 1].end = m.index;
  axiomParts.push({ start: m.index, end: axiomBlock.length });
}
axiomParts.slice(0, 5).forEach((p, i) => {
  const body = axiomBlock.slice(p.start, axiomParts[i + 1] ? axiomParts[i + 1].start : axiomBlock.length);
  const clean = body.replace(/^(I{1,3}|IV|V|Il)\.\s*—\s*/m, '').replace(/\n\n\d+\s*\n\n/g, '\n\n').trim();
  const roman = ['I', 'II', 'III', 'IV', 'V'][i];
  const out = path.join(outDir, 'Axiomas', `Axioma ${i + 1}.md`);
  fs.writeFileSync(out, `# Axioma ${roman} — Parte 2\n#axioma\n\n${clean}${footer}`, 'utf8');
  console.log('Axioma', i + 1);
});

// --- Proposiciones: split por PROPOSICIÓN
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

const propRegex = /\nPROPOSICIÓN\s+([IVXLCDMil]+)\s*\n/g;
const propStarts = [];
while ((m = propRegex.exec(propBlock)) !== null) {
  propStarts.push({ pos: m.index + 1, roman: m[1].replace('l', 'I') });
}
let numProps = propStarts.length;
for (let i = 0; i < propStarts.length; i++) {
  const from = propStarts[i].pos;
  const to = propStarts[i + 1] ? propStarts[i + 1].pos : propBlock.length;
  let block = propBlock.slice(from, to).trim().replace(/\r\n/g, '\n');
  const blockLines = block.split('\n');
  // Encontrar dónde empieza la primera sección (Demostración/Corolario/Escolio)
  let sectionStartIdx = -1;
  for (let k = 0; k < blockLines.length; k++) {
    if (getSectionType(blockLines[k])) {
      sectionStartIdx = k;
      break;
    }
  }
  const statementLines = sectionStartIdx >= 0 ? blockLines.slice(0, sectionStartIdx) : blockLines;
  const statement = statementLines
    .join('\n')
    .replace(/^PROPOSICIÓN\s+[IVXLCDMil]+\s*\n/i, '')
    .trim();
  const rest = sectionStartIdx >= 0 ? blockLines.slice(sectionStartIdx).join('\n').trim() : '';

  const propNum = i + 1;
  const roman = propStarts[i].roman;
  const propPath = path.join(outDir, 'Proposiciones', `Proposicion ${propNum}.md`);
  fs.writeFileSync(propPath, `# Proposición ${roman} — Parte 2 (De la naturaleza y origen del alma)\n#proposicion\n\n${statement}\n\n${rest}${footer}`, 'utf8');
  console.log('Proposicion', propNum);

  // Extraer Demostración, Corolarios, Escolios desde rest (solo líneas de sección)
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
    const demPath = path.join(outDir, 'Demostraciones', `Demostracion 1 - Proposicion ${propNum}.md`);
    fs.writeFileSync(demPath, `# Demostración 1 — [[Proposicion ${propNum}]] (Parte 2)\n#demostracion\n\n${result.demostracion}${footer}`, 'utf8');
  }
  result.corolarios.forEach((body, k) => {
    const name = `Corolario ${k + 1} - Proposicion ${propNum}`;
    fs.writeFileSync(path.join(outDir, 'Corolarios', `${name}.md`), `# Corolario ${k + 1} — [[Proposicion ${propNum}]] (Parte 2)\n#corolario\n\n${body}${footer}`, 'utf8');
  });
  result.escolios.forEach((body, k) => {
    const name = `Escolio ${k + 1} - Proposicion ${propNum}`;
    fs.writeFileSync(path.join(outDir, 'Escolios', `${name}.md`), `# Escolio ${k + 1} — [[Proposicion ${propNum}]] (Parte 2)\n#escolio\n\n${body}${footer}`, 'utf8');
  });
}

console.log('Parte 2 extraída: Definiciones 7, Axiomas 5, Proposiciones', numProps);
console.log('Carpetas: Definiciones, Axiomas, Proposiciones, Demostraciones, Corolarios, Escolios.');
