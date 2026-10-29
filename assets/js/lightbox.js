/* Galeria em tela cheia para as fotos de cada serviço. */
(function (site) {
  'use strict';

  const SWIPE_MIN_PX = 50;

  const els = {};
  /** @type {{ src: string, alt: string }[]} */
  let photos = [];
  let index = 0;
  let serviceId = '';
  let lastTrigger = null;
  let handingOffToDrawer = false;

  function readPhotos(card) {
    const template = card.querySelector('template[data-gallery]');
    if (!template) return [];
    return Array.from(template.content.querySelectorAll('img')).map((img) => ({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt') || '',
    }));
  }

  function preload(position) {
    const photo = photos[(position + photos.length) % photos.length];
    if (photo) new Image().src = photo.src;
  }

  function show(position) {
    index = (position + photos.length) % photos.length;
    const photo = photos[index];
    els.img.classList.remove('is-entering');
    els.img.src = photo.src;
    els.img.alt = photo.alt;
    void els.img.offsetWidth; // reinicia a animação de entrada
    els.img.classList.add('is-entering');
    els.caption.textContent = photo.alt;
    els.count.textContent = `Foto ${index + 1} de ${photos.length}`;
    const single = photos.length < 2;
    els.prev.hidden = single;
    els.next.hidden = single;
    preload(index + 1);
  }

  function updateAddButton() {
    const added = site.quote.has(serviceId);
    els.addLabel.textContent = added ? 'Ver meu orçamento' : 'Adicionar ao orçamento';
  }

  function openFor(card, trigger) {
    photos = readPhotos(card);
    if (!photos.length) return;
    serviceId = card.dataset.service;
    lastTrigger = trigger;
    els.title.textContent = card.dataset.serviceName;
    updateAddButton();
    show(0);
    site.scrollLock.lock();
    els.dialog.showModal();
    els.closeBtn.focus();
  }

  function close() {
    if (els.dialog.open) els.dialog.close();
  }

  function onClosed() {
    if (handingOffToDrawer) {
      handingOffToDrawer = false; // a gaveta assumiu o foco e o bloqueio de rolagem
      return;
    }
    site.scrollLock.unlock();
    if (lastTrigger) lastTrigger.focus();
  }

  function onAdd() {
    handingOffToDrawer = true;
    site.quote.add(serviceId);
    close();
    site.quote.open(lastTrigger);
  }

  function onKeydown(event) {
    if (event.key === 'ArrowRight') show(index + 1);
    if (event.key === 'ArrowLeft') show(index - 1);
  }

  function enableSwipe(stage) {
    let startX = null;
    stage.addEventListener('pointerdown', (event) => { startX = event.clientX; });
    stage.addEventListener('pointerup', (event) => {
      if (startX === null) return;
      const delta = event.clientX - startX;
      startX = null;
      if (Math.abs(delta) >= SWIPE_MIN_PX) show(index + (delta < 0 ? 1 : -1));
    });
  }

  function cacheElements() {
    els.dialog = document.querySelector('[data-lightbox]');
    if (!els.dialog) return false;
    els.title = els.dialog.querySelector('[data-lightbox-title]');
    els.count = els.dialog.querySelector('[data-lightbox-count]');
    els.img = els.dialog.querySelector('[data-lightbox-img]');
    els.caption = els.dialog.querySelector('[data-lightbox-caption]');
    els.prev = els.dialog.querySelector('[data-lightbox-prev]');
    els.next = els.dialog.querySelector('[data-lightbox-next]');
    els.closeBtn = els.dialog.querySelector('[data-lightbox-close]');
    els.add = els.dialog.querySelector('[data-lightbox-add]');
    els.addLabel = els.dialog.querySelector('[data-lightbox-add-label]');
    els.stage = els.dialog.querySelector('[data-lightbox-stage]');
    return true;
  }

  function init() {
    if (!cacheElements() || typeof els.dialog.showModal !== 'function') return;

    document.querySelectorAll('.service-card [data-gallery-open]').forEach((btn) => {
      btn.addEventListener('click', () => openFor(btn.closest('.service-card'), btn));
    });
    els.prev.addEventListener('click', () => show(index - 1));
    els.next.addEventListener('click', () => show(index + 1));
    els.closeBtn.addEventListener('click', close);
    els.add.addEventListener('click', onAdd);
    els.dialog.addEventListener('keydown', onKeydown);
    els.dialog.addEventListener('click', (event) => {
      if (event.target === els.dialog) close();
    });
    els.dialog.addEventListener('close', onClosed);
    enableSwipe(els.stage);
  }

  site.lightbox = Object.freeze({ init });
})(window.ChefSite);
