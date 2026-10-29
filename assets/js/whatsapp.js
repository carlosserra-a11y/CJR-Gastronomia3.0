/* Links e abertura do WhatsApp. */
(function (site) {
  'use strict';

  const BASE_URL = 'https://wa.me/';

  /**
   * @param {string} [message]
   * @returns {string}
   */
  function buildUrl(message) {
    const number = String(site.config.whatsapp).replace(/\D/g, '');
    const query = message ? `?text=${encodeURIComponent(message)}` : '';
    return `${BASE_URL}${number}${query}`;
  }

  /**
   * Abre o WhatsApp numa nova aba; se o navegador bloquear, usa a aba atual.
   * @param {string} message
   * @returns {string} a URL aberta
   */
  function open(message) {
    const url = buildUrl(message);
    const win = window.open(url, '_blank');
    if (win) {
      win.opener = null;
    } else {
      window.location.href = url;
    }
    return url;
  }

  /** Atualiza todos os links [data-whatsapp] com o número e a mensagem configurados. */
  function hydrateLinks(root) {
    root.querySelectorAll('[data-whatsapp]').forEach((link) => {
      link.href = buildUrl(link.dataset.message || site.config.defaultMessage);
      link.target = '_blank';
      link.rel = 'noopener';
    });
  }

  site.whatsapp = Object.freeze({ buildUrl, open, hydrateLinks });
})(window.ChefSite);
