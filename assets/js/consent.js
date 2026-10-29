/*
 * Consentimento de cookies (LGPD) + Google Analytics 4 com Consent Mode.
 * Nenhum script de rastreamento é carregado antes do aceite.
 * Registro salvo no navegador: localStorage 'cjr-consent' = { v, analytics, date }.
 */
(function (site) {
  'use strict';

  const KEY = 'cjr-consent';
  const VERSION = 1;
  const MAX_AGE_DAYS = 365;
  let state = null;
  let gaLoaded = false;
  const els = {};

  const gaId = () => site.config.analytics.ga4Id;
  const hasOptional = () => Boolean(gaId());

  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!saved || saved.v !== VERSION) return null;
      const ageDays = (Date.now() - new Date(saved.date).getTime()) / 86400000;
      return ageDays <= MAX_AGE_DAYS ? saved : null;
    } catch (err) {
      return null;
    }
  }

  function save(analytics) {
    state = { v: VERSION, analytics: Boolean(analytics), date: new Date().toISOString() };
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      // Sem armazenamento: a escolha vale só para esta visita.
    }
    apply();
    hideBanner();
  }

  /* ---------- Google Analytics 4 ---------- */
  function loadAnalytics() {
    if (gaLoaded || !hasOptional()) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', gaId());
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId())}`;
    document.head.append(script);
  }

  function clearAnalyticsCookies() {
    // Todos os sufixos do domínio (ex.: www.site.com.br -> site.com.br, com.br), com e sem ponto inicial.
    const labels = window.location.hostname.split('.');
    const suffixes = labels.map((_, i) => labels.slice(i).join('.')).filter((d) => d.includes('.'));
    const domains = ['', ...suffixes.flatMap((d) => [d, `.${d}`])];
    document.cookie.split(';').map((c) => c.trim().split('=')[0]).filter((name) => /^_ga/.test(name)).forEach((name) => {
      domains.forEach((domain) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ''}`;
      });
    });
  }

  function apply() {
    if (state && state.analytics) {
      loadAnalytics();
      if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'granted' });
      return;
    }
    if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
    clearAnalyticsCookies();
  }

  /** Eventos sem dados pessoais (ex.: CTA de origem). Só enviados com consentimento. */
  function track(name, params) {
    if (state && state.analytics && window.gtag) window.gtag('event', name, params || {});
  }

  /* ---------- Interface ---------- */
  function buildBanner() {
    const banner = document.createElement('section');
    banner.className = 'consent-banner';
    banner.setAttribute('aria-labelledby', 'consent-title');
    banner.innerHTML = `
      <h2 id="consent-title">Cookies e privacidade</h2>
      <p>Usamos armazenamento essencial para o site funcionar. Com a sua permissão, também usamos cookies de estatística (Google Analytics) para entender como o site é usado. Você pode mudar a escolha quando quiser. <a href="cookies.html">Política de Cookies</a>.</p>
      <div class="consent-actions">
        <button class="btn btn--outline" type="button" data-consent="reject">Recusar</button>
        <button class="btn btn--outline" type="button" data-consent="custom">Personalizar</button>
        <button class="btn btn--gold" type="button" data-consent="accept">Aceitar</button>
      </div>`;
    banner.classList.add('on-dark');
    banner.addEventListener('click', (event) => {
      const action = event.target.closest('[data-consent]')?.dataset.consent;
      if (action === 'accept') save(true);
      if (action === 'reject') save(false);
      if (action === 'custom') openPreferences();
    });
    return banner;
  }

  function buildModal() {
    const dialog = document.createElement('dialog');
    dialog.className = 'consent-modal';
    dialog.setAttribute('aria-labelledby', 'consent-modal-title');
    const optionalNote = hasOptional() ? 'Google Analytics 4: páginas visitadas e cliques nos botões, sem dados de contato.' : 'Não utilizado no momento: nenhum script de estatística está ativo neste site.';
    dialog.innerHTML = `
      <form method="dialog" class="consent-modal__inner">
        <h2 id="consent-modal-title">Preferências de cookies</h2>
        <p>Escolha o que podemos usar. Os itens essenciais não podem ser desligados porque o site depende deles.</p>
        <div class="consent-option">
          <div><h3>Essenciais</h3><p>Guardam a sua escolha de cookies e a sua lista de serviços do orçamento, apenas neste navegador.</p></div>
          <label class="switch"><input type="checkbox" checked disabled aria-label="Essenciais, sempre ativos"><span></span></label>
        </div>
        <div class="consent-option">
          <div><h3>Estatística</h3><p>${optionalNote}</p></div>
          <label class="switch"><input type="checkbox" data-consent-analytics aria-label="Permitir cookies de estatística" ${hasOptional() ? '' : 'disabled'}><span></span></label>
        </div>
        <div class="consent-actions">
          <button class="btn btn--outline" type="submit" value="reject">Recusar opcionais</button>
          <button class="btn btn--dark" type="submit" value="save">Salvar escolhas</button>
        </div>
      </form>`;
    dialog.addEventListener('close', () => {
      if (dialog.returnValue === 'save') save(dialog.querySelector('[data-consent-analytics]').checked);
      if (dialog.returnValue === 'reject') save(false);
    });
    return dialog;
  }

  function hideBanner() {
    if (els.banner) els.banner.hidden = true;
  }

  function openPreferences() {
    if (!els.modal) {
      els.modal = buildModal();
      document.body.append(els.modal);
    }
    els.modal.querySelector('[data-consent-analytics]').checked = Boolean(state && state.analytics);
    els.modal.returnValue = '';
    els.modal.showModal();
  }

  function init() {
    state = read();
    document.querySelectorAll('[data-cookie-prefs]').forEach((btn) => btn.addEventListener('click', openPreferences));
    if (hasOptional() && !state) {
      els.banner = buildBanner();
      document.body.append(els.banner);
      return;
    }
    apply();
  }

  site.analytics = Object.freeze({ track });
  site.consent = Object.freeze({ init, openPreferences });
})(window.ChefSite);
