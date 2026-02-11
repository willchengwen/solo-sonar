'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Novel, Stack, PLATFORM_INFO, THEME_INFO, Theme } from '@/types/types';
import stacksData from '@/src/data/stacks.json';
import curatorsData from '@/src/data/curators.json';
import novelsData from '@/data/books.json';
import Footer from './components/Footer';

// ─── Data wiring ──────────────────────────────────────────────
const allStacks = stacksData.stacks;
const editorPicks = allStacks.filter((s) => s.isEditorPick);
const featuredStack = allStacks.find((s) => s.isFeatured) || allStacks[0];
// Hero preview uses the stack with isHeroPreview flag (The Worm Fanfic Hall of Fame by Zorian)
const heroPreviewStack = allStacks.find((s) => (s as any).isHeroPreview) || allStacks.find((s) => s.id !== featuredStack.id && s.isEditorPick) || allStacks[0];
const novelsById = new Map((novelsData as Novel[]).map((n) => [n.id, n]));
const curatorsById = new Map(curatorsData.curators.map((c) => [c.id, c]));

// ─── Spine gradient colors ───────────────────────────────────
const SPINE_COLORS = [
  'linear-gradient(135deg,#5B6CF7,#3A47C9)',
  'linear-gradient(135deg,#9B5CE5,#6B2FB8)',
  'linear-gradient(135deg,#E6A33E,#C4862B)',
  'linear-gradient(135deg,#E05B5B,#B83A3A)',
  'linear-gradient(135deg,#4ECDC4,#2EA89F)',
  'linear-gradient(135deg,#D4738C,#B05570)',
  'linear-gradient(135deg,#8B7DD8,#6B5FB8)',
  'linear-gradient(135deg,#C9A050,#A88540)',
  'linear-gradient(135deg,#4DA88E,#358070)',
];

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#E67E51,#D4956B)',
  'linear-gradient(135deg,#2DD882,#1B9E5A)',
  'linear-gradient(135deg,#6366F1,#4338CA)',
  'linear-gradient(135deg,#E05050,#B03030)',
];

// ─── Theme grid config ───────────────────────────────────────
const FEATURED_THEMES: { id: Theme; name: string; icon: string; count: number }[] = [
  { id: 'progression' as Theme, name: 'Progression Fantasy', icon: 'PF', count: 47 },
  { id: 'litrpg' as Theme, name: 'LitRPG', icon: 'LR', count: 115 },
  { id: 'time-loop' as Theme, name: 'Time Loop', icon: 'TL', count: 111 },
  { id: 'isekai' as Theme, name: 'Isekai & Portal', icon: 'IS', count: 112 },
  { id: 'sci-fi' as Theme, name: 'Hard Sci-Fi', icon: 'SF', count: 134 },
  { id: 'dungeon-core' as Theme, name: 'Dungeon Crawler', icon: 'DC', count: 44 },
  { id: 'slice-of-life' as Theme, name: 'Cozy Fantasy', icon: 'CZ', count: 58 },
];

// ─── Platform config ─────────────────────────────────────────
const PLATFORMS = [
  { name: 'Royal Road', abbr: 'RR', cls: 'sr-rr', desc: 'Progression Fantasy & LitRPG · 140 indexed' },
  { name: 'SpaceBattles', abbr: 'SB', cls: 'sr-sb', desc: 'Hard sci-fi & Worm fanfic · 52 indexed' },
  { name: 'Sufficient Velocity', abbr: 'SV', cls: 'sr-sv', desc: 'Quest fiction & creative writing · 30 indexed' },
];

// ─── Helpers ─────────────────────────────────────────────────
function getStatusLabel(status: string): { label: string; cls: string; mbCls: string } {
  switch (status) {
    case 'completed': return { label: 'Done', cls: 'st-d', mbCls: 'mb-d' };
    case 'ongoing': return { label: 'Live', cls: 'st-l', mbCls: 'mb-l' };
    case 'hiatus': return { label: 'Hiatus', cls: 'st-h', mbCls: 'mb-h' };
    default: return { label: 'Done', cls: 'st-d', mbCls: 'mb-d' };
  }
}

function getCuratorName(curatorId: string) {
  const c = curatorsById.get(curatorId);
  return c ? c.name : curatorId;
}

// ═══════════════════════════════════════════════════════════════
export default function HomePage() {
  const [email, setEmail] = useState('');
  const [featuredNoteOpen, setFeaturedNoteOpen] = useState(false);
  const [isFeaturedNoteTruncated, setIsFeaturedNoteTruncated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const featuredNoteRef = useRef<HTMLDivElement>(null);

  // Featured stack data
  const featuredNovels = featuredStack.entries
    .sort((a, b) => a.order - b.order)
    .map((e) => novelsById.get(e.novelId))
    .filter((n): n is Novel => Boolean(n));

  const featuredCuratorName = getCuratorName(featuredStack.curatorId);

  // Hero preview stack data (different from featured stack)
  const heroPreviewNovels = heroPreviewStack.entries
    .sort((a, b) => a.order - b.order)
    .map((e) => novelsById.get(e.novelId))
    .filter((n): n is Novel => Boolean(n));

  const heroPreviewCuratorName = getCuratorName(heroPreviewStack.curatorId);

  // Editor's picks scroll
  const scrollPicks = (dir: 'l' | 'r') => {
    scrollRef.current?.scrollBy({ left: dir === 'l' ? -316 : 316, behavior: 'smooth' });
  };

  // Filter out featured stack from editor's picks to avoid duplication
  const pickStacks = editorPicks.filter((s) => s.id !== featuredStack.id);

  useEffect(() => {
    const checkFeaturedNoteOverflow = () => {
      const el = featuredNoteRef.current;
      if (!el || window.innerWidth > 768) {
        setIsFeaturedNoteTruncated(false);
        return;
      }
      setIsFeaturedNoteTruncated(el.scrollHeight > el.clientHeight + 1);
    };

    checkFeaturedNoteOverflow();
    window.addEventListener('resize', checkFeaturedNoteOverflow);
    return () => window.removeEventListener('resize', checkFeaturedNoteOverflow);
  }, [featuredStack.curatorNote]);

  useEffect(() => {
    if (!featuredNoteOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFeaturedNoteOpen(false);
    };
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener('keydown', onEsc);
    };
  }, [featuredNoteOpen]);

  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="hero">
        <h1 className="an d1">
          Find the <em>signal</em><br />in the noise.
        </h1>
        <p className="hero-sub an d2">
          Find quality stories across Royal Road, SpaceBattles, and more. Curated by readers, for readers.
        </p>
        <button
          className="btn-p an d3"
          onClick={() => document.querySelector('.featured')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Browse Curated Stacks
        </button>
        <div className="hero-proof an d3">Hand-picked by real readers, not algorithms</div>

        {/* Mini Stack Preview */}
        <Link href={`/stack/${heroPreviewStack.id}`} className="hero-preview an d3">
          <div className="hp-spines">
            {heroPreviewNovels.slice(0, 5).map((novel, i) => (
              <div
                key={novel.id}
                className="hp-spine"
                style={{ background: SPINE_COLORS[i % SPINE_COLORS.length] }}
              >
                {novel.title.charAt(0)}
              </div>
            ))}
          </div>
          <div className="hp-body">
            <div className="hp-label">Featured Stack</div>
            <div className="hp-title">{heroPreviewStack.title}</div>
            <div className="hp-meta">
              Curated by {heroPreviewCuratorName} · {heroPreviewStack.description}
            </div>
          </div>
          <div className="hp-arrow" aria-hidden>→</div>
        </Link>
      </section>

      {/* ═══ FEATURED STACK ═══ */}
      <section className="featured">
        <div className="s-label">Featured Stack</div>
        <div className="s-head">
          <h2>{featuredStack.title}</h2>
          <Link href={`/stack/${featuredStack.id}`}>
            See all {featuredStack.entries.length} books →
          </Link>
        </div>
        <div className="stack-grid">
          {/* Left: Editorial panel */}
          <div className="stack-main">
            <div className="shelf">
              {featuredNovels.slice(0, 5).map((novel, i) => {
                const heights = [48, 54, 60, 54, 48];
                return (
                  <div
                    key={novel.id}
                    className="sp"
                    style={{
                      background: SPINE_COLORS[i % SPINE_COLORS.length],
                      height: `${heights[i] || 50}px`,
                    }}
                  >
                    {novel.title.charAt(0)}
                  </div>
                );
              })}
            </div>
            <div ref={featuredNoteRef} className="ed-note fs-note">{featuredStack.curatorNote}</div>
            {isFeaturedNoteTruncated && (
              <button
                type="button"
                className="fs-note-more"
                onClick={() => setFeaturedNoteOpen(true)}
              >
                Read more
              </button>
            )}
            <div className="stack-meta">
              Curated by <span className="cur">{featuredCuratorName}</span> · {featuredStack.entries.length} books
            </div>
          </div>

          {/* Right: Book list */}
          <div className="stack-list">
            {featuredNovels.slice(0, 4).map((novel, i) => {
              const st = getStatusLabel(novel.status);
              return (
                <Link key={novel.id} href={`/novel/${novel.id}`} className="stack-item">
                  <div className="spine" style={{ background: SPINE_COLORS[i % SPINE_COLORS.length] }}>
                    {novel.coverImage ? (
                      <img src={novel.coverImage} alt={novel.title} className="spine-cover" />
                    ) : (
                      novel.title.charAt(0)
                    )}
                  </div>
                  <div className="si-body">
                    <h4>{novel.title}</h4>
                    <div className="si-plat">{novel.author}</div>
                  </div>
                  <span className={`status ${st.cls}`}>{st.label}</span>
                </Link>
              );
            })}
            {featuredStack.entries.length > 4 && (
              <Link href={`/stack/${featuredStack.id}`} className="stack-more">
                <span>+ {featuredStack.entries.length - 4} more in this stack</span>
                <span className="arr">→</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ═══ EDITOR'S PICKS ═══ */}
      <section className="more">
        <div className="more-head">
          <div>
            <h2>Editor&apos;s Picks</h2>
            <p>Hand-picked thematic collections updated weekly</p>
          </div>
          <div className="scroll-btns">
            <button className="sbtn" onClick={() => scrollPicks('l')}>←</button>
            <button className="sbtn" onClick={() => scrollPicks('r')}>→</button>
          </div>
        </div>
        <div className="more-row no-sb" ref={scrollRef}>
          {pickStacks.map((stack, si) => {
            const stackNovels = stack.entries
              .sort((a, b) => a.order - b.order)
              .map((e) => novelsById.get(e.novelId))
              .filter((n): n is Novel => Boolean(n));
            const curName = getCuratorName(stack.curatorId);

            return (
              <div key={stack.id} className="mc">
                <div className="mc-name">{stack.title}</div>
                <div className="mc-meta">{stack.entries.length} books</div>
                <div className="mc-note">{stack.curatorNote || stack.description}</div>
                <div className="mc-books">
                  {stackNovels.slice(0, 3).map((novel, bi) => {
                    const st = getStatusLabel(novel.status);
                    return (
                      <div key={novel.id} className="mc-book">
                        <div
                          className="spine spine-sm"
                          style={{ background: SPINE_COLORS[(si * 3 + bi) % SPINE_COLORS.length] }}
                        >
                          {novel.coverImage ? (
                            <img src={novel.coverImage} alt={novel.title} className="spine-cover" style={{ width: 28, height: 38, borderRadius: 3 }} />
                          ) : (
                            novel.title.charAt(0)
                          )}
                        </div>
                        <div className="mc-bi">
                          <h5>{novel.title}</h5>
                          <span>{novel.author}</span>
                        </div>
                        <span className={`mb ${st.mbCls}`}>{st.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mc-foot">
                  <div className="mc-cur">
                    <div
                      className="mc-av"
                      style={{ background: AVATAR_GRADIENTS[si % AVATAR_GRADIENTS.length] }}
                    />
                    by <strong>{curName}</strong>
                  </div>
                  <Link href={`/stack/${stack.id}`} className="mc-lnk">
                    All {stack.entries.length} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ BROWSE BY THEME ═══ */}
      <section className="themes">
        <div className="s-label">Browse by Theme</div>
        <div className="s-head">
          <h2>Discover stories through curated tags</h2>
          <Link href="#">View all tags →</Link>
        </div>
        <div className="theme-grid">
          {FEATURED_THEMES.map((theme) => (
            <Link key={theme.id} href={`/theme/${theme.id}`} className="tc">
              <div className="ta">{theme.icon}</div>
              <span className="t-arr">→</span>
              <h4>{theme.name}</h4>
              <span>{theme.count} books</span>
            </Link>
          ))}
          <Link href="#" className="tc tc-all">
            <div style={{ fontSize: 22, color: 'var(--g300)', marginBottom: 6 }}>+</div>
            <h4 style={{ color: 'var(--g500)' }}>All Tags</h4>
          </Link>
        </div>
      </section>

      {/* ═══ WHERE WE LOOK ═══ */}
      <section className="sources">
        <div className="s-label">Where we look</div>
        <div className="s-head">
          <h2>Content from Multiple Sources</h2>
        </div>
        <p className="sources-sub">We read across platforms so you don&apos;t have to.</p>
        <div className="src-row">
          {PLATFORMS.map((p) => (
            <div key={p.abbr} className="src-c">
              <div className={`src-i ${p.cls}`}>{p.abbr}</div>
              <div>
                <h4>{p.name}</h4>
                <p>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ NEWSLETTER ═══ */}
      <section className="cta">
        <div className="cta-icon">✉</div>
        <h2>Sonar Signals</h2>
        <p>Hand-picked reading lists when we find something exceptional. No spam, unsubscribe anytime.</p>
        <div className="email-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button>Subscribe</button>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <Footer />

      {featuredNoteOpen && (
        <div className="fs-note-modal-overlay" onClick={() => setFeaturedNoteOpen(false)}>
          <div className="fs-note-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fs-note-modal-header">
              <span>Featured Stack</span>
              <button
                type="button"
                className="fs-note-modal-close"
                onClick={() => setFeaturedNoteOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="fs-note-modal-text">{featuredStack.curatorNote}</p>
          </div>
        </div>
      )}
    </div>
  );
}
