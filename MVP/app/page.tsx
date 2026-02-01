'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { Stack, PLATFORM_INFO, THEME_INFO, Theme } from '@/types/types';
import stacksData from '@/src/data/stacks.json';
import Footer from './components/Footer';

// 从 JSON 导入数据
const stacks = stacksData.stacks.filter((s) => s.isEditorPick);

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
  { id: 'dungeon' as Theme, name: 'Dungeon Crawler', icon: 'DC', color: 'bg-sonar-50 text-sonar-600', hoverBorder: 'hover:border-sonar-300' },
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
        {/* Hero Section */}
        <section className="relative px-5 sm:px-6 max-w-6xl mx-auto mb-24 sm:mb-30 overflow-hidden">
          {/* Background Sonar Animation */}
          <div className="absolute inset-0 items-center justify-center pointer-events-none opacity-20 -z-10 hidden lg:flex" style={{ left: '55%' }}>
            <div className="absolute w-[300px] h-[300px] rounded-full border-2 border-sonar-400/60 animate-sonar-ring"></div>
            <div className="absolute w-[300px] h-[300px] rounded-full border-2 border-sonar-300/50 animate-sonar-ring-delay-1"></div>
            <div className="absolute w-[300px] h-[300px] rounded-full border-2 border-cyan-200/40 animate-sonar-ring-delay-2"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[550px] lg:min-h-[620px]">
            {/* Left Column - Text Content */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left z-10">
              {/* Stats Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sonar-50 border border-cyan-200 text-cyan-700 text-sm font-medium mb-5 sm:mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-amber-400"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
                Hundreds of books and counting
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter text-deep-900 leading-[1.1] mb-5 sm:mb-6">
                Find the signal
                <br />
                <span className="text-cyan-600">in the noise</span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg lg:text-xl text-neutral-500 max-w-md lg:max-w-xl leading-relaxed mb-8 sm:mb-10">
                Find quality stories across Royal Road, SpaceBattles, and more+
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    const element = document.getElementById('editors-picks');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 sm:px-8 py-3 sm:py-3.5 bg-deep-900 text-white rounded-xl font-medium shadow-lg text-sm sm:text-base"
                >
                  Browse Stacks
                </button>
                <button
                  onClick={() => {
                    const element = document.getElementById('browse-themes');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 sm:px-6 py-3 sm:py-3.5 bg-white/80 backdrop-blur text-deep-700 border border-deep-200 rounded-xl font-medium text-sm sm:text-base"
                >
                  Explore
                </button>
              </div>
            </div>

            {/* Right Column - Desktop Book Stack */}
            <div className="relative h-[400px] lg:h-[500px] hidden lg:flex items-center justify-center z-10">
              {/* Sonar Ring Animation */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <div className="absolute w-[220px] h-[220px] rounded-full border-2 border-sonar-400/60 animate-sonar-ring"></div>
                <div className="absolute w-[220px] h-[220px] rounded-full border-2 border-sonar-300/50 animate-sonar-ring-delay-1"></div>
                <div className="absolute w-[220px] h-[220px] rounded-full border-2 border-cyan-200/40 animate-sonar-ring-delay-2"></div>
                <div className="absolute w-[280px] h-[280px] rounded-full border border-deep-200/30"></div>
              </div>

              {/* Floating Dots */}
              <div className="absolute top-16 right-20 w-2 h-2 rounded-full bg-cyan-300 animate-float"></div>
              <div className="absolute top-24 right-12 w-1.5 h-1.5 rounded-full bg-neutral-300 animate-float" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-32 left-16 w-2 h-2 rounded-full bg-rose-300 animate-float" style={{ animationDelay: '2s' }}></div>

              {/* Book Stack */}
              <div className="stack-container relative w-[300px] h-[240px] flex items-center justify-center cursor-pointer animate-float z-10" style={{ animationDelay: '0.5s', animationDuration: '6s' }}>
                {/* Book 1 */}
                <div className="stack-book book-1 bg-gradient-to-br from-blue-500 to-indigo-600">
                  <div className="mt-auto">
                    <div className="flex gap-1 mb-1.5">
                      <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-medium rounded-full">Time Loop</span>
                    </div>
                    <p className="text-white text-xs font-semibold leading-tight">Like Mother of Learning</p>
                    <p className="text-white/70 text-[10px] mt-1">12 books</p>
                  </div>
                </div>

                {/* Book 2 */}
                <div className="stack-book book-2 bg-gradient-to-br from-purple-500 to-pink-600" style={{ width: '160px', height: '200px' }}>
                  <div className="mt-auto">
                    <div className="flex gap-1 mb-1.5">
                      <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-medium rounded-full">🔥 Trending</span>
                    </div>
                    <p className="text-white text-sm font-bold leading-tight">Like He Who Fights With Monsters</p>
                    <p className="text-white/70 text-[11px] mt-1">8 books · LitRPG</p>
                  </div>
                </div>

                {/* Book 3 */}
                <div className="stack-book book-3 bg-gradient-to-br from-emerald-500 to-teal-600">
                  <div className="mt-auto">
                    <div className="flex gap-1 mb-1.5">
                      <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-medium rounded-full">💎 Gems</span>
                    </div>
                    <p className="text-white text-xs font-semibold leading-tight">Hidden Forum Gems</p>
                    <p className="text-white/70 text-[10px] mt-1">15 books</p>
                  </div>
                </div>
              </div>

              {/* Human Curated Badge */}
              <div className="absolute -top-2 right-0 z-30 animate-float-delayed">
                <div className="bg-white rounded-xl px-3 py-2 shadow-sm border border-deep-100/80 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-sonar-50 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-sonar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium">Quality</p>
                    <p className="text-xs font-bold text-deep-900">Human Curated</p>
                  </div>
                </div>
              </div>

              {/* Ping Badge */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-sm border border-white/60 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span className="text-[11px] text-sonar-600 font-medium">Ping received...</span>
                </div>
              </div>
            </div>

            {/* Mobile Book Fan */}
            <div className="flex lg:hidden justify-center -mt-4 mb-6">
              <div className="mobile-fan-container relative w-[280px] h-[180px] flex items-center justify-center">
                <div className="m-book m-book-left bg-gradient-to-br from-blue-500 to-indigo-600">📘</div>
                <div className="m-book m-book-center bg-gradient-to-br from-purple-500 to-pink-600">⚔️</div>
                <div className="m-book m-book-right bg-gradient-to-br from-emerald-500 to-teal-600">💎</div>
              </div>
            </div>
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
            <div className="editors-picks-container flex gap-5 -mx-6 sm:mx-0 pl-6 sm:pl-0 pr-6 sm:pr-0 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-8" style={{ scrollPaddingLeft: '24px' }}>
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
                            <div className={`book bg-gradient-to-br ${config.bookColors[0]}`}>{config.bookEmoji[0]}</div>
                            <div className={`book bg-gradient-to-br ${config.bookColors[1]}`}>{config.bookEmoji[1]}</div>
                            <div className={`book bg-gradient-to-br ${config.bookColors[2]}`}>{config.bookEmoji[2]}</div>
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
                              <span className="text-sm font-medium text-deep-700">Sarah Chen</span>
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
              className="text-sm font-medium text-sonar-600 hover:text-cyan-700 flex items-center gap-1"
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
              <div className="w-1.5 h-1.5 rounded-full bg-sonar-600 animate-pulse"></div>
              <span className="text-xs font-semibold text-sonar-600 uppercase tracking-wider">Platform Spotlight</span>
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
                  <span className="text-xs font-medium text-sonar-600 opacity-0 group-hover:opacity-100 transition-opacity">
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
            <Mail className="w-6 h-6 text-sonar-600" />
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
