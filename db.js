import { neon } from '@neondatabase/serverless';

let sqlClient = null;
let schemaReady = false;

function sql() {
  if (!process.env.DATABASE_URL) return null;
  if (!sqlClient) sqlClient = neon(process.env.DATABASE_URL);
  return sqlClient;
}

export function databaseEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

export async function ensureSchema() {
  const db = sql();
  if (!db || schemaReady) return;
  await db`
    CREATE TABLE IF NOT EXISTS ninho_state (
      id SMALLINT PRIMARY KEY CHECK (id = 1),
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  schemaReady = true;
}

export async function getState() {
  const db = sql();
  if (!db) return null;
  await ensureSchema();
  const rows = await db`SELECT data, updated_at FROM ninho_state WHERE id = 1`;
  if (!rows.length) return null;
  return { data: rows[0].data, updatedAt: rows[0].updated_at };
}

export async function putState(data) {
  const db = sql();
  if (!db) throw new Error('DATABASE_URL não configurada');
  await ensureSchema();
  const json = JSON.stringify(data ?? {});
  const rows = await db`
    INSERT INTO ninho_state (id, data, updated_at)
    VALUES (1, ${json}::jsonb, NOW())
    ON CONFLICT (id) DO UPDATE
      SET data = EXCLUDED.data, updated_at = NOW()
    RETURNING updated_at
  `;
  return rows[0]?.updated_at ?? null;
}
