/**
 * Extrae Parte 4 (De la servidumbre humana, o de la fuerza de los afectos) de Texto completo.txt
 * y genera las 6 carpetas: Definiciones, Axiomas, Proposiciones, Demostraciones, Corolarios, Escolios.
 * Parte 4: 8 Definiciones, 1 Axioma, Proposiciones hasta PARTE QUINTA.
 * Ejecutar: node scripts/extract-parte4-from-texto-completo.cjs
 */
const fs = require('fs');
const path = require('path');

const txtPath = path.join(__dirname, '../public/Texto completo/Texto completo.txt');
const outDir = path.join(__dirname, '../public/Obsidian/spi1/Parte 4');
const subtitle = 'De la servidumbre humana, o de la fuerza de los afectos';
const footer = '\n\n---\n*Spinoza, Ética demostrada según el orden geométrico. Traducción Vidal Peña.*';

const raw = fs.readFileSync(txtPath, 'utf8');
const startMark = 'PARTE CUARTA: De la servidumbre';
const endMark = 'PARTE QUINTA: Del poder del';
const startIdx = raw.indexOf(startMark);
const endIdx = raw.indexOf(endMark, startIdx);
if (startIdx === -1 || endIdx === -1) throw new Error('Parte 4 boundaries not found');
const text = raw.slice(startIdx, endIdx);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
['Definiciones', 'Axiomas', 'Proposiciones', 'Demostraciones', 'Corolarios', 'Escolios'].forEach((d) => ensureDir(path.join(outDir, d)));

const defSectionStart = text.indexOf('\nDefiniciones ');
const axiomSectionStart = text.indexOf('\nAxioma ');
const propSectionStart = text.indexOf('\nProposiciones ');
const defBlock = text.slice(defSectionStart, axiomSectionStart);
const axiomBlock = text.slice(axiomSectionStart, propSectionStart);
const propBlock = text.slice(propSectionStart);

// Definiciones: I, II, III, IV, V, VI, VII, VIII (en el texto hay II y VII duplicados, tomamos los 8 bloques)
const defRoman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
const defRegex = /\n([IVXLCDM]+)\.\s*—\s*/g;
const defParts = [];
let m;
while ((m = defRegex.exec(defBlock)) !== null) {
  if (defParts.length) defParts[defParts.length - 1].end = m.index;
  defParts.push({ start: m.index, end: defBlock.length });
}
defParts.slice(0, 8).forEach((p, i) => {
  const body = defBlock.slice(p.start, defParts[i + 1] ? defParts[i + 1].start : defBlock.length).replace(/^[IVXLCDM]+\.\s*—\s*/, '').trim();
  const clean = body.replace(/\n\n\d+\s*\n\n/g, '\n\n').trim();
  const roman = defRoman[i];
  const out = path.join(outDir, 'Definiciones', `Definicion ${i + 1}.md`);
  fs.writeFileSync(out, `# Definición ${roman} — Parte 4 (${subtitle})\n#definicion\n\n${clean}${footer}`, 'utf8');
  console.log('Definicion', i + 1);
});

// Axioma: un solo bloque (sin "I. —")
const axiomClean = axiomBlock.replace(/^Axioma\s*\n+/i, '').replace(/\n\n\d+\s*\n\n/g, '\n\n').trim();
fs.writeFileSync(path.join(outDir, 'Axiomas', 'Axioma 1.md'), `# Axioma I — Parte 4 (${subtitle})\n#axioma\n\n${axiomClean}${footer}`, 'utf8');
console.log('Axioma', 1);

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
  let sectionStartIdx = -1;
  for (let k = 0; k < blockLines.length; k++) {
    if (getSectionType(blockLines[k])) {
      sectionStartIdx = k;
      break;
    }
  }
  const statementLines = sectionStartIdx >= 0 ? blockLines.slice(0, sectionStartIdx) : blockLines;
  const statement = statementLines.join('\n').replace(/^PROPOSICIÓN\s+[IVXLCDMil]+\s*\n/i, '').trim();
  const rest = sectionStartIdx >= 0 ? blockLines.slice(sectionStartIdx).join('\n').trim() : '';

  const propNum = i + 1;
  const roman = propStarts[i].roman;
  const propPath = path.join(outDir, 'Proposiciones', `Proposicion ${propNum}.md`);
  fs.writeFileSync(propPath, `# Proposición ${roman} — Parte 4 (${subtitle})\n#proposicion\n\n${statement}\n\n${rest}${footer}`, 'utf8');
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
    fs.writeFileSync(path.join(outDir, 'Demostraciones', `Demostracion 1 - Proposicion ${propNum}.md`), `# Demostración 1 — [[Proposicion ${propNum}]] (Parte 4)\n#demostracion\n\n${result.demostracion}${footer}`, 'utf8');
  }
  result.corolarios.forEach((body, k) => {
    const name = `Corolario ${k + 1} - Proposicion ${propNum}`;
    fs.writeFileSync(path.join(outDir, 'Corolarios', `${name}.md`), `# Corolario ${k + 1} — [[Proposicion ${propNum}]] (Parte 4)\n#corolario\n\n${body}${footer}`, 'utf8');
  });
  result.escolios.forEach((body, k) => {
    const name = `Escolio ${k + 1} - Proposicion ${propNum}`;
    fs.writeFileSync(path.join(outDir, 'Escolios', `${name}.md`), `# Escolio ${k + 1} — [[Proposicion ${propNum}]] (Parte 4)\n#escolio\n\n${body}${footer}`, 'utf8');
  });
}

console.log('Parte 4 extraída: Definiciones 8, Axiomas 1, Proposiciones', numProps);
