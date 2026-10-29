/* Lista "Meu orçamento": estado, persistência e gaveta lateral. */
(function (site) {
  'use strict';

  /* Bloqueio de rolagem compartilhado entre a gaveta e a galeria. */
  site.scrollLock = Object.freeze({
    lock() {
      const root = document.documentElement;
      if (!document.body.classList.contains('is-locked')) {
        root.style.setProperty('--scrollbar-w', `${window.innerWidth - root.clientWidth}px`);
      }
      document.body.classList.add('is-locked');
    },
    unlock() {
      document.body.classList.remove('is-locked');
    },
  });

  const STORAGE_KEY = 'ccj-orcamento';
  const CLOSE_DELAY_MS = 450;
  const FOCUSABLE = 'a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])';

  /** @type {{ id: string, name: string, cover: string }[]} */
  let catalog = [];
  /** @type {string[]} */
  let selected = [];
  let lastTrigger = null;
  let closeTimer = 0;
  const els = {};

  /* ---------- Estado ---------- */

  function readStorage() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
    } catch (err) {
      return [];
    }
  }

  function writeStorage(ids) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (err) {
      // Armazenamento indisponível (aba anônima, por exemplo): a lista vale só para esta visita.
    }
  }

  function findService(id) {
    return catalog.find((service) => service.id === id);
  }

  function items() {
    return selected.map(findService).filter(Boolean);
  }

  function has(id) {
    return selected.includes(id);
  }

  function setSelected(next) {
    selected = next;
    writeStorage(selected);
    render();
    document.dispatchEvent(new CustomEvent('quote:change', { detail: { items: items() } }));
  }

  function add(id) {
    if (has(id) || !findService(id)) return;
    setSelected([...selected, id]);
    announce(`${findService(id).name} adicionado ao orçamento.`);
    bumpCount();
  }

  function remove(id) {
    if (!has(id)) return;
    setSelected(selected.filter((current) => current !== id));
    announce(`${findService(id).name} removido do orçamento.`);
  }

  /* ---------- Renderização ---------- */

  function announce(text) {
    if (els.announcer) els.announcer.textContent = text;
  }

  function bumpCount() {
    els.badges.forEach((badge) => {
      badge.classList.remove('is-bump');
      void badge.offsetWidth; // reinicia a animação
      badge.classList.add('is-bump');
    });
  }

  function buildDrawerItem(service) {
    const li = document.createElement('li');
    li.className = 'drawer-item';

    const img = document.createElement('img');
    img.src = service.cover;
    img.alt = '';
    img.width = 68;
    img.height = 68;

    const name = document.createElement('p');
    name.className = 'drawer-item__name';
    name.textContent = service.name;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'drawer-item__remove';
    removeBtn.textContent = 'Remover';
    removeBtn.setAttribute('aria-label', `Remover ${service.name}`);
    removeBtn.addEventListener('click', () => {
      remove(service.id);
      els.close.focus();
    });

    li.append(img, name, removeBtn);
    return li;
  }

  function buildSuggestItem(service) {
    const li = document.createElement('li');
    li.className = 'suggest-item';

    const name = document.createElement('span');
    name.textContent = service.name;

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'text-btn';
    addBtn.textContent = '+ Adicionar';
    addBtn.setAttribute('aria-label', `Adicionar ${service.name}`);
    addBtn.addEventListener('click', () => {
      add(service.id);
      els.close.focus();
    });

    li.append(name, addBtn);
    return li;
  }

  function quoteMessage() {
    const chosen = items();
    if (!chosen.length) return site.config.defaultMessage;
    const lines = chosen.map((service) => `• ${service.name}`).join('\n');
    return `Olá, Chef Carlos! Montei uma seleção no site e gostaria de um orçamento:\n\n${lines}\n\nPodemos conversar sobre data e número de convidados?`;
  }

  function renderDrawer(chosen) {
    els.list.replaceChildren(...chosen.map(buildDrawerItem));
    els.empty.hidden = chosen.length > 0;

    const remaining = catalog.filter((service) => !has(service.id));
    els.suggestList.replaceChildren(...remaining.map(buildSuggestItem));
    els.suggest.hidden = remaining.length === 0;
    els.suggestTitle.textContent = chosen.length ? 'Adicionar também' : 'Serviços disponíveis';

    els.whatsapp.href = site.whatsapp.buildUrl(quoteMessage());
    els.whatsappLabel.textContent = chosen.length ? 'Enviar seleção pelo WhatsApp' : 'Falar com o Chef pelo WhatsApp';
  }

  function render() {
    const chosen = items();
    els.counts.forEach((count) => { count.textContent = String(chosen.length); });
    els.cards.forEach((card) => card.classList.toggle('is-added', has(card.dataset.service)));
    renderDrawer(chosen);
  }

  /* ---------- Gaveta ---------- */

  function setExpanded(isOpen) {
    els.openers.forEach((btn) => btn.setAttribute('aria-expanded', String(isOpen)));
  }

  function trapFocus(event) {
    const focusables = Array.from(els.drawer.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onKeydown(event) {
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') trapFocus(event);
  }

  function isOpen() {
    return els.drawer.classList.contains('is-open');
  }

  function open(trigger) {
    if (isOpen()) return;
    window.clearTimeout(closeTimer);
    lastTrigger = trigger || document.activeElement;
    site.scrollLock.lock();
    els.drawer.hidden = false;
    els.backdrop.hidden = false;
    void els.drawer.offsetWidth; // garante a transição após remover [hidden]
    els.drawer.classList.add('is-open');
    els.backdrop.classList.add('is-open');
    setExpanded(true);
    document.addEventListener('keydown', onKeydown);
    els.close.focus();
  }

  function close(options = {}) {
    if (!isOpen()) return;
    els.drawer.classList.remove('is-open');
    els.backdrop.classList.remove('is-open');
    site.scrollLock.unlock();
    setExpanded(false);
    document.removeEventListener('keydown', onKeydown);
    closeTimer = window.setTimeout(() => {
      els.drawer.hidden = true;
      els.backdrop.hidden = true;
    }, CLOSE_DELAY_MS);
    if (options.restoreFocus !== false && lastTrigger) lastTrigger.focus();
  }

  function goToForm(event) {
    event.preventDefault();
    close({ restoreFocus: false });
    const form = document.getElementById('contato');
    const firstField = document.getElementById('f-nome');
    requestAnimationFrame(() => {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (firstField) firstField.focus({ preventScroll: true });
    });
  }

  /* ---------- Inicialização ---------- */

  function readCatalog() {
    return els.cards.map((card) => ({
      id: card.dataset.service,
      name: card.dataset.serviceName,
      cover: card.querySelector('.service-card__media img').getAttribute('src'),
    }));
  }

  function cacheElements() {
    els.drawer = document.querySelector('[data-drawer]');
    els.backdrop = document.querySelector('[data-drawer-backdrop]');
    els.close = els.drawer.querySelector('[data-drawer-close]');
    els.list = els.drawer.querySelector('[data-drawer-list]');
    els.empty = els.drawer.querySelector('[data-drawer-empty]');
    els.suggest = els.drawer.querySelector('[data-drawer-suggest]');
    els.suggestTitle = els.drawer.querySelector('[data-drawer-suggest-title]');
    els.suggestList = els.drawer.querySelector('[data-drawer-suggest-list]');
    els.whatsapp = els.drawer.querySelector('[data-drawer-whatsapp]');
    els.whatsappLabel = els.drawer.querySelector('[data-drawer-whatsapp-label]');
    els.formLink = els.drawer.querySelector('[data-drawer-form]');
    els.openers = Array.from(document.querySelectorAll('[data-quote-open]'));
    els.counts = Array.from(document.querySelectorAll('[data-quote-count]'));
    els.badges = Array.from(document.querySelectorAll('[data-quote-count-badge]'));
    els.cards = Array.from(document.querySelectorAll('.service-card[data-service]'));
    els.announcer = document.querySelector('[data-announcer]');
  }

  function bindEvents() {
    els.openers.forEach((btn) => btn.addEventListener('click', () => open(btn)));
    els.close.addEventListener('click', () => close());
    els.backdrop.addEventListener('click', () => close());
    els.formLink.addEventListener('click', goToForm);
    els.cards.forEach((card) => {
      const addBtn = card.querySelector('[data-quote-add]');
      addBtn.addEventListener('click', () => {
        add(card.dataset.service);
        open(addBtn);
      });
    });
  }

  function init() {
    cacheElements();
    if (!els.drawer) return;
    catalog = readCatalog();
    selected = readStorage().filter((id) => findService(id));
    bindEvents();
    render();
  }

  site.quote = Object.freeze({ init, add, remove, has, items, open, close });
})(window.ChefSite);
