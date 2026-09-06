# Ninho — Ian ou Luísa

Aplicativo web/PWA para acompanhar a gestação da Isabela e organizar a chegada de Ian ou Luísa, com enxoval até 2 anos, vacinas, acompanhamento médico, orçamento, chá de fraldas, promoções e Agente Ninho.

## Estado atual da gestação

- Transferência FIV: embrião D5 em **31/07/2026**.
- Em **06/09/2026**, a idade gestacional calculada é **8 semanas e 0 dias**.
- A aplicação calcula por **dias de calendário**, evitando o erro de 7s6d causado pelo horário do navegador.
- Previsão do parto usada pelo app: **18/04/2027**. Se a obstetra/clínica adotar outra data, ajuste no `PROFILE` em `app.js`.

## Funcionalidades

- Dashboard da gestação com semana, trimestre e previsão do parto.
- Enxoval/inventário do nascimento aos 24 meses, com quantidades de rotina e status de compra.
- Filtros por categoria, fase e tamanho/faixa (RN, P, 0–3m, M, 3–6m, etc.).
- Perfil de alimentação para ajustar mamadeiras e acessórios (aleitamento materno, misto ou fórmula).
- Fraldas e higiene do bebê.
- Chá de fraldas com distribuição de tamanhos.
- Orçamento e preços por item.
- Radar de promoções/preço-alvo.
- Vacinação da mãe e vacinação do bebê em guias separadas.
- Acompanhamento médico recorrente com anexos de imagem/PDF.
- Agenda automática de pré-natal e puericultura.
- Agente Ninho para consultar inventário, vacinas, gastos e agenda.
- Explicação de textos/laudos localmente e, com OpenAI configurada, análise de imagens/PDFs.
- Sincronização com Neon Postgres para usar o mesmo inventário em computador e celular.
- PIN opcional/fortemente recomendado para proteger os dados no Render.

## Estrutura

- `index.html` — interface principal.
- `styles.css` — visual clean + papel de parede infantil.
- `app.js` — lógica do sistema, inventário, vacinas, agenda e sincronização.
- `server.js` — servidor Express, API de sincronização e Agente Ninho.
- `db.js` — integração com Neon Postgres.
- `schema.sql` — esquema mínimo do banco (o servidor também cria a tabela automaticamente).
- `render.yaml` — configuração pronta para Render.
- `manifest.webmanifest` e `sw.js` — PWA/cache.
- `.env.example` — variáveis de ambiente necessárias.

## Publicar no Neon

1. Crie uma conta/projeto no Neon.
2. No painel do projeto, clique em **Connect** e copie a connection string.
3. Ela terá formato semelhante a:
   `postgresql://usuario:senha@host.neon.tech/neondb?sslmode=require`
4. Você **não precisa criar a tabela manualmente**: o Ninho cria `ninho_state` ao iniciar. Se preferir, rode `schema.sql` no SQL Editor do Neon.

O projeto usa o driver oficial `@neondatabase/serverless` e a variável `DATABASE_URL`.

## Publicar no Render

Crie um **Web Service** apontando para este repositório e use:

- Runtime: **Node**
- Branch: **main**
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check: `/api/health`

O `render.yaml` já contém essa configuração.

### Variáveis no Render

Cadastre em **Environment**:

- `DATABASE_URL` — connection string do Neon.
- `NINHO_PIN` — escolha um PIN/senha forte para impedir acesso aos dados pela URL pública.
- `OPENAI_API_KEY` — opcional, necessária para o agente analisar imagem/PDF.
- `OPENAI_MODEL` — opcional; padrão do projeto: `gpt-5`.

Nunca coloque `DATABASE_URL`, `NINHO_PIN` ou `OPENAI_API_KEY` diretamente no GitHub.

## Como a sincronização funciona

- O navegador mantém uma cópia local para continuar funcionando mesmo se o servidor estiver temporariamente indisponível.
- Quando `DATABASE_URL` está configurada, o app carrega o estado do Neon e envia alterações automaticamente.
- Se `NINHO_PIN` estiver configurado, o navegador pergunta o PIN e o mantém apenas na sessão da aba/navegador.
- A tabela no Neon possui apenas uma linha de estado (`id = 1`) nesta versão, ideal para uso familiar.

## Agente de visão

Com `OPENAI_API_KEY`, o endpoint `/api/medical-explain` envia texto + imagem/PDF para a Responses API. O prompt restringe o agente a explicar o conteúdo em linguagem simples sem inventar achados nem substituir a avaliação médica.

## Enxoval

A lista usa **quantidade de rotina**, não apenas o mínimo. Itens futuros ficam marcados como **Esperar** para evitar compra precoce. Não existe uma quantidade oficial brasileira de cada peça de roupa; as quantidades práticas foram calibradas com checklists de serviços públicos de saúde, enquanto orientações de saúde e segurança usam fontes oficiais brasileiras.

### Alimentação

A meta de mamadeiras muda conforme o perfil escolhido:

- Aleitamento materno: quantidade reduzida/reserva.
- Misto: quantidade intermediária.
- Fórmula: quantidade maior para permitir rotação e higienização.

A opção continua condicional porque o Ministério da Saúde recomenda aleitamento materno exclusivo até 6 meses quando possível e não recomenda mamadeira/chupeta como rotina durante a amamentação.

## Fontes principais

- Ministério da Saúde — Calendário de Vacinação: https://www.gov.br/saude/pt-br/vacinacao/calendario
- Ministério da Saúde — Aleitamento materno: https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/a/aleitamento-materno
- Ministério da Saúde — Saúde materna: https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-mulher/saude-materna
- Ministério da Saúde — Saúde da criança: https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca
- Inmetro — Dispositivos de retenção para crianças: https://www.gov.br/inmetro/pt-br/acesso-a-informacao/perguntas-frequentes/avaliacao-da-conformidade/dispositivos-de-retencao-para-criancas
- Agros — Nascer Saudável: https://www.agros.org.br/saude/programas-e-campanhas-de-promocao-da-saude/nascer-saudavel
- NHS — checklist de itens para recém-nascido: https://www.nhs.uk/best-start-in-life/pregnancy/preparing-for-labour-and-birth/what-to-buy-for-your-newborn-baby/

## Observação sobre alertas de promoção

A interface já controla preço atual, preço-alvo e alerta quando o valor cadastrado atinge a meta. Monitoramento automático 24h de Amazon/Magalu/Shopee/Shein exige integração autorizada com APIs/feeds ou um serviço específico de preços; o projeto não faz scraping agressivo das lojas para evitar quebra de termos de uso e bloqueios.