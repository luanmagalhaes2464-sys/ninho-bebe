(()=>{
  const checkedText = iso => {
    if (!iso) return 'Ainda não verificado automaticamente';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Verificação registrada';
    return 'Última verificação: ' + new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(d);
  };

  function syncWatchFromServer(){
    return apiState('GET').then(async res=>{
      if(!res?.ok) return false;
      const data=await res.json();
      if(data.state){
        state=normalizeState(data.state);
        localStorage.setItem(STORE_KEY,JSON.stringify(state));
        return true;
      }
      return false;
    }).catch(()=>false);
  }

  window.refreshPrices=async()=>{
    if(!guardEdit()) return;
    const btn=document.querySelector('[data-price-refresh]');
    if(btn){btn.disabled=true;btn.textContent='Atualizando...'}
    try{
      const res=await fetch('/api/prices/refresh',{method:'POST',headers:{...authHeaders()}});
      const data=await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(data.error||'Não foi possível atualizar os preços');
      await syncWatchFromServer();
      renderPromos();
      toast(data.errors?`Atualizado com ${data.errors} link(s) sem leitura automática`:`Preços atualizados · ${data.updated||0} produto(s)`);
    }catch(e){
      toast(e.message||'Falha ao atualizar preços');
    }finally{
      if(btn){btn.disabled=false;btn.innerHTML='↻ Atualizar agora'}
    }
  };

  renderPromos=function(){
    const active=state.watch.filter(w=>Number(w.current||0)<=Number(w.target||0)&&Number(w.current||0)>0&&Number(w.target||0)>0);
    const lastRun=state.priceMonitor?.lastRun;
    $('#view-promocoes').innerHTML=`<div class="grid-2"><div class="card panel"><div class="section-head"><div><h2>Produtos monitorados</h2><p>O Ninho verifica os links automaticamente a cada ~6 horas.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-price-refresh onclick="refreshPrices()">↻ Atualizar agora</button><button class="btn primary" onclick="addWatchModal()">${icons.plus} Monitorar</button></div></div>${state.watch.length?`<div class="grid-2">${state.watch.map(w=>`<div class="price-card"><div class="price-head"><div><h4>${esc(w.name)}</h4><div class="store">${esc(w.store||'Loja')}</div></div>${+w.current>0&&+w.target>0&&+w.current<=+w.target?'<span class="alert-ok">atingiu o alvo</span>':''}</div><div class="price-values"><div><small>Atual</small><b>${+w.current>0?money(w.current):'aguardando'}</b></div><div><small>Alvo</small><b>${money(w.target)}</b></div></div><div style="margin-top:10px;font-size:12px;color:#6f7f76;line-height:1.45">${checkedText(w.lastChecked)}${w.lowest?`<br>Menor preço visto: <b>${money(w.lowest)}</b>`:''}${w.lastError?`<br><span style="color:#9a6b39">${esc(w.lastError)}</span>`:''}</div>${w.url?`<a class="btn soft link-btn" target="_blank" rel="noopener" href="${esc(w.url)}">Abrir produto</a>`:''}</div>`).join('')}</div>`:'<div class="empty">Nenhum produto monitorado ainda.</div>'}</div><div class="card panel"><div class="section-head"><div><h2>Alertas</h2><p>O alerta aparece quando o preço encontrado é menor ou igual ao alvo.</p></div></div>${active.length?active.map(w=>`<div class="vaccine"><div class="vaccine-check">${icons.bell}</div><div><b>${esc(w.name)}</b><p>${money(w.current)} atingiu o alvo de ${money(w.target)}.</p></div></div>`).join(''):'<div class="empty">Nenhum preço atingiu o alvo.</div>'}<div class="notice" style="margin-top:14px"><b>Monitoramento automático ativo.</b><br>${lastRun?`Última varredura geral: ${checkedText(lastRun).replace('Última verificação: ','')}.`:'A primeira varredura acontecerá automaticamente; você também pode usar “Atualizar agora”.'}<br><small>Algumas lojas podem bloquear leitura automática. Quando isso acontecer, o card mostra o erro sem substituir o último preço válido.</small></div></div></div>`;
    applyAccessModeUI();
  };

  window.addWatchModal=()=>{
    if(!guardEdit())return;
    openModal(`<h3>Monitorar preço automaticamente</h3><div class="form-grid"><div class="field"><label>Produto</label><input id="wName" placeholder="Ex.: Carrinho Burigotto"></div><div class="field"><label>Loja</label><input id="wStore" placeholder="Mercado Livre, Amazon, Magalu..."></div><div class="field"><label>Preço-alvo</label><input id="wTarget" type="number" step="0.01" placeholder="650,00"></div><div class="field"><label>Preço atual opcional</label><input id="wCurrent" type="number" step="0.01" placeholder="Pode deixar vazio"></div></div><div class="field" style="margin-top:12px"><label>Link do produto</label><input id="wUrl" placeholder="https://..."></div><div class="notice" style="margin-top:12px">O Ninho tentará ler o preço do link automaticamente a cada ~6 horas. Atualmente funciona melhor com páginas públicas de Mercado Livre, Amazon, Magalu, Shopee e Shein; algumas páginas podem impedir a leitura automática.</div><div class="modal-foot"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="saveWatch()">Salvar e monitorar</button></div>`);
  };

  window.saveWatch=()=>{
    if(!guardEdit())return;
    const name=$('#wName').value.trim(),url=$('#wUrl').value.trim(),target=+$('#wTarget').value||0;
    if(!name||!url||!target){toast('Informe produto, link e preço-alvo');return}
    state.watch.push({id:'w'+Date.now(),name,store:$('#wStore').value.trim()||'Loja',current:+$('#wCurrent').value||0,target,url,auto:true,lastChecked:'',lastSuccess:'',lastError:'',history:[]});
    closeModal();
    save();
    setTimeout(()=>refreshPrices(),900);
  };

  const originalGo=go;
  go=function(id){
    originalGo(id);
    if(id==='promocoes'){
      syncWatchFromServer().then(changed=>{if(changed)renderPromos()});
    }
  };

  setTimeout(()=>{if($('#view-promocoes'))renderPromos()},50);
})();
