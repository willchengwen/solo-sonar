#!/usr/bin/env python3
"""
抓取单本书籍数据 - Worth the Candle by Alexander Wales
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import re
import json

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive'
}

BASE_URL = "https://www.royalroad.com"


def search_book(title, author=None):
    """搜索书籍"""
    print(f"🔍 搜索书籍: {title}")
    if author:
        print(f"   作者: {author}")

    # 使用 Royal Road 搜索
    search_url = f"{BASE_URL}/fictions/search"
    params = {'title': title}

    try:
        response = requests.get(search_url, params=params, headers=HEADERS, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        # 查找所有小说链接
        fiction_links = soup.find_all('a', href=lambda x: x and '/fiction/' in str(x))

        print(f"\n   找到 {len(fiction_links)} 个结果")

        for link in fiction_links[:10]:  # 只看前10个结果
            link_text = link.get_text(strip=True).lower()
            if title.lower() in link_text:
                href = link.get('href')
                full_url = f"{BASE_URL}{href}"
                print(f"\n✅ 找到匹配: {link.get_text(strip=True)}")
                print(f"   URL: {full_url}")
                return full_url

        # 如果没有完全匹配，显示所有结果
        print("\n📋 搜索结果:")
        for i, link in enumerate(fiction_links[:5], 1):
            href = link.get('href')
            if href and '/fiction/' in href:
                full_url = f"{BASE_URL}{href}"
                print(f"   {i}. {link.get_text(strip=True)}")
                print(f"      {full_url}")

        return None

    except Exception as e:
        print(f"❌ 搜索失败: {e}")
        return None


def scrape_book(url):
    """抓取单本书的完整信息"""
    print(f"\n📖 正在抓取书籍信息...")
    print(f"   URL: {url}")

    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        # 基本信息
        title = None
        title_elem = soup.find('h1', class_='font-white') or soup.find('h1')
        if title_elem:
            title = title_elem.get_text(strip=True)

        # 作者
        author = None
        author_link = soup.find('a', href=lambda x: x and '/profile/' in str(x))
        if author_link:
            author = author_link.get_text(strip=True)

        # 状态
        status = None
        all_text = soup.get_text()
        for status_type in ["COMPLETED", "ONGOING", "HIATUS", "STUB", "STUBBED"]:
            if status_type in all_text:
                status = status_type
                break

        # 封面
        cover_url = None
        cover_img = soup.find('img', class_='img-responsive')
        if cover_img:
            cover_url = cover_img.get('src')

        # 评分
        rating = None
        meta_rating = soup.find('meta', property='books:rating:value')
        if meta_rating and meta_rating.get('content'):
            try:
                rating = float(meta_rating['content'])
            except:
                pass

        # 如果找不到，尝试 JSON-LD
        if not rating:
            json_ld = soup.find('script', type='application/ld+json')
            if json_ld:
                try:
                    data = json.loads(json_ld.string)
                    if 'aggregateRating' in data:
                        rating = float(data['aggregateRating']['ratingValue'])
                except:
                    pass

        # 统计信息
        stats_section = soup.find('div', class_='fiction-stats')
        chapters = None
        pages = None
        words = None
        views = None
        followers = None

        if stats_section:
            stats_text = stats_section.get_text()

            # 章节和页数
            chapters_match = re.search(r'(\d+)\s*(Chapters|Chapter)', stats_text, re.IGNORECASE)
            if chapters_match:
                chapters = int(chapters_match.group(1))

            pages_match = re.search(r'(\d+)\s*(Pages|Page)', stats_text, re.IGNORECASE)
            if pages_match:
                pages = int(pages_match.group(1))

            # 字数
            words_match = re.search(r'([\d,]+)\s*Words?', stats_text, re.IGNORECASE)
            if words_match:
                words = int(words_match.group(1).replace(',', ''))

        # 查找浏览量和关注者
        for elem in soup.find_all(['div', 'span', 'p']):
            text = elem.get_text(strip=True)

            if not views:
                views_match = re.search(r'([\d,]+)\s*Views?', text, re.IGNORECASE)
                if views_match:
                    views = int(views_match.group(1).replace(',', ''))

            if not followers:
                followers_match = re.search(r'([\d,]+)\s*Followers?', text, re.IGNORECASE)
                if followers_match:
                    followers = int(followers_match.group(1).replace(',', ''))

        # 简介
        synopsis = None
        synopsis_elem = soup.find('div', class_='fiction-description')
        if synopsis_elem:
            synopsis = synopsis_elem.get_text(strip=True)[:1000]

        # 标签
        tags = []
        tag_links = soup.find_all('a', href=lambda x: x and '/tags/' in str(x))
        for tag_elem in tag_links[:10]:
            tag_text = tag_elem.get_text(strip=True)
            if tag_text and tag_text not in tags:
                tags.append(tag_text)

        book_info = {
            'title': title,
            'author': author,
            'url': url,
            'coverUrl': cover_url,
            'status': status,
            'chapters': chapters,
            'pages': pages,
            'words': words,
            'views': views,
            'followers': followers,
            'synopsis': synopsis,
            'platformRating': rating,
            'tags': ', '.join(tags) if tags else None
        }

        return book_info

    except Exception as e:
        print(f"❌ 抓取失败: {e}")
        import traceback
        traceback.print_exc()
        return None


def save_to_excel(book_info, filename="worth_the_candle.xlsx"):
    """保存到 Excel"""
    print(f"\n💾 正在保存到 {filename}...")

    df = pd.DataFrame([book_info])

    # 调整列顺序
    columns_order = [
        'title', 'author', 'url', 'coverUrl',
        'platformRating',
        'status', 'chapters', 'pages', 'words',
        'views', 'followers', 'synopsis',
        'tags'
    ]

    columns_order = [col for col in columns_order if col in df.columns]
    df = df[columns_order]

    df.to_excel(filename, index=False, engine='openpyxl')
    print("✅ 保存成功！")

    # 显示信息
    print("\n" + "=" * 80)
    print("📊 书籍信息:")
    print("=" * 80)
    for key, value in book_info.items():
        if value and value != 'None':
            print(f"{key:15}: {value}")


def main():
    """主函数"""
    print("=" * 80)
    print("📚 抓取书籍数据 - Worth the Candle by Alexander Wales")
    print("=" * 80)

    # 方法1：尝试已知的URL
    # Worth the Candle 常见的ID是28581或20174
    possible_urls = [
        "https://www.royalroad.com/fiction/28581",
        "https://www.royalroad.com/fiction/20174/worth-the-candle",
    ]

    book_url = None

    for url in possible_urls:
        print(f"\n尝试访问: {url}")
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                # 检查是否包含书名
                if "worth the candle" in soup.get_text().lower():
                    print("✅ 找到书籍！")
                    book_url = url
                    break
        except:
            continue

    # 方法2：如果直接URL不工作，使用搜索
    if not book_url:
        book_url = search_book("Worth the Candle", "Alexander Wales")

    if not book_url:
        print("\n❌ 未找到书籍")
        return

    # 抓取书籍信息
    book_info = scrape_book(book_url)

    if book_info:
        # 保存到 Excel
        save_to_excel(book_info)

        print("\n" + "=" * 80)
        print("✅ 完成！")
        print("=" * 80)
    else:
        print("❌ 抓取失败")


if __name__ == "__main__":
    main()
