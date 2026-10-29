/* Galeria em tela cheia (serviços e portfólio). API: ChefSite.lightbox.open({ title, photos, index, serviceId, trigger }). */
(function (site) {
  'use strict';

  const SWIPE_MIN_PX = 50;
  const els = {};
  /** @type {{ src: string, alt: string, thumb?: string }[]} */
  let photos = [];
  let index = 0;
  let serviceId = '';
  let lastTrigger = null;
  let handingOffToDrawer = false;

  function build() {
    const dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-labelledby', 'lightbox-title');
    dialog.innerHTML = `
      <div class="lightbox__head">
        <div><h2 class="lightbox__title" id="lightbox-title" data-lb-title></h2><p class="lightbox__count" data-lb-count aria-live="polite"></p></div>
        <button class="icon-btn" type="button" data-lb-close aria-label="Fechar galeria"><svg aria-hidden="true"><use href="#i-close"/></svg></button>
      </div>
      <div class="lightbox__stage" data-lb-stage>
        <figure class="lightbox__figure"><img class="lightbox__img" data-lb-img src="" alt=""><figcaption class="lightbox__caption" data-lb-caption aria-hidden="true"></figcaption></figure>
        <button class="icon-btn lightbox__nav lightbox__nav--prev" type="button" data-lb-prev aria-label="Foto anterior"><svg aria-hidden="true"><use href="#i-arrow-left"/></svg></button>
        <button class="icon-btn lightbox__nav lightbox__nav--next" type="button" data-lb-next aria-label="Próxima foto"><svg aria-hidden="true"><use href="#i-arrow-right"/></svg></button>
      </div>
      <ul class="lightbox__thumbs" role="list" data-lb-thumbs></ul>
      <div class="lightbox__foot" data-lb-foot><button class="btn btn--gold" type="button" data-lb-add><svg aria-hidden="true"><use href="#i-plus"/></svg><span data-lb-add-label>Adicionar ao orçamento</span></button></div>`;
    document.body.append(dialog);
    const q = (sel) => dialog.querySelector(sel);
    Object.assign(els, {
      dialog, title: q('[data-lb-title]'), count: q('[data-lb-count]'), img: q('[data-lb-img]'), caption: q('[data-lb-caption]'),
      prev: q('[data-lb-prev]'), next: q('[data-lb-next]'), close: q('[data-lb-close]'), thumbs: q('[data-lb-thumbs]'),
      foot: q('[data-lb-foot]'), add: q('[data-lb-add]'), addLabel: q('[data-lb-add-label]'), stage: q('[data-lb-stage]'),
    });
  }

  function renderThumbs() {
    const buttons = photos.map((photo, i) => {
      const li = document.createElement('li');
      li.innerHTML = '<button type="button"><img alt="" loading="lazy"></button>';
      li.querySelector('img').src = photo.thumb || photo.src;
      const btn = li.querySelector('button');
      btn.setAttribute('aria-label', `Ver foto ${i + 1} de ${photos.length}`);
      btn.addEventListener('click', () => show(i));
      return li;
    });
    els.thumbs.replaceChildren(...buttons);
    els.thumbs.hidden = photos.length < 2;
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
    els.prev.hidden = photos.length < 2;
    els.next.hidden = photos.length < 2;
    els.thumbs.querySelectorAll('button').forEach((btn, i) => btn.setAttribute('aria-current', String(i === index)));
    const nextPhoto = photos[(index + 1) % photos.length];
    if (nextPhoto) new Image().src = nextPhoto.src;
  }

  function open(options) {
    photos = options.photos || [];
    if (!photos.length || typeof els.dialog.showModal !== 'function') return; // navegador sem <dialog>: não trava a página
    serviceId = options.serviceId || '';
    lastTrigger = options.trigger || document.activeElement;
    els.title.textContent = options.title || 'Galeria';
    els.foot.hidden = !serviceId;
    if (serviceId) els.addLabel.textContent = site.quote.has(serviceId) ? 'Ver meu orçamento' : 'Adicionar ao orçamento';
    renderThumbs();
    show(options.index || 0);
    els.dialog.showModal();
    site.scrollLock.lock();
    els.close.focus();
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
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
  }

  function onAdd() {
    handingOffToDrawer = true;
    site.quote.add(serviceId);
    close();
    site.quote.open(lastTrigger);
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

  /** Cartões de serviço: <template data-gallery> com as fotos de cada serviço. */
  function bindServiceGalleries() {
    document.querySelectorAll('.service-card [data-gallery-open]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.service-card');
        const template = card.querySelector('template[data-gallery]');
        const list = Array.from(template.content.querySelectorAll('img')).map((img) => ({ src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' }));
        open({ title: card.querySelector('.service-card__title').textContent, photos: list, serviceId: card.dataset.service, trigger: btn });
      });
    });
  }

  function init() {
    build();
    if (typeof els.dialog.showModal !== 'function') return;
    els.prev.addEventListener('click', () => show(index - 1));
    els.next.addEventListener('click', () => show(index + 1));
    els.close.addEventListener('click', close);
    els.add.addEventListener('click', onAdd);
    els.dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') show(index + 1);
      if (event.key === 'ArrowLeft') show(index - 1);
    });
    els.dialog.addEventListener('click', (event) => { if (event.target === els.dialog) close(); });
    els.dialog.addEventListener('close', onClosed);
    enableSwipe(els.stage);
    bindServiceGalleries();
  }

  site.lightbox = Object.freeze({ init, open, close });
})(window.ChefSite);
