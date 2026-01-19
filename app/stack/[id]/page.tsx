'use client';

import { useState, use } from 'react';
import { ArrowRight, Bookmark, Bell } from 'lucide-react';
import stacksData from '@/MVP/stacks.json';
import novelsData from '@/MVP/novels.json';
import Footer from '../../components/Footer';

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

// 平台配置
const PLATFORM_CONFIG: Record<Platform, { name: string; color: string; bgColor: string }> = {
  'RR': { name: 'Royal Road', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  'SB': { name: 'SpaceBattles', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  'SV': { name: 'Sufficient Velocity', color: 'text-gray-600', bgColor: 'bg-gray-50' },
  'Site': { name: 'Author Site', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
};

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
    gradient: mvpNovel.coverGradient || 'from-gray-200 to-gray-100'
  };
}

// BookCard 组件
function BookCard({ book }: { book: Book }) {
  const platform = PLATFORM_CONFIG[book.platform];

  return (
    <a
      href={`/novel/${book.id}`}
      className="group flex flex-row gap-4 md:gap-6 p-6 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-md transition-all duration-300"
    >
      {/* 封面图 */}
      <div className={`w-20 aspect-[2/3] md:w-32 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br ${book.gradient}`}>
        <img
          src={`https://placehold.co/320x480/transparent/transparent?text=${encodeURIComponent(book.title)}`}
          alt={book.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* 右侧内容 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 第一行：标题 + 平台标签（左右对齐） */}
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug group-hover:text-gray-600 transition-colors flex-1 pr-2">
            {book.title}
          </h3>
          {/* 平台标签 */}
          <span className={`px-2 sm:px-3 py-1 ${platform.bgColor} ${platform.color} text-xs font-medium rounded-full flex-shrink-0`}>
            {book.platform}
          </span>
        </div>

        {/* 第二行：by 作者 */}
        <p className="text-xs sm:text-sm text-gray-500 mb-1">
          by <span className="text-gray-700">{book.author}</span>
        </p>

        {/* 第三行：状态 */}
        <p className={`text-xs font-medium mb-2 ${book.status === 'Completed' ? 'text-green-600' : 'text-amber-600'}`}>
          {book.status}
        </p>

        {/* 第四行：描述（斜体，限制2行） */}
        <p className="text-sm text-gray-600 italic mb-4 line-clamp-2">
          "{book.curatorNote}"
        </p>

        {/* 底部信息 - 桌面端用 mt-auto 推到封面底部对齐 */}
        <div className="hidden md:flex items-center justify-between text-sm mt-auto">
          <span className="text-gray-500">
            In {book.stackCount} stacks
          </span>
          <span className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            View <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </a>
  );
}

// 相关书单卡片
interface RelatedStack {
  id: string;
  title: string;
  description: string;
  picks: number;
  gradient: string;
}

const getRelatedStacks = (currentStackId: string): RelatedStack[] => {
  const allStacks = stacksData.stacks as MVPStack[];
  return allStacks
    .filter(stack => stack.id !== currentStackId)
    .slice(0, 2)
    .map(stack => ({
      id: stack.id,
      title: stack.title,
      description: stack.description,
      picks: stack.entries.length,
      gradient: stack.coverGradient
    }));
};

export default function StackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedPlatform, setSelectedPlatform] = useState<'All' | Platform>('All');
  const [email, setEmail] = useState('');

  // 根据 ID 从 MVP 数据中查找书单
  const mvpStack = (stacksData.stacks as MVPStack[]).find(stack => stack.id === id);

  // 如果找不到书单，显示 404
  if (!mvpStack) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Stack Not Found</h1>
          <p className="text-gray-600 mb-8">The stack you're looking for doesn't exist.</p>
          <a href="/" className="text-[#3B82F6] hover:underline">Return to Home</a>
        </div>
      </div>
    );
  }

  // 获取所有小说数据
  const allNovels = novelsData.novels as MVPNovel[];

  // 根据书单的 entries 构建 books 数组
  const books: Book[] = mvpStack.entries
    .sort((a, b) => a.order - b.order)
    .map(entry => {
      const novel = allNovels.find(n => n.id === entry.novelId);
      if (!novel) return null;
      return convertMVPToBook(novel, entry.curatorNote);
    })
    .filter((book): book is Book => book !== null);

  // 根据平台筛选书籍
  const filteredBooks = selectedPlatform === 'All'
    ? books
    : books.filter(book => book.platform === selectedPlatform);

  const relatedStacks = getRelatedStacks(id);

  // 格式化更新日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-6">
        {/* 顶部信息区 */}
        <section className="pt-12 pb-8">
          {/* EDITOR'S STACK 标签 */}
          <div className="mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              EDITOR'S STACK · Updated {formatDate(mvpStack.updatedAt)}
            </span>
          </div>

          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3">
              {mvpStack.title}
            </h1>
            <p className="text-xl text-gray-500 mb-4">
              {mvpStack.description}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              👤 Curated by <span className="font-medium text-gray-700">{mvpStack.curatorId}</span> · {mvpStack.entries.length} picks
            </p>

            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-xl transition-all">
                <Bookmark className="w-4 h-4" />
                Save Stack
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-xl transition-all">
                <Bell className="w-4 h-4" />
                Subscribe
              </button>
            </div>
          </div>
        </section>

        {/* Editor's Notes */}
        <section className="mb-12">
          <div className="p-6 bg-gray-50 rounded-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Editor's Notes</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {mvpStack.curatorNote}
            </p>
            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              {mvpStack.themes.slice(0, 3).map((theme, index) => (
                <span key={index} className="flex items-center gap-1">
                  ✓ {theme.charAt(0).toUpperCase() + theme.slice(1).replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Picks 列表 */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Picks ({filteredBooks.length})
            </h2>

            {/* 平台筛选 Tab */}
            <div className="flex gap-2">
              {(['All', 'RR', 'SB', 'SV'] as const).map((platform) => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPlatform === platform
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>

        {/* More Like This */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">More Like This</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedStacks.map((stack) => (
              <a
                key={stack.id}
                href={`/stack/${stack.id}`}
                className="group block"
              >
                <div className={`h-32 bg-gradient-to-br ${stack.gradient} rounded-2xl mb-4`}/>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                  {stack.title}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {stack.description}
                </p>
                <p className="text-xs text-gray-400">
                  {stack.picks} picks
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* 简化版邮件订阅 */}
        <section className="mb-16">
          <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-2xl">📬</span>
              <span className="text-gray-700 font-medium">Get curated lists</span>
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
        <Footer />
      </main>
    </div>
  );
}
