// Prueba: una base que solo tiene el esquema original (0001, pegado a mano en D1) se actualiza sola a la versión actual sin perder datos.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { ensureSchema } from '../functions/_lib/schema.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('  ✗', m); } else console.log('  ✓', m); };
const db = new DatabaseSync(':memory:'); db.exec('PRAGMA foreign_keys = ON;');
db.exec(fs.readFileSync(path.join(root, 'migrations/0001_init.sql'), 'utf8'));
db.prepare("INSERT INTO clients (name, business, plan, status, data, created_at, updated_at) VALUES ('Ana','Clínica','crecimiento','activo','{}','t','t')").run();
db.prepare("INSERT INTO leads (name, business, created_at) VALUES ('Luis','Taller','t')").run();
const DB = {
  prepare(sql) { const mk = (a) => ({ first: async () => db.prepare(sql).get(...a) ?? null, all: async () => ({ results: db.prepare(sql).all(...a) }), run: async () => { const r = db.prepare(sql).run(...a); return { meta: { last_row_id: Number(r.lastInsertRowid), changes: Number(r.changes) } }; } }); return { bind: (...a) => mk(a), ...mk([]) }; },
  async batch(st) { db.exec('BEGIN'); try { const o = []; for (const s of st) o.push(await s.run()); db.exec('COMMIT'); return o; } catch (e) { db.exec('ROLLBACK'); throw e; } },
};
const has = (t) => !!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(t);
ok(!has('site_stats') && !has('site_leads'), 'antes: sin tablas del módulo web');
await ensureSchema({ DB });
ok(has('site_stats') && has('site_leads'), 'después: tablas del módulo web creadas');
ok(db.prepare('SELECT COUNT(*) n FROM clients').get().n === 1 && db.prepare('SELECT COUNT(*) n FROM leads').get().n === 1, 'los datos existentes se conservan');
ok(db.prepare("SELECT value FROM settings WHERE key='schema_version'").get().value === '2', 'versión del esquema registrada');
await ensureSchema({ DB });
ok(true, 'segunda ejecución no falla');
// base completamente vacía
const db2 = new DatabaseSync(':memory:');
const DB2 = { prepare(sql) { const mk = (a) => ({ first: async () => db2.prepare(sql).get(...a) ?? null, all: async () => ({ results: db2.prepare(sql).all(...a) }), run: async () => { db2.prepare(sql).run(...a); return { meta: {} }; } }); return { bind: (...a) => mk(a), ...mk([]) }; }, async batch(st) { for (const s of st) await s.run(); } };
// ensureSchema memoiza por proceso: se prueba con un módulo nuevo
const mod = await import('../functions/_lib/schema.js?fresh=' + Date.now());
await mod.ensureSchema({ DB: DB2 });
ok(!!db2.prepare("SELECT 1 FROM sqlite_master WHERE name='users'").get() && !!db2.prepare("SELECT 1 FROM sqlite_master WHERE name='site_leads'").get(), 'base vacía: se crea todo desde cero');
console.log(fails ? `\n${fails} fallas` : '\ntodo bien'); process.exit(fails ? 1 : 0);
