/* Formulário de orçamento: validação, máscara de telefone e envio pelo WhatsApp. */
(function (site) {
  'use strict';

  const MAX_GUESTS = 5000;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const els = {};

  function todayIso() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function formatDateBr(iso) {
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  }

  /** @param {string} value */
  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  /* Cada validador devolve '' quando o valor é válido ou a mensagem de erro. */
  const validators = {
    nome: (v) => (v.trim().length >= 3 ? '' : 'Informe seu nome completo.'),
    telefone: (v) => {
      const size = v.replace(/\D/g, '').length;
      return size === 10 || size === 11 ? '' : 'Informe um telefone com DDD, por exemplo (48) 99999-9999.';
    },
    email: (v) => (!v.trim() || EMAIL_PATTERN.test(v.trim()) ? '' : 'Confira o e-mail informado.'),
    tipo: (v) => (v ? '' : 'Selecione o tipo de evento.'),
    data: (v) => (v && v >= todayIso() ? '' : 'Escolha uma data a partir de hoje.'),
    convidados: (v) => {
      const guests = Number(v);
      return Number.isInteger(guests) && guests >= 1 && guests <= MAX_GUESTS ? '' : 'Informe o número de convidados.';
    },
  };

  function fieldError(input) {
    return document.getElementById(`${input.id}-erro`);
  }

  function validateField(input) {
    const validate = validators[input.name];
    if (!validate) return true;
    const message = validate(input.value);
    input.setAttribute('aria-invalid', String(Boolean(message)));
    const error = fieldError(input);
    if (error) error.textContent = message;
    return !message;
  }

  function readValues() {
    const data = new FormData(els.form);
    return Object.fromEntries(Array.from(data.entries()).map(([key, value]) => [key, String(value).trim()]));
  }

  function buildMessage(values, services) {
    const serviceNames = services.length ? services.map((s) => s.name).join(', ') : 'A definir com o Chef';
    const lines = [
      'Olá, Chef Carlos! Gostaria de solicitar um orçamento.',
      '',
      `*Nome:* ${values.nome}`,
      `*Telefone:* ${values.telefone}`,
      values.email ? `*E-mail:* ${values.email}` : null,
      `*Tipo de evento:* ${values.tipo}`,
      `*Data:* ${formatDateBr(values.data)}`,
      `*Convidados:* ${values.convidados}`,
      `*Serviços de interesse:* ${serviceNames}`,
      '',
      'Enviado pelo site.',
    ];
    return lines.filter((line) => line !== null).join('\n');
  }

  function showStatus(url) {
    els.status.replaceChildren();
    els.status.append('Abrimos o WhatsApp com a sua mensagem pronta. Se ele não abriu, ');
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'toque aqui para enviar';
    els.status.append(link, '.');
    els.status.hidden = false;
  }

  function onSubmit(event) {
    event.preventDefault();
    const fields = Array.from(els.form.querySelectorAll('input[name], select[name]'));
    const invalid = fields.filter((input) => !validateField(input));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }
    const message = buildMessage(readValues(), site.quote.items());
    showStatus(site.whatsapp.open(message));
  }

  function renderServices(services) {
    const chips = services.map((service) => {
      const li = document.createElement('li');
      li.className = 'chip';
      li.textContent = service.name;
      return li;
    });
    els.servicesList.replaceChildren(...chips);
    els.servicesList.hidden = services.length === 0;
    els.servicesEmpty.hidden = services.length > 0;
  }

  function bindFieldEvents() {
    els.form.querySelectorAll('input[name], select[name]').forEach((input) => {
      input.addEventListener('blur', () => { if (input.value) validateField(input); });
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') validateField(input);
      });
    });
    els.phone.addEventListener('input', () => {
      els.phone.value = formatPhone(els.phone.value);
    });
  }

  function init() {
    els.form = document.querySelector('[data-quote-form]');
    if (!els.form) return;
    els.phone = els.form.querySelector('#f-telefone');
    els.date = els.form.querySelector('#f-data');
    els.status = els.form.querySelector('[data-form-status]');
    els.servicesList = els.form.querySelector('[data-form-services-list]');
    els.servicesEmpty = els.form.querySelector('[data-form-services-empty]');

    els.date.min = todayIso();
    bindFieldEvents();
    els.form.addEventListener('submit', onSubmit);
    document.addEventListener('quote:change', (event) => renderServices(event.detail.items));
    renderServices(site.quote.items());
  }

  site.form = Object.freeze({ init, formatPhone, buildMessage });
})(window.ChefSite);
