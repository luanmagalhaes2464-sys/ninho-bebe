from pathlib import Path
import re

# server.js
p = Path('server.js')
s = p.read_text()
imp = 'import { databaseEnabled, ensureSchema, getState, putState } from "./db.js";'
if 'from "./price-monitor.js"' not in s:
    if imp not in s:
        raise RuntimeError('Import do db.js não encontrado')
    s = s.replace(imp, imp + '\nimport { refreshWatchPrices } from "./price-monitor.js";')

if 'app.post("/api/prices/refresh",' not in s:
    anchor = 'app.post("/api/agent", requireReadAccess, async (req, res) => {'
    if anchor not in s:
        raise RuntimeError('Âncora /api/agent não encontrada')
    routes = r'''app.post("/api/prices/refresh", requireEditorAccess, async (req, res) => {
  try {
    const result = await refreshWatchPrices({ force: true });
    res.json(result);
  } catch (err) {
    console.error("price refresh", err);
    res.status(500).json({ error: "Não foi possível atualizar os preços agora" });
  }
});

app.post("/api/prices/refresh/scheduled", async (req, res) => {
  try {
    const result = await refreshWatchPrices({ force: false });
    res.json(result);
  } catch (err) {
    console.error("scheduled price refresh", err);
    res.status(500).json({ error: "Falha na varredura automática" });
  }
});

'''
    s = s.replace(anchor, routes + anchor)
p.write_text(s)

# index.html
p = Path('index.html')
s = p.read_text()
if 'price-radar.js' not in s:
    s = s.replace('<script src="app.js"></script>', '<script src="app.js"></script>\n<script src="price-radar.js"></script>')
p.write_text(s)

# service worker
p = Path('sw.js')
s = p.read_text()
s = re.sub(r"const CACHE = 'ninho-[^']+';", "const CACHE = 'ninho-v22-price-radar';", s)
if "'./price-radar.js'" not in s:
    s = s.replace("'./app.js'", "'./app.js', './price-radar.js'")
p.write_text(s)
