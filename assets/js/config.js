/*
 * Configurações do site · edite aqui sem mexer no restante do código.
 */
window.ChefSite = window.ChefSite || {};

window.ChefSite.config = Object.freeze({
  // Número do WhatsApp com DDI + DDD, só dígitos.
  whatsapp: '5548996835439',

  // Mensagem padrão dos botões "Fale com o Chef".
  defaultMessage: 'Olá, Chef Carlos! Vim pelo site e gostaria de conversar sobre um evento.',

  instagram: 'https://www.instagram.com/chefcarlosjr_gastronomia/',

  // Link do Perfil da Empresa no Google (botão "Ver todas as avaliações"). Vazio = botão oculto.
  googleReviewsUrl: '',

  // Vídeo de fundo do Hero (loop, sem som). Ex.: 'assets/video/hero.mp4'. Vazio = usa a foto.
  heroVideo: Object.freeze({ mp4: '', webm: '' }),

  // Recursos futuros: troque para true quando estiverem prontos.
  features: Object.freeze({
    workshops: false, // Seção "Workshops corporativos" (mapa de empresas)
    cursos: false, // Seção "Cursos do Chef" (integração Hotmart)
  }),
});
