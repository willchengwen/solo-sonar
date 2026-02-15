'use client';

import { useState, useRef } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div>
      {/* ═══ SPOTLIGHT ═══ */}
      <section className="spotlight">
        <div className="spotlight-card">
          {/* 左侧：标题区 */}
          <div className="spotlight-left">
            <div className="spotlight-title-area">
              <div className="spotlight-label">Editor's Pick</div>
              <h1 className="spotlight-title">{featuredStack.title}</h1>
            </div>

            {/* 补充信息区 */}
            <div className="spotlight-meta-area">
              <p
                className="spotlight-note"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  whiteSpace: 'normal',
                }}
              >
                {featuredStack.curatorNote || featuredStack.description}
              </p>
              <div className="spotlight-meta">
                <div className="curator-avatar"></div>
                <div className="curator-info">
                  Curated by <strong>{featuredCuratorName}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：书籍区 */}
          <div className="spotlight-right">
            {featuredNovels.length > 0 && (
              <>
                <div className="hero-book">
                  <Link href={`/novel/${featuredNovels[0]?.id}`} className="hero-book-main">
                    <div
                      className="hero-book-cover"
                      style={{ background: featuredNovels[0].coverImage ? 'transparent' : SPINE_COLORS[0 % SPINE_COLORS.length] }}
                    >
                      {featuredNovels[0].coverImage ? (
                        <img src={featuredNovels[0].coverImage} alt={featuredNovels[0].title} className="hero-book-cover-img" />
                      ) : (
                        featuredNovels[0].title.charAt(0)
                      )}
                    </div>
                    <div className="hero-book-info">
                      <div className="hero-book-title">{featuredNovels[0].title}</div>
                      <div className="hero-book-author">{featuredNovels[0].author}</div>
                      <div
                        className="hero-book-curator-note"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {featuredNovels[0].synopsis || featuredStack.description || ''}
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="spotlight-divider"></div>

                <div className="compact-books-label">Also in This Stack</div>
                <div className="compact-books">
                  {featuredNovels.slice(1, 4).map((novel, i) => (
                    <Link key={novel.id} href={`/novel/${novel.id}`} className="compact-book">
                      <div
                        className="compact-book-cover"
                        style={{ background: novel.coverImage ? 'transparent' : SPINE_COLORS[(i + 1) % SPINE_COLORS.length] }}
                      >
                        {novel.coverImage ? (
                          <img src={novel.coverImage} alt={novel.title} className="compact-book-cover-img" />
                        ) : (
                          novel.title.charAt(0)
                        )}
                      </div>
                      <div className="compact-book-title">{novel.title}</div>
                      <div className="compact-book-author">{novel.author}</div>
                      <div className="compact-book-hook">{novel.synopsis}</div>
                    </Link>
                  ))}
                </div>

                {featuredStack.entries.length > 4 && (
                  <div className="spotlight-more-link">
                    <Link href={`/stack/${featuredStack.id}`}>
                      <span>See all {featuredStack.entries.length} books</span>
                      <span className="arr">→</span>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ═══ CONTEXT LINE ═══ */}
      <div className="context-line">Curated web fiction across Royal Road, SpaceBattles, Sufficient Velocity &amp; more</div>




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
            const stackHref = `/stack/${stack.id}`;
            const stackNovels = stack.entries
              .sort((a, b) => a.order - b.order)
              .map((e) => novelsById.get(e.novelId))
              .filter((n): n is Novel => Boolean(n));
            const curName = getCuratorName(stack.curatorId);

            return (
              <div key={stack.id} className="mc">
                <Link href={stackHref} className="mc-name mc-name-link">
                  {stack.title}
                </Link>
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
                  <Link href={stackHref} className="mc-lnk">
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

    </div>
  );
}
