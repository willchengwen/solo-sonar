'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import novelsData from '@/MVP/novels.json';
import stacksData from '@/MVP/stacks.json';

interface Novel {
  id: string;
  title: string;
  author: string;
}

interface Stack {
  id: string;
  title: string;
  entries: Array<{ novelId: string }>;
  [key: string]: any; // 允许其他属性
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const novels = novelsData.novels as Novel[];
  const stacks = stacksData.stacks as Stack[];

  // 过滤书籍和书单
  const filteredNovels = novels.filter(novel =>
    novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    novel.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStacks = stacks.filter(stack =>
    stack.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 聚焦输入框
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // ESC 键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // 点击外部关闭
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* 搜索输入框 */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books, lists, authors..."
            className="flex-1 text-lg outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* 搜索结果 */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!searchQuery ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">Type to search books and lists</p>
            </div>
          ) : (
            <div className="p-2">
              {/* 书籍结果 */}
              {filteredNovels.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Books
                  </div>
                  {filteredNovels.map((novel) => (
                    <a
                      key={novel.id}
                      href={`/novel/${novel.id}`}
                      onClick={() => {
                        onClose();
                        setSearchQuery('');
                      }}
                      className="block px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900">{novel.title}</div>
                      <div className="text-sm text-gray-500">by {novel.author}</div>
                    </a>
                  ))}
                </div>
              )}

              {/* 书单结果 */}
              {filteredStacks.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Lists
                  </div>
                  {filteredStacks.map((stack) => (
                    <a
                      key={stack.id}
                      href={`/stack/${stack.id}`}
                      onClick={() => {
                        onClose();
                        setSearchQuery('');
                      }}
                      className="block px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900">{stack.title}</div>
                      <div className="text-sm text-gray-500">{stack.entries.length} picks</div>
                    </a>
                  ))}
                </div>
              )}

              {/* 无结果 */}
              {filteredNovels.length === 0 && filteredStacks.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
