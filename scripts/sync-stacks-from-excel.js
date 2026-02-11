#!/usr/bin/env node

/**
 * 同步脚本：从 Excel 表格自动更新 stacks.json
 *
 * 使用方法：
 *   node scripts/sync-stacks-from-excel.js
 *
 * 功能：
 *   1. 读取 Excel 表格（backup/Sonar_books_Final.xlsx）的 Stacks 工作表
 *   2. 提取书单列表
 *   3. 生成完整的 stacks.json（合并现有统计数据）
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 配置路径
const EXCEL_PATH = path.resolve(__dirname, '../backup/Sonar_books_Final.xlsx');
const STACKS_JSON_PATH = path.resolve(__dirname, '../MVP/src/data/stacks.json');
const OUTPUT_PATH = path.resolve(__dirname, '../MVP/src/data/stacks.json');

// 策展人配置
const CURATORS = {
  'Zorian': { id: 'zorian', dot: 'linear-gradient(135deg,#5a9eae,#3e7e92)' },
  'ForumDelver': { id: 'forumdelver', dot: 'linear-gradient(135deg,#ae6a8a,#924e6e)' },
  'BingeWatcher': { id: 'bingewatcher', dot: 'linear-gradient(135deg,#7a6aae,#5e4e92)' },
  'ArchitectFan': { id: 'architectfan', dot: 'linear-gradient(135deg,#6a9e8a,#4e7e6e)' },
};

// 平台标签映射
const PLATFORM_LABELS = {
  'royal-road': 'RR',
  'spacebattles': 'SB',
  'sufficient-velocity': 'SV',
  'amazon': 'AMZ',
  'personal-site': 'Site',
};

console.log('📚 开始同步书单数据...\n');

// 安全获取字符串值的辅助函数
function safeTrim(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

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

const stacksSheet = workbook.Sheets['Stacks'];
if (!stacksSheet) {
  console.error('❌ Excel 中没有找到 Stacks 工作表');
  process.exit(1);
}

const data = XLSX.utils.sheet_to_json(stacksSheet, { header: 1, defval: '' });

console.log(`✅ Excel 文件读取成功，共 ${data.length} 行\n`);

// 2. 解析 Excel 数据
console.log('🔍 解析书单数据...');
const excelStacks = [];

// Excel 结构：
// Row 0: 列名 (id, title, subtitle, curator, bookIds, highlights)
// Row 1: 说明行（跳过）
// Row 2+: 真实数据

for (let i = 2; i < data.length; i++) {
  const row = data[i];

  // 跳过空行、非数组行、或没有 ID 的行
  if (!row || !Array.isArray(row) || !row[0]) continue;

  const id = safeTrim(row[0]); // A列：ID
  const title = safeTrim(row[1]); // B列：书单标题
  const subtitle = safeTrim(row[2]); // C列：副标题
  const curatorName = safeTrim(row[3]); // D列：策展人名字
  const bookIds = safeTrim(row[4]) || ''; // E列：包含的书籍ID
  const highlights = safeTrim(row[5]) || ''; // F列：亮点标签
  const curatorNote = safeTrim(row[6]) || ''; // G列：编辑推荐语（英文）
  const curatorNoteCN = safeTrim(row[7]) || ''; // H列：编辑推荐语（中文）

  // 跳过没有书单标题的行
  if (!title) continue;

  // 解析书籍ID列表
  const entries = bookIds.split(',').map(id => id.trim()).filter(Boolean).map((novelId, index) => ({
    novelId,
    curatorNote: '', // 可以从Excel扩展
    addedAt: new Date().toISOString().split('T')[0],
    order: index + 1
  }));

  // 解析亮点标签
  const themes = highlights.split(',').map(t => t.trim()).filter(Boolean);

  // 获取策展人信息
  const curator = CURATORS[curatorName] || { id: curatorName.toLowerCase().replace(/\s+/g, ''), dot: 'linear-gradient(135deg,#6a7fc4,#4e5ea0)' };

  // 生成封面标题（从title提取关键词）
  const words = title.split(' ').filter(w => w.length > 3);
  const coverTitle = words.slice(0, 2).join('\n');

  excelStacks.push({
    id,
    title,
    coverTitle,
    description: subtitle,
    curatorId: curator.id,
    curatorNote, // 从 Excel 同步
    curatorNoteCN, // 添加中文编者按
    entries,
    themes,
    platforms: ['royal-road', 'spacebattles', 'sufficient-velocity'], // 默认值
    coverGradient: 'from-blue-50/80 via-blue-50/40 to-slate-50', // 默认值
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    savedCount: 0,
    viewCount: 0,
    isEditorPick: true,
    isFeatured: true
  });
}

console.log(`✅ 解析到 ${excelStacks.length} 个书单\n`);

// 3. 读取现有 stacks.json
console.log('📖 读取现有 stacks.json...');
let existingData = { stacks: [] };
try {
  const stacksContent = fs.readFileSync(STACKS_JSON_PATH, 'utf8');
  existingData = JSON.parse(stacksContent);
  console.log(`✅ 现有 ${existingData.stacks.length} 个书单\n`);
} catch (error) {
  console.log('⚠️  无法读取现有 stacks.json，将创建新文件');
}

// 4. 合并数据：保留现有书单的统计数据
console.log('🔄 合并数据...');
const mergedStacks = excelStacks.map(excelStack => {
  const existing = existingData.stacks.find(s => s.id === excelStack.id);

  if (existing) {
    // 更新现有书单，保留统计数据
    return {
      ...excelStack,
      savedCount: existing.savedCount || 0,
      viewCount: existing.viewCount || 0,
      createdAt: existing.createdAt || excelStack.createdAt,
    };
  } else {
    // 新书单
    return excelStack;
  }
});

// 5. 检查被删除的书单（保留在Excel中没有的，但有统计数据的）
const deletedStacks = existingData.stacks.filter(
  existing => !excelStacks.find(excel => excel.id === existing.id) && existing.savedCount > 0
);

if (deletedStacks.length > 0) {
  console.log(`⚠️  以下 ${deletedStacks.length} 个书单在Excel中不存在，但保留在输出中：`);
  deletedStacks.forEach(stack => {
    console.log(`   - ${stack.title} (${stack.id})`);
  });
  // 保留有统计数据的老书单
  deletedStacks.forEach(stack => {
    mergedStacks.push(stack);
  });
  console.log('');
}

// 6. 检查新增的书单
const newStacks = excelStacks.filter(
  excel => !existingData.stacks.find(existing => existing.id === excel.id)
);

if (newStacks.length > 0) {
  console.log(`➕ 以下 ${newStacks.length} 个书单将被新增：`);
  newStacks.forEach(stack => {
    console.log(`   - ${stack.title} (${stack.id})`);
  });
  console.log('');
}

// 7. 写入更新后的 stacks.json
console.log('💾 写入 stacks.json...');
const outputData = { stacks: mergedStacks };
const outputJson = JSON.stringify(outputData, null, 2);
fs.writeFileSync(OUTPUT_PATH, outputJson, 'utf8');

console.log('✅ 同步完成！');
console.log(`\n📊 统计：`);
console.log(`   Excel 中的书单：${excelStacks.length}`);
console.log(`   现有 stacks.json：${existingData.stacks.length}`);
console.log(`   更新后 stacks.json：${mergedStacks.length}`);
console.log(`   新增书单：${newStacks.length}`);
console.log(`   保留的老书单：${deletedStacks.length}`);
