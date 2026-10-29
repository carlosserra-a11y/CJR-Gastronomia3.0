/* Inicialização geral: cabeçalho, menu, animações de entrada, vídeo do hero e recursos ocultos. */
(function (site) {
  'use strict';

  const SOLID_HEADER_AFTER_PX = 24;

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function initHeader() {
    const header = document.querySelector('[data-header]');
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
    const label = document.querySelector('[data-menu-label]');
    const nav = document.getElementById('main-nav');

    const setOpen = (isOpen) => {
      header.classList.toggle('is-menu-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      label.textContent = isOpen ? 'Fechar menu' : 'Abrir menu';
    };

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (event) => { if (event.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && header.classList.contains('is-menu-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((el) => observer.observe(el));
  }

  function initActiveNav() {
    const links = Array.from(document.querySelectorAll('.main-nav a[href^="#"]'));
    const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if (!('IntersectionObserver' in window) || !sections.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          if (active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((section) => observer.observe(section));
  }

  function initHeroVideo() {
    const video = document.querySelector('[data-hero-video]');
    const { mp4, webm } = site.config.heroVideo;
    if (!video || (!mp4 && !webm) || prefersReducedMotion()) return;

    [[webm, 'video/webm'], [mp4, 'video/mp4']].forEach(([src, type]) => {
      if (!src) return;
      const source = document.createElement('source');
      source.src = src;
      source.type = type;
      video.append(source);
    });
    video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
    video.preload = 'auto';
    video.load();
    video.play().catch(() => {
      // Autoplay bloqueado (economia de dados, por exemplo): a foto continua como fundo.
    });
  }

  function initFeatures() {
    const features = site.config.features;
    document.querySelectorAll('[data-feature]').forEach((el) => {
      el.hidden = !features[el.dataset.feature];
    });
  }

  function initConfigLinks() {
    const reviewsLink = document.querySelector('[data-google-reviews]');
    if (reviewsLink && site.config.googleReviewsUrl) {
      reviewsLink.href = site.config.googleReviewsUrl;
      reviewsLink.hidden = false;
    }
    document.querySelectorAll('[data-instagram]').forEach((link) => { link.href = site.config.instagram; });
    document.querySelectorAll('[data-hotmart-link]').forEach((link) => {
      const url = link.closest('[data-hotmart-url]')?.dataset.hotmartUrl;
      if (url) link.href = url;
    });
    document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  }

  function init() {
    initFeatures();
    initConfigLinks();
    site.whatsapp.hydrateLinks(document);
    site.quote.init();
    site.carousel.init();
    site.lightbox.init();
    site.form.init();
    initHeader();
    initMenu();
    initReveal();
    initActiveNav();
    initHeroVideo();
  }

  init();
})(window.ChefSite);
