'use client';

import { useState, useEffect, useRef } from 'react';
import novelsData from '@/data/books.json';
import stacksData from '@/src/data/stacks.json';
import Link from 'next/link';

interface Novel {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
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
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); setSearchQuery(''); }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const close = () => { onClose(); setSearchQuery(''); };

  return (
    <div className="sm-overlay" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div ref={modalRef} className="sm-panel">

        {/* ── Search Input ── */}
        <div className="sm-input-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--g300)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, or theme..."
            className="sm-input"
          />
          <button onClick={close} className="sm-esc">ESC</button>
        </div>

        {/* ── Tabs ── */}
        <div className="sm-tabs">
          {(['all', 'books', 'stacks'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`sm-tab ${activeTab === tab ? 'sm-tab-active' : ''}`}
            >
              {tab === 'books' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
              )}
              {tab === 'stacks' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
              )}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="sm-content">
          {!searchQuery ? (
            <>
              {/* Recent Searches */}
              <div className="sm-section">
                <div className="sm-section-header">
                  <span className="sm-label">Recent Searches</span>
                  <button className="sm-clear">Clear</button>
                </div>
                <button className="sm-result-item">
                  <div className="sm-icon-box" style={{ background: 'var(--g75)' }}>⏰</div>
                  <div className="sm-result-text">
                    <div className="sm-result-title">Time loop progression fantasy</div>
                    <div className="sm-result-sub">Theme · 45 results</div>
                  </div>
                </button>
              </div>

              {/* Quick Navigation */}
              <div className="sm-section">
                <span className="sm-label">Quick Navigation</span>
                <div className="sm-quick-grid">
                  <Link href="/" onClick={close} className="sm-quick-card">
                    <div className="sm-icon-box" style={{ background: 'var(--accent-light, #d5e6d0)' }}>🎯</div>
                    <div>
                      <div className="sm-result-title">Editor&apos;s Picks</div>
                      <div className="sm-result-sub">Curated selections</div>
                    </div>
                  </Link>
                  <Link href="/theme/time-loop" onClick={close} className="sm-quick-card">
                    <div className="sm-icon-box" style={{ background: 'var(--warm, #ece4d9)' }}>🔥</div>
                    <div>
                      <div className="sm-result-title">Time Loop</div>
                      <div className="sm-result-sub">Popular theme</div>
                    </div>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="sm-results">
              {/* Books Results */}
              {(activeTab === 'all' || activeTab === 'books') && filteredNovels.length > 0 && (
                <div className="sm-section">
                  <span className="sm-label">Books</span>
                  {filteredNovels.slice(0, 5).map((novel) => (
                    <Link
                      key={novel.id}
                      href={`/novel/${novel.id}`}
                      onClick={close}
                      className="sm-result-item"
                    >
                      <div className="sm-icon-box" style={{ background: 'var(--g75)' }}>
                        {novel.coverImage ? (
                          <img src={novel.coverImage} alt="" style={{ width: 24, height: 32, borderRadius: 3, objectFit: 'cover' }} />
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                        )}
                      </div>
                      <div className="sm-result-text">
                        <div className="sm-result-title">{novel.title}</div>
                        <div className="sm-result-sub">by {novel.author}</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--g200)" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                  ))}
                </div>
              )}

              {/* Stacks Results */}
              {(activeTab === 'all' || activeTab === 'stacks') && filteredStacks.length > 0 && (
                <div className="sm-section">
                  <span className="sm-label">Stacks</span>
                  {filteredStacks.slice(0, 5).map((stack) => (
                    <Link
                      key={stack.id}
                      href={`/stack/${stack.id}`}
                      onClick={close}
                      className="sm-result-item"
                    >
                      <div className="sm-icon-box" style={{ background: 'var(--g75)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                      </div>
                      <div className="sm-result-text">
                        <div className="sm-result-title">{stack.title}</div>
                        <div className="sm-result-sub">{stack.entries.length} picks</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--g200)" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                  ))}
                </div>
              )}

              {/* No Results */}
              {filteredNovels.length === 0 && filteredStacks.length === 0 && (
                <div className="sm-empty">
                  No results found for &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="sm-footer">
          <div className="sm-footer-keys">
            <span><kbd>↑↓</kbd> navigate</span>
            <span><kbd>↵</kbd> select</span>
          </div>
          <span>Search across {novels.length + stacks.length}+ items</span>
        </div>
      </div>
    </div>
  );
}
