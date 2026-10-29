# CJR Gastronomia · Chef Carlos Jr — Site

Site para experiências gastronômicas em eventos sociais e corporativos. O objetivo é levar o visitante a um **pedido de orçamento completo pelo WhatsApp**.

HTML, CSS e JavaScript puros, **sem etapa de build**: publique a pasta em qualquer hospedagem estática (Netlify, Vercel, Hostinger).

## Páginas

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Hero (mármore preto + logo animado), Quem somos, Serviços, Portfólio, Avaliações, Orçamento e rodapé |
| `contato.html` | Página Contato com o mesmo formulário, passo a passo e contatos diretos |
| `privacidade.html` · `termos.html` · `cookies.html` · `reembolso.html` | Documentos legais com sumário, barra de leitura e "voltar ao topo" |

## Estrutura

```
assets/css/   fonts · base (tokens, mármore, animações) · layout · components · home · pages
assets/js/    config ⚙️ · consent · whatsapp · leadform · quote · carousel · lightbox · portfolio · reviews · effects · main
assets/js/portfolio-data.js   lista de fotos do portfólio (categoria + texto alternativo)
assets/img/   fotos otimizadas (WebP), hero, texturas de mármore e portfolio/
assets/fonts/ fontes hospedadas no próprio site (licença SIL OFL)
assets/logo/  logos claro/escuro, logo em alta (hero) e favicon
```

## Destaques visuais

- **Abertura (intro):** o logo é "escrito" sobre mármore escuro na primeira página da visita (pula em seguida e respeita "movimento reduzido").
- **Hero:** mármore preto com ingredientes, logo em alta com brilho dourado, poeira dourada, parallax com o mouse.
- **Portfólio:** vídeo dos bastidores em loop (`assets/video/chef-carlos.mp4`, com botão de pausar), filtros por categoria e duas faixas animadas com galeria em tela cheia.
- **Fundo:** mármore claro com veios dourados, luzes suaves e veios que se desenham ao rolar.

## Como funciona o orçamento

1. O visitante escolhe serviços (cartões, galeria ou gaveta **Meu orçamento**).
2. Na gaveta ou nos formulários, informa **nome, local do evento, número de convidados, data e observação (opcional)**.
3. O WhatsApp abre com a mensagem pronta e **numerada**, por exemplo:

```
*PEDIDO DE ORÇAMENTO · CJR GASTRONOMIA*
*Protocolo:* CJR-261029-K7QM
*1. Cliente:* Maria
*2. Local do evento:* Jurerê, Florianópolis
*3. Data do evento:* 12/12/2026 (sábado), daqui a 44 dias
*4. Convidados:* 80 pessoas
*5. Serviços de interesse:*
   5.1. Mesas e ilhas de frios
   5.2. Finger foods
*6. Observações:* ...
Origem: Meu orçamento (gaveta lateral)
```

Cada clique gera um **protocolo único** (data + código). Cada botão leva um **UTM próprio** (`utm_content`): `hero-whatsapp`, `flutuante-inicio`, `flutuante-contato`, `flutuante-legal`, `gaveta-orcamento`, `form-inicio`, `form-contato`, `rodape` etc. A origem também aparece escrita na mensagem.

## Configuração (`assets/js/config.js`)

| Campo | Para quê |
|---|---|
| `whatsapp` | Número com DDI + DDD |
| `analytics.ga4Id` | ID do Google Analytics 4. Vazio = nenhum rastreamento. Preenchido = banner de cookies aparece e o GA só carrega após o aceite |
| `legal` | Razão social, CNPJ, endereço, cidade/UF, e-mail. Aparecem no rodapé e nas políticas |
| `reviews` | Avaliações **reais** de clientes (veja abaixo) |
| `googleReviewsUrl` | Link do Perfil da Empresa no Google |
| `services` | Serviços do orçamento (id, nome, capa) |
| `heroVideo` | Vídeo opcional do Hero (ver `assets/video/LEIA-ME.txt`) |
| `features` | Ativa as seções futuras **Workshops corporativos** e **Cursos do Chef (Hotmart)**, já prontas e ocultas |

### Avaliações

A seção (última da página inicial) mostra **14 avaliações reais do Perfil no Google** (nota 5,0, 40 avaliações em 29/10/2026), transcritas sem alteração. Trechos que o Google corta com "Mais" foram omitidos, e os nomes aparecem como "primeiro nome + inicial". Para incluir novas avaliações, ou atualizar `reviewsSummary`:

```js
reviews: Object.freeze([
  { nome: 'Maria S.', texto: '...', nota: 5, evento: 'Casamento', data: 'out/2026', fonte: 'Google' },
]),
```

Com uma ou mais avaliações, a seção vira um carrossel com setas e arraste.

## Pendências antes de publicar

- [ ] **Dados legais** em `config.js > legal` (CNPJ, razão social, endereço, e-mail). Enquanto vazios, aparecem em vermelho nas políticas.
- [ ] **Decisões do negócio** marcadas em vermelho em `termos.html` e `reembolso.html` (prazos, percentuais, validade da proposta, sinal, formas de pagamento, foro). Edite em `scripts/build_legal.py` e rode `python scripts/build_legal.py` (ou edite direto no HTML).
- [ ] **Revisão jurídica** das quatro políticas por advogado(a). Os textos seguem a LGPD, o CDC e o Marco Civil, mas são modelos.
- [ ] **GA4**: se for usar, preencha `ga4Id` e defina a retenção de dados no Google Analytics.
- [ ] **Avaliações**: atualize `reviewsSummary` e `reviews` quando chegarem novas avaliações no Google.
- [ ] **Direitos de imagem**: confirme a autorização das pessoas que aparecem nas fotos (Chef e equipe) e do fotógrafo das fotos profissionais.
- [ ] **Hero**: confirme os direitos de uso da imagem do mármore com ingredientes (criada fora deste projeto).

## Conformidade e auditoria (29/10/2026)

**LGPD.**
- O formulário coleta só o necessário e não grava dados: a mensagem sai pelo WhatsApp por ação do próprio visitante.
- Há aviso de privacidade nos formulários.
- O banner de consentimento tem "Recusar" com o mesmo destaque de "Aceitar" e preferências reabríveis no rodapé.
- O GA4 só carrega com consentimento, em Consent Mode.
- Recusar apaga os cookies `_ga`.
- Fontes e imagens são servidas pelo próprio site, sem requisições a terceiros antes do consentimento.
- Os analytics recebem apenas eventos sem dados pessoais (`whatsapp_click`, `generate_lead` com o ID do CTA).

**Acessibilidade.**
- axe-core (WCAG 2.1 A/AA + boas práticas): 0 violações em início, Contato e Cookies.
- Navegação completa por teclado, link "pular para o conteúdo" e foco visível.
- Gaveta modal com fundo inerte; galeria acessível pelo teclado e com anúncio para leitores de tela.
- Carrosséis com botão de pausa.
- Movimento reduzido respeitado (`prefers-reduced-motion`).
- Textos alternativos em todas as fotos.
- Contraste revisado (dourado escurecido para 3,97:1 nos elementos gráficos).

**Imagens.**
- Fotos reais do Drive do Chef.
- Foram excluídas do portfólio as fotos com **marcas de terceiros** visíveis (CDL, AEMFLO, telões) e com **rostos de convidados ou funcionários** sem autorização confirmada.
- Fontes sob licença SIL OFL.
- O ícone do WhatsApp é usado apenas como link para o serviço.

## Backup do site anterior

O site que estava em chefcarlosjrgastronomia.com.br (servidor HostGator) foi copiado em 29/10/2026 para a branch [`backup-site-antigo`](https://github.com/carlosserra-a11y/CJR-Gastronomia3.0/tree/backup-site-antigo). Arquivos que só existem no servidor (PHP, `.htaccess`, e-mails) não aparecem pela web: faça também um backup completo pelo cPanel da HostGator antes de desligar o site antigo.

No próprio servidor, os arquivos do site antigo (inclusive o `.htaccess`) foram movidos, sem exclusão, para `~/backup-site-antigo-2026-10-29`, fora do `public_html`. No lugar deles, o `public_html` recebeu uma cópia deste site (versão `cf9254b`), que atende quem ainda tem o endereço antigo do domínio guardado no cache de DNS. Depois que o cache expira, todos passam a abrir o GitHub Pages. Para voltar ao site antigo, mova de volta o conteúdo da pasta de backup para o `public_html` e restaure o DNS anterior.

## Domínio chefcarlosjrgastronomia.com.br

1. No painel de DNS do domínio, aponte os registros **A** de `@` para `185.199.108.153`, `185.199.109.153`, `185.199.110.153` e `185.199.111.153`, e o **CNAME** de `www` para `carlosserra-a11y.github.io`.
2. Crie o arquivo `CNAME` na raiz do repositório com `chefcarlosjrgastronomia.com.br`, ou informe o domínio em **Settings > Pages > Custom domain**.
3. Depois da propagação, marque **Enforce HTTPS**.

## Publicação (GitHub Pages)

Repositório: https://github.com/carlosserra-a11y/CJR-Gastronomia3.0. Em **Settings > Pages**, use *Deploy from a branch*, com `main` e `/ (root)`. O site fica em https://carlosserra-a11y.github.io/CJR-Gastronomia3.0/

## Rodar localmente

```bash
python -m http.server 5173
```

Depois abra http://localhost:5173.
