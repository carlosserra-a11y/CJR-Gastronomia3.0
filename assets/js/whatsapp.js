/* Mensagens prontas do WhatsApp: protocolo numerado, itens numerados, origem (CTA) e UTM. */
(function (site) {
  'use strict';

  const ORIGINS = {
    'hero-whatsapp': 'Topo da página inicial (botão Fale com o Chef)',
    'flutuante-inicio': 'Botão flutuante · página inicial',
    'flutuante-contato': 'Botão flutuante · página Contato',
    'flutuante-legal': 'Botão flutuante · páginas de políticas',
    'servicos-exclusivo': 'Serviços · cardápio exclusivo',
    'gaveta-orcamento': 'Meu orçamento (gaveta lateral)',
    'form-inicio': 'Formulário da página inicial',
    'form-contato': 'Formulário da página Contato',
    'contato-direto': 'Contato direto',
    'rodape': 'Rodapé',
    'avaliacoes': 'Seção de avaliações',
    'workshops': 'Workshops corporativos',
  };
  const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const DAY_MS = 86400000;

  const pad2 = (n) => String(n).padStart(2, '0');

  /** Protocolo único por pedido, ex.: CJR-261029-K7QM (data + código aleatório). */
  function protocol(date = new Date()) {
    const stamp = `${String(date.getFullYear()).slice(2)}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
    const bytes = new Uint8Array(4);
    window.crypto.getRandomValues(bytes);
    const code = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
    return `CJR-${stamp}-${code}`;
  }

  function originLabel(cta) {
    return ORIGINS[cta] || 'Site';
  }

  function sentAt(date = new Date()) {
    return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()} às ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  }

  /** '2026-12-12' -> '12/12/2026 (sábado), daqui a 44 dias' */
  function describeDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const event = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.round((event - today) / DAY_MS);
    const when = days === 0 ? 'hoje' : days === 1 ? 'amanhã' : `daqui a ${days} dias`;
    return `${pad2(d)}/${pad2(m)}/${y} (${WEEKDAYS[event.getDay()]}), ${when}`;
  }

  /** prefix '5' -> '5.1. Nome'; sem prefixo -> '1. Nome' */
  function numberedServices(items, prefix) {
    return items.map((item, i) => `   ${prefix ? `${prefix}.` : ''}${i + 1}. ${item.name}`);
  }

  function buildUrl(message, cta) {
    const number = String(site.config.whatsapp).replace(/\D/g, '');
    const { source, medium, campaign } = site.config.utm;
    const params = [
      message ? `text=${encodeURIComponent(message)}` : '',
      `utm_source=${encodeURIComponent(source)}`,
      `utm_medium=${encodeURIComponent(medium)}`,
      `utm_campaign=${encodeURIComponent(campaign)}`,
      `utm_content=${encodeURIComponent(cta || 'site')}`,
    ].filter(Boolean);
    return `https://wa.me/${number}?${params.join('&')}`;
  }

  /** Mensagem dos botões "Fale com o Chef" (inclui os serviços já escolhidos, se houver). */
  function genericMessage(cta, intro) {
    const items = site.quote ? site.quote.items() : [];
    const lines = [intro || 'Olá, Chef Carlos! Vim pelo site e gostaria de conversar sobre um evento.', ''];
    if (items.length) lines.push('*Serviços de interesse:*', ...numberedServices(items), '');
    lines.push(`*Protocolo:* ${protocol()}`, `Origem: ${originLabel(cta)}`);
    return lines.join('\n');
  }

  /** Pedido de orçamento completo, numerado para o Chef organizar os atendimentos. */
  function leadMessage(details, items, cta) {
    const services = items.length ? ['*5. Serviços de interesse:*', ...numberedServices(items, '5')] : ['*5. Serviços de interesse:* a definir com o Chef'];
    const guests = Number(details.convidados);
    return [
      '*PEDIDO DE ORÇAMENTO · CJR GASTRONOMIA*',
      `*Protocolo:* ${protocol()}`,
      '',
      `*1. Cliente:* ${details.nome}`,
      `*2. Local do evento:* ${details.local}`,
      `*3. Data do evento:* ${describeDate(details.data)}`,
      `*4. Convidados:* ${guests} ${guests === 1 ? 'pessoa' : 'pessoas'}`,
      ...services,
      `*6. Observações:* ${details.observacao || 'nenhuma'}`,
      '',
      `Origem: ${originLabel(cta)}`,
      `Enviado pelo site em ${sentAt()}`,
    ].join('\n');
  }

  /** Abre o WhatsApp numa nova aba; se o navegador bloquear, usa a aba atual. */
  function open(message, cta) {
    const url = buildUrl(message, cta);
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url;
    return url;
  }

  function track(cta) {
    if (site.analytics) site.analytics.track('whatsapp_click', { cta_id: cta, page_path: window.location.pathname });
  }

  /** Links [data-whatsapp]: cada clique gera um protocolo novo e registra o CTA de origem. */
  function bindLinks(root) {
    root.querySelectorAll('[data-whatsapp]').forEach((link) => {
      const cta = link.dataset.cta || 'site';
      const refresh = () => { link.href = buildUrl(genericMessage(cta, link.dataset.message), cta); };
      link.target = '_blank';
      link.rel = 'noopener';
      refresh();
      link.addEventListener('click', () => { refresh(); track(cta); });
    });
  }

  site.whatsapp = Object.freeze({ buildUrl, open, bindLinks, genericMessage, leadMessage, describeDate, track, originLabel });
})(window.ChefSite);
