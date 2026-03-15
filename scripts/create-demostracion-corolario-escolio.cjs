const fs = require('fs');
const path = require('path');

const parte1Dir = path.join(__dirname, '../public/Obsidian/spi1/Parte 1');
const propDir = path.join(parte1Dir, 'Proposiciones');
const demDir = path.join(parte1Dir, 'Demostraciones');
const corDir = path.join(parte1Dir, 'Corolarios');
const escDir = path.join(parte1Dir, 'Escolios');
const footer = '\n\n---\n*Spinoza, Ética demostrada según el orden geométrico. Traducción Vidal Peña.*';

function getSectionType(line) {
  const t = line.trim();
  if (/^Demostración\s*:/.test(t)) return 'demostracion';
  if (/^De otra manera\s*:/.test(t)) return 'de_otra_manera';
  if (/^Corolario\s*:\s*/.test(t)) return 'corolario';
  if (/^Corolario\s+(?:I{1,3}|IV|V|VI{0,3}|\d+)\s*[\.:]/.test(t)) return 'corolario';
  if (/^Escolio\s+\d+\s*:/.test(t)) return 'escolio';
  if (/^Escolio\s+(?:I|II)\s*[\.:]/.test(t)) return 'escolio';
  if (/^Escolio\s*[;:]?\s*[A-Z]/.test(t)) return 'escolio';
  return null;
}

function extractSections(content) {
  const lines = content.split('\n');
  const result = { demostracion: null, corolarios: [], escolios: [] };
  let current = null;
  let currentLines = [];
  let corIndex = 0;
  let escIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('---')) break;
    const type = getSectionType(line);
    if (type) {
      if (current) {
        const text = currentLines.join('\n').trim();
        if (current === 'demostracion' || current === 'de_otra_manera') {
          if (!result.demostracion) result.demostracion = text;
          else result.demostracion += '\n\n---\n\n' + text.replace(/^De otra manera\s*:\s*/i, '').trim();
        } else if (current === 'corolario') result.corolarios.push(text);
        else if (current === 'escolio') result.escolios.push(text);
      }
      current = type;
      currentLines = [line];
      continue;
    }
    if (current) currentLines.push(line);
  }
  if (current) {
    const text = currentLines.join('\n').trim();
    if (current === 'demostracion' || current === 'de_otra_manera') {
      if (!result.demostracion) result.demostracion = text;
      else result.demostracion += '\n\n---\n\n' + text.replace(/^De otra manera\s*:\s*/i, '').trim();
    } else if (current === 'corolario') result.corolarios.push(text);
    else if (current === 'escolio') result.escolios.push(text);
  }
  return result;
}

const propFiles = fs.readdirSync(propDir)
  .filter((f) => f.startsWith('Proposicion ') && f.endsWith('.md'))
  .sort((a, b) => parseInt(a.replace(/\D/g, ''), 10) - parseInt(b.replace(/\D/g, ''), 10));

for (const file of propFiles) {
  const propNum = parseInt(file.replace('Proposicion ', '').replace('.md', ''), 10);
  const content = fs.readFileSync(path.join(propDir, file), 'utf8');
  const sec = extractSections(content);

  if (sec.demostracion) {
    const outPath = path.join(demDir, `Demostracion 1 - Proposicion ${propNum}.md`);
    const body = `# Demostración 1 — [[Proposicion ${propNum}]] (Parte 1)\n#demostracion\n\n${sec.demostracion}${footer}`;
    fs.writeFileSync(outPath, body, 'utf8');
    console.log('Created: Demostracion 1 - Proposicion', propNum);
  }

  sec.corolarios.forEach((body, i) => {
    const k = ` ${i + 1}`;
    const name = `Corolario${k} - Proposicion ${propNum}`;
    const outPath = path.join(corDir, `${name}.md`);
    const full = `# Corolario${k} — [[Proposicion ${propNum}]] (Parte 1)\n#corolario\n\n${body}${footer}`;
    fs.writeFileSync(outPath, full, 'utf8');
    console.log('Created:', name + '.md');
  });

  sec.escolios.forEach((body, i) => {
    const k = ` ${i + 1}`;
    const name = `Escolio${k} - Proposicion ${propNum}`;
    const outPath = path.join(escDir, `${name}.md`);
    const full = `# Escolio${k} — [[Proposicion ${propNum}]] (Parte 1)\n#escolio\n\n${body}${footer}`;
    fs.writeFileSync(outPath, full, 'utf8');
    console.log('Created:', name + '.md');
  });
}

console.log('\nAdding "Contenido relacionado" in Proposicion files...');
for (const file of propFiles) {
  const propNum = parseInt(file.replace('Proposicion ', '').replace('.md', ''), 10);
  const filePath = path.join(propDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('## Contenido relacionado')) continue;
  const links = [];
  if (fs.existsSync(path.join(demDir, `Demostracion 1 - Proposicion ${propNum}.md`))) links.push(`[[Demostracion 1 - Proposicion ${propNum}]]`);
  fs.readdirSync(corDir).filter((f) => f.startsWith('Corolario') && f.includes(`Proposicion ${propNum}.md`)).forEach((f) => links.push('[[' + f.replace('.md', '') + ']]'));
  fs.readdirSync(escDir).filter((f) => f.startsWith('Escolio') && f.includes(`Proposicion ${propNum}.md`)).forEach((f) => links.push('[[' + f.replace('.md', '') + ']]'));
  if (links.length === 0) continue;
  const section = '\n\n## Contenido relacionado\n\n' + links.join(' · ') + '\n';
  content = content.replace(/\n---\n\s*\*Spinoza/, section + '\n---\n\n*Spinoza');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', file);
}
console.log('Done.');
