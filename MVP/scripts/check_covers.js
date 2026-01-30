const books = require('../data/books.json');
const withCover = books.filter(b => b.coverImage);
const withoutCover = books.filter(b => !b.coverImage);

console.log('有封面:', withCover.length, '/', books.length);
console.log('无封面:', withoutCover.length);

if (withoutCover.length > 0) {
  console.log('\n无封面的书:');
  withoutCover.forEach(b => console.log('  -', b.id, '-', b.title));
}

if (withCover.length === books.length) {
  console.log('\n✅ 所有书籍都有封面！');
}
