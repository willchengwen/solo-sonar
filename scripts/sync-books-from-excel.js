#!/usr/bin/env node

/**
 * 同步脚本：从 Excel 表格自动更新 books.json
 *
 * 使用方法：
 *   node scripts/sync-books-from-excel.js
 *
 * 功能：
 *   1. 读取 Excel 表格（backup/Sonar_books_Final.xlsx）
 *   2. 提取书籍列表（跳过标题行和空行）
 *   3. 与现有 books.json 对比
 *   4. 生成更新后的 books.json
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 配置路径
const EXCEL_PATH = path.resolve(__dirname, '../backup/Sonar_books_Final.xlsx');
const BOOKS_JSON_PATH = path.resolve(__dirname, '../MVP/data/books.json');
const OUTPUT_PATH = path.resolve(__dirname, '../MVP/data/books.json');

// 备份目录
const BACKUP_DIR = path.resolve(__dirname, '../backup');

// 颜色配置
const COVER_STYLES = [
  { gradient: 'from-indigo-500 to-purple-600', icon: '📕' },
  { gradient: 'from-emerald-500 to-teal-600', icon: '📗' },
  { gradient: 'from-orange-500 to-red-600', icon: '📙' },
  { gradient: 'from-cyan-500 to-blue-600', icon: '📘' },
  { gradient: 'from-pink-500 to-rose-600', icon: '📓' },
  { gradient: 'from-amber-500 to-yellow-600', icon: '📒' },
  { gradient: 'from-violet-500 to-purple-600', icon: '📔' },
  { gradient: 'from-lime-500 to-green-600', icon: '📕' },
];

console.log('📚 开始同步书籍数据...\n');

// 安全获取字符串值的辅助函数
function safeTrim(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

// 创建备份
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupPath = path.join(BACKUP_DIR, `books-backup-${timestamp}.json`);

  try {
    fs.copyFileSync(BOOKS_JSON_PATH, backupPath);
    console.log(`💾 备份已创建: ${path.basename(backupPath)}`);
    return backupPath;
  } catch (error) {
    console.error('⚠️  备份失败:', error.message);
    return null;
  }
}

// 用户确认
function askConfirmation(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(`${message} (y/N): `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// 主同步函数
async function main() {

// 1. 读取 Excel 文件
console.log('📖 读取 Excel 表格...');
let workbook;
try {
  workbook = XLSX.readFile(EXCEL_PATH);
} catch (error) {
  console.error('❌ 无法读取 Excel 文件:', error.message);
  console.error('   路径:', EXCEL_PATH);
  process.exit(1);
}

const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log(`✅ Excel 文件读取成功，共 ${data.length} 行\n`);

// 2. 解析 Excel 数据
console.log('🔍 解析书籍数据...');
const excelBooks = [];

// Excel 结构：
// Row 0: 列名 (id, title, author, url, platform, coverUrl, status, chapters, words, synopsis, Rating, sonar_tags, EditorNoteEN, EditorNoteCN)
// Row 1: 说明行（跳过）
// Row 2+: 真实数据

for (let i = 2; i < data.length; i++) {
  const row = data[i];

  // 跳过空行、非数组行、或没有 ID 的行
  if (!row || !Array.isArray(row) || !row[0]) continue;

  const excelId = safeTrim(row[0]); // A列：ID
  const title = safeTrim(row[1]); // B列：书名
  const author = safeTrim(row[2]); // C列：作者
  const url = safeTrim(row[3]) || ''; // D列：链接
  const platformRaw = safeTrim(row[4]) || ''; // E列：平台
  const coverUrl = safeTrim(row[5]) || ''; // F列：封面URL
  const statusRaw = safeTrim(row[6]) || ''; // G列：状态
  const words = safeTrim(row[8]) || ''; // I列：字数
  const synopsis = safeTrim(row[9]) || ''; // J列：简介
  const tagsRaw = safeTrim(row[11]) || ''; // L列：标签（sonar_tags）
  const editorNote = safeTrim(row[12]) || ''; // M列：编者按（英文）
  const editorNoteCN = safeTrim(row[13]) || ''; // N列：编者按（中文）

  // 跳过没有书名的行
  if (!title) continue;

  // 使用 Excel 中的 ID，如果没有则从 title 生成
  const id = excelId || title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  // 解析状态
  let status = 'ongoing';
  if (statusRaw.toLowerCase().includes('completed')) {
    status = 'completed';
  } else if (statusRaw.toLowerCase().includes('hiatus')) {
    status = 'hiatus';
  } else if (statusRaw.toLowerCase().includes('dead')) {
    status = 'dead';
  }

  // 解析标签：用逗号分隔
  const themes = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

  // 解析链接
  const links = [];
  if (url) {
    // 处理多个链接（用 | 分隔）
    const urlParts = url.split('|').map(u => safeTrim(u));

    urlParts.forEach(singleUrl => {
      if (!singleUrl) return;

      let platform = 'personal-site';
      if (singleUrl.includes('spacebattles')) {
        platform = 'spacebattles';
      } else if (singleUrl.includes('sufficientvelocity')) {
        platform = 'sufficient-velocity';
      } else if (singleUrl.includes('royalroad')) {
        platform = 'royal-road';
      } else if (singleUrl.includes('fanfiction.net')) {
        platform = 'ffn';
      } else if (singleUrl.includes('archiveofourown')) {
        platform = 'ao3';
      } else if (singleUrl.includes('amazon')) {
        platform = 'amazon';
      }

      links.push({
        platform,
        url: singleUrl,
        isCanonical: links.length === 0 // 第一个链接是主链接
      });
    });
  }

  // 生成 platform 字符串（用于显示）
  const platformNames = {
    'royal-road': 'RR',
    'spacebattles': 'SB',
    'sufficient-velocity': 'SV',
    'amazon': 'AMZ',
    'personal-site': 'Site',
    'ffn': 'FFN',
    'ao3': 'AO3'
  };
  const platformDisplay = links.map(link => platformNames[link.platform] || 'Site').join(' · ');

  excelBooks.push({
    id,
    title,
    author,
    synopsis,
    curatorNote: editorNote,
    curatorNoteCN: editorNoteCN, // 添加中文编者按
    words,
    status,
    links,
    platform: platformDisplay, // 添加平台显示字段
    coverImage: coverUrl,
    themes, // 从 Excel 同步标签
    // 保留现有的 stackCount 和 savedCount（如果有）
    stackCount: 0,
    savedCount: 0,
  });
}

console.log(`✅ 解析到 ${excelBooks.length} 本书\n`);

// 3. 读取现有 books.json
console.log('📖 读取现有 books.json...');
let existingBooks = [];
try {
  const booksContent = fs.readFileSync(BOOKS_JSON_PATH, 'utf8');
  existingBooks = JSON.parse(booksContent);
  console.log(`✅ 现有 ${existingBooks.length} 本书\n`);
} catch (error) {
  console.log('⚠️  无法读取现有 books.json，将创建新文件');
}

// 4. 合并数据：只保留统计数据（stackCount、savedCount），其他从 Excel 覆盖
console.log('🔄 合并数据...');
const mergedBooks = excelBooks.map(excelBook => {
  const existing = existingBooks.find(b => b.id === excelBook.id);

  if (existing) {
    // 只保留统计数据，其他字段使用 Excel 的最新值
    return {
      ...excelBook,
      stackCount: existing.stackCount || 0,
      savedCount: existing.savedCount || 0,
    };
  } else {
    // 新书
    return {
      ...excelBook,
    };
  }
});

console.log(`✅ 合并完成，共 ${mergedBooks.length} 本书\n`);

// 5. 检查被删除的书籍
const deletedBooks = existingBooks.filter(
  existing => !excelBooks.find(excel => excel.id === existing.id)
);

if (deletedBooks.length > 0) {
  console.log(`🗑️  以下 ${deletedBooks.length} 本书将被删除：`);
  deletedBooks.forEach(book => {
    console.log(`   - ${book.title} (${book.id})`);
  });
  console.log('');
}

// 6. 检查新增的书籍
const newBooks = excelBooks.filter(
  excel => !existingBooks.find(existing => existing.id === excel.id)
);

if (newBooks.length > 0) {
  console.log(`➕ 以下 ${newBooks.length} 本书将被新增：`);
  newBooks.forEach(book => {
    console.log(`   - ${book.title} (${book.id})`);
  });
  console.log('');
}

// 7. 写入更新前的安全检查
if (deletedBooks.length > 0) {
  console.log('⚠️  检测到书籍将被删除！');
  const confirmed = await askConfirmation('是否继续同步？删除的书籍数据将从 books.json 中移除');
  if (!confirmed) {
    console.log('❌ 同步已取消');
    process.exit(0);
  }
}

// 8. 创建备份
console.log('\n💾 创建备份...');
createBackup();

// 9. 写入更新后的 books.json
console.log('💾 写入 books.json...');
const outputJson = JSON.stringify(mergedBooks, null, 2);
fs.writeFileSync(OUTPUT_PATH, outputJson, 'utf8');

console.log('✅ 同步完成！');
console.log(`\n📊 统计：`);
console.log(`   Excel 中的书籍：${excelBooks.length}`);
console.log(`   现有 books.json：${existingBooks.length}`);
console.log(`   更新后 books.json：${mergedBooks.length}`);
console.log(`   新增书籍：${newBooks.length}`);
console.log(`   删除书籍：${deletedBooks.length}`);
}

// 执行主函数
main().catch(error => {
  console.error('❌ 同步失败:', error.message);
  process.exit(1);
});
