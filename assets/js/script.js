'use strict';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const body = document.body;
const stack = $('[data-stack]');
const pages = $$('[data-page]');
const navLinks = $$('[data-nav]');
const menuToggle = $('[data-menu-toggle]');
const progress = $('[data-progress]');
const lightbox = $('[data-lightbox-box]');
const lightboxImg = $('[data-lightbox-img]');
const closeLightbox = () => lightbox && lightbox.classList.remove('open');

/* ---------- menu ---------- */
const setMenu = (open) => {
  body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', open);
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};
menuToggle.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
// clicking the shrunken page closes the menu
stack.addEventListener('click', (e) => {
  if (body.classList.contains('menu-open')) { e.preventDefault(); e.stopPropagation(); setMenu(false); }
}, true);
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (lightbox && lightbox.classList.contains('open')) closeLightbox();
  else setMenu(false);
});

/* ---------- pages ---------- */
let current = pages.find((p) => p.classList.contains('active')) || pages[0];

const updateProgress = () => {
  const max = current.scrollHeight - current.clientHeight;
  progress.style.width = max > 0 ? `${(current.scrollTop / max) * 100}%` : '0%';
};
pages.forEach((p) => p.addEventListener('scroll', updateProgress, { passive: true }));

const showPage = (name, animate = true) => {
  const next = pages.find((p) => p.dataset.page === name);
  if (!next) return false;
  navLinks.forEach((l) => l.classList.toggle('active', l.dataset.nav === name));
  if (next !== current) {
    const prev = current;
    if (animate) {
      prev.classList.add('leaving');
      setTimeout(() => prev.classList.remove('leaving'), 450);
    }
    prev.classList.remove('active');
    next.scrollTop = 0;
    next.classList.add('active');
    current = next;
  }
  updateProgress();
  return true;
};

navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const name = link.dataset.nav;
    // on a standalone page (e.g. a blog post) the target section lives on
    // the home page, so let the browser follow the link
    if (!pages.some((p) => p.dataset.page === name)) return;
    e.preventDefault();
    e.stopPropagation();
    showPage(name);
    history.replaceState(null, '', name === 'home' ? location.pathname : `#${name}`);
    setMenu(false);
  });
});

if (pages.length > 1) {
  showPage(location.hash.slice(1) || 'home', false) || showPage('home', false);
  window.addEventListener('hashchange', () => showPage(location.hash.slice(1) || 'home'));
} else {
  const active = body.dataset.activeNav;
  navLinks.forEach((l) => l.classList.toggle('active', l.dataset.nav === active));
  updateProgress();
}

/* ---------- typed hero title ---------- */
const typed = $('[data-typed]');
if (typed && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const words = ['Web Developer', 'Full-Stack Developer', 'React Developer', 'Tech Writer'];
  let w = 0, c = words[0].length, deleting = true;
  const tick = () => {
    const word = words[w];
    c += deleting ? -1 : 1;
    typed.textContent = word.slice(0, c);
    let delay = deleting ? 45 : 95;
    if (!deleting && c === word.length) { deleting = true; delay = 2200; }
    else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 400; }
    setTimeout(tick, delay);
  };
  setTimeout(tick, 2500);
}

/* ---------- portfolio filter ---------- */
const filterBtns = $$('[data-filter]');
const works = $$('.work');
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.toggle('active', b === btn));
    const f = btn.dataset.filter;
    works.forEach((item) => {
      const show = f === 'all' || item.dataset.cat.split(' ').includes(f);
      item.classList.toggle('hidden', !show);
      if (show) { item.style.animation = 'none'; void item.offsetWidth; item.style.animation = ''; }
    });
  });
});

/* ---------- lightbox ---------- */
if (lightbox) {
  $$('[data-lightbox]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const img = btn.closest('.work').querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
    });
  });
  lightbox.addEventListener('click', (e) => { if (e.target !== lightboxImg) closeLightbox(); });
}

/* ---------- color switcher ---------- */
const switcher = $('[data-switcher]');
const swatches = $$('[data-color]');
$('[data-switcher-toggle]').addEventListener('click', () => switcher.classList.toggle('open'));
const setAccent = (color) => {
  document.documentElement.style.setProperty('--accent', color);
  swatches.forEach((s) => s.classList.toggle('active', s.dataset.color === color));
};
swatches.forEach((s) => s.addEventListener('click', () => {
  setAccent(s.dataset.color);
  try { localStorage.setItem('accent', s.dataset.color); } catch (_) { /* storage unavailable */ }
}));
let saved = null;
try { saved = localStorage.getItem('accent'); } catch (_) { /* storage unavailable */ }
setAccent(swatches.some((s) => s.dataset.color === saved) ? saved : swatches[0].dataset.color);

/* ---------- contact form (static hosting → mail client) ---------- */
const form = $('[data-form]');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const subject = encodeURIComponent(d.get('subject') || `Portfolio contact from ${d.get('name')}`);
    const text = encodeURIComponent(`${d.get('message')}\n\n— ${d.get('name')} (${d.get('email')})`);
    location.href = `mailto:jahidorjahid@gmail.com?subject=${subject}&body=${text}`;
  });
}

/* ---------- blog post ---------- */
const postBody = $('[data-post-body]');
if (postBody) {
  // reading time
  const words = postBody.textContent.trim().split(/\s+/).length;
  $$('[data-reading-time]').forEach((el) => { el.textContent = `${Math.max(1, Math.round(words / 200))} min read`; });

  // share links
  const url = encodeURIComponent(location.href);
  const title = encodeURIComponent(document.title);
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    x: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
  };
  $$('[data-share]').forEach((a) => {
    const kind = a.dataset.share;
    if (shareUrls[kind]) { a.href = shareUrls[kind]; return; }
    a.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(location.href);
        a.classList.add('copied');
        setTimeout(() => a.classList.remove('copied'), 1600);
      } catch (_) { /* clipboard unavailable */ }
    });
  });

  // copy buttons on code blocks
  $$('pre', postBody).forEach((pre) => {
    const btn = document.createElement('button');
    btn.className = 'copy-code';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.querySelector('code').innerText);
        btn.textContent = 'Copied!';
      } catch (_) { btn.textContent = 'Press Ctrl+C'; }
      setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
    });
    pre.appendChild(btn);
  });
}

/* ---------- year ---------- */
$$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
