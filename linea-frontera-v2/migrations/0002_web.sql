-- Referencia: el sitio aplica esto solo (functions/_lib/schema.js). No necesitas ejecutarlo a mano.
CREATE TABLE IF NOT EXISTS site_stats (client_id INTEGER NOT NULL, day TEXT NOT NULL, k TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (client_id, day, k));
CREATE TABLE IF NOT EXISTS site_leads (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER NOT NULL, name TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '', page TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'nuevo', created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_site_leads_client ON site_leads(client_id, id);
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_updated ON tickets(updated_at);
