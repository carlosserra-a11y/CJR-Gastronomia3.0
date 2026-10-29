# Chef Carlos Jr Gastronomia · Site (SPA)

Site de página única para buffet premium, finger foods e eventos sociais e corporativos.
Objetivo: apresentar o serviço com elegância e levar o visitante ao **pedido de orçamento pelo WhatsApp**.

HTML, CSS e JavaScript puros, **sem etapa de build**: basta publicar a pasta (Netlify, Vercel, Hostinger ou qualquer hospedagem estática).

## Estrutura

```
index.html              Página única (todas as seções)
assets/css/styles.css   Design system (tokens) + layout + responsivo
assets/js/config.js     ⚙️ Configurações editáveis (WhatsApp, vídeo, recursos ocultos)
assets/js/whatsapp.js   Links e abertura do WhatsApp
assets/js/quote.js      Lista "Meu orçamento" + gaveta lateral (salva no navegador)
assets/js/carousel.js   Carrossel de serviços (scroll-snap, setas, arraste)
assets/js/lightbox.js   Galeria em tela cheia de cada serviço
assets/js/form.js       Formulário: validação, máscara de telefone, envio ao WhatsApp
assets/js/main.js       Inicialização: cabeçalho, menu, animações, vídeo, recursos ocultos
assets/img/             Fotos otimizadas (WebP) vindas do Drive do Chef
assets/logo/            Logo claro/escuro + favicon
assets/video/           Vídeo de fundo do Hero (ver LEIA-ME.txt)
```

## Seções

1. **Cabeçalho**: logo à esquerda, menu simples e o botão **Meu orçamento** (abre a gaveta). Fica transparente sobre o Hero e sólido ao rolar. No celular vira menu em tela.
2. **Hero**: vídeo em loop no fundo (ou a foto com zoom lento enquanto não houver vídeo), título e o botão **Fale com o Chef**.
3. **Sobre**: retrato do Chef de dólmã branco, foto da equipe em ação e um texto curto sobre técnica e cuidado.
4. **Serviços**: carrossel com 6 serviços (ilhas de frios, finger foods, doces com gelo seco, pratos quentes, coffee break, show cooking). Tocar na foto abre a galeria; o botão **Adicionar ao orçamento** abre a gaveta lateral com a lista do cliente, sem sair da página.
5. **Avaliações**: cartões com estrelas e o selo do Google.
6. **Rodapé**: formulário (nome, telefone, e-mail, tipo de evento, data, convidados) que monta a mensagem com os serviços escolhidos e abre o WhatsApp, além dos links de contato.

Fixos: **WhatsApp flutuante** sempre visível e a **gaveta "Meu orçamento"** à direita.

## Como editar

Tudo que muda com frequência está em `assets/js/config.js`:

| Campo | Para quê |
|---|---|
| `whatsapp` | Número com DDI + DDD (só dígitos) |
| `defaultMessage` | Mensagem padrão dos botões "Fale com o Chef" |
| `googleReviewsUrl` | Link do Perfil da Empresa no Google (mostra "Ver todas as avaliações") |
| `heroVideo.mp4` / `.webm` | Caminho do vídeo do Hero (ex.: `assets/video/hero.mp4`) |
| `features.workshops` | `true` exibe a seção **Workshops corporativos** (mapa de empresas) |
| `features.cursos` | `true` exibe a seção **Cursos do Chef** (Hotmart) |

**Serviços**: cada `<li class="service-card">` em `index.html` define nome (`data-service-name`), capa, texto e as fotos da galeria (dentro de `<template data-gallery>`). A gaveta e o formulário leem esses dados automaticamente.

## Pendências antes de publicar

- [ ] **Avaliações reais**: os 3 depoimentos são **exemplos de layout** (selo "Exemplo"). Substitua pelos textos reais do Google em `index.html` e remova o selo.
- [ ] **Vídeo do Hero**: os vídeos do Drive têm mais de 10 MB. Exporte um MP4 curto (até ~6 MB), coloque em `assets/video/` e informe em `config.js`.
- [ ] **Link do Google**: preencha `googleReviewsUrl`.
- [ ] **Domínio**: troque `og:image` por URL absoluta quando houver domínio.
- [ ] **Textos**: revise com o Chef o texto do "Sobre" e a área de atendimento ("Florianópolis e região").

## Recursos futuros (já preparados e ocultos)

- **Workshops corporativos** (`#workshops`): container `[data-company-map]` para Google My Maps ou Leaflet e lista `[data-company-list]` das empresas.
- **Cursos do Chef** (`#cursos`): cartões com `data-hotmart-url` (link de checkout da Hotmart). Para o checkout sobreposto, inclua o widget oficial da Hotmart antes de `</body>`.

## Rodar localmente

```bash
python -m http.server 5173
```

Depois abra http://localhost:5173.

## Design system

- **Cores**: papel `#f8f6f2`, tinta `#1d1b18`, areia `#efeae2`, dourado `#b08d57` / `#e8c882`
- **Tipografia**: Cormorant Garamond (títulos), Manrope (texto, base 18 px), Great Vibes (assinatura cursiva, com moderação)
- **Movimento**: fade + slide-up suave ao rolar, zoom lento no Hero; tudo desligado com `prefers-reduced-motion`
- **Acessibilidade**: alvos de toque ≥ 48 px, foco visível, gaveta e galeria com teclado (Esc, Tab, setas), rótulos reais no formulário
