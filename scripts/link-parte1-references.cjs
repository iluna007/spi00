const fs = require('fs');
const path = require('path');

const parte1Dir = path.join(__dirname, '../public/Obsidian/spi1/Parte 1');

function getAllMdFiles(dir) {
  const result = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      fs.readdirSync(path.join(dir, item.name))
        .filter((f) => f.endsWith('.md'))
        .forEach((f) => result.push(path.join(item.name, f)));
    } else if (item.name.endsWith('.md')) result.push(item.name);
  }
  return result;
}

function linkReferences(content) {
  let s = content;

  // 1) Definiciones N y M
  s = s.replace(/Definiciones\s+(\d+)\s+y\s+(\d+)/gi, '[[Definicion $1]] y [[Definicion $2]]');
  s = s.replace(/Definiciones\s+(\d+),\s*(\d+)\s+y\s+(\d+)/gi, '[[Definicion $1]], [[Definicion $2]] y [[Definicion $3]]');

  // 2) Definición N  (no si ya está dentro de [[...]])
  s = s.replace(/(?<!\[\[)Definición\s+(\d+)(?!\]\])/gi, '[[Definicion $1]]');

  // 3) Proposiciones N y M
  s = s.replace(/Proposiciones\s+(\d+)\s+y\s+(\d+)/gi, '[[Proposicion $1]] y [[Proposicion $2]]');

  // 4) Corolario [N] de la Proposición M
  s = s.replace(/Corolario\s*(\d*)\s*de la Proposición\s+(\d+)/gi, (_, num, n) =>
    num ? `Corolario ${num} de la [[Proposicion ${n}]]` : `Corolario de la [[Proposicion ${n}]]`
  );

  // 5) Escolio [N] de la Proposición M
  s = s.replace(/Escolio\s*(\d*)\s*de la Proposición\s+(\d+)/gi, (_, num, n) =>
    num ? `Escolio ${num} de la [[Proposicion ${n}]]` : `Escolio de la [[Proposicion ${n}]]`
  );

  // 6) Proposición N
  s = s.replace(/(?<!\[\[)Proposición\s+(\d+)(?!\]\])/gi, '[[Proposicion $1]]');

  // 7) Axioma N
  s = s.replace(/\bAxioma\s*,\s*(\d+)/gi, 'Axioma, [[Axioma $1]]');
  s = s.replace(/(?<!\[\[)Axioma\s+(\d+)(?!\]\])/gi, '[[Axioma $1]]');

  // Limpiar dobles enlaces por si acaso
  s = s.replace(/\[\[\[\[(Axioma|Definicion|Proposicion)\s+(\d+)\]\]\]\]/g, '[[$1 $2]]');

  return s;
}

const files = getAllMdFiles(parte1Dir);
let count = 0;
for (const file of files) {
  const filePath = path.join(parte1Dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const newContent = linkReferences(content);
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    count++;
    console.log('Updated:', file.replace(/\\/g, '/'));
  }
}
console.log('Done. Files updated:', count);
