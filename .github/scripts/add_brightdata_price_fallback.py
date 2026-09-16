from pathlib import Path

p=Path('price-monitor.js')
s=p.read_text()

if 'BRIGHT_DATA_ML_DATASET' not in s:
    s=s.replace(
        "const MAX_HISTORY = 60;\n",
        "const MAX_HISTORY = 60;\nconst BRIGHT_DATA_ML_DATASET = 'gd_m7re62tb1w88ymy86r';\n"
    )

anchor='function walkJson(value, out) {'
if 'async function brightDataMercadoLivrePrice' not in s:
    helper=r'''function brightDataRecordPrice(record) {
  if (!record || typeof record !== 'object') return null;
  const keys = ['final_price','finalPrice','price','sale_price','salePrice','current_price','currentPrice','price_value','priceValue'];
  for (const key of keys) {
    const p = brlNumber(record[key]);
    if (p) return p;
  }
  for (const value of Object.values(record)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const key of keys) {
        const p = brlNumber(value[key]);
        if (p) return p;
      }
    }
  }
  return null;
}

async function brightDataMercadoLivrePrice(rawUrl) {
  const token = String(process.env.BRIGHTDATA_API_TOKEN || '').trim();
  if (!token) return null;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  const trigger = await fetch(
    `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${BRIGHT_DATA_ML_DATASET}&include_errors=true`,
    { method:'POST', headers, body:JSON.stringify([{url:rawUrl}]) }
  );
  if (!trigger.ok) throw new Error(`Provedor de preços respondeu HTTP ${trigger.status}`);
  const triggerData = await trigger.json().catch(()=>({}));
  const snapshotId = triggerData?.snapshot_id;
  if (!snapshotId) throw new Error('Provedor de preços não iniciou a consulta');

  for (let attempt=0; attempt<24; attempt++) {
    await new Promise(resolve=>setTimeout(resolve,5000));
    const snap = await fetch(
      `https://api.brightdata.com/datasets/v3/snapshot/${encodeURIComponent(snapshotId)}?format=json`,
      { headers:{'Authorization':`Bearer ${token}`} }
    );
    if (snap.status === 202) continue;
    if (!snap.ok) throw new Error(`Provedor de preços respondeu HTTP ${snap.status}`);
    const data = await snap.json().catch(()=>null);
    const records = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : data ? [data] : [];
    const record = records.find(r=>brightDataRecordPrice(r)) || records[0];
    const price = brightDataRecordPrice(record);
    if (!price) {
      const providerError = record?.error || record?.error_message || record?.message;
      throw new Error(providerError ? `Provedor: ${String(providerError).slice(0,100)}` : 'Provedor não encontrou preço no produto');
    }
    return {
      price,
      source:'coleta automática do Mercado Livre',
      finalUrl:record?.url || record?.product_url || rawUrl,
      matchedTitle:record?.title || record?.product_title || ''
    };
  }
  throw new Error('Consulta de preço demorou mais que o esperado');
}

'''
    if anchor not in s:
        raise RuntimeError('Âncora walkJson não encontrada')
    s=s.replace(anchor,helper+anchor)

old=r'''    if (isMercadoLivre(url)) {
      const searched = await mercadoLivreSearchPrice(productName, controller.signal);
      if (searched) return searched;
    }

    throw pageError || new Error('Não consegui identificar o preço nesta página');
'''
new=r'''    if (isMercadoLivre(url)) {
      const searched = await mercadoLivreSearchPrice(productName, controller.signal);
      if (searched) return searched;
      const provider = await brightDataMercadoLivrePrice(url.href);
      if (provider) return provider;
      throw new Error('Mercado Livre bloqueou a leitura direta. Falta configurar o provedor gratuito de preços no servidor.');
    }

    throw pageError || new Error('Não consegui identificar o preço nesta página');
'''
if old in s:
    s=s.replace(old,new)
elif 'const provider = await brightDataMercadoLivrePrice' not in s:
    raise RuntimeError('Bloco Mercado Livre não encontrado')

p.write_text(s)

# Adiciona sinal seguro de configuração no health/config, sem revelar chave.
p=Path('server.js')
s=p.read_text()
s=s.replace(
    'res.json({ ok: true, database: databaseEnabled(), ai: Boolean(process.env.OPENAI_API_KEY), time: new Date().toISOString() });',
    'res.json({ ok: true, database: databaseEnabled(), ai: Boolean(process.env.OPENAI_API_KEY), priceProvider: Boolean(process.env.BRIGHTDATA_API_TOKEN), time: new Date().toISOString() });'
)
s=s.replace(
    'visitorPinEnabled: Boolean(process.env.NINHO_VISITOR_PIN)',
    'visitorPinEnabled: Boolean(process.env.NINHO_VISITOR_PIN),\n    priceProvider: Boolean(process.env.BRIGHTDATA_API_TOKEN)'
)
startup='console.log("Agente IA configurado:", Boolean(process.env.OPENAI_API_KEY), "modelo:", process.env.OPENAI_MODEL || "gpt-5");'
if startup in s and 'Provedor de preços configurado:' not in s:
    s=s.replace(startup,startup+'\n    console.log("Provedor de preços configurado:", Boolean(process.env.BRIGHTDATA_API_TOKEN));')
p.write_text(s)
