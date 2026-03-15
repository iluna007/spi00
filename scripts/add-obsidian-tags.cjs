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

const tagByPrefix = {
  Definicion: '#definicion',
  Axioma: '#axioma',
  Proposicion: '#proposicion',
};

for (const file of files) {
  const filePath = path.join(parte1Dir, file);
  const baseName = path.basename(file);
  let content = fs.readFileSync(filePath, 'utf8');

  let tag = null;
  if (baseName.startsWith('Definicion ')) tag = '#definicion';
  else if (baseName.startsWith('Axioma ')) tag = '#axioma';
  else if (baseName.startsWith('Proposicion ')) tag = '#proposicion';
  else if (baseName === 'Parte 1 - De Dios.md') tag = '#parte1 #indice';

  if (!tag) continue;
  if (content.includes(tag.trim().split(' ')[0])) {
    console.log('Skip (already has tag):', file.replace(/\\/g, '/'));
    continue;
  }

  const firstLineEnd = content.indexOf('\n');
  if (firstLineEnd === -1) {
    content = content + '\n' + tag + '\n';
  } else {
    content = content.slice(0, firstLineEnd + 1) + tag + '\n' + content.slice(firstLineEnd + 1);
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Tagged:', file.replace(/\\/g, '/'), '->', tag);
}
console.log('Done.');
