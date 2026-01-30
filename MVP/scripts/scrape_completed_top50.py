#!/usr/bin/env python3
"""
Royal Road Best Rated 已完结书籍抓取脚本
抓取前 50 本已完结书籍
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
from urllib.parse import urljoin
import re
import json

# User-Agent 模拟浏览器访问
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
}

BASE_URL = "https://www.royalroad.com"


def random_delay(min_sec=2, max_sec=4):
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


def parse_number(text):
    """解析数字字符串，如 '1,234,567' -> 1234567"""
    if not text:
        return None
    # 移除逗号和其他非数字字符
    cleaned = re.sub(r'[^\d]', '', str(text))
    return int(cleaned) if cleaned else None


def extract_book_info(book_element):
    """从列表页书籍元素中提取信息"""
    try:
        # 获取链接和标题 - 查找 h2 标签
        title_elem = book_element.find('h2')
        if not title_elem:
            return None

        title_link = title_elem.find('a')
        if not title_link:
            return None

        link = title_link.get('href')
        full_url = urljoin(BASE_URL, link) if link else None
        title = title_link.get_text(strip=True)

        # 封面图 - 查找 img 标签
        cover_img = book_element.find('img')
        cover_url = cover_img.get('src') if cover_img else None

        # 从全文中提取信息
        all_text = book_element.get_text()

        # 状态 - COMPLETED, ONGOING, HIATUS, STUB
        status = "Unknown"
        for status_type in ["COMPLETED", "ONGOING", "HIATUS", "STUB"]:
            if status_type in all_text:
                status = status_type
                break

        # 提取标签 - 从链接中提取
        tags = []
        tag_links = book_element.find_all('a', href=lambda x: x and '/tags/' in str(x))
        for tag_elem in tag_links:
            tag_text = tag_elem.get_text(strip=True)
            # 过滤掉状态标签（如 COMPLETED）
            if tag_text and tag_text not in ["COMPLETED", "ONGOING", "HIATUS", "STUB", "Original", "Fan Fiction"]:
                if tag_text not in tags:
                    tags.append(tag_text)

        # 如果没有找到标签，尝试从文本中提取
        if not tags:
            # 常见标签列表
            common_tags = [
                "Time Loop", "Adventure", "Fantasy", "Mystery", "Magic", "Comedy",
                "Sci-fi", "Action", "Slice of Life", "Romance", "LitRPG",
                "Reincarnation", "Portal Fantasy / Isekai", "Xianxia", "Urban Fantasy",
                "Super Heroes", "Female Lead", "Male Lead", "Villainous Lead",
                "Non-Human Lead", "Drama", "Horror", "High Fantasy", "Low Fantasy",
                "Space Opera", "Cyberpunk", "Dungeon", "Strategy", "Progression",
                "Virtual Reality", "GameLit", "Anti-Hero Lead", "Strong Lead"
            ]
            for tag in common_tags:
                if tag in all_text:
                    tags.append(tag)

        # 使用正则表达式提取统计信息
        # Followers
        followers_match = re.search(r'([\d,]+)\s*Followers?', all_text)
        followers = parse_number(followers_match.group(1)) if followers_match else None

        # Pages
        pages_match = re.search(r'([\d,]+)\s*Pages?', all_text)
        pages = parse_number(pages_match.group(1)) if pages_match else None

        # Views
        views_match = re.search(r'([\d,]+)\s*Views?', all_text)
        views = parse_number(views_match.group(1)) if views_match else None

        # Chapters
        chapters_match = re.search(r'([\d,]+)\s*Chapters?', all_text)
        chapters = parse_number(chapters_match.group(1)) if chapters_match else None

        # 简介 - 获取描述文本（通常是标题后的文本）
        # 查找所有段落
        paragraphs = book_element.find_all('p')
        description = ""
        for p in paragraphs:
            text = p.get_text(strip=True)
            if text and len(text) > 50:  # 只取较长的段落作为简介
                description = text
                break

        # 如果没有找到段落，尝试其他方式
        if not description:
            # 获取整个文本并移除标题和统计信息
            lines = all_text.split('\n')
            desc_lines = []
            for line in lines:
                line = line.strip()
                if line and len(line) > 30 and title not in line:
                    if not any(x in line for x in ['Followers', 'Pages', 'Views', 'Chapters', 'COMPLETED', 'ONGOING']):
                        desc_lines.append(line)
            description = ' '.join(desc_lines[:3])  # 取前3行

        return {
            'title': title,
            'author': None,  # 从详情页获取
            'url': full_url,
            'coverUrl': cover_url,
            'status': status,
            'chapters': chapters,
            'pages': pages,
            'views': views,
            'followers': followers,
            'words': None,  # 从详情页获取
            'synopsis': description[:1000] if description else None,
            'platformRating': None,  # 从详情页获取
            'tags': ', '.join(tags[:10]) if tags else None  # 限制标签数量
        }
    except Exception as e:
        print(f"    ⚠️ 解析书籍信息时出错: {e}")
        import traceback
        traceback.print_exc()
        return None


def get_book_details(url):
    """获取书籍详情页信息（作者、字数等）"""
    try:
        soup = get_soup(url)

        # 作者
        author = None
        author_link = soup.find('a', href=lambda x: x and '/profile/' in x)
        if author_link:
            author = author_link.get_text(strip=True)

        # 字数 - 通常在统计信息中
        words = None
        stats_section = soup.find('div', class_='fiction-stats')
        if stats_section:
            stats_text = stats_section.get_text()
            words_match = re.search(r'([\d,]+)\s*Words?', stats_text)
            if words_match:
                words = parse_number(words_match.group(1))

        # 评分 - 使用正确的方法
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
            'author': author,
            'words': words,
            'platformRating': rating
        }
    except Exception as e:
        print(f"    ⚠️ 获取详情页出错: {e}")
        return {}


def scrape_bestRated(pages=15, target_count=50):
    """抓取 Best Rated 榜单中已完结的书（包括STUBBED）"""
    print(f"🚀 开始抓取 Royal Road Best Rated 榜单中已完结的前 {target_count} 本")
    print("=" * 60)

    all_books = []
    seen_urls = set()  # 用于去重

    for page in range(1, pages + 1):
        if len(all_books) >= target_count:
            break

        print(f"\n📖 正在抓取第 {page}/{pages} 页...")

        url = f"{BASE_URL}/fictions/best-rated?page={page}"
        soup = get_soup(url)

        # 查找所有小说条目 - Royal Road 使用 fiction-card 类
        book_elements = soup.find_all('div', class_='fiction-card')

        if not book_elements:
            # 尝试其他可能的选择器
            book_elements = soup.find_all('div', class_='row')
            book_elements = [elem for elem in book_elements if elem.find('h2')]

        if not book_elements:
            # 再尝试其他选择器
            book_elements = soup.find_all('article')

        print(f"    📚 找到 {len(book_elements)} 本书")

        for idx, book_elem in enumerate(book_elements, 1):
            if len(all_books) >= target_count:
                break

            # 先检查状态 - 包括 COMPLETED 和 STUBBED
            all_text = book_elem.get_text()
            is_completed = "COMPLETED" in all_text
            is_stubbed = "STUBBED" in all_text

            # 跳过未完结的书
            if not (is_completed or is_stubbed):
                continue

            print(f"    [{len(all_books) + 1}/{target_count}] ", end="")

            book_info = extract_book_info(book_elem)

            if book_info and book_info['url']:
                # 检查是否已抓取过
                if book_info['url'] in seen_urls:
                    print(f"⊘ {book_info['title'][:30]}... [跳过重复]")
                    continue

                seen_urls.add(book_info['url'])

                status_text = "已完结" if is_completed else "已完结(Stub)"
                print(f"✓ {book_info['title'][:30]}... [{status_text}]")

                # 获取详情页信息
                try:
                    random_delay(1, 2)  # 详情页延迟稍短
                    details = get_book_details(book_info['url'])
                    book_info.update(details)

                    # 显示评分
                    if book_info.get('platformRating'):
                        print(f"       ⭐ 评分: {book_info['platformRating']}")
                except Exception as e:
                    print(f"      ⚠️ 获取详情失败: {e}")

                all_books.append(book_info)
            else:
                print("✗ 跳过")

        # 页面之间延迟
        if page < pages and len(all_books) < target_count:
            random_delay()

    print("\n" + "=" * 60)
    print(f"✅ 抓取完成！共获取 {len(all_books)} 本已完结书籍（包括STUBBED）")

    return all_books


def save_to_excel(books, filename="rr_best_rated.xlsx"):
    """保存到 Excel 文件"""
    print(f"\n💾 正在保存到 {filename}...")

    df = pd.DataFrame(books)

    # 调整列顺序
    columns_order = [
        'title', 'author', 'url', 'coverUrl',
        'status', 'chapters', 'pages', 'words',
        'views', 'followers', 'synopsis',
        'platformRating', 'tags'
    ]

    # 只保留存在的列
    columns_order = [col for col in columns_order if col in df.columns]
    df = df[columns_order]

    df.to_excel(filename, index=False, engine='openpyxl')
    print(f"✅ 保存成功！文件: {filename}")
    print(f"\n📊 数据预览:")
    print(df.head(3).to_string())


def main():
    """主函数"""
    try:
        # 抓取数据 - 已完结的前50本（最多15页）
        books = scrape_bestRated(pages=15, target_count=50)

        if books:
            # 保存到 Excel
            save_to_excel(books, filename="rr_completed_top50.xlsx")
        else:
            print("❌ 没有抓取到任何数据")

    except KeyboardInterrupt:
        print("\n\n⚠️ 用户中断")
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
