/* Carrossel horizontal com scroll-snap, setas, progresso e arraste com o mouse. */
(function (site) {
  'use strict';

  const DRAG_THRESHOLD_PX = 6;
  const pad = (value) => String(value).padStart(2, '0');
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function enableMouseDrag(track) {
    let startX = 0;
    let startScroll = 0;
    let moved = false;
    let pointerId = null;

    track.querySelectorAll('img').forEach((img) => { img.draggable = false; });
    track.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      moved = false;
    });
    track.addEventListener('pointermove', (event) => {
      if (event.pointerId !== pointerId) return;
      const delta = event.clientX - startX;
      if (!moved && Math.abs(delta) < DRAG_THRESHOLD_PX) return;
      if (!moved) {
        moved = true;
        track.classList.add('is-dragging');
        track.setPointerCapture(pointerId);
      }
      track.scrollLeft = startScroll - delta;
    });
    const endDrag = () => {
      pointerId = null;
      track.classList.remove('is-dragging');
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    // Evita que o fim de um arraste dispare o clique (abrir galeria / adicionar).
    track.addEventListener('click', (event) => {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    }, true);
  }

  function setDisabled(button, disabled) {
    button.setAttribute('aria-disabled', String(disabled));
  }

  function initCarousel(root) {
    if (root.dataset.carouselReady) return;
    const track = root.querySelector('[data-carousel-track]');
    const slides = Array.from(track.children);
    if (!slides.length) return;
    root.dataset.carouselReady = 'true';
    const prevBtn = root.querySelector('[data-carousel-prev]');
    const nextBtn = root.querySelector('[data-carousel-next]');
    const bar = root.querySelector('[data-carousel-bar]');
    const current = root.querySelector('[data-carousel-current]');
    const total = root.querySelector('[data-carousel-total]');
    let frame = 0;
    if (total) total.textContent = pad(slides.length);

    const step = () => slides[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);

    function update() {
      frame = 0;
      const max = track.scrollWidth - track.clientWidth;
      const atStart = track.scrollLeft <= 2;
      const atEnd = track.scrollLeft >= max - 2;
      const visible = Math.max(1, Math.round(track.clientWidth / step()));
      const minRatio = Math.min(1, visible / slides.length);
      const ratio = max > 0 ? track.scrollLeft / max : 1;
      if (bar) bar.style.transform = `scaleX(${minRatio + (1 - minRatio) * ratio})`;
      if (current) current.textContent = pad(atEnd ? slides.length : Math.round(track.scrollLeft / step()) + 1);
      setDisabled(prevBtn, atStart);
      setDisabled(nextBtn, atEnd);
    }

    function go(direction, button) {
      if (button.getAttribute('aria-disabled') === 'true') return;
      track.scrollBy({ left: direction * step(), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }

    prevBtn.addEventListener('click', () => go(-1, prevBtn));
    nextBtn.addEventListener('click', () => go(1, nextBtn));
    track.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', () => { if (!frame) frame = requestAnimationFrame(update); });
    enableMouseDrag(track);
    update();
  }

  function init() {
    document.querySelectorAll('[data-carousel]').forEach(initCarousel);
  }

  site.carousel = Object.freeze({ init, initCarousel });
})(window.ChefSite);
