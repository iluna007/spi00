/**
 * Conecta todos los .md de Parte 3 con el índice y entre sí (como Parte 1 y 2).
 * - Wikilinks: Definición N, Proposición N, Axioma N, Corolario/Escolio de la Proposición N.
 * - Referencias Parte 1 -> [[Parte 1 - De Dios]], Parte 2 -> [[Parte 2 - De la Mente]].
 * - En cada nota: "Parte: [[Parte 3 - De los Afectos]]". En Proposiciones: título [[Proposicion N]] y Contenido relacionado.
 * Ejecutar: node scripts/link-parte3-references.cjs
 */
const fs = require('fs');
const path = require('path');

const parte3Dir = path.join(__dirname, '../public/Obsidian/spi1/Parte 3');
const propDir = path.join(parte3Dir, 'Proposiciones');
const demDir = path.join(parte3Dir, 'Demostraciones');
const corDir = path.join(parte3Dir, 'Corolarios');
const escDir = path.join(parte3Dir, 'Escolios');
const subtitle = 'Del origen y naturaleza de los afectos';
const PARTE3_LINK = '\n\nParte: [[Parte 3 - De los Afectos]]\n\n';

function linkReferences(content) {
  let s = content;
  s = s.replace(/Proposición\s+(\d+)\s+de la Parte\s*II/gi, 'Proposición $1 de la [[Parte 2 - De la Mente]]');
  s = s.replace(/Proposición\s+(\d+)\s+de la Parte\s*2/gi, 'Proposición $1 de la [[Parte 2 - De la Mente]]');
  s = s.replace(/Definición\s+(\d+)\s+de la Parte\s*II/gi, 'Definición $1 de la [[Parte 2 - De la Mente]]');
  s = s.replace(/Postulado\s+(\d+)\s+de la Parte\s*II/gi, 'Postulado $1 de la [[Parte 2 - De la Mente]]');
  s = s.replace(/Escolio\s+de la Proposición\s+(\d+)\s+de la Parte\s*II/gi, 'Escolio de la Proposición $1 de la [[Parte 2 - De la Mente]]');
  s = s.replace(/de la Parte\s*II\s*\)/gi, 'de la [[Parte 2 - De la Mente]])');
  s = s.replace(/\bParte\s*II\b(?!\s*-\s*De\s*la\s*Mente)(?!\]\])/gi, '[[Parte 2 - De la Mente]]');
  s = s.replace(/\bParte\s*2\b(?!\s*-\s*De\s*la\s*Mente)(?!\]\])/gi, '[[Parte 2 - De la Mente]]');
  s = s.replace(/Proposición\s+(\d+)\s+de la Parte\s*1/gi, 'Proposición $1 de la [[Parte 1 - De Dios]]');
  s = s.replace(/Proposición\s+(\d+)\s+de la Parte\s*I[^I]/gi, 'Proposición $1 de la [[Parte 1 - De Dios]]');
  s = s.replace(/Definición\s+(\d+)\s+de la Parte\s*1/gi, 'Definición $1 de la [[Parte 1 - De Dios]]');
  s = s.replace(/Corolario\s+de la Proposición\s+(\d+)\s+de la Parte\s*1/gi, 'Corolario de la Proposición $1 de la [[Parte 1 - De Dios]]');
  s = s.replace(/de la Parte\s*1\s*\)/gi, 'de la [[Parte 1 - De Dios]])');
  s = s.replace(/\bParte\s*1\b(?!\s*-\s*De\s*Dios)(?!\]\])/gi, '[[Parte 1 - De Dios]]');
  s = s.replace(/Parte\s*I1["\?]/g, '[[Parte 1 - De Dios]]');
  s = s.replace(/Parte\s*I\]/g, '[[Parte 1 - De Dios]]');
  s = s.replace(/Parte\s*ID\)/g, '[[Parte 1 - De Dios]])');
  s = s.replace(/(?<!\[\[)Definición\s+(\d+)(?!\]\])/gi, '[[Definicion $1]]');
  s = s.replace(/(?<!\[\[)Proposición\s+(\d+)(?!\]\])/gi, '[[Proposicion $1]]');
  s = s.replace(/(?<!\[\[)Axioma\s+(\d+)(?!\]\])/gi, '[[Axioma $1]]');
  s = s.replace(/Corolario\s*(\d*)\s*de la Proposición\s+(\d+)/gi, (_, num, n) =>
    num ? 'Corolario ' + num + ' de la [[Proposicion ' + n + ']]' : 'Corolario de la [[Proposicion ' + n + ']]'
  );
  s = s.replace(/Escolio\s*(\d*)\s*de la Proposición\s+(\d+)/gi, (_, num, n) =>
    num ? 'Escolio ' + num + ' de la [[Proposicion ' + n + ']]' : 'Escolio de la [[Proposicion ' + n + ']]'
  );
  s = s.replace(/\[\[\[\[(Axioma|Definicion|Proposicion)\s+(\d+)\]\]\]\]/g, '[[$1 $2]]');
  return s;
}

function getRelatedFiles(propNum) {
  const links = [];
  if (fs.existsSync(path.join(demDir, 'Demostracion 1 - Proposicion ' + propNum + '.md')))
    links.push('[[Demostracion 1 - Proposicion ' + propNum + ']]');
  if (fs.existsSync(corDir)) {
    fs.readdirSync(corDir).filter(function (f) { return f.indexOf(' - Proposicion ' + propNum + '.md') >= 0; }).sort().forEach(function (f) {
      links.push('[[' + f.replace('.md', '') + ']]');
    });
  }
  if (fs.existsSync(escDir)) {
    fs.readdirSync(escDir).filter(function (f) { return f.indexOf(' - Proposicion ' + propNum + '.md') >= 0; }).sort().forEach(function (f) {
      links.push('[[' + f.replace('.md', '') + ']]');
    });
  }
  return links;
}

function ensureContenidoRelacionadoAndParte(content, propNum) {
  let s = content;
  const related = getRelatedFiles(propNum);
  const relacionadoBlock = related.length ? '\n\n## Contenido relacionado\n\n' + related.join(' · ') + '\n' : '';
  s = s.replace(/\n\n## Contenido relacionado\n\n[\s\S]*?(?=\n---\n|$)/, '');
  if (s.indexOf('[[Parte 3 - De los Afectos]]') === -1) {
    s = s.replace(/\n---\n/, PARTE3_LINK + relacionadoBlock + '\n---\n');
  } else {
    s = s.replace(/\n---\n/, relacionadoBlock + '\n---\n');
  }
  return s;
}

function ensureTitleProposicion(content, propNum) {
  let s = content;
  const wantedTitle = '# [[Proposicion ' + propNum + ']] — Parte 3 (' + subtitle + ')';
  if (s.startsWith('# Proposición ') || s.startsWith('# [[Proposicion ')) {
    s = s.replace(/^# .*\n/, wantedTitle + '\n');
  }
  return s;
}

const propFiles = fs.readdirSync(propDir).filter(function (f) { return f.startsWith('Proposicion ') && f.endsWith('.md'); });
propFiles.forEach(function (file) {
  const propNum = parseInt(file.replace('Proposicion ', '').replace('.md', ''), 10);
  const filePath = path.join(propDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = ensureTitleProposicion(content, propNum);
  content = linkReferences(content);
  content = ensureContenidoRelacionadoAndParte(content, propNum);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Proposicion', propNum);
});

['Definiciones', 'Axiomas', 'Demostraciones', 'Corolarios', 'Escolios'].forEach(function (subdir) {
  const dir = path.join(parte3Dir, subdir);
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).filter(function (f) { return f.endsWith('.md'); }).forEach(function (file) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = linkReferences(content);
    if (content.indexOf('[[Parte 3 - De los Afectos]]') === -1) {
      content = content.replace(/\n---\n/, PARTE3_LINK + '\n---\n');
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(subdir, file);
  });
});

console.log('Done. Parte 3 conectada a Parte 3 - De los Afectos y enlaces aplicados.');
