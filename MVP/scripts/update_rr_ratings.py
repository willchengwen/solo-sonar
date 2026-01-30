#!/usr/bin/env python3
"""
更新 Royal Road 书籍的评分数据，并按照 Best Rated 榜单顺序重新排列
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
from urllib.parse import urljoin
import re

# User-Agent 模拟浏览器访问
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0'
}

BASE_URL = "https://www.royalroad.com"


def random_delay(min_sec=3, max_sec=6):
    """随机延迟，避免被封"""
    delay = random.uniform(min_sec, max_sec)
    print(f"    ⏱ 等待 {delay:.1f} 秒...")
    time.sleep(delay)


def get_soup(url, retry_count=3):
    """获取页面并返回 BeautifulSoup 对象"""
    for attempt in range(retry_count):
        try:
            response = requests.get(url, headers=HEADERS, timeout=30)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            print(f"    ❌ 请求失败 (尝试 {attempt + 1}/{retry_count}): {e}")
            if attempt < retry_count - 1:
                time.sleep(random.uniform(3, 6))
            else:
                raise


def get_book_rating(url):
    """获取书籍详情页的评分"""
    try:
        soup = get_soup(url)

        # 评分 - 查找评分元素
        rating = None
        rating_element = soup.find('span', class_=lambda x: x and 'rating' in x.lower())
        if rating_element:
            rating_text = rating_element.get_text(strip=True)
            rating_match = re.search(r'([\d.]+)', rating_text)
            if rating_match:
                rating = float(rating_match.group(1))

        # 另一种尝试：查找所有包含评分的元素
        if not rating:
            # 查找 fiction-rating 类
            rating_elements = soup.find_all(class_=lambda x: x and 'rating' in str(x).lower())
            for elem in rating_elements:
                text = elem.get_text(strip=True)
                # 匹配类似 "4.5" 或 "4.5 (1000 ratings)" 的格式
                match = re.search(r'(\d\.\d{1,2})', text)
                if match:
                    rating = float(match.group(1))
                    break

        return rating
    except Exception as e:
        print(f"    ⚠️ 获取评分失败: {e}")
        return None


def get_best_rated_order():
    """获取 Best Rated 榜单的书籍顺序（前8页）"""
    print("🚀 正在获取 Best Rated 榜单顺序...")

    ordered_books = {}  # {url: rank}

    for page in range(1, 9):
        print(f"\n📖 正在抓取第 {page}/8 页的榜单顺序...")

        url = f"{BASE_URL}/fictions/best-rated?page={page}"
        soup = get_soup(url)

        # 查找所有小说条目
        book_elements = soup.find_all('div', class_='fiction-card')

        if not book_elements:
            book_elements = soup.find_all('div', class_='row')
            book_elements = [elem for elem in book_elements if elem.find('h2')]

        print(f"    📚 找到 {len(book_elements)} 本书")

        for idx, book_elem in enumerate(book_elements, 1):
            try:
                title_link = book_elem.find('h2').find('a') if book_elem.find('h2') else None
                if title_link:
                    link = title_link.get('href')
                    full_url = urljoin(BASE_URL, link)
                    rank = (page - 1) * 20 + idx
                    ordered_books[full_url] = rank
            except:
                pass

        if page < 8:
            random_delay(1, 2)

    print(f"\n✅ 共获取 {len(ordered_books)} 本书的榜单顺序")
    return ordered_books


def main():
    """主函数"""
    print("=" * 80)
    print("🔄 更新 Royal Road 书籍评分并重新排序")
    print("=" * 80)

    # 读取现有的 Excel 文件
    input_file = '/Users/chengwen/Projects/solo-sonar/scripts/rr_best_rated.xlsx'
    print(f"\n📂 读取文件: {input_file}")

    df = pd.read_excel(input_file)
    print(f"✅ 读取成功，共 {len(df)} 本书")

    # 1. 获取 Best Rated 榜单的原始顺序
    print("\n" + "=" * 80)
    ordered_books = get_best_rated_order()

    # 2. 为每本书添加榜单排名
    df['best_rank'] = df['url'].map(ordered_books)

    # 统计有多少本书找到了排名
    found_rank = df['best_rank'].notna().sum()
    print(f"\n📊 在榜单中找到 {found_rank}/{len(df)} 本书的排名")

    # 3. 获取每本书的评分
    print("\n" + "=" * 80)
    print("📈 开始抓取评分数据...")
    print("=" * 80)

    ratings = {}

    for idx, row in df.iterrows():
        print(f"\n[{idx + 1}/{len(df)}] 正在获取评分: {row['title'][:40]}...")

        try:
            rating = get_book_rating(row['url'])
            if rating:
                ratings[row['url']] = rating
                print(f"    ✓ 评分: {rating}")
            else:
                print(f"    ⚠️ 未找到评分")
                ratings[row['url']] = None

            # 延迟
            if idx < len(df) - 1:
                random_delay(1, 3)

        except Exception as e:
            print(f"    ❌ 出错: {e}")
            ratings[row['url']] = None

    # 添加评分列
    df['platformRating'] = df['url'].map(ratings)

    # 统计评分情况
    has_rating = df['platformRating'].notna().sum()
    print(f"\n📊 成功获取 {has_rating}/{len(df)} 本书的评分")

    # 4. 按照 Best Rated 榜单顺序排序（没有排名的放在最后）
    df_sorted = df.sort_values(by='best_rank', ascending=True, na_position='last')

    # 删除临时列
    df_sorted = df_sorted.drop(columns=['best_rank'])

    # 调整列顺序，把评分放在更合理的位置
    columns_order = [
        'title', 'author', 'url', 'coverUrl',
        'platformRating',  # 评分放在这里
        'status', 'chapters', 'pages', 'words',
        'views', 'followers', 'synopsis',
        'tags', 'notes'  # notes 放在最后
    ]

    # 只保留存在的列
    columns_order = [col for col in columns_order if col in df_sorted.columns]
    df_sorted = df_sorted[columns_order]

    # 5. 保存更新后的文件
    output_file = input_file
    print(f"\n💾 正在保存到 {output_file}...")

    df_sorted.to_excel(output_file, index=False, engine='openpyxl')
    print("✅ 保存成功！")

    # 6. 显示预览
    print("\n" + "=" * 80)
    print("📊 更新后的数据预览（前10本）:")
    print("=" * 80)
    print(df_sorted[['title', 'platformRating', 'followers', 'views']].head(10).to_string())

    print("\n" + "=" * 80)
    print("✅ 完成！")
    print(f"📁 文件已更新: {output_file}")
    print(f"📚 共 {len(df_sorted)} 本书")
    print(f"⭐ 有评分: {has_rating} 本")
    print(f"📈 按 Best Rated 榜单顺序排列")
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
