import fs from 'node:fs';

let s = fs.readFileSync('app.js','utf8');
const start = s.indexOf('window.ask=q=>');
const end = s.indexOf('function agentAnswer', start);
if (start < 0 || end < 0) throw new Error('Bloco atual do agente não encontrado');
const front = String.raw`let agentHistory=[];
window.ask=q=>{$('#agentInput').value=q;sendAgent()};
function agentContext(){
 const st=stats();
 return {
  profile:{baby:PROFILE.babyNames,sex:PROFILE.sex,mother:PROFILE.mother,city:`${PROFILE.city}/${PROFILE.state}`,plan:PROFILE.plan,transfer:PROFILE.transfer,embryoDays:PROFILE.embryoDays,birthEstimate:PROFILE.birthEstimate,weeks,days,daysToDue},
  feedingMode:state.feedingMode,
  budget:{limit:Number(state.budget||0),spent:st.spent,gifts:st.gifts},
  inventory:state.items.map(i=>({name:i.name,category:i.category,size:i.size,phase:i.phase,target:targetFor(i),have:Number(i.have||0),status:i.status,when:i.when,note:i.note})),
  motherVaccines:motherVaccines.map(v=>({name:v.name,when:v.when,dose:v.dose,done:Boolean(state.motherVax[v.id]?.done),date:state.motherVax[v.id]?.date||''})),
  babyVaccines:babyVaccines.map(v=>({name:v.name,age:v.age,dose:v.dose,done:Boolean(state.babyVax[v.id]?.done),date:state.babyVax[v.id]?.date||''})),
  medicalRecords:state.medicalRecords.slice(-30).map(r=>({subject:r.subject,date:r.date,type:r.type,status:r.status,professional:r.professional,location:r.location,notes:String(r.notes||'').slice(0,1200)})),
  priceWatch:state.watch.map(w=>({name:w.name,current:Number(w.current||0),target:Number(w.target||0),url:w.url||''}))
 };
}
window.sendAgent=async()=>{
 const i=$('#agentInput'),q=i.value.trim();if(!q)return;
 const m=$('#messages');
 m.insertAdjacentHTML('beforeend',`<div class="msg user">${esc(q)}</div>`);i.value='';m.scrollTop=m.scrollHeight;
 const thinkingId='think'+Date.now();
 m.insertAdjacentHTML('beforeend',`<div class="msg bot" id="${thinkingId}">Pensando...</div>`);m.scrollTop=m.scrollHeight;
 let answer='';
 try{
  const res=await fetch('/api/agent',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({question:q,history:agentHistory.slice(-8),context:agentContext()})});
  if(res.ok){const data=await res.json();answer=String(data.answer||'').trim()}
 }catch(e){}
 if(!answer)answer=agentAnswer(q);
 agentHistory.push({role:'user',content:q},{role:'assistant',content:answer});
 if(agentHistory.length>16)agentHistory=agentHistory.slice(-16);
 const el=document.getElementById(thinkingId);if(el)el.innerHTML=esc(answer).replaceAll('\\n','<br>');
 m.scrollTop=m.scrollHeight;
};
`;
s = s.slice(0,start) + front + s.slice(end);
fs.writeFileSync('app.js',s);

s = fs.readFileSync('server.js','utf8');
const anchor = 'app.post("/api/medical-explain", requireReadAccess, async (req, res) => {';
if (!s.includes('/api/agent')) {
 const route = String.raw`app.post("/api/agent", requireReadAccess, async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: "OPENAI_API_KEY não configurada" });
    const { question = "", history = [], context = {} } = req.body || {};
    if (!String(question).trim()) return res.status(400).json({ error: "Pergunta vazia" });
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const safeHistory = Array.isArray(history) ? history.slice(-8).map(m => ({ role: m?.role === "assistant" ? "assistant" : "user", content: String(m?.content || "").slice(0, 3000) })) : [];
    const contextText = JSON.stringify(context).slice(0, 55000);
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      instructions: "Você é o Agente Ninho, assistente inteligente da família de Ian. Responda em português brasileiro, de forma natural, direta e útil. Você não está limitado a perguntas predefinidas: responda perguntas livres sobre Ian, Isabela, gestação, FIV, enxoval, fraldas, vacinas, consultas, alimentação do bebê, desenvolvimento, orçamento e dados cadastrados no Ninho. Use primeiro os dados do contexto do aplicativo. Não invente itens, compras, consultas, exames, vacinas aplicadas ou valores que não estejam no contexto. Se a pergunta for geral e não depender dos dados cadastrados, use conhecimento geral. Para saúde, ajude a entender e dê orientação prudente, mas não faça diagnóstico nem substitua obstetra/pediatra. Sinais de urgência devem receber orientação adequada, sem alarmismo. Lembre que Ian nasce em 2027 e calendários de vacinação podem mudar. Dados fixos: o bebê se chama Ian e é menino; a gestante é Isabela; FIV com transferência de embrião D5 em 31/07/2026; previsão de parto 18/04/2027. Nunca revele nem solicite PIN, chave de API, DATABASE_URL ou outros segredos.",
      input: [
        ...safeHistory.map(m => ({ role: m.role, content: [{ type: "input_text", text: m.content }] })),
        { role: "user", content: [{ type: "input_text", text: "CONTEXTO ATUAL DO NINHO:\\n" + contextText + "\\n\\nPERGUNTA:\\n" + String(question).slice(0,5000) }] }
      ]
    });
    res.json({ answer: response.output_text || "Não consegui formular uma resposta agora.", role: req.ninhoRole });
  } catch (err) {
    console.error("agent", err);
    res.status(500).json({ error: "Não foi possível responder agora" });
  }
});

`;
 if (!s.includes(anchor)) throw new Error('Âncora do servidor não encontrada');
 s = s.replace(anchor, route + anchor);
}
fs.writeFileSync('server.js',s);

s = fs.readFileSync('sw.js','utf8');
s = s.replace(/const CACHE = 'ninho-[^']+';/, "const CACHE = 'ninho-v20-agente-ia';");
fs.writeFileSync('sw.js',s);
