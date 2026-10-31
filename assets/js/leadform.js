/*
 * Formulário de orçamento compartilhado (gaveta, página inicial e Contato).
 * Coleta só o necessário (LGPD). Os dados ficam apenas na memória da página
 * e seguem pelo WhatsApp por ação do próprio visitante; nada é gravado no site.
 */
(function (site) {
  'use strict';

  const MAX_GUESTS = 5000;
  const NOTE_MAX = 500;

  /** @type {{ name: string, label: string, type: string, full?: boolean, optional?: boolean, attrs?: object, error?: string, validate?: (v: string) => boolean }[]} */
  const FIELDS = [
    { name: 'nome', label: 'Seu nome', type: 'text', full: true, attrs: { autocomplete: 'name', maxlength: 80 }, error: 'Informe seu nome.', validate: (v) => v.trim().length >= 2 },
    { name: 'local', label: 'Local do evento', type: 'text', full: true, attrs: { maxlength: 120, placeholder: 'Cidade, bairro ou nome do espaço' }, error: 'Informe o local do evento.', validate: (v) => v.trim().length >= 3 },
    { name: 'convidados', label: 'Número de convidados', type: 'number', attrs: { inputmode: 'numeric', min: 1, max: MAX_GUESTS, step: 1 }, error: 'Informe o número de convidados (só números).', validate: (v) => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= MAX_GUESTS },
    { name: 'data', label: 'Data do evento', type: 'date', attrs: {}, error: 'Escolha uma data válida a partir de hoje.', validate: (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && v >= todayIso() && v <= maxDateIso() },
    { name: 'observacao', label: 'Observação', type: 'textarea', full: true, optional: true, attrs: { maxlength: NOTE_MAX, rows: 3, placeholder: 'Ex.: horário, tipo de evento, estilo de serviço' } },
  ];

  /** Detalhes do evento compartilhados entre os formulários da página (somente em memória). */
  let details = {};
  /** Autorização de marketing: opcional e desmarcada por padrão (LGPD, consentimento livre). */
  let marketing = false;
  const forms = [];

  function todayIso() {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  /** Limite de 5 anos à frente: evita datas digitadas com ano errado (ex.: 20266). */
  function maxDateIso() {
    return `${new Date().getFullYear() + 5}-12-31`;
  }

  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'text') node.textContent = value;
      else if (key === 'className') node.className = value;
      else node.setAttribute(key, String(value));
    });
    node.append(...children);
    return node;
  }

  function buildField(form, field) {
    const id = `${form.id}-${field.name}`;
    const label = el('label', { for: id }, [field.label]);
    if (field.optional) label.append(' ', el('span', { className: 'field__optional', text: '(opcional)' }));
    const control = field.type === 'textarea'
      ? el('textarea', { id, name: field.name, ...field.attrs })
      : el('input', { id, name: field.name, type: field.type, ...field.attrs });
    if (!field.optional) control.required = true;
    if (field.type === 'date') {
      control.min = todayIso();
      control.max = maxDateIso();
    }
    const error = el('p', { className: 'field__error', id: `${id}-erro` });
    control.setAttribute('aria-describedby', `${id}-erro`);
    const wrapper = el('div', { className: `field${field.full ? ' field--full' : ''}` }, [label, control, error]);
    if (field.type === 'textarea') wrapper.insertBefore(el('p', { className: 'field__hint', id: `${id}-dica`, text: `Até ${NOTE_MAX} caracteres.` }), error);
    return wrapper;
  }

  function buildServicesBox() {
    return el('div', { className: 'lead-form__services' }, [
      el('p', { className: 'lead-form__services-label', text: 'Serviços de interesse' }),
      el('ul', { className: 'chips', role: 'list', 'data-lead-services': '' }),
      el('p', { className: 'lead-form__services-empty', 'data-lead-services-empty': '', text: 'Nenhum serviço escolhido ainda.' }),
      el('button', { className: 'text-btn', type: 'button', 'data-quote-open': '', 'aria-controls': 'quote-drawer', text: 'Escolher ou editar serviços' }),
    ]);
  }

  function buildConsent(form) {
    const id = `${form.id}-marketing`;
    const box = el('input', { id, name: 'marketing', type: 'checkbox', value: 'sim' });
    const label = el('label', { for: id }, [
      'Autorizo o uso dos meus dados para receber novidades, promoções e conteúdos de marketing da CJR Gastronomia. Posso cancelar quando quiser. ',
      el('span', { className: 'field__optional', text: '(opcional)' }),
    ]);
    return el('div', { className: 'lead-form__consent' }, [box, label]);
  }

  function buildPrivacyNote() {
    const note = el('p', { className: 'lead-form__privacy' }, ['Usamos estes dados para preparar o seu orçamento e, só se você marcar a autorização de marketing, para enviar novidades e promoções. Ao enviar, o WhatsApp abre com a mensagem pronta e nada fica gravado neste site. Veja a ']);
    note.append(el('a', { href: 'privacidade.html', text: 'Política de Privacidade' }), '.');
    return note;
  }

  function buildForm(form) {
    const grid = el('div', { className: 'lead-form__grid' }, FIELDS.map((field) => buildField(form, field)));
    form.append(grid);
    if (form.dataset.showServices !== undefined) form.append(buildServicesBox());
    form.append(buildConsent(form));
    if (form.dataset.externalSubmit === undefined) {
      const submit = el('button', { className: 'btn btn--gold btn--lg btn--block', type: 'submit' });
      submit.innerHTML = '<svg aria-hidden="true"><use href="#i-whatsapp"/></svg>';
      submit.append('Enviar pedido pelo WhatsApp');
      form.append(submit, buildPrivacyNote());
    }
    form.append(el('p', { className: 'lead-form__status', role: 'status', 'data-lead-status': '' }));
  }

  function validateField(form, field) {
    if (!field.validate) return true;
    const input = form.elements.namedItem(field.name);
    const message = field.validate(input.value) ? '' : field.error;
    input.setAttribute('aria-invalid', String(Boolean(message)));
    document.getElementById(`${form.id}-${field.name}-erro`).textContent = message;
    return !message;
  }

  function syncOthers(source, name, value) {
    forms.filter((form) => form !== source).forEach((form) => {
      const input = form.elements.namedItem(name);
      if (input && input !== document.activeElement && input.value !== value) input.value = value;
    });
  }

  function onInput(form, event) {
    if (event.target.name === 'marketing') {
      marketing = event.target.checked;
      forms.filter((other) => other !== form).forEach((other) => { other.elements.namedItem('marketing').checked = marketing; });
      return;
    }
    const field = FIELDS.find((f) => f.name === event.target.name);
    if (!field) return;
    details = { ...details, [field.name]: event.target.value };
    syncOthers(form, field.name, event.target.value);
    if (event.target.getAttribute('aria-invalid') === 'true') validateField(form, field);
  }

  function showStatus(form, url) {
    const status = form.querySelector('[data-lead-status]');
    const link = el('a', { href: url, target: '_blank', rel: 'noopener', text: 'toque aqui para enviar' });
    status.replaceChildren('Abrimos o WhatsApp com o seu pedido pronto. Se ele não abriu, ', link, '.');
  }

  function submit(form) {
    const invalid = FIELDS.filter((field) => !validateField(form, field));
    if (invalid.length) {
      form.elements.namedItem(invalid[0].name).focus();
      return false;
    }
    const values = {
      ...Object.fromEntries(FIELDS.map((f) => [f.name, form.elements.namedItem(f.name).value.trim()])),
      marketing: form.elements.namedItem('marketing').checked,
    };
    const items = site.quote.items();
    const cta = form.dataset.cta || 'form';
    showStatus(form, site.whatsapp.open(site.whatsapp.leadMessage(values, items, cta), cta));
    if (site.analytics) site.analytics.track('generate_lead', { cta_id: cta, services_count: items.length, guests: Number(values.convidados) });
    return true;
  }

  function renderServices(items) {
    forms.forEach((form) => {
      const list = form.querySelector('[data-lead-services]');
      if (!list) return;
      list.replaceChildren(...items.map((item) => el('li', { className: 'chip', text: item.name })));
      list.hidden = items.length === 0;
      form.querySelector('[data-lead-services-empty]').hidden = items.length > 0;
    });
  }

  function mount(form) {
    if (!form || forms.includes(form)) return;
    buildForm(form);
    Object.entries(details).forEach(([name, value]) => { const input = form.elements.namedItem(name); if (input) input.value = value; });
    form.elements.namedItem('marketing').checked = marketing;
    form.noValidate = true;
    form.addEventListener('input', (event) => onInput(form, event));
    form.addEventListener('focusout', (event) => {
      const field = FIELDS.find((f) => f.name === event.target.name);
      if (field && event.target.value) validateField(form, field);
    });
    form.addEventListener('submit', (event) => { event.preventDefault(); submit(form); });
    forms.push(form);
    if (site.quote) renderServices(site.quote.items());
  }

  function init() {
    document.querySelectorAll('form[data-lead-form]').forEach(mount);
    document.addEventListener('quote:change', (event) => renderServices(event.detail.items));
  }

  site.leadForm = Object.freeze({ init, mount, buildPrivacyNote });
})(window.ChefSite);
