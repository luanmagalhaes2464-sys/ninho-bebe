# Ninho — Ian ou Luísa

Aplicativo web/PWA para organizar a gestação da Isabela e a chegada de Ian ou Luísa.

## O que já existe

- Semana gestacional calculada a partir da transferência FIV D5 de 31/07/2026.
- Enxoval e inventário do nascimento aos 24 meses, com filtros por categoria e fase e lógica anti-excesso.
- Fraldas, higiene, sono, passeio, alimentação, desenvolvimento e segurança.
- Chá de fraldas.
- Orçamento e radar de promoções/preço-alvo.
- Guia separada de vacinação da mãe.
- Guia separada de vacinação do bebê até 24 meses, usando o Calendário Nacional 2026 como base.
- Acompanhamento médico com consultas, exames, anexos e recorrência.
- Geração automática da agenda pré-natal mensal/quinzenal/semanal.
- Geração das consultas de puericultura até 24 meses.
- Agente Ninho para consultar inventário, vacinas, agenda e explicar textos/laudos em linguagem simples.
- Backend opcional de IA com visão para explicar imagens de ultrassons, laudos e outros anexos médicos.

## Rodar somente a interface

Abra `index.html` ou `Ninho_Bebe_standalone.html`. Sem servidor, o agente continua respondendo inventário, agenda, vacinas e explicando textos localmente.

## Rodar com o agente de visão

1. Instale Node.js 20+.
2. Rode `npm install`.
3. Configure `OPENAI_API_KEY` no ambiente (não coloque a chave no JavaScript do navegador).
4. Rode `npm start`.
5. Acesse `http://localhost:3000`.

O endpoint `/api/medical-explain` envia texto + imagem/PDF ao modelo e devolve uma explicação simples. Ele é propositalmente instruído a não diagnosticar e a não inventar achados.

## Publicação

Para interface estática, GitHub Pages funciona, mas sem análise visual automática. Para ter o agente de visão, publique como serviço Node (por exemplo, no Render) e configure `OPENAI_API_KEY` como variável de ambiente.

## Fontes principais

- Ministério da Saúde — Calendário de Vacinação: https://www.gov.br/saude/pt-br/vacinacao/calendario
- Ministério da Saúde — Saúde Materna / pré-natal: https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-mulher/saude-materna
- Ministério da Saúde — Acompanhamento da Saúde da Criança: https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/primeira-infancia/acompanhamento-da-saude
- Agros — Nascer Saudável: https://www.agros.org.br/saude/programas-e-campanhas-de-promocao-da-saude/nascer-saudavel

## Enxoval revisado

A lista usa **quantidades de rotina**, e não apenas o mínimo para o bebê chegar em casa. Como não existe uma quantidade oficial brasileira para cada peça do enxoval, a aplicação separa duas coisas:

- **Segurança e saúde:** baseadas em Ministério da Saúde, Caderneta da Criança e Inmetro.
- **Quantidades práticas:** calibradas com checklists oficiais do NHS (por exemplo, 6 macacões/sleepsuits, 4–6 bodies/vests, 4 lençóis e, quando há alimentação por fórmula, pelo menos 6 mamadeiras).

O perfil de alimentação ajusta automaticamente a meta de mamadeiras: 2 no aleitamento materno, 4 no misto e 6 na fórmula. O Ministério da Saúde brasileiro não recomenda mamadeira/chupeta como rotina quando há aleitamento materno; por isso o item é tratado como condicional.

Fontes principais:
- https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/a/aleitamento-materno
- https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/caderneta/caderneta
- https://www.gov.br/inmetro/pt-br/acesso-a-informacao/perguntas-frequentes/avaliacao-da-conformidade/dispositivos-de-retencao-para-criancas
- https://www.nhs.uk/best-start-in-life/pregnancy/preparing-for-labour-and-birth/what-to-buy-for-your-newborn-baby/
- https://www.justonenorfolk.nhs.uk/healthy-lifestyles/infant-feeding/formula-feeding/what-equipment-do-i-need/
