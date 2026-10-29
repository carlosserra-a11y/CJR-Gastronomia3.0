/* Portfólio: filtros por categoria + dois carrosséis animados (sentidos opostos) + galeria. */
(function (site) {
  'use strict';

  const SPEED_PX_PER_S = 38;
  const SWAP_MS = 320;
  const els = {};
  let filter = 'todos';
  let resizeTimer = 0;

  const data = () => site.portfolio || { categories: [], photos: [] };
  const labelOf = (cat) => (data().categories.find((c) => c.id === cat) || {}).label || '';
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const filtered = () => data().photos.filter((p) => filter === 'todos' || p.cat === filter);
  const rowHeight = () => Math.min(300, Math.max(190, window.innerWidth * 0.22));

  function buildFilters() {
    const all = [{ id: 'todos', label: 'Todos' }, ...data().categories];
    const buttons = all.map((cat) => {
      const count = cat.id === 'todos' ? data().photos.length : data().photos.filter((p) => p.cat === cat.id).length;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter';
      btn.dataset.filter = cat.id;
      btn.setAttribute('aria-pressed', String(cat.id === filter));
      btn.innerHTML = '<span></span><span class="filter__count"></span>';
      btn.firstChild.textContent = cat.label;
      btn.lastChild.textContent = String(count);
      btn.lastChild.setAttribute('aria-label', `${count} fotos`);
      return btn;
    });
    els.filters.replaceChildren(...buttons);
  }

  function buildCard(photo, list, duplicate) {
    const li = document.createElement('li');
    li.className = 'p-card';
    li.innerHTML = '<button type="button"><img alt="" loading="lazy" decoding="async"><span class="p-card__label"></span></button>';
    const btn = li.querySelector('button');
    const img = li.querySelector('img');
    img.src = photo.thumb;
    img.width = photo.w;
    img.height = photo.h;
    img.draggable = false;
    btn.style.setProperty('--ar', `${photo.w} / ${photo.h}`);
    btn.setAttribute('aria-label', `Ampliar foto: ${photo.alt}`);
    li.querySelector('.p-card__label').textContent = labelOf(photo.cat);
    if (duplicate) {
      li.setAttribute('aria-hidden', 'true');
      btn.tabIndex = -1;
    }
    btn.addEventListener('click', () => openGallery(list, list.indexOf(photo), btn));
    return li;
  }

  /** Repete as fotos até preencher a largura e duplica o conjunto para o loop sem emenda. */
  function fillRow(track, rowPhotos, list) {
    const h = rowHeight();
    const gap = 14;
    const widthOf = (p) => (h * p.w) / p.h + gap;
    const base = [];
    let width = 0;
    while (rowPhotos.length && (width < window.innerWidth * 1.15 || base.length < rowPhotos.length)) {
      const photo = rowPhotos[base.length % rowPhotos.length];
      base.push(photo);
      width += widthOf(photo);
    }
    const animate = !reducedMotion();
    const cards = base.map((photo, i) => buildCard(photo, list, i >= rowPhotos.length));
    if (animate) cards.push(...base.map((photo) => buildCard(photo, list, true)));
    track.replaceChildren(...cards);
    track.style.setProperty('--duration', `${Math.max(30, width / SPEED_PX_PER_S)}s`);
  }

  function renderRows() {
    const list = filtered();
    const rowA = list.filter((_, i) => i % 2 === 0);
    const rowB = list.filter((_, i) => i % 2 === 1);
    fillRow(els.tracks[0], rowA.length ? rowA : list, list);
    fillRow(els.tracks[1], rowB.length ? rowB : list, list);
    els.marquees[1].hidden = list.length < 2;
    const label = filter === 'todos' ? '' : ` de ${labelOf(filter)}`;
    els.count.textContent = `${list.length} ${list.length === 1 ? 'foto' : 'fotos'}${label}`;
  }

  function setFilter(next) {
    if (next === filter) return;
    filter = next;
    els.filters.querySelectorAll('.filter').forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.filter === filter)));
    els.marquees.forEach((m) => m.classList.add('is-swapping'));
    window.setTimeout(() => {
      renderRows();
      els.marquees.forEach((m) => m.classList.remove('is-swapping'));
    }, reducedMotion() ? 0 : SWAP_MS);
  }

  function openGallery(list, index, trigger) {
    const title = filter === 'todos' ? 'Portfólio' : `Portfólio · ${labelOf(filter)}`;
    site.lightbox.open({ title, photos: list.map((p) => ({ src: p.src, alt: p.alt, thumb: p.thumb })), index: Math.max(0, index), trigger });
  }

  function togglePause() {
    const paused = els.section.classList.toggle('is-paused');
    els.pause.setAttribute('aria-pressed', String(paused));
    els.pauseLabel.textContent = paused ? 'Retomar animação' : 'Pausar animação';
  }

  /* ---------- "Os favoritos do Chef": carrossel automático dos melhores pratos ---------- */
  const SPOT_MS = 5200;
  const HIGHLIGHTS = [
    { file: 'quentes-17', title: 'Camarões ao molho cremoso', cat: 'quentes' },
    { file: 'doces-12', title: 'Torre de doces com gelo seco', cat: 'doces' },
    { file: 'frios-01', title: 'Ilha de frios com queijos e embutidos', cat: 'frios' },
    { file: 'finger-08', title: 'Minicheesecake de frutas vermelhas', cat: 'finger' },
    { file: 'quentes-18', title: 'Risoto cremoso', cat: 'quentes' },
    { file: 'doces-15', title: 'Red velvet com morangos', cat: 'doces' },
    { file: 'frios-04', title: 'Terrines de queijo com castanhas', cat: 'frios' },
    { file: 'finger-11', title: 'Gratinados individuais', cat: 'finger' },
  ];
  const spot = { index: 0, timer: 0, paused: false, hovering: false, visible: false };

  function buildSpotSlides(root) {
    const photos = HIGHLIGHTS.map((h) => ({ src: `assets/img/portfolio/${h.file}.webp`, alt: h.title }));
    const slides = HIGHLIGHTS.map((h, i) => {
      const li = document.createElement('li');
      li.className = 'spotlight__slide';
      li.innerHTML = '<button type="button"><img alt="" decoding="async"></button>';
      const img = li.querySelector('img');
      img.src = photos[i].src;
      img.alt = h.title;
      if (i > 0) img.loading = 'lazy';
      const btn = li.querySelector('button');
      btn.setAttribute('aria-label', `Ampliar foto: ${h.title}`);
      btn.addEventListener('click', () => site.lightbox.open({ title: 'Os favoritos do Chef', photos, index: i, serviceId: h.cat, trigger: btn }));
      return li;
    });
    root.querySelector('[data-spotlight-slides]').replaceChildren(...slides);
    root.querySelector('[data-spotlight-total]').textContent = String(HIGHLIGHTS.length).padStart(2, '0');
  }

  function showSpot(root, position) {
    spot.index = (position + HIGHLIGHTS.length) % HIGHLIGHTS.length;
    const item = HIGHLIGHTS[spot.index];
    root.querySelectorAll('.spotlight__slide').forEach((li, i) => {
      li.classList.toggle('is-active', i === spot.index);
      li.querySelector('button').tabIndex = i === spot.index ? 0 : -1;
      li.setAttribute('aria-hidden', String(i !== spot.index));
    });
    root.dataset.service = item.cat;
    root.querySelector('[data-spotlight-current]').textContent = String(spot.index + 1).padStart(2, '0');
    root.querySelector('[data-spotlight-title]').textContent = item.title;
    root.querySelector('[data-spotlight-cat]').textContent = labelOf(item.cat);
    root.classList.remove('is-running');
    void root.offsetWidth; // reinicia a barra de progresso
    if (shouldRun()) root.classList.add('is-running');
  }

  const shouldRun = () => spot.visible && !spot.paused && !spot.hovering && !reducedMotion();

  function scheduleSpot(root) {
    window.clearInterval(spot.timer);
    root.classList.toggle('is-running', shouldRun());
    if (shouldRun()) spot.timer = window.setInterval(() => showSpot(root, spot.index + 1), SPOT_MS);
  }

  function initSpotlight() {
    const root = document.querySelector('[data-spotlight]');
    if (!root) return;
    root.style.setProperty('--spot-ms', `${SPOT_MS}ms`);
    buildSpotSlides(root);
    const go = (step) => { showSpot(root, spot.index + step); scheduleSpot(root); };
    root.querySelector('[data-spotlight-prev]').addEventListener('click', () => go(-1));
    root.querySelector('[data-spotlight-next]').addEventListener('click', () => go(1));
    const pause = root.querySelector('[data-spotlight-pause]');
    if (reducedMotion()) pause.hidden = true;
    pause.addEventListener('click', () => {
      spot.paused = !spot.paused;
      pause.setAttribute('aria-pressed', String(spot.paused));
      pause.setAttribute('aria-label', spot.paused ? 'Retomar destaques' : 'Pausar destaques');
      scheduleSpot(root);
    });
    const hold = (value) => () => { spot.hovering = value; scheduleSpot(root); };
    root.addEventListener('pointerenter', hold(true));
    root.addEventListener('pointerleave', hold(false));
    root.addEventListener('focusin', hold(true));
    root.addEventListener('focusout', hold(false));
    new IntersectionObserver(([entry]) => { spot.visible = entry.isIntersecting; scheduleSpot(root); }, { threshold: 0.3 }).observe(root);
    showSpot(root, 0);
  }

  function init() {
    initSpotlight();
    els.section = document.querySelector('[data-portfolio]');
    if (!els.section || !data().photos.length) return;
    els.filters = els.section.querySelector('[data-portfolio-filters]');
    els.marquees = Array.from(els.section.querySelectorAll('.marquee'));
    els.tracks = els.marquees.map((m) => m.querySelector('.marquee__track'));
    els.count = els.section.querySelector('[data-portfolio-count]');
    els.pause = els.section.querySelector('[data-portfolio-pause]');
    els.pauseLabel = els.section.querySelector('[data-portfolio-pause-label]');
    buildFilters();
    renderRows();
    els.filters.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-filter]');
      if (btn) setFilter(btn.dataset.filter);
    });
    els.pause.addEventListener('click', togglePause);
    if (reducedMotion()) els.pause.hidden = true;
    els.section.querySelector('[data-portfolio-all]').addEventListener('click', (event) => openGallery(filtered(), 0, event.currentTarget));
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth === lastWidth) return; // barra de endereço do celular: só a altura muda
      lastWidth = window.innerWidth;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(renderRows, 250);
    });
  }

  site.portfolioGallery = Object.freeze({ init });
})(window.ChefSite);
