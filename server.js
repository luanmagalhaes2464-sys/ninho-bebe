import express from "express";
import OpenAI from "openai";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { databaseEnabled, ensureSchema, getState, putState } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "12mb" }));
app.use(express.static(__dirname, { etag: true, maxAge: process.env.NODE_ENV === "production" ? "1h" : 0 }));

function safeEqual(a = "", b = "") {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function requirePin(req, res, next) {
  const expected = process.env.NINHO_PIN;
  if (!expected) return next();
  const received = req.get("x-ninho-pin") || "";
  if (!safeEqual(received, expected)) return res.status(401).json({ error: "PIN inválido" });
  next();
}

app.get("/api/health", async (_req, res) => {
  try {
    if (databaseEnabled()) await ensureSchema();
    res.json({ ok: true, database: databaseEnabled(), ai: Boolean(process.env.OPENAI_API_KEY), time: new Date().toISOString() });
  } catch (err) {
    console.error("health", err);
    res.status(503).json({ ok: false, database: databaseEnabled(), error: "Banco indisponível" });
  }
});

app.get("/api/config", (_req, res) => {
  res.json({ database: databaseEnabled(), ai: Boolean(process.env.OPENAI_API_KEY), pinRequired: Boolean(process.env.NINHO_PIN) });
});

app.get("/api/state", requirePin, async (_req, res) => {
  try {
    if (!databaseEnabled()) return res.json({ state: null, database: false });
    const stored = await getState();
    res.json({ state: stored?.data ?? null, updatedAt: stored?.updatedAt ?? null, database: true });
  } catch (err) {
    console.error("get state", err);
    res.status(500).json({ error: "Não foi possível carregar os dados" });
  }
});

app.put("/api/state", requirePin, async (req, res) => {
  try {
    if (!databaseEnabled()) return res.status(503).json({ error: "DATABASE_URL não configurada" });
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) return res.status(400).json({ error: "Estado inválido" });
    const updatedAt = await putState(req.body);
    res.json({ ok: true, updatedAt });
  } catch (err) {
    console.error("put state", err);
    res.status(500).json({ error: "Não foi possível salvar os dados" });
  }
});

app.post("/api/medical-explain", requirePin, async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: "OPENAI_API_KEY não configurada" });
    const { notes = "", attachment = null, subject = "", type = "", date = "" } = req.body || {};
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const content = [{
      type: "input_text",
      text: `Você é o Agente Ninho. Explique este registro médico em português brasileiro simples. Contexto: gestação por FIV; o sistema acompanha Isabela e o bebê Ian ou Luísa. Registro de: ${subject || "não informado"}. Tipo: ${type || "não informado"}. Data: ${date || "não informada"}. Texto escrito: ${notes || "sem texto"}.\n\nRegras: descreva somente o que o documento/imagem mostra ou diz. Traduza termos médicos sem inventar. Não dê diagnóstico e não diga que um achado é normal ou anormal sem base explícita no laudo. Diferencie o texto do documento da sua explicação. Se a imagem estiver ilegível, diga isso. Se houver algo potencialmente urgente claramente descrito, oriente contato com a equipe assistente, sem alarmismo. Seja breve e organizado.`
    }];
    if (attachment?.data && attachment?.type?.startsWith("image/")) content.push({ type: "input_image", image_url: attachment.data, detail: "high" });
    else if (attachment?.data && attachment?.type === "application/pdf") content.push({ type: "input_file", file_data: String(attachment.data).split(",").pop(), filename: attachment.name || "documento.pdf" });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      input: [{ role: "user", content }]
    });
    res.json({ explanation: response.output_text || "Não foi possível produzir uma explicação." });
  } catch (err) {
    console.error("medical explain", err);
    res.status(500).json({ error: "Não foi possível analisar o registro" });
  }
});

app.use((_req, res) => res.sendFile(path.join(__dirname, "index.html")));

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", async () => {
  try {
    if (databaseEnabled()) await ensureSchema();
    console.log(`Ninho rodando na porta ${port}`);
  } catch (err) {
    console.error("Falha ao preparar Neon:", err);
  }
});
