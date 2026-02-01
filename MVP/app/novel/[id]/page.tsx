'use client';

import { useState, use, useEffect, useRef } from 'react';
import Link from 'next/link';
import novelsData from '@/data/books.json';
import Footer from '../../components/Footer';
import { getTagStyle } from '../../lib/tagStyles';

// 平台类型
type Platform = 'RR' | 'SB' | 'SV' | 'Site';

// 书籍接口
interface Novel {
  id: string;
  title: string;
  author: string;
  platform: Platform;
  status: 'Completed' | 'Ongoing';
  chapters: number;
  words: string;
  updated: string;
  gradient: string;
  synopsis: string;
  editorNote?: string;
  themes: string[];
  coverImage?: string | null;
  links: Array<{ platform: string; url: string; isCanonical: boolean }>;
}

// MVP Novel 接口（匹配 data/books.json）
interface MVPNovel {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  themes: string[];
  links: Array<{
    platform: string;
    url: string;
    isCanonical: boolean;
  }>;
  status: 'ongoing' | 'completed' | 'hiatus' | 'dropped';
  wordCount?: number;
  words?: string;  // 新增：直接存储的字数文本
  chapterCount?: number;
  startedAt?: string;
  completedAt?: string;
  coverGradient?: string;
  coverImage?: string;
  curatorNote?: string;
  stackCount: number;
  savedCount: number;
}

// 书单接口
interface Stack {
  id: string;
  title: string;
  description: string;
  picks: number;
  gradient: string;
}

// 平台映射函数
function mapPlatform(platform: string): Platform {
  const platformMap: Record<string, Platform> = {
    'royal-road': 'RR',
    'spacebattles': 'SB',
    'sufficient-velocity': 'SV',
    'personal-site': 'Site',
    'scribble-hub': 'RR',
    'ao3': 'Site'
  };
  return platformMap[platform] || 'Site';
}

// 格式化字数
function formatWordCount(wordCount?: number): string {
  if (!wordCount) return 'N/A';
  if (wordCount >= 1000000) return `${(wordCount / 1000000).toFixed(1)}M`;
  if (wordCount >= 1000) return `${Math.round(wordCount / 1000)}k`;
  return wordCount.toString();
}

// 格式化日期
function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

// 将 MVP 数据转换为页面格式
function convertMVPToNovel(mvpNovel: MVPNovel): Novel {
  // 优先使用 words 字段，如果没有则使用 wordCount 格式化
  const wordCount = mvpNovel.words || formatWordCount(mvpNovel.wordCount);

  return {
    id: mvpNovel.id,
    title: mvpNovel.title,
    author: mvpNovel.author,
    platform: mapPlatform(mvpNovel.links.find(l => l.isCanonical)?.platform || 'royal-road'),
    status: mvpNovel.status === 'completed' ? 'Completed' : 'Ongoing',
    chapters: mvpNovel.chapterCount || 0,
    words: wordCount,
    updated: formatDate(mvpNovel.completedAt || mvpNovel.startedAt),
    gradient: mvpNovel.coverGradient || 'from-gray-200 to-gray-100',
    synopsis: mvpNovel.synopsis,
    editorNote: mvpNovel.curatorNote,
    themes: mvpNovel.themes,
    coverImage: mvpNovel.coverImage || null,
    links: mvpNovel.links
  };
}

// 获取相关书单
const getStacksForNovel = (novelId: string): Stack[] => {
  return [
    {
      id: 'rational-fiction-essentials',
      title: 'Rational Fiction Essentials',
      description: 'Stories where protagonists think strategically.',
      picks: 15,
      gradient: 'from-gray-200 to-gray-100'
    },
    {
      id: 'completed-bingeable',
      title: 'Completed & Bingeable',
      description: 'Finished stories ready to marathon.',
      picks: 20,
      gradient: 'from-gray-200 to-gray-100'
    },
    {
      id: 'time-loop-masters',
      title: 'Time Loop Masters',
      description: 'The best of groundhog day fiction.',
      picks: 8,
      gradient: 'from-gray-200 to-gray-100'
    }
  ];
};

// 获取相似推荐
const getSimilarNovels = (currentNovelId: string) => {
  const allNovels = novelsData as MVPNovel[];
  return allNovels
    .filter(novel => novel.id !== currentNovelId)
    .slice(0, 8)
    .map(novel => ({
      id: novel.id,
      title: novel.title,
      author: novel.author,
      gradient: novel.coverGradient || 'from-gray-200 to-gray-100',
      coverImage: novel.coverImage
    }));
};

// 平台配置
const PLATFORM_CONFIG: Record<Platform, { name: string; bgColor: string; iconBg: string }> = {
  'RR': { name: 'Royal Road', bgColor: 'bg-amber-50', iconBg: 'bg-amber-400' },
  'SB': { name: 'SpaceBattles', bgColor: 'bg-orange-50', iconBg: 'bg-slate-800' },
  'SV': { name: 'Sufficient Velocity', bgColor: 'bg-deep-100', iconBg: 'bg-cyan-700' },
  'Site': { name: 'Author Site', bgColor: 'bg-emerald-50', iconBg: 'bg-emerald-500' },
};

export default function NovelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [showSynopsisButton, setShowSynopsisButton] = useState(false);
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  const synopsisRef = useRef<HTMLParagraphElement>(null);

  // 根据 ID 从数据中查找小说
  const mvpNovel = (novelsData as MVPNovel[]).find(novel => novel.id === id);

  // 如果找不到小说，显示 404
  if (!mvpNovel) {
    return (
      <div className="min-h-screen bg-deep-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-deep-900 mb-4">Novel Not Found</h1>
          <p className="text-deep-600 mb-8">The novel you're looking for doesn't exist.</p>
          <Link href="/" className="text-sonar-600 hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  // 转换数据格式
  const novelData = convertMVPToNovel(mvpNovel);
  const stacks = getStacksForNovel(id);
  const similarNovels = getSimilarNovels(id);

  // 检测 synopsis 是否被截断
  useEffect(() => {
    const checkTruncation = () => {
      if (synopsisRef.current) {
        const isTruncated = synopsisRef.current.scrollHeight > synopsisRef.current.clientHeight;
        setShowSynopsisButton(isTruncated);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [novelData.synopsis]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#platformDropdown') && !target.closest('#readingBtn')) {
        setPlatformDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-deep-50 text-deep-900 antialiased">
      <main className="pt-20 pb-20">
        <div className="px-5 sm:px-6 max-w-5xl mx-auto">
          {/* 桌面端：左右布局 | 移动端：上下布局 */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* 左侧：封面 + 按钮（桌面端固定） */}
            <div className="lg:w-[200px] sticky-sidebar">
              {/* 移动端：横向布局，桌面端：纵向布局 */}
              <div className="flex sm:flex-col gap-5 sm:gap-6">
                {/* 封面 */}
                {novelData.coverImage ? (
                  <img 
                    src={novelData.coverImage} 
                    alt={novelData.title}
                    className="book-cover-large flex-shrink-0"
                    style={{ width: '160px', height: 'auto' }}
                  />
                ) : (
                  <div className="book-cover-large bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-6xl flex-shrink-0">
                    📘
                  </div>
                )}

                {/* 移动端：基本信息放封面旁边 */}
                <div className="flex-1 sm:hidden">
                  <h1 className="text-xl font-bold text-deep-900 mb-1">{novelData.title}</h1>
                  <p className="text-sm text-neutral-500 mb-2">by {novelData.author} · {novelData.platform}</p>
                  <p className="text-sm text-neutral-500 mb-2">{novelData.words} words · <span className="status-completed px-2 py-0.5 rounded-full text-xs font-medium">{novelData.status}</span></p>
                  <p className="text-sm text-neutral-400 mb-3">Featured in {mvpNovel.stackCount} stacks</p>
                  <button className="heart-btn">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Start Reading 按钮 */}
              <div className="relative mt-8">
                <button
                  id="readingBtn"
                  className="btn-primary whitespace-nowrap"
                  onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
                >
                  Start Reading
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {/* 平台下拉菜单 */}
                <div id="platformDropdown" className={`platform-dropdown ${platformDropdownOpen ? 'show' : ''}`}>
                  {novelData.links.map((link) => {
                    const platform = mapPlatform(link.platform);
                    const config = PLATFORM_CONFIG[platform];
                    return (
                      <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="platform-item">
                        <div className={`w-8 h-8 rounded-lg ${config.iconBg} flex items-center justify-center text-white font-bold text-xs`}>
                          {platform}
                        </div>
                        <span className="font-medium">{config.name}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 右侧：内容区（滚动） */}
            <div className="flex-1 min-w-0">
              {/* 桌面端：基本信息 */}
              <div className="hidden sm:block mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-deep-900 mb-3">{novelData.title}</h1>
                <p className="text-lg text-neutral-500 mb-2">by {novelData.author} · {novelData.platform}</p>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-neutral-500">{novelData.words} words</span>
                  <span className="status-completed px-2.5 py-1 rounded-full text-xs font-medium">{novelData.status}</span>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-neutral-400">Featured in {mvpNovel.stackCount} stacks</p>
                  <button className="heart-btn">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Editor's Take */}
              {novelData.editorNote && (
                <section className="mb-10">
                  <div className="card-static p-6">
                    <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Editor's Take</h2>
                    <p className="text-neutral-600 leading-relaxed text-base sm:text-lg italic">
                      "{novelData.editorNote}"
                    </p>
                  </div>
                </section>
              )}

              {/* Synopsis */}
              <section className="mb-10">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Synopsis</h2>
                <div>
                  <p
                    ref={synopsisRef}
                    className={`text-neutral-600 leading-relaxed ${!showFullSynopsis ? 'line-clamp-3' : ''}`}
                  >
                    {novelData.synopsis}
                  </p>
                  {showSynopsisButton && (
                    <button
                      onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                      className="text-sonar-600 font-medium text-sm mt-2 hover:text-sonar-700"
                    >
                      {showFullSynopsis ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              </section>

              {/* Tags */}
              <section className="mb-10">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {novelData.themes.map((theme, index) => {
                    const style = getTagStyle(theme);
                    return (
                      <span key={index} className={`tag ${style.bg} ${style.text} ${style.border}`}>
                        {theme}
                      </span>
                    );
                  })}
                </div>
              </section>

              {/* Related Books */}
              <section className="mb-10">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Related Books</h2>
                <div className="scroll-wrapper">
                  <div className="scroll-container">
                    {similarNovels.slice(0, 3).map((novel, index) => {
                      const coverStyles = [
                        { gradient: 'from-indigo-500 to-purple-600', icon: '📕' },
                        { gradient: 'from-emerald-500 to-teal-600', icon: '📗' },
                        { gradient: 'from-orange-500 to-red-600', icon: '📙' }
                      ];
                      const style = coverStyles[index % coverStyles.length];
                      return (
                        <Link key={novel.id} href={`/novel/${novel.id}`} className="block">
                          {novel.coverImage ? (
                            <img src={novel.coverImage} alt={novel.title} className="book-cover-small mb-2" />
                          ) : (
                            <div className={`book-cover-small bg-gradient-to-br ${style.gradient} flex items-center justify-center text-3xl mb-2`}>
                              {style.icon}
                            </div>
                          )}
                          <p className="text-sm font-medium text-deep-900 line-clamp-1 w-[100px]">{novel.title}</p>
                          <p className="text-xs text-neutral-400">{novel.author}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Similar Books */}
              <section className="mb-10">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Similar Books</h2>
                <div className="scroll-wrapper">
                  <div className="scroll-container">
                    {similarNovels.map((novel, index) => {
                      const coverStyles = [
                        { gradient: 'from-red-500 to-orange-500', icon: '⚡' },
                        { gradient: 'from-emerald-500 to-teal-600', icon: '🔮' },
                        { gradient: 'from-violet-500 to-purple-600', icon: '🌀' },
                        { gradient: 'from-slate-600 to-slate-800', icon: '⏰' },
                        { gradient: 'from-pink-500 to-rose-600', icon: '🧙' },
                        { gradient: 'from-cyan-500 to-blue-600', icon: '🐉' }
                      ];
                      const style = coverStyles[index % coverStyles.length];
                      return (
                        <Link key={novel.id} href={`/novel/${novel.id}`} className="block">
                          {novel.coverImage ? (
                            <img src={novel.coverImage} alt={novel.title} className="book-cover-small mb-2" />
                          ) : (
                            <div className={`book-cover-small bg-gradient-to-br ${style.gradient} flex items-center justify-center text-3xl mb-2`}>
                              {style.icon}
                            </div>
                          )}
                          <p className="text-sm font-medium text-deep-900 line-clamp-1 w-[100px]">{novel.title}</p>
                          <p className="text-xs text-neutral-400">{novel.author}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Featured in Stacks */}
              <section className="mb-10">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Featured in Stacks</h2>
                <div className="scroll-wrapper">
                  <div className="scroll-container">
                    {stacks.map((stack) => (
                      <Link key={stack.id} href={`/stack/${stack.id}`} className="card card-hover p-4 w-[260px]">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg">📚</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-deep-900 line-clamp-1">{stack.title}</p>
                          </div>
                        </div>
                        <p className="text-sm text-neutral-500 italic mb-2 line-clamp-1">{stack.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"></div>
                            <span className="text-xs text-neutral-500">Editor</span>
                          </div>
                          <span className="text-xs text-neutral-400">{stack.picks} books</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
