/* Inicialização geral: navegação, rolagem, animações, dados legais e páginas internas. */
(function (site) {
  'use strict';

  const SOLID_HEADER_AFTER_PX = 24;
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Rolagem: sempre abrir no topo e âncoras suaves sem "#" na URL ---------- */
  /** scrollIntoView respeita o scroll-margin-top (altura do cabeçalho fixo). */
  function scrollToTarget(target, smooth) {
    target.scrollIntoView({ behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto', block: 'start' });
  }

  /** '#secao' -> elemento; hashes malformados (ex.: '#%E0%A4%A') não quebram a página. */
  function targetFromHash(hash) {
    if (!hash || hash.length < 2) return null;
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch (err) {
      return null;
    }
  }

  function initScrollBehavior() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const hashTarget = targetFromHash(window.location.hash);
    if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
    if (hashTarget) {
      window.requestAnimationFrame(() => scrollToTarget(hashTarget, false));
    } else {
      window.scrollTo(0, 0);
    }
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href*="#"]');
      if (!link || link.origin !== window.location.origin || link.pathname !== window.location.pathname) return;
      const target = targetFromHash(link.hash);
      if (!target) return;
      event.preventDefault();
      scrollToTarget(target, true);
      if (target.matches('main, section, footer')) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  }

  /* ---------- Cabeçalho e menu ---------- */
  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header || header.hasAttribute('data-header-solid')) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      header.classList.toggle('is-solid', window.scrollY > SOLID_HEADER_AFTER_PX);
    };
    window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  function initMenu() {
    const header = document.querySelector('[data-header]');
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.getElementById('main-nav');
    if (!header || !toggle || !nav) return;
    const label = toggle.querySelector('[data-menu-label]');
    const setOpen = (isOpen) => {
      header.classList.toggle('is-menu-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      label.textContent = isOpen ? 'Fechar menu' : 'Abrir menu';
      if (isOpen) nav.querySelector('a').focus();
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (event) => { if (event.target.closest('a')) setOpen(false); });
    // Abrir "Meu orçamento" fecha o menu do celular (senão ele reapareceria ao fechar a gaveta).
    document.addEventListener('click', (event) => {
      if (event.target.closest('[data-quote-open], [data-quote-add]') && header.classList.contains('is-menu-open')) setOpen(false);
    }, true);
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !header.classList.contains('is-menu-open')) return;
      setOpen(false);
      toggle.focus();
    });
  }

  function initActiveNav() {
    const links = Array.from(document.querySelectorAll('.main-nav a[href*="#"]'))
      .filter((link) => link.pathname === window.location.pathname && document.getElementById(link.hash.slice(1)));
    if (!links.length || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((entry) => {
        links.forEach((link) => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((link) => observer.observe(document.getElementById(link.hash.slice(1))));
  }

  /* ---------- Animações de entrada ---------- */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((entry) => {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 }); // threshold 0: funciona até em blocos mais altos que a tela
    items.forEach((el) => observer.observe(el));
  }

  /* ---------- Configurações refletidas na página ---------- */
  function initFeatures() {
    document.querySelectorAll('[data-feature]').forEach((el) => { el.hidden = !site.config.features[el.dataset.feature]; });
  }

  function initHeroVideo() {
    const video = document.querySelector('[data-hero-video]');
    const { mp4, webm } = site.config.heroVideo;
    if (!video || (!mp4 && !webm) || prefersReducedMotion()) return;
    [[webm, 'video/webm'], [mp4, 'video/mp4']].filter(([src]) => src).forEach(([src, type]) => {
      const source = document.createElement('source');
      source.src = src;
      source.type = type;
      video.append(source);
    });
    video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
    video.preload = 'auto';
    video.load();
    video.play().catch(() => { /* Autoplay bloqueado: a imagem continua como fundo. */ });
  }

  /** Dados legais: preenche [data-legal="campo"]; vazio aparece como pendência visível nas políticas. */
  function initLegalData() {
    const legal = site.config.legal;
    document.querySelectorAll('[data-legal]').forEach((el) => {
      const value = legal[el.dataset.legal];
      el.textContent = value || el.dataset.placeholder || '[a preencher]';
      el.classList.toggle('fill--ok', Boolean(value));
    });
    const line = document.querySelector('[data-legal-line]');
    if (line) {
      const parts = [legal.razaoSocial || legal.nomeFantasia, legal.cnpj && `CNPJ ${legal.cnpj}`, [legal.endereco, legal.cidadeUf].filter(Boolean).join(', ')].filter(Boolean);
      line.textContent = parts.join(' · ');
    }
    document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
    document.querySelectorAll('[data-instagram]').forEach((link) => { link.href = site.config.instagram; });
  }

  /* ---------- Páginas legais: sumário, leitura e voltar ao topo ---------- */
  function initLegalPage() {
    const article = document.querySelector('[data-legal-article]');
    const toc = document.querySelector('[data-legal-toc]');
    if (!article || !toc) return;
    const headings = Array.from(article.querySelectorAll('h2[id]'));
    toc.replaceChildren(...headings.map((h) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${h.id}`;
      a.textContent = h.textContent;
      li.append(a);
      return li;
    }));
    const links = Array.from(toc.querySelectorAll('a'));
    const observer = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((entry) => {
        links.forEach((a) => a.setAttribute('aria-current', String(a.hash === `#${entry.target.id}`)));
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    headings.forEach((h) => observer.observe(h));
  }

  function initProgressAndTop() {
    const bar = document.querySelector('[data-read-progress]');
    const toTop = document.querySelector('[data-to-top]');
    if (!bar && !toTop) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      if (bar) bar.style.setProperty('--progress', progress.toFixed(4));
      if (toTop) toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
    if (toTop) toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      document.querySelector('.skip-link').focus({ preventScroll: true });
    });
    update();
  }

  /* ---------- Orquestração: cada etapa isolada para uma falha não derrubar o resto ---------- */
  function run(name, fn) {
    try {
      fn();
    } catch (err) {
      document.documentElement.classList.add('reveal-off');
      if (window.console && console.error) console.error(`[ChefSite] Falha ao iniciar "${name}":`, err);
    }
  }

  /** Abertura com o logo: some quando a página termina de carregar (mínimo de ~1,9 s para a animação). */
  function initIntro() {
    const intro = document.getElementById('intro');
    if (!intro || document.documentElement.classList.contains('intro-seen')) return;
    const MIN_MS = 1900;
    const done = () => {
      intro.classList.add('is-done');
      try { sessionStorage.setItem('cjr-intro', '1'); } catch (err) { /* sem armazenamento: a abertura volta na próxima página */ }
    };
    const finish = () => window.setTimeout(done, Math.max(0, MIN_MS - (Date.now() - (window.__introStart || 0))));
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
  }

  const steps = [
    ['intro', initIntro],
    ['scroll', initScrollBehavior],
    ['reveal', initReveal],
    ['menu', initMenu],
    ['header', initHeader],
    ['features', initFeatures],
    ['legal-data', initLegalData],
    ['consent', () => site.consent.init()],
    ['whatsapp', () => site.whatsapp.bindLinks(document)],
    ['lead-form', () => site.leadForm.init()],
    ['quote', () => site.quote.init()],
    ['lightbox', () => site.lightbox.init()],
    ['carousel', () => site.carousel.init()],
    ['portfolio', () => site.portfolioGallery.init()],
    ['reviews', () => site.reviews.init()],
    ['effects', () => site.effects.init()],
    ['active-nav', initActiveNav],
    ['hero-video', initHeroVideo],
    ['legal-page', initLegalPage],
    ['progress', initProgressAndTop],
  ];
  steps.forEach(([name, fn]) => run(name, fn));
  site.ready = true;
})(window.ChefSite);
