/* Carrossel horizontal com scroll-snap, setas, progresso e arraste com o mouse. */
(function (site) {
  'use strict';

  const DRAG_THRESHOLD_PX = 6;

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function enableMouseDrag(track) {
    let startX = 0;
    let startScroll = 0;
    let moved = false;
    let pointerId = null;

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
      if (pointerId === null) return;
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

  function initCarousel(root) {
    const track = root.querySelector('[data-carousel-track]');
    const slides = Array.from(track.children);
    const prevBtn = root.querySelector('[data-carousel-prev]');
    const nextBtn = root.querySelector('[data-carousel-next]');
    const bar = root.querySelector('[data-carousel-bar]');
    const current = root.querySelector('[data-carousel-current]');
    const total = root.querySelector('[data-carousel-total]');
    let frame = 0;

    total.textContent = pad(slides.length);

    function step() {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return slides[0].getBoundingClientRect().width + gap;
    }

    function update() {
      frame = 0;
      const max = track.scrollWidth - track.clientWidth;
      const atStart = track.scrollLeft <= 2;
      const atEnd = track.scrollLeft >= max - 2;
      const visible = Math.max(1, Math.round(track.clientWidth / step()));
      const ratio = max > 0 ? track.scrollLeft / max : 1;
      const minRatio = Math.min(1, visible / slides.length);
      bar.style.transform = `scaleX(${minRatio + (1 - minRatio) * ratio})`;
      current.textContent = pad(atEnd ? slides.length : Math.round(track.scrollLeft / step()) + 1);
      prevBtn.disabled = atStart;
      nextBtn.disabled = atEnd;
    }

    function requestUpdate() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    function go(direction) {
      track.scrollBy({ left: direction * step(), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }

    prevBtn.addEventListener('click', () => go(-1));
    nextBtn.addEventListener('click', () => go(1));
    track.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    enableMouseDrag(track);
    update();
  }

  function init() {
    document.querySelectorAll('[data-carousel]').forEach(initCarousel);
  }

  site.carousel = Object.freeze({ init });
})(window.ChefSite);
