import { databaseEnabled, getState, putState } from './db.js';

const MIN_SUCCESS_MS = 5 * 60 * 60 * 1000;
const MIN_ERROR_RETRY_MS = 60 * 1000;
const MAX_HISTORY = 60;
let lastScheduledMemory = 0;

const SUPPORTED_HOSTS = [
  /(^|\.)mercadolivre\.com\.br$/i,
  /(^|\.)mercadolivre\.com$/i,
  /(^|\.)amazon\.com\.br$/i,
  /(^|\.)amazon\.com$/i,
  /(^|\.)magazineluiza\.com\.br$/i,
  /(^|\.)magalu\.com$/i,
  /(^|\.)shopee\.com\.br$/i,
  /(^|\.)shein\.com$/i,
  /(^|\.)shein\.com\.br$/i
];

function normalizeUrl(raw = '') {
  try {
    const url = new URL(String(raw).trim());
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (!SUPPORTED_HOSTS.some(re => re.test(url.hostname))) return null;
    return url;
  } catch {
    return null;
  }
}

function brlNumber(raw) {
  if (raw === null || raw === undefined) return null;
  let s = String(raw).trim().replace(/R\$\s*/gi, '').replace(/\s/g, '');
  if (!s) return null;
  if (/^\d{1,3}(\.\d{3})+,\d{2}$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d+,\d{2}$/.test(s)) s = s.replace(',', '.');
  else if (/^\d{1,3}(,\d{3})+\.\d{2}$/.test(s)) s = s.replace(/,/g, '');
  const n = Number(s);
  return Number.isFinite(n) && n > 0.5 && n < 10000000 ? n : null;
}

function isMercadoLivre(url) {
  return /(^|\.)mercadolivre\.com(?:\.br)?$/i.test(url.hostname);
}

function mercadoLivreId(text = '') {
  const decoded = (()=>{ try { return decodeURIComponent(String(text)); } catch { return String(text); } })();
  const m = decoded.match(/\bMLB[-_ ]?(\d{6,})\b/i);
  return m ? `MLB${m[1]}` : null;
}

function normalizeWords(text = '') {
  return String(text)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/).filter(w => w.length >= 3 && !['para','com','sem','uma','uns','das','dos','beb','bebe','baby'].includes(w));
}

function titleScore(query, title) {
  const q = [...new Set(normalizeWords(query))];
  const t = new Set(normalizeWords(title));
  if (!q.length) return 0;
  const hits = q.filter(w => t.has(w)).length;
  return hits / q.length;
}

async function mercadoLivreApiPrice(id, signal) {
  const itemRes = await fetch(`https://api.mercadolibre.com/items/${id}`, {
    signal,
    headers: { 'accept': 'application/json', 'user-agent': 'Ninho-Price-Monitor/1.0' }
  });
  if (itemRes.ok) {
    const item = await itemRes.json();
    const p = brlNumber(item?.price);
    if (p) return { price: p, source: 'API pública do Mercado Livre', finalUrl: item?.permalink || '' };
  }

  const productRes = await fetch(`https://api.mercadolibre.com/products/${id}`, {
    signal,
    headers: { 'accept': 'application/json', 'user-agent': 'Ninho-Price-Monitor/1.0' }
  });
  if (productRes.ok) {
    const product = await productRes.json();
    const winner = product?.buy_box_winner || product?.buyBoxWinner;
    const p = brlNumber(winner?.price);
    if (p) return { price: p, source: 'API pública do Mercado Livre', finalUrl: product?.permalink || '' };
    const winnerId = winner?.item_id || winner?.itemId;
    if (winnerId && String(winnerId).toUpperCase() !== id.toUpperCase()) return mercadoLivreApiPrice(String(winnerId).replace('-', ''), signal);
  }
  return null;
}

async function mercadoLivreSearchPrice(name, signal) {
  const query = String(name || '').trim();
  if (!query) return null;
  const res = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=8`, {
    signal,
    headers: { 'accept': 'application/json', 'user-agent': 'Ninho-Price-Monitor/1.0' }
  });
  if (!res.ok) return null;
  const data = await res.json();
  const ranked = (Array.isArray(data?.results) ? data.results : [])
    .map(r => ({...r, _score:titleScore(query, r?.title || '')}))
    .filter(r => brlNumber(r?.price))
    .sort((a,b) => b._score - a._score);
  const best = ranked[0];
  if (!best || best._score < 0.55) return null;
  return {
    price: brlNumber(best.price),
    source: 'API pública do Mercado Livre · busca pelo título',
    finalUrl: best.permalink || '',
    matchedTitle: best.title || '',
    matchScore: best._score
  };
}

function walkJson(value, out) {
  if (!value || out.length > 20) return;
  if (Array.isArray(value)) return value.forEach(v => walkJson(v, out));
  if (typeof value !== 'object') return;
  const type = String(value['@type'] || '').toLowerCase();
  if (type.includes('product') && value.offers) {
    const offers = Array.isArray(value.offers) ? value.offers : [value.offers];
    for (const offer of offers) {
      const p = brlNumber(offer?.price ?? offer?.lowPrice);
      if (p) out.push({ price: p, source: 'dados estruturados da loja' });
    }
  }
  for (const v of Object.values(value)) walkJson(v, out);
}

function extractPrice(html) {
  const candidates = [];

  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { walkJson(JSON.parse(m[1].trim()), candidates); } catch {}
  }

  const metaPatterns = [
    /<meta[^>]+(?:itemprop=["']price["']|property=["']product:price:amount["']|property=["']og:price:amount["'])[^>]+content=["']([^"']+)["'][^>]*>/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:itemprop=["']price["']|property=["']product:price:amount["']|property=["']og:price:amount["'])[^>]*>/gi
  ];
  for (const re of metaPatterns) {
    for (const m of html.matchAll(re)) {
      const p = brlNumber(m[1]);
      if (p) candidates.push({ price: p, source: 'preço informado pela página' });
    }
  }

  const amazonPatterns = [
    /a-offscreen[^>]*>\s*R\$\s*([\d\.]+,\d{2})\s*</i,
    /"priceToPay"\s*:\s*\{[^}]*"value"\s*:\s*([0-9.]+)/i
  ];
  for (const re of amazonPatterns) {
    const m = html.match(re);
    if (m) {
      const p = brlNumber(m[1]);
      if (p) candidates.push({ price: p, source: 'preço exibido pela loja' });
    }
  }

  const ml = html.match(/andes-money-amount__fraction[^>]*>\s*([\d\.]+)\s*<[\s\S]{0,350}?andes-money-amount__cents[^>]*>\s*(\d{2})\s*</i);
  if (ml) {
    const p = brlNumber(`${ml[1]},${ml[2]}`);
    if (p) candidates.push({ price: p, source: 'preço exibido pela loja' });
  }

  const magaluPatterns = [
    /data-testid=["']price-value["'][^>]*>\s*R\$\s*([\d\.]+,\d{2})/i,
    /"bestPrice"\s*:\s*([0-9.]+)/i,
    /"price"\s*:\s*\{[^}]*"value"\s*:\s*([0-9.]+)/i
  ];
  for (const re of magaluPatterns) {
    const m = html.match(re);
    if (m) {
      const p = brlNumber(m[1]);
      if (p) candidates.push({ price: p, source: 'preço exibido pela loja' });
    }
  }

  const generic = html.match(/["'](?:salePrice|currentPrice|price)["']\s*:\s*["']?([0-9]{1,7}(?:[\.,][0-9]{1,2})?)["']?/i);
  if (!candidates.length && generic) {
    const p = brlNumber(generic[1]);
    if (p) candidates.push({ price: p, source: 'dados da página' });
  }

  return candidates[0] || null;
}

async function fetchProductPrice(rawUrl, productName = '') {
  const url = normalizeUrl(rawUrl);
  if (!url) throw new Error('Link não suportado automaticamente');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18000);
  try {
    if (isMercadoLivre(url)) {
      const idFromUrl = mercadoLivreId(url.href);
      if (idFromUrl) {
        const api = await mercadoLivreApiPrice(idFromUrl, controller.signal);
        if (api) return api;
      }
    }

    let pageError = null;
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153 Safari/537.36',
          'accept-language': 'pt-BR,pt;q=0.9,en;q=0.6',
          'accept': 'text/html,application/xhtml+xml'
        }
      });
      if (!res.ok) throw new Error(`Loja respondeu HTTP ${res.status}`);
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) throw new Error('Página não retornou HTML de produto');
      const html = (await res.text()).slice(0, 5000000);

      if (isMercadoLivre(url)) {
        const idFromPage = mercadoLivreId(res.url) || mercadoLivreId(html.match(/(?:item_id|itemId)["']?\s*[:=]\s*["']?(MLB[-_ ]?\d{6,})/i)?.[1] || '') || mercadoLivreId(html);
        if (idFromPage) {
          const api = await mercadoLivreApiPrice(idFromPage, controller.signal);
          if (api) return api;
        }
      }

      const found = extractPrice(html);
      if (found) return { ...found, finalUrl: res.url };
    } catch (err) {
      pageError = err;
    }

    if (isMercadoLivre(url)) {
      const searched = await mercadoLivreSearchPrice(productName, controller.signal);
      if (searched) return searched;
    }

    throw pageError || new Error('Não consegui identificar o preço nesta página');
  } finally {
    clearTimeout(timer);
  }
}

export async function refreshWatchPrices({ force = false } = {}) {
  if (!databaseEnabled()) throw new Error('Banco não configurado');
  if (!force && Date.now() - lastScheduledMemory < 60 * 1000) {
    return { ok: true, skipped: true, reason: 'varredura executada há menos de 1 minuto', updated: 0, alerts: 0, errors: 0, results: [] };
  }
  if (!force) lastScheduledMemory = Date.now();

  const stored = await getState();
  const state = stored?.data && typeof stored.data === 'object' ? stored.data : {};
  const watch = Array.isArray(state.watch) ? state.watch : [];
  const now = new Date();
  const nowIso = now.toISOString();
  const results = [];
  let touched = false;

  for (const item of watch.slice(0, 25)) {
    if (!item?.url) {
      results.push({ id: item?.id, ok: false, skipped: true, reason: 'sem link' });
      continue;
    }
    const last = item.lastChecked ? new Date(item.lastChecked).getTime() : 0;
    const waitMs = item.lastError ? MIN_ERROR_RETRY_MS : MIN_SUCCESS_MS;
    if (!force && last && Date.now() - last < waitMs) {
      results.push({ id: item.id, ok: true, skipped: true, reason: 'checado recentemente' });
      continue;
    }

    try {
      const found = await fetchProductPrice(item.url, item.name || '');
      const old = Number(item.current || 0);
      item.previous = old || null;
      item.current = Number(found.price.toFixed(2));
      item.lowest = item.lowest ? Math.min(Number(item.lowest), item.current) : item.current;
      item.lastChecked = nowIso;
      item.lastSuccess = nowIso;
      item.lastError = '';
      item.priceSource = found.source;
      item.finalUrl = found.finalUrl || item.url;
      item.matchedTitle = found.matchedTitle || '';
      item.auto = true;
      item.history = Array.isArray(item.history) ? item.history : [];
      const lastPoint = item.history[item.history.length - 1];
      if (!lastPoint || Number(lastPoint.price) !== item.current) item.history.push({ at: nowIso, price: item.current });
      item.history = item.history.slice(-MAX_HISTORY);
      touched = true;
      results.push({ id: item.id, ok: true, price: item.current, target: Number(item.target || 0), hit: Number(item.target || 0) > 0 && item.current <= Number(item.target), source: found.source });
    } catch (err) {
      item.lastChecked = nowIso;
      item.lastError = String(err?.message || 'Falha ao consultar preço').slice(0, 180);
      item.auto = true;
      touched = true;
      results.push({ id: item.id, ok: false, error: item.lastError });
    }
  }

  if (touched) {
    state.watch = watch;
    state.priceMonitor = { lastRun: nowIso, intervalHours: 6 };
    await putState(state);
  }

  return {
    ok: true,
    checkedAt: nowIso,
    monitored: watch.filter(w => w?.url).length,
    updated: results.filter(r => r.ok && !r.skipped).length,
    alerts: results.filter(r => r.hit).length,
    errors: results.filter(r => !r.ok && !r.skipped).length,
    results
  };
}
