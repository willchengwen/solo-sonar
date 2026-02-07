'use client';

import { useState, use, useEffect, useRef } from 'react';
import Link from 'next/link';
import novelsData from '@/data/books.json';
import Footer from '../../components/Footer';
import { formatTagLabel } from '../../lib/tagStyles';

// 平台类型
type Platform = 'RR' | 'SB' | 'SV' | 'AMZ' | 'Site';

// 书籍接口
interface Novel {
  id: string;
  title: string;
  author: string;
  platform: string; // 改为字符串类型，可以包含多个平台
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
  words?: string;
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
    'ao3': 'Site',
    'amazon': 'AMZ'
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
  const wordCount = mvpNovel.words || formatWordCount(mvpNovel.wordCount);

  // 获取所有平台并连接成字符串
  const allPlatforms = mvpNovel.links.map(link => mapPlatform(link.platform)).join(' · ');

  return {
    id: mvpNovel.id,
    title: mvpNovel.title,
    author: mvpNovel.author,
    platform: allPlatforms,
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

// 获取相关书籍（同一系列或同一作者）
const getRelatedNovels = (currentNovelId: string, currentAuthor: string, currentTitle: string) => {
  const allNovels = novelsData as MVPNovel[];

  // 提取书名前缀用于系列匹配（如 "Mother of Learning" -> "mother of learning"）
  const titlePrefix = currentTitle.toLowerCase().split(':')[0].trim();
  const authorLower = currentAuthor.toLowerCase();

  return allNovels
    .filter(novel => {
      if (novel.id === currentNovelId) return false;

      // 同一作者
      const sameAuthor = novel.author.toLowerCase() === authorLower;

      // 同一系列（书名前缀相同）
      const novelTitlePrefix = novel.title.toLowerCase().split(':')[0].trim();
      const sameSeries = titlePrefix.length > 3 &&
        (novelTitlePrefix.includes(titlePrefix) || titlePrefix.includes(novelTitlePrefix));

      return sameAuthor || sameSeries;
    })
    .slice(0, 6)
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
  'AMZ': { name: 'Amazon', bgColor: 'bg-orange-50', iconBg: 'bg-orange-500' },
  'Site': { name: 'Author Site', bgColor: 'bg-emerald-50', iconBg: 'bg-emerald-500' },
};

export default function NovelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [showSynopsisButton, setShowSynopsisButton] = useState(false);
  const [showFullEditorTake, setShowFullEditorTake] = useState(false);
  const [showEditorTakeButton, setShowEditorTakeButton] = useState(false);
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);

  // Modal states
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [synopsisModalOpen, setSynopsisModalOpen] = useState(false);
  const [editorTakeModalOpen, setEditorTakeModalOpen] = useState(false);

  const synopsisRef = useRef<HTMLParagraphElement>(null);
  const editorTakeRef = useRef<HTMLParagraphElement>(null);

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
  const relatedNovels = getRelatedNovels(id, mvpNovel.author, mvpNovel.title);

  // 检测 synopsis 是否被截断
  useEffect(() => {
    const checkTruncation = () => {
      if (synopsisRef.current) {
        const isTruncated = synopsisRef.current.scrollHeight > synopsisRef.current.clientHeight;
        setShowSynopsisButton(isTruncated);
      }
      if (editorTakeRef.current) {
        const isTruncated = editorTakeRef.current.scrollHeight > editorTakeRef.current.clientHeight;
        setShowEditorTakeButton(isTruncated);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [novelData.synopsis, novelData.editorNote]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#platformDropdown') && !target.closest('#readingBtn') && !target.closest('#readingBtnMobile')) {
        setPlatformDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Modal 打开时禁止滚动
  useEffect(() => {
    if (coverModalOpen || synopsisModalOpen || editorTakeModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [coverModalOpen, synopsisModalOpen, editorTakeModalOpen]);

  return (
    <div className="min-h-screen bg-deep-50 text-deep-900 antialiased">
      <main className="pt-20 pb-20 lg:pt-[110px]">
        <div className="px-5 sm:px-6 max-w-5xl mx-auto">
          {/* Desktop: Left-Right Layout | Mobile: Top-Bottom Layout */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-12">

            {/* Left: Cover + Button (Desktop Sticky) */}
            <div className="lg:w-[180px] sticky-sidebar">
              {/* Mobile: Horizontal Layout, Desktop: Vertical Layout */}
              <div className="flex sm:flex-col gap-5 sm:gap-6">
                {/* Cover */}
                {novelData.coverImage ? (
                  <img
                    src={novelData.coverImage}
                    alt={novelData.title}
                    className="book-cover-large flex-shrink-0 lg:mt-1"
                    onClick={() => setCoverModalOpen(true)}
                  />
                ) : (
                  <div
                    className="book-cover-large bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-6xl flex-shrink-0 lg:mt-1"
                    onClick={() => setCoverModalOpen(true)}
                  >
                    📘
                  </div>
                )}

                {/* Mobile: Basic Info Next to Cover */}
                <div className="flex-1 sm:hidden flex flex-col">
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-deep-900 mb-1">{novelData.title}</h1>
                    <p className="text-sm text-neutral-500 mb-1">by {novelData.author} / {novelData.platform}</p>
                    <p className="text-sm text-neutral-500 mb-2">
                      {novelData.words} words / <span className={`${novelData.status === 'Completed' ? 'status-completed' : 'status-ongoing'} px-2 py-0.5 rounded-full text-xs font-medium`}>{novelData.status}</span>
                    </p>
                  </div>
                  <button className="heart-btn self-start">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mobile: Start Reading Button */}
              <div className="relative mt-5 sm:hidden">
                <button
                  id="readingBtnMobile"
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center justify-between"
                  onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-deep-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="font-medium text-deep-900">Start Reading</span>
                  </div>
                  <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {/* Mobile Platform Dropdown */}
                <div id="platformDropdownMobile" className={`platform-dropdown ${platformDropdownOpen ? 'show' : ''}`}>
                  {novelData.links.map((link) => {
                    const platform = mapPlatform(link.platform);
                    const config = PLATFORM_CONFIG[platform];
                    return (
                      <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="platform-item">
                        <div className={`w-8 h-8 rounded-lg ${config.iconBg} flex items-center justify-center text-white font-bold text-xs`}>
                          {platform}
                        </div>
                        <span className="font-medium text-deep-900">{config.name}</span>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Desktop: Start Reading Button */}
              <div className="relative mt-8 hidden sm:block">
                <button
                  id="readingBtn"
                  className="btn-primary whitespace-nowrap"
                  onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
                >
                  <span>Start Reading</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Platform Dropdown */}
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

            {/* Right: Content Area (Scrollable) */}
            <div className="flex-1 min-w-0">
              {/* Desktop: Basic Info */}
              <div className="hidden sm:block mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-deep-900 mb-3">{novelData.title}</h1>
                <p className="text-lg text-neutral-500 mb-2">by {novelData.author} / {novelData.platform}</p>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-neutral-500">{novelData.words} words</span>
                  <span className={`${novelData.status === 'Completed' ? 'status-completed' : 'status-ongoing'} px-2.5 py-1 rounded-full text-xs font-medium`}>{novelData.status}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="heart-btn">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Editor's Take */}
              {novelData.editorNote && (
                <section className="mb-10 sm:mb-10">
                  {/* Mobile: Click card to open modal */}
                  <div
                    className="card-static p-6 relative sm:hidden cursor-pointer"
                    onClick={() => setEditorTakeModalOpen(true)}
                  >
                    <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-5">Editor's Take:</h2>
                    <p className="text-neutral-600 leading-relaxed text-base italic line-clamp-3">
                      "{novelData.editorNote}"
                    </p>
                  </div>
                  {/* Desktop: Read more expand */}
                  <div className="hidden sm:block card-static p-6">
                    <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-5">Editor's Take:</h2>
                    <p
                      ref={editorTakeRef}
                      className={`text-neutral-600 leading-relaxed text-lg italic ${!showFullEditorTake ? 'line-clamp-3' : ''}`}
                    >
                      "{novelData.editorNote}"
                    </p>
                    {showEditorTakeButton && (
                      <button
                        onClick={() => setShowFullEditorTake(!showFullEditorTake)}
                        className="text-sonar-500 font-medium text-sm mt-3 hover:text-sonar-600"
                      >
                        {showFullEditorTake ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                </section>
              )}

              {/* Synopsis */}
              <section className="mb-10 sm:mb-10">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-5">Synopsis</h2>
                {/* Mobile: 2 lines + arrow, click to open modal */}
                <div
                  className="sm:hidden flex items-start gap-2 cursor-pointer"
                  onClick={() => setSynopsisModalOpen(true)}
                >
                  <p className="text-neutral-600 leading-relaxed line-clamp-2 flex-1">
                    {novelData.synopsis}
                  </p>
                  <svg className="w-5 h-5 text-neutral-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {/* Desktop: 2 lines + Read more */}
                <div className="hidden sm:block">
                  <p
                    ref={synopsisRef}
                    className={`text-neutral-600 leading-relaxed ${!showFullSynopsis ? 'line-clamp-2' : ''}`}
                  >
                    {novelData.synopsis}
                  </p>
                  {showSynopsisButton && (
                    <button
                      onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                      className="text-sonar-500 font-medium text-sm mt-2 hover:text-sonar-600"
                    >
                      {showFullSynopsis ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              </section>

              {/* Tags */}
              <section className="mb-10 sm:mb-10">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-5">Tags</h2>
                {/* Mobile: horizontal scroll */}
                <div className="sm:hidden -mx-5 overflow-visible">
                  <div
                    className="flex gap-2 px-5 pb-0 overflow-x-auto hide-scrollbar"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    {novelData.themes.map((theme, index) => (
                      <span
                        key={index}
                        className="tag flex-shrink-0"
                        style={{ background: '#f9fafb', color: '#4b5563', borderColor: '#e5e7eb' }}
                      >
                        {formatTagLabel(theme)}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Desktop: show all */}
                <div className="hidden sm:flex flex-wrap gap-2">
                  {novelData.themes.map((theme, index) => (
                    <span
                      key={index}
                      className="tag"
                      style={{ background: '#f9fafb', color: '#4b5563', borderColor: '#e5e7eb' }}
                    >
                      {formatTagLabel(theme)}
                    </span>
                  ))}
                </div>
              </section>

              {/* Related Books - 只在有相关书籍时显示 */}
              {relatedNovels.length > 0 && (
                <section className="mb-10 sm:mb-10">
                  <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-5">Related Books</h2>
                  {/* Mobile */}
                  <div className="sm:hidden -mx-5 overflow-visible">
                    <div
                      className="flex gap-4 px-5 pb-0 pt-0 overflow-x-auto hide-scrollbar"
                      style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                      {relatedNovels.map((novel, index) => {
                        const coverStyles = [
                          { gradient: 'from-indigo-500 to-purple-600', icon: '📕' },
                          { gradient: 'from-emerald-500 to-teal-600', icon: '📗' },
                          { gradient: 'from-orange-500 to-red-600', icon: '📙' },
                        ];
                        const style = coverStyles[index % coverStyles.length];
                        return (
                          <Link key={novel.id} href={`/novel/${novel.id}`} className="block flex-shrink-0">
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
                  {/* Desktop */}
                  <div className="hidden sm:block scroll-wrapper">
                    <div className="scroll-container">
                      {relatedNovels.map((novel, index) => {
                        const coverStyles = [
                          { gradient: 'from-indigo-500 to-purple-600', icon: '📕' },
                          { gradient: 'from-emerald-500 to-teal-600', icon: '📗' },
                          { gradient: 'from-orange-500 to-red-600', icon: '📙' },
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
              )}

              {/* Similar Books */}
              <section className="mb-10 sm:mb-10">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-5">Similar Books</h2>
                {/* Mobile */}
                <div className="sm:hidden -mx-5 overflow-visible">
                  <div
                    className="flex gap-4 px-5 pb-0 pt-0 overflow-x-auto hide-scrollbar"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
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
                        <Link key={novel.id} href={`/novel/${novel.id}`} className="block flex-shrink-0">
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
                {/* Desktop */}
                <div className="hidden sm:block scroll-wrapper">
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
              <section className="mb-10 sm:mb-10">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-5">Featured in Stacks</h2>
                {/* Mobile */}
                <div className="sm:hidden -mx-5 overflow-visible">
                  <div
                    className="flex gap-4 px-5 pb-0 pt-0 overflow-x-auto hide-scrollbar"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    {stacks.map((stack, index) => {
                      const stackIcons = ['📚', '💎', '🔥'];
                      const stackGradients = [
                        'from-blue-500 to-indigo-600',
                        'from-emerald-500 to-teal-600',
                        'from-amber-500 to-orange-600'
                      ];
                      return (
                        <Link key={stack.id} href={`/stack/${stack.id}`} className="card card-hover p-4 w-[260px] flex-shrink-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stackGradients[index % stackGradients.length]} flex items-center justify-center text-lg`}>
                              {stackIcons[index % stackIcons.length]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-deep-900 line-clamp-1">{stack.title}</p>
                            </div>
                          </div>
                          <p className="text-sm text-neutral-500 italic mb-2 line-clamp-1">"{stack.description}"</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"></div>
                              <span className="text-xs text-neutral-500">Editor</span>
                            </div>
                            <span className="text-xs text-neutral-400">{stack.picks} books</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
                {/* Desktop */}
                <div className="hidden sm:block scroll-wrapper">
                  <div className="scroll-container">
                    {stacks.map((stack, index) => {
                      const stackIcons = ['📚', '💎', '🔥'];
                      const stackGradients = [
                        'from-blue-500 to-indigo-600',
                        'from-emerald-500 to-teal-600',
                        'from-amber-500 to-orange-600'
                      ];
                      return (
                        <Link key={stack.id} href={`/stack/${stack.id}`} className="card card-hover p-4 w-[260px]">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stackGradients[index % stackGradients.length]} flex items-center justify-center text-lg`}>
                              {stackIcons[index % stackIcons.length]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-deep-900 line-clamp-1">{stack.title}</p>
                            </div>
                          </div>
                          <p className="text-sm text-neutral-500 italic mb-2 line-clamp-1">"{stack.description}"</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"></div>
                              <span className="text-xs text-neutral-500">Editor</span>
                            </div>
                            <span className="text-xs text-neutral-400">{stack.picks} books</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Cover Modal */}
      {coverModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={() => setCoverModalOpen(false)}
        >
          {novelData.coverImage ? (
            <img
              src={novelData.coverImage}
              alt={novelData.title}
              className="w-[280px] sm:w-[320px] rounded-2xl shadow-2xl"
            />
          ) : (
            <div className="w-[280px] sm:w-[320px] aspect-[3/4] bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-8xl shadow-2xl">
              📘
            </div>
          )}
        </div>
      )}

      {/* Editor's Take Modal */}
      {editorTakeModalOpen && novelData.editorNote && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5"
          onClick={() => setEditorTakeModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Editor's Take:</h2>
                <button
                  onClick={() => setEditorTakeModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-neutral-600 leading-relaxed text-base sm:text-lg italic">
                "{novelData.editorNote}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Synopsis Modal */}
      {synopsisModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5"
          onClick={() => setSynopsisModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Synopsis</h2>
                <button
                  onClick={() => setSynopsisModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                {novelData.synopsis}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
