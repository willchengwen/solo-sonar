'use client';

import { useState } from 'react';
import { Search, Library } from 'lucide-react';
import SearchModal from './SearchModal';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
                  <path d="M20 16C20 16 44 16 44 28C44 40 20 36 20 48C20 60 44 48 44 48" stroke="#3B82F6" stroke-width="5" stroke-linecap="round" fill="none"/>
                  <path d="M16 14C16 14 44 12 48 28C52 44 16 40 16 52" stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.3"/>
                </svg>
              </div>
              <a href="/" className="font-semibold text-lg text-gray-900">Solo Sonar</a>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter a book you love (e.g., Worm)..."
                  readOnly
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Library */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Library className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
