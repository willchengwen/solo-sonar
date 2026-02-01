'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, BookmarkIcon } from 'lucide-react';
import SearchModal from './SearchModal';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = 0;
    const threshold = 50; // 滚动阈值，避免微小滚动触发

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (Math.abs(currentScrollY - lastScrollY) < threshold) {
        // 滚动变化太小，不处理
        return;
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // 向下滚动，且不在顶部 → 隐藏导航栏
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // 向上滚动 → 显示导航栏
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    // 节流处理，避免频繁触发
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      {/* Fixed Top Navigation Bar (Full Width) */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out bg-white/95 backdrop-blur-sm border-b border-deep-200/50 ${
          isVisible ? 'translate-y-0' : '-translate-y-[150%]'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sonar-600 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="2" opacity="0.5"/>
                <circle cx="16" cy="16" r="7" stroke="white" strokeWidth="2.5" opacity="0.9"/>
                <circle cx="16" cy="16" r="3" fill="white"/>
              </svg>
            </div>
            <Link href="/" className="font-semibold text-lg text-deep-900">
              Solo Sonar
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="relative w-full"
            >
              <div className="relative flex items-center bg-deep-50 rounded-xl border border-deep-200 hover:border-sonar-300 transition-all cursor-pointer px-3 py-2">
                <Search className="w-5 h-5 text-neutral-400" />
                <span className="ml-3 text-sm text-neutral-400">Search by title, author, theme...</span>
                <span className="ml-auto text-xs text-neutral-400 bg-white px-2 py-0.5 rounded">⌘K</span>
              </div>
            </button>
          </div>

          {/* Sign In Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const email = prompt("Sign in coming soon.\n\nJoin early access? Enter your email:");
                if (email && email.includes('@')) {
                  alert("Thanks! We'll notify you when sign-in is ready.");
                  console.log("Early access email:", email);
                }
              }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-deep-200 text-deep-700 rounded-xl text-sm font-medium hover:border-deep-300 hover:bg-deep-50 transition-all"
            >
              Sign in
            </button>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
