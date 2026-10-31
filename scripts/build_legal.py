"""Generate the legal pages (privacy, terms, cookies, refund) reusing the header/footer of contato.html.

Usage (from the project root): python scripts/build_legal.py
Text markers <span class="fill">[...]</span> are business decisions the owner must fill in.
"""
import re

UPDATED = "29 de outubro de 2026"
SOURCE = "contato.html"


def F(text):
    return f'<span class="fill">[{text}]</span>'


def L(field, placeholder):
    return f'<span class="fill" data-legal="{field}" data-placeholder="[{placeholder}]">[{placeholder}]</span>'


CONTROLLER = (
    f"<strong>{L('nomeFantasia', 'nome fantasia')}</strong>, razão social {L('razaoSocial', 'razão social')}, "
    f"CNPJ {L('cnpj', 'CNPJ')}, com endereço em {L('endereco', 'endereço')}, {L('cidadeUf', 'cidade/UF')}, "
    f"responsável: {L('responsavel', 'nome do responsável')}"
)
CHANNEL = f"pelo e-mail {L('email', 'e-mail de contato')} ou pelo WhatsApp (48) 99683-5439"

PAGES = {
    "privacidade.html": {
        "title": "Política de Privacidade",
        "lead": "Como a CJR Gastronomia trata os seus dados pessoais, de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).",
        "minutes": 7,
        "updated": "31 de outubro de 2026",
        "summary": [
            "Coletamos apenas o necessário para responder ao seu pedido de orçamento.",
            "O formulário não envia nada a servidores do site: é você quem envia a mensagem pelo WhatsApp.",
            "Novidades e promoções (marketing) só se você marcar a autorização opcional do formulário, e você pode cancelar quando quiser.",
            "Estatísticas de uso (Google Analytics) só com a sua permissão.",
            "Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento.",
        ],
        "sections": [
            ("quem-somos", "Quem é o controlador dos dados", f"<p>Este site e o atendimento dele decorrente são operados por {CONTROLLER} (\"CJR Gastronomia\" ou \"nós\"). Para assuntos de privacidade, fale conosco {CHANNEL}.</p>"),
            ("dados", "Quais dados coletamos", f"""<ul>
<li><strong>Dados do pedido de orçamento</strong>: nome, local do evento, data, número de convidados, observações e serviços de interesse. Esses dados <strong>não são enviados a nenhum servidor do site</strong>: ficam apenas na página aberta no seu navegador até você tocar em "Enviar pelo WhatsApp", quando são inseridos na mensagem que você mesmo envia.</li>
<li><strong>Autorização de marketing (opcional)</strong>: se você marcar a caixa do formulário, a mensagem informa que você aceita receber novidades, promoções e conteúdos de marketing. A caixa vem desmarcada e não é necessária para pedir orçamento.</li>
<li><strong>Dados da conversa no WhatsApp</strong>: número de telefone, nome de perfil e o conteúdo das mensagens trocadas conosco.</li>
<li><strong>Armazenamento no seu navegador</strong>: a lista de serviços escolhidos e a sua escolha sobre cookies (veja a <a href="cookies.html">Política de Cookies</a>).</li>
<li><strong>Dados de navegação, somente com o seu consentimento</strong>: páginas visitadas, cliques em botões, tipo de dispositivo e localização aproximada, por meio do Google Analytics. Nunca enviamos nome, telefone ou local do evento ao Google Analytics.</li>
<li><strong>Registros de acesso</strong> (endereço IP, data e hora), mantidos pelo provedor de hospedagem do site.</li>
</ul>
<p>Não pedimos dados sensíveis. Se você optar por nos informar restrições alimentares ou alergias, usaremos essa informação exclusivamente para adaptar o cardápio e garantir a segurança dos alimentos do seu evento, com base no seu consentimento, que pode ser revogado a qualquer momento.</p>"""),
            ("finalidades", "Para que usamos e com qual base legal", """<div class="table-wrap" tabindex="0" role="region" aria-label="Tabela: role para o lado se necessário"><table>
<thead><tr><th>Finalidade</th><th>Base legal (LGPD)</th></tr></thead>
<tbody>
<tr><td>Responder ao seu pedido e preparar o orçamento</td><td>Procedimentos preliminares a contrato, a pedido do titular (art. 7º, V)</td></tr>
<tr><td>Executar o serviço contratado (planejamento, preparo, montagem e atendimento)</td><td>Execução de contrato (art. 7º, V)</td></tr>
<tr><td>Emitir documentos fiscais e cumprir obrigações legais</td><td>Cumprimento de obrigação legal ou regulatória (art. 7º, II)</td></tr>
<tr><td>Defender direitos em processos judiciais, administrativos ou arbitrais</td><td>Exercício regular de direitos (art. 7º, VI)</td></tr>
<tr><td>Enviar novidades, promoções e conteúdos de marketing, se você autorizar no formulário</td><td>Consentimento (art. 7º, I), que pode ser revogado a qualquer momento</td></tr>
<tr><td>Medir o uso do site (Google Analytics)</td><td>Consentimento (art. 7º, I)</td></tr>
<tr><td>Adaptar o cardápio a restrições alimentares informadas por você</td><td>Consentimento específico (art. 11, I)</td></tr>
</tbody></table></div>
<p>Só usamos seus dados para marketing com a sua autorização. Para cancelar, basta pedir pelo WhatsApp, a qualquer momento, sem prejuízo do seu orçamento ou contrato. Não vendemos dados pessoais.</p>"""),
            ("compartilhamento", "Com quem compartilhamos", """<ul>
<li><strong>WhatsApp (Meta)</strong>: plataforma de mensagens que você escolhe usar para falar conosco, regida também pela política de privacidade do WhatsApp.</li>
<li><strong>Google</strong>: apenas se você aceitar cookies de estatística (Google Analytics).</li>
<li><strong>Provedor de hospedagem do site</strong>: armazena os registros de acesso.</li>
<li><strong>Contabilidade e autoridades públicas</strong>: quando houver obrigação legal ou ordem de autoridade competente.</li>
</ul>"""),
            ("transferencia", "Transferência internacional", "<p>WhatsApp, Google e provedores de hospedagem podem tratar dados em servidores fora do Brasil. Procuramos utilizar fornecedores que adotam os mecanismos de transferência internacional previstos no art. 33 da LGPD.</p>"),
            ("retencao", "Por quanto tempo guardamos", f"""<ul>
<li>Conversas de orçamento não contratado: até {F('12 meses')} após o último contato.</li>
<li>Dados de clientes e documentos fiscais: pelo prazo exigido pela legislação e para defesa de direitos.</li>
<li>Dados usados para marketing, quando autorizados: até você cancelar a autorização.</li>
<li>Registros de acesso ao site: 6 meses (art. 15 do Marco Civil da Internet).</li>
<li>Lista de serviços salva no navegador: até você removê-la ou limpar os dados do navegador. Escolha de cookies: 12 meses.</li>
<li>Dados do Google Analytics, quando autorizados: {F('prazo configurado no Google Analytics, ex.: 14 meses')}.</li>
</ul>"""),
            ("direitos", "Seus direitos", f"""<p>Você pode, a qualquer momento e gratuitamente (art. 18 da LGPD):</p>
<ul>
<li>confirmar se tratamos seus dados e acessá-los;</li>
<li>corrigir dados incompletos, inexatos ou desatualizados;</li>
<li>pedir anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei;</li>
<li>pedir a portabilidade dos dados;</li>
<li>pedir a eliminação dos dados tratados com base no consentimento e revogar esse consentimento;</li>
<li>saber com quem compartilhamos seus dados e as consequências de não consentir;</li>
<li>opor-se a tratamento realizado em desconformidade com a lei.</li>
</ul>
<p>Para exercer seus direitos, fale conosco {CHANNEL}. Responderemos em até 15 dias. Você também pode peticionar à Autoridade Nacional de Proteção de Dados (ANPD), em <a href="https://www.gov.br/anpd" target="_blank" rel="noopener">gov.br/anpd</a>.</p>"""),
            ("seguranca", "Segurança", "<p>Adotamos medidas técnicas e administrativas razoáveis para proteger os dados, como conexão segura (HTTPS) e acesso restrito às conversas de atendimento. Em caso de incidente de segurança que possa gerar risco ou dano relevante, comunicaremos os titulares afetados e a ANPD, conforme o art. 48 da LGPD.</p>"),
            ("menores", "Crianças e adolescentes", "<p>Nossos serviços são contratados por adultos. Não coletamos intencionalmente dados de menores de 18 anos.</p>"),
            ("encarregado", "Atendimento ao titular", f"<p>Responsável pelo atendimento a titulares de dados: {L('responsavel', 'nome do responsável')}, {CHANNEL}.</p>"),
            ("alteracoes", "Alterações desta política", "<p>Podemos atualizar esta política para refletir mudanças legais ou no site. A data da última atualização fica sempre no topo desta página.</p>"),
        ],
    },
    "cookies.html": {
        "title": "Política de Cookies",
        "lead": "Quais cookies e armazenamentos do navegador o site usa, para quê, e como você controla a sua escolha.",
        "minutes": 3,
        "summary": [
            "Itens essenciais guardam a sua lista de orçamento e a sua escolha de cookies, só no seu navegador.",
            "Cookies de estatística (Google Analytics) só são usados se você aceitar.",
            "Não usamos cookies de publicidade.",
        ],
        "sections": [
            ("o-que-sao", "O que são cookies", "<p>Cookies e o armazenamento local são pequenos dados guardados no seu navegador. Eles permitem, por exemplo, lembrar escolhas feitas no site.</p>"),
            ("quais-usamos", "Quais usamos", """<div class="table-wrap" tabindex="0" role="region" aria-label="Tabela: role para o lado se necessário"><table>
<thead><tr><th>Nome</th><th>Categoria</th><th>Finalidade</th><th>Duração</th><th>Origem</th></tr></thead>
<tbody>
<tr><td>cjr-consent</td><td>Essencial (armazenamento local)</td><td>Guardar a sua escolha sobre cookies</td><td>12 meses</td><td>CJR Gastronomia</td></tr>
<tr><td>ccj-orcamento</td><td>Essencial (armazenamento local)</td><td>Guardar os serviços escolhidos em "Meu orçamento"</td><td>Até você remover</td><td>CJR Gastronomia</td></tr>
<tr><td>cjr-intro</td><td>Essencial (armazenamento de sessão)</td><td>Mostrar a abertura com o logo só na primeira página da visita</td><td>Até fechar a aba</td><td>CJR Gastronomia</td></tr>
<tr><td>_ga</td><td>Estatística, somente com consentimento</td><td>Distinguir visitantes no Google Analytics</td><td>Até 2 anos</td><td>Google</td></tr>
<tr><td>_ga_&lt;ID&gt;</td><td>Estatística, somente com consentimento</td><td>Manter o estado da sessão no Google Analytics</td><td>Até 2 anos</td><td>Google</td></tr>
</tbody></table></div>
<p>Os dados do formulário de orçamento <strong>não</strong> são guardados em cookies nem no armazenamento do navegador.</p>"""),
            ("terceiros", "Serviços de terceiros", "<p>As fontes e as imagens do site são servidas pelo próprio site, sem conexão com terceiros. Os links para WhatsApp e Instagram levam você ao site dessas empresas, que têm políticas próprias. O Google Analytics só é carregado depois do seu consentimento.</p>"),
            ("controle", "Como controlar", """<p>Você pode mudar a sua escolha a qualquer momento:</p>
<p><button class="btn btn--dark" type="button" data-cookie-prefs>Abrir preferências de cookies</button></p>
<p>Ao recusar a estatística, os cookies do Google Analytics deste site são apagados. Você também pode apagar cookies e dados do site nas configurações do seu navegador.</p>"""),
        ],
    },
    "termos.html": {
        "title": "Termos de Serviço",
        "lead": "Regras de uso do site e condições gerais dos serviços de gastronomia para eventos da CJR Gastronomia.",
        "minutes": 6,
        "summary": [
            "O pedido feito pelo site é uma solicitação de orçamento, sem compromisso.",
            "A contratação só acontece após você aceitar a proposta enviada pelo Chef.",
            "Os seus direitos como consumidor estão sempre preservados.",
        ],
        "sections": [
            ("aceitacao", "Aceitação e quem somos", f"<p>Estes termos regem o uso deste site e as condições gerais dos serviços prestados por {CONTROLLER}. Ao usar o site, você concorda com estes termos.</p>"),
            ("uso", "Uso do site", "<p>O site apresenta os serviços e permite montar um pedido de orçamento enviado pelo WhatsApp. Não é permitido usar o site para fins ilícitos, tentar comprometer o seu funcionamento ou copiar o seu conteúdo sem autorização.</p>"),
            ("orcamentos", "Orçamentos", f"""<ul>
<li>O pedido enviado pelo site <strong>não</strong> constitui contratação. Ele serve para o Chef entender o seu evento.</li>
<li>A proposta é enviada pelo WhatsApp, com cardápio, valores e condições, e é válida por {F('X dias')}.</li>
<li>A data do evento fica reservada após o aceite da proposta e o pagamento do sinal de {F('X% do valor')}.</li>
</ul>"""),
            ("contratacao", "Contratação e pagamento", f"<p>As condições específicas (cardápio, quantidades, estrutura, equipe, horários, valores e formas de pagamento) constam na proposta aceita. Formas de pagamento aceitas: {F('PIX, cartão, transferência...')}.</p>"),
            ("contratante", "Responsabilidades do contratante", f"""<ul>
<li>Informar dados corretos sobre local, data, horário e número de convidados.</li>
<li>Confirmar o número final de convidados até {F('X dias')} antes do evento.</li>
<li>Garantir o acesso da equipe ao local e a estrutura combinada (por exemplo, energia, água e espaço de apoio).</li>
<li>Informar previamente restrições alimentares e alergias dos convidados.</li>
</ul>"""),
            ("cjr", "Responsabilidades da CJR Gastronomia", "<p>Preparar e servir os itens contratados com as boas práticas de manipulação de alimentos previstas na legislação sanitária, com equipe dimensionada para o serviço acordado.</p>"),
            ("alimentos", "Alimentos, alergênicos e segurança", "<p>Os cardápios podem conter ingredientes alergênicos, como glúten, leite, ovos, oleaginosas, peixes e crustáceos. Por segurança alimentar, os alimentos devem ser consumidos durante o evento, conforme as orientações da equipe.</p>"),
            ("imagens", "Imagens de eventos", "<p>Podemos fotografar as preparações e a montagem para o nosso portfólio. Pessoas só aparecem em fotos publicadas com autorização. Se não quiser que o seu evento seja fotografado, basta avisar.</p>"),
            ("propriedade", "Propriedade intelectual", "<p>Marca, logotipo, textos e fotos deste site pertencem à CJR Gastronomia ou são usados com autorização, e não podem ser reproduzidos sem permissão.</p>"),
            ("cancelamento", "Cancelamento e reembolso", '<p>As regras de desistência, cancelamento, remarcação e reembolso estão na <a href="reembolso.html">Política de Cancelamento e Reembolso</a>.</p>'),
            ("consumidor", "Direitos do consumidor e força maior", "<p>Nada nestes termos limita os direitos garantidos pelo Código de Defesa do Consumidor (Lei nº 8.078/1990). Nenhuma das partes responde por falhas causadas por caso fortuito ou força maior; nesses casos, as partes buscarão remarcar o evento ou devolver os valores, conforme a política de reembolso.</p>"),
            ("foro", "Lei aplicável e foro", f"<p>Aplica-se a legislação brasileira. Para consumidores, fica assegurado o foro do seu domicílio (art. 101, I, do Código de Defesa do Consumidor). Para contratantes empresariais, fica eleito o foro de {F('cidade/UF')}.</p>"),
        ],
    },
    "reembolso.html": {
        "title": "Política de Cancelamento e Reembolso",
        "lead": "Como funcionam desistência, cancelamento, remarcação e devolução de valores nos serviços da CJR Gastronomia.",
        "minutes": 4,
        "summary": [
            "Contratou pelo WhatsApp, telefone ou site? Você pode desistir em até 7 dias, com devolução integral.",
            "Depois disso, o valor devolvido depende da antecedência do cancelamento.",
            "Se nós precisarmos cancelar, você escolhe entre remarcar ou receber tudo de volta.",
        ],
        "sections": [
            ("arrependimento", "Direito de arrependimento (7 dias)", "<p>Quando a contratação acontece fora de um estabelecimento comercial (por WhatsApp, telefone ou site), você pode desistir em até 7 dias, contados da contratação, com a devolução imediata e integral dos valores pagos, atualizados monetariamente (art. 49 do Código de Defesa do Consumidor).</p>"),
            ("cancelamento", "Cancelamento pelo cliente após 7 dias", f"""<div class="table-wrap" tabindex="0" role="region" aria-label="Tabela: role para o lado se necessário"><table>
<thead><tr><th>Antecedência em relação à data do evento</th><th>Valor devolvido</th></tr></thead>
<tbody>
<tr><td>{F('X')} dias ou mais</td><td>{F('X%')} dos valores pagos</td></tr>
<tr><td>Entre {F('Y')} e {F('X')} dias</td><td>{F('Y%')} dos valores pagos</td></tr>
<tr><td>Menos de {F('Y')} dias</td><td>Valores pagos, descontados os custos já assumidos e comprovados (como insumos comprados e equipe contratada)</td></tr>
</tbody></table></div>
<p>As retenções correspondem a custos efetivamente assumidos para o seu evento. Elas são proporcionais e informadas com transparência.</p>"""),
            ("remarcacao", "Remarcação de data", f"<p>A remarcação pode ser solicitada até {F('X dias')} antes do evento, sujeita à disponibilidade de agenda, sem custo adicional. Valores podem ser ajustados se houver mudança de cardápio ou de número de convidados.</p>"),
            ("convidados", "Alteração no número de convidados", f"<p>O número final de convidados deve ser confirmado até {F('X dias')} antes do evento. Reduções informadas depois desse prazo podem não gerar abatimento, porque os insumos já terão sido adquiridos.</p>"),
            ("cancelamento-cjr", "Cancelamento pela CJR Gastronomia", "<p>Se precisarmos cancelar por qualquer motivo, inclusive força maior, você escolhe entre remarcar o evento ou receber de volta todos os valores pagos.</p>"),
            ("reclamacoes", "Problemas com o serviço", "<p>Se algo não sair como combinado, fale conosco o quanto antes. Você tem até 30 dias para reclamar de falhas aparentes (art. 26, I, do Código de Defesa do Consumidor). Analisaremos cada caso e ofereceremos a solução adequada: nova execução do serviço, abatimento proporcional do preço ou devolução de valores (art. 20 do CDC).</p>"),
            ("como-solicitar", "Como solicitar e prazo de devolução", f"<p>Solicite {CHANNEL}, informando o número do protocolo do pedido. A devolução é feita pelo mesmo meio de pagamento usado, em até {F('X dias úteis')}, ressalvada a devolução imediata do direito de arrependimento.</p>"),
        ],
    },
}


def chrome(source):
    sprite = re.search(r'<svg class="sprite".*?</svg>', source, re.S).group(0)
    header = re.search(r'<header class="site-header.*?</header>', source, re.S).group(0).replace(' aria-current="page"', '')
    footer = re.search(r'<footer class="site-footer".*?</footer>', source, re.S).group(0)
    float_link = re.search(r'<aside aria-label="Atendimento pelo WhatsApp">.*?</aside>', source, re.S).group(0).replace('flutuante-contato', 'flutuante-legal')
    head = re.search(r'<head>(.*?)</head>', source, re.S).group(1)
    assets = "\n".join(line for line in head.splitlines() if 'rel="stylesheet"' in line or "<script src=" in line or 'rel="preload"' in line or "rel=\"icon\"" in line)
    boot = re.search(r"<script>\s*document\.documentElement.*?</script>", head, re.S).group(0)
    return sprite, header, footer, float_link, assets, boot


def render(name, page, parts):
    sprite, header, footer, float_link, assets, boot = parts
    summary = "".join(f"<li>{item}</li>" for item in page["summary"])
    sections = "\n".join(f'<h2 id="{sid}">{title}</h2>\n{body}' for sid, title, body in page["sections"])
    return f"""<!doctype html>
<html lang="pt-BR" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{page['title']} · CJR Gastronomia</title>
  <meta name="description" content="{page['lead']}">
  <meta name="theme-color" content="#1b1a17">
  {boot}
{assets}
</head>
<body>
  <div class="intro" id="intro" aria-hidden="true">
    <img class="intro__logo" src="assets/logo/logo-claro-hd.png" alt="" width="1448" height="700">
    <span class="intro__line"></span>
  </div>
  {sprite}
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <div class="ambient" aria-hidden="true"><span></span><span></span><span></span></div>
  <div class="read-progress" aria-hidden="true" data-read-progress><span></span></div>
  {header}

  <main id="conteudo">
    <section class="page-hero on-dark" aria-labelledby="page-title">
      <div class="container">
        <p class="eyebrow reveal">Documentos</p>
        <h1 class="reveal" id="page-title" style="--delay: .1s">{page['title']}</h1>
        <p class="lead reveal" style="--delay: .2s">{page['lead']}</p>
        <p class="page-hero__meta reveal" style="--delay: .3s"><span>Última atualização: {page.get('updated', UPDATED)}</span><span>Leitura: cerca de {page['minutes']} minutos</span></p>
      </div>
    </section>
    <div class="container legal-layout">
      <aside class="legal-toc reveal" aria-labelledby="toc-title"><p id="toc-title">Nesta página</p><ol data-legal-toc></ol></aside>
      <article class="prose reveal" data-legal-article aria-labelledby="page-title">
        <div class="callout"><p><strong>Resumo em linguagem simples</strong></p><ul>{summary}</ul></div>
{sections}
      </article>
    </div>
  </main>

  {footer}

  {float_link}
  <button class="icon-btn to-top" type="button" data-to-top aria-label="Voltar ao topo"><svg aria-hidden="true"><use href="#i-arrow-left"/></svg></button>
  <p class="sr-only" aria-live="polite" data-announcer></p>
</body>
</html>
"""


if __name__ == "__main__":
    with open(SOURCE, encoding="utf-8") as fh:
        parts = chrome(fh.read())
    for filename, page in PAGES.items():
        with open(filename, "w", encoding="utf-8", newline="\n") as out:
            out.write(render(filename, page, parts))
        print("ok", filename)
