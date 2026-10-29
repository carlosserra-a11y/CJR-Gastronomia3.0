/*
 * Configurações do site · edite aqui sem mexer no restante do código.
 */
window.ChefSite = window.ChefSite || {};

window.ChefSite.config = Object.freeze({
  // WhatsApp com DDI + DDD, só dígitos.
  whatsapp: '5548996835439',
  whatsappDisplay: '(48) 99683-5439',

  instagram: 'https://www.instagram.com/chefcarlosjr_gastronomia/',
  instagramHandle: '@chefcarlosjr_gastronomia',

  // Perfil da Empresa no Google (botões "Ver todas no Google" e "Avaliar").
  googleReviewsUrl: 'https://share.google/rIWD4ek0SRCR3mKBz',

  // Google Analytics 4 (ex.: 'G-XXXXXXXXXX'). Vazio = nenhum script de rastreamento é carregado.
  // Quando preenchido, o GA4 só carrega depois que o visitante aceitar cookies de estatística.
  analytics: Object.freeze({ ga4Id: '' }),

  // Parâmetros UTM anexados aos links do WhatsApp (utm_content = CTA de origem).
  utm: Object.freeze({ source: 'site', medium: 'whatsapp', campaign: 'orcamento' }),

  // Dados legais exibidos no rodapé e nas políticas. Preencha antes de publicar.
  legal: Object.freeze({
    nomeFantasia: 'CJR Gastronomia',
    razaoSocial: '',
    cnpj: '',
    endereco: '',
    cidadeUf: '',
    email: '',
    responsavel: 'Carlos Junior',
  }),

  // Serviços disponíveis para o orçamento (o id liga o cartão da página à lista).
  services: Object.freeze([
    { id: 'frios', name: 'Mesas e ilhas de frios', cover: 'assets/img/frios-capa.webp' },
    { id: 'finger', name: 'Finger foods', cover: 'assets/img/finger-capa.webp' },
    { id: 'doces', name: 'Doces e gelo seco', cover: 'assets/img/doces-capa.webp' },
    { id: 'quentes', name: 'Buffet de pratos quentes', cover: 'assets/img/quentes-capa.webp' },
    { id: 'coffee', name: 'Coffee break', cover: 'assets/img/coffee-capa.webp' },
    { id: 'showcooking', name: 'Show cooking (serviço especial)', cover: 'assets/img/showcooking-capa.webp' },
  ]),

  // Resumo do Perfil no Google (atualize quando mudar).
  reviewsSummary: Object.freeze({ nota: '5,0', total: 40 }),

  // Avaliações REAIS do Google, transcritas sem alteração (trechos cortados no Google foram omitidos).
  // Nome exibido como "Primeiro nome + inicial" por privacidade.
  reviews: Object.freeze([
    { nome: 'Sissa F.', nota: 5, fonte: 'Google', texto: 'Recomendo muito o Chef Carlos! Além de ter um cardápio diversificado e muito saboroso, o Chef e sua equipe são extremamente cuidadosos com todos os detalhes, com a apresentação dos pratos, com a limpeza (impecável!), com o atendimento. Existem pessoas que nascem para fazer o quem fazem, sem dúvida o Chef Carlos nasceu para ser Chef!' },
    { nome: 'Cida R.', nota: 5, evento: 'Aniversário', fonte: 'Google', texto: 'Recentemente fiz minha festa de aniversário e contratei o Chef Carlos para organizar e preparar o almoço e o café a tarde. Até hoje não paro de receber elogios e solicitação do contato dele.' },
    { nome: 'Régis F.', nota: 5, fonte: 'Google', texto: 'Excelente!!!! O Chef Carlos é sensacional. Além de um cardápio vasto e delicioso, o cuidado aos detalhes e principalmente no atendimento é algo ímpar e que superam as expectativas de qualquer pessoa.' },
    { nome: 'Gustavo L.', nota: 5, evento: 'Eventos corporativos', fonte: 'Google', texto: 'O Chef Carlos já foi meu fornecedor em inúmeros eventos, institucionais, pela minha empresa e pela Associação. Sempre incrível. Excepcional em coffee breaks' },
    { nome: 'Joane S.', nota: 5, evento: 'Aniversário', fonte: 'Google', texto: 'Comida maravilhosa! Eles preparam um almoço para meu aniversário, só ouvi elogios pelos convidados! Indico de olhos fechados! Capricho e um ótimo atendimento. Super indico!' },
    { nome: 'Dioni D.', nota: 5, fonte: 'Google', texto: 'O Carlos é um profissional maravilhoso. Muito atencioso e surpreende em cada detalhe. Suas entregas sempre nos surpeendem. Além disso, possui um cardápio maravilhoso. Super recomendo.' },
    { nome: 'Janypher S.', nota: 5, fonte: 'Google', texto: 'Já tive a oportunidade de contratar o Chef Carlos em mais de um evento e posso afirmar que o trabalho dele é excelente. A qualidade dos alimentos, a apresentação e o cuidado em cada detalhe fazem toda a diferença.' },
    { nome: 'Felipe M.', nota: 5, evento: 'Coffee break e buffet', fonte: 'Google', texto: 'Chef Carlos é excelente! Os Coffees e Buffets preparados por ele e sua equipe são verdadeiras experiências gastronômicas. Recomendo!' },
    { nome: 'Fernanda M.', nota: 5, fonte: 'Google', texto: 'Estou sem palavras para descrever o quanto ficamos satisfeitos com o trabalho desta equipe maravilhosa. Desde o preparo até a apresentação da comida, tudo é maravilhoso.' },
    { nome: 'Antenor S.', nota: 5, evento: 'Coffee break', fonte: 'Google', texto: 'Estive em um evento realizado pelo Chef Carlos é foi divino. O coffe break foi espetacular, muito bom. Super indico para evento em geral.' },
    { nome: 'Fabiana C.', nota: 5, fonte: 'Google', texto: 'O Chef Carlos é fantástico! Todas as vezes que contratei o serviço dele, a entrega foi impecável, muito acima do esperado.' },
    { nome: 'Bruna N.', nota: 5, fonte: 'Google', texto: 'Acompanho o trabalho do Carlos há muitos anos, e é admirável ver a evolução e a excelência presentes em cada evento realizado. Sua versatilidade na cozinha é, sem dúvida, um grande diferencial.' },
    { nome: 'Breno M.', nota: 5, fonte: 'Google', texto: 'Excelente opção para eventos. Testado e aprovado diversas vezes, sempre entregando qualidade e sabor.' },
    { nome: 'Rozana S.', nota: 5, fonte: 'Google', texto: 'Excelente! Chefe Carlos faz o diferencial na hora de apresentar uma mesa com qualidade e muito sabor' },
  ]),

  // Vídeo de fundo do Hero (loop, sem som). Ex.: 'assets/video/hero.mp4'. Vazio = usa a imagem.
  heroVideo: Object.freeze({ mp4: '', webm: '' }),

  // Recursos futuros: troque para true quando estiverem prontos.
  features: Object.freeze({
    workshops: false, // Seção "Workshops corporativos" (mapa de empresas)
    cursos: false, // Seção "Cursos do Chef" (integração Hotmart)
  }),
});
