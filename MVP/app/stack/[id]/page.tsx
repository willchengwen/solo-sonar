'use client';

import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import stacksData from '@/src/data/stacks.json';
import novelsData from '@/data/books.json';
import curatorsData from '@/src/data/curators.json';
import Footer from '../../components/Footer';
import { formatTagLabel } from '../../lib/tagStyles';

interface StackEntry {
  novelId: string;
  curatorNote: string;
  order: number;
}

interface StackItem {
  id: string;
  title: string;
  description: string;
  curatorId: string;
  curatorNote: string;
  entries: StackEntry[];
  themes: string[];
  createdAt: string;
}

interface NovelItem {
  id: string;
  title: string;
  author: string;
  status: 'ongoing' | 'completed' | 'hiatus' | 'dropped';
  themes: string[];
  coverImage?: string;
  curatorNote?: string;
  links?: Array<{
    platform: string;
    isCanonical?: boolean;
  }>;
}

interface StackBookResolved {
  entry: StackEntry;
  novel: NovelItem | null;
  curatorNote: string;
}

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

const RELATED_SPINE_SETS = [
  {
    gradients: ['linear-gradient(135deg,#6a7fc4,#4e5ea0)', 'linear-gradient(135deg,#8a6a6a,#6e4e4e)', 'linear-gradient(135deg,#6a9a8a,#4e7e6e)'],
    heights: [36, 42, 38],
  },
  {
    gradients: ['linear-gradient(135deg,#5aae5a,#3e923e)', 'linear-gradient(135deg,#ae8a5a,#926e3e)', 'linear-gradient(135deg,#c46a8a,#a04e6e)'],
    heights: [40, 34, 44],
  },
  {
    gradients: ['linear-gradient(135deg,#5a7aae,#3e5e92)', 'linear-gradient(135deg,#7a5aae,#5e3e92)', 'linear-gradient(135deg,#ae5a5a,#923e3e)'],
    heights: [38, 42, 36],
  },
];

const RELATED_AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#c49a6a,#a07a4e)',
  'linear-gradient(135deg,#6ac49a,#4ea07a)',
  'linear-gradient(135deg,#6a6ac4,#4e4ea0)',
];

function toStatus(status: NovelItem['status']) {
  if (status === 'completed') return { label: 'Done', cls: 'st-d' };
  if (status === 'ongoing') return { label: 'Live', cls: 'st-l' };
  return { label: 'Hiatus', cls: 'st-h' };
}

function getCuratorName(curatorId: string) {
  const curator = curatorsData.curators.find((c) => c.id === curatorId);
  return curator?.name ?? curatorId;
}

function spineGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash << 5) - hash + seed.charCodeAt(i);
  return SPINE_COLORS[Math.abs(hash) % SPINE_COLORS.length];
}

function pickRelatedLetters(title: string) {
  const letters = title
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z]/g, ''))
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part.charAt(0).toUpperCase());
  while (letters.length < 3) letters.push('S');
  return letters;
}

function BookCover({ seed, title, coverImage }: { seed: string; title: string; coverImage?: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(coverImage) && !imageFailed;

  return (
    <div className="sd-book-spine" style={{ background: spineGradient(seed) }}>
      {showImage ? (
        <img
          src={coverImage}
          alt={title}
          className="sd-book-cover-img"
          onError={() => setImageFailed(true)}
        />
      ) : (
        title.charAt(0)
      )}
    </div>
  );
}

export default function StackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteExpanded, setNoteExpanded] = useState(false);
  const [noteCanExpand, setNoteCanExpand] = useState(false);
  const [expandedBookNotes, setExpandedBookNotes] = useState<Record<string, boolean>>({});
  const [expandableBookNotes, setExpandableBookNotes] = useState<Record<string, boolean>>({});
  const noteTextRef = useRef<HTMLParagraphElement>(null);
  const bookListRef = useRef<HTMLDivElement>(null);

  const allStacks = stacksData.stacks as StackItem[];
  const stack = allStacks.find((item) => item.id === id);

  if (!stack) {
    return (
      <div className="sd-bg">
        <main className="sd-shell sd-not-found">
          <h1>Stack Not Found</h1>
          <p>The stack you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/">Return to Home</Link>
        </main>
      </div>
    );
  }

  const allNovels = novelsData as NovelItem[];
  const books = [...stack.entries]
    .sort((a, b) => a.order - b.order)
    .map((entry) => {
      const novel = allNovels.find((item) => item.id === entry.novelId);
      const novelEditorNote = novel?.curatorNote?.trim();
      const stackEntryNote = entry.curatorNote?.trim();
      return {
        entry,
        novel: novel ?? null,
        curatorNote: novelEditorNote || stackEntryNote || stack.curatorNote,
      } satisfies StackBookResolved;
    });

  const curatorName = getCuratorName(stack.curatorId);
  const relatedStacks = allStacks.filter((item) => item.id !== stack.id).slice(0, 3);

  useEffect(() => {
    const checkNoteOverflow = () => {
      if (noteExpanded) return;
      const el = noteTextRef.current;
      if (!el) return;
      setNoteCanExpand(el.scrollHeight > el.clientHeight + 1);
    };

    checkNoteOverflow();
    window.addEventListener('resize', checkNoteOverflow);
    return () => window.removeEventListener('resize', checkNoteOverflow);
  }, [stack.curatorNote, noteExpanded]);

  useEffect(() => {
    const measureBookNoteOverflow = () => {
      const root = bookListRef.current;
      if (!root) return;

      const next: Record<string, boolean> = {};
      const noteEls = root.querySelectorAll<HTMLParagraphElement>('[data-book-note-id]');

      noteEls.forEach((el) => {
        const noteId = el.dataset.bookNoteId;
        if (!noteId) return;

        const isExpanded = el.dataset.expanded === 'true';
        if (isExpanded) {
          el.classList.add('sd-book-note-clamped');
          next[noteId] = el.scrollHeight > el.clientHeight + 1;
          el.classList.remove('sd-book-note-clamped');
          return;
        }

        next[noteId] = el.scrollHeight > el.clientHeight + 1;
      });

      setExpandableBookNotes(next);
    };

    measureBookNoteOverflow();
    window.addEventListener('resize', measureBookNoteOverflow);
    return () => window.removeEventListener('resize', measureBookNoteOverflow);
  }, [stack.id, expandedBookNotes]);
  return (
    <div className="sd-bg">
      <main className="sd-shell">
        {/* ═══ HEADER ═══ */}
        <section className="sd-hero">
          <h1>{stack.title}</h1>

          <div className="sd-meta-actions">
            <div className="sd-meta">
              <div className="sd-avatar">{curatorName.charAt(0).toUpperCase()}</div>
              <div>
                <div className="sd-curator">{curatorName}</div>
              </div>
            </div>

            <div className="sd-actions">
              <button type="button" className="sd-save-btn" aria-label="Save stack">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v13.6l-6.5-3-6.5 3V6A1.5 1.5 0 0 1 7 4.5z" />
                </svg>
                <span className="sd-save-label">Save</span>
              </button>
              <button
                type="button"
                className="sd-share-btn"
                aria-label="Share stack"
                onClick={() => {
                  if (typeof window === 'undefined') return;
                  void navigator.clipboard?.writeText(window.location.href);
                }}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15V6m0 0-3 3m3-3 3 3M5 14v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* ═══ EDITOR'S NOTE ═══ */}
        {/* Mobile: click to open modal */}
        <div className="sd-note-card sd-note-mobile" onClick={() => setShowNoteModal(true)}>
          <div className="sd-note-label">Editor&apos;s Note</div>
          <p className="sd-note-text-clamped">{stack.curatorNote}</p>
        </div>

        {/* Desktop: inline with Read more */}
        <div className="sd-note-card sd-note-desktop">
          <div className="sd-note-label">Editor&apos;s Note</div>
          <p
            ref={noteTextRef}
            className={noteExpanded ? 'sd-note-text' : 'sd-note-text sd-note-text-clamped'}
          >
            {stack.curatorNote}
          </p>
          {noteCanExpand && (
            <button
              className="sd-note-toggle"
              onClick={() => setNoteExpanded(!noteExpanded)}
            >
              {noteExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Note Modal (Mobile) */}
        {showNoteModal && (
          <div className="sd-modal-overlay" onClick={() => setShowNoteModal(false)}>
            <div className="sd-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="sd-modal-header">
                <span className="sd-note-label" style={{ marginBottom: 0 }}>
                  Editor&apos;s Note
                </span>
                <button className="sd-modal-close" onClick={() => setShowNoteModal(false)}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="sd-modal-text">{stack.curatorNote}</p>
            </div>
          </div>
        )}

        {/* ═══ BOOKS IN THIS STACK ═══ */}
        <section className="sd-books">
          <div className="sd-books-head">
            <h2>Books in this Stack</h2>
            <span>{stack.entries.length} books</span>
          </div>
          <div className="sd-book-list" ref={bookListRef}>
            {books.map((book) => {
              const noteId = book.novel?.id ?? book.entry.novelId;
              const isBookNoteExpanded = Boolean(expandedBookNotes[noteId]);
              const showToggle = Boolean(expandableBookNotes[noteId]) || isBookNoteExpanded;

              if (!book.novel) {
                return (
                  <div key={book.entry.novelId} className="sd-book-item">
                    <BookCover seed={book.entry.novelId} title={book.entry.novelId.toUpperCase()} />
                    <div className="sd-book-body">
                      <div className="sd-book-title-row">
                        <h3>{formatTagLabel(book.entry.novelId)}</h3>
                        <span className="st-h">Missing</span>
                      </div>
                      <div className="sd-book-author">Source unavailable</div>
                      <p
                        data-book-note-id={noteId}
                        data-expanded={isBookNoteExpanded ? 'true' : 'false'}
                        className={`sd-book-note sd-book-note-desktop ${isBookNoteExpanded ? '' : 'sd-book-note-clamped'}`}
                      >
                        {book.curatorNote}
                      </p>
                      {showToggle && (
                        <button
                          type="button"
                          className="sd-book-note-toggle"
                          onClick={() => setExpandedBookNotes((prev) => ({ ...prev, [noteId]: !prev[noteId] }))}
                        >
                          {isBookNoteExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>
                    <p className="sd-book-note-mobile">{book.curatorNote}</p>
                  </div>
                );
              }

              const status = toStatus(book.novel.status);
              return (
                <Link key={book.novel.id} href={`/novel/${book.novel.id}`} className="sd-book-item">
                  <BookCover seed={book.novel.id} title={book.novel.title} coverImage={book.novel.coverImage} />
                  <div className="sd-book-body">
                    <div className="sd-book-title-row">
                      <h3>{book.novel.title}</h3>
                      <span className={status.cls}>{status.label}</span>
                    </div>
                    <div className="sd-book-author">{book.novel.author}</div>
                    <p
                      data-book-note-id={noteId}
                      data-expanded={isBookNoteExpanded ? 'true' : 'false'}
                      className={`sd-book-note sd-book-note-desktop ${isBookNoteExpanded ? '' : 'sd-book-note-clamped'}`}
                    >
                      {book.curatorNote}
                    </p>
                    {showToggle && (
                      <button
                        type="button"
                        className="sd-book-note-toggle"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setExpandedBookNotes((prev) => ({ ...prev, [noteId]: !prev[noteId] }));
                        }}
                      >
                        {isBookNoteExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                  <p className="sd-book-note-mobile">{book.curatorNote}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ═══ RELATED STACKS ═══ */}
        <section className="sd-related">
          <h2 className="sd-related-head">You Might Also Like</h2>
          <div className="sd-related-grid">
            {relatedStacks.map((item, index) => {
              const spineSet = RELATED_SPINE_SETS[index % RELATED_SPINE_SETS.length];
              const letters = pickRelatedLetters(item.title);
              const name = getCuratorName(item.curatorId);
              const avatarGradient = RELATED_AVATAR_GRADIENTS[index % RELATED_AVATAR_GRADIENTS.length];

              return (
                <Link key={item.id} href={`/stack/${item.id}`} className="sd-related-card">
                  <div className="sd-related-spines">
                    {letters.map((letter, i) => (
                      <div
                        key={`${item.id}-${i}`}
                        className="sd-related-spine"
                        style={{
                          background: spineSet.gradients[i],
                          height: `${spineSet.heights[i]}px`,
                        }}
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <h3 className="sd-related-title">{item.title}</h3>
                  <p className="sd-related-desc">{item.description}</p>
                  <div className="sd-related-foot">
                    <div className="sd-related-curator">
                      <div className="sd-related-avatar" style={{ background: avatarGradient }}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <span>by {name}</span>
                    </div>
                    <span className="sd-related-count">
                      {item.entries.length} books <span className="sd-related-arrow">→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
