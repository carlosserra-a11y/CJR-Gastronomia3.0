/*
 * Avaliações: exibe somente avaliações REAIS cadastradas em config.reviews (carrossel com setas e arraste).
 * Sem avaliações cadastradas, a seção convida o cliente a avaliar — nada de depoimentos fictícios.
 */
(function (site) {
  'use strict';

  const MAX_STARS = 5;

  function stars(rating) {
    const value = Math.max(0, Math.min(MAX_STARS, Math.round(Number(rating) || 0)));
    return { text: '★'.repeat(value) + '☆'.repeat(MAX_STARS - value), label: `${value} de ${MAX_STARS} estrelas` };
  }

  function buildCard(review) {
    const li = document.createElement('li');
    li.innerHTML = `
      <article class="review-card">
        <span class="review-card__mark" aria-hidden="true">“</span>
        <p class="review-card__stars" role="img"></p>
        <p class="review-card__text"></p>
        <footer class="review-card__author"><p class="review-card__name"></p><p class="review-card__meta"></p></footer>
      </article>`;
    const rating = stars(review.nota);
    const starsEl = li.querySelector('.review-card__stars');
    starsEl.textContent = rating.text;
    starsEl.setAttribute('aria-label', rating.label);
    li.querySelector('.review-card__text').textContent = review.texto;
    li.querySelector('.review-card__name').textContent = review.nome;
    li.querySelector('.review-card__meta').textContent = [review.evento, review.data, review.fonte].filter(Boolean).join(' · ');
    return li;
  }

  function setupEmptyState(section) {
    const cta = section.querySelector('[data-reviews-cta]');
    if (site.config.googleReviewsUrl) {
      cta.href = site.config.googleReviewsUrl;
      cta.target = '_blank';
      cta.rel = 'noopener';
      return;
    }
    cta.dataset.whatsapp = '';
    cta.dataset.cta = 'avaliacoes';
    cta.dataset.message = 'Olá, Chef Carlos! Gostaria de deixar um depoimento sobre o meu evento.';
    site.whatsapp.bindLinks(cta.parentElement);
  }

  function init() {
    const section = document.querySelector('[data-reviews]');
    if (!section) return;
    const list = (site.config.reviews || []).filter((r) => r && r.nome && r.texto);
    const carousel = section.querySelector('[data-carousel]');
    const empty = section.querySelector('[data-reviews-empty]');
    const allLink = section.querySelector('[data-reviews-all]');
    const summary = section.querySelector('[data-reviews-summary]');
    const totals = site.config.reviewsSummary;
    if (summary && totals && site.config.googleReviewsUrl) {
      summary.querySelector('[data-reviews-score]').textContent = totals.nota;
      summary.querySelector('[data-reviews-total]').textContent = String(totals.total);
      allLink.href = site.config.googleReviewsUrl;
      summary.hidden = false;
    }
    if (!list.length) {
      carousel.hidden = true;
      empty.hidden = false;
      setupEmptyState(section);
      return;
    }
    section.querySelector('[data-carousel-track]').replaceChildren(...list.map(buildCard));
    carousel.hidden = false;
    empty.hidden = true;
    site.carousel.initCarousel(carousel);
  }

  site.reviews = Object.freeze({ init });
})(window.ChefSite);
