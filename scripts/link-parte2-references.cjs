/**
 * Añade en Part 2 los mismos tipos de conexiones que en Parte 1:
 * - Wikilinks en el texto: Definición N, Proposición N, Axioma N, Corolario de la Proposición N.
 * - Referencias a Parte 1 -> [[Parte 1 - De Dios]].
 * - En cada Proposición: título con [[Proposicion N]], sección "Contenido relacionado" y "Parte: [[Parte 2 - De la Mente]]".
 * - En el resto de .md: "Parte: [[Parte 2 - De la Mente]]" antes del footer.
 * Ejecutar: node scripts/link-parte2-references.cjs
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

const PARTE2_LINK = '\n\nParte: [[Parte 2 - De la Mente]]\n\n';
const FOOTER = '---\n*Spinoza, Ética demostrada según el orden geométrico. Traducción Vidal Peña.*';

function linkReferences(content) {
  let s = content;

  // Referencias a Parte 1 (antes de convertir "Proposición N" genérico)
  s = s.replace(/Proposición\s+(\d+)\s+de la Parte\s*1/gi, 'Proposición $1 de la [[Parte 1 - De Dios]]');
  s = s.replace(/Definición\s+(\d+)\s+de la Parte\s*1/gi, 'Definición $1 de la [[Parte 1 - De Dios]]');
  s = s.replace(/Corolario\s+de la Proposición\s+(\d+)\s+de la Parte\s*1/gi, 'Corolario de la Proposición $1 de la [[Parte 1 - De Dios]]');
  s = s.replace(/de la Parte\s*1\s*\)/gi, 'de la [[Parte 1 - De Dios]])');
  s = s.replace(/de la Parte\s*1\s*\]/gi, 'de la [[Parte 1 - De Dios]]]');
  s = s.replace(/\bParte\s*1\b(?!\s*-\s*De\s*Dios)(?!\]\])/gi, '[[Parte 1 - De Dios]]');

  // Corregir errata "Parte [" -> "Parte 1" y enlazar
  s = s.replace(/Parte\s*\[\s*\)/g, '[[Parte 1 - De Dios]])');
  s = s.replace(/Parte\s*\[\s*\]/g, '[[Parte 1 - De Dios]]]');

  // Definiciones N (no dentro de [[ ]])
  s = s.replace(/(?<!\[\[)Definición\s+(\d+)(?!\]\])/gi, '[[Definicion $1]]');
  // Proposición N (no dentro de [[ ]]) — números 1-48 para Parte 2
  s = s.replace(/(?<!\[\[)Proposición\s+(\d+)(?!\]\])/gi, '[[Proposicion $1]]');
  // Axioma N
  s = s.replace(/(?<!\[\[)Axioma\s+(\d+)(?!\]\])/gi, '[[Axioma $1]]');
  // Corolario [N] de la Proposición M
  s = s.replace(/Corolario\s*(\d*)\s*de la Proposición\s+(\d+)/gi, (_, num, n) =>
    num ? `Corolario ${num} de la [[Proposicion ${n}]]` : `Corolario de la [[Proposicion ${n}]]`
  );
  s = s.replace(/Escolio\s*(\d*)\s*de la Proposición\s+(\d+)/gi, (_, num, n) =>
    num ? `Escolio ${num} de la [[Proposicion ${n}]]` : `Escolio de la [[Proposicion ${n}]]`
  );

  // Limpiar dobles
  s = s.replace(/\[\[\[\[(Axioma|Definicion|Proposicion)\s+(\d+)\]\]\]\]/g, '[[$1 $2]]');

  return s;
}

function getRelatedFiles(propNum) {
  const links = [];
  if (fs.existsSync(path.join(demDir, `Demostracion 1 - Proposicion ${propNum}.md`)))
    links.push(`[[Demostracion 1 - Proposicion ${propNum}]]`);
  const corFiles = fs.readdirSync(corDir).filter((f) => f.startsWith(`Corolario `) && f.includes(` - Proposicion ${propNum}.md`));
  corFiles.sort().forEach((f) => {
    const name = f.replace('.md', '');
    links.push(`[[${name}]]`);
  });
  const escFiles = fs.readdirSync(escDir).filter((f) => f.startsWith(`Escolio `) && f.includes(` - Proposicion ${propNum}.md`));
  escFiles.sort().forEach((f) => {
    const name = f.replace('.md', '');
    links.push(`[[${name}]]`);
  });
  return links;
}

function ensureContenidoRelacionadoAndParte(content, propNum) {
  let s = content;
  const related = getRelatedFiles(propNum);
  const relacionadoBlock = related.length
    ? '\n\n## Contenido relacionado\n\n' + related.join(' · ') + '\n'
    : '';

  // Quitar sección "Contenido relacionado" existente si la hubiera
  s = s.replace(/\n\n## Contenido relacionado\n\n[\s\S]*?(?=\n---\n|$)/, '');

  // Añadir "Parte: [[Parte 2 - De la Mente]]" justo antes del ---
  if (!s.includes('[[Parte 2 - De la Mente]]')) {
    s = s.replace(/\n---\n/, PARTE2_LINK + relacionadoBlock + '\n---\n');
  } else {
    s = s.replace(/\n---\n/, relacionadoBlock + '\n---\n');
  }
  return s;
}

function ensureTitleProposicion(content, propNum) {
  let s = content;
  const wantedTitle = `# [[Proposicion ${propNum}]] — Parte 2 (De la naturaleza y origen del alma)`;
  if (s.startsWith('# Proposición ') || s.startsWith('# [[Proposicion ')) {
    s = s.replace(/^# .*\n/, wantedTitle + '\n');
  }
  return s;
}

// Proposiciones
const propFiles = fs.readdirSync(propDir).filter((f) => f.startsWith('Proposicion ') && f.endsWith('.md'));
for (const file of propFiles) {
  const propNum = parseInt(file.replace('Proposicion ', '').replace('.md', ''), 10);
  const filePath = path.join(propDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = ensureTitleProposicion(content, propNum);
  content = linkReferences(content);
  content = ensureContenidoRelacionadoAndParte(content, propNum);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Proposicion', propNum);
}

// Definiciones, Axiomas: solo enlaces en texto + Parte
for (const subdir of ['Definiciones', 'Axiomas', 'Demostraciones', 'Corolarios', 'Escolios']) {
  const dir = path.join(parte2Dir, subdir);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = linkReferences(content);
    if (!content.includes('[[Parte 2 - De la Mente]]')) {
      content = content.replace(/\n---\n/, PARTE2_LINK + '\n---\n');
      fs.writeFileSync(filePath, content, 'utf8');
    } else {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    console.log(subdir, file);
  }
}

console.log('Done. Parte 2 enlaces y conexión a Parte 2 - De la Mente aplicados.');
