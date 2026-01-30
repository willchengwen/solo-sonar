#!/usr/bin/env python3
"""
重新抓取缺失的评分数据
只处理那些 platformRating 为空的书
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import re
import json

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive'
}


def get_book_rating(url, title):
    """获取单本书的评分"""
    try:
        # 增加超时时间和重试
        for attempt in range(3):
            try:
                response = requests.get(url, headers=HEADERS, timeout=30)
                response.raise_for_status()
                soup = BeautifulSoup(response.content, 'html.parser')

                rating = None

                # 方法1: 从 meta 标签提取
                meta_rating = soup.find('meta', property='books:rating:value')
                if meta_rating and meta_rating.get('content'):
                    rating = float(meta_rating['content'])

                # 方法2: 从 JSON-LD 提取
                if not rating:
                    json_ld = soup.find('script', type='application/ld+json')
                    if json_ld:
                        try:
                            data = json.loads(json_ld.string)
                            if 'aggregateRating' in data:
                                rating = float(data['aggregateRating']['ratingValue'])
                        except:
                            pass

                # 方法3: 从 HTML 文本中查找
                if not rating:
                    pattern = r'books:rating:value"\s+content="(\d+\.\d+)"'
                    match = re.search(pattern, str(soup))
                    if match:
                        rating = float(match.group(1))

                return {
                    'url': url,
                    'title': title,
                    'rating': rating,
                    'success': True
                }

            except requests.exceptions.RequestException as e:
                if attempt < 2:
                    # 失败后等待更长时间
                    wait_time = (attempt + 1) * 10
                    print(f"      ⚠️ 连接失败，等待 {wait_time} 秒后重试...")
                    time.sleep(wait_time)
                else:
                    raise

    except Exception as e:
        return {
            'url': url,
            'title': title,
            'rating': None,
            'success': False,
            'error': str(e)
        }


def main():
    """主函数"""
    print("=" * 80)
    print("🔄 重新抓取缺失的评分数据")
    print("=" * 80)

    # 读取数据
    input_file = '/Users/chengwen/Projects/solo-sonar/scripts/rr_best_rated.xlsx'
    print(f"\n📂 读取文件: {input_file}")

    df = pd.read_excel(input_file)
    print(f"✅ 读取成功，共 {len(df)} 本书")

    # 检查哪些书没有评分
    if 'platformRating' not in df.columns:
        print("⚠️ 未找到 platformRating 列，所有书都需要抓取")
        missing_ratings = df
    else:
        missing_ratings = df[df['platformRating'].isna()]
        print(f"📊 有评分的书: {df['platformRating'].notna().sum()} 本")
        print(f"📊 缺失评分的书: {len(missing_ratings)} 本")

    if len(missing_ratings) == 0:
        print("\n✅ 所有书都已有评分，无需重新抓取")
        return

    print(f"\n🚀 开始重新抓取 {len(missing_ratings)} 本书的评分...")
    print(f"⏱ 预计完成时间: {len(missing_ratings) * 15 / 60:.1f} 分钟")

    ratings_map = {}
    success_count = 0
    fail_count = 0

    # 逐个抓取（单线程，更稳定）
    for i, (idx, row) in enumerate(missing_ratings.iterrows(), 1):
        url = row['url']
        title = row['title']

        print(f"\n[{i}/{len(missing_ratings)}] {title[:40]}...")

        result = get_book_rating(url, title)

        if result['success']:
            if result['rating']:
                ratings_map[result['url']] = result['rating']
                success_count += 1
                print(f"      ✅ 评分: {result['rating']}")
            else:
                fail_count += 1
                print(f"      ⚠️ 未找到评分")
        else:
            fail_count += 1
            print(f"      ❌ 失败: {result.get('error', 'Unknown')[:40]}")

        # 添加延迟，避免请求过快
        if i < len(missing_ratings):
            delay = random.uniform(5, 10)
            print(f"      ⏱ 等待 {delay:.1f} 秒...")
            time.sleep(delay)

    # 更新数据
    for url, rating in ratings_map.items():
        df.loc[df['url'] == url, 'platformRating'] = rating

    # 保存文件
    output_file = input_file
    print(f"\n💾 正在保存到 {output_file}...")
    df.to_excel(output_file, index=False, engine='openpyxl')
    print("✅ 保存成功！")

    # 显示统计
    print("\n" + "=" * 80)
    print("📊 本次抓取统计:")
    print(f"   尝试抓取: {len(missing_ratings)} 本")
    print(f"   成功获取评分: {success_count}")
    print(f"   失败: {fail_count}")
    print(f"   成功率: {success_count/len(missing_ratings)*100:.1f}%")

    # 显示总体统计
    total_with_rating = df['platformRating'].notna().sum()
    total_missing = df['platformRating'].isna().sum()

    print(f"\n📊 总体统计:")
    print(f"   总书籍数: {len(df)}")
    print(f"   有评分的书: {total_with_rating} ({total_with_rating/len(df)*100:.1f}%)")
    print(f"   仍缺失评分: {total_missing}")

    if total_missing > 0:
        print(f"\n⚠️  仍有 {total_missing} 本书未获取到评分")
        print("   可以再次运行此脚本继续尝试")

    print("\n" + "=" * 80)
    print("✅ 完成！")
    print("=" * 80)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️ 用户中断")
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
        import traceback
        traceback.print_exc()
