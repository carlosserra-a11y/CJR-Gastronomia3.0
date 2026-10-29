/* ============================================================
   Site da CJR Gastronomia: carrega o cardápio, cuida das rotas
   (Quem Somos #/, Serviços #/servicos, Contato #/contato, cardápio
   #/servicos/…, páginas legais), das transições e dos efeitos.
   ============================================================ */
import { $, $$, setHTML, toast, storage } from "./util.js";
import { initMotion, onFrame, motion, scan, scrollTo, measure } from "./motion.js";
import { initCursor } from "./cursor.js";
import { initAmbient } from "./ambient.js";
import { mountCollage } from "./collage.js";
import { mountSignature } from "./signature.js";
import { mountReviews } from "./reviews.js";
import { openLightbox } from "./lightbox.js";
import { loadMenu, hasServer } from "./api.js";
import { initTracking, stopTracking, track, watchSections } from "./track.js";
import { initConsent, onConsent } from "./consent.js";
import { enableGA, disableGA, gaPage } from "./ga.js";
import { indexMenu } from "../shared/menu.js";
import { whatsappUrl, greetingText } from "../shared/quote.js";
import * as store from "./store.js";
import * as V from "./views.js";
import { LEGAL_PAGES } from "../shared/legal.js";
import { bindOrder, openOrder, getDraft, chosenService, onOrderChange } from "./order.js";
import { homeScenes, servicesScenes, pageScenes, pageCurtain, refreshScenes } from "./scenes.js";
import { openLayer, closeLayer, closeAll } from "./dialog.js";

const root = document.documentElement;
const view = $("#view");
const HOME_SECTIONS = new Set(["inicio", "chef", "sobre", "portfolio", "avaliacoes"]);
const SERVICE_SECTIONS = new Set(["como-funciona"]);
// nome de cada tela na origem dos cliques no WhatsApp (mensagem e estatísticas)
const PAGE_KEYS = { home: "quem-somos", services: "servicos", category: "cardapio", contact: "contato", legal: "legal" };
const app = { menu: null, idx: null, route: null, key: "", cleanups: [] };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

boot();

async function boot() {
  // Cada rota decide a própria rolagem; a restauração do navegador abriria a página no meio após recarregar.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  startAtTop();
  storage.remove("cjr:calc"); // a calculadora saiu do site: apaga a última simulação guardada no aparelho
  initMotion();
  initCursor();
  initAmbient();
  bindGlobal();
  setHTML(view, V.loadingView());
  const intro = wait(root.classList.contains("intro") ? 1500 : 0);
  try {
    app.menu = await loadMenu();
  } catch (e) {
    await intro;
    finishIntro();
    setHTML(view, V.errorView(e.message));
    return;
  }
  app.idx = indexMenu(app.menu);
  store.initStore(app.idx);
  // estatísticas e Google Analytics só com o "Aceitar" do aviso de cookies
  const applyConsent = (c) => {
    if (c?.stats) { initTracking({ server: hasServer() }); enableGA(app.menu.settings.gaId); } else { stopTracking(); disableGA(); }
  };
  applyConsent(initConsent());
  onConsent((c) => { applyConsent(c); if (c.stats) gaPage(); });
  const social = { ...app.menu.settings, reviewsUrl: app.menu.content.reviewsUrl };
  setHTML($("#headerSocial"), V.socialLinks(social, { wa: "topo" }));
  setHTML($("#drawerSocial"), V.socialLinks(social, { wa: "menu", pin: true }));
  setHTML($("#footer"), V.footerView(app.menu));
  if (!hasServer()) $(`#footer a[href="admin/"]`)?.remove(); // sem servidor (hospedagem estática) não há painel
  fillWhatsApp(document);
  peekWhatsApp();
  $("#orderTab").hidden = false;
  store.onChange(syncSelection);
  onOrderChange(syncSelection);
  window.addEventListener("hashchange", () => route());
  await intro;
  try {
    await route({ first: true });
  } finally {
    finishIntro(); // mesmo se a primeira tela falhar, a abertura nunca fica presa
  }
}

/**
 * Recarregar a página ou voltar a ela pelo histórico abre sempre no início: a aba guarda o último
 * endereço (#/servicos, #/contato…) e o site abria no meio. Links compartilhados de propósito continuam valendo.
 */
function startAtTop() {
  const nav = performance.getEntriesByType?.("navigation")?.[0];
  if (location.hash && nav && (nav.type === "reload" || nav.type === "back_forward")) {
    history.replaceState(null, "", location.pathname + location.search);
  }
}

/**
 * Links do WhatsApp (data-wa="origem"): a mensagem leva a origem do clique (ex.: "flutuante-servicos"),
 * para saber de qual botão veio cada conversa. O mesmo nome vai para as estatísticas (data-track).
 */
function fillWhatsApp(scope) {
  const s = app.menu.settings;
  for (const a of $$("[data-wa]", scope)) {
    const url = whatsappUrl(s.whatsapp, greetingText(s.whatsappGreeting, a.dataset.wa));
    if (!url) continue;
    a.href = url;
    a.dataset.track = a.dataset.wa;
    a.hidden = false;
  }
}

/** Botão flutuante do WhatsApp: uma vez por visita, mostra o convite "Fale com o Chef" por alguns segundos. */
function peekWhatsApp() {
  const btn = $(".wa-float");
  if (!btn || btn.hidden || motion.reduced) return;
  try { if (sessionStorage.getItem("cjr:wa-peek")) return; sessionStorage.setItem("cjr:wa-peek", "1"); } catch { /* sem armazenamento: mostra mesmo assim */ }
  setTimeout(() => btn.classList.add("is-peek"), 4000);
  setTimeout(() => btn.classList.remove("is-peek"), 9500);
}

function finishIntro() {
  root.classList.add("intro-done");
  const ready = () => root.classList.add("ready");
  requestAnimationFrame(ready);
  setTimeout(ready, 120); // aba aberta em segundo plano não roda requestAnimationFrame
  setTimeout(() => $("#preloader")?.remove(), 1800);
}

/* ---------------- Rotas ---------------- */

function parse() {
  // Âncoras comuns da página (ex.: "#main" do link de acessibilidade) não são rotas
  if (location.hash && !location.hash.startsWith("#/")) return null;
  let h = location.hash.replace(/^#\/?/, "");
  try { h = decodeURIComponent(h); } catch { h = ""; } // endereço malformado (ex.: "#/%") vai para o início
  const [a, b] = h.split("/");
  if (!a || a === "quem-somos") return { name: "home" };
  if (a === "servicos") return b ? { name: "category", id: b } : { name: "services" };
  if (SERVICE_SECTIONS.has(a)) return { name: "services", section: a };
  if (HOME_SECTIONS.has(a)) return { name: "home", section: a };
  if (a === "contato" || a === "orcamento") return { name: "contact" }; // #/orcamento: endereço antigo
  if (a === "privacidade" || a === "termos" || a === "reembolso") return { name: "legal", kind: a };
  return { name: "home" };
}

let navToken = 0;

async function route({ first = false } = {}) {
  const r = parse();
  if (!r) return;
  const token = ++navToken; // a navegação mais recente sempre vence (ex.: clicar e voltar durante a transição)
  const key = `${r.name}:${r.id || r.kind || ""}`;
  closeAll();
  if (key === app.key) { // mesma tela: só rola até a seção
    view.classList.remove("is-leaving");
    scrollTo((r.section && $(`#${r.section}`)) || 0);
    return;
  }
  // a cortina cobre a tela, a página troca por baixo e ela se abre (primeira visita: sem cortina)
  const show = () => {
    if (token !== navToken) return;
    render(r);
    app.key = key;
    if (r.section) requestAnimationFrame(() => scrollTo($(`#${r.section}`) || 0, { immediate: true }));
    else scrollTo(0, { immediate: true });
  };
  if (first) show(); else await pageCurtain(show);
  if (token !== navToken) return;
  track("page", { r: app.route, id: r.id || "" });
  if (!first) $("#main").focus({ preventScroll: true });
}

function render(r) {
  app.cleanups.forEach((fn) => fn());
  app.cleanups = [];
  const { menu } = app;
  const brand = menu.settings.brandName;
  let name = r.name;
  if (name === "category") {
    const cat = app.idx.categories.get(r.id)?.category;
    if (cat) {
      setHTML(view, V.categoryView(menu, cat));
      document.title = `${cat.name} · Cardápio · ${brand}`;
    } else name = "services"; // categoria que não existe mais: mostra os serviços
  }
  if (name === "home") {
    setHTML(view, V.homeView(menu));
    app.cleanups.push(
      mountCollage($("#portfolio"), menu.content.portfolio, { whatsapp: menu.settings.whatsapp }),
      mountSignature($("#assinatura"), menu.content.portfolio, { whatsapp: menu.settings.whatsapp }),
      mountReviews($("#avaliacoes")),
      pageEffects(),
      watchSections(view),
      homeScenes(view),
    );
    document.title = `${brand} · ${menu.content.heroKicker}`;
  }
  if (name === "services") {
    setHTML(view, V.servicesView(menu));
    app.cleanups.push(pageEffects(), watchSections(view), servicesScenes(view));
    document.title = `Serviços · ${brand}`;
  }
  if (name === "contact") {
    setHTML(view, V.contactView(menu, getDraft()));
    app.cleanups.push(bindOrder($("#orderForm", view), menu, { source: "contato" }), watchSections(view), pageScenes(view));
    document.title = `Contato · ${brand}`;
  }
  if (name === "legal") {
    setHTML(view, V.legalView(r.kind, menu));
    document.title = `${LEGAL_PAGES[r.kind].title} · ${brand}`;
    app.cleanups.push(mountLegal(view));
  }
  app.route = name;
  document.body.dataset.route = name;
  // botão flutuante: a origem muda com a página (ex.: "flutuante-servicos")
  const float = $(".wa-float");
  if (float) float.dataset.wa = `flutuante-${PAGE_KEYS[name]}`;
  fillWhatsApp(document);
  const current = { home: "#/", services: "#/servicos", category: "#/servicos", contact: "#/contato" }[name];
  $$(".nav a, .drawer-nav a").forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === current));
  if (name === "category" || name === "legal") app.cleanups.push(pageScenes(view));
  scan(view);
  syncSelection();
  // fotos e fontes mudam a altura da página depois de carregar: as cenas medem de novo
  setTimeout(refreshScenes, 400);
  setTimeout(refreshScenes, 1400);
}

/* ---------------- Efeitos das páginas ---------------- */

function animateCount(el) {
  const target = Number(el.dataset.count);
  if (!target || motion.reduced) return;
  const start = performance.now();
  const step = (t) => {
    const p = clamp((t - start) / 1600, 0, 1);
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Números do Chef que contam ao aparecer e passos do "Como funciona" que acendem com a rolagem. */
function pageEffects() {
  const steps = $("#howSteps");
  const stepItems = $$(".how-step");
  const bar = $("#howBar");
  window.addEventListener("resize", measure);
  setTimeout(measure, 600);

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { animateCount(e.target); io.unobserve(e.target); }
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => { if (el.dataset.count) io.observe(el); });

  const stop = onFrame((m) => {
    if (!steps || !bar) return;
    const r = steps.getBoundingClientRect();
    if (r.top > m.vh || r.bottom < 0) return;
    bar.style.transform = `scaleY(${clamp((m.vh * 0.6 - r.top) / r.height, 0, 1).toFixed(3)})`;
    for (const st of stepItems) {
      const b = st.getBoundingClientRect();
      st.classList.toggle("is-active", b.top < m.vh * 0.62 && b.bottom > m.vh * 0.2);
    }
  });
  return () => { stop(); io.disconnect(); window.removeEventListener("resize", measure); };
}

/** Páginas legais: o índice destaca a seção que está sendo lida. */
function mountLegal(root) {
  const links = $$("[data-toc]", root);
  if (!links.length || !("IntersectionObserver" in window)) return () => {};
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      links.forEach((a) => a.classList.toggle("is-current", a.dataset.toc === en.target.id));
    }
  }, { rootMargin: "-30% 0px -60% 0px" });
  links.forEach((a) => { const h = $(`#${a.dataset.toc}`, root); if (h) io.observe(h); });
  return () => io.disconnect();
}

/** Fotos de um serviço em tela cheia (a partir da foto tocada). */
function openServicePhotos(serviceId, start) {
  const sv = (app.menu.content.services || []).find((x) => x.id === serviceId);
  if (!sv?.photos?.length) return;
  const pf = app.menu.content.portfolio || [];
  const items = sv.photos.map((p) => pf.find((x) => x.image === p) || { image: p, thumb: p, caption: sv.name });
  openLightbox(items, items.map((_, i) => i), start, { whatsapp: app.menu.settings.whatsapp });
}

/* ---------------- Seleção do cardápio (contadores e botões) ---------------- */

function syncSelection() {
  const n = store.count();
  const label = `${n} ${n === 1 ? "item" : "itens"}`;
  const hc = $("#headerCount");
  hc.textContent = String(n);
  hc.hidden = !n;
  // aba lateral "Seu pedido": serviço escolhido e itens do cardápio
  const sv = (app.menu?.content.services || []).find((x) => x.id === chosenService());
  $("#orderTabLabel").textContent = sv ? sv.name : "Seu pedido";
  const tc = $("#orderTabCount");
  tc.textContent = String(n);
  tc.hidden = !n;
  $("#orderTab").setAttribute("aria-label", `Abrir o seu pedido de orçamento${sv ? ` (${sv.name})` : ""}${n ? `, ${label} do cardápio` : ""}`);
  $("#orderTab").classList.toggle("is-filled", Boolean(sv || n));
  for (const btn of $$("[data-pick]")) {
    const sel = store.isSelected(btn.dataset.pick, btn.dataset.item);
    btn.setAttribute("aria-pressed", sel ? "true" : "false");
    btn.classList.toggle("is-selected", sel);
    btn.closest(".pkg")?.classList.toggle("is-selected", sel);
    const lbl = btn.querySelector(".pick-label");
    if (lbl) {
      const cat = app.idx.categories.get(btn.dataset.pick)?.category;
      lbl.textContent = sel ? "Selecionado" : cat?.select === "one" ? "Escolher" : "Selecionar";
    }
  }
}

/* ---------------- Eventos globais ---------------- */

function bindGlobal() {
  const header = $("#header");
  let lastY = 0;
  onFrame((m) => {
    header.classList.toggle("is-solid", m.y > 30);
    // sobre a capa do Quem Somos o topo fica transparente, com as abas em pílula
    header.classList.toggle("on-hero", app.route === "home" && m.y < m.vh * 0.8);
    const dy = m.y - lastY;
    if (Math.abs(dy) > 4) {
      header.classList.toggle("is-hidden", dy > 0 && m.y > 200 && !root.classList.contains("layer-open"));
      lastY = m.y;
    }
  });

  const drawer = $("#drawer");
  const menuBtn = $("#menuBtn");
  menuBtn.addEventListener("click", () => {
    openLayer(drawer, { onClose: () => menuBtn.setAttribute("aria-expanded", "false") });
    menuBtn.setAttribute("aria-expanded", "true");
  });
  drawer.addEventListener("click", (e) => { if (e.target.closest("a")) closeLayer(drawer); });

  document.addEventListener("click", (e) => {
    if (e.target.closest(".skip")) { // acessibilidade: pula para o conteúdo sem trocar de tela
      e.preventDefault();
      $("#main").focus({ preventScroll: true });
      scrollTo($("#main"), { offset: 0 });
      return;
    }
    const order = e.target.closest("[data-order]");
    if (order && app.menu) { openOrder(app.menu, order.dataset.order); return; }
    if (e.target.closest("[data-order-open]") && app.menu) { closeLayer($("#drawer")); openOrder(app.menu); return; }
    const photo = e.target.closest("[data-svc-photo]");
    if (photo && app.menu) { openServicePhotos(photo.dataset.svcPhoto, Number(photo.dataset.i) || 0); return; }
    const pick = e.target.closest("[data-pick]");
    if (pick) {
      const err = store.toggle(pick.dataset.pick, pick.dataset.item);
      if (err) toast(err, "err");
      else if (store.isSelected(pick.dataset.pick, pick.dataset.item)) {
        pick.classList.remove("just-picked");
        void pick.offsetWidth;
        pick.classList.add("just-picked");
      }
      return;
    }
    const preset = e.target.closest("[data-preset]");
    if (preset) {
      store.applyPreset(preset.dataset.preset, preset.dataset.presetId);
      toast(`"${preset.textContent.trim()}" aplicada. Ajuste item por item se quiser.`);
      return;
    }
    const rm = e.target.closest("[data-remove]");
    if (rm) {
      const form = rm.closest("form");
      store.remove(rm.dataset.remove, rm.dataset.item);
      // a lista foi redesenhada: o foco segue para o item seguinte (ou para o botão de enviar)
      if (form) ($("[data-remove]", form) || $("[type=submit]", form))?.focus({ preventScroll: true });
      return;
    }
    if (e.target.closest("[data-clear]")) {
      if (window.confirm("Limpar toda a seleção do cardápio?")) store.clearAll();
      return;
    }
    const to = e.target.closest("[data-scroll-to]");
    if (to) {
      e.preventDefault();
      const target = $(`#${to.dataset.scrollTo}`);
      if (!target) return;
      scrollTo(target, { offset: -110 });
      if (target.hasAttribute("tabindex")) target.focus({ preventScroll: true }); // leitor de tela e teclado seguem para a seção
      return;
    }
    if (e.target.closest("[data-reload]")) { e.preventDefault(); location.reload(); return; }
    // link para a mesma rota (o navegador não dispara hashchange): rola até a seção
    const a = e.target.closest('a[href^="#/"]');
    if (a && (a.getAttribute("href") === location.hash || (a.getAttribute("href") === "#/" && !location.hash))) {
      e.preventDefault();
      route();
    }
  });

  document.addEventListener("change", (e) => {
    const ch = e.target.closest("[data-choice]");
    if (ch) store.choose(ch.dataset.choice, ch.value);
  });
}
