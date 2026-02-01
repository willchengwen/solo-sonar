'use client';

import { use } from 'react';
import { Bookmark } from 'lucide-react';
import Link from 'next/link';
import stacksData from '@/src/data/stacks.json';
import novelsData from '@/data/books.json';
import Footer from '../../components/Footer';
import { getTagStyle, formatTagLabel } from '../../lib/tagStyles';

// 平台类型
type Platform = 'RR' | 'SB' | 'SV' | 'Site';

// MVP Stack 接口
interface MVPStack {
  id: string;
  title: string;
  description: string;
  curatorId: string;
  curatorNote: string;
  entries: Array<{
    novelId: string;
    curatorNote: string;
    addedAt: string;
    order: number;
  }>;
  themes: string[];
  platforms: string[];
  coverGradient: string;
  createdAt: string;
  updatedAt: string;
  savedCount: number;
  viewCount: number;
  isEditorPick: boolean;
  isFeatured: boolean;
}

// MVP Novel 接口
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
  coverImage?: string;
  stackCount: number;
  savedCount: number;
  editorNote?: string;
}

// 书籍接口（用于显示）
interface Book {
  id: string;
  title: string;
  author: string;
  platform: Platform;
  curatorNote: string;
  status: 'Completed' | 'Ongoing';
  stackCount: number;
  gradient: string;
  coverImage?: string | null;
  themes: string[];
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

// 将 MVP 数据转换为页面格式
function convertMVPToBook(mvpNovel: MVPNovel, curatorNote: string): Book {
  const canonicalLink = mvpNovel.links.find(link => link.isCanonical) || mvpNovel.links[0];

  return {
    id: mvpNovel.id,
    title: mvpNovel.title,
    author: mvpNovel.author,
    platform: mapPlatform(canonicalLink.platform),
    curatorNote: curatorNote,
    status: mvpNovel.status === 'completed' ? 'Completed' : 'Ongoing',
    stackCount: mvpNovel.stackCount,
    gradient: mvpNovel.coverGradient || 'from-gray-200 to-gray-100',
    coverImage: mvpNovel.coverImage || null,
    themes: mvpNovel.themes
  };
}

// 格式化日期
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

// 相关书单卡片
interface RelatedStack {
  id: string;
  title: string;
  description: string;
  picks: number;
  gradient: string;
  themes: string[];
  tagline: string;
  covers: {
    gradient1: string;
    gradient2: string;
    gradient3: string;
    icon1: string;
    icon2: string;
    icon3: string;
  };
}

// Related Stacks 封面配置
const COVER_CONFIGS = [
  {
    gradient1: 'from-indigo-500 to-purple-600',
    gradient2: 'from-pink-500 to-rose-600',
    gradient3: 'from-cyan-500 to-blue-600',
    icon1: '🎮',
    icon2: '⚔️',
    icon3: '🏰'
  },
  {
    gradient1: 'from-emerald-500 to-teal-600',
    gradient2: 'from-amber-500 to-orange-600',
    gradient3: 'from-sky-500 to-blue-600',
    icon1: '💎',
    icon2: '🏆',
    icon3: '⭐'
  },
  {
    gradient1: 'from-slate-600 to-slate-800',
    gradient2: 'from-blue-600 to-indigo-800',
    gradient3: 'from-purple-600 to-violet-800',
    icon1: '🚀',
    icon2: '🌌',
    icon3: '🔬'
  }
];

const getRelatedStacks = (currentStackId: string): RelatedStack[] => {
  const allStacks = stacksData.stacks as MVPStack[];
  return allStacks
    .filter(stack => stack.id !== currentStackId)
    .slice(0, 3)
    .map((stack, index) => {
      const config = COVER_CONFIGS[index % COVER_CONFIGS.length];
      return {
        id: stack.id,
        title: stack.title,
        description: stack.description,
        picks: stack.entries.length,
        gradient: stack.coverGradient,
        themes: stack.themes,
        tagline: stack.description,
        covers: config
      };
    });
};

// 书籍封面图标配置（按书籍ID）
const BOOK_COVER_CONFIGS: Record<string, { gradient: string; icon: string }> = {
  'mother-of-learning': { gradient: 'from-blue-500 to-indigo-600', icon: '📘' },
  'purple-days': { gradient: 'from-purple-500 to-indigo-600', icon: '👑' },
  'the-perfect-run': { gradient: 'from-red-500 to-orange-500', icon: '⚡' },
  'worth-the-candle': { gradient: 'from-emerald-500 to-teal-600', icon: '🔮' },
  're-monarch': { gradient: 'from-violet-500 to-purple-600', icon: '🌀' },
};

// 获取书籍封面配置
function getBookCoverConfig(bookId: string, gradient: string) {
  return BOOK_COVER_CONFIGS[bookId] || { gradient, icon: '📖' };
}

// 书籍卡片组件
function BookCard({ book }: { book: Book }) {
  const coverConfig = getBookCoverConfig(book.id, book.gradient);

  return (
    <div
      className="card card-hover p-5 sm:p-6 cursor-pointer"
      onClick={() => window.location.href = `/novel/${book.id}`}
    >
      <div className="flex flex-row gap-4 sm:gap-5">
        {/* 封面 */}
        <div className="flex-shrink-0 w-[80px] sm:w-[96px]">
          {book.coverImage ? (
            <img 
              src={book.coverImage} 
              alt={book.title}
              className="book-cover w-full h-auto"
            />
          ) : (
            <div className={`book-cover w-full h-[107px] sm:h-[128px] bg-gradient-to-br ${coverConfig.gradient} flex items-center justify-center text-3xl sm:text-4xl`}>
              {coverConfig.icon}
            </div>
          )}
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()} style={{ cursor: 'text' }}>
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="text-lg sm:text-xl font-bold text-deep-900">{book.title}</h3>
            <button className="heart-btn flex-shrink-0 cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>
          <p className="text-sm text-neutral-400 mb-3">by {book.author} · {book.platform}</p>

          <p className="text-neutral-600 italic mb-4 line-clamp-2 text-sm sm:text-base">
            "{book.curatorNote}"
          </p>

          <div className="flex flex-wrap gap-2">
            {book.themes.slice(0, 3).map((theme, index) => {
              const style = getTagStyle(theme);
              return (
                <span key={index} className={`tag ${style.bg} ${style.text} ${style.border}`}>
                  {formatTagLabel(theme)}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // 根据 ID 从 MVP 数据中查找书单
  const mvpStack = (stacksData.stacks as MVPStack[]).find(stack => stack.id === id);

  // 如果找不到书单，显示 404
  if (!mvpStack) {
    return (
      <div className="min-h-screen bg-deep-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-deep-900 mb-4">Stack Not Found</h1>
          <p className="text-deep-600 mb-8">The stack you're looking for doesn't exist.</p>
          <Link href="/" className="text-sonar-600 hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  // 获取所有小说数据
  const allNovels = novelsData as MVPNovel[];

  // 根据书单的 entries 构建 books 数组
  const books: Book[] = mvpStack.entries
    .sort((a, b) => a.order - b.order)
    .map(entry => {
      const novel = allNovels.find(n => n.id === entry.novelId);
      if (!novel) return null;
      return convertMVPToBook(novel, entry.curatorNote);
    })
    .filter((book): book is Book => book !== null);

  const relatedStacks = getRelatedStacks(id);

  return (
    <div className="min-h-screen bg-deep-50 text-deep-900 antialiased">
      <main className="pt-20 pb-20">
        {/* Header 区 */}
        <section className="px-5 sm:px-6 max-w-4xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* 封面堆叠 */}
            <div className="cover-stack flex-shrink-0 mx-auto md:mx-0">
              <div className="cover bg-gradient-to-br from-blue-500 to-indigo-600">
                📘
              </div>
              <div className="cover bg-gradient-to-br from-purple-500 to-pink-600">
                📕
              </div>
              <div className="cover bg-gradient-to-br from-emerald-500 to-teal-600">
                📗
              </div>
            </div>

            {/* 书单信息 */}
            <div className="flex-1 text-center md:text-left">
              {/* 标签 */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                {mvpStack.themes.slice(0, 3).map((theme, index) => {
                  const style = getTagStyle(theme);
                  return (
                    <span key={index} className={`tag ${style.bg} ${style.text} ${style.border}`}>
                      {formatTagLabel(theme)}
                    </span>
                  );
                })}
              </div>

              {/* 标题 */}
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-deep-900 mb-3">
                {mvpStack.title}
              </h1>

              {/* Tagline */}
              <p className="text-lg text-neutral-500 italic mb-5">
                {mvpStack.description}
              </p>

              {/* 策展人 */}
              <div className="flex items-center gap-3 justify-center md:justify-start mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                  {mvpStack.curatorId.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-deep-900">{mvpStack.curatorId}</p>
                  <p className="text-sm text-neutral-500">Curated {formatDate(mvpStack.createdAt)}</p>
                </div>
              </div>

              {/* 收藏按钮 */}
              <button className="btn-secondary">
                <Bookmark className="w-5 h-5" />
                Save to Collection
              </button>
            </div>
          </div>
        </section>

        {/* Editor's Note */}
        <section className="px-5 sm:px-6 max-w-4xl mx-auto mb-16">
          <div className="card-static p-6 sm:p-8">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Editor's Note</h2>
            <p className="text-neutral-600 leading-relaxed text-base sm:text-lg">
              {mvpStack.curatorNote}
            </p>
          </div>
        </section>

        {/* 书籍列表 */}
        <section className="px-5 sm:px-6 max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-deep-900 mb-8">
            Books in this Stack <span className="text-neutral-400 font-normal">({books.length})</span>
          </h2>

          <div className="space-y-5">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>

        {/* Related Stacks */}
        <section className="px-5 sm:px-6 max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-deep-900 mb-8">You Might Also Like</h2>

          {/* 桌面端网格，移动端横向滚动 */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedStacks.map((stack) => (
              <Link
                key={stack.id}
                href={`/stack/${stack.id}`}
                className="card card-lift p-5 cursor-pointer group"
              >
                <div className="flex flex-nowrap gap-2 overflow-hidden mb-4">
                  {stack.themes.slice(0, 2).map((theme, index) => {
                    const style = getTagStyle(theme);
                    return (
                      <span key={index} className={`tag ${style.bg} ${style.text} ${style.border} flex-shrink-0`}>
                        {formatTagLabel(theme)}
                      </span>
                    );
                  })}
                </div>
                <div className="flex justify-center mb-4">
                  <div className="relative w-28 h-20">
                    <div className={`absolute left-0 w-12 h-16 rounded-lg bg-gradient-to-br ${stack.covers.gradient1} shadow-md transform -rotate-6 flex items-center justify-center text-xl group-hover:scale-105 transition-transform`}>
                      {stack.covers.icon1}
                    </div>
                    <div className={`absolute left-8 w-12 h-16 rounded-lg bg-gradient-to-br ${stack.covers.gradient2} shadow-md flex items-center justify-center text-xl group-hover:scale-105 transition-transform`}>
                      {stack.covers.icon2}
                    </div>
                    <div className={`absolute left-16 w-12 h-16 rounded-lg bg-gradient-to-br ${stack.covers.gradient3} shadow-md transform rotate-6 flex items-center justify-center text-xl group-hover:scale-105 transition-transform`}>
                      {stack.covers.icon3}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-neutral-500 italic text-center mb-3">"{stack.tagline}"</p>
                <h3 className="font-bold text-deep-900 mb-1 line-clamp-1">{stack.title}</h3>
                <p className="text-sm text-neutral-500 mb-3 line-clamp-1">{stack.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-deep-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500"></div>
                    <span className="text-sm text-neutral-600">{mvpStack.curatorId}</span>
                  </div>
                  <span className="text-sm text-neutral-400">{stack.picks} books</span>
                </div>
              </Link>
            ))}
          </div>

          {/* 移动端横向滚动 */}
          <div className="sm:hidden flex gap-4 overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
            {relatedStacks.map((stack) => (
              <Link
                key={stack.id}
                href={`/stack/${stack.id}`}
                className="card card-lift p-5 cursor-pointer group flex-shrink-0 w-[280px]"
              >
                <div className="flex flex-nowrap gap-2 overflow-hidden mb-4">
                  {stack.themes.slice(0, 2).map((theme, index) => {
                    const style = getTagStyle(theme);
                    return (
                      <span key={index} className={`tag ${style.bg} ${style.text} ${style.border} flex-shrink-0`}>
                        {formatTagLabel(theme)}
                      </span>
                    );
                  })}
                </div>
                <div className="flex justify-center mb-4">
                  <div className="relative w-28 h-20">
                    <div className={`absolute left-0 w-12 h-16 rounded-lg bg-gradient-to-br ${stack.covers.gradient1} shadow-md transform -rotate-6 flex items-center justify-center text-xl`}>
                      {stack.covers.icon1}
                    </div>
                    <div className={`absolute left-8 w-12 h-16 rounded-lg bg-gradient-to-br ${stack.covers.gradient2} shadow-md flex items-center justify-center text-xl`}>
                      {stack.covers.icon2}
                    </div>
                    <div className={`absolute left-16 w-12 h-16 rounded-lg bg-gradient-to-br ${stack.covers.gradient3} shadow-md transform rotate-6 flex items-center justify-center text-xl`}>
                      {stack.covers.icon3}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-neutral-500 italic text-center mb-3">"{stack.tagline}"</p>
                <h3 className="font-bold text-deep-900 mb-1 line-clamp-1">{stack.title}</h3>
                <p className="text-sm text-neutral-500 mb-3 line-clamp-1">{stack.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-deep-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500"></div>
                    <span className="text-sm text-neutral-600">{mvpStack.curatorId}</span>
                  </div>
                  <span className="text-sm text-neutral-400">{stack.picks} books</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
