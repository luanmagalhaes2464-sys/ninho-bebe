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

app.get("/styles.css", (_req, res) => {
  res.type("text/css");
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "styles.css"));
});
app.get("/app.js", (_req, res) => {
  res.type("application/javascript");
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "app.js"));
});
app.get("/manifest.webmanifest", (_req, res) => {
  res.type("application/manifest+json");
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "manifest.webmanifest"));
});
app.get("/sw.js", (_req, res) => {
  res.type("application/javascript");
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "sw.js"));
});
app.use(express.static(__dirname, { etag: true, maxAge: 0, fallthrough: true }));

function safeEqual(a = "", b = "") {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function getRole(req) {
  const editorExpected = process.env.NINHO_PIN || "";
  const visitorExpected = process.env.NINHO_VISITOR_PIN || "";
  const editorReceived = req.get("x-ninho-pin") || "";
  const visitorReceived = req.get("x-ninho-viewer-pin") || "";

  if (!editorExpected && !visitorExpected) return "editor";
  if (editorExpected && editorReceived && safeEqual(editorReceived, editorExpected)) return "editor";
  if (visitorExpected && visitorReceived && safeEqual(visitorReceived, visitorExpected)) return "viewer";
  return "anonymous";
}

function requireReadAccess(req, res, next) {
  const role = getRole(req);
  if (role === "anonymous") return res.status(401).json({ error: "Acesso negado" });
  req.ninhoRole = role;
  next();
}

function requireEditorAccess(req, res, next) {
  const role = getRole(req);
  if (role !== "editor") return res.status(401).json({ error: "Acesso somente para edição" });
  req.ninhoRole = role;
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
  res.json({
    database: databaseEnabled(),
    ai: Boolean(process.env.OPENAI_API_KEY),
    ownerPinRequired: Boolean(process.env.NINHO_PIN),
    visitorPinEnabled: Boolean(process.env.NINHO_VISITOR_PIN)
  });
});

app.get("/api/state", requireReadAccess, async (req, res) => {
  try {
    if (!databaseEnabled()) return res.json({ state: null, database: false, role: req.ninhoRole });
    const stored = await getState();
    res.json({ state: stored?.data ?? null, updatedAt: stored?.updatedAt ?? null, database: true, role: req.ninhoRole });
  } catch (err) {
    console.error("get state", err);
    res.status(500).json({ error: "Não foi possível carregar os dados" });
  }
});

app.put("/api/state", requireEditorAccess, async (req, res) => {
  try {
    if (!databaseEnabled()) return res.status(503).json({ error: "DATABASE_URL não configurada" });
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ error: "Estado inválido" });
    }
    const updatedAt = await putState(req.body);
    res.json({ ok: true, updatedAt, role: req.ninhoRole });
  } catch (err) {
    console.error("put state", err);
    res.status(500).json({ error: "Não foi possível salvar os dados" });
  }
});

app.post("/api/agent", requireReadAccess, async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("agent: OPENAI_API_KEY ausente");
      return res.status(503).json({ error: "IA não configurada no servidor" });
    }
    const { question = "", history = [], context = {} } = req.body || {};
    if (!String(question).trim()) return res.status(400).json({ error: "Pergunta vazia" });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const safeHistory = Array.isArray(history) ? history.slice(-8).map(m => ({
      role: m?.role === "assistant" ? "assistant" : "user",
      content: String(m?.content || "").slice(0, 3000)
    })) : [];
    const contextText = JSON.stringify(context).slice(0, 55000);

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      instructions: "Você é o Agente Ninho, assistente inteligente da família de Ian. Responda em português brasileiro, de forma natural, direta e útil. Você não está limitado a perguntas predefinidas: responda perguntas livres sobre Ian, Isabela, gestação, FIV, enxoval, fraldas, vacinas, consultas, alimentação do bebê, desenvolvimento, orçamento e dados cadastrados no Ninho. Use primeiro os dados do contexto do aplicativo. Não invente itens, compras, consultas, exames, vacinas aplicadas ou valores que não estejam no contexto. Se a pergunta for geral e não depender dos dados cadastrados, use conhecimento geral. Para saúde, ajude a entender e dê orientação prudente, mas não faça diagnóstico nem substitua obstetra/pediatra. Sinais de urgência devem receber orientação adequada, sem alarmismo. Lembre que Ian nasce em 2027 e calendários de vacinação podem mudar. Dados fixos: o bebê se chama Ian e é menino; a gestante é Isabela; FIV com transferência de embrião D5 em 31/07/2026; previsão de parto 18/04/2027. Nunca revele nem solicite PIN, chave de API, DATABASE_URL ou outros segredos.",
      input: [
        ...safeHistory.map(m => ({ role: m.role, content: [{ type: "input_text", text: m.content }] })),
        { role: "user", content: [{ type: "input_text", text: "CONTEXTO ATUAL DO NINHO:\n" + contextText + "\n\nPERGUNTA:\n" + String(question).slice(0,5000) }] }
      ]
    });
    res.json({ answer: response.output_text || "Não consegui formular uma resposta agora.", role: req.ninhoRole });
  } catch (err) {
    console.error("agent error", { status: err?.status, code: err?.code, type: err?.type, message: err?.message });
    res.status(500).json({ error: "A IA não conseguiu responder agora" });
  }
});

app.post("/api/medical-explain", requireReadAccess, async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: "OPENAI_API_KEY não configurada" });
    }
    const { notes = "", attachment = null, subject = "", type = "", date = "" } = req.body || {};
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const content = [{
      type: "input_text",
      text: `Você é o Agente Ninho. Explique este registro médico em português brasileiro simples. Contexto: gestação por FIV; o sistema acompanha Isabela e o bebê Ian. Registro de: ${subject || "não informado"}. Tipo: ${type || "não informado"}. Data: ${date || "não informada"}. Texto escrito: ${notes || "sem texto"}.\n\nRegras: descreva somente o que o documento/imagem mostra ou diz. Traduza termos médicos sem inventar. Não dê diagnóstico e não diga que um achado é normal ou anormal sem base explícita no laudo. Diferencie o texto do documento da sua explicação. Se a imagem estiver ilegível, diga isso. Se houver algo potencialmente urgente claramente descrito, oriente contato com a equipe assistente, sem alarmismo. Seja breve e organizado.`
    }];

    if (attachment?.data && attachment?.type?.startsWith("image/")) {
      content.push({ type: "input_image", image_url: attachment.data, detail: "high" });
    } else if (attachment?.data && attachment?.type === "application/pdf") {
      content.push({ type: "input_file", file_data: String(attachment.data).split(",").pop(), filename: attachment.name || "documento.pdf" });
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      input: [{ role: "user", content }]
    });
    res.json({ explanation: response.output_text || "Não foi possível produzir uma explicação.", role: req.ninhoRole });
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
    console.log("Agente IA configurado:", Boolean(process.env.OPENAI_API_KEY), "modelo:", process.env.OPENAI_MODEL || "gpt-5");
  } catch (err) {
    console.error("Falha ao preparar Neon:", err);
  }
});
