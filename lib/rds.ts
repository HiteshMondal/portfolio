import { Pool } from 'pg';

let pool: Pool | undefined;
let ready: Promise<unknown> | undefined;
const db = () => (pool ??= new Pool({
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT ?? 5432), user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME ?? 'portfolio',
  ssl: { rejectUnauthorized: false }, // encrypted in transit; DB is in an isolated subnet reachable only from the app
  max: 3, connectionTimeoutMillis: 5000,
}));
const init = () => (ready ??= db().query(`CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`));

export async function saveMessage(m: { name: string; email: string; body: string }) {
  await init();
  await db().query('INSERT INTO messages (name, email, body) VALUES ($1,$2,$3)', [m.name, m.email, m.body]);
}
export async function listMessages(limit = 50) {
  await init();
  const r = await db().query<{ id: string; name: string; email: string; body: string; created_at: Date }>(
    'SELECT * FROM messages ORDER BY created_at DESC LIMIT $1', [limit]);
  return r.rows;
}
