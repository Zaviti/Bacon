// =========================================================
// PULSO — app.js
// Vanilla JS, sem dependências. Estado em localStorage.
// =========================================================

const STORAGE_KEY = 'pulso.posts.v1';
const AVATAR_LETTERS = ['V', 'M', 'L', 'B', 'R', 'A', 'C'];
const NAMES = ['Marina Costa', 'Lucas Prado', 'Bia Souza', 'Rafa Lima', 'Ana Torres', 'Caio Rocha'];

const seedPosts = () => [
  {
    id: crypto.randomUUID(),
    author: 'Marina Costa',
    initials: 'M',
    time: 'há 2 h',
    text: 'Terminei minha primeira corrida de 10km hoje! 🏃‍♀️ O pôr do sol lá do alto valeu cada passo. #corrida #conquista',
    image: null,
    liked: false,
    saved: false,
    likes: 34,
    comments: 5,
  },
  {
    id: crypto.randomUUID(),
    author: 'Lucas Prado',
    initials: 'L',
    time: 'há 4 h',
    text: 'Testando o novo app Pulso — adorei que o botão de postar fica bem embaixo, dá pra usar com uma mão só no ônibus 👍',
    image: null,
    liked: true,
    saved: false,
    likes: 12,
    comments: 2,
  },
  {
    id: crypto.randomUUID(),
    author: 'Bia Souza',
    initials: 'B',
    time: 'ontem',
    text: 'Café da tarde com direito a bolo de cenoura caseiro. Receita da vó, sem erro. #comidacaseira',
    image: null,
    liked: false,
    saved: true,
    likes: 58,
    comments: 9,
  },
];

const activitySeed = [
  { type: 'like', text: 'Rafa Lima curtiu sua postagem', time: 'há 12 min' },
  { type: 'comment', text: 'Ana Torres comentou: "Que demais! 🔥"', time: 'há 40 min' },
  { type: 'follow', text: 'Caio Rocha começou a seguir você', time: 'há 3 h' },
  { type: 'like', text: 'Bia Souza e mais 6 curtiram sua postagem', time: 'ontem' },
];

// ---------------------------------------------------------
// Estado
// ---------------------------------------------------------
function loadPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* localStorage indisponível */ }
  const seeded = seedPosts();
  savePosts(seeded);
  return seeded;
}

function savePosts(posts) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); } catch (e) {}
}

let posts = loadPosts();
let pendingImage = null;
let pendingLocation = null;

// ---------------------------------------------------------
// Utilidades
// ---------------------------------------------------------
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function linkify(text) {
  const escaped = escapeHTML(text);
  return escaped.replace(/#(\p{L}[\p{L}0-9_]*)/gu, '<span class="post__tag">#$1</span>');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.hidden = false;
  requestAnimationFrame(() => toast.setAttribute('data-show', 'true'));
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.setAttribute('data-show', 'false');
    setTimeout(() => { toast.hidden = true; }, 220);
  }, 2200);
}

function hapticTap() {
  if (navigator.vibrate) navigator.vibrate(8);
}

// ---------------------------------------------------------
// Navegação por views (Início / Buscar / Atividade / Perfil)
// ---------------------------------------------------------
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item[data-view]');

function switchView(name) {
  views.forEach(v => v.classList.toggle('view--active', v.id === `view-${name}`));
  navItems.forEach(btn => {
    const active = btn.dataset.view === name;
    btn.classList.toggle('nav-item--active', active);
    if (active) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });
  document.getElementById('main').scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
  window.scrollTo(0, 0);
}

navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    hapticTap();
    switchView(btn.dataset.view);
  });
});

document.getElementById('btn-search-top').addEventListener('click', () => {
  switchView('search');
  document.getElementById('search-input').focus();
});

// ---------------------------------------------------------
// Render: Feed
// ---------------------------------------------------------
function timeLabel(iso) {
  return iso; // já vem formatado para posts novos ("agora")
}

function renderPost(post) {
  const el = document.createElement('article');
  el.className = 'post';
  el.dataset.id = post.id;
  el.innerHTML = `
    <div class="post__head">
      <div class="post__avatar">${post.initials}</div>
      <div class="post__meta">
        <div class="post__name">${escapeHTML(post.author)}</div>
        <div class="post__time">${escapeHTML(post.time)}</div>
      </div>
      <button class="post__more" aria-label="Mais opções">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
      </button>
    </div>
    ${post.text ? `<div class="post__text">${linkify(post.text)}</div>` : ''}
    ${post.image ? `<img class="post__image" src="${post.image}" alt="Imagem da postagem de ${escapeHTML(post.author)}" />` : ''}
    <div class="post__actions">
      <button class="post-action post-action--like ${post.liked ? 'post-action--liked' : ''}" aria-pressed="${post.liked}">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
        <span class="like-count">${post.likes}</span>
      </button>
      <button class="post-action post-action--comment">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5H4l1.9-4.2A8.38 8.38 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5Z"/></svg>
        <span>${post.comments}</span>
      </button>
      <button class="post-action post-action--share">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></svg>
      </button>
      <span class="spacer"></span>
      <button class="post-action post-action--save ${post.saved ? 'post-action--saved' : ''}" aria-pressed="${post.saved}">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/></svg>
      </button>
    </div>
  `;

  el.querySelector('.post-action--like').addEventListener('click', () => toggleLike(post.id));
  el.querySelector('.post-action--save').addEventListener('click', () => toggleSave(post.id));
  el.querySelector('.post-action--share').addEventListener('click', () => showToast('Link copiado'));
  el.querySelector('.post-action--comment').addEventListener('click', () => showToast('Comentários em breve'));
  el.querySelector('.post__more').addEventListener('click', () => showToast('Mais opções em breve'));

  return el;
}

function renderFeed() {
  const list = document.getElementById('feed-list');
  list.innerHTML = '';
  posts.forEach(p => list.appendChild(renderPost(p)));
  document.getElementById('feed-end').style.display = posts.length ? 'flex' : 'none';
  renderProfile();
}

function toggleLike(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;
  savePosts(posts);
  hapticTap();
  renderFeed();
}

function toggleSave(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;
  post.saved = !post.saved;
  savePosts(posts);
  showToast(post.saved ? 'Postagem salva' : 'Removida dos salvos');
  renderFeed();
}

// ---------------------------------------------------------
// Stories (decorativo, dá contexto visual ao feed)
// ---------------------------------------------------------
function renderStories() {
  const wrap = document.getElementById('stories');
  const you = { name: 'Você', initials: 'V', seen: false, isYou: true };
  const others = NAMES.slice(0, 5).map((n, i) => ({ name: n.split(' ')[0], initials: n[0], seen: i % 2 === 0 }));
  const all = [you, ...others];
  wrap.innerHTML = all.map(s => `
    <div class="story">
      <div class="story__ring ${s.seen ? 'story__ring--seen' : ''}">
        <div class="story__avatar">${s.isYou ? '+' : s.initials}</div>
      </div>
      <span class="story__name">${s.isYou ? 'Você' : s.name}</span>
    </div>
  `).join('');
  wrap.querySelectorAll('.story').forEach((el, i) => {
    el.addEventListener('click', () => {
      if (i === 0) openComposer();
      else showToast('Destaques em breve');
    });
  });
}

// ---------------------------------------------------------
// Atividade
// ---------------------------------------------------------
function renderActivity() {
  const list = document.getElementById('activity-list');
  const iconMap = {
    like: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>`,
    comment: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5H4l1.9-4.2A8.38 8.38 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5Z"/></svg>`,
    follow: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.5 5-6.5 8-6.5s6.5 2 8 6.5"/></svg>`,
  };
  list.innerHTML = activitySeed.map(a => `
    <div class="activity-item">
      <div class="activity-item__icon activity-item__icon--${a.type}">${iconMap[a.type]}</div>
      <p>${escapeHTML(a.text)}<br><small>${escapeHTML(a.time)}</small></p>
    </div>
  `).join('');
}

// ---------------------------------------------------------
// Perfil
// ---------------------------------------------------------
function renderProfile() {
  document.getElementById('stat-posts').textContent = posts.length;
  const grid = document.getElementById('profile-grid');
  if (!posts.length) {
    grid.innerHTML = `<div class="profile-grid__empty">Suas postagens aparecerão aqui.<br>Toque no botão + para começar.</div>`;
    return;
  }
  grid.innerHTML = posts.map(p => {
    if (p.image) {
      return `<div class="profile-grid__item" style="background-image:url('${p.image}')"></div>`;
    }
    return `<div class="profile-grid__item">${escapeHTML((p.text || '').slice(0, 40))}</div>`;
  }).join('');
}

// ---------------------------------------------------------
// Busca (filtro simples local)
// ---------------------------------------------------------
const TAGS = ['#corrida', '#comidacaseira', '#conquista', '#viagem', '#tecnologia'];

function renderSearchChips() {
  const wrap = document.getElementById('search-chips');
  wrap.innerHTML = TAGS.map(t => `<button class="chip">${t}</button>`).join('');
  wrap.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.getElementById('search-input').value = chip.textContent;
      runSearch(chip.textContent);
      wrap.querySelectorAll('.chip').forEach(c => c.classList.remove('chip--active'));
      chip.classList.add('chip--active');
    });
  });
}

function runSearch(query) {
  const results = document.getElementById('search-results');
  const q = query.trim().toLowerCase();
  if (!q) { results.innerHTML = ''; return; }
  const matches = posts.filter(p =>
    p.author.toLowerCase().includes(q) || (p.text || '').toLowerCase().includes(q)
  );
  results.innerHTML = '';
  if (!matches.length) {
    results.innerHTML = `<p style="color:var(--text-low); text-align:center; padding:24px 0;">Nada encontrado para "${escapeHTML(query)}"</p>`;
    return;
  }
  matches.forEach(p => results.appendChild(renderPost(p)));
}

document.getElementById('search-input').addEventListener('input', (e) => runSearch(e.target.value));

// ---------------------------------------------------------
// Composer (modal / bottom sheet) — aberto pelo FAB
// ---------------------------------------------------------
const backdrop = document.getElementById('composer-backdrop');
const sheet = document.getElementById('composer-sheet');
const textarea = document.getElementById('post-text');
const charCount = document.getElementById('char-count');
const submitBtn = document.getElementById('btn-submit-post');
const imageInput = document.getElementById('post-image-input');
const previewWrap = document.getElementById('composer-preview');
const previewImg = document.getElementById('composer-preview-img');

function openComposer() {
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.setAttribute('data-open', 'true'));
  document.body.style.overflow = 'hidden';
  setTimeout(() => textarea.focus(), 260);
}

function closeComposer() {
  backdrop.setAttribute('data-open', 'false');
  document.body.style.overflow = '';
  setTimeout(() => { backdrop.hidden = true; }, 240);
  textarea.value = '';
  charCount.textContent = '0';
  submitBtn.disabled = true;
  pendingImage = null;
  pendingLocation = null;
  previewWrap.hidden = true;
  previewImg.src = '';
  imageInput.value = '';
  document.getElementById('location-label').textContent = 'Local';
  document.getElementById('btn-add-location').removeAttribute('data-active');
}

document.getElementById('btn-add-post').addEventListener('click', () => { hapticTap(); openComposer(); });
document.getElementById('btn-open-composer-hint').addEventListener('click', openComposer);
document.getElementById('btn-cancel-post').addEventListener('click', closeComposer);
backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeComposer(); });

textarea.addEventListener('input', () => {
  const len = textarea.value.length;
  charCount.textContent = len;
  submitBtn.disabled = len === 0 && !pendingImage;
});

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    pendingImage = reader.result;
    previewImg.src = pendingImage;
    previewWrap.hidden = false;
    submitBtn.disabled = false;
  };
  reader.readAsDataURL(file);
});

document.getElementById('btn-remove-image').addEventListener('click', () => {
  pendingImage = null;
  previewWrap.hidden = true;
  imageInput.value = '';
  submitBtn.disabled = textarea.value.length === 0;
});

document.getElementById('btn-add-location').addEventListener('click', (btnEvt) => {
  const btn = btnEvt.currentTarget;
  if (pendingLocation) {
    pendingLocation = null;
    document.getElementById('location-label').textContent = 'Local';
    btn.removeAttribute('data-active');
    return;
  }
  pendingLocation = 'São Paulo, BR';
  document.getElementById('location-label').textContent = pendingLocation;
  btn.setAttribute('data-active', 'true');
});

submitBtn.addEventListener('click', () => {
  const text = textarea.value.trim();
  if (!text && !pendingImage) return;

  const newPost = {
    id: crypto.randomUUID(),
    author: 'Você',
    initials: 'V',
    time: 'agora',
    text: pendingLocation ? `${text}${text ? '\n' : ''}📍 ${pendingLocation}` : text,
    image: pendingImage,
    liked: false,
    saved: false,
    likes: 0,
    comments: 0,
  };

  posts.unshift(newPost);
  savePosts(posts);
  renderFeed();
  closeComposer();
  switchView('feed');
  showToast('Postagem publicada');
});

// ---------------------------------------------------------
// Atalho via manifest: /?action=new-post
// ---------------------------------------------------------
function checkStartAction() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('action') === 'new-post') {
    openComposer();
    history.replaceState({}, '', '/');
  }
}

// ---------------------------------------------------------
// Init
// ---------------------------------------------------------
function init() {
  renderStories();
  renderFeed();
  renderActivity();
  renderSearchChips();
  checkStartAction();
}
init();

// ---------------------------------------------------------
// Service Worker (PWA)
// ---------------------------------------------------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// ---------------------------------------------------------
// Prompt de instalação (A2HS) — botão discreto via toast
// ---------------------------------------------------------
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});
