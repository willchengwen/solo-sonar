#!/usr/bin/env python3
"""
为现有书籍抓取评分数据
使用温和的策略，避免被网站封禁
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import re
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# User-Agent 模拟浏览器访问
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
}


def create_session():
    """创建带重试机制的 Session"""
    session = requests.Session()

    # 配置重试策略
    retry_strategy = Retry(
        total=5,
        backoff_factor=10,  # 指数退避
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["HEAD", "GET", "OPTIONS"]
    )

    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    session.headers.update(HEADERS)

    return session


def get_book_rating(session, url):
    """获取书籍详情页的评分"""
    try:
        response = session.get(url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        # 尝试多种方式查找评分
        rating = None

        # 方法1: 查找包含 rating 的 span
        rating_elements = soup.find_all('span', class_=lambda x: x and 'rating' in str(x).lower())
        for elem in rating_elements:
            text = elem.get_text(strip=True)
            match = re.search(r'(\d\.\d{1,2})', text)
            if match:
                rating = float(match.group(1))
                # 确保评分在合理范围内
                if 1 <= rating <= 5:
                    break

        # 方法2: 查找所有包含分数的元素
        if not rating:
            all_elements = soup.find_all(['span', 'div', 'strong'])
            for elem in all_elements:
                text = elem.get_text(strip=True)
                # 匹配类似 "4.5" 的格式
                match = re.search(r'\b(\d\.\d{1,2})\b', text)
                if match:
                    potential_rating = float(match.group(1))
                    # 确保评分在合理范围内
                    if 1 <= potential_rating <= 5:
                        # 检查是否包含 rating/ratings 等关键词
                        parent_text = elem.parent.get_text() if elem.parent else ""
                        if any(keyword in parent_text.lower() for keyword in ['rating', 'star', 'score']):
                            rating = potential_rating
                            break

        return rating

    except Exception as e:
        print(f"      ⚠️ 请求失败: {e}")
        return None


def main():
    """主函数"""
    print("=" * 80)
    print("📈 为现有书籍抓取评分数据")
    print("=" * 80)

    # 读取现有的 Excel 文件
    input_file = '/Users/chengwen/Projects/solo-sonar/scripts/rr_best_rated.xlsx'
    print(f"\n📂 读取文件: {input_file}")

    df = pd.read_excel(input_file)
    print(f"✅ 读取成功，共 {len(df)} 本书")

    # 创建 Session
    session = create_session()
    print("✅ 已创建 HTTP Session（带自动重试）")

    # 检查是否已有评分列
    if 'platformRating' in df.columns:
        print(f"📊 已有评分列，{df['platformRating'].notna().sum()} 本有评分")
    else:
        print("📊 尚未抓取过评分")

    # 获取每本书的评分
    print("\n" + "=" * 80)
    print("🚀 开始抓取评分数据...")
    print("=" * 80)

    ratings = {}
    success_count = 0
    fail_count = 0

    for idx, row in df.iterrows():
        book_title = row['title'][:40]
        book_url = row['url']

        print(f"\n[{idx + 1}/{len(df)}] {book_title}...")

        try:
            rating = get_book_rating(session, book_url)

            if rating:
                ratings[book_url] = rating
                success_count += 1
                print(f"      ✅ 评分: {rating}")
            else:
                ratings[book_url] = None
                fail_count += 1
                print(f"      ⚠️ 未找到评分")

            # 延迟 - 使用更长的延迟时间
            if idx < len(df) - 1:
                delay = random.uniform(8, 15)  # 8-15秒随机延迟
                print(f"      ⏱ 等待 {delay:.1f} 秒...")
                time.sleep(delay)

        except Exception as e:
            ratings[book_url] = None
            fail_count += 1
            print(f"      ❌ 出错: {e}")

            # 出错后等待更长时间
            error_delay = random.uniform(20, 30)
            print(f"      ⏱ 出错等待 {error_delay:.1f} 秒...")
            time.sleep(error_delay)

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

    # 保存更新后的文件
    output_file = input_file
    print(f"\n" + "=" * 80)
    print(f"💾 正在保存到 {output_file}...")

    df.to_excel(output_file, index=False, engine='openpyxl')
    print("✅ 保存成功！")

    # 显示统计信息
    print("\n" + "=" * 80)
    print("📊 抓取统计:")
    print(f"   总书籍数: {len(df)}")
    print(f"   成功获取评分: {success_count}")
    print(f"   未找到评分: {fail_count}")
    print(f"   成功率: {success_count/len(df)*100:.1f}%")

    # 显示预览
    print("\n" + "=" * 80)
    print("📊 数据预览（前10本）:")
    print("=" * 80)
    preview_df = df[['title', 'platformRating', 'followers']].head(10)
    print(preview_df.to_string(index=False))

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
