// Esquema de la base de datos con versiones. Se aplica solo la primera vez que llega una petición
// (y cada vez que se sube una versión nueva), así no hay que pegar SQL a mano en la consola de D1.
// Todo usa CREATE ... IF NOT EXISTS, por lo que es seguro repetirlo.
export const SCHEMA_VERSION = 2;

const V1 = [
  `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL DEFAULT '', business TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT 'client', pass_hash TEXT NOT NULL, salt TEXT NOT NULL, iters INTEGER NOT NULL DEFAULT 100000, disabled INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, last_login TEXT)`,
  `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_at TEXT NOT NULL, expires_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, name TEXT NOT NULL DEFAULT '', business TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', plan TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'onboarding', data TEXT NOT NULL DEFAULT '{}', claim_code TEXT, stripe_customer TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id)`,
  `CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, business TEXT NOT NULL DEFAULT '', whatsapp TEXT NOT NULL DEFAULT '', niche TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'nuevo', notes TEXT NOT NULL DEFAULT '', utm TEXT NOT NULL DEFAULT '{}', client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL, created_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`,
  `CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL, package_id TEXT NOT NULL, package_name TEXT NOT NULL, amount INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'MXN', status TEXT NOT NULL DEFAULT 'pendiente', method TEXT NOT NULL DEFAULT '', stripe_session TEXT, created_at TEXT NOT NULL, paid_at TEXT)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`,
  `CREATE TABLE IF NOT EXISTS tickets (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL, subject TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'abierto', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS ticket_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE, author_role TEXT NOT NULL, author_name TEXT NOT NULL DEFAULT '', body TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS content_versions (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, label TEXT NOT NULL DEFAULT '', author TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS rate_limits (key TEXT NOT NULL, ts INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_rl ON rate_limits(key, ts)`,
  `CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, action TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL)`,
];

// v2: páginas web de clientes (visitas y mensajes que llegan desde su sitio) + índices
const V2 = [
  `CREATE TABLE IF NOT EXISTS site_stats (client_id INTEGER NOT NULL, day TEXT NOT NULL, k TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (client_id, day, k))`,
  `CREATE TABLE IF NOT EXISTS site_leads (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER NOT NULL, name TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '', page TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'nuevo', created_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_site_leads_client ON site_leads(client_id, id)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_tickets_updated ON tickets(updated_at)`,
];

export const MIGRATIONS = [V1, V2];

let ready = null;
async function run(env) {
  let cur = 0;
  try {
    const r = await env.DB.prepare("SELECT value FROM settings WHERE key = 'schema_version'").first();
    cur = r ? parseInt(r.value, 10) || 0 : 0;
  } catch { cur = 0; }
  if (cur >= SCHEMA_VERSION) return;
  for (let i = 0; i < MIGRATIONS.length; i++) {
    if (i + 1 <= cur) continue;
    await env.DB.batch(MIGRATIONS[i].map((s) => env.DB.prepare(s)));
  }
  await env.DB.prepare("INSERT INTO settings (key, value) VALUES ('schema_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(String(SCHEMA_VERSION)).run();
}

/** Asegura que la base tenga las tablas al día. Se ejecuta una vez por instancia del servidor. */
export function ensureSchema(env) {
  if (!ready) ready = run(env).catch((e) => { ready = null; throw e; });
  return ready;
}

export function sqlText() { return MIGRATIONS.flat().map((s) => s + ';').join('\n'); }
