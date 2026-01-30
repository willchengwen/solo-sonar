#!/usr/bin/env python3
"""检查 Excel 文件的详细结构"""

import pandas as pd

excel_path = "/Users/chengwen/Documents/Sonar files/SB+SV+Sites-books_final.xlsx"
df = pd.read_excel(excel_path)

print("完整列名:")
for i, col in enumerate(df.columns):
    print(f"{i+1}. {col}")

print("\n" + "="*80)
print("第一行完整数据:")
print("="*80)
first_row = df.iloc[0]
for col in df.columns:
    value = first_row[col]
    print(f"\n{col}:")
    print(f"  {value}")

print("\n" + "="*80)
print("所有数据的平台列表:")
print("="*80)
print(df['platform'].value_counts())

print("\n" + "="*80)
print("所有数据的状态列表:")
print("="*80)
print(df['status'].value_counts())
