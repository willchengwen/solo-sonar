const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const cssPath = path.join(root, 'MVP/app/globals.css');
const stacksPath = path.join(root, 'MVP/src/data/stacks.json');
const curatorsPath = path.join(root, 'MVP/src/data/curators.json');
const novelsPath = path.join(root, 'MVP/data/books.json');
const outPath = path.join(root, 'backup', 'generated-homepage.html');

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

const FEATURED_THEMES = [
  { id: 'progression', name: 'Progression Fantasy', icon: 'PF', count: 47 },
  { id: 'litrpg', name: 'LitRPG', icon: 'LR', count: 115 },
  { id: 'time-loop', name: 'Time Loop', icon: 'TL', count: 111 },
  { id: 'isekai', name: 'Isekai & Portal', icon: 'IS', count: 112 },
  { id: 'sci-fi', name: 'Hard Sci-Fi', icon: 'SF', count: 134 },
  { id: 'dungeon-core', name: 'Dungeon Crawler', icon: 'DC', count: 44 },
  { id: 'slice-of-life', name: 'Cozy Fantasy', icon: 'CZ', count: 58 },
];

const PLATFORMS = [
  { name: 'Royal Road', abbr: 'RR', cls: 'sr-rr', desc: 'Progression Fantasy & LitRPG · 140 indexed' },
  { name: 'SpaceBattles', abbr: 'SB', cls: 'sr-sb', desc: 'Hard sci-fi & Worm fanfic · 52 indexed' },
  { name: 'Sufficient Velocity', abbr: 'SV', cls: 'sr-sv', desc: 'Quest fiction & creative writing · 30 indexed' },
];

function esc(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function statusData(status) {
  if (status === 'ongoing') return { label: 'Live', cls: 'st-l', mbCls: 'mb-l' };
  if (status === 'hiatus') return { label: 'Hiatus', cls: 'st-h', mbCls: 'mb-h' };
  return { label: 'Done', cls: 'st-d', mbCls: 'mb-d' };
}

function sortedEntries(entries) {
  return [...entries].sort((a, b) => a.order - b.order);
}

function coverMarkup(novel, extraClass = '') {
  if (!novel.coverImage) return esc(novel.title.charAt(0));
  return `<img src="${esc(novel.coverImage)}" alt="${esc(novel.title)}" class="spine-cover${extraClass ? ' ' + extraClass : ''}">`;
}

function main() {
  let css = fs.readFileSync(cssPath, 'utf8');
  css = css.replace(/^@import\s+"tailwindcss";\s*/m, '');

  const stacksData = JSON.parse(fs.readFileSync(stacksPath, 'utf8'));
  const curatorsData = JSON.parse(fs.readFileSync(curatorsPath, 'utf8'));
  const novelsData = JSON.parse(fs.readFileSync(novelsPath, 'utf8'));

  const allStacks = stacksData.stacks;
  const editorPicks = allStacks.filter((s) => s.isEditorPick);
  const featuredStack = allStacks.find((s) => s.isFeatured) || allStacks[0];
  const heroPreviewStack =
    allStacks.find((s) => s.isHeroPreview) ||
    allStacks.find((s) => s.id !== featuredStack.id && s.isEditorPick) ||
    allStacks[0];

  const novelsById = new Map(novelsData.map((n) => [n.id, n]));
  const curatorsById = new Map(curatorsData.curators.map((c) => [c.id, c]));

  const featuredNovels = sortedEntries(featuredStack.entries)
    .map((e) => novelsById.get(e.novelId))
    .filter(Boolean);

  const featuredBook = featuredNovels[0];

  const heroPreviewNovels = sortedEntries(heroPreviewStack.entries)
    .map((e) => novelsById.get(e.novelId))
    .filter(Boolean);

  const featuredCuratorName = curatorsById.get(featuredStack.curatorId)?.name || featuredStack.curatorId;
  const heroPreviewCuratorName = curatorsById.get(heroPreviewStack.curatorId)?.name || heroPreviewStack.curatorId;

  const pickStacks = editorPicks.filter((s) => s.id !== featuredStack.id);

  const heroSpines = heroPreviewNovels
    .slice(0, 5)
    .map((novel, i) => `<div class="hp-spine" style="background:${SPINE_COLORS[i % SPINE_COLORS.length]}">${esc(novel.title.charAt(0))}</div>`)
    .join('');

  const shelfHeights = [48, 54, 60, 54, 48];
  const featuredShelf = featuredNovels
    .slice(0, 5)
    .map(
      (novel, i) =>
        `<div class="sp" style="background:${SPINE_COLORS[i % SPINE_COLORS.length]};height:${shelfHeights[i] || 50}px">${esc(novel.title.charAt(0))}</div>`
    )
    .join('');

  const featuredList = featuredNovels
    .slice(0, 4)
    .map((novel, i) => {
      const st = statusData(novel.status);
      return `<a href="/novel/${esc(novel.id)}" class="stack-item">
        <div class="spine" style="background:${SPINE_COLORS[i % SPINE_COLORS.length]}">${coverMarkup(novel)}</div>
        <div class="si-body">
          <h4>${esc(novel.title)}</h4>
          <div class="si-plat">${esc(novel.author)}</div>
        </div>
        <span class="status ${st.cls}">${st.label}</span>
      </a>`;
    })
    .join('');

  const featuredMore = featuredStack.entries.length > 4
    ? `<a href="/stack/${esc(featuredStack.id)}" class="stack-more"><span>See all ${featuredStack.entries.length} books</span><span class="arr">→</span></a>`
    : '';

  const picksMarkup = pickStacks
    .map((stack, si) => {
      const stackNovels = sortedEntries(stack.entries)
        .map((e) => novelsById.get(e.novelId))
        .filter(Boolean);
      const curName = curatorsById.get(stack.curatorId)?.name || stack.curatorId;

      const books = stackNovels
        .slice(0, 3)
        .map((novel, bi) => {
          const st = statusData(novel.status);
          const note = novel.editorNote || '';

          return `<div class="mc-book">
            <div class="spine spine-sm" style="background:${SPINE_COLORS[(si * 3 + bi) % SPINE_COLORS.length]}">
              ${coverMarkup(novel, 'spine-cover-sm')}
            </div>
            <div class="mc-bi">
              <h5>${esc(novel.title)}</h5>
              <span>${esc(novel.author)}</span>
              ${note ? `<div class="mc-book-note">${esc(note)}</div>` : ''}
            </div>
            <span class="mb ${st.mbCls}">${st.label}</span>
          </div>`;
        })
        .join('');

      return `<div class="mc">
        <a href="/stack/${esc(stack.id)}" class="mc-name mc-name-link">${esc(stack.title)}</a>
        <div class="mc-meta">${stack.entries.length} books</div>
        <div class="mc-note">${esc(stack.curatorNote || stack.description || '')}</div>
        <div class="mc-books">${books}</div>
        <div class="mc-foot">
          <div class="mc-cur">
            <div class="mc-av" style="background:${AVATAR_GRADIENTS[si % AVATAR_GRADIENTS.length]}"></div>
            by <strong>${esc(curName)}</strong>
          </div>
          <a href="/stack/${esc(stack.id)}" class="mc-lnk">All ${stack.entries.length} →</a>
        </div>
      </div>`;
    })
    .join('');

  const themesMarkup = FEATURED_THEMES
    .map((theme) => `<a href="/theme/${esc(theme.id)}" class="tc">
      <div class="ta">${theme.icon}</div>
      <span class="t-arr">→</span>
      <h4>${esc(theme.name)}</h4>
      <span>${theme.count} books</span>
    </a>`)
    .join('');

  const sourcesMarkup = PLATFORMS
    .map((p) => `<div class="src-c">
      <div class="src-i ${p.cls}">${p.abbr}</div>
      <div>
        <h4>${esc(p.name)}</h4>
        <p>${esc(p.desc)}</p>
      </div>
    </div>`)
    .join('');

  const searchNovels = novelsData.map((novel) => ({
    id: novel.id,
    title: novel.title,
    author: novel.author,
    coverImage: novel.coverImage || '',
  }));

  const searchStacks = allStacks.map((stack) => ({
    id: stack.id,
    title: stack.title,
    count: stack.entries.length,
  }));

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solo Sonar</title>
  <meta name="description" content="Find quality stories across Royal Road, SpaceBattles, and more. Curated by readers, for readers.">
  <style>
${css}

/* Static HTML compatibility tweaks */
.spine-cover-sm { width: 28px; height: 38px; border-radius: 3px; }
  </style>
</head>
<body>
  <div>
    <nav class="v4-nav" id="nav">
      <a class="nav-logo" href="/">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="13" stroke="var(--accent)" stroke-width="1.5" opacity="0.3"></circle>
            <circle cx="16" cy="16" r="8" stroke="var(--accent)" stroke-width="1.8" opacity="0.6"></circle>
            <circle cx="16" cy="16" r="3.5" fill="var(--accent)"></circle>
          </svg>
        </div>
        <span class="logo-text">Solo Sonar</span>
      </a>

      <button class="nav-search" id="open-search" type="button">
        <svg class="ns-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <span class="ns-text">Search by title, author, theme...</span>
        <span class="ns-key">⌘K</span>
      </button>

      <button class="nav-sign" id="open-signin" type="button">Sign in</button>
    </nav>

    <section class="hero">
      <h1 class="an d1">Find the <em>signal</em><br>in the noise.</h1>
      <p class="hero-sub an d2">Find quality stories across Royal Road, SpaceBattles, and more. Curated by readers, for readers.</p>
      <button class="btn-p an d3" id="browse-curated" type="button">Browse Curated Stacks</button>
      <div class="hero-proof an d3">Hand-picked by real readers, not algorithms</div>

      <a href="/stack/${esc(heroPreviewStack.id)}" class="hero-preview an d3">
        <div class="hp-spines">${heroSpines}</div>
        <div class="hp-body">
          <div class="hp-label">Featured Stack</div>
          <div class="hp-title">${esc(heroPreviewStack.title)}</div>
          <div class="hp-meta">Curated by ${esc(heroPreviewCuratorName)} · ${esc(heroPreviewStack.description || '')}</div>
        </div>
        <div class="hp-arrow" aria-hidden="true">→</div>
      </a>
    </section>

    <section class="featured">
      <div class="s-label">Featured Stack</div>
      <div class="s-head">
        <h2>${esc(featuredStack.title)}</h2>
        <a href="/stack/${esc(featuredStack.id)}">See all ${featuredStack.entries.length} books →</a>
      </div>
      <div class="stack-grid">
        <div class="stack-main">
          <div class="shelf">${featuredShelf}</div>
          <div class="fs-note-wrap">
            <div class="fs-note" id="featured-note">${esc(featuredBook?.synopsis || featuredStack.description || '')}</div>
            <button type="button" class="fs-note-more" id="featured-note-more" style="display:none;">Read more</button>
          </div>
          <div class="stack-meta">Curated by <span class="cur">${esc(featuredCuratorName)}</span> · ${featuredStack.entries.length} books</div>
        </div>

        <div class="stack-list">
          ${featuredList}
          ${featuredMore}
        </div>
      </div>
    </section>

    <section class="more">
      <div class="more-head">
        <div>
          <h2>Editor&apos;s Picks</h2>
          <p>Hand-picked thematic collections updated weekly</p>
        </div>
        <div class="scroll-btns">
          <button class="sbtn" id="pick-scroll-left" type="button">←</button>
          <button class="sbtn" id="pick-scroll-right" type="button">→</button>
        </div>
      </div>
      <div class="more-row no-sb" id="more-row">${picksMarkup}</div>
    </section>

    <section class="themes">
      <div class="s-label">Browse by Theme</div>
      <div class="s-head">
        <h2>Discover stories through curated tags</h2>
        <a href="#">View all tags →</a>
      </div>
      <div class="theme-grid">
        ${themesMarkup}
        <a href="#" class="tc tc-all">
          <div style="font-size:22px;color:var(--g300);margin-bottom:6px">+</div>
          <h4 style="color:var(--g500)">All Tags</h4>
        </a>
      </div>
    </section>

    <section class="sources">
      <div class="s-label">Where we look</div>
      <div class="s-head">
        <h2>Content from Multiple Sources</h2>
      </div>
      <p class="sources-sub">We read across platforms so you don&apos;t have to.</p>
      <div class="src-row">${sourcesMarkup}</div>
    </section>

    <section class="cta">
      <div class="cta-icon">✉</div>
      <h2>Sonar Signals</h2>
      <p>Hand-picked reading lists when we find something exceptional. No spam, unsubscribe anytime.</p>
      <div class="email-form">
        <input type="email" placeholder="Enter your email">
        <button type="button">Subscribe</button>
      </div>
    </section>

    <footer class="v4-footer">
      <span>© 2026 Solo Sonar</span>
      <div class="footer-links">
        <a href="/about">About</a>
        <a href="/privacy">Privacy</a>
      </div>
    </footer>

    <div class="sm-overlay" id="search-overlay" style="display:none;">
      <div class="sm-panel">
        <div class="sm-input-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--g300); flex-shrink: 0;">
            <circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>
          </svg>
          <input id="search-input" type="text" placeholder="Search by title, author, or theme..." class="sm-input">
          <button id="search-close" class="sm-esc" type="button">ESC</button>
        </div>

        <div class="sm-tabs">
          <button class="sm-tab sm-tab-active" data-tab="all" type="button">All</button>
          <button class="sm-tab" data-tab="books" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
            Books
          </button>
          <button class="sm-tab" data-tab="stacks" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>
            Stacks
          </button>
        </div>

        <div class="sm-content" id="search-content"></div>

        <div class="sm-footer">
          <div class="sm-footer-keys">
            <span><kbd>↑↓</kbd> navigate</span>
            <span><kbd>↵</kbd> select</span>
          </div>
          <span>Search across ${searchNovels.length + searchStacks.length}+ items</span>
        </div>
      </div>
    </div>

    <div class="modal-overlay" id="signin-overlay" style="display:none;">
      <div class="modal">
        <button class="modal-close" id="signin-close" type="button">×</button>
        <div class="modal-icon">🔑</div>
        <h3 class="modal-title">Accounts are coming soon</h3>
        <p class="modal-desc">We&apos;re building user accounts with personal bookshelves, follow curators, and more. Leave your email and we&apos;ll let you know when it&apos;s ready.</p>
        <div class="modal-form">
          <input type="email" placeholder="Enter your email" class="modal-input" id="signin-email">
          <button class="modal-btn" id="signin-notify" type="button">Notify Me</button>
        </div>
        <p class="modal-note" id="signin-note"></p>
      </div>
    </div>
  </div>

  <script>
    (function () {
      var novels = ${JSON.stringify(searchNovels)};
      var stacks = ${JSON.stringify(searchStacks)};

      function escHtml(text) {
        return String(text)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      var nav = document.getElementById('nav');
      var lastScrollY = 0;
      var ticking = false;

      window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = window.scrollY || 0;
          if (Math.abs(y - lastScrollY) > 30) {
            if (nav) nav.classList.toggle('hid', y > lastScrollY && y > 60);
            lastScrollY = y;
          }
          ticking = false;
        });
      }, { passive: true });

      var browseBtn = document.getElementById('browse-curated');
      var featured = document.querySelector('.featured');
      if (browseBtn && featured) {
        browseBtn.addEventListener('click', function () {
          featured.scrollIntoView({ behavior: 'smooth' });
        });
      }

      var moreRow = document.getElementById('more-row');
      var left = document.getElementById('pick-scroll-left');
      var right = document.getElementById('pick-scroll-right');
      if (left && moreRow) left.addEventListener('click', function () { moreRow.scrollBy({ left: -316, behavior: 'smooth' }); });
      if (right && moreRow) right.addEventListener('click', function () { moreRow.scrollBy({ left: 316, behavior: 'smooth' }); });

      function setBodyLocked(locked) {
        document.body.style.overflow = locked ? 'hidden' : '';
      }

      var searchOverlay = document.getElementById('search-overlay');
      var searchInput = document.getElementById('search-input');
      var searchContent = document.getElementById('search-content');
      var openSearch = document.getElementById('open-search');
      var closeSearchBtn = document.getElementById('search-close');
      var activeTab = 'all';

      function renderSearch() {
        if (!searchContent || !searchInput) return;
        var qRaw = searchInput.value.trim();
        var q = qRaw.toLowerCase();

        var filteredNovels = novels.filter(function (novel) {
          return novel.title.toLowerCase().includes(q) || novel.author.toLowerCase().includes(q);
        });
        var filteredStacks = stacks.filter(function (stack) {
          return stack.title.toLowerCase().includes(q);
        });

        if (!q) {
          searchContent.innerHTML = '<div class="sm-section"><div class="sm-section-header"><span class="sm-label">Recent Searches</span><button class="sm-clear" type="button">Clear</button></div><button class="sm-result-item" type="button"><div class="sm-icon-box" style="background: var(--g75)">⏰</div><div class="sm-result-text"><div class="sm-result-title">Time loop progression fantasy</div><div class="sm-result-sub">Theme · 45 results</div></div></button></div><div class="sm-section"><span class="sm-label">Quick Navigation</span><div class="sm-quick-grid"><a href="/" class="sm-quick-card"><div class="sm-icon-box" style="background: var(--accent-light, #d5e6d0)">🎯</div><div><div class="sm-result-title">Editor\'s Picks</div><div class="sm-result-sub">Curated selections</div></div></a><a href="/theme/time-loop" class="sm-quick-card"><div class="sm-icon-box" style="background: var(--warm, #ece4d9)">🔥</div><div><div class="sm-result-title">Time Loop</div><div class="sm-result-sub">Popular theme</div></div></a></div></div>';
          return;
        }

        var html = '<div class="sm-results">';

        if ((activeTab === 'all' || activeTab === 'books') && filteredNovels.length > 0) {
          html += '<div class="sm-section"><span class="sm-label">Books</span>';
          filteredNovels.slice(0, 5).forEach(function (novel) {
            var icon = novel.coverImage
              ? '<img src="' + escHtml(novel.coverImage) + '" alt="" style="width:24px;height:32px;border-radius:3px;object-fit:cover">'
              : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>';
            html += '<a href="/novel/' + escHtml(novel.id) + '" class="sm-result-item"><div class="sm-icon-box" style="background: var(--g75)">' + icon + '</div><div class="sm-result-text"><div class="sm-result-title">' + escHtml(novel.title) + '</div><div class="sm-result-sub">by ' + escHtml(novel.author) + '</div></div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--g200)" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"></path></svg></a>';
          });
          html += '</div>';
        }

        if ((activeTab === 'all' || activeTab === 'stacks') && filteredStacks.length > 0) {
          html += '<div class="sm-section"><span class="sm-label">Stacks</span>';
          filteredStacks.slice(0, 5).forEach(function (stack) {
            html += '<a href="/stack/' + escHtml(stack.id) + '" class="sm-result-item"><div class="sm-icon-box" style="background: var(--g75)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg></div><div class="sm-result-text"><div class="sm-result-title">' + escHtml(stack.title) + '</div><div class="sm-result-sub">' + stack.count + ' picks</div></div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--g200)" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"></path></svg></a>';
          });
          html += '</div>';
        }

        if (filteredNovels.length === 0 && filteredStacks.length === 0) {
          html += '<div class="sm-empty">No results found for &ldquo;' + escHtml(qRaw) + '&rdquo;</div>';
        }

        html += '</div>';
        searchContent.innerHTML = html;
      }

      function openSearchModal() {
        if (!searchOverlay) return;
        searchOverlay.style.display = 'block';
        setBodyLocked(true);
        renderSearch();
        if (searchInput) searchInput.focus();
      }

      function closeSearchModal() {
        if (!searchOverlay) return;
        searchOverlay.style.display = 'none';
        if (searchInput) searchInput.value = '';
        setBodyLocked(false);
        renderSearch();
      }

      if (openSearch) openSearch.addEventListener('click', openSearchModal);
      if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearchModal);
      if (searchInput) searchInput.addEventListener('input', renderSearch);
      if (searchOverlay) {
        searchOverlay.addEventListener('click', function (e) {
          if (e.target === searchOverlay) closeSearchModal();
        });
      }

      Array.prototype.forEach.call(document.querySelectorAll('.sm-tab'), function (tabBtn) {
        tabBtn.addEventListener('click', function () {
          activeTab = tabBtn.getAttribute('data-tab') || 'all';
          Array.prototype.forEach.call(document.querySelectorAll('.sm-tab'), function (btn) {
            btn.classList.toggle('sm-tab-active', btn === tabBtn);
          });
          renderSearch();
        });
      });

      var signinOverlay = document.getElementById('signin-overlay');
      var openSignin = document.getElementById('open-signin');
      var closeSignin = document.getElementById('signin-close');
      var notifyBtn = document.getElementById('signin-notify');
      var signinEmail = document.getElementById('signin-email');
      var signinNote = document.getElementById('signin-note');

      function openSigninModal() {
        if (!signinOverlay) return;
        signinOverlay.style.display = 'block';
        signinOverlay.classList.add('open');
        setBodyLocked(true);
      }

      function closeSigninModal() {
        if (!signinOverlay) return;
        signinOverlay.style.display = 'none';
        signinOverlay.classList.remove('open');
        setBodyLocked(false);
      }

      function handleNotify() {
        if (!signinEmail || !signinNote) return;
        var email = signinEmail.value.trim();
        if (!email || email.indexOf('@') === -1) {
          signinNote.style.color = 'var(--warm)';
          signinNote.textContent = 'Please enter a valid email';
          return;
        }
        signinNote.style.color = 'var(--accent)';
        signinNote.textContent = "You're on the list! We'll notify you when accounts launch.";
        signinEmail.value = '';
        setTimeout(function () {
          closeSigninModal();
          signinNote.textContent = '';
        }, 2500);
      }

      if (openSignin) openSignin.addEventListener('click', openSigninModal);
      if (closeSignin) closeSignin.addEventListener('click', closeSigninModal);
      if (notifyBtn) notifyBtn.addEventListener('click', handleNotify);
      if (signinEmail) {
        signinEmail.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') handleNotify();
        });
      }
      if (signinOverlay) {
        signinOverlay.addEventListener('click', function (e) {
          if (e.target === signinOverlay) closeSigninModal();
        });
      }

      document.addEventListener('keydown', function (e) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          openSearchModal();
        }
        if (e.key === 'Escape') {
          closeSearchModal();
          closeSigninModal();
        }
      });

      var note = document.getElementById('featured-note');
      var noteBtn = document.getElementById('featured-note-more');
      var expanded = false;

      function checkOverflow() {
        if (!note || !noteBtn) return;
        if (expanded) {
          noteBtn.style.display = 'inline-flex';
          return;
        }
        var truncated = note.scrollHeight > note.clientHeight + 1;
        noteBtn.style.display = truncated ? 'inline-flex' : 'none';
      }

      if (note && noteBtn) {
        noteBtn.addEventListener('click', function () {
          expanded = !expanded;
          note.classList.toggle('is-expanded', expanded);
          noteBtn.textContent = expanded ? 'Show less' : 'Read more';
          checkOverflow();
        });
      }

      renderSearch();
      checkOverflow();
      window.addEventListener('resize', checkOverflow);
    })();
  </script>
</body>
</html>`;

  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`Generated ${outPath}`);
}

main();
