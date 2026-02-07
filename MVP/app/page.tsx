'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { Novel, Stack, PLATFORM_INFO, THEME_INFO, Theme } from '@/types/types';
import stacksData from '@/src/data/stacks.json';
import novelsData from '@/data/books.json';
import Footer from './components/Footer';

// 从 JSON 导入数据
const stacks = stacksData.stacks.filter((s) => s.isEditorPick);
const novelsById = new Map((novelsData as Novel[]).map((n) => [n.id, n]));

// 主题标签列表
const themes = (Object.entries(THEME_INFO || {}) as [Theme, { name: string; icon: string }][]).map(
  ([id, info]) => ({
    id,
    name: info.name,
  })
);

// 特色主题（带图标和颜色）
const FEATURED_THEMES = [
  { id: 'progression-fantasy' as Theme, name: 'Progression Fantasy', icon: 'PF', color: 'bg-blue-50 text-blue-600', hoverBorder: 'hover:border-blue-300' },
  { id: 'litrpg' as Theme, name: 'LitRPG', icon: 'LR', color: 'bg-indigo-50 text-indigo-600', hoverBorder: 'hover:border-indigo-300' },
  { id: 'time-loop' as Theme, name: 'Time Loop', icon: 'TL', color: 'bg-deep-100 text-deep-700', hoverBorder: 'hover:border-slate-400' },
  { id: 'isekai' as Theme, name: 'Isekai & Portal', icon: 'IS', color: 'bg-purple-50 text-purple-600', hoverBorder: 'hover:border-purple-300' },
  { id: 'hard-sci-fi' as Theme, name: 'Hard Sci-Fi', icon: 'SF', color: 'bg-amber-50 text-amber-600', hoverBorder: 'hover:border-amber-300' },
  { id: 'dungeon' as Theme, name: 'Dungeon Crawler', icon: 'DC', color: 'bg-sonar-50 text-sonar-500', hoverBorder: 'hover:border-sonar-300' },
  { id: 'cozy' as Theme, name: 'Cozy Fantasy', icon: 'CZ', color: 'bg-emerald-50 text-emerald-600', hoverBorder: 'hover:border-emerald-300' },
];

// 平台配置
const FEATURED_PLATFORMS = [
  'royal-road',
  'spacebattles',
  'sufficient-velocity',
] as const;

const PLATFORM_DESCRIPTIONS: Record<string, string> = {
  'royal-road': 'The home of Progression Fantasy and LitRPG. The primary hub for web originals.',
  'spacebattles': 'Hard sci-fi and Worm fanfiction community. Forum format fosters deep discussion.',
  'sufficient-velocity': 'Quest fiction and creative writing where readers influence the story direction.',
};

const platforms = FEATURED_PLATFORMS.map((id) => {
  const info = PLATFORM_INFO[id];
  const platformColors: Record<string, string> = {
    'royal-road': 'bg-amber-400 text-white',
    'spacebattles': 'bg-deep-800 text-white',
    'sufficient-velocity': 'bg-cyan-700 text-white',
  };

  return {
    id,
    name: info.name,
    shortName: info.shortName,
    description: PLATFORM_DESCRIPTIONS[id] || '',
    color: platformColors[id] || info.color,
    count: id === 'royal-road' ? 140 : id === 'spacebattles' ? 52 : 30,
  };
});

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);

  // Editor's Picks 横向滚动
  const scrollEditorPicks = (direction: 'left' | 'right') => {
    // 找到所有容器并选择可见的那个
    const containers = Array.from(document.querySelectorAll('.editors-picks-container')) as HTMLElement[];
    let container: HTMLElement | null = null;

    for (const c of containers) {
      // 检查容器是否可见（offsetParent 不为 null 表示元素可见）
      if (c.offsetParent !== null) {
        container = c;
        break;
      }
    }

    if (!container) return;

    const cardWidth = 310; // 卡片宽度
    const gap = 20; // gap-5
    const scrollAmount = cardWidth + gap;

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-deep-50 text-deep-900 font-sans antialiased scroll-smooth">
      <main className="pt-20 pb-32">
        {/* Hero Section - V3 Design */}
        <section className="relative px-5 sm:px-6 max-w-6xl mx-auto pt-14 sm:pt-20 mb-36 sm:mb-44">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">

            {/* Left: Task-oriented copy (3 cols) */}
            <div className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left">

              {/* Live badge */}
              <div className="opacity-0 animate-fade-up inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-deep-200 shadow-sm mb-6">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <span className="text-xs font-semibold text-emerald-600">Live</span>
                </div>
                <div className="w-px h-4 bg-deep-200"></div>
                <span className="text-xs text-deep-600">Curating across <strong className="text-deep-800">multiple</strong> platforms</span>
              </div>

              {/* Heading */}
              <h1 className="opacity-0 animate-fade-up-1 text-3xl sm:text-4xl lg:text-5xl xl:text-[3.4rem] font-bold tracking-tight text-deep-900 leading-[1.15] mb-4 sm:mb-5">
                Stop digging through<br />
                <span className="font-serif italic" style={{ color: '#0891B2' }}>10,000 bad novels.</span>
              </h1>

              {/* Sub */}
              <p className="opacity-0 animate-fade-up-2 text-base sm:text-lg text-deep-500 max-w-lg leading-relaxed mb-6 sm:mb-8">
                Find quality stories across Royal Road, SpaceBattles, and more. <strong className="text-deep-700">Curated by readers, for readers.</strong>
              </p>

              {/* Theme chips */}
              <div className="opacity-0 animate-fade-up-3 w-full mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-deep-400 mb-3">I&apos;m looking for...</p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                  <Link href="/theme/time-loop" className="theme-chip px-4 py-2 rounded-full bg-white border border-deep-200 text-sm font-medium text-deep-700 hover:border-sonar-400 hover:text-sonar-700 hover:bg-sonar-50">🔁 Time Loop</Link>
                  <Link href="/theme/litrpg" className="theme-chip px-4 py-2 rounded-full bg-white border border-deep-200 text-sm font-medium text-deep-700 hover:border-sonar-400 hover:text-sonar-700 hover:bg-sonar-50">⚔️ LitRPG</Link>
                  <Link href="/theme/dark-fantasy" className="theme-chip px-4 py-2 rounded-full bg-white border border-deep-200 text-sm font-medium text-deep-700 hover:border-sonar-400 hover:text-sonar-700 hover:bg-sonar-50">🌑 Dark Fantasy</Link>
                  <Link href="/theme/completed" className="theme-chip px-4 py-2 rounded-full bg-white border border-deep-200 text-sm font-medium text-deep-700 hover:border-sonar-400 hover:text-sonar-700 hover:bg-sonar-50">✅ Completed</Link>
                  <Link href="/theme/hidden-gems" className="theme-chip px-4 py-2 rounded-full bg-white border border-deep-200 text-sm font-medium text-deep-700 hover:border-sonar-400 hover:text-sonar-700 hover:bg-sonar-50">💎 Hidden Gems</Link>
                  <Link href="/theme/cultivation" className="theme-chip px-4 py-2 rounded-full bg-white border border-deep-200 text-sm font-medium text-deep-700 hover:border-sonar-400 hover:text-sonar-700 hover:bg-sonar-50">🐉 Cultivation</Link>
                  <Link href="#browse-themes" className="theme-chip px-4 py-2 rounded-full bg-deep-100 border border-deep-200 text-sm font-medium text-deep-500 hover:border-deep-300">All themes →</Link>
                </div>
              </div>

              {/* Trust line */}
              <div className="opacity-0 animate-fade-up-3 flex items-center gap-3 text-xs text-deep-400">
                <svg className="w-4 h-4 text-sonar-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Hand-picked by real readers, not algorithms</span>
              </div>
            </div>

            {/* Right: Featured Stack card (2 cols, desktop only) */}
            <div className="lg:col-span-2 hidden lg:block">
              <div className="opacity-0 animate-slide-in sticky top-24">
                <div className="bg-white rounded-2xl border border-deep-200 shadow-sm overflow-hidden featured-card">
                  <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-6 py-5">
                    <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur text-white text-[11px] font-semibold rounded-full mb-3">🔥 Featured Stack</span>
                    <h3 className="text-white font-bold text-lg leading-snug">Time Loop Essentials</h3>
                    <p className="text-white/80 text-sm mt-1">8 books · Updated Jan 2026</p>
                  </div>
                  <div className="divide-y divide-deep-100">
                    <Link href="/novel/purple-days" className="flex items-start gap-3 px-5 py-4 hover:bg-deep-50 transition-colors group">
                      <div className="w-9 h-12 rounded flex-shrink-0 shadow-sm overflow-hidden" style={{ backgroundImage: 'url(https://pub-f79c700d0ef04a2a86c49479eaa7b3a1.r2.dev/book-covers/01/purple-days.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-deep-900 truncate group-hover:text-sonar-700 transition-colors">Purple Days</p>
                        <p className="text-xs text-deep-400 mt-0.5">baurus · SpaceBattles</p>
                        <p className="text-xs text-deep-500 mt-1 line-clamp-1 italic">&quot;The redemption arc that GRRM never wrote.&quot;</p>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">COMPLETED</span>
                    </Link>
                    <Link href="/novel/the-perfect-run" className="flex items-start gap-3 px-5 py-4 hover:bg-deep-50 transition-colors group">
                      <div className="w-9 h-12 rounded flex-shrink-0 shadow-sm overflow-hidden" style={{ backgroundImage: 'url(https://pub-f79c700d0ef04a2a86c49479eaa7b3a1.r2.dev/book-covers/2026/the-perfect-run.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-deep-900 truncate group-hover:text-sonar-700 transition-colors">The Perfect Run</p>
                        <p className="text-xs text-deep-400 mt-0.5">Void Herald · Royal Road</p>
                        <p className="text-xs text-deep-500 mt-1 line-clamp-1 italic">&quot;Deadpool meets Groundhog Day.&quot;</p>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">COMPLETED</span>
                    </Link>
                    <Link href="/novel/the-years-of-apocalypse" className="flex items-start gap-3 px-5 py-4 hover:bg-deep-50 transition-colors group">
                      <div className="w-9 h-12 rounded flex-shrink-0 shadow-sm overflow-hidden" style={{ backgroundImage: 'url(https://pub-f79c700d0ef04a2a86c49479eaa7b3a1.r2.dev/book-covers/2026/the-years-of-apocalypse.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-deep-900 truncate group-hover:text-sonar-700 transition-colors">The Years of Apocalypse</p>
                        <p className="text-xs text-deep-400 mt-0.5">UraniumPhoenix · Royal Road</p>
                        <p className="text-xs text-deep-500 mt-1 line-clamp-1 italic">&quot;The true successor to Mother of Learning.&quot;</p>
                      </div>
                      <span className="text-[10px] font-medium text-sonar-500 bg-sonar-50 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">ONGOING</span>
                    </Link>
                  </div>
                  <div className="px-5 py-3.5 bg-deep-50 border-t border-deep-100">
                    <Link href="/stack/mother-of-learning-similar" className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-pink-500"></div>
                        <span className="text-xs font-medium text-deep-500">Curated by <strong className="text-deep-700">Zorian</strong></span>
                      </div>
                      <span className="text-xs font-semibold text-sonar-500 group-hover:underline">See all 8 →</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Compact featured stack */}
          <div className="lg:hidden mt-6">
            <Link href="/stack/mother-of-learning-similar" className="block bg-white rounded-2xl border border-deep-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-4 flex items-center justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur text-white text-[10px] font-semibold rounded-full mb-1.5">🔥 Featured</span>
                  <h3 className="text-white font-bold text-base">Time Loop Essentials</h3>
                  <p className="text-white/70 text-xs mt-0.5">8 books · by Zorian</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/80 flex-shrink-0" />
              </div>
              <div className="px-5 py-3 flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-10 rounded border-2 border-white shadow-sm overflow-hidden" style={{ backgroundImage: 'url(https://pub-f79c700d0ef04a2a86c49479eaa7b3a1.r2.dev/book-covers/01/purple-days.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  <div className="w-8 h-10 rounded border-2 border-white shadow-sm overflow-hidden" style={{ backgroundImage: 'url(https://pub-f79c700d0ef04a2a86c49479eaa7b3a1.r2.dev/book-covers/2026/the-perfect-run.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  <div className="w-8 h-10 rounded border-2 border-white shadow-sm overflow-hidden" style={{ backgroundImage: 'url(https://pub-f79c700d0ef04a2a86c49479eaa7b3a1.r2.dev/book-covers/2026/the-years-of-apocalypse.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                </div>
                <p className="text-xs text-deep-500 italic line-clamp-1">Purple Days · The Perfect Run · Years of Apocalypse…</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Module 1: Editor's Picks */}
        <section className="mb-36 sm:mb-44" id="editors-picks">
          {/* Title Area */}
          <div className="px-6 max-w-6xl mx-auto flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-deep-900 mb-2">Editor's Picks</h2>
              <p className="text-neutral-500 text-base">Hand-picked thematic collections updated weekly</p>
            </div>
            {/* Scroll Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => scrollEditorPicks('left')}
                className="p-2 rounded-lg border border-deep-200 hover:border-sonar-400 hover:bg-sonar-50 transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-deep-600" />
              </button>
              <button
                onClick={() => scrollEditorPicks('right')}
                className="p-2 rounded-lg border border-deep-200 hover:border-sonar-400 hover:bg-sonar-50 transition-all"
              >
                <ChevronRight className="w-5 h-5 text-deep-600" />
              </button>
            </div>
          </div>

          {/* Cards Container */}
          <div className="max-w-6xl mx-auto px-6 overflow-visible">
            <div className="editors-picks-container flex gap-5 -mx-6 sm:mx-0 pl-6 sm:pl-0 pr-6 sm:pr-0 overflow-x-auto overflow-y-visible hide-scrollbar snap-x snap-mandatory pt-4 pb-8" style={{ scrollPaddingLeft: '24px' }}>
              {Array.from({ length: 6 }).map((_, index) => {
                // Use modulo to cycle through available stacks if less than 6
                const list = stacks[index % stacks.length];
                // Card configurations
                const cardConfigs = [
                  {
                    tags: [
                      <span key="t1" className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-semibold rounded-full border border-amber-100">🔥 Trending</span>,
                      <span key="t1b" className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-full border border-slate-200">Time Loop</span>,
                    ],
                    bgGradient: 'from-blue-50/80 to-slate-50',
                    hoverBorder: 'hover:border-blue-200',
                    bookEmoji: ['📘', '📕', '📗'],
                    bookColors: ['from-blue-500 to-blue-700', 'from-indigo-500 to-indigo-700', 'from-violet-500 to-violet-700'],
                    quote: '"Protagonists who actually use their brains"',
                  },
                  {
                    tags: [
                      <span key="t2" className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[11px] font-semibold rounded-full border border-purple-100">LitRPG</span>,
                      <span key="t3" className="px-2.5 py-1 bg-rose-50 text-rose-700 text-[11px] font-semibold rounded-full border border-rose-100">Progression</span>
                    ],
                    bgGradient: 'from-purple-50/80 to-slate-50',
                    hoverBorder: 'hover:border-purple-200',
                    bookEmoji: ['⚔️', '🎮', '📊'],
                    bookColors: ['from-purple-500 to-purple-700', 'from-pink-500 to-pink-700', 'from-fuchsia-500 to-fuchsia-700'],
                    quote: '"Numbers go up, but the plot goes deeper"',
                  },
                  {
                    tags: [
                      <span key="t4" className="px-2.5 py-1 bg-rose-50 text-rose-700 text-[11px] font-semibold rounded-full border border-rose-100">💎 Hidden Gem</span>,
                      <span key="t5" className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-full border border-slate-200">Forum Fic</span>
                    ],
                    bgGradient: 'from-emerald-50/80 to-slate-50',
                    hoverBorder: 'hover:border-emerald-200',
                    bookEmoji: ['🏆', '💎', '🌟'],
                    bookColors: ['from-emerald-500 to-emerald-700', 'from-teal-500 to-teal-700', 'from-cyan-500 to-cyan-700'],
                    quote: '"Buried masterpieces you\'ll tell everyone about"',
                  },
                  {
                    tags: [
                      <span key="t6" className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-full border border-slate-200">🚀 Hard Sci-Fi</span>,
                      <span key="t7" className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-full border border-blue-100">Space</span>
                    ],
                    bgGradient: 'from-slate-100/80 to-slate-50',
                    hoverBorder: 'hover:border-slate-300',
                    bookEmoji: ['🛸', '🤖', '🌌'],
                    bookColors: ['from-slate-600 to-slate-800', 'from-slate-700 to-slate-900', 'from-zinc-600 to-zinc-800'],
                    quote: '"Real physics, real stakes, no magical tech"',
                  },
                  {
                    tags: [
                      <span key="t8" className="px-2.5 py-1 bg-red-50 text-red-700 text-[11px] font-semibold rounded-full border border-red-100">🐉 Cultivation</span>,
                      <span key="t9" className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-semibold rounded-full border border-amber-100">Xianxia</span>,
                    ],
                    bgGradient: 'from-red-50/80 to-amber-50/50',
                    hoverBorder: 'hover:border-red-200',
                    bookEmoji: ['🐉', '⛩️', '🗡️'],
                    bookColors: ['from-red-500 to-red-700', 'from-amber-500 to-amber-700', 'from-orange-500 to-orange-700'],
                    quote: '"Ascend without the cringe"',
                  },
                  {
                    tags: [
                      <span key="t10" className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-semibold rounded-full border border-indigo-100">🚪 Isekai</span>,
                      <span key="t11" className="px-2.5 py-1 bg-violet-50 text-violet-700 text-[11px] font-semibold rounded-full border border-violet-100">Portal</span>,
                    ],
                    bgGradient: 'from-indigo-50/80 to-slate-50',
                    hoverBorder: 'hover:border-indigo-200',
                    bookEmoji: ['🗝️', '🌌', '🏰'],
                    bookColors: ['from-indigo-500 to-indigo-700', 'from-violet-500 to-violet-700', 'from-purple-500 to-purple-700'],
                    quote: '"Ordinary people in extraordinary worlds"',
                  },
                ];

                const config = cardConfigs[index] || cardConfigs[0];
                const pickNovels = [...list.entries]
                  .sort((a, b) => a.order - b.order)
                  .map((entry) => novelsById.get(entry.novelId))
                  .filter((novel): novel is Novel => Boolean(novel))
                  .slice(0, 3);

                const renderBook = (novel: Novel | undefined, fallbackIndex: number) => {
                  const fallbackColor = config.bookColors[fallbackIndex];
                  const fallbackEmoji = config.bookEmoji[fallbackIndex];
                  if (!novel) {
                    return (
                      <div key={`fallback-${fallbackIndex}`} className={`book bg-gradient-to-br ${fallbackColor}`}>
                        {fallbackEmoji}
                      </div>
                    );
                  }

                  const hasImage = Boolean(novel.coverImage);
                  const gradient = novel.coverGradient || fallbackColor;
                  return (
                    <div
                      key={novel.id}
                      className={`book ${!hasImage ? `bg-gradient-to-br ${gradient}` : ''}`}
                      style={
                        hasImage
                          ? {
                            backgroundImage: `url(${novel.coverImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                          : undefined
                      }
                    >
                      {!hasImage ? fallbackEmoji : null}
                    </div>
                  );
                };

                return (
                  <article key={list.id} className="group card card-hover card-lift flex-none w-[290px] sm:w-[310px] snap-start overflow-visible">
                    <Link href={`/stack/${list.id}`} className="block h-full">
                      <div className="h-full rounded-2xl overflow-hidden">
                        {/* Tags */}
                        <div className="px-5 pt-4 pb-2">
                          <div className="flex flex-wrap gap-1.5">
                            {config.tags}
                          </div>
                        </div>

                        {/* Book Stack */}
                        <div className={`px-5 py-8 bg-gradient-to-br ${config.bgGradient}`}>
                          <div className="book-stack mb-4">
                            {renderBook(pickNovels[0], 0)}
                            {renderBook(pickNovels[1], 1)}
                            {renderBook(pickNovels[2], 2)}
                          </div>
                          <p className="text-center text-deep-600 text-sm italic font-medium min-h-[40px] flex items-center justify-center">{config.quote}</p>
                        </div>

                        {/* Card Footer */}
                        <div className="px-5 py-5 border-t border-deep-100">
                          <h3 className="font-bold text-deep-900 text-base mb-1 truncate">{list.title}</h3>
                          <p className="text-sm text-deep-500 mb-3 truncate">{list.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500"></div>
                              <span className="text-sm font-medium text-deep-700">Zorian</span>
                            </div>
                            <span className="text-sm text-deep-400">{list.entries.length} books</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Module 2: Browse by Theme */}
        <section className="px-6 max-w-6xl mx-auto mb-36 sm:mb-44" id="browse-themes">
          <div className="flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-deep-900 mb-2">Browse by Theme</h2>
              <p className="text-neutral-500 text-base">Discover stories through curated tags</p>
            </div>
            <Link
              href="#"
              className="text-sm font-medium text-sonar-500 hover:text-cyan-700 flex items-center gap-1"
            >
              View all tags <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_THEMES.map((theme) => (
              <Link
                key={theme.id}
                href={`/theme/${theme.id}`}
                className={`group p-5 rounded-2xl bg-white border border-deep-200 hover:bg-slate-50 hover:border-deep-300 transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${theme.color} flex items-center justify-center font-bold text-sm`}>
                    {theme.icon}
                  </div>
                  <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-cyan-500 transition-colors" />
                </div>
                <h3 className="font-semibold text-deep-900 text-base">{theme.name}</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {Math.floor(Math.random() * 100 + 40)} books
                </p>
              </Link>
            ))}

            {/* All Tags Link */}
            <Link
              href="#"
              className="p-5 rounded-2xl bg-deep-50 border border-deep-200 hover:bg-deep-100 hover:border-deep-300 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[120px]"
            >
              <svg className="w-6 h-6 text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium text-deep-600">All Tags</span>
            </Link>
          </div>
        </section>

        {/* Module 3: Platform Spotlight */}
        <section className="px-6 max-w-6xl mx-auto mb-36 sm:mb-44">
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-sonar-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-sonar-500 uppercase tracking-wider">Platform Spotlight</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-deep-900 mb-2">Content from Multiple Sources</h2>
            <p className="text-neutral-500 text-base">Aggregated from Royal Road, SpaceBattles, and beyond</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <Link
                key={platform.id}
                href={`/platform/${platform.id}`}
                className="group p-6 bg-white rounded-2xl border border-deep-200 hover:bg-slate-50 hover:border-deep-300 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center text-white font-bold shadow-sm group-hover:shadow-md transition-all group-hover:scale-105`}>
                    {platform.shortName}
                  </div>
                </div>
                <h3 className={`font-bold text-lg text-deep-900 mb-2 group-hover:${platform.id === 'royal-road' ? 'text-orange-600' : platform.id === 'spacebattles' ? 'text-blue-600' : 'text-emerald-600'} transition-colors`}>
                  {platform.name}
                </h3>
                <p className="text-sm text-neutral-500 mb-4 leading-relaxed">{platform.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-deep-100">
                  <span className="text-xs font-medium text-neutral-400">{platform.count} books indexed</span>
                  <span className="text-xs font-medium text-sonar-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Module 4: Newsletter */}
        <section className="px-6 max-w-xl mx-auto text-center mb-2 sm:mb-4">
          <div className="w-12 h-12 rounded-2xl bg-sonar-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-sonar-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-deep-900 mb-2">Sonar Signals</h2>
          <p className="text-neutral-500 mb-6 text-base">
            Get hand-picked reading lists when we find something exceptional. No spam, unsubscribe anytime.
          </p>
          <form className="flex flex-col sm:flex-row justify-center gap-3 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 bg-white border border-deep-200 rounded-full text-deep-900 placeholder:text-neutral-400 focus:outline-none focus:border-sonar-300"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-deep-900 text-white rounded-full font-medium hover:bg-deep-800 transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-neutral-400">Be an early signal detector</p>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
