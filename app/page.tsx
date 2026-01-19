'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Stack, PLATFORM_INFO, THEME_INFO, Theme } from '@/types/types';
import stacksData from '@/MVP/stacks.json';
import Footer from './components/Footer';

// 从 JSON 导入数据
const stacks = stacksData.stacks.filter((s) => s.isEditorPick);

// 主题标签列表（包含 id 和 name）
const themes = (Object.entries(THEME_INFO) as [Theme, { name: string; icon: string }][]).map(([id, info]) => ({
  id,
  name: info.name,
}));

// 平台列表配置（集中管理，方便添加新平台）
const FEATURED_PLATFORMS = [
  'royal-road',
  'spacebattles',
  'sufficient-velocity',
] as const;

// 平台描述配置
const PLATFORM_DESCRIPTIONS: Record<string, string> = {
  'royal-road': 'Progression fantasy, LitRPG, and serial fiction.',
  'spacebattles': 'Forum legends, quests, and hard sci-fi epics.',
  'sufficient-velocity': 'Quests, original fiction, and deep discussions.',
  'scribble-hub': 'Female-focused and Japanese-style fiction.',
  'ao3': 'Fan fiction and transformative works.',
  'personal-site': 'Author-hosted independent sites.',
};

// 从配置生成平台列表
const platforms = FEATURED_PLATFORMS.map(id => {
  const info = PLATFORM_INFO[id];
  // 为每个平台设置定制颜色
  const platformColors: Record<string, string> = {
    'royal-road': 'bg-amber-400 text-white',
    'spacebattles': 'bg-slate-800 text-white',
    'sufficient-velocity': 'bg-sky-900 text-white',
  };

  return {
    id,
    name: `Best of ${info.name}`,
    description: PLATFORM_DESCRIPTIONS[id] || '',
    color: platformColors[id] || info.color,
  };
});

export default function HomePage() {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-6">
        {/* Hero Section */}
        <section className="pt-16 pb-16">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 tracking-tight">
            Find the signal in the noise
          </h1>
          <p className="mt-6 text-2xl text-gray-500">
            Curated stacks across Royal Road, SpaceBattles & more.
          </p>
          <button
            onClick={() => {
              const element = document.getElementById('editors-picks');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mt-8 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            Explore Editor's Picks <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* Module 1: Editor's Picks */}
        <section className="pb-32" id="editors-picks">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Editor's Picks</h2>
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              See all <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stacks.map((list) => (
              <a
                key={list.id}
                href={`/stack/${list.id}`}
                className="group block"
              >
                <article className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 cursor-pointer h-full">
                  {/* Gradient Cover */}
                  <div className={`h-52 bg-gradient-to-br ${list.coverGradient}`} />

                  {/* Content */}
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="font-semibold text-gray-900 leading-snug mb-2 group-hover:text-gray-700">
                      {list.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
                      {list.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {list.entries.length} picks · {list.platforms.map((platform) => {
                          const info = PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO];
                          return info.shortName;
                        }).join(' · ')}
                      </span>
                      <span className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                        Open List <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </article>
              </a>
            ))}
          </div>
        </section>

        {/* Module 2: Browse by Theme */}
        <section className="pb-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by Theme</h2>

          <div className="flex flex-wrap gap-4">
            {themes.map((theme) => (
              <Link
                key={theme.id}
                href={`/theme/${theme.id}`}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all cursor-pointer"
              >
                {theme.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Module 3: Platform Spotlight */}
        <section className="pb-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Beyond One Platform</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="flex flex-col p-8 bg-white border border-gray-200 rounded-2xl hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className={`w-10 h-10 ${platform.color} rounded-xl flex items-center justify-center mb-4`}>
                  <span className="text-sm font-bold">{PLATFORM_INFO[platform.id as keyof typeof PLATFORM_INFO].shortName}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{platform.name}</h3>
                <p className="text-sm text-gray-500 mb-4 flex-grow">{platform.description}</p>
                <Link
                  href={`/platform/${platform.id}`}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors text-center"
                >
                  Explore
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Module 4: Newsletter */}
        <section className="pb-32">
          <div className="p-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Still in a book slump?
            </h2>
            <p className="text-gray-500 mb-6">
              Get curated lists delivered to your inbox. No spam.
            </p>

            <div className="max-w-sm mx-auto space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
              />
              <button className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors">
                Subscribe
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Unsubscribe anytime.
            </p>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}
