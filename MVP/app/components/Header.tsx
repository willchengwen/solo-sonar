'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchModal from './SearchModal';
import SignInModal from './SignInModal';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (Math.abs(y - lastScrollY) > 30) {
            setIsVisible(!(y > lastScrollY && y > 60));
            lastScrollY = y;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
      <nav className={`v4-nav ${isVisible ? '' : 'hid'}`} id="nav">
        <Link className="nav-logo" href="/">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="13" stroke="var(--accent)" strokeWidth="1.5" opacity="0.3" />
              <circle cx="16" cy="16" r="8" stroke="var(--accent)" strokeWidth="1.8" opacity="0.6" />
              <circle cx="16" cy="16" r="3.5" fill="var(--accent)" />
            </svg>
          </div>
          <span className="logo-text">Solo Sonar</span>
        </Link>

        <button className="nav-search" onClick={() => setIsSearchOpen(true)}>
          <svg className="ns-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span className="ns-text">Search by title, author, theme...</span>
          <span className="ns-key">⌘K</span>
        </button>

        <button className="nav-sign" onClick={() => setIsSignInOpen(true)}>
          Sign in
        </button>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </>
  );
}
