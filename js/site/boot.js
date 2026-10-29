/* Roda antes de a página pintar (arquivo separado porque o servidor bloqueia script inline):
   marca JS ativo, "reduzir movimento" e se a abertura deve aparecer (em toda entrada no site;
   ?nointro e "reduzir movimento" pulam). */
(function () {
  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.classList.add("reduced");
  var skip = /[?&]nointro\b/.test(location.search) || root.classList.contains("reduced");
  if (!skip) root.classList.add("intro");
})();
