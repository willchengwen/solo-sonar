#!/usr/bin/env python3
"""读取 Excel 文件并转换为 JSON 格式"""

import pandas as pd
import json
import sys
from pathlib import Path

def read_excel(excel_path: str) -> pd.DataFrame:
    """读取 Excel 文件"""
    try:
        df = pd.read_excel(excel_path)
        print(f"成功读取 Excel 文件，共 {len(df)} 行数据")
        print(f"\n列名: {list(df.columns)}")
        print(f"\n前几行数据:")
        print(df.head())
        return df
    except Exception as e:
        print(f"读取 Excel 文件失败: {e}")
        sys.exit(1)

def convert_to_novel_format(df: pd.DataFrame) -> list:
    """将 DataFrame 转换为 Novel 格式"""
    novels = []

    for _, row in df.iterrows():
        # 这里需要根据实际的 Excel 列名进行调整
        novel = {
            "id": str(row.get('id', '')).lower().replace(' ', '-'),
            "title": str(row.get('title', '')),
            "author": str(row.get('author', '')),
            "synopsis": str(row.get('synopsis', '')),
            "themes": [],  # 需要从 Excel 中解析
            "links": [],   # 需要从 Excel 中解析
            "status": "ongoing",  # 默认值
            "stackCount": 0,
            "savedCount": 0
        }
        novels.append(novel)

    return novels

def save_json(data: list, output_path: str):
    """保存为 JSON 文件"""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\n已保存到 {output_path}")

if __name__ == "__main__":
    excel_path = "/Users/chengwen/Documents/Sonar files/SB+SV+Sites-books_final.xlsx"
    output_path = "/Users/chengwen/Projects/solo-sonar/data/books.json"

    print("正在读取 Excel 文件...")
    df = read_excel(excel_path)

    print("\n正在转换为 JSON 格式...")
    novels = convert_to_novel_format(df)

    print("\n正在保存 JSON 文件...")
    save_json(novels, output_path)
