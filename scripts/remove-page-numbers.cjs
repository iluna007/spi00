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

const files = getAllMdFiles(parte1Dir);

// Quitar bloques que son solo un número de página (y las líneas en blanco alrededor)
// \n\n  58  \n\n  -> \n\n
const pageNumBlock = /\n\s*\n\s*\d+\s*\n\s*\n/g;

let total = 0;
for (const file of files) {
  const filePath = path.join(parte1Dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;
  content = content.replace(pageNumBlock, '\n\n');
  // Por si queda una sola línea con número: \n58\n
  content = content.replace(/\n\s*\d+\s*\n/g, '\n');
  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf8');
    total++;
    console.log('Updated:', file.replace(/\\/g, '/'));
  }
}
console.log('Done. Files updated:', total);
