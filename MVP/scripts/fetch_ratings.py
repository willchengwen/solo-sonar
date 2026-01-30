#!/usr/bin/env python3
"""
高效抓取 Royal Road 书籍评分
优化版本：减少延迟，更快完成
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive'
}


def get_book_rating(book_info):
    """获取单本书的评分"""
    url = book_info['url']
    title = book_info['title']

    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        # 查找评分 - Royal Road 评分在 meta 标签中
        rating = None

        # 方法1: 从 meta 标签提取
        meta_rating = soup.find('meta', property='books:rating:value')
        if meta_rating and meta_rating.get('content'):
            try:
                rating = float(meta_rating['content'])
            except:
                pass

        # 方法2: 从 JSON-LD 提取
        if not rating:
            json_ld = soup.find('script', type='application/ld+json')
            if json_ld:
                import json
                try:
                    data = json.loads(json_ld.string)
                    if 'aggregateRating' in data:
                        rating = float(data['aggregateRating']['ratingValue'])
                except:
                    pass

        # 方法3: 从 HTML 文本中查找
        if not rating:
            # 查找 books:rating:value 格式
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
    print("📈 高效抓取 Royal Road 书籍评分")
    print("=" * 80)

    # 读取数据
    input_file = '/Users/chengwen/Projects/solo-sonar/scripts/rr_best_rated.xlsx'
    print(f"\n📂 读取文件: {input_file}")

    df = pd.read_excel(input_file)
    print(f"✅ 读取成功，共 {len(df)} 本书")

    # 准备数据
    books = df[['title', 'url']].to_dict('records')

    print(f"\n🚀 开始抓取评分...")
    print(f"⏱ 预计完成时间: {len(books) * 3 / 60:.1f} 分钟")

    ratings = {}
    success_count = 0
    fail_count = 0

    # 使用线程池并发抓取（限制并发数为3，避免被封）
    with ThreadPoolExecutor(max_workers=3) as executor:
        # 提交所有任务
        future_to_book = {executor.submit(get_book_rating, book): book for book in books}

        # 处理完成的任务
        for i, future in enumerate(as_completed(future_to_book), 1):
            try:
                result = future.result()

                if result['success']:
                    ratings[result['url']] = result['rating']
                    if result['rating']:
                        success_count += 1
                        print(f"[{i}/{len(books)}] ✅ {result['title'][:30]:<30} 评分: {result['rating']}")
                    else:
                        fail_count += 1
                        print(f"[{i}/{len(books)}] ⚠️ {result['title'][:30]:<30} 未找到评分")
                else:
                    ratings[result['url']] = None
                    fail_count += 1
                    print(f"[{i}/{len(books)}] ❌ {result['title'][:30]:<30} 失败: {result.get('error', 'Unknown')[:20]}")

                # 添加小延迟，避免请求过快
                time.sleep(random.uniform(0.5, 1.5))

            except Exception as e:
                fail_count += 1
                print(f"[{i}/{len(books)}] ❌ 处理失败: {e}")

    # 添加评分列
    df['platformRating'] = df['url'].map(ratings)

    # 调整列顺序
    if 'notes' in df.columns:
        columns_order = [
            'title', 'author', 'url', 'coverUrl',
            'platformRating',
            'status', 'chapters', 'pages', 'words',
            'views', 'followers', 'synopsis',
            'tags', 'notes'
        ]
    else:
        columns_order = [
            'title', 'author', 'url', 'coverUrl',
            'platformRating',
            'status', 'chapters', 'pages', 'words',
            'views', 'followers', 'synopsis',
            'tags'
        ]

    columns_order = [col for col in columns_order if col in df.columns]
    df = df[columns_order]

    # 保存文件
    output_file = input_file
    print(f"\n💾 正在保存到 {output_file}...")
    df.to_excel(output_file, index=False, engine='openpyxl')
    print("✅ 保存成功！")

    # 显示统计
    print("\n" + "=" * 80)
    print("📊 抓取统计:")
    print(f"   总书籍数: {len(df)}")
    print(f"   成功获取评分: {success_count}")
    print(f"   未找到评分: {fail_count}")
    print(f"   成功率: {success_count/len(df)*100:.1f}%")

    # 显示预览
    print("\n📊 数据预览（前10本有评分的书）:")
    rated_books = df[df['platformRating'].notna()].head(10)
    print(rated_books[['title', 'platformRating']].to_string(index=False))

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
