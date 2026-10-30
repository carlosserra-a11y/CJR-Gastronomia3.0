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

  /* ---------- Vídeo dos bastidores: loop sem som, pausa fora da tela e respeita "movimento reduzido" ---------- */
  /** Botões "incluir no orçamento" ao lado do vídeo: ligam/desligam o serviço e acompanham a gaveta. */
  function initVideoPicks(root) {
    const picks = Array.from(root.querySelectorAll('[data-video-service]'));
    if (!picks.length || !site.quote) return;
    const sync = () => picks.forEach((btn) => {
      const added = site.quote.has(btn.dataset.videoService);
      btn.setAttribute('aria-pressed', String(added));
      btn.querySelector('use').setAttribute('href', added ? '#i-check' : '#i-plus');
    });
    picks.forEach((btn) => btn.addEventListener('click', () => {
      const id = btn.dataset.videoService;
      if (site.quote.has(id)) site.quote.remove(id);
      else site.quote.add(id);
    }));
    document.addEventListener('quote:change', sync);
    sync();
  }

  function initFeatureVideo() {
    const root = document.querySelector('[data-feature-video]');
    if (!root) return;
    initVideoPicks(root);
    const video = root.querySelector('video');
    const toggle = root.querySelector('[data-video-toggle]');
    let userPaused = reducedMotion();
    let frame = 0;
    const play = () => { const result = video.play(); if (result) result.catch(() => { /* autoplay bloqueado: segue no pôster */ }); };
    // barra e anel de progresso acompanham o vídeo enquanto ele toca
    const tick = () => {
      if (video.duration) root.style.setProperty('--progress', (video.currentTime / video.duration).toFixed(4));
      frame = window.requestAnimationFrame(tick);
    };
    video.addEventListener('play', () => { window.cancelAnimationFrame(frame); frame = window.requestAnimationFrame(tick); });
    video.addEventListener('pause', () => window.cancelAnimationFrame(frame));
    const sync = () => {
      toggle.setAttribute('aria-pressed', String(userPaused));
      toggle.setAttribute('aria-label', userPaused ? 'Reproduzir vídeo' : 'Pausar vídeo');
      toggle.querySelector('use').setAttribute('href', userPaused ? '#i-play' : '#i-pause');
    };
    if (userPaused) {
      video.removeAttribute('autoplay');
      video.pause();
    }
    toggle.addEventListener('click', () => {
      userPaused = !userPaused;
      if (userPaused) video.pause();
      else play();
      sync();
    });
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) video.pause();
      else if (!userPaused) play();
    }, { threshold: 0.25 }).observe(root);
    sync();
  }

  function init() {
    initFeatureVideo();
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
