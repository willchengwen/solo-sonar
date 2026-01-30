#!/usr/bin/env python3
"""
Royal Road Best Rated 榜单抓取脚本（带 Show Stubs）
抓取前 50 本书（约 2-3 页）
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
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
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


def parse_number(text):
    """解析数字字符串，如 '1,234,567' -> 1234567"""
    if not text:
        return None
    cleaned = re.sub(r'[^\d]', '', str(text))
    return int(cleaned) if cleaned else None


def get_book_rating(soup):
    """从详情页获取评分"""
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

    return rating


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
            # 过滤掉状态标签
            if tag_text and tag_text not in ["COMPLETED", "ONGOING", "HIATUS", "STUB", "Original", "Fan Fiction"]:
                if tag_text not in tags:
                    tags.append(tag_text)

        # 使用正则表达式提取统计信息
        followers_match = re.search(r'([\d,]+)\s*Followers?', all_text)
        followers = parse_number(followers_match.group(1)) if followers_match else None

        pages_match = re.search(r'([\d,]+)\s*Pages?', all_text)
        pages = parse_number(pages_match.group(1)) if pages_match else None

        views_match = re.search(r'([\d,]+)\s*Views?', all_text)
        views = parse_number(views_match.group(1)) if views_match else None

        chapters_match = re.search(r'([\d,]+)\s*Chapters?', all_text)
        chapters = parse_number(chapters_match.group(1)) if chapters_match else None

        # 简介 - 获取描述文本
        paragraphs = book_element.find_all('p')
        description = ""
        for p in paragraphs:
            text = p.get_text(strip=True)
            if text and len(text) > 50:
                description = text
                break

        if not description:
            lines = all_text.split('\n')
            desc_lines = []
            for line in lines:
                line = line.strip()
                if line and len(line) > 30 and title not in line:
                    if not any(x in line for x in ['Followers', 'Pages', 'Views', 'Chapters', 'COMPLETED', 'ONGOING']):
                        desc_lines.append(line)
            description = ' '.join(desc_lines[:3])

        return {
            'title': title,
            'author': None,
            'url': full_url,
            'coverUrl': cover_url,
            'status': status,
            'chapters': chapters,
            'pages': pages,
            'views': views,
            'followers': followers,
            'words': None,
            'synopsis': description[:1000] if description else None,
            'platformRating': None,
            'tags': ', '.join(tags[:10]) if tags else None
        }
    except Exception as e:
        print(f"    ⚠️ 解析书籍信息时出错: {e}")
        import traceback
        traceback.print_exc()
        return None


def get_book_details(url):
    """获取书籍详情页信息（作者、字数、评分等）"""
    try:
        soup = get_soup(url)

        # 作者
        author = None
        author_link = soup.find('a', href=lambda x: x and '/profile/' in x)
        if author_link:
            author = author_link.get_text(strip=True)

        # 字数
        words = None
        stats_section = soup.find('div', class_='fiction-stats')
        if stats_section:
            stats_text = stats_section.get_text()
            words_match = re.search(r'([\d,]+)\s*Words?', stats_text)
            if words_match:
                words = parse_number(words_match.group(1))

        # 评分
        rating = get_book_rating(soup)

        return {
            'author': author,
            'words': words,
            'platformRating': rating
        }
    except Exception as e:
        print(f"    ⚠️ 获取详情页出错: {e}")
        return {}


def scrape_bestRated_completed(target_count=50):
    """抓取 Best Rated 榜单中已完成（COMPLETED）状态的前50本"""
    print(f"🚀 开始抓取 Royal Road Best Rated 榜单中已完结的前 {target_count} 本")
    print("=" * 80)

    all_books = []
    page = 1

    while len(all_books) < target_count and page <= 10:  # 最多抓10页
        print(f"\n📖 正在抓取第 {page} 页...")

        url = f"{BASE_URL}/fictions/best-rated?page={page}"

        try:
            soup = get_soup(url)

            # 查找所有小说条目 - 尝试多种选择器
            book_elements = soup.find_all('div', class_='fiction-card')

            if not book_elements:
                # 尝试查找所有包含 h2 的 div
                book_elements = []
                all_divs = soup.find_all('div')
                for div in all_divs:
                    if div.find('h2'):
                        # 确保这个 div 包含小说链接
                        links = div.find_all('a', href=lambda x: x and '/fiction/' in str(x))
                        if links:
                            book_elements.append(div)
                            # 移除已使用的 div 的子元素，避免重复
                            for sub_div in div.find_all('div'):
                                if sub_div in all_divs:
                                    all_divs.remove(sub_div)

            if not book_elements:
                print(f"    ⚠️ 未找到书籍元素")
                break

            print(f"    📚 找到 {len(book_elements)} 本书")

            for idx, book_elem in enumerate(book_elements, 1):
                if len(all_books) >= target_count:
                    break

                # 先提取基本信息检查状态
                title_elem = book_elem.find('h2')
                if not title_elem:
                    continue

                title_link = title_elem.find('a')
                if not title_link:
                    continue

                link = title_link.get('href')
                full_url = urljoin(BASE_URL, link) if link else None

                # 检查状态
                all_text = book_elem.get_text()
                is_completed = "COMPLETED" in all_text

                # 只抓取已完成的书籍
                if not is_completed:
                    continue

                print(f"    [{len(all_books) + 1}/{target_count}] ", end="")

                book_info = extract_book_info(book_elem)

                if book_info and book_info['url']:
                    print(f"✓ {book_info['title'][:30]}... [已完成]")

                    # 获取详情页信息
                    try:
                        random_delay(1, 2)
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

        except Exception as e:
            print(f"    ❌ 第 {page} 页抓取失败: {e}")
            break

        # 页面之间延迟
        page += 1
        if len(all_books) < target_count and page <= 10:
            random_delay()

    print("\n" + "=" * 80)
    print(f"✅ 抓取完成！共获取 {len(all_books)} 本已完结书籍")

    return all_books


def save_to_excel(books, filename="rr_best50_with_stubs.xlsx"):
    """保存到 Excel 文件"""
    print(f"\n💾 正在保存到 {filename}...")

    df = pd.DataFrame(books)

    # 调整列顺序
    columns_order = [
        'title', 'author', 'url', 'coverUrl',
        'platformRating',
        'status', 'chapters', 'pages', 'words',
        'views', 'followers', 'synopsis',
        'tags'
    ]

    # 只保留存在的列
    columns_order = [col for col in columns_order if col in df.columns]
    df = df[columns_order]

    df.to_excel(filename, index=False, engine='openpyxl')
    print(f"✅ 保存成功！文件: {filename}")

    # 显示预览
    print(f"\n📊 数据预览:")
    print(df.head(10).to_string())


def main():
    """主函数"""
    try:
        # 抓取数据 - 只抓取已完结的书
        books = scrape_bestRated_completed(target_count=50)

        if books:
            # 保存到 Excel
            save_to_excel(books, filename="rr_best50_completed.xlsx")

            # 显示统计
            print("\n" + "=" * 80)
            print("📊 抓取统计:")
            print(f"   总书籍数: {len(books)}")
            print(f"   已完结书籍: {len(books)}")

            if 'platformRating' in pd.DataFrame(books).columns:
                df = pd.DataFrame(books)
                has_rating = df['platformRating'].notna().sum()
                print(f"   有评分的书: {has_rating}")
                if has_rating > 0:
                    print(f"   最高评分: {df['platformRating'].max():.2f}")
                    print(f"   最低评分: {df['platformRating'].min():.2f}")
                    print(f"   平均评分: {df['platformRating'].mean():.2f}")
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
