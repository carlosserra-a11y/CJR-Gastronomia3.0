/* Efeitos visuais: hero interativo, poeira dourada, brilho do cursor, veios na rolagem e contadores. */
(function (site) {
  'use strict';

  const DUST_COUNT = 46;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = () => window.matchMedia('(pointer: fine)').matches;

  /* ---------- Hero: parallax com o mouse, foco de luz e rolagem ---------- */
  function initHeroPointer(hero) {
    let frame = 0;
    let pending = null;
    hero.addEventListener('pointermove', (event) => {
      pending = event;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = hero.getBoundingClientRect();
        const x = (pending.clientX - rect.left) / rect.width;
        const y = (pending.clientY - rect.top) / rect.height;
        hero.style.setProperty('--px', (x * 2 - 1).toFixed(3));
        hero.style.setProperty('--py', (y * 2 - 1).toFixed(3));
        hero.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        hero.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      });
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--px', '0');
      hero.style.setProperty('--py', '0');
    });
  }

  function initHeroScroll(hero) {
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
      hero.style.setProperty('--scroll-y', `${(window.scrollY * 0.25).toFixed(1)}px`);
      hero.style.setProperty('--hero-fade', (progress * 1.4).toFixed(3));
    };
    window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  /* ---------- Poeira dourada (canvas leve, pausa fora da tela) ---------- */
  function createParticle(w, h, anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: 0.6 + Math.random() * 1.8,
      vy: 0.12 + Math.random() * 0.35,
      vx: (Math.random() - 0.5) * 0.15,
      phase: Math.random() * Math.PI * 2,
    };
  }

  function initDust(hero) {
    const canvas = hero.querySelector('[data-hero-dust]');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let running = false;
    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: DUST_COUNT }, () => createParticle(w, h, true));
    };
    const tick = (time) => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      particles = particles.map((p) => (p.y < -10 ? createParticle(w, h, false) : { ...p, x: p.x + p.vx, y: p.y - p.vy }));
      particles.forEach((p) => {
        const alpha = 0.25 + 0.55 * Math.abs(Math.sin(time / 1400 + p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 205, 140, ${alpha.toFixed(3)})`;
        ctx.fill();
      });
      requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && !document.hidden;
      if (visible && !running) { running = true; requestAnimationFrame(tick); }
      if (!visible) running = false;
    });
    resize();
    observer.observe(hero);
    window.addEventListener('resize', resize);
  }

  /* ---------- Brilho dourado que acompanha o cursor (desktop) ---------- */
  function initCursorGlow() {
    const glow = document.querySelector('.cursor-glow');
    if (!glow || !finePointer()) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    window.addEventListener('pointermove', (event) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        glow.style.setProperty('--gx', `${x}px`);
        glow.style.setProperty('--gy', `${y}px`);
        glow.classList.add('is-active');
      });
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => glow.classList.remove('is-active'));
  }

  /* ---------- Veios dourados que se desenham conforme a rolagem ---------- */
  function initVeins() {
    const veins = Array.from(document.querySelectorAll('.vein'));
    if (!veins.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      veins.forEach((vein) => {
        const rect = vein.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height * 0.6)));
        vein.style.setProperty('--draw', progress.toFixed(3));
      });
    };
    window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  /* ---------- Contadores (ex.: 12 anos) ---------- */
  function animateCount(el) {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((entry) => {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => observer.observe(el));
  }

  /** Altura real do hero em --hero-h: Serviços desloca o mármore por ela para a pedra continuar sem emenda. */
  function trackHeroHeight(hero) {
    const set = () => document.documentElement.style.setProperty('--hero-h', `${hero.offsetHeight}px`);
    set();
    if ('ResizeObserver' in window) new ResizeObserver(set).observe(hero);
    else window.addEventListener('resize', set);
  }

  function init() {
    const hero = document.querySelector('[data-hero]');
    if (hero) trackHeroHeight(hero);
    if (reducedMotion()) return;
    if (hero) {
      if (finePointer()) initHeroPointer(hero);
      initHeroScroll(hero);
      initDust(hero);
    }
    initCursorGlow();
    initVeins();
    initCounters();
  }

  site.effects = Object.freeze({ init });
})(window.ChefSite);
