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
  { id: 'time-loop' as Theme, name: 'Time Loop', icon: 'TL', color: 'bg-slate-100 text-slate-700', hoverBorder: 'hover:border-slate-400' },
  { id: 'isekai' as Theme, name: 'Isekai & Portal', icon: 'IS', color: 'bg-purple-50 text-purple-600', hoverBorder: 'hover:border-purple-300' },
  { id: 'hard-sci-fi' as Theme, name: 'Hard Sci-Fi', icon: 'SF', color: 'bg-amber-50 text-amber-600', hoverBorder: 'hover:border-amber-300' },
  { id: 'dungeon' as Theme, name: 'Dungeon Crawler', icon: 'DC', color: 'bg-cyan-50 text-cyan-600', hoverBorder: 'hover:border-cyan-300' },
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
    'spacebattles': 'bg-slate-800 text-white',
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
    const container = document.querySelector('.editors-picks-container');
    if (!container) return;

    const cardWidth = 310; // 卡片宽度
    const gap = 24; // gap-6
    const scrollAmount = cardWidth + gap;

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased scroll-smooth">
      <main className="pt-24 pb-32">
        {/* Hero Section */}
        <section className="relative px-6 max-w-6xl mx-auto mb-32 sm:mb-40 overflow-hidden">
          {/* Background Sonar Animation */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 -z-10">
            <div className="absolute w-[600px] h-[600px] rounded-full border border-cyan-200 animate-sonar-ping"></div>
            <div className="absolute w-[450px] h-[450px] rounded-full border border-cyan-300/50 animate-sonar-ping" style={{ animationDelay: '1s' }}></div>
            <div className="absolute w-[300px] h-[300px] rounded-full border border-cyan-200"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[600px] lg:min-h-[720px] pt-4 sm:pt-6 pb-16">
            {/* Left Column - Text Content */}
            <div className="flex flex-col items-start text-left z-10 relative">
              {/* Stats Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-amber-400"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
                1,247 books discovered and counting
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-950 leading-[1.1] mb-6">
                Find the signal
                <br />
                <span className="text-cyan-600">in the noise</span>
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl text-neutral-500 max-w-xl leading-relaxed mb-12">
                Human-curated reading lists replace algorithmic feeds, helping you find quality stories across Royal Road, SpaceBattles, and more.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <button
                  onClick={() => {
                    const element = document.getElementById('editors-picks');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                >
                  Browse Stacks
                </button>
                <button
                  onClick={() => {
                    const element = document.getElementById('browse-themes');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-3.5 bg-white/80 backdrop-blur text-slate-700 border border-slate-200 rounded-xl font-medium hover:border-cyan-300 hover:bg-white transition-all"
                >
                  Explore Themes
                </button>
              </div>

              {/* Platform Indicators */}
              <div className="flex items-center gap-3 text-sm text-neutral-500">
                <div className="flex items-center flex-shrink-0">
                  <span className="w-8 h-8 bg-slate-200 text-slate-600 rounded-full font-semibold text-xs flex items-center justify-center z-[8]">
                    RR
                  </span>
                  <span className="w-8 h-8 bg-slate-300 text-slate-700 rounded-full font-semibold text-xs flex items-center justify-center -ml-2 z-[9]">
                    SB
                  </span>
                  <span className="w-8 h-8 bg-slate-100 text-slate-400 rounded-full font-medium text-xs flex items-center justify-center -ml-2 z-[10]">
                    +
                  </span>
                </div>
                <span className="whitespace-nowrap">
                  Find stories — across Royal Road, SpaceBattles, + more platforms
                </span>
              </div>
            </div>

            {/* Right Column - Floating Cards (Desktop Only) */}
            <div className="relative h-[580px] hidden lg:flex items-center justify-center z-10">
              {/* Sonar Ring Animation */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <div className="absolute w-[220px] h-[220px] rounded-full border-2 border-cyan-400/60 animate-sonar-ring"></div>
                <div className="absolute w-[220px] h-[220px] rounded-full border-2 border-cyan-300/50 animate-sonar-ring-delay-1"></div>
                <div className="absolute w-[220px] h-[220px] rounded-full border-2 border-cyan-200/40 animate-sonar-ring-delay-2"></div>
                <div className="absolute w-[280px] h-[280px] rounded-full border border-slate-200/30"></div>
              </div>

              {/* Floating Dots */}
              <div className="absolute top-16 right-20 w-2 h-2 rounded-full bg-cyan-300 animate-float"></div>
              <div className="absolute top-24 right-12 w-1.5 h-1.5 rounded-full bg-neutral-300 animate-float" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
              <div className="absolute bottom-32 left-16 w-2 h-2 rounded-full bg-rose-300 animate-float" style={{ animationDelay: '2s', animationDuration: '6s' }}></div>

              {/* Main Card */}
              <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/80 py-5 pl-6 pr-5 w-72 z-20 animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">Trending</span>
                  <button className="text-neutral-300 hover:text-neutral-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">The Last Angel</h3>
                <p className="text-sm text-neutral-500 leading-relaxed mb-4 line-clamp-2">
                  A sentient AI warship seeks vengeance against humanity's enemies in this epic military sci-fi saga.
                </p>
                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-slate-700 rounded-full"></span>
                    SpaceBattles
                  </span>
                  <span>•</span>
                  <span>Hard Sci-Fi</span>
                </div>
              </div>

              {/* Curator Badge */}
              <div className="absolute -top-4 right-0 z-30 animate-float">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-xl shadow-slate-200/30 border border-slate-100 flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Curated by</p>
                    <p className="text-sm font-bold text-slate-900">Editor's Pick</p>
                  </div>
                </div>
              </div>

              {/* Followers Badge */}
              <div className="absolute bottom-24 right-12 z-20 animate-float" style={{ animationDelay: '2.5s', animationDuration: '8s' }}>
                <div className="bg-white/90 backdrop-blur rounded-full px-3 py-1.5 shadow-lg border border-white/80 flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 border-2 border-white"></div>
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 border-2 border-white"></div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600">+12</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Module 1: Editor's Picks */}
        <section className="mb-48 sm:mb-56" id="editors-picks">
          <div className="px-6 max-w-6xl mx-auto flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Editor's Picks</h2>
              <p className="text-neutral-500 text-base">Hand-picked thematic collections updated weekly</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scrollEditorPicks('left')}
                className="p-2 rounded-lg border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={() => scrollEditorPicks('right')}
                className="p-2 rounded-lg border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6">
            <div className="editors-picks-container flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-8 pt-2 -mb-4">
              {stacks.map((list) => (
                <article key={list.id} className="group flex-none w-[310px] snap-start h-[400px]">
                  <Link href={`/stack/${list.id}`} className="block h-full">
                    <div className="relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      {/* Gradient Cover */}
                      <div className={`h-44 sm:h-52 bg-gradient-to-br ${list.coverGradient} relative overflow-hidden`}>
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-white/90 text-slate-700 text-xs font-semibold rounded-full shadow-sm">
                            {list.entries.length} books
                          </span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-4xl font-bold text-slate-200/60 select-none text-center px-4 leading-tight max-w-[200px]">
                            {list.coverTitle ? list.coverTitle.split('\n').map((line, i) => (
                              <div key={i}>{line}</div>
                            )) : list.title}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-5 flex flex-col flex-grow">
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{list.title}</h3>
                        <p className="text-sm text-neutral-500 line-clamp-2 mb-auto">{list.description}</p>
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-200"></div>
                            <span className="text-sm text-slate-600">Sarah Chen</span>
                          </div>
                          <span className="text-xs text-neutral-400">2 days ago</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Module 2: Browse by Theme */}
        <section className="px-6 max-w-6xl mx-auto mb-48 sm:mb-56" id="browse-themes">
          <div className="flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Browse by Theme</h2>
              <p className="text-neutral-500 text-base">Discover stories through curated tags</p>
            </div>
            <Link
              href="#"
              className="text-sm font-medium text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              View all tags <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_THEMES.map((theme) => (
              <Link
                key={theme.id}
                href={`/theme/${theme.id}`}
                className={`group p-5 rounded-2xl bg-white border border-slate-200 ${theme.hoverBorder} hover:shadow-md transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${theme.color} flex items-center justify-center font-bold text-sm`}>
                    {theme.icon}
                  </div>
                  <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-cyan-500 transition-colors" />
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{theme.name}</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {Math.floor(Math.random() * 100 + 40)} books
                </p>
              </Link>
            ))}

            {/* All Tags Link */}
            <Link
              href="#"
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[120px]"
            >
              <svg className="w-6 h-6 text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium text-slate-600">All Tags</span>
            </Link>
          </div>
        </section>

        {/* Module 3: Platform Spotlight */}
        <section className="px-6 max-w-6xl mx-auto mb-48 sm:mb-56">
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-pulse"></div>
              <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">Platform Spotlight</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Content from Multiple Sources</h2>
            <p className="text-neutral-500 text-base">Aggregated from Royal Road, SpaceBattles, and beyond</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <Link
                key={platform.id}
                href={`/platform/${platform.id}`}
                className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center text-white font-bold shadow-sm group-hover:shadow-md transition-all group-hover:scale-105`}>
                    {platform.shortName}
                  </div>
                  <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-neutral-400 transition-colors" />
                </div>
                <h3 className={`font-bold text-lg text-slate-900 mb-2 group-hover:${platform.id === 'royal-road' ? 'text-orange-600' : platform.id === 'spacebattles' ? 'text-blue-600' : 'text-emerald-600'} transition-colors`}>
                  {platform.name}
                </h3>
                <p className="text-sm text-neutral-500 mb-4 leading-relaxed">{platform.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs font-medium text-neutral-400">{platform.count} books indexed</span>
                  <span className="text-xs font-medium text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Module 4: Newsletter */}
        <section className="px-6 max-w-xl mx-auto text-center mb-16 sm:mb-20">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-cyan-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Sonar Signals</h2>
          <p className="text-neutral-500 mb-6 text-base">
            Get hand-picked reading lists when we find something exceptional. No spam, unsubscribe anytime.
          </p>
          <form className="flex flex-col sm:flex-row justify-center gap-3 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-full text-slate-900 placeholder:text-neutral-400 focus:outline-none focus:border-cyan-300"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors"
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
