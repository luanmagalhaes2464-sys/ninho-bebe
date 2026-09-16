import { databaseEnabled, getState, putState } from './db.js';

const MIN_CHECK_MS = 5 * 60 * 60 * 1000;
const MAX_HISTORY = 60;
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

  const amazon = html.match(/a-offscreen[^>]*>\s*R\$\s*([\d\.]+,\d{2})\s*</i);
  if (amazon) {
    const p = brlNumber(amazon[1]);
    if (p) candidates.push({ price: p, source: 'preço exibido pela loja' });
  }

  const ml = html.match(/andes-money-amount__fraction[^>]*>\s*([\d\.]+)\s*<[\s\S]{0,250}?andes-money-amount__cents[^>]*>\s*(\d{2})\s*</i);
  if (ml) {
    const p = brlNumber(`${ml[1]},${ml[2]}`);
    if (p) candidates.push({ price: p, source: 'preço exibido pela loja' });
  }

  const generic = html.match(/["']price["']\s*:\s*["']?([0-9]{1,7}(?:[\.,][0-9]{1,2})?)["']?/i);
  if (!candidates.length && generic) {
    const p = brlNumber(generic[1]);
    if (p) candidates.push({ price: p, source: 'dados da página' });
  }

  return candidates[0] || null;
}

async function fetchProductPrice(rawUrl) {
  const url = normalizeUrl(rawUrl);
  if (!url) throw new Error('Link não suportado automaticamente');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
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
    const html = (await res.text()).slice(0, 4000000);
    const found = extractPrice(html);
    if (!found) throw new Error('Não consegui identificar o preço nesta página');
    return { ...found, finalUrl: res.url };
  } finally {
    clearTimeout(timer);
  }
}

export async function refreshWatchPrices({ force = false } = {}) {
  if (!databaseEnabled()) throw new Error('Banco não configurado');
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
    if (!force && last && Date.now() - last < MIN_CHECK_MS) {
      results.push({ id: item.id, ok: true, skipped: true, reason: 'checado recentemente' });
      continue;
    }

    try {
      const found = await fetchProductPrice(item.url);
      const old = Number(item.current || 0);
      item.previous = old || null;
      item.current = Number(found.price.toFixed(2));
      item.lowest = item.lowest ? Math.min(Number(item.lowest), item.current) : item.current;
      item.lastChecked = nowIso;
      item.lastSuccess = nowIso;
      item.lastError = '';
      item.priceSource = found.source;
      item.finalUrl = found.finalUrl || item.url;
      item.auto = true;
      item.history = Array.isArray(item.history) ? item.history : [];
      const lastPoint = item.history[item.history.length - 1];
      if (!lastPoint || Number(lastPoint.price) !== item.current) item.history.push({ at: nowIso, price: item.current });
      item.history = item.history.slice(-MAX_HISTORY);
      touched = true;
      results.push({ id: item.id, ok: true, price: item.current, target: Number(item.target || 0), hit: Number(item.target || 0) > 0 && item.current <= Number(item.target) });
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
