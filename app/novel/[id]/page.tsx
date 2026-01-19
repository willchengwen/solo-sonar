'use client';

import { useState, use } from 'react';
import { ArrowRight } from 'lucide-react';
import novelsData from '@/MVP/novels.json';

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
  editorNote: string;
  bestFor: string[];
  themes: string[];
}

// 书单接口
interface Stack {
  id: string;
  title: string;
  picks: number;
  gradient: string;
}

// MVP Novel 接口（匹配 MVP/novels.json）
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
  chapterCount?: number;
  startedAt?: string;
  completedAt?: string;
  coverGradient?: string;
  stackCount: number;
  savedCount: number;
  editorNote?: string;
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

// 主题映射
const THEME_DISPLAY: Record<string, string> = {
  'time-loop': 'Time Loop',
  'progression': 'Progression',
  'litrpg': 'LitRPG',
  'rational': 'Rational',
  'kingdom-building': 'Kingdom Building',
  'dungeon-core': 'Dungeon Core',
  'slice-of-life': 'Slice of Life',
  'sci-fi': 'Sci-Fi',
  'cultivation': 'Cultivation',
  'isekai': 'Isekai',
  'portal-fantasy': 'Portal Fantasy',
  'base-building': 'Base Building',
  'completed': 'Completed',
  'comedy': 'Comedy',
  'superhero': 'Superhero'
};

// 将 MVP 数据转换为页面格式
function convertMVPToNovel(mvpNovel: MVPNovel): Novel {
  const canonicalLink = mvpNovel.links.find(link => link.isCanonical) || mvpNovel.links[0];

  return {
    id: mvpNovel.id,
    title: mvpNovel.title,
    author: mvpNovel.author,
    platform: mapPlatform(canonicalLink.platform),
    status: mvpNovel.status === 'completed' ? 'Completed' : 'Ongoing',
    chapters: mvpNovel.chapterCount || 0,
    words: formatWordCount(mvpNovel.wordCount),
    updated: formatDate(mvpNovel.completedAt || mvpNovel.startedAt),
    gradient: mvpNovel.coverGradient || 'from-gray-200 to-gray-100',
    synopsis: mvpNovel.synopsis,
    editorNote: mvpNovel.editorNote || `A ${mvpNovel.themes.map(t => THEME_DISPLAY[t] || t).join(', ')} story with ${mvpNovel.stackCount} stack listings.`,
    bestFor: mvpNovel.themes.slice(0, 4).map(t => THEME_DISPLAY[t] || t),
    themes: [...mvpNovel.themes, mvpNovel.status === 'completed' ? 'Completed' : 'Ongoing', 'Fantasy']
  };
}

// 硬编码的相关书单（暂时保留，未来可以从 stacks.json 动态获取）
const getStacksForNovel = (novelId: string): Stack[] => {
  const allStacks: Record<string, Stack[]> = {
    'mother-of-learning': [
      {
        id: 'time-loop-masters',
        title: 'Time Loop Masters',
        picks: 8,
        gradient: 'from-gray-200 to-gray-100'
      },
      {
        id: 'magic-school-stories',
        title: 'Magic School Done Right',
        picks: 12,
        gradient: 'from-gray-200 to-gray-100'
      },
      {
        id: 'rational-fiction-essentials',
        title: 'Rational Fiction Essentials',
        picks: 15,
        gradient: 'from-gray-200 to-gray-100'
      },
      {
        id: 'completed-bingeable',
        title: 'Completed & Bingeable',
        picks: 20,
        gradient: 'from-gray-200 to-gray-100'
      }
    ]
  };

  return allStacks[novelId] || [
    {
      id: 'rational-fiction-essentials',
      title: 'Rational Fiction Essentials',
      picks: 15,
      gradient: 'from-gray-200 to-gray-100'
    },
    {
      id: 'completed-bingeable',
      title: 'Completed & Bingeable',
      picks: 20,
      gradient: 'from-gray-200 to-gray-100'
    }
  ];
};

// 获取相似推荐
const getSimilarNovels = (currentNovelId: string, currentThemes: string[]) => {
  const allNovels = novelsData.novels as MVPNovel[];

  // 简单的相似度算法：匹配主题数量
  const similar = allNovels
    .filter(novel => novel.id !== currentNovelId)
    .map(novel => ({
      id: novel.id,
      title: novel.title,
      platform: mapPlatform(novel.links.find(l => l.isCanonical)?.platform || 'royal-road'),
      gradient: novel.coverGradient || 'from-gray-200 to-gray-100',
      matchCount: novel.themes.filter(theme => currentThemes.includes(theme)).length
    }))
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 4);

  return similar;
};

// 相似推荐接口
interface SimilarNovel {
  id: string;
  title: string;
  platform: Platform;
  gradient: string;
}

// 平台配置
const PLATFORM_CONFIG: Record<Platform, { name: string; bgColor: string }> = {
  'RR': { name: 'Royal Road', bgColor: 'bg-amber-50' },
  'SB': { name: 'SpaceBattles', bgColor: 'bg-orange-50' },
  'SV': { name: 'Sufficient Velocity', bgColor: 'bg-gray-50' },
  'Site': { name: 'Author Site', bgColor: 'bg-emerald-50' },
};

export default function NovelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [email, setEmail] = useState('');
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);

  // 根据 ID 从 MVP 数据中查找小说
  const mvpNovel = (novelsData.novels as MVPNovel[]).find(novel => novel.id === id);

  // 如果找不到小说，显示 404
  if (!mvpNovel) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Novel Not Found</h1>
          <p className="text-gray-600 mb-8">The novel you're looking for doesn't exist.</p>
          <a href="/" className="text-[#3B82F6] hover:underline">Return to Home</a>
        </div>
      </div>
    );
  }

  // 转换数据格式
  const novelData = convertMVPToNovel(mvpNovel);
  const stacks = getStacksForNovel(id);
  const similarNovels = getSimilarNovels(id, mvpNovel.themes) as SimilarNovel[];

  // 获取主链接
  const canonicalLink = mvpNovel.links.find(link => link.isCanonical) || mvpNovel.links[0];

  const synopsis = novelData.synopsis;
  // 始终显示展开/收起按钮
  const displaySynopsis = synopsis;

  const displayedThemes = showAllThemes ? novelData.themes : novelData.themes.slice(0, 5);
  const remainingThemesCount = novelData.themes.length - 5;

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-6">
        {/* Main Content Layout */}
        <div className="flex flex-col md:flex-row gap-12 pt-12 pb-16">
          {/* 左侧封面区域 - Sticky 固定 */}
          <div className="w-full md:w-[256px] shrink-0">
            <div className="md:sticky md:top-24">
              {/* 封面图 */}
              <div className={`w-full aspect-[2/3] bg-gradient-to-br ${novelData.gradient} rounded-md`}/>

              {/* 操作区域 - 居中对齐 */}
              <div className="mt-6 flex flex-col items-center">
                {/* 外链按钮 */}
                <a
                  href={canonicalLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-50 text-gray-700 text-sm font-medium rounded-lg py-3 hover:bg-blue-100 transition text-center whitespace-nowrap"
                >
                  Open on {PLATFORM_CONFIG[novelData.platform].name} ↗
                </a>

                {/* 来源提示 */}
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Available on {PLATFORM_CONFIG[novelData.platform].name}
                </p>

                {/* 复制链接按钮 */}
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="text-xs text-gray-500 hover:text-gray-800 mt-3 transition text-center"
                >
                  Copy link
                </button>
              </div>
            </div>
          </div>

          {/* 右侧内容区域 - 所有信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              {/* 标题 */}
              <h1 className="text-4xl font-bold text-gray-900 mb-0">
                {novelData.title}
              </h1>

              {/* Meta Row 1: 作者 · 平台 · 状态 */}
              <div className="text-sm text-gray-700 mt-2">
                by <span className="text-gray-700 font-medium">{novelData.author}</span>
                {" · "}
                {PLATFORM_CONFIG[novelData.platform].name}
                {" · "}
                <span className={novelData.status === 'Completed' ? 'text-gray-500 font-medium' : 'text-amber-600 font-medium'}>
                  {novelData.status === 'Completed' ? 'Completed' : 'Ongoing'}
                </span>
              </div>

              {/* Meta Row 2: 统计信息 */}
              <div className="text-sm text-gray-500">
                <span>{novelData.chapters} chapters</span>
                {" · "}
                <span>{novelData.words} words</span>
                {" · "}
                <span>Updated {novelData.updated}</span>
              </div>

              {/* Appears in stacks */}
              <a
                href="#appears-in"
                className="mt-10 text-sm text-gray-400 hover:text-gray-900 transition flex items-center gap-1 w-fit"
              >
                Appears in {mvpNovel.stackCount} stacks <ArrowRight className="w-4 h-4" />
              </a>

              {/* Editor Note 卡片 */}
              <div className="mt-12 bg-gray-50 border border-gray-100 rounded-xl p-5">
                <h3 className="text-sm text-gray-400 mb-3">✦ Editor's Take</h3>
                <p className="text-gray-700 italic mb-4 text-base leading-relaxed">
                  "{novelData.editorNote}"
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Best for:</span>
                  {novelData.bestFor.map((tag, index) => (
                    <span key={index} className="text-xs py-1 px-2 rounded-full bg-white border border-gray-200 text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Synopsis */}
              <section className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Synopsis</h2>
                <div className="text-gray-700 leading-relaxed">
                  <p className={showFullSynopsis ? '' : 'line-clamp-3'}>
                    {displaySynopsis}
                  </p>
                  <button
                    onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                    className="mt-2 text-sm text-gray-600 hover:text-gray-900 hover:underline transition"
                  >
                    {showFullSynopsis ? 'Show less' : 'Read full synopsis →'}
                  </button>
                </div>
              </section>

              {/* Themes */}
              <section className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Themes</h2>
                <div className="flex flex-wrap gap-3">
                  {displayedThemes.map((theme, index) => (
                    <span
                      key={index}
                      className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-600 bg-white"
                    >
                      {THEME_DISPLAY[theme] || theme}
                    </span>
                  ))}
                  {!showAllThemes && remainingThemesCount > 0 && (
                    <button
                      onClick={() => setShowAllThemes(true)}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition"
                    >
                      +{remainingThemesCount} more
                    </button>
                  )}
                  {showAllThemes && remainingThemesCount > 0 && (
                    <button
                      onClick={() => setShowAllThemes(false)}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition"
                    >
                      Show less
                    </button>
                  )}
                </div>
              </section>

              {/* Featured In */}
              <section className="mt-12" id="appears-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured In</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {stacks.map((stack) => (
                    <a
                      key={stack.id}
                      href={`/stack/${stack.id}`}
                      className="group flex gap-5 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5 transition-all"
                    >
                      {/* 封面缩略图 */}
                      <div className={`w-20 h-20 flex-shrink-0 bg-gradient-to-br ${stack.gradient} rounded-lg`}/>

                      {/* 右侧内容 */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-600 transition-colors">
                            {stack.title}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {stack.picks} picks
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Curated list
                          </p>
                        </div>
                        <span className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-1">
                          Open <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Similar picks - Temporarily hidden */}
        {/* <section className="pb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar picks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similarNovels.map((novel) => (
              <a
                key={novel.id}
                href={`/novel/${novel.id}`}
                className="group block"
              >
                <div className={`h-40 bg-gradient-to-br ${novel.gradient} rounded-2xl mb-3`}/>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                  {novel.title}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-1 ${PLATFORM_CONFIG[novel.platform].bgColor} text-gray-600 text-xs font-medium rounded-lg`}>
                  {novel.platform}
                </span>
              </a>
            ))}
          </div>
        </section> */}

        {/* 简化版邮件订阅 */}
        <section className="pb-16">
          <div className="p-6 bg-gray-50 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-gray-700 font-medium">Get curated stacks like this</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-w-0"
              />
              <button className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900 transition-colors">About</a>
              <span className="text-gray-300">·</span>
              <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
              <span className="text-gray-300">·</span>
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
