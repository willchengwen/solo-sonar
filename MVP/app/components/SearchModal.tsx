'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Book, Bookmark, ArrowRight } from 'lucide-react';
import novelsData from '@/data/books.json';
import stacksData from '@/src/data/stacks.json';
import Link from 'next/link';

interface Novel {
  id: string;
  title: string;
  author: string;
}

interface Stack {
  id: string;
  title: string;
  entries: Array<{ novelId: string }>;
  [key: string]: any;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'all' | 'books' | 'stacks';

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const novels = novelsData as Novel[];
  const stacks = stacksData.stacks as Stack[];

  const filteredNovels = novels.filter(novel =>
    novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    novel.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStacks = stacks.filter(stack =>
    stack.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          setSearchQuery('');
        }
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, or theme..."
            className="flex-1 bg-transparent border-0 text-base focus:outline-none text-slate-900 placeholder-neutral-400"
          />
          <button
            onClick={() => {
              onClose();
              setSearchQuery('');
            }}
            className="text-xs text-neutral-400 bg-slate-50 px-2 py-1 rounded hover:bg-slate-100"
          >
            ESC
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 text-sm font-medium pb-1 border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'text-slate-900 border-cyan-500'
                : 'text-neutral-500 border-transparent hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-1.5 text-sm pb-1 border-b-2 transition-colors ${
              activeTab === 'books'
                ? 'text-slate-900 border-cyan-500'
                : 'text-neutral-500 border-transparent hover:text-slate-900'
            }`}
          >
            <Book className="w-4 h-4" />
            Books
          </button>
          <button
            onClick={() => setActiveTab('stacks')}
            className={`flex items-center gap-1.5 text-sm pb-1 border-b-2 transition-colors ${
              activeTab === 'stacks'
                ? 'text-slate-900 border-cyan-500'
                : 'text-neutral-500 border-transparent hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Stacks
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {!searchQuery ? (
            <>
              {/* Recent Searches */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Recent Searches
                  </h3>
                  <button className="text-xs text-cyan-600 hover:text-cyan-700">
                    Clear
                  </button>
                </div>
                <div className="space-y-2">
                  <button className="flex items-center gap-3 w-full p-2 hover:bg-slate-50 rounded-lg transition-colors text-left">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm">⏰</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">Time loop progression fantasy</div>
                      <div className="text-xs text-neutral-500">Theme • 45 results</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Quick Navigation */}
              <div>
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                  Quick Navigation
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/"
                    onClick={() => {
                      onClose();
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 p-3 bg-white border border-slate-200 hover:border-cyan-300 rounded-xl transition-all"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-cyan-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🎯</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Editor's Picks</div>
                      <div className="text-xs text-neutral-500">Curated selections</div>
                    </div>
                  </Link>
                  <Link
                    href="/theme/time-loop"
                    onClick={() => {
                      onClose();
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 p-3 bg-white border border-slate-200 hover:border-amber-300 rounded-xl transition-all"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🔥</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Time Loop</div>
                      <div className="text-xs text-neutral-500">Popular theme</div>
                    </div>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {/* Books Results */}
              {(activeTab === 'all' || activeTab === 'books') && filteredNovels.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                    Books
                  </h3>
                  <div className="space-y-2">
                    {filteredNovels.slice(0, 5).map((novel) => (
                      <Link
                        key={novel.id}
                        href={`/novel/${novel.id}`}
                        onClick={() => {
                          onClose();
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg flex items-center justify-center">
                          <Book className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-slate-900">{novel.title}</div>
                          <div className="text-xs text-neutral-500">by {novel.author}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-300" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Stacks Results */}
              {(activeTab === 'all' || activeTab === 'stacks') && filteredStacks.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                    Stacks
                  </h3>
                  <div className="space-y-2">
                    {filteredStacks.slice(0, 5).map((stack) => (
                      <Link
                        key={stack.id}
                        href={`/stack/${stack.id}`}
                        onClick={() => {
                          onClose();
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-slate-50 rounded-lg flex items-center justify-center">
                          <Bookmark className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-slate-900">{stack.title}</div>
                          <div className="text-xs text-neutral-500">{stack.entries.length} picks</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-300" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {filteredNovels.length === 0 && filteredStacks.length === 0 && (
                <div className="text-center py-8 text-neutral-500">
                  <p>No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">↑↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">↵</kbd>
              to select
            </span>
          </div>
          <span>Search across {novels.length + stacks.length}+ items</span>
        </div>
      </div>
    </div>
  );
}
