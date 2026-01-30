#!/usr/bin/env python3
"""创建 ID 到图片文件名的映射"""

import pandas as pd
import os
import json

# 读取 Excel
excel_path = "/Users/chengwen/Documents/Sonar files/SB+SV+Sites-books_final.xlsx"
df = pd.read_excel(excel_path)

# 读取本地图片文件
covers_dir = "/Users/chengwen/Projects/solo-sonar/public/covers"
image_files = [f for f in os.listdir(covers_dir) if f.endswith('.png')]

# 创建映射
id_to_image = {}

for _, row in df.iterrows():
    book_id = str(row['id']).lower().replace(' ', '-')
    title = str(row['title']).lower()

    # 尝试多种匹配方式
    matched_image = None

    # 1. 精确匹配 ID
    exact_match = f"{book_id}.png"
    if exact_match in image_files:
        matched_image = exact_match

    # 2. 模糊匹配：文件名包含 ID，或处理序号问题
    if not matched_image:
        for img in image_files:
            img_name = img.lower().replace('.png', '')
            # 处理特殊情况：the-last-angel-2-ascension 匹配 the-last-angel-ascension
            img_normalized = img_name.replace('-2-', '-').replace('-3-', '-').replace('-1-', '-')
            if book_id in img_name or img_normalized == book_id or img_name in book_id:
                matched_image = img
                break

    # 3. 模糊匹配：文件名包含标题关键词
    if not matched_image:
        title_words = title.split()
        for img in image_files:
            img_name = img.lower().replace('.png', '')
            # 检查是否包含主要关键词
            if len(title_words) > 0:
                first_word = title_words[0]
                if first_word in img_name and len(first_word) > 3:
                    matched_image = img
                    break

    if matched_image:
        id_to_image[book_id] = f"/covers/{matched_image}"
        print(f"✓ {book_id} -> {matched_image}")
    else:
        print(f"✗ {book_id} ({row['title']}) - NO MATCH")
        id_to_image[book_id] = None

# 保存映射
output_path = "/Users/chengwen/Projects/solo-sonar/data/image_mapping.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(id_to_image, f, ensure_ascii=False, indent=2)

print(f"\n映射已保存到 {output_path}")
print(f"总计: {len(id_to_image)} 本书")
print(f"有图片: {sum(1 for v in id_to_image.values() if v)} 本")
print(f"无图片: {sum(1 for v in id_to_image.values() if not v)} 本")
