const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v||0));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const DAY=86400000;
const PROFILE={mother:'Isabela',city:'Viçosa',state:'MG',plan:'Agros',planHolder:'Isabela',transfer:'2026-07-31',embryoDays:5,birthEstimate:'2027-04-18',sex:'Ainda não sabemos',babyNames:'Ian ou Luísa'};
const parseYmd=s=>{const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d,12,0,0,0)};
const calendarDay=d=>Math.round(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/DAY);
const now=new Date();
const today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12,0,0,0);
const transferDate=parseYmd(PROFILE.transfer);
const transferGestDays=14+PROFILE.embryoDays;
const gestDays=Math.max(0,transferGestDays+(calendarDay(today)-calendarDay(transferDate)));
const weeks=Math.floor(gestDays/7), days=gestDays%7;
const totalDays=280; const gestPct=clamp(Math.round(gestDays/totalDays*100),0,100);
const lmpEquivalent=new Date(transferDate); lmpEquivalent.setDate(lmpEquivalent.getDate()-transferGestDays);
const dueDate=parseYmd(PROFILE.birthEstimate);
const daysToDue=Math.max(0,calendarDay(dueDate)-calendarDay(today));
const fmtDate=d=>new Intl.DateTimeFormat('pt-BR').format(d instanceof Date?d:parseYmd(d));
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const addMonths=(d,n)=>{const x=new Date(d);x.setMonth(x.getMonth()+n);return x};
const iso=d=>{const x=d instanceof Date?d:parseYmd(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`};
const gestDaysAt=d=>Math.max(0,transferGestDays+(calendarDay(d)-calendarDay(transferDate)));

const icons={
 baby:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9.3 4.2c.3-1.5 1.5-2.5 3.1-2.5 1.7 0 3 1.2 3 2.9 0 .3 0 .6-.1.8"/><circle cx="12" cy="11" r="6.4"/><path d="M9.3 11.2h.01M14.7 11.2h.01M9.8 14c1.4 1 3 1 4.4 0"/></svg>',
 heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/></svg>',
 bag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
 tag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.6 13.6 11 23l-9-9V3h11l7.6 7.6a2.1 2.1 0 0 1 0 3Z"/><circle cx="7.5" cy="8.5" r="1.5"/></svg>',
 wallet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6a2 2 0 0 1 2-2h14v16H5a2 2 0 0 1-2-2Z"/><path d="M16 10h5v5h-5a2.5 2.5 0 0 1 0-5Z"/></svg>',
 gift:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 12v10H4V12M2 7h20v5H2Z"/><path d="M12 22V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7ZM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z"/></svg>',
 calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
 bot:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="7" width="16" height="13" rx="3"/><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8"/></svg>',
 plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>',
 send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
 bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',
 shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>',
 syringe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m14 4 6 6M17 1l6 6M13 7 5 15l4 4 8-8M6 14l-4 4M2 22l4-4"/></svg>',
 doctor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 3v5a3 3 0 0 0 6 0V3M8 3h2M14 3h2"/><path d="M12 11v3a6 6 0 0 0 6 6h1"/><circle cx="20" cy="18" r="2"/></svg>',
 clip:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m21.4 11.6-8.5 8.5a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 1 1-2.8-2.8l8.5-8.5"/></svg>',
 bottle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 3h6M10 3v3h4V3M8 8h8v12a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2Z"/><path d="M8 12h8"/></svg>'
};
if($('#logoIcon')) $('#logoIcon').innerHTML=icons.baby; if($('#avatarBaby')) $('#avatarBaby').innerHTML=icons.baby; if($('#sideBaby')) $('#sideBaby').innerHTML=icons.bottle;

const NAV=[['dashboard','Início','home'],['enxoval','Enxoval','bag'],['promocoes','Promoções','tag'],['orcamento','Orçamento','wallet'],['cha','Chá','gift'],['gestacao','Gestação','calendar'],['vacmae','Vacinas mãe','syringe'],['vacbebe','Vacinas bebê','shield'],['medico','Médico','doctor'],['agente','Agente','bot']];
const pageMeta={dashboard:['Nossa jornada','Tudo organizado para comprar só o que realmente faz sentido.'],enxoval:['Enxoval até 2 anos','Inventário completo por fase, com quantidades de rotina e compra no momento certo.'],promocoes:['Radar de preços','Defina o preço-alvo e acompanhe os links que valem a pena.'],orcamento:['Planejamento financeiro','Veja o impacto de cada compra antes de gastar.'],cha:['Chá de fraldas','Distribua tamanhos sem concentrar tudo em RN.'],gestacao:['Gestação','Semana atual, pré-natal e próximos marcos.'],vacmae:['Vacinação da mãe','Calendário da gestante com controle de doses.'],vacbebe:['Vacinação do bebê','Calendário-base do PNI até 24 meses.'],medico:['Acompanhamento médico','Consultas, exames, anexos e recorrências em uma linha do tempo.'],agente:['Agente Ninho','Pergunte sobre inventário, saúde, consultas, vacinas e orçamento.']};
function renderNav(){
  $('#navDesktop').innerHTML=NAV.map(([id,l,ic],i)=>`<button data-view="${id}" class="${i===0?'active':''}">${icons[ic]}<span>${l}</span></button>`).join('');
  $('#navMobile').innerHTML=NAV.map(([id,l,ic],i)=>`<button data-view="${id}" class="${i===0?'active':''}">${icons[ic]}<span>${l}</span></button>`).join('');
  $$('[data-view]').forEach(b=>b.onclick=()=>go(b.dataset.view));
}
function go(id){
  $$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${id}`));
  $$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
  $('#eyebrow').textContent=pageMeta[id][0]; $('#pageSub').textContent=pageMeta[id][1];
  $('#pageTitle').textContent=id==='dashboard'?'Bom dia 👶':pageMeta[id][0]; window.scrollTo({top:0,behavior:'smooth'});
}

const I=(id,name,category,size,recommended,when,essential,note,phase,status='Planejado')=>({id,name,category,size,recommended,have:0,status,when,essential,note,phase,price:0});
const defaultItems=[
 // ROUPAS — alvo de rotina por fase, considerando trocas e lavagem a cada 2–3 dias
 I('rn1','Body manga curta','Roupas','RN',5,'2º trimestre',true,'Parte do conjunto inicial; RN dura pouco, então o alvo é suficiente sem exagerar.','Nascimento'),
 I('rn2','Body manga longa','Roupas','RN',5,'2º trimestre',true,'Ajuda nas camadas e em noites mais frescas.','Nascimento'),
 I('rn3','Macacão com pezinho','Roupas','RN',6,'2º trimestre',true,'Quantidade de rotina para dia/noite e trocas.','Nascimento'),
 I('rn4','Calça / culote','Roupas','RN',5,'2º trimestre',true,'Para combinar com bodies.','Nascimento'),
 I('rn5','Casaquinho leve','Roupas','RN',2,'2º trimestre',false,'Duas unidades permitem rodízio sem formar estoque grande.','Nascimento'),
 I('rn6','Meias','Roupas','RN',4,'2º trimestre',false,'Quatro pares são suficientes para o início.','Nascimento'),
 I('rn7','Touca de algodão','Roupas','RN',1,'3º trimestre',false,'Mais útil em saída da maternidade ou frio; não precisa estocar.','Nascimento'),

 I('p1r','Body manga curta','Roupas','P / 0–3m',7,'2º trimestre',true,'Faixa de uso intenso; alvo pensado para trocas e lavanderia.','0–3m'),
 I('p2r','Body manga longa','Roupas','P / 0–3m',7,'2º trimestre',true,'Ajustar o uso à temperatura.','0–3m'),
 I('p3r','Macacão / pijama','Roupas','P / 0–3m',7,'2º trimestre',true,'Quantidade de rotina para sono e dia a dia.','0–3m'),
 I('p4r','Calça / culote','Roupas','P / 0–3m',6,'2º trimestre',true,'Combina com bodies.','0–3m'),
 I('p5r','Casaquinho leve','Roupas','P / 0–3m',2,'3º trimestre',false,'Comprar conforme o clima da época.','0–3m'),
 I('p6r','Meias','Roupas','P / 0–3m',5,'3º trimestre',false,'Cinco pares dão boa rotação.','0–3m'),

 I('m1r','Body manga curta','Roupas','M / 3–6m',7,'3º trimestre',true,'Comprar mais perto do uso para acertar tamanho e estação.','3–6m','Esperar'),
 I('m2r','Body manga longa','Roupas','M / 3–6m',6,'3º trimestre',true,'Ajustar à estação.','3–6m','Esperar'),
 I('m3r','Macacão / pijama','Roupas','M / 3–6m',6,'Após nascer',true,'Boa rotação para noites e cochilos.','3–6m','Esperar'),
 I('m4r','Calça / conjunto leve','Roupas','M / 3–6m',6,'Após nascer',true,'Comprar conforme crescimento real.','3–6m','Esperar'),
 I('m5r','Conjunto para passeio','Roupas','M / 3–6m',4,'Após nascer',false,'Poucos conjuntos bastam.','3–6m','Esperar'),
 I('m6r','Casaquinho','Roupas','M / 3–6m',2,'Após nascer',false,'Ajustar ao clima.','3–6m','Esperar'),
 I('m7r','Meias','Roupas','M / 3–6m',5,'Após nascer',false,'Comprar perto da fase.','3–6m','Esperar'),

 I('g1r','Body / camiseta manga curta','Roupas','G / 6–9m',7,'5–6 meses',true,'Comprar quando o M estiver ficando pequeno.','6–9m','Esperar'),
 I('g2r','Body / camiseta manga longa','Roupas','G / 6–9m',5,'5–6 meses',false,'Ajustar à estação.','6–9m','Esperar'),
 I('g3r','Pijama / macacão','Roupas','G / 6–9m',6,'5–6 meses',true,'Boa rotação semanal.','6–9m','Esperar'),
 I('g4r','Calça / short','Roupas','G / 6–9m',6,'5–6 meses',true,'Ajustar ao clima.','6–9m','Esperar'),
 I('g5r','Casaquinho','Roupas','G / 6–9m',2,'5–6 meses',false,'Só comprar conforme estação.','6–9m','Esperar'),
 I('g6r','Meias','Roupas','G / 6–9m',5,'5–6 meses',false,'Comprar conforme uso.','6–9m','Esperar'),

 I('gg1','Body / camiseta manga curta','Roupas','GG / 9–12m',8,'8–9 meses',true,'Maior mobilidade costuma aumentar trocas.','9–12m','Esperar'),
 I('gg2','Camiseta manga longa','Roupas','GG / 9–12m',4,'8–9 meses',false,'Ajustar à estação.','9–12m','Esperar'),
 I('gg3','Pijama','Roupas','GG / 9–12m',6,'8–9 meses',true,'Rotação confortável para a semana.','9–12m','Esperar'),
 I('gg4','Calça / short','Roupas','GG / 9–12m',7,'8–9 meses',true,'Comprar por estação.','9–12m','Esperar'),
 I('gg5','Casaquinho','Roupas','GG / 9–12m',2,'8–9 meses',false,'Só perto do uso.','9–12m','Esperar'),
 I('gg6','Meias','Roupas','GG / 9–12m',5,'8–9 meses',false,'Comprar conforme necessidade.','9–12m','Esperar'),

 I('12a1','Camisetas / bodies','Roupas','12–18m',8,'11–12 meses',true,'Nessa fase algumas marcas deixam de usar body; ajustar ao que funcionar melhor.','12–18m','Esperar'),
 I('12a2','Calças / shorts','Roupas','12–18m',7,'11–12 meses',true,'Rotação semanal.','12–18m','Esperar'),
 I('12a3','Pijamas','Roupas','12–18m',6,'11–12 meses',true,'Quantidade de rotina.','12–18m','Esperar'),
 I('12a4','Casaquinhos','Roupas','12–18m',2,'11–12 meses',false,'Ajustar ao clima.','12–18m','Esperar'),
 I('12a5','Meias','Roupas','12–18m',6,'11–12 meses',false,'Comprar conforme uso de calçados.','12–18m','Esperar'),
 I('12a6','Calçado flexível','Roupas','12–18m',1,'Quando começar a andar fora',false,'Dentro de casa, priorizar liberdade dos pés quando seguro; comprar pelo tamanho real.','12–18m','Esperar'),

 I('18a1','Camisetas','Roupas','18–24m',8,'17–18 meses',true,'Rotação semanal.','18–24m','Esperar'),
 I('18a2','Calças / shorts','Roupas','18–24m',7,'17–18 meses',true,'Comprar conforme estação.','18–24m','Esperar'),
 I('18a3','Pijamas','Roupas','18–24m',6,'17–18 meses',true,'Quantidade de rotina.','18–24m','Esperar'),
 I('18a4','Casaquinhos','Roupas','18–24m',2,'17–18 meses',false,'Ajustar ao clima.','18–24m','Esperar'),
 I('18a5','Meias','Roupas','18–24m',6,'17–18 meses',false,'Comprar conforme uso.','18–24m','Esperar'),
 I('18a6','Calçado flexível','Roupas','18–24m',2,'17–18 meses',false,'Comprar somente pelo tamanho real do pé.','18–24m','Esperar'),

 // SONO E QUARTO
 I('s1','Berço certificado','Sono','Único',1,'2º trimestre',true,'Verificar certificação, montagem e manual do fabricante.','Nascimento','Pesquisar'),
 I('s2','Colchão firme e adequado ao berço','Sono','Único',1,'2º trimestre',true,'Deve encaixar corretamente, sem folgas.','Nascimento','Pesquisar'),
 I('s3','Lençol com elástico','Sono','Berço',4,'3º trimestre',true,'Quatro permitem rodízio em caso de vazamentos e lavagens.','Nascimento'),
 I('s5','Protetor impermeável de colchão','Sono','Berço',2,'3º trimestre',true,'Dois facilitam troca e lavagem.','Nascimento'),
 I('s4','Saco de dormir apropriado','Sono','0–6m',2,'3º trimestre',false,'Opcional; dois permitem rodízio. Seguir tamanho/peso do fabricante.','Nascimento','Pesquisar'),
 I('s6','Manta / cueiro para colo e passeio','Sono','Único',3,'3º trimestre',true,'Para colo/passeio; não deixar solto no berço durante o sono.','Nascimento'),
 I('s7','Luz noturna suave','Sono','Único',1,'3º trimestre',false,'Facilita trocas noturnas sem iluminar demais o quarto.','Nascimento','Pesquisar'),
 I('s8','Babá eletrônica','Sono','Único',1,'Após organizar o quarto',false,'Opcional; depende da casa e da rotina.','Nascimento','Pesquisar'),
 I('x1','Travesseiro para RN','Sono','Único',0,'Não comprar',false,'Não usar no espaço de sono do recém-nascido.','Nascimento','Evitar'),
 I('x2','Kit berço acolchoado / protetor lateral','Sono','Único',0,'Não comprar',false,'Evitar objetos acolchoados ou soltos no espaço de sono.','Nascimento','Evitar'),
 I('x3','Edredom / cobertor pesado no berço','Sono','Único',0,'Não comprar para sono do RN',false,'Evitar roupa de cama solta durante o sono.','Nascimento','Evitar'),
 I('x4','Ninho redutor para dormir','Sono','Único',0,'Não comprar para sono',false,'Não usar como superfície principal de sono.','Nascimento','Evitar'),

 // FRALDAS — o alvo de pacotes é sincronizado com o Chá e usa a referência de consumo da Huggies.
 I('d1','Fralda descartável','Fraldas','RN · pacote',5,'3º trimestre / chá',true,'Meta de pacotes sincronizada com o Chá. Referência Huggies: RN usa mais trocas/dia, mas costuma ficar pouco tempo neste tamanho.','Nascimento'),
 I('d2','Fralda descartável','Fraldas','P · pacote',11,'Chá / perto do parto',true,'Meta sincronizada com o Chá. Planejamento: cerca de 8 fraldas/dia; ajuste depois pelo peso e consumo real.','0–4m'),
 I('d3','Fralda descartável','Fraldas','M · pacote',22,'Chá / após nascer',true,'Meta sincronizada com o Chá. Planejamento: cerca de 8 fraldas/dia nesta fase.','5–10m','Esperar'),
 I('d4','Fralda descartável','Fraldas','G · pacote',33,'Chá / após nascer',true,'Meta sincronizada com o Chá. Planejamento: cerca de 7 fraldas/dia e fase longa.','11–20m','Esperar'),
 I('d5','Fralda descartável','Fraldas','XG · pacote',9,'Chá / após nascer',true,'Meta sincronizada com o Chá. Planejamento: cerca de 5 fraldas/dia; início depende do peso e da modelagem.','21–24m','Esperar'),
 I('d6','Fralda para água / piscina','Fraldas','6m+',1,'Quando houver piscina/praia',false,'Comprar apenas se entrar na rotina.','6–24m','Esperar'),

 // HIGIENE E TROCAS
 I('h1','Algodão em discos ou bolas','Higiene','Pacote',3,'3º trimestre',true,'Para higiene com água morna nas trocas.','Nascimento'),
 I('h2','Gaze estéril','Higiene','Pacote',2,'3º trimestre',false,'Útil apenas quando houver orientação específica.','Nascimento'),
 I('h3','Álcool 70%','Higiene','Frasco pequeno',1,'3º trimestre',false,'Para o coto somente conforme orientação da maternidade/equipe de saúde.','Nascimento'),
 I('h4','Sabonete líquido suave','Higiene','Frasco',1,'3º trimestre',true,'Começar com um; não há necessidade de estocar cosméticos.','Nascimento'),
 I('h5','Lenço umedecido sem perfume/álcool','Higiene','Pacote',3,'Perto do parto',false,'Útil fora de casa; em casa, água e algodão podem ser suficientes.','Nascimento'),
 I('h6','Fralda de boca / pano pequeno','Higiene','Único',12,'2º trimestre',true,'Usa bastante em mamadas, baba e pequenas limpezas.','Nascimento'),
 I('h12','Fralda de ombro / pano grande','Higiene','Único',6,'2º trimestre',true,'Para colo, arroto e proteção da roupa.','Nascimento'),
 I('h7','Toalha com capuz','Higiene','Único',3,'3º trimestre',true,'Três dão boa rotação.','Nascimento'),
 I('h13','Toalhinha / pano de banho','Higiene','Único',6,'3º trimestre',false,'Útil para banho e pequenas limpezas.','Nascimento'),
 I('h8','Banheira','Higiene','Único',1,'3º trimestre',true,'Priorizar estabilidade e facilidade de limpeza.','Nascimento','Pesquisar'),
 I('h9','Trocador impermeável fixo','Higiene','Único',1,'3º trimestre',true,'Pode ser simples e lavável.','Nascimento'),
 I('h14','Trocador portátil','Higiene','Único',1,'3º trimestre',false,'Útil na bolsa para sair de casa.','Nascimento'),
 I('h10','Cortador/tesoura de unha infantil','Higiene','Único',1,'3º trimestre',true,'Uma unidade é suficiente.','Nascimento'),
 I('h11','Escova macia de cabelo','Higiene','Único',1,'Após nascer',false,'Opcional.','0–6m','Esperar'),
 I('h15','Creme barreira para assadura','Higiene','Tubo',2,'3º trimestre',true,'Um em uso e um reserva; ajustar à orientação pediátrica.','Nascimento'),
 I('h16','Cesto de roupas do bebê','Higiene','Único',1,'3º trimestre',false,'Ajuda a separar peças pequenas.','Nascimento'),
 I('h17','Organizadores/cestos para trocas','Higiene','Único',3,'3º trimestre',false,'Facilitam manter fraldas e higiene à mão.','Nascimento'),

 // SAÚDE
 I('sa1','Termômetro digital','Saúde','Único',1,'3º trimestre',true,'Item essencial para ter em casa.','Nascimento'),
 I('sa2','Aspirador nasal manual','Saúde','Único',1,'Perto do parto',false,'Usar conforme orientação pediátrica.','Nascimento','Pesquisar'),
 I('sa3','Soro fisiológico 0,9% em ampolas','Saúde','Caixa',1,'Perto do parto',false,'Ter pequena quantidade; usar conforme orientação.','Nascimento'),
 I('sa4','Kit básico de primeiros socorros','Saúde','Único',1,'3º trimestre',true,'Sem formar estoque de medicamentos; foco em materiais básicos.','Nascimento'),
 I('sa5','Escova dental infantil','Saúde','Primeiros dentes',2,'Quando nascer o primeiro dente',true,'Uma em uso e uma reserva; iniciar higiene bucal quando indicado.','6–24m','Esperar'),
 I('sa6','Creme dental infantil fluoretado','Saúde','Primeiros dentes',1,'Quando nascer o primeiro dente',true,'Escolher conforme orientação odontopediátrica e do rótulo.','6–24m','Esperar'),
 I('sa7','Protetor solar infantil','Saúde','6m+',1,'A partir de 6 meses',false,'Comprar perto do uso e seguir faixa etária/rotulagem.','6–24m','Esperar'),
 I('sa8','Repelente infantil adequado à idade','Saúde','Idade conforme produto',1,'Quando necessário',false,'Comprar conforme idade e orientação/rotulagem.','6–24m','Esperar'),

 // PASSEIO E TRANSPORTE
 I('ps1','Bebê conforto certificado','Passeio','Nascimento',1,'2º trimestre',true,'Essencial para transporte em carro; conferir certificação e instalação.','Nascimento','Pesquisar'),
 I('ps2','Carrinho com reclínio adequado','Passeio','Único',1,'2º/3º trimestre',true,'Comparar peso, porta-malas, reclínio e rotina.','Nascimento','Pesquisar'),
 I('ps3','Mochila / bolsa do bebê','Passeio','Único',1,'3º trimestre',true,'Uma bolsa funcional resolve a rotina.','Nascimento'),
 I('ps5','Capa de chuva para carrinho','Passeio','Compatível',1,'Junto do carrinho',false,'Útil para deslocamentos.','Nascimento','Pesquisar'),
 I('ps6','Manta leve para passeio','Passeio','Único',2,'3º trimestre',false,'Para colo/carrinho, conforme clima.','Nascimento'),
 I('ps7','Sling / canguru ergonômico','Passeio','Único',1,'Após nascer',false,'Opcional; usar respeitando posição, vias aéreas e manual.','0–12m','Pesquisar'),
 I('ps8','Organizador de carrinho','Passeio','Único',1,'Após nascer',false,'Conveniente, não essencial.','0–12m','Esperar'),
 I('ps4','Cadeirinha veicular próxima fase','Passeio','Conforme peso/altura',1,'Quando bebê conforto ficar pequeno',true,'Comprar apenas quando necessário e conforme especificações do fabricante.','9–24m','Esperar'),
 I('ps9','Carrinho guarda-chuva / leve','Passeio','12m+',0,'Só se a rotina pedir',false,'Não comprar se o carrinho principal atender bem.','12–24m','Esperar'),

 // AMAMENTAÇÃO E ALIMENTAÇÃO
 I('al1','Mamadeira pequena (120–160 ml)','Alimentação','0–6m',4,'Perto do parto / conforme plano alimentar',false,'Alvo muda pelo perfil de alimentação: aleitamento materno 2, misto 4, fórmula 6.','Nascimento','Pesquisar'),
 I('al2','Mamadeira média/grande (240–330 ml)','Alimentação','6m+',4,'Mais perto do uso',false,'Alvo muda pelo perfil de alimentação; não precisa comprar todas agora.','6–12m','Esperar'),
 I('al9','Bicos extras compatíveis','Alimentação','Fluxo adequado',4,'Conforme uso de mamadeira',false,'Ter reposição evita ficar sem bico em caso de desgaste.','Nascimento','Pesquisar'),
 I('al10','Escova para mamadeira e bico','Alimentação','Único',2,'Se usar mamadeiras',false,'Uma em uso e uma reserva.','Nascimento','Pesquisar'),
 I('al11','Método de esterilização','Alimentação','Único',1,'Se usar mamadeiras',false,'Pode ser equipamento apropriado ou método orientado; não precisa ser elétrico.','Nascimento','Pesquisar'),
 I('al12','Escorredor para mamadeiras','Alimentação','Único',1,'Se usar mamadeiras',false,'Opcional, mas ajuda na organização e secagem.','Nascimento','Pesquisar'),
 I('al13','Bomba tira-leite','Alimentação','Único',1,'Se houver extração de leite',false,'Comprar/alugar conforme necessidade e rotina da Isabela.','Nascimento','Pesquisar'),
 I('al14','Potes/sacos para armazenar leite','Alimentação','Unidades',10,'Se houver extração de leite',false,'Começar com poucas unidades e repor conforme uso.','Nascimento','Pesquisar'),
 I('al15','Absorventes para seios','Alimentação','Caixa',2,'3º trimestre',false,'Úteis para a mãe se houver vazamento de leite.','Nascimento'),
 I('al16','Almofada de amamentação','Alimentação','Único',1,'3º trimestre',false,'Opcional; depende do conforto da Isabela.','Nascimento','Pesquisar'),
 I('al3','Babadores de alimentação','Alimentação','6m+',8,'5–6 meses',true,'Quantidade de rotina para refeições e lavagem.','6–12m','Esperar'),
 I('al4','Copo aberto pequeno','Alimentação','6m+',2,'5–6 meses',true,'Comprar perto da introdução alimentar.','6–12m','Esperar'),
 I('al17','Copo com canudo','Alimentação','6m+',2,'6–9 meses',false,'Pode entrar conforme habilidade e rotina.','6–12m','Esperar'),
 I('al5','Pratos / tigelas infantis','Alimentação','6m+',3,'5–6 meses',true,'Três dão boa rotação.','6–12m','Esperar'),
 I('al6','Colheres infantis','Alimentação','6m+',4,'5–6 meses',true,'Algumas somem/ficam na bolsa; quatro é um alvo prático.','6–12m','Esperar'),
 I('al18','Garfinhos infantis','Alimentação','12m+',2,'10–12 meses',false,'Comprar mais perto da fase.','12–24m','Esperar'),
 I('al7','Cadeirão de alimentação','Alimentação','6m+',1,'5–6 meses',true,'Priorizar estabilidade, apoio e facilidade de limpeza.','6–12m','Pesquisar'),
 I('al19','Potes para refeições/congelamento','Alimentação','6m+',6,'5–6 meses',false,'Úteis se vocês prepararem porções.','6–12m','Esperar'),
 I('al8','Potes para lanche','Alimentação','12m+',4,'11–12 meses',false,'Comprar conforme rotina fora de casa.','12–24m','Esperar'),
 I('al20','Bolsa térmica pequena','Alimentação','6m+',1,'Quando começar passeios com comida',false,'Opcional.','6–24m','Esperar'),

 // DESENVOLVIMENTO
 I('dev1','Tapete lavável para brincar no chão','Desenvolvimento','3m+',1,'Após nascer',true,'Útil para brincar no chão com supervisão.','3–12m','Esperar'),
 I('dev2','Chocalho / brinquedo leve','Desenvolvimento','0–6m',2,'Após nascer',false,'Poucos itens já são suficientes.','0–6m','Esperar'),
 I('dev4','Cartões de alto contraste','Desenvolvimento','0–4m',1,'Após nascer',false,'Opcional; interação humana continua sendo o principal estímulo.','0–6m','Esperar'),
 I('dev5','Mordedores','Desenvolvimento','3m+',3,'3–4 meses',false,'Três permitem rodízio e higiene.','3–12m','Esperar'),
 I('dev3','Livros cartonados / resistentes','Desenvolvimento','6m+',6,'Após 5 meses',true,'Uma pequena coleção permite variar a leitura.','6–24m','Esperar'),
 I('dev6','Copos de empilhar / encaixe','Desenvolvimento','6m+',1,'6–8 meses',false,'Um conjunto é suficiente.','6–18m','Esperar'),
 I('dev7','Blocos grandes','Desenvolvimento','12m+',1,'11–12 meses',false,'Um conjunto simples.','12–24m','Esperar'),
 I('dev8','Bolas macias','Desenvolvimento','9m+',2,'8–9 meses',false,'Para brincadeiras motoras supervisionadas.','9–24m','Esperar'),
 I('dev9','Brinquedo de empurrar','Desenvolvimento','12m+',1,'Quando estiver andando com apoio',false,'Comprar apenas quando fizer sentido para a fase.','12–24m','Esperar'),
 I('dev10','Andador com assento/rodinhas','Desenvolvimento','Único',0,'Não comprar',false,'Evitar; priorizar brincadeiras no chão e mobilidade supervisionada.','6–18m','Evitar'),

 // SEGURANÇA DA CASA
 I('seg1','Protetores de tomada','Segurança','Casa',1,'Antes de engatinhar',true,'Instalar antes de maior mobilidade.','6–12m','Esperar'),
 I('seg2','Travas de armários/gavetas','Segurança','Casa',1,'Antes de engatinhar',true,'Instalar nos pontos de risco.','6–12m','Esperar'),
 I('seg3','Grade de segurança','Segurança','Se houver escadas',1,'Antes de engatinhar',false,'Só se houver escadas ou área de risco.','6–12m','Esperar'),
 I('seg4','Trava de vaso sanitário','Segurança','Banheiro',1,'Antes de andar',false,'Opcional conforme acesso ao banheiro.','9–18m','Esperar'),
 I('seg5','Trava de geladeira/forno','Segurança','Cozinha',2,'Antes de andar',false,'Aplicar apenas nos equipamentos acessíveis.','9–18m','Esperar'),
 I('seg6','Protetores de quina','Segurança','Casa',1,'Antes de andar',false,'Usar nos móveis realmente perigosos.','9–18m','Esperar'),
 I('seg7','Fixação de móveis altos à parede','Segurança','Casa',1,'Antes de engatinhar',true,'Revisar cômodas/estantes que possam tombar.','6–12m','Esperar'),
 I('seg8','Tapete antiderrapante para banho','Segurança','Banheiro',1,'Quando ficar em pé',true,'Ajuda quando a criança começa a ficar em pé no banho.','9–24m','Esperar'),
 I('seg9','Trava de janelas / telas seguras','Segurança','Casa',1,'Antes de andar',true,'Avaliar todas as janelas acessíveis.','9–24m','Esperar'),
 I('seg10','Barreira para áreas de risco','Segurança','Conforme casa',1,'Antes de engatinhar',false,'Usar para cozinha, lavanderia ou outras áreas quando necessário.','6–18m','Esperar')
];

const motherVaccines=[
 {id:'mv1',when:'Ao saber da gravidez',name:'Hepatite B',dose:'Completar esquema de 3 doses conforme histórico',note:'Revisar o cartão vacinal com a equipe.'},
 {id:'mv2',when:'Ao saber da gravidez',name:'dT',dose:'Completar esquema de 3 doses conforme histórico',note:'Difteria e tétano.'},
 {id:'mv3',when:'Na temporada',name:'Influenza trivalente',dose:'1 dose por temporada',note:'Indicada durante a gestação.'},
 {id:'mv4',when:'Durante a gestação',name:'Covid-19',dose:'1 dose a cada gestação',note:'Conforme Calendário Nacional 2026.'},
 {id:'mv5',when:'A partir da 20ª semana',name:'dTpa',dose:'1 dose em cada gestação',note:'Protege também o bebê nos primeiros meses.'},
 {id:'mv6',when:'A partir da 28ª semana',name:'Vírus sincicial respiratório (VSR)',dose:'1 dose em cada gestação',note:'Proteção materna e do bebê nos primeiros meses.'},
 {id:'mv7',when:'Situação específica',name:'Febre amarela',dose:'Somente em situações excepcionais',note:'Depende de avaliação de risco-benefício pelo serviço de saúde.'}
];
const babyVaccines=[
 {id:'bv1',age:'Ao nascer',name:'Hepatite B',dose:'1 dose'}, {id:'bv2',age:'Ao nascer',name:'BCG',dose:'Dose única'},
 {id:'bv3',age:'2 meses',name:'Pentavalente (DTP+Hib+HB)',dose:'1ª dose'}, {id:'bv4',age:'2 meses',name:'Poliomielite inativada (VIP)',dose:'1ª dose'}, {id:'bv5',age:'2 meses',name:'Rotavírus humano monovalente',dose:'1ª dose'}, {id:'bv6',age:'2 meses',name:'Pneumocócica 20-valente (VPC20)',dose:'1ª dose · transição PNI 2026'},
 {id:'bv7',age:'3 meses',name:'Meningocócica C',dose:'1ª dose'},
 {id:'bv8',age:'4 meses',name:'Pentavalente (DTP+Hib+HB)',dose:'2ª dose'}, {id:'bv9',age:'4 meses',name:'Poliomielite inativada (VIP)',dose:'2ª dose'}, {id:'bv10',age:'4 meses',name:'Rotavírus humano monovalente',dose:'2ª dose'}, {id:'bv11',age:'4 meses',name:'Pneumocócica 10-valente (VPC10)',dose:'2ª dose · transição PNI 2026'},
 {id:'bv12',age:'5 meses',name:'Meningocócica C',dose:'2ª dose'},
 {id:'bv13',age:'6 meses',name:'Pentavalente (DTP+Hib+HB)',dose:'3ª dose'}, {id:'bv14',age:'6 meses',name:'Poliomielite inativada (VIP)',dose:'3ª dose'}, {id:'bv15',age:'6 meses',name:'Influenza trivalente',dose:'1ª dose se primeira vacinação'}, {id:'bv16',age:'6 meses',name:'Covid-19',dose:'1ª dose conforme produto/esquema vigente'},
 {id:'bv15b',age:'7 meses',name:'Influenza trivalente',dose:'2ª dose se primovacinado'}, {id:'bv17',age:'7 meses',name:'Covid-19',dose:'2ª dose conforme produto/esquema vigente'},
 {id:'bv18',age:'9 meses',name:'Covid-19',dose:'3ª dose conforme produto/esquema vigente'}, {id:'bv19',age:'9 meses',name:'Febre amarela',dose:'1 dose conforme calendário/área de recomendação'},
 {id:'bv20',age:'12 meses',name:'Pneumocócica 20-valente (VPC20)',dose:'Reforço · PNI 2026'}, {id:'bv21',age:'12 meses',name:'Meningocócica ACWY',dose:'1 dose'}, {id:'bv22',age:'12 meses',name:'Tríplice viral (SCR)',dose:'1ª dose'},
 {id:'bv23',age:'15 meses',name:'DTP',dose:'1º reforço'}, {id:'bv24',age:'15 meses',name:'Poliomielite inativada (VIP)',dose:'1º reforço'}, {id:'bv25',age:'15 meses',name:'Tríplice viral (SCR)',dose:'2ª dose'}, {id:'bv26',age:'15 meses',name:'Varicela',dose:'1ª dose'}, {id:'bv27',age:'15 meses',name:'Hepatite A',dose:'1 dose'},
 {id:'bv28',age:'18 meses',name:'Revisar caderneta',dose:'Conferir atrasos e vacina anual de influenza quando aplicável'},
 {id:'bv29',age:'24 meses',name:'Revisar caderneta',dose:'Conferir atrasos e calendário vigente'}
];

const DIAPER_REF=[
 {size:'RN',age:'início da vida',daily:'9–10/dia',monthly:'~270–300/mês',share:.06,note:'Estoque pequeno: o bebê pode perder RN rapidamente.'},
 {size:'P',age:'aprox. 2–4 meses',daily:'8/dia',monthly:'~240/mês',share:.14,note:'Meta de planejamento do Ninho, com folga sem exagerar no estoque.'},
 {size:'M',age:'aprox. 5–10 meses',daily:'8/dia',monthly:'~240/mês',share:.28,note:'Meta de planejamento com margem de segurança para uma fase importante.'},
 {size:'G',age:'aprox. 11–20 meses',daily:'7/dia',monthly:'~210/mês',share:.41,note:'Fase geralmente longa; o Ninho mantém a maior fatia do chá em G.'},
 {size:'XG',age:'aprox. 21–24 meses',daily:'5/dia',monthly:'~150/mês',share:.11,note:'Pode começar antes/depois conforme peso, corpo e modelagem da marca.'}
];
const DIAPER_ITEM_SIZE={d1:'RN',d2:'P',d3:'M',d4:'G',d5:'XG'};
const SHOWER_DIAPER_REF=[
 {size:'RN',share:.06,note:'Poucos pacotes para não sobrar se perder o tamanho rápido.'},
 {size:'P',share:.28,note:'Foco inicial do chá: uso cedo e consumo alto.'},
 {size:'M',share:.51,note:'Maior foco do chá: uso intenso e fase mais longa.'},
 {size:'G',share:.15,note:'Reserva moderada para a sequência, sem estocar por tempo demais.'}
];
const VACCINE_PRIVATE_INFO={
 mv1:{sus:'Sim, conforme histórico · R$ 0',agros:'Sem cobertura vacinal rotineira confirmada'},
 mv2:{sus:'Sim, conforme histórico · R$ 0',agros:'Sem cobertura vacinal rotineira confirmada'},
 mv3:{sus:'Sim, a cada temporada · R$ 0',agros:'Sem cobertura vacinal rotineira confirmada'},
 mv4:{sus:'Sim, em cada gestação · R$ 0',agros:'Sem cobertura vacinal rotineira confirmada'},
 mv5:{sus:'Sim, a partir de 20 semanas · R$ 0',agros:'Sem cobertura vacinal rotineira confirmada'},
 mv6:{sus:'Sim, a partir de 28 semanas · R$ 0',agros:'Sem cobertura vacinal rotineira confirmada'},
 mv7:{sus:'Somente situação excepcional · R$ 0',agros:'Sem cobertura vacinal rotineira confirmada'},
 bv1:{sus:'Rotina · R$ 0',agros:'Não é necessário pagar se usar o SUS'},
 bv2:{sus:'Rotina · R$ 0',agros:'Não é necessário pagar se usar o SUS'},
 bv3:{sus:'Rotina · R$ 0',agros:'Privado usa alternativa acelular'},
 bv4:{sus:'Rotina · R$ 0',agros:'Privado usa combinações'},
 bv5:{sus:'Rotina · R$ 0',agros:'Privado tem versão pentavalente'},
 bv6:{sus:'Rotina/transição 2026 · R$ 0',agros:'Privado também oferece VPC20'},
 bv7:{sus:'Rotina · R$ 0',agros:'Privado pode usar ACWY mais ampla'},
 bv8:{sus:'Rotina · R$ 0',agros:'Privado usa alternativa acelular'},
 bv9:{sus:'Rotina · R$ 0',agros:'Privado usa combinações'},
 bv10:{sus:'Rotina · R$ 0',agros:'Privado tem versão pentavalente'},
 bv11:{sus:'Rotina/transição 2026 · R$ 0',agros:'Privado pode usar VPC20/VPC15'},
 bv12:{sus:'Rotina · R$ 0',agros:'Privado pode usar ACWY mais ampla'},
 bv13:{sus:'Rotina · R$ 0',agros:'Privado usa alternativa acelular'},
 bv14:{sus:'Rotina · R$ 0',agros:'Privado usa combinações'},
 bv15:{sus:'Rotina · R$ 0',agros:'Privado disponível'},
 bv15b:{sus:'Rotina na primovacinação · R$ 0',agros:'Privado disponível'},
 bv16:{sus:'Rotina · R$ 0',agros:'Confirmar produto disponível'},
 bv17:{sus:'Rotina · R$ 0',agros:'Confirmar produto disponível'},
 bv18:{sus:'Rotina · R$ 0',agros:'Confirmar produto disponível'},
 bv19:{sus:'Rotina aos 9 meses · R$ 0',agros:'Privado disponível'},
 bv20:{sus:'Reforço PNI 2026 · R$ 0',agros:'Privado também oferece VPC20'},
 bv21:{sus:'Rotina aos 12 meses · R$ 0',agros:'Privado também oferece'},
 bv22:{sus:'Rotina · R$ 0',agros:'Privado disponível'},
 bv23:{sus:'Rotina · R$ 0',agros:'Privado usa alternativa acelular'},
 bv24:{sus:'Rotina · R$ 0',agros:'Privado usa combinações'},
 bv25:{sus:'Rotina · R$ 0',agros:'Privado disponível'},
 bv26:{sus:'1ª dose aos 15m · R$ 0',agros:'SBIm antecipa esquema completo'},
 bv27:{sus:'1 dose aos 15m · R$ 0',agros:'SBIm recomenda 2 doses'},
 bv28:{sus:'Revisão/atualização · R$ 0',agros:'—'},
 bv29:{sus:'Revisão/atualização · R$ 0',agros:'—'}
};

const PRIVATE_VAX_EXTRA=[
 {type:'Adicional',name:'Meningocócica B (Bexsero)',when:'3 e 5 meses + reforço entre 12–15 meses',sus:'Não faz parte da rotina do PNI',why:'Protege contra o meningococo B. A SBIm recomenda de rotina para crianças.',price:'R$ 643,15 por dose',source:'Hermes Pardini'},
 {type:'Cobertura mais ampla',name:'Meningocócica ACWY no esquema primário',when:'3 e 5 meses + reforço',sus:'SUS usa MenC aos 3/5m e ACWY no reforço aos 12m',why:'A SBIm prefere ACWY quando possível, por cobrir A, C, W e Y já no esquema inicial.',price:'R$ 380,95 por dose',source:'Hermes Pardini'},
 {type:'Alternativa privada',name:'Hexavalente acelular (DTPa-HB-VIP-Hib)',when:'2, 4 e 6 meses',sus:'SUS oferece penta de células inteiras + VIP separada',why:'Não acrescenta “novas” doenças ao esquema; combina vacinas e usa componente pertussis acelular, geralmente menos reatogênico.',price:'R$ 298–322 por dose',source:'Sabin / Hermes Pardini'},
 {type:'Alternativa privada',name:'Rotavírus pentavalente',when:'2, 4 e 6 meses',sus:'SUS oferece rotavírus monovalente em 2 doses',why:'É outra formulação, com esquema de 3 doses. Não iniciar/trocar esquema sem orientação do serviço.',price:'R$ 270,75 por dose',source:'Hermes Pardini'},
 {type:'Dose adicional SBIm',name:'Hepatite A · esquema de 2 doses',when:'12 e 18 meses',sus:'PNI oferece 1 dose aos 15 meses',why:'A SBIm recomenda duas doses com intervalo de 6 meses.',price:'R$ 160,56 por dose',source:'Hermes Pardini'},
 {type:'Esquema antecipado SBIm',name:'Varicela · 2 doses antes dos 2 anos',when:'12 meses e 15–24 meses',sus:'PNI dá 1ª dose aos 15m e 2ª aos 4 anos',why:'A SBIm recomenda duas doses após 1 ano; para completar antes dos 2 anos, normalmente é necessária dose privada, respeitando intervalos.',price:'R$ 236,55 por dose',source:'Hermes Pardini'}
];

const PRIVATE_MOTHER_EXTRA=[
 {type:'Situação especial',name:'Hepatite A',when:'Se houver indicação/risco',sus:'Não é rotina da gestante no PNI',why:'SBIm: vacina inativada; pode ser considerada na gestação conforme risco e avaliação do obstetra.',price:'~R$ 192,85 por dose'},
 {type:'Situação especial',name:'Meningocócica ACWY',when:'Risco epidemiológico/comorbidade',sus:'Não é rotina da gestante no PNI',why:'SBIm recomenda considerar apenas em situações que justifiquem.',price:'R$ 380,95 por dose'},
 {type:'Situação especial',name:'Meningocócica B',when:'Alto risco/situação epidemiológica',sus:'Não é rotina da gestante no PNI',why:'Não é vacina de rotina para gestante saudável; avaliar individualmente.',price:'R$ 643,15 por dose'},
 {type:'Situação especial',name:'Pneumocócica conjugada',when:'Gestante de risco para doença pneumocócica',sus:'Não é rotina da gestante no PNI',why:'SBIm cita VPC20/VPC15/VPC13 para situações especiais, conforme avaliação médica.',price:'VPC20 ~R$ 474–527 por dose'}
];

const AGROS_CONTACTS={
 agros:{title:'Agros + Saúde · Viçosa',subtitle:'Equipe de Medicina de Família, enfermagem e multiprofissional',phone:'3121176847',phoneLabel:'(31) 2117-6847',whatsapp:'31984203403',whatsappLabel:'(31) 98420-3403',address:'Praça do Rosário, nº 3, 4º andar, Centro · Viçosa/MG'},
 dsa:{title:'Divisão de Saúde da UFV (DSA)',subtitle:'Atendimento aos beneficiários Agros mediante elegibilidade/carência',phone:'3136121850',phoneLabel:'(31) 3612-1850',whatsapp:'3136121850',whatsappLabel:'(31) 3612-1850',address:'Campus UFV · Viçosa/MG'}
};
const AGROS_SERVICES={
 prenatal:{title:'Curso de pré-natal · Nascer Saudável',text:'Encontros do Agros em Viçosa sobre gestação, parto, recém-nascido e aleitamento.',people:['Equipe do programa Nascer Saudável / Agros + Saúde'],contact:'agros'},
 postpartum:{title:'Visita após o nascimento',text:'O Agros oferece visita de enfermeira especializada nas cidades da área de abrangência.',people:['Enfermeira especializada do programa (nome não publicado pelo Agros)'],contact:'agros'},
 kit:{title:'Kit de cuidados do bebê',text:'Benefício para gestantes/puérperas beneficiárias; retirada ou entrega mediante agendamento.',people:['Agros · atendimento ao beneficiário'],contact:'agros'},
 obst:{title:'Ginecologia e obstetrícia · DSA/UFV',text:'O Agros informa que a DSA atende ginecologia e obstetrícia. A escala pública atual da DSA lista:',people:['Tauana Vaz Almeida · CRM 53896'],contact:'dsa'},
 ped:{title:'Pediatria e puericultura · DSA/UFV',text:'O Agros informa cobertura de pediatria na DSA, inclusive consulta inicial à gestante e puericultura.',people:['Denise Cristina Rodrigues · CRM 24576'],contact:'dsa'},
 familia:{title:'Medicina de Família · DSA/UFV',text:'A DSA também oferece acompanhamento com Medicina de Família e Comunidade.',people:['Wilmara Lopes Fialho · CRM 68620','Gisele Duarte de Oliveira · CRM 90140'],contact:'dsa'}
};

const STORE_KEY='ninho-bebe-v4';
const FEEDING_TARGETS={
 al1:{'Ainda não definido':4,'Aleitamento materno':2,'Misto':4,'Fórmula':6},
 al2:{'Ainda não definido':4,'Aleitamento materno':2,'Misto':4,'Fórmula':6},
 al9:{'Ainda não definido':4,'Aleitamento materno':2,'Misto':4,'Fórmula':6},
 al10:{'Ainda não definido':2,'Aleitamento materno':1,'Misto':2,'Fórmula':2},
 al11:{'Ainda não definido':1,'Aleitamento materno':0,'Misto':1,'Fórmula':1},
 al12:{'Ainda não definido':1,'Aleitamento materno':0,'Misto':1,'Fórmula':1}
};
function normalizeState(raw){
 const base=raw&&typeof raw==='object'?raw:{};
 const defaultIds=new Set(defaultItems.map(i=>i.id));
 const previousById=new Map((base.items||[]).map(i=>[i.id,i]));
 const migratedDefaults=defaultItems.map(d=>{const old=previousById.get(d.id);return old?{...d,have:Number(old.have||0),status:old.status||d.status,price:Number(old.price||0)}:{...d}});
 const customItems=(base.items||[]).filter(i=>!defaultIds.has(i.id));
 return {
   ...base,
   items:[...migratedDefaults,...customItems],
   watch:Array.isArray(base.watch)?base.watch:[],
   budget:Number(base.budget||0),
   showerGuests:Number(base.showerGuests||40),
   motherVax:base.motherVax||{},
   babyVax:base.babyVax||{},
   medicalRecords:Array.isArray(base.medicalRecords)?base.medicalRecords:[],
   generatedPrenatal:Boolean(base.generatedPrenatal),
   generatedBabyVisits:Boolean(base.generatedBabyVisits),
   feedingMode:base.feedingMode||'Ainda não definido'
 };
}
const priorState=JSON.parse(localStorage.getItem(STORE_KEY)||'null')||JSON.parse(localStorage.getItem('ninho-bebe-v3')||'null')||JSON.parse(localStorage.getItem('ninho-bebe-v2')||'null')||JSON.parse(localStorage.getItem('ninho-bebe-v1')||'null');
let state=normalizeState(priorState);
let cloudEnabled=false, syncTimer=null, syncPin='', syncBusy=false, authRole='anonymous';
function canEdit(){return authRole==='editor'}
function guardEdit(){if(canEdit())return true;toast('Modo visitante: somente visualização');return false}
function setLoginError(msg=''){const el=$('#loginError');if(!el)return;el.textContent=msg;el.classList.toggle('show',Boolean(msg))}
function unlockApp(){document.body.classList.remove('auth-locked');$('#authGate')?.classList.add('hidden');applyAccessModeUI()}
function lockApp(){document.body.classList.add('auth-locked');$('#authGate')?.classList.remove('hidden')}
window.switchAccess=()=>{syncPin='';authRole='anonymous';sessionStorage.removeItem('ninho-pin');sessionStorage.removeItem('ninho-role');lockApp();setLoginError('');const p=$('#loginPin');if(p){p.value='';setTimeout(()=>p.focus(),80)}};
function applyAccessModeUI(){
  document.body.classList.toggle('readonly',authRole==='viewer');
  const badge=$('#accessBadge');
  if(badge){
    badge.textContent=canEdit()?'Família · edição':'Visitante · visualização';
    badge.className='access-badge '+(canEdit()?'edit':'view');
    badge.title='Clique para trocar de usuário';
    badge.onclick=switchAccess;
  }
  if(authRole==='viewer'){
    const mutating=['addItemModal','q(','statusChange','setFeedingMode','addWatchModal','setBudget','setPrice','setGuests','toggleVax','editVax','generatePrenatal','generateBabyVisits','medicalModal','deleteMedical'];
    document.querySelectorAll('button[onclick],input[onchange],select[onchange],textarea[onchange]').forEach(el=>{
      const code=(el.getAttribute('onclick')||'')+(el.getAttribute('onchange')||'');
      if(mutating.some(x=>code.includes(x))) el.disabled=true;
    });
  }
}
window.loginNinho=async event=>{
  event?.preventDefault?.();
  const user=($('#loginUser')?.value||'').trim().toLowerCase();
  const pin=$('#loginPin')?.value||'';
  const btn=$('#loginButton');
  if(!pin){setLoginError('Digite o PIN para entrar.');return}
  authRole=user==='visitante'?'viewer':'editor';
  syncPin=pin;
  setLoginError('');
  if(btn){btn.disabled=true;btn.textContent='Entrando...'}
  try{
    const cfg=await fetch('/api/config',{cache:'no-store'}).then(r=>r.ok?r.json():null);
    if(!cfg?.database){setLoginError('O banco do Ninho não está disponível no momento.');return}
    cloudEnabled=true;
    const res=await fetch('/api/state',{headers:{...authHeaders()},cache:'no-store'});
    if(!res.ok){
      authRole='anonymous';syncPin='';
      setLoginError(user==='visitante'?'Usuário/PIN de visitante inválido. Confira NINHO_VISITOR_PIN no Render.':'Usuário/PIN da família inválido.');
      return;
    }
    const data=await res.json();
    authRole=data.role||authRole;
    if(data.state){
      state=normalizeState(data.state);
      localStorage.setItem(STORE_KEY,JSON.stringify(state));
    }
    sessionStorage.setItem('ninho-pin',syncPin);
    sessionStorage.setItem('ninho-role',authRole);
    renderAll();
    unlockApp();
    toast(canEdit()?'Bem-vindos ao Ninho':'Ninho aberto em modo visitante');
  }catch(e){
    authRole='anonymous';syncPin='';
    setLoginError('Não foi possível entrar. Verifique a conexão e tente novamente.');
  }finally{
    if(btn){btn.disabled=false;btn.textContent='Entrar no Ninho'}
  }
};
function targetFor(i){return FEEDING_TARGETS[i.id]?.[state.feedingMode] ?? Number(i.recommended||0)}
function authHeaders(){if(!syncPin)return {};return canEdit()?{'x-ninho-pin':syncPin}:{'x-ninho-viewer-pin':syncPin}}
async function apiState(method='GET',body){
 const opts={method,headers:{...authHeaders()}};
 if(body!==undefined){opts.headers['Content-Type']='application/json';opts.body=JSON.stringify(body)}
 return fetch('/api/state',opts);
}
function queueCloudSave(delay=500){
 if(!cloudEnabled||!canEdit())return;
 clearTimeout(syncTimer);
 syncTimer=setTimeout(async()=>{
  if(syncBusy)return; syncBusy=true;
  try{const res=await apiState('PUT',state);if(res&&!res.ok)console.warn('Falha ao sincronizar',res.status)}catch(e){console.warn('sync save',e)}finally{syncBusy=false}
 },delay);
}
function save(){if(!canEdit()){toast('Modo visitante: somente visualização');renderAll();return}localStorage.setItem(STORE_KEY,JSON.stringify(state));renderAll();queueCloudSave();}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function stats(){const relevant=state.items.filter(i=>targetFor(i)>0);const total=relevant.reduce((s,i)=>s+targetFor(i),0);const have=relevant.reduce((s,i)=>s+Math.min(i.have,targetFor(i)),0);const spent=state.items.reduce((s,i)=>s+(i.status==='Comprado'?Number(i.price||0)*Number(i.have||0):0),0);const gifts=state.items.reduce((s,i)=>s+(i.status==='Ganhou'?i.have:0),0);return{total,have,pct:total?Math.round(have/total*100):0,spent,gifts};}
function phaseLabel(){return weeks<14?'1º trimestre':weeks<28?'2º trimestre':'3º trimestre'}
function metric(ic,val,label){return `<div class="card metric"><div class="metric-top"><div class="metric-icon">${icons[ic]}</div></div><strong>${val}</strong><span>${label}</span></div>`}

function renderDashboard(){const st=stats();$('#view-dashboard').innerHTML=`\n ${!canEdit()?'<div class="notice readonly-note"><b>Modo visitante.</b> Você pode navegar e visualizar os dados, mas não pode cadastrar ou alterar informações.</div>':''}
 <div class="hero">
  <div class="card preg-card"><div class="baby-decor baby-decor-1">${icons.baby}</div><div class="baby-decor baby-decor-2">${icons.bottle}</div><div class="spark s1">✦</div><div class="spark s2">·</div><div class="preg-content"><div class="week-pill">${icons.heart} ${phaseLabel()}</div><div class="week-number">${weeks}<small> semanas${days?` + ${days}d`:''}</small></div><p><b>${PROFILE.babyNames}</b> está a caminho. ${PROFILE.mother} está com ${weeks} semanas${days?` e ${days} dias`:''}; o enxoval segue neutro, por fases e sem excesso.</p><div class="progress"><span style="width:${gestPct}%"></span></div><div class="progress-label"><span>começo</span><span>${gestPct}% da gestação</span><span>parto · abr/2027</span></div></div></div>
  <div class="card quick"><div><h3>Próximos passos</h3><div class="quick-list"><div class="quick-item"><i class="quick-dot"></i><div><b>Pré-natal em dia</b><span>Registre consultas, exames e anexos na guia Médico.</span></div></div><div class="quick-item"><i class="quick-dot"></i><div><b>Vacinas separadas</b><span>Agora há uma guia da mãe e outra do bebê.</span></div></div><div class="quick-item"><i class="quick-dot"></i><div><b>Enxoval por fase</b><span>O inventário agora acompanha do nascimento aos 24 meses.</span></div></div></div></div><button class="btn soft" onclick="go('medico')">Abrir acompanhamento</button></div>
 </div>
 <div class="metrics">${metric('bag',`${st.pct}%`,'inventário coberto')}${metric('gift',st.gifts,'itens recebidos')}${metric('wallet',money(st.spent),'já gasto')}${metric('calendar',daysToDue,'dias até o parto')}</div>
 <div class="grid-2">
  <div class="card panel"><div class="section-head"><div><h2>Comprar sem excesso</h2><p>O Ninho segura itens que podem esperar.</p></div><button class="btn" onclick="go('enxoval')">Abrir enxoval</button></div>${renderSmartList()}</div>
  <div class="card panel"><div class="section-head"><div><h2>Saúde em sequência</h2><p>O que vem primeiro.</p></div></div><div class="timeline"><div class="timeline-item"><div class="timebadge">${weeks}s</div><div><b>Gestação hoje</b><span>Exatamente ${weeks} semanas${days?` e ${days} dias`:''} pelo cálculo da transferência D5.</span></div><span class="tag green">agora</span></div><div class="timeline-item"><div class="timebadge">20+</div><div><b>dTpa</b><span>1 dose em cada gestação.</span></div><span class="tag">mãe</span></div><div class="timeline-item"><div class="timebadge">28+</div><div><b>VSR</b><span>1 dose em cada gestação.</span></div><span class="tag">mãe</span></div><div class="timeline-item"><div class="timebadge">RN</div><div><b>BCG + hepatite B</b><span>Primeiras vacinas do bebê após o nascimento.</span></div><span class="tag">bebê</span></div></div></div>
 </div>`}
function renderSmartList(){const missing=state.items.filter(i=>i.essential&&targetFor(i)>i.have&&i.status!=='Evitar'&&['Nascimento','0–3m'].includes(i.phase)).slice(0,5);return missing.length?`<div class="timeline">${missing.map(i=>`<div class="timeline-item"><div class="timebadge">${i.size.split('/')[0]}</div><div><b>${i.name}</b><span>Faltam ${targetFor(i)-i.have} · ${i.when}</span></div><span class="tag ${i.status==='Pesquisar'?'warn':'green'}">${i.status}</span></div>`).join('')}</div>`:'<div class="empty">Essenciais iniciais cobertos 🎉</div>'}

let currentCat='Todos',currentPhase='Todos',currentSize='Todos',currentWhen='Todos';
function getSizeFilters(){
  const preferred=['Todos','RN','P','0–3m','M','3–6m','G','6–9m','GG','9–12m','12–18m','18–24m','Único'];
  const present=new Set(['Todos']);
  state.items.forEach(i=>extractSizeTags(i).forEach(t=>present.add(t)));
  return preferred.filter(p=>present.has(p));
}
function extractSizeTags(item){
  const text=`${item.size||''} ${item.phase||''}`.replace(/-/g,'–');
  const out=[];
  if(/\bRN\b/i.test(text)) out.push('RN');
  if(/\bGG\b/i.test(text)) out.push('GG');
  if(/(^|[\s/])P([\s/]|$)/i.test(text)) out.push('P');
  if(/(^|[\s/])M([\s/]|$)/i.test(text)) out.push('M');
  if(/(^|[\s/])G([\s/]|$)/i.test(text)) out.push('G');
  ['0–3m','3–6m','6–9m','9–12m','12–18m','18–24m','Único'].forEach(tag=>{ if(text.includes(tag)) out.push(tag); });
  return [...new Set(out)];
}
function renderEnxoval(){
 const cats=['Todos',...new Set(state.items.map(i=>i.category))];
 const phases=['Todos',...new Set(state.items.map(i=>i.phase).filter(Boolean))];
 const sizes=getSizeFilters();
 const whens=['Todos',...new Set(state.items.map(i=>i.when).filter(Boolean))];
 const rows=state.items.filter(i=>(currentCat==='Todos'||i.category===currentCat)&&(currentPhase==='Todos'||i.phase===currentPhase)&&(currentSize==='Todos'||extractSizeTags(i).includes(currentSize))&&(currentWhen==='Todos'||i.when===currentWhen));
 $('#view-enxoval').innerHTML=`
 <div class="card panel"><div class="section-head"><div><h2>Inventário até 2 anos</h2><p>Quantidades são sugestões práticas e conservadoras — não uma regra oficial.</p></div><button class="btn primary" onclick="addItemModal()">${icons.plus} Adicionar item</button></div>
 <div class="notice inventory-note"><b>Alvo = quantidade de rotina para a fase, não mínimo.</b> Vocês não precisam comprar tudo agora; itens futuros continuam marcados como “Esperar”. Para fraldas, o alvo é por pacotes médios e deve ser ajustado ao peso e à marca.</div>
 <div class="filter-grid four">
   <div class="field"><label>Categoria</label><select onchange="setCat(this.value)">${cats.map(c=>`<option value="${c}" ${c===currentCat?'selected':''}>${c}</option>`).join('')}</select></div>
   <div class="field"><label>Fase</label><select onchange="setPhase(this.value)">${phases.map(c=>`<option value="${c}" ${c===currentPhase?'selected':''}>${c}</option>`).join('')}</select></div>
   <div class="field"><label>Tamanho / faixa</label><select onchange="setSizeFilter(this.value)">${sizes.map(c=>`<option value="${c}" ${c===currentSize?'selected':''}>${c}</option>`).join('')}</select></div>
   <div class="field"><label>Quando</label><select onchange="setWhenFilter(this.value)">${whens.map(c=>`<option value="${c}" ${c===currentWhen?'selected':''}>${c}</option>`).join('')}</select></div>
   <div class="field"><label>Alimentação planejada</label><select onchange="setFeedingMode(this.value)">${['Ainda não definido','Aleitamento materno','Misto','Fórmula'].map(c=>`<option value="${c}" ${c===state.feedingMode?'selected':''}>${c}</option>`).join('')}</select></div>
 </div>
 <div class="table-wrap"><table class="table"><thead><tr><th>Item</th><th>Fase</th><th>Tamanho</th><th>Alvo</th><th>Tem</th><th>Status</th><th>Quando</th><th>Nota</th></tr></thead><tbody>${rows.map(itemRow).join('')}</tbody></table></div></div>`
}
function itemRow(i){return `<tr><td><b>${i.name}</b><br><span class="muted-mini">${i.category}${i.essential?' · essencial':''}</span></td><td><span class="tag">${i.phase}</span></td><td>${i.size}</td><td><b>${targetFor(i)}</b></td><td><div class="qty"><button onclick="q('${i.id}',-1)">−</button><b>${i.have}</b><button onclick="q('${i.id}',1)">+</button></div></td><td><select class="status-select" onchange="statusChange('${i.id}',this.value)">${['Planejado','Pesquisar','Comprado','Ganhou','Esperar','Evitar'].map(s=>`<option ${i.status===s?'selected':''}>${s}</option>`).join('')}</select></td><td>${i.when}</td><td class="note-cell">${i.note}</td></tr>`}
window.setCat=c=>{currentCat=c;renderEnxoval()};window.setPhase=c=>{currentPhase=c;renderEnxoval()};window.setSizeFilter=c=>{currentSize=c;renderEnxoval()};window.setWhenFilter=c=>{currentWhen=c;renderEnxoval()};window.setFeedingMode=c=>{state.feedingMode=c;save();};window.q=(id,d)=>{const i=state.items.find(x=>x.id===id);i.have=Math.max(0,(i.have||0)+d);if(i.have>0&&i.status==='Planejado')i.status='Ganhou';save()};window.statusChange=(id,s)=>{state.items.find(x=>x.id===id).status=s;save()};
window.addItemModal=()=>openModal(`<h3>Novo item</h3><div class="form-grid"><div class="field"><label>Nome</label><input id="niName"></div><div class="field"><label>Categoria</label><input id="niCat" placeholder="Ex.: Roupas"></div><div class="field"><label>Fase</label><input id="niPhase" placeholder="Ex.: 12–18m"></div><div class="field"><label>Tamanho</label><input id="niSize"></div><div class="field"><label>Quantidade-alvo</label><input id="niQty" type="number" min="0" value="1"></div><div class="field"><label>Quando comprar</label><input id="niWhen"></div></div><div class="field" style="margin-top:12px"><label>Observação</label><textarea id="niNote"></textarea></div><div class="modal-foot"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="saveNewItem()">Adicionar</button></div>`);
window.saveNewItem=()=>{if(!$('#niName').value.trim())return;state.items.push(I('u'+Date.now(),$('#niName').value.trim(),$('#niCat').value||'Outros',$('#niSize').value||'Único',+$('#niQty').value||0,$('#niWhen').value||'Quando necessário',false,$('#niNote').value||'', $('#niPhase').value||'Nascimento'));closeModal();save()};

function renderPromos(){const active=state.watch.filter(w=>Number(w.current||0)<=Number(w.target||0)&&Number(w.current||0)>0);$('#view-promocoes').innerHTML=`<div class="grid-2"><div class="card panel"><div class="section-head"><div><h2>Produtos monitorados</h2><p>Amazon, Magalu, Shopee, Shein e outros links.</p></div><button class="btn primary" onclick="addWatchModal()">${icons.plus} Monitorar</button></div>${state.watch.length?`<div class="grid-2">${state.watch.map(w=>`<div class="price-card"><div class="price-head"><div><h4>${esc(w.name)}</h4><div class="store">${esc(w.store||'Loja')}</div></div>${+w.current>0&&+w.current<=+w.target?'<span class="alert-ok">atingiu o alvo</span>':''}</div><div class="price-values"><div><small>Atual</small><b>${money(w.current)}</b></div><div><small>Alvo</small><b>${money(w.target)}</b></div></div>${w.url?`<a class="btn soft link-btn" target="_blank" href="${esc(w.url)}">Abrir produto</a>`:''}</div>`).join('')}</div>`:'<div class="empty">Nenhum produto monitorado ainda.</div>'}</div><div class="card panel"><div class="section-head"><div><h2>Alertas</h2><p>Preço atual ≤ preço-alvo.</p></div></div>${active.length?active.map(w=>`<div class="vaccine"><div class="vaccine-check">${icons.bell}</div><div><b>${esc(w.name)}</b><p>${money(w.current)} atingiu o alvo de ${money(w.target)}.</p></div></div>`).join(''):'<div class="empty">Nenhum preço atingiu o alvo.</div>'}<div class="notice" style="margin-top:14px">Para varrer lojas automaticamente 24h por dia, o projeto precisa de um backend/API de monitoramento. A interface e a regra de preço-alvo já estão prontas.</div></div></div>`}
window.addWatchModal=()=>openModal(`<h3>Monitorar preço</h3><div class="form-grid"><div class="field"><label>Produto</label><input id="wName"></div><div class="field"><label>Loja</label><input id="wStore" placeholder="Amazon, Shopee..."></div><div class="field"><label>Preço atual</label><input id="wCurrent" type="number" step="0.01"></div><div class="field"><label>Preço-alvo</label><input id="wTarget" type="number" step="0.01"></div></div><div class="field" style="margin-top:12px"><label>Link</label><input id="wUrl"></div><div class="modal-foot"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="saveWatch()">Salvar</button></div>`);
window.saveWatch=()=>{if(!$('#wName').value.trim())return;state.watch.push({id:'w'+Date.now(),name:$('#wName').value.trim(),store:$('#wStore').value,current:+$('#wCurrent').value||0,target:+$('#wTarget').value||0,url:$('#wUrl').value});closeModal();save()};

function renderBudget(){const st=stats();const budget=Number(state.budget||0);const pct=budget?clamp(Math.round(st.spent/budget*100),0,100):0;const projected=state.items.filter(i=>targetFor(i)>0&&i.price>0).reduce((s,i)=>s+Math.max(0,targetFor(i)-i.have)*i.price,0);$('#view-orcamento').innerHTML=`<div class="grid-2"><div class="card panel"><div class="section-head"><div><h2>Teto do enxoval</h2><p>Planeje sem transformar toda a lista em compra imediata.</p></div><button class="btn" onclick="setBudget()">Definir teto</button></div><div class="budget-big">${money(budget)}</div><div class="budget-break"><div class="mini"><small>Gasto</small><b>${money(st.spent)}</b></div><div class="mini"><small>Restante</small><b>${money(Math.max(0,budget-st.spent))}</b></div><div class="mini"><small>Impacto estimado do que falta</small><b>${money(projected)}</b></div></div></div><div class="card panel"><div class="donut-wrap"><div class="donut" style="--p:${pct}%"></div><div class="donut-label"><div><b>${pct}%</b><small>do teto usado</small></div></div></div></div></div><div class="card panel" style="margin-top:16px"><div class="section-head"><div><h2>Preço por item</h2><p>Use quando já tiver um valor real de compra.</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Item</th><th>Fase</th><th>Falta</th><th>Preço unitário</th><th>Impacto</th></tr></thead><tbody>${state.items.filter(i=>targetFor(i)>0).map(i=>`<tr><td><b>${i.name}</b> <span class="muted-mini">${i.size}</span></td><td>${i.phase}</td><td>${Math.max(0,targetFor(i)-i.have)}</td><td><input class="price-input" type="number" step="0.01" value="${i.price||''}" onchange="setPrice('${i.id}',this.value)"></td><td>${money(Math.max(0,targetFor(i)-i.have)*(i.price||0))}</td></tr>`).join('')}</tbody></table></div></div>`}
window.setBudget=()=>openModal(`<h3>Definir teto</h3><div class="field"><label>Valor total planejado (R$)</label><input id="bVal" type="number" step="100" value="${state.budget||''}"></div><div class="modal-foot"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="saveBudget()">Salvar</button></div>`);window.saveBudget=()=>{state.budget=+$('#bVal').value;closeModal();save()};window.setPrice=(id,v)=>{state.items.find(i=>i.id===id).price=+v;localStorage.setItem(STORE_KEY,JSON.stringify(state));renderDashboard();renderBudget()};

function diaperPlan(){const n=Math.max(0,+state.showerGuests||0);const vals={RN:0,P:0,M:0,G:0,XG:0};let used=0;SHOWER_DIAPER_REF.forEach((r,idx)=>{if(idx===SHOWER_DIAPER_REF.length-1)vals[r.size]=Math.max(0,n-used);else{vals[r.size]=Math.round(n*r.share);used+=vals[r.size]}});return vals}
function renderTea(){const p=diaperPlan();$('#view-cha').innerHTML=`<div class="grid-2"><div class="card panel"><div class="section-head"><div><h2>Planejador do chá de fraldas</h2><p>O chá foca no que vocês vão usar primeiro. XG fica para comprar futuramente, quando já souberem peso, corpo e marca que funciona melhor.</p></div></div><div class="field"><label>Número estimado de convidados/presentes</label><input type="number" min="0" value="${state.showerGuests}" onchange="setGuests(this.value)"></div><div class="diaper-plan" style="margin-top:16px">${SHOWER_DIAPER_REF.map(r=>`<div class="diaper"><span>Tamanho</span><b>${r.size}</b><span>${p[r.size]} pacotes/presentes</span><small>${r.note}</small></div>`).join('')}</div><div class="notice" style="margin-top:14px"><b>XG: 0 no chá.</b> A ideia é não guardar uma fralda por mais de um ano enquanto vocês ainda precisam comprar P, M ou G. RN também fica baixo para reduzir o risco de sobrar.</div></div><div class="card panel"><div class="section-head"><div><h2>Consumo de referência</h2><p>Esta parte continua independente do chá: P 8/dia · M 8/dia · G 7/dia · XG 5/dia.</p></div></div><div class="diaper-reference">${DIAPER_REF.map(r=>`<div class="diaper-ref-row"><b>${r.size}</b><div><span>${r.age}</span><small>${r.monthly} · ${r.note}</small></div></div>`).join('')}</div><div class="notice" style="margin-top:14px">O consumo serve para o planejamento do bebê. A distribuição do chá é outra decisão: prioriza tamanhos próximos para evitar estoque parado.</div><div class="contact-actions" style="margin-top:10px"><a class="btn soft" target="_blank" href="https://www.huggies.com.br/artigos/cha-de-bebe/como-organizar/lista-de-cha-de-bebe-o-que-pedir">Huggies · chá</a><a class="btn soft" target="_blank" href="https://www.pampers.com.br/cha-de-fraldas/temas-e-decoracao/artigo/como-organizar-a-lista-de-fraldas-para-o-cha-de-fraldas">Pampers · chá</a></div></div></div>`}
window.setGuests=v=>{state.showerGuests=+v||0;save()};

function renderPreg(){$('#view-gestacao').innerHTML=`<div class="grid-2"><div class="card panel"><div class="section-head"><div><h2>Resumo da gestação</h2><p>Datação configurada pela transferência de embrião D5.</p></div></div><div class="profile-list"><div class="profile-row"><span>Gestante</span><b>${PROFILE.mother}</b></div><div class="profile-row"><span>Idade gestacional hoje</span><b>${weeks} semanas${days?` e ${days} dias`:''}</b></div><div class="profile-row"><span>Transferência FIV</span><b>31/07/2026 · D5</b></div><div class="profile-row"><span>Previsão do parto</span><b>18/04/2027</b></div><div class="profile-row"><span>Bebê</span><b>${PROFILE.babyNames}</b></div><div class="profile-row"><span>Plano</span><b>Agros · Viçosa/MG</b></div></div></div><div class="card panel baby-note"><div class="baby-note-icon">${icons.baby}</div><h2>8 semanas hoje</h2><p>Em 06/09/2026, a transferência D5 de 31/07/2026 corresponde exatamente a 8 semanas de idade gestacional. O app calcula isso automaticamente pela data.</p></div></div><div class="grid-2" style="margin-top:16px"><div class="card panel"><div class="section-head"><div><h2>Rotina do pré-natal</h2><p>Referência do Ministério da Saúde para risco habitual.</p></div><button class="btn soft" onclick="generatePrenatal()">Gerar agenda</button></div><div class="timeline"><div class="timeline-item"><div class="timebadge">≤12</div><div><b>Início do pré-natal</b><span>Preferencialmente até a 12ª semana.</span></div><span class="tag green">agora</span></div><div class="timeline-item"><div class="timebadge">≤28</div><div><b>Mensal</b><span>Consultas mensais até a 28ª semana.</span></div><span class="tag">rotina</span></div><div class="timeline-item"><div class="timebadge">28–36</div><div><b>Quinzenal</b><span>Consultas a cada 2 semanas.</span></div><span class="tag">rotina</span></div><div class="timeline-item"><div class="timebadge">36+</div><div><b>Semanal</b><span>Consultas semanais até o parto.</span></div><span class="tag">rotina</span></div></div></div><div class="card panel"><div class="section-head"><div><h2>Agros · Nascer Saudável</h2><p>Toque em uma opção para ver atendimento e contato.</p></div></div>${agrosService('prenatal','Curso de pré-natal em Viçosa','Encontros sobre gestação, parto, recém-nascido e aleitamento.')}${agrosService('postpartum','Visita após o nascimento','Visita de enfermeira especializada após o nascimento.')}${agrosService('kit','Kit de cuidados do bebê','Benefício para beneficiárias, mediante agendamento.')}${agrosService('obst','Ginecologia e obstetrícia · DSA/UFV','Veja profissional listado e telefones de agendamento.')}${agrosService('ped','Pediatria e puericultura · DSA/UFV','Consulta inicial à gestante e acompanhamento do bebê.')}${agrosService('familia','Medicina de Família · DSA/UFV','Profissionais listados na escala pública da DSA.')}</div></div>`}
function agrosService(id,t,b){return `<button class="agros-service" onclick="openAgrosService('${id}')"><div class="vaccine-check">${icons.shield}</div><div><b>${t}</b><p>${b}</p></div><span class="agros-arrow">›</span></button>`}
window.openAgrosService=id=>{const s=AGROS_SERVICES[id],c=AGROS_CONTACTS[s.contact];if(!s||!c)return;openModal(`<h3>${s.title}</h3><p class="body-copy">${s.text}</p><div class="provider-list">${s.people.map(p=>`<div class="provider-item"><b>${p}</b></div>`).join('')}</div><div class="contact-card"><b>${c.title}</b><span>${c.subtitle}</span><p>${c.address}</p><div class="contact-actions"><a class="btn soft" href="tel:+55${c.phone}">Ligar · ${c.phoneLabel}</a><a class="btn soft" target="_blank" href="https://wa.me/55${c.whatsapp}">WhatsApp · ${c.whatsappLabel}</a></div></div><div class="notice" style="margin-top:12px">A rede e as escalas podem mudar. Para prestadores fora da DSA/Agros + Saúde, confirme pelo buscador oficial da rede credenciada do seu plano.</div><div class="modal-foot"><a class="btn" target="_blank" href="https://autoatendimento.agros.org.br/Autoatendimento/consultaredecredenciada.aspx">Rede Agros</a><button class="btn primary" onclick="closeModal()">Fechar</button></div>`)};

function renderMotherVax(){const done=motherVaccines.filter(v=>state.motherVax[v.id]?.done).length;$('#view-vacmae').innerHTML=`<div class="grid-2"><div class="card panel"><div class="section-head"><div><h2>Vacinas de rotina da Isabela · SUS</h2><p>${done} de ${motherVaccines.length} registros marcados.</p></div></div><div class="vax-progress"><span style="width:${Math.round(done/motherVaccines.length*100)}%"></span></div><div class="notice" style="margin-top:14px"><b>Conferido no PNI 2026:</b> hepatite B e dT conforme histórico, influenza, covid-19, dTpa a partir de 20 semanas e VSR a partir de 28 semanas estão no SUS. Febre amarela é excepcional na gestação, após avaliação de risco-benefício.</div></div><div class="card panel baby-note"><div class="baby-note-icon">${icons.syringe}</div><h2>O que é realmente pago?</h2><p>Para uma gestante saudável, as vacinas de rotina da gestação estão no SUS. As vacinas pagas aparecem abaixo apenas em <b>situações especiais</b> — não são para Isabela tomar por conta própria.</p></div></div><div class="card panel" style="margin-top:16px"><div class="vax-list">${motherVaccines.map(v=>vaxRow(v,'motherVax')).join('')}</div><div class="source"><b>Fonte oficial</b><p>Calendário Nacional de Vacinação da Gestante 2026 — Ministério da Saúde.</p><a target="_blank" href="https://www.gov.br/saude/pt-br/vacinacao/arquivos/calendario-nacional-de-vacinacao-gestante/view">Abrir PNI 2026</a></div></div><div class="card panel" style="margin-top:16px"><div class="section-head"><div><h2>Gestante · vacinas de situações especiais</h2><p>SBIm 2026/2027 · não são rotina para toda gestante.</p></div></div><div class="private-vax-grid">${PRIVATE_MOTHER_EXTRA.map(privateVaxCard).join('')}</div><div class="notice">Antes de qualquer uma destas, confirmar com a obstetra. “Disponível no privado” não significa “indicada para Isabela”.</div></div>`}
function renderBabyVax(){const done=babyVaccines.filter(v=>state.babyVax[v.id]?.done).length;const grouped=[...new Set(babyVaccines.map(v=>v.age))];$('#view-vacbebe').innerHTML=`<div class="grid-2"><div class="card panel"><div class="section-head"><div><h2>Calendário do bebê · SUS/PNI</h2><p>Do nascimento até 24 meses.</p></div></div><div class="vax-progress"><span style="width:${Math.round(done/babyVaccines.length*100)}%"></span></div><div class="notice" style="margin-top:14px"><b>Importante:</b> esta lista é o calendário público, portanto as vacinas abaixo são gratuitas no SUS conforme idade/indicação. Corrigi a pneumocócica para a transição VPC20/VPC10 de 2026 e incluí a 2ª dose de influenza na primovacinação.</div></div><div class="card panel"><div class="baby-card-illustration">${icons.shield}<span>SUS + privado<br><b>sem misturar os dois</b></span></div><p class="body-copy">As vacinas pagas que podem ampliar ou antecipar proteção estão em uma seção separada logo abaixo. O bebê nasce em 2027, então o PNI deverá ser conferido novamente perto do nascimento.</p></div></div><div class="vax-groups">${grouped.map(age=>`<div class="card panel"><div class="section-head"><div><h2>${age}</h2><p>${babyVaccines.filter(v=>v.age===age).length} item(ns) do PNI</p></div></div>${babyVaccines.filter(v=>v.age===age).map(v=>vaxRow(v,'babyVax')).join('')}</div>`).join('')}</div><div class="card panel" style="margin-top:16px"><div class="section-head"><div><h2>Vacinas privadas/adicionais recomendadas pela SBIm</h2><p>Não são “obrigatórias do SUS”. Algumas ampliam cobertura; outras são versões alternativas ou antecipam o esquema.</p></div></div><div class="private-vax-grid">${PRIVATE_VAX_EXTRA.map(privateVaxCard).join('')}</div><div class="notice"><b>Prioridade se o orçamento for limitado:</b> converse com o pediatra sobre quais diferenças realmente trazem benefício para o bebê. Meningocócica B é uma proteção adicional que não está na rotina do PNI; já a hexavalente e o rotavírus pentavalente são principalmente alternativas ao esquema público, não “vacinas faltantes”.</div><div class="source"><b>Fontes</b><p>PNI 2026 (Ministério da Saúde) + Calendário SBIm Criança 2026/2027. Valores são referências atuais de serviços privados e podem mudar.</p><a target="_blank" href="https://www.gov.br/saude/pt-br/vacinacao/arquivos/calendario-nacional-de-vacinacao-crianca/view">PNI 2026</a> · <a target="_blank" href="https://sbim.org.br/calendarios-de-vacinacao">SBIm</a></div></div>`}
function privateVaxCard(v){return `<div class="private-vax-card"><span class="private-type">${v.type}</span><b>${v.name}</b><span>${v.when}</span><small><b>SUS:</b> ${v.sus}</small><strong>${v.price}</strong><p>${v.why}</p>${v.source?`<em>Preço ref.: ${v.source}</em>`:''}</div>`}
function vaxRow(v,key){const r=state[key][v.id]||{},info=VACCINE_PRIVATE_INFO[v.id]||{sus:'Consultar',agros:'Confirmar'};return `<div class="vax-row ${r.done?'done':''}"><button class="vax-toggle" onclick="toggleVax('${key}','${v.id}')">${r.done?'✓':''}</button><div class="vax-main"><b>${v.name}</b><span>${v.when||v.age} · ${v.dose}</span>${v.note?`<small>${v.note}</small>`:''}<div class="coverage-row"><span class="coverage-pill sus">SUS · ${info.sus}</span><span class="coverage-pill agros">Agros · ${info.agros}</span></div>${r.date||r.place||r.note?`<div class="vax-meta">${r.date?`<span>📅 ${fmtDate(r.date)}</span>`:''}${r.place?`<span>📍 ${esc(r.place)}</span>`:''}${r.note?`<span>📝 ${esc(r.note)}</span>`:''}</div>`:''}</div><button class="btn tiny" onclick="editVax('${key}','${v.id}')">Registrar</button></div>`}
window.toggleVax=(key,id)=>{state[key][id]||={};state[key][id].done=!state[key][id].done;if(state[key][id].done&&!state[key][id].date)state[key][id].date=iso(today);save()};
window.editVax=(key,id)=>{const v=(key==='motherVax'?motherVaccines:babyVaccines).find(x=>x.id===id),r=state[key][id]||{};openModal(`<h3>${v.name}</h3><div class="form-grid"><div class="field"><label>Data aplicada</label><input id="vxDate" type="date" value="${r.date||''}"></div><div class="field"><label>Local</label><input id="vxPlace" value="${esc(r.place||'')}"></div></div><div class="field" style="margin-top:12px"><label>Observação</label><textarea id="vxNote">${esc(r.note||'')}</textarea></div><div class="modal-foot"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="saveVax('${key}','${id}')">Salvar</button></div>`)};
window.saveVax=(key,id)=>{state[key][id]={done:true,date:$('#vxDate').value,place:$('#vxPlace').value,note:$('#vxNote').value};closeModal();save()};

function defaultBabyVisitDates(){const b=dueDate;return[['Primeira semana',addDays(b,7)],['1 mês',addMonths(b,1)],['2 meses',addMonths(b,2)],['4 meses',addMonths(b,4)],['6 meses',addMonths(b,6)],['9 meses',addMonths(b,9)],['12 meses',addMonths(b,12)],['18 meses',addMonths(b,18)],['24 meses',addMonths(b,24)]]}
window.generatePrenatal=()=>{if(state.generatedPrenatal){toast('Agenda pré-natal já foi gerada');go('medico');return}let cursor=new Date(today);let w=weeks;let n=0;while(cursor<dueDate&&n<30){const step=w<28?28:w<36?14:7;cursor=addDays(cursor,step);if(cursor>dueDate)break;w=Math.floor(gestDaysAt(cursor)/7);state.medicalRecords.push({id:'pr'+Date.now()+n,subject:'Isabela',date:iso(cursor),type:'Pré-natal programado',professional:'',location:'',notes:`Consulta programada pela recorrência de referência (${w<28?'mensal':w<36?'quinzenal':'semanal'}).`,status:'Programado',attachment:null,recurrence:'automática'});n++}state.generatedPrenatal=true;save();go('medico');toast('Agenda pré-natal gerada')};
window.generateBabyVisits=()=>{if(state.generatedBabyVisits){toast('Agenda do bebê já foi gerada');go('medico');return}defaultBabyVisitDates().forEach(([label,d],n)=>state.medicalRecords.push({id:'bb'+Date.now()+n,subject:'Bebê',date:iso(d),type:`Puericultura · ${label}`,professional:'',location:'',notes:'Consulta de rotina conforme acompanhamento recomendado pelo Ministério da Saúde.',status:'Programado',attachment:null,recurrence:'calendário infantil'}));state.generatedBabyVisits=true;save();go('medico');toast('Agenda do bebê gerada')};

function renderMedical(){const rec=[...state.medicalRecords].sort((a,b)=>String(a.date).localeCompare(String(b.date)));$('#view-medico').innerHTML=`<div class="grid-3"><div class="card panel"><div class="section-head"><div><h2>Novo registro</h2><p>Consulta, ultrassom, exame ou orientação.</p></div></div><button class="btn primary full" onclick="medicalModal()">${icons.plus} Adicionar acompanhamento</button></div><div class="card panel"><div class="section-head"><div><h2>Pré-natal recorrente</h2><p>Mensal → quinzenal → semanal.</p></div></div><button class="btn soft full" onclick="generatePrenatal()">Gerar agenda da Isabela</button></div><div class="card panel"><div class="section-head"><div><h2>Puericultura até 2 anos</h2><p>1ª semana, 1, 2, 4, 6, 9, 12, 18 e 24 meses.</p></div></div><button class="btn soft full" onclick="generateBabyVisits()">Gerar agenda do bebê</button></div></div><div class="card panel" style="margin-top:16px"><div class="section-head"><div><h2>Linha do tempo médica</h2><p>Anexe imagens e escreva o que o médico explicou. O Agente Ninho traduz termos para linguagem simples.</p></div></div>${rec.length?`<div class="medical-timeline">${rec.map(medicalCard).join('')}</div>`:'<div class="empty">Nenhum registro ainda. Adicione a primeira consulta ou gere as recorrências.</div>'}</div>`}
function medicalCard(r){const future=calendarDay(parseYmd(r.date))>calendarDay(today);return `<article class="medical-card ${future?'future':''}"><div class="medical-date"><b>${r.date?fmtDate(r.date):'Sem data'}</b><span>${esc(r.subject||'')}</span></div><div class="medical-content"><div class="medical-title"><div><h3>${esc(r.type||'Acompanhamento')}</h3><p>${[r.professional,r.location].filter(Boolean).map(esc).join(' · ')||'Sem profissional/local informado'}</p></div><span class="tag ${r.status==='Programado'?'warn':'green'}">${esc(r.status||'Realizado')}</span></div>${r.notes?`<div class="medical-notes">${esc(r.notes)}</div>`:''}${r.attachment?`<div class="attachment-preview">${r.attachment.type?.startsWith('image/')?`<img src="${r.attachment.data}" alt="Anexo médico">`:icons.clip}<span>${esc(r.attachment.name)}</span></div>`:''}<div class="medical-actions"><button class="btn soft" onclick="explainRecord('${r.id}')">Explicar em linguagem simples</button><button class="btn" onclick="medicalModal('${r.id}')">Editar</button><button class="btn danger-btn" onclick="deleteMedical('${r.id}')">Excluir</button></div></div></article>`}
window.medicalModal=id=>{const r=id?state.medicalRecords.find(x=>x.id===id):{};openModal(`<h3>${id?'Editar':'Novo'} acompanhamento</h3><div class="form-grid"><div class="field"><label>De quem?</label><select id="mdSubject"><option ${r.subject==='Isabela'?'selected':''}>Isabela</option><option ${r.subject==='Bebê'?'selected':''}>Bebê</option></select></div><div class="field"><label>Data</label><input id="mdDate" type="date" value="${r.date||iso(today)}"></div><div class="field"><label>Tipo</label><input id="mdType" value="${esc(r.type||'')}" placeholder="Ultrassom, obstetra, exame..."></div><div class="field"><label>Status</label><select id="mdStatus"><option ${r.status!=='Programado'?'selected':''}>Realizado</option><option ${r.status==='Programado'?'selected':''}>Programado</option></select></div><div class="field"><label>Profissional</label><input id="mdProfessional" value="${esc(r.professional||'')}"></div><div class="field"><label>Local</label><input id="mdLocation" value="${esc(r.location||'')}"></div><div class="field"><label>Recorrência</label><select id="mdRec"><option value="none">Sem recorrência</option><option value="30">A cada 30 dias</option><option value="14">A cada 14 dias</option><option value="7">Semanal</option></select></div><div class="field"><label>Anexo</label><input id="mdFile" type="file" accept="image/*,.pdf"></div></div><div class="field" style="margin-top:12px"><label>O que foi feito / laudo / observação</label><textarea id="mdNotes" placeholder="Cole o laudo ou escreva o que o médico explicou...">${esc(r.notes||'')}</textarea></div>${r.attachment?`<div class="notice" style="margin-top:10px">Anexo atual: ${esc(r.attachment.name)}. Se escolher outro arquivo, ele será substituído.</div>`:''}<div class="modal-foot"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="saveMedical('${id||''}')">Salvar</button></div>`)};
async function compressImage(file){return new Promise((resolve,reject)=>{const rd=new FileReader();rd.onload=()=>{if(!file.type.startsWith('image/')){if(file.size>3*1024*1024){reject(new Error('Arquivo maior que 3 MB'));return}resolve({name:file.name,type:file.type,data:rd.result});return}const img=new Image();img.onload=()=>{const max=1200,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve({name:file.name,type:'image/jpeg',data:c.toDataURL('image/jpeg',.72)})};img.onerror=reject;img.src=rd.result};rd.onerror=reject;rd.readAsDataURL(file)})}
window.saveMedical=async id=>{let r=id?state.medicalRecords.find(x=>x.id===id):null;const file=$('#mdFile').files[0];let attachment=r?.attachment||null;if(file){try{attachment=await compressImage(file)}catch(e){toast('Não foi possível ler o anexo')}}const base={id:id||'md'+Date.now(),subject:$('#mdSubject').value,date:$('#mdDate').value,type:$('#mdType').value||'Acompanhamento',status:$('#mdStatus').value,professional:$('#mdProfessional').value,location:$('#mdLocation').value,notes:$('#mdNotes').value,attachment,recurrence:$('#mdRec').value};if(r)Object.assign(r,base);else state.medicalRecords.push(base);const rec=+$('#mdRec').value;if(rec>0){for(let n=1;n<=3;n++)state.medicalRecords.push({...base,id:'md'+Date.now()+n,date:iso(addDays(new Date(base.date+'T12:00:00'),rec*n)),status:'Programado',attachment:null,notes:`Recorrência programada a partir de “${base.type}”.`})}closeModal();save()};
window.deleteMedical=id=>{state.medicalRecords=state.medicalRecords.filter(x=>x.id!==id);save()};
const termMap=[['saco gestacional','estrutura inicial vista no ultrassom onde a gestação se desenvolve'],['vesícula vitelínica','estrutura temporária que ajuda a nutrir o embrião no início'],['vesicula vitelinica','estrutura temporária que ajuda a nutrir o embrião no início'],['ccn','comprimento cabeça-nádegas, medida usada para estimar o tamanho do embrião/feto no início'],['crl','medida do comprimento do embrião, equivalente ao CCN'],['bcf','batimentos cardíacos fetais'],['hematoma','coleção de sangue que precisa ser interpretada conforme tamanho, local e sintomas'],['descolamento','área em que pode haver separação/hematoma; o significado depende do ultrassom e da avaliação médica'],['colo uterino','parte inferior do útero; comprimento e aspecto podem ser avaliados na gestação'],['líquido amniótico','líquido que envolve o bebê dentro do útero'],['liquido amniotico','líquido que envolve o bebê dentro do útero'],['percentil','comparação da medida do bebê com uma população de referência para a mesma idade gestacional'],['beta-hcg','hormônio medido no sangue no início da gestação'],['translucência nucal','medida feita no primeiro trimestre dentro de uma janela específica de ultrassom'],['translucencia nucal','medida feita no primeiro trimestre dentro de uma janela específica de ultrassom']];
function explainText(text){if(!text?.trim())return 'Não há texto suficiente nesse registro. Se o anexo for um laudo ou ultrassom, escreva ou cole o texto principal para eu explicar os termos.';const lower=text.toLowerCase();const hits=termMap.filter(([k])=>lower.includes(k));let out=`Em linguagem simples, o registro diz:\n\n${text.trim()}\n`;if(hits.length)out+=`\nTermos identificados:\n• ${hits.map(([k,v])=>`${k}: ${v}`).join('\n• ')}`;out+='\n\nIsso organiza o significado dos termos, mas não substitui a interpretação da obstetra/pediatra, principalmente para dizer se um achado é normal ou preocupante.';return out}
window.explainRecord=async id=>{const r=state.medicalRecords.find(x=>x.id===id);openModal(`<h3>Agente Ninho · explicando registro</h3><div class="agent-explain" id="aiExplain">Analisando o registro...</div><div class="modal-foot"><button class="btn primary" onclick="closeModal()">Fechar</button></div>`);let answer='';try{const res=await fetch('/api/medical-explain',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({notes:r.notes||'',attachment:r.attachment||null,subject:r.subject||'',type:r.type||'',date:r.date||''})});if(res.ok){const data=await res.json();answer=data.explanation||''}}catch(e){}if(!answer){let extra=r.attachment?`\n\nAnexo: ${r.attachment.name}. A leitura visual automática fica disponível quando o Ninho estiver rodando com o servidor de IA. Enquanto isso, o texto escrito no registro já pode ser explicado localmente.`:'';answer=explainText(r.notes)+extra}const el=$('#aiExplain');if(el)el.innerHTML=esc(answer).replaceAll('\n','<br>')};

function renderAgent(){const qs=['Isabela está com quantas semanas?','O que falta para o nascimento?','O que comprar só depois de 6 meses?','Quais vacinas da mãe estão pendentes?','Quais são as primeiras vacinas do bebê?','Quais consultas médicas estão programadas?','Explique o último registro médico','Quanto já gastamos?'];$('#view-agente').innerHTML=`<div class="agent-shell"><div class="card agent-side"><div class="agent-baby">${icons.baby}</div><h3>Perguntas rápidas</h3><div class="suggestions">${qs.map(q=>`<button class="suggest" onclick="ask('${q.replaceAll("'","\\'")}')">${q}</button>`).join('')}</div><div class="notice" style="margin-top:14px">O agente usa o inventário, vacinas e registros desta plataforma. Com Render + Neon, inventário, vacinas, agenda e registros sincronizam entre dispositivos. Com a chave da OpenAI, imagens e PDFs também podem ser explicados pelo agente.</div></div><div class="card chat"><div class="chat-head"><div class="bot-icon">${icons.bot}</div><div><b>Agente Ninho</b><span>Ian ou Luísa · saúde + inventário + orçamento</span></div></div><div class="messages" id="messages"><div class="msg bot">Oi! Agora eu conheço o inventário até 2 anos, as vacinas da Isabela e do bebê, a agenda médica e os registros que vocês salvarem.</div></div><div class="chat-input"><input id="agentInput" placeholder="Pergunte qualquer coisa sobre Ian ou Luísa..." onkeydown="if(event.key==='Enter')sendAgent()"><button onclick="sendAgent()">${icons.send}</button></div></div></div>`}
window.ask=q=>{$('#agentInput').value=q;sendAgent()};window.sendAgent=()=>{const i=$('#agentInput'),q=i.value.trim();if(!q)return;const m=$('#messages');m.insertAdjacentHTML('beforeend',`<div class="msg user">${esc(q)}</div>`);i.value='';const a=agentAnswer(q);setTimeout(()=>{m.insertAdjacentHTML('beforeend',`<div class="msg bot">${esc(a)}</div>`);m.scrollTop=m.scrollHeight},120);m.scrollTop=m.scrollHeight};
function agentAnswer(q){const t=q.toLowerCase(),st=stats();
 if(/semana|gesta|quanto tempo/.test(t))return `Hoje a Isabela está com ${weeks} semanas${days?` e ${days} dias`:''}. Pela transferência de embrião D5 em 31/07/2026, no dia 06/09/2026 ela completa exatamente 8 semanas.`;
 if(/falta.*nascimento|antes.*nascer|nascimento.*falta/.test(t)){const miss=state.items.filter(i=>i.essential&&['Nascimento','0–3m'].includes(i.phase)&&targetFor(i)>i.have&&i.status!=='Evitar').slice(0,10);return miss.length?`Para a fase inicial, os principais itens ainda faltando são:\n• ${miss.map(i=>`${i.name} (${i.size}) — ${targetFor(i)-i.have}`).join('\n• ')}`:'Os essenciais iniciais planejados estão cobertos.'}
 if(/depois.*6|6 meses|futuro/.test(t)){const x=state.items.filter(i=>!['Nascimento','0–3m','3–6m'].includes(i.phase)&&targetFor(i)>0).slice(0,12);return `Itens que podem esperar: ${x.map(i=>`${i.name} [${i.phase}]`).join(', ')}. A ideia é comprar perto da fase para evitar tamanho/estação errados.`}
 if(/vacina.*mãe|vacina.*mae|isabela.*vacina|dtpa|vsr/.test(t)){const pending=motherVaccines.filter(v=>!state.motherVax[v.id]?.done);return `Vacinação da Isabela: ${pending.length} registro(s) ainda não marcados como feitos. Principais marcos: dTpa a partir da 20ª semana e VSR a partir da 28ª. Influenza, covid-19, hepatite B e dT dependem da temporada/histórico. Confirme o cartão com o pré-natal.`}
 if(/primeira.*vacina|vacina.*bebê|vacina.*bebe|bcg/.test(t))return `Ao nascer, o PNI prevê hepatite B e BCG. O calendário SUS é gratuito. Além dele, a SBIm recomenda diferenças no privado, como meningocócica B e ACWY mais ampla no primeiro ano; outras opções privadas, como hexavalente e rotavírus pentavalente, são alternativas ao esquema público. Como Ian/Luísa nascerá em 2027, o calendário deve ser revalidado perto do nascimento.`;
 if(/consulta|médic|medic|agenda|programad/.test(t)){const future=state.medicalRecords.filter(r=>calendarDay(parseYmd(r.date))>=calendarDay(today)).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,6);return future.length?`Próximos acompanhamentos:\n• ${future.map(r=>`${fmtDate(r.date)} — ${r.type} (${r.subject})`).join('\n• ')}`:'Ainda não há consultas futuras cadastradas. Na guia Médico você pode gerar a recorrência do pré-natal e da puericultura.'}
 if(/último registro|ultimo registro|explique.*registro|laudo/.test(t)){const r=[...state.medicalRecords].filter(x=>x.notes).sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0];return r?explainText(r.notes):'Ainda não há registro médico com texto para explicar.'}
 if(/falta|comprar|enxoval/.test(t)){const miss=state.items.filter(i=>i.essential&&targetFor(i)>i.have&&i.status!=='Evitar').slice(0,10);return miss.length?`Principais faltas:\n• ${miss.map(i=>`${i.name} ${i.size} — faltam ${targetFor(i)-i.have}`).join('\n• ')}`:'Os essenciais planejados estão cobertos.'}
 if(/ganh|presente/.test(t)){const g=state.items.filter(i=>i.status==='Ganhou'&&i.have>0);return g.length?`Vocês registraram ${st.gifts} unidades recebidas: ${g.slice(0,10).map(i=>`${i.name} (${i.have})`).join(', ')}.`:'Ainda não há itens marcados como presente.'}
 if(/gast|orç|orc|dinheiro|quanto/.test(t))return `Há ${money(st.spent)} marcado como comprado. Teto atual: ${money(state.budget)}.${state.budget?` Restam ${money(Math.max(0,state.budget-st.spent))}.`:''}`;
 if(/promo|preço|preco|desconto/.test(t)){const hit=state.watch.filter(w=>+w.current>0&&+w.current<=+w.target);return hit.length?`${hit.length} produto(s) atingiram o alvo: ${hit.map(w=>`${w.name} por ${money(w.current)}`).join('; ')}.`:'Nenhum produto monitorado atingiu o alvo.'}
 if(/agros|plano|nascer saudável|nascer saudavel/.test(t))return 'O Agros informa o programa Nascer Saudável, com encontros de pré-natal em Viçosa, visita de enfermeira após o nascimento nas áreas de abrangência e kit de cuidados do bebê para beneficiárias. Vale confirmar o agendamento diretamente com o plano.';
 return 'Posso responder sobre: semanas de gestação, inventário até 2 anos, presentes, orçamento, promoções, vacinas da Isabela, vacinas do bebê, consultas programadas e explicação de textos/laudos registrados.'}

function renderAll(){renderDashboard();renderEnxoval();renderPromos();renderBudget();renderTea();renderPreg();renderMotherVax();renderBabyVax();renderMedical();renderAgent();applyAccessModeUI();}
function openModal(html){$('#modal').innerHTML=html;$('#modalBack').classList.add('open')}window.closeModal=()=>$('#modalBack').classList.remove('open');$('#modalBack').onclick=e=>{if(e.target.id==='modalBack')closeModal()};
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
renderNav();lockApp();setTimeout(()=>$('#loginPin')?.focus(),120);
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});