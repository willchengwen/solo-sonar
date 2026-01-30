const excelBooks = require('/Users/chengwen/Projects/solo-sonar/data/books.json');
const mvp = require('/Users/chengwen/Projects/solo-sonar/MVP/novels.json');
const fs = require('fs');

const excelIds = new Set(excelBooks.map(b => b.id));

// 找出只在 MVP 中的书
const onlyInMvp = mvp.novels.filter(b => !excelIds.has(b.id));

console.log('准备恢复的', onlyInMvp.length, '本书（Excel 表格里没有的）:\n');

onlyInMvp.forEach(b => {
  console.log('- ' + b.id);
  console.log('  标题: ' + b.title);
  console.log('  作者: ' + b.author);
  console.log('  封面: ' + (b.coverGradient || '无'));
  console.log('  主题: ' + b.themes.join(', '));
  console.log('  简介: ' + (b.synopsis ? b.synopsis.substring(0, 100) + '...' : '无'));
  console.log('');
});

// 合并到 books.json
const mergedBooks = [...excelBooks, ...onlyInMvp];
mergedBooks.sort((a, b) => a.id.localeCompare(b.id));

fs.writeFileSync('/Users/chengwen/Projects/solo-sonar/data/books.json', JSON.stringify(mergedBooks, null, 2));

console.log('\n✓ 已将', onlyInMvp.length, '本书添加到 books.json');
console.log('✓ 现在总书籍数:', mergedBooks.length);
