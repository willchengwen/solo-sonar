const currentBooks = require('/Users/chengwen/Projects/solo-sonar/data/books.json');
const fixedBooks = require('/Users/chengwen/Downloads/books_fixed.json');
const fs = require('fs');

// 创建 fixedBooks 的 ID 映射
const fixedBooksMap = {};
fixedBooks.forEach(book => {
  fixedBooksMap[book.id] = book.coverUrl;
});

console.log('📖 准备更新书籍封面 URL...\n');

let updatedCount = 0;
let notFoundCount = 0;

// 更新 currentBooks 中的封面 URL
currentBooks.forEach(book => {
  if (fixedBooksMap[book.id]) {
    book.coverImage = fixedBooksMap[book.id];
    updatedCount++;
    console.log(`✓ 更新: ${book.id} - ${book.title}`);
  }
});

console.log(`\n✓ 成功更新 ${updatedCount} 本书的封面 URL`);
console.log(`✗ 未找到匹配: ${notFoundCount} 本`);

// 保存更新后的数据
fs.writeFileSync(
  '/Users/chengwen/Projects/solo-sonar/data/books.json',
  JSON.stringify(currentBooks, null, 2)
);

console.log('\n✓ 已保存到 data/books.json');

// 验证更新
console.log('\n📊 更新后统计:');
const withCover = currentBooks.filter(b => b.coverImage).length;
console.log(`有封面图片: ${withCover}/${currentBooks.length}`);

// 显示几个示例
console.log('\n示例更新:');
currentBooks.slice(0, 5).forEach(book => {
  if (book.coverImage) {
    console.log(`\n${book.title}:`);
    console.log(`  ${book.coverImage.substring(0, 80)}...`);
  }
});
