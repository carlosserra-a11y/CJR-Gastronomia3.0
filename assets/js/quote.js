/* "Meu orçamento": serviços escolhidos + detalhes do evento numa gaveta lateral. */
(function (site) {
  'use strict';

  /* Bloqueio de rolagem compartilhado entre a gaveta e a galeria. */
  site.scrollLock = Object.freeze({
    lock() {
      const root = document.documentElement;
      if (!document.body.classList.contains('is-locked')) root.style.setProperty('--scrollbar-w', `${window.innerWidth - root.clientWidth}px`);
      document.body.classList.add('is-locked');
    },
    unlock() {
      document.body.classList.remove('is-locked');
    },
  });

  const STORAGE_KEY = 'ccj-orcamento';
  const CLOSE_DELAY_MS = 450;
  let selected = [];
  let lastTrigger = null;
  let closeTimer = 0;
  let inertNodes = [];
  const els = {};

  const catalog = () => site.config.services;
  const findService = (id) => catalog().find((service) => service.id === id);
  const has = (id) => selected.includes(id);
  const items = () => selected.map(findService).filter(Boolean);

  function readStorage() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string' && findService(id)) : [];
    } catch (err) {
      return [];
    }
  }

  function writeStorage(ids) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (err) {
      // Sem armazenamento (aba anônima, por exemplo): a lista vale só para esta visita.
    }
  }

  function setSelected(next) {
    selected = next;
    writeStorage(selected);
    render();
    document.dispatchEvent(new CustomEvent('quote:change', { detail: { items: items() } }));
  }

  function announce(text) {
    const live = document.querySelector('[data-announcer]');
    if (live) live.textContent = text;
  }

  function add(id) {
    if (has(id) || !findService(id)) return;
    setSelected([...selected, id]);
    announce(`${findService(id).name} adicionado ao orçamento.`);
    document.querySelectorAll('[data-quote-count-badge]').forEach((badge) => {
      badge.classList.remove('is-bump');
      void badge.offsetWidth; // reinicia a animação
      badge.classList.add('is-bump');
    });
  }

  function remove(id) {
    if (!has(id)) return;
    setSelected(selected.filter((current) => current !== id));
    announce(`${findService(id).name} removido do orçamento.`);
  }

  /* ---------- Construção da gaveta ---------- */
  function buildDrawer() {
    const backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop';
    backdrop.hidden = true;
    const drawer = document.createElement('div');
    drawer.className = 'drawer';
    drawer.id = 'quote-drawer';
    drawer.hidden = true;
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-labelledby', 'drawer-title');
    drawer.innerHTML = `
      <div class="drawer__head">
        <div><p class="eyebrow">Orçamento personalizado</p><h2 class="drawer__title" id="drawer-title">Meu orçamento</h2></div>
        <button class="icon-btn" type="button" data-drawer-close aria-label="Fechar orçamento"><svg aria-hidden="true"><use href="#i-close"/></svg></button>
      </div>
      <div class="drawer__body">
        <p class="drawer__step"><span>1</span>Serviços escolhidos</p>
        <p class="drawer__empty" data-drawer-empty>Você ainda não escolheu serviços. Selecione abaixo o que deseja para o seu evento.</p>
        <ul class="drawer__list" role="list" data-drawer-list></ul>
        <details class="drawer__suggest" data-drawer-suggest><summary data-drawer-suggest-title>Adicionar outros serviços</summary><ul class="suggest-list" role="list" data-drawer-suggest-list></ul></details>
        <p class="drawer__step"><span>2</span>Detalhes do evento</p>
        <form id="drawer-form" data-lead-form data-external-submit data-cta="gaveta-orcamento" aria-label="Detalhes do evento"></form>
      </div>
      <div class="drawer__foot">
        <button class="btn btn--dark btn--block btn--lg" type="submit" form="drawer-form"><svg aria-hidden="true"><use href="#i-whatsapp"/></svg>Enviar pedido pelo WhatsApp</button>
      </div>`;
    document.body.append(backdrop, drawer);
    drawer.querySelector('.drawer__foot').append(site.leadForm.buildPrivacyNote());
    return { drawer, backdrop };
  }

  function buildDrawerItem(service, index) {
    const li = document.createElement('li');
    li.className = 'drawer-item';
    li.innerHTML = '<img alt="" width="60" height="60"><p class="drawer-item__name"><span class="drawer-item__num"></span></p><button type="button" class="drawer-item__remove">Remover</button>';
    li.querySelector('img').src = service.cover;
    li.querySelector('.drawer-item__num').textContent = `Serviço ${index + 1}`;
    li.querySelector('.drawer-item__name').append(service.name);
    const removeBtn = li.querySelector('button');
    removeBtn.setAttribute('aria-label', `Remover ${service.name}`);
    removeBtn.addEventListener('click', () => { remove(service.id); els.close.focus(); });
    return li;
  }

  function buildSuggestItem(service) {
    const li = document.createElement('li');
    li.className = 'suggest-item';
    li.innerHTML = '<span></span><button type="button" class="text-btn">+ Adicionar</button>';
    li.querySelector('span').textContent = service.name;
    const addBtn = li.querySelector('button');
    addBtn.setAttribute('aria-label', `Adicionar ${service.name}`);
    addBtn.addEventListener('click', () => { add(service.id); els.close.focus(); });
    return li;
  }

  function render() {
    const chosen = items();
    document.querySelectorAll('[data-quote-count]').forEach((count) => { count.textContent = String(chosen.length); });
    document.querySelectorAll('[data-quote-count-label]').forEach((label) => { label.textContent = chosen.length === 1 ? ' serviço' : ' serviços'; });
    document.querySelectorAll('.service-card[data-service]').forEach((card) => card.classList.toggle('is-added', has(card.dataset.service)));
    if (!els.drawer) return;
    els.list.replaceChildren(...chosen.map(buildDrawerItem));
    els.empty.hidden = chosen.length > 0;
    const remaining = catalog().filter((service) => !has(service.id));
    els.suggestList.replaceChildren(...remaining.map(buildSuggestItem));
    els.suggest.hidden = remaining.length === 0;
    els.suggest.open = chosen.length === 0;
    els.suggestTitle.textContent = chosen.length ? 'Adicionar outros serviços' : 'Escolher serviços';
  }

  /* ---------- Abrir / fechar ---------- */
  function setBackgroundInert(isInert) {
    if (isInert) {
      inertNodes = Array.from(document.body.children).filter((node) => node !== els.drawer && node !== els.backdrop && !node.matches('script, [data-announcer]'));
      inertNodes.forEach((node) => { node.inert = true; });
    } else {
      inertNodes.forEach((node) => { node.inert = false; });
      inertNodes = [];
    }
  }

  function setExpanded(isOpen) {
    document.querySelectorAll('[data-quote-open]').forEach((btn) => btn.setAttribute('aria-expanded', String(isOpen)));
  }

  const isOpen = () => Boolean(els.drawer) && els.drawer.classList.contains('is-open');

  function onKeydown(event) {
    if (event.key === 'Escape') close();
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
    setBackgroundInert(true);
    setExpanded(true);
    document.addEventListener('keydown', onKeydown);
    els.close.focus();
  }

  function close(options = {}) {
    if (!isOpen()) return;
    els.drawer.classList.remove('is-open');
    els.backdrop.classList.remove('is-open');
    setBackgroundInert(false);
    site.scrollLock.unlock();
    setExpanded(false);
    document.removeEventListener('keydown', onKeydown);
    closeTimer = window.setTimeout(() => { els.drawer.hidden = true; els.backdrop.hidden = true; }, CLOSE_DELAY_MS);
    if (options.restoreFocus !== false && lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
  }

  /* ---------- Inicialização ---------- */
  function bindEvents() {
    document.addEventListener('click', (event) => {
      const opener = event.target.closest('[data-quote-open]');
      if (opener) { open(opener); return; }
      const addBtn = event.target.closest('[data-quote-add]');
      if (addBtn) {
        add(addBtn.closest('[data-service]').dataset.service);
        open(addBtn);
      }
    });
    els.close.addEventListener('click', () => close());
    els.backdrop.addEventListener('click', () => close());
  }

  function init() {
    const { drawer, backdrop } = buildDrawer();
    Object.assign(els, {
      drawer, backdrop,
      close: drawer.querySelector('[data-drawer-close]'),
      list: drawer.querySelector('[data-drawer-list]'),
      empty: drawer.querySelector('[data-drawer-empty]'),
      suggest: drawer.querySelector('[data-drawer-suggest]'),
      suggestTitle: drawer.querySelector('[data-drawer-suggest-title]'),
      suggestList: drawer.querySelector('[data-drawer-suggest-list]'),
    });
    site.leadForm.mount(drawer.querySelector('#drawer-form'));
    selected = readStorage();
    bindEvents();
    render();
    document.dispatchEvent(new CustomEvent('quote:change', { detail: { items: items() } }));
  }

  site.quote = Object.freeze({ init, add, remove, has, items, open, close });
})(window.ChefSite);
