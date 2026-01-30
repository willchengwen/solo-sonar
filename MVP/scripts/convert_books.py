#!/usr/bin/env python3
"""
将 Solo Sonar 书籍数据从 Excel 转换为 JSON 格式
"""

import pandas as pd
import json
from pathlib import Path
from typing import Dict, List

# 平台映射表
PLATFORM_MAPPING = {
    'SB': 'spacebattles',
    'SV': 'sufficient-velocity',
    'Author Site': 'personal-site',
    'FFN': 'personal-site',  # FanFiction.net 作为 personal-site 处理
    'AO3': 'ao3',
    'RR': 'royal-road',
}

# 状态映射表
STATUS_MAPPING = {
    'COMPLETED': 'completed',
    'ONGOING': 'ongoing',
    'HIATUS': 'hiatus',
    'DEAD': 'dropped',
}

# 常见标签到主题的映射
THEME_MAPPING = {
    'time loop': 'time-loop',
    'timeloop': 'time-loop',
    'progression': 'progression',
    'litrpg': 'litrpg',
    'rational': 'rational',
    'kingdom building': 'kingdom-building',
    'kingdom-builder': 'kingdom-building',
    'dungeon': 'dungeon-core',
    'dungeon core': 'dungeon-core',
    'slice of life': 'slice-of-life',
    'sci-fi': 'sci-fi',
    'scifi': 'sci-fi',
    'cultivation': 'cultivation',
    'isekai': 'isekai',
    'portal fantasy': 'portal-fantasy',
    'base building': 'base-building',
    'base-builder': 'base-building',
    'completed': 'completed',
}

def parse_tags(tags_str: str) -> List[str]:
    """解析标签字符串，返回主题列表"""
    if pd.isna(tags_str) or not tags_str:
        return []

    themes = []
    tags = str(tags_str).split(',')

    for tag in tags:
        tag_lower = tag.strip().lower()
        # 查找匹配的主题
        for key, value in THEME_MAPPING.items():
            if key in tag_lower or tag_lower in key:
                if value not in themes:
                    themes.append(value)

    return themes

def convert_to_novel(row: pd.Series) -> Dict:
    """将单行数据转换为 Novel 格式"""
    platform_raw = row['platform']
    platform = PLATFORM_MAPPING.get(platform_raw, 'personal-site')

    status_raw = row['status']
    status = STATUS_MAPPING.get(status_raw, 'ongoing')

    # 解析标签为主题
    themes = parse_tags(row.get('tags', ''))

    # 获取英文编辑语
    curator_note = str(row['curator_note_en']) if pd.notna(row.get('curator_note_en')) else None

    # 直接使用 Excel 中的 cover_url
    cover_image = str(row['cover_url']) if pd.notna(row.get('cover_url')) else None

    # 构建 Novel 对象
    novel = {
        "id": str(row['id']).lower().replace(' ', '-'),
        "title": str(row['title']),
        "author": str(row['author']),
        "synopsis": "",  # Excel 中没有此字段，留空
        "themes": themes,
        "links": [
            {
                "platform": platform,
                "url": str(row['url']),
                "isCanonical": True
            }
        ],
        "status": status,
        "stackCount": 0,
        "savedCount": 0
    }

    # 只添加有值的字段
    if cover_image:
        novel["coverImage"] = cover_image
    if curator_note:
        novel["curatorNote"] = curator_note

    return novel

def main():
    excel_path = "/Users/chengwen/Documents/Sonar files/SB+SV+Sites-books_final.xlsx"
    output_path = "/Users/chengwen/Projects/solo-sonar/data/books.json"

    print("📖 正在读取 Excel 文件...")
    df = pd.read_excel(excel_path)
    print(f"✓ 成功读取 {len(df)} 本书籍")

    # 读取现有的 books.json
    existing_books = {}
    try:
        with open(output_path, 'r', encoding='utf-8') as f:
            existing_books_list = json.load(f)
            # 创建 ID 到书籍的映射
            for book in existing_books_list:
                existing_books[book['id']] = book
        print(f"✓ 成功读取 {len(existing_books)} 本现有书籍")
    except FileNotFoundError:
        print("⚠️  未找到现有 books.json，将创建新文件")
        existing_books = {}

    print("\n🔄 正在转换并更新书籍...")
    updated_books = {}
    new_count = 0
    updated_count = 0

    for _, row in df.iterrows():
        excel_novel = convert_to_novel(row)
        book_id = excel_novel['id']

        if book_id in existing_books:
            # 更新现有书籍：只更新新字段，保留原有字段
            existing_book = existing_books[book_id]

            # 更新 coverImage（如果有）
            if 'coverImage' in excel_novel:
                existing_book['coverImage'] = excel_novel['coverImage']

            # 更新 curatorNote（如果有）
            if 'curatorNote' in excel_novel:
                existing_book['curatorNote'] = excel_novel['curatorNote']

            updated_books[book_id] = existing_book
            updated_count += 1
        else:
            # 新书籍：添加完整的 Excel 数据
            updated_books[book_id] = excel_novel
            new_count += 1

    # 添加 Excel 里没有的现有书籍
    for book_id, book in existing_books.items():
        if book_id not in updated_books:
            updated_books[book_id] = book

    # 转换为列表并排序
    novels = list(updated_books.values())
    novels.sort(key=lambda x: x['id'])

    print(f"✓ 新增书籍: {new_count} 本")
    print(f"✓ 更新书籍: {updated_count} 本")
    print(f"✓ 保留书籍: {len(existing_books) - updated_count} 本")
    print(f"✓ 总计: {len(novels)} 本")

    # 创建输出目录
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    # 保存 JSON
    print(f"\n💾 正在保存到 {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(novels, f, ensure_ascii=False, indent=2)

    print("✓ 转换完成！")

    # 打印一些统计信息
    print(f"\n📊 统计信息:")
    print(f"  总书籍数: {len(novels)}")
    platform_counts = {}
    status_counts = {}
    theme_counts = {}

    for novel in novels:
        # 统计平台
        for link in novel['links']:
            platform = link['platform']
            platform_counts[platform] = platform_counts.get(platform, 0) + 1

        # 统计状态
        status = novel['status']
        status_counts[status] = status_counts.get(status, 0) + 1

        # 统计主题
        for theme in novel['themes']:
            theme_counts[theme] = theme_counts.get(theme, 0) + 1

    print(f"\n  平台分布:")
    for platform, count in sorted(platform_counts.items()):
        print(f"    {platform}: {count}")

    print(f"\n  状态分布:")
    for status, count in sorted(status_counts.items()):
        print(f"    {status}: {count}")

    print(f"\n  主题分布 (Top 10):")
    for theme, count in sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"    {theme}: {count}")

if __name__ == "__main__":
    main()
