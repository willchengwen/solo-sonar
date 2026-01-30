#!/usr/bin/env python3
"""
按照 Royal Road Best Rated 榜单顺序重新排列书籍
使用非常保守的策略以避免被网站封禁
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import re
from urllib.parse import urljoin
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

BASE_URL = "https://www.royalroad.com"


def create_session():
    """创建带重试机制的 Session"""
    session = requests.Session()

    retry_strategy = Retry(
        total=5,
        backoff_factor=10,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["HEAD", "GET", "OPTIONS"]
    )

    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    session.headers.update(HEADERS)

    return session


def get_soup(session, url, retry_count=3):
    """获取页面并返回 BeautifulSoup 对象"""
    for attempt in range(retry_count):
        try:
            response = session.get(url, timeout=30)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            print(f"    ❌ 请求失败 (尝试 {attempt + 1}/{retry_count}): {e}")
            if attempt < retry_count - 1:
                wait_time = (attempt + 1) * 15
                print(f"    ⏱ 等待 {wait_time} 秒后重试...")
                time.sleep(wait_time)
            else:
                raise


def random_delay(min_sec=20, max_sec=30):
    """随机延迟，避免被封"""
    delay = random.uniform(min_sec, max_sec)
    print(f"    ⏱ 等待 {delay:.1f} 秒...")
    time.sleep(delay)


def get_best_rated_order(session):
    """获取 Best Rated 榜单的书籍顺序（前8页）"""
    print("🚀 正在获取 Best Rated 榜单顺序...")
    print("=" * 80)

    ordered_books = {}  # {url: rank}
    page_size = 20

    for page in range(1, 9):
        print(f"\n📖 正在抓取第 {page}/8 页...")

        url = f"{BASE_URL}/fictions/best-rated?page={page}"

        try:
            soup = get_soup(session, url)

            # 查找所有小说链接 - Royal Road 使用 /fiction/数字/书名 格式
            # 先找到所有小说ID
            fiction_ids = re.findall(r'href="/fiction/(\d+)"', str(soup))

            # 去重
            unique_ids = list(dict.fromkeys(fiction_ids))

            for fiction_id in unique_ids:
                full_url = f"{BASE_URL}/fiction/{fiction_id}"

                if full_url not in ordered_books:
                    rank = len(ordered_books) + 1
                    ordered_books[full_url] = rank

                    # 尝试找到对应的标题
                    if rank <= (page * 3):
                        title_elem = soup.find('a', href=lambda x: x and f'/fiction/{fiction_id}' in x)
                        if title_elem:
                            title = title_elem.get_text(strip=True)[:30]
                            print(f"       [{rank}] {title}...")
                        else:
                            print(f"       [{rank}] ID: {fiction_id}...")

            print(f"    📚 本页找到 {len(unique_ids)} 本新书，累计 {len(ordered_books)} 本")

        except Exception as e:
            print(f"    ❌ 第 {page} 页抓取失败: {e}")
            continue

        # 页面之间延迟
        if page < 8:
            random_delay()

    print(f"\n✅ 共获取 {len(ordered_books)} 本书的榜单顺序")
    return ordered_books


def main():
    """主函数"""
    print("=" * 80)
    print("🔄 按照 Royal Road Best Rated 榜单重新排列书籍")
    print("=" * 80)

    # 读取现有的 Excel 文件
    input_file = '/Users/chengwen/Projects/solo-sonar/scripts/rr_best_rated.xlsx'
    print(f"\n📂 读取文件: {input_file}")

    df = pd.read_excel(input_file)
    print(f"✅ 读取成功，共 {len(df)} 本书")

    # 创建 Session
    session = create_session()
    print("✅ 已创建 HTTP Session")

    # 获取 Best Rated 榜单的原始顺序
    ordered_books = get_best_rated_order(session)

    # 为每本书添加榜单排名
    df['best_rank'] = df['url'].map(ordered_books)

    # 统计有多少本书找到了排名
    found_rank = df['best_rank'].notna().sum()
    not_found = len(df) - found_rank

    print(f"\n📊 在榜单中找到 {found_rank}/{len(df)} 本书的排名")
    if not_found > 0:
        print(f"⚠️  有 {not_found} 本书未在榜单前8页中找到")

    # 显示一些找到的和未找到的书籍示例
    if found_rank > 0:
        print("\n✅ 成功匹配的书籍示例（前5本）:")
        found_df = df[df['best_rank'].notna()].sort_values('best_rank').head(5)
        for idx, row in found_df.iterrows():
            print(f"   [排名 {int(row['best_rank'])}] {row['title'][:40]}")

    if not_found > 0:
        print("\n⚠️  未在榜单中找到的书籍示例:")
        not_found_df = df[df['best_rank'].isna()].head(5)
        for idx, row in not_found_df.iterrows():
            print(f"   - {row['title'][:40]}")

    # 按照 Best Rated 榜单顺序排序（没有排名的放在最后）
    df_sorted = df.sort_values(by='best_rank', ascending=True, na_position='last')

    # 删除临时列
    df_sorted = df_sorted.drop(columns=['best_rank'])

    # 保持原有的列顺序
    columns_order = df.columns.tolist()
    df_sorted = df_sorted[columns_order]

    # 保存更新后的文件
    output_file = input_file
    print(f"\n💾 正在保存到 {output_file}...")

    df_sorted.to_excel(output_file, index=False, engine='openpyxl')
    print("✅ 保存成功！")

    # 显示预览
    print("\n" + "=" * 80)
    print("📊 重新排序后的数据预览（前15本）:")
    print("=" * 80)
    print(df_sorted[['title', 'views', 'followers']].head(15).to_string())

    print("\n" + "=" * 80)
    print("✅ 完成！")
    print(f"📁 文件已更新: {output_file}")
    print(f"📚 共 {len(df_sorted)} 本书")
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
