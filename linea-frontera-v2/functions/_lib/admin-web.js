// Panel admin: proyectos web, ver como cliente, buscador, avisos, pedidos/leads manuales y estado del sistema.
import { add, json, fail } from './router.js';
import { now, str, int, randomHex, audit, notify } from './util.js';
import { getContent, S } from './content.js';
import { clientData, saveClientData, portalPayload, siteKey, getAnnouncements, cleanAnnouncements, parse } from './clients.js';
import { siteStats, siteLeads } from './web.js';
import { markOrderPaid } from './stripe.js';
import { SCHEMA_VERSION } from './schema.js';

const all = async (env, sql, ...b) => (await env.DB.prepare(sql).bind(...b).all()).results;
const getClient = (env, id) => env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(int(id)).first();

/* ----- tablero de proyectos web ----- */
add('GET', '/admin/web', 'admin', async ({ env }) => {
  const rows = await all(env, 'SELECT id, name, business, phone, plan, status, data, updated_at FROM clients ORDER BY id DESC LIMIT 500');
  const projects = [];
  for (const c of rows) {
    const d = S.sanitizeClientData(parse(c.data, {}));
    if (!d.web.enabled) continue;
    projects.push({ id: c.id, name: c.name, business: c.business, phone: c.phone, plan: c.plan, status: c.status, stage: d.web.stage, dueDate: d.web.dueDate, url: d.web.url, previewUrl: d.web.previewUrl, domain: d.web.domain, domainStatus: d.web.domainStatus,
      maintenance: d.web.maintenance, brief: S.briefDone(d.web).pct, pending: S.webPendingChanges(d), updated_at: c.updated_at });
  }
  return json({ ok: true, projects });
});

/* ----- editar el proyecto web de un cliente (parcial) ----- */
add('PATCH', '/admin/clients/:id/web', 'admin', async ({ env, params, body, user }) => {
  const c = await getClient(env, params.id); if (!c) return fail(404, 'not_found');
  const b = await body(64 * 1024);
  let d = clientData(c);
  if (b.enabled === true) d = S.webActivate(d);
  else if (!d.web.enabled) return fail(400, 'web_not_enabled');
  if (b.enabled === false) d.web.enabled = false;
  if (b.stage) d = S.webSetStage(d, b.stage, b.stageNote ? str(b.stageNote, 200) : '');
  for (const k of ['dueDate', 'url', 'previewUrl', 'domain', 'domainStatus', 'domainRenew', 'ssl', 'maintenance', 'changesIncluded', 'notifyEmail']) if (k in b) d.web[k] = b[k];
  if (b.note) d.web.timeline.unshift({ id: S.uid('l'), text: str(b.note, 300), at: new Date().toISOString() });
  if (b.change && b.change.id) {
    const ch = d.web.changes.find((x) => x.id === b.change.id);
    if (ch) { if (b.change.status) ch.status = b.change.status; if ('reply' in b.change) ch.reply = str(b.change.reply, 1000); }
  }
  if (b.addFile) d = S.webAddFile(d, b.addFile, 'equipo');
  if (b.removeFile) d = S.webRemoveFile(d, b.removeFile, 'equipo');
  await saveClientData(env, c.id, d);
  await audit(env, user.id, 'web_update', String(c.id));
  return json({ ok: true, web: clientData({ data: JSON.stringify(d) }).web });
});

/* ----- visitas y mensajes del sitio de un cliente ----- */
add('GET', '/admin/clients/:id/site', 'admin', async ({ env, params, url }) => {
  const c = await getClient(env, params.id); if (!c) return fail(404, 'not_found');
  return json({ ok: true, key: await siteKey(env, c.id), ...(await siteStats(env, c.id, int(url.searchParams.get('days'), 30))), leads: await siteLeads(env, c.id, 100) });
});
add('PATCH', '/admin/site-leads/:id', 'admin', async ({ env, params, body }) => {
  const b = await body();
  await env.DB.prepare('UPDATE site_leads SET status = ? WHERE id = ?').bind(b.status === 'atendido' ? 'atendido' : 'nuevo', int(params.id)).run();
  return json({ ok: true });
});

/* ----- "ver como cliente" ----- */
add('GET', '/admin/clients/:id/portal', 'admin', async ({ env, params, user }) => {
  const c = await getClient(env, params.id); if (!c) return fail(404, 'not_found');
  const p = await portalPayload(env, user, c);
  const stats = p.client && p.client.data.web.enabled ? await siteStats(env, c.id, 30) : null;
  return json({ ...p, readonly: true, site: stats ? { ...stats, leads: await siteLeads(env, c.id), key: p.client.siteKey } : null });
});

/* ----- buscador global (Ctrl+K) ----- */
add('GET', '/admin/search', 'admin', async ({ env, url }) => {
  const q = str(url.searchParams.get('q'), 60).replace(/[%_]/g, '');
  if (q.length < 2) return json({ ok: true, results: [] });
  const like = '%' + q + '%', out = [];
  for (const c of await all(env, 'SELECT id, name, business, phone, email FROM clients WHERE name LIKE ?1 OR business LIKE ?1 OR phone LIKE ?1 OR email LIKE ?1 ORDER BY id DESC LIMIT 6', like)) out.push({ type: 'cliente', id: c.id, title: c.business || c.name, sub: c.name + (c.phone ? ' · ' + c.phone : '') });
  for (const l of await all(env, 'SELECT id, name, business, whatsapp, status FROM leads WHERE name LIKE ?1 OR business LIKE ?1 OR whatsapp LIKE ?1 ORDER BY id DESC LIMIT 6', like)) out.push({ type: 'lead', id: l.id, title: l.business || l.name, sub: l.name + ' · ' + l.status });
  for (const t of await all(env, 'SELECT id, subject, status FROM tickets WHERE subject LIKE ?1 ORDER BY id DESC LIMIT 4', like)) out.push({ type: 'ticket', id: t.id, title: t.subject, sub: t.status });
  for (const u of await all(env, 'SELECT id, email, name FROM users WHERE email LIKE ?1 OR name LIKE ?1 ORDER BY id DESC LIMIT 4', like)) out.push({ type: 'usuario', id: u.id, title: u.email, sub: u.name });
  return json({ ok: true, results: out });
});

/* ----- avisos para clientes ----- */
add('GET', '/admin/announcements', 'admin', async ({ env }) => json({ ok: true, announcements: await getAnnouncements(env) }));
add('PUT', '/admin/announcements', 'admin', async ({ env, body, user }) => {
  const b = await body(32 * 1024), list = cleanAnnouncements(b.announcements);
  await env.DB.prepare("INSERT INTO settings (key, value) VALUES ('announcements', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(JSON.stringify(list)).run();
  await audit(env, user.id, 'announcements', String(list.length));
  return json({ ok: true, announcements: list });
});

/* ----- pedidos y leads manuales ----- */
add('POST', '/admin/orders', 'admin', async ({ env, body, user }) => {
  const b = await body(); const c = await getClient(env, b.clientId); if (!c) return fail(404, 'not_found');
  const { content } = await getContent(env);
  const pk = S.packageOf(content, str(b.packageId, 40));
  const amount = Math.round(Number(b.amount != null && b.amount !== '' ? b.amount : pk && pk.price));
  const name = str(b.packageName, 100) || (pk && pk.name) || 'Pago manual';
  if (!(amount > 0) || amount > 1000000) return fail(400, 'bad_amount');
  const r = await env.DB.prepare("INSERT INTO orders (user_id, client_id, package_id, package_name, amount, currency, status, method, created_at) VALUES (?,?,?,?,?, 'MXN', 'pendiente', 'manual', ?)")
    .bind(c.user_id ?? null, c.id, str(b.packageId, 40).replace(/[^a-z0-9_-]/gi, '') || 'manual', name, amount, now()).run();
  if (b.paid) await markOrderPaid(env, r.meta.last_row_id, { method: str(b.method, 20) || 'manual' });
  await audit(env, user.id, 'order_create', String(r.meta.last_row_id));
  return json({ ok: true, id: r.meta.last_row_id }, 201);
});
add('POST', '/admin/leads', 'admin', async ({ env, body, user }) => {
  const b = await body(); const name = str(b.name, 80);
  if (!name) return fail(400, 'missing_name');
  const r = await env.DB.prepare('INSERT INTO leads (name, business, whatsapp, niche, message, utm, created_at) VALUES (?,?,?,?,?,?,?)')
    .bind(name, str(b.business, 100) || name, S.normalizeWhatsApp(str(b.whatsapp, 25)) || str(b.whatsapp, 20), str(b.niche, 80), str(b.message, 600), JSON.stringify({ source: 'manual' }), now()).run();
  await audit(env, user.id, 'lead_create', String(r.meta.last_row_id));
  return json({ ok: true, id: r.meta.last_row_id }, 201);
});

/* ----- estado del sistema ----- */
add('GET', '/admin/system', 'admin', async ({ env }) => {
  const cnt = async (t) => (await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${t}`).first()).n;
  return json({ ok: true, schema: SCHEMA_VERSION, stripe: !!env.STRIPE_SECRET_KEY, webhook: !!env.STRIPE_WEBHOOK_SECRET, turnstile: !!env.TURNSTILE_SECRET,
    email: !!env.RESEND_API_KEY, notifyEmail: !!env.NOTIFY_EMAIL, notifyWebhook: !!env.NOTIFY_WEBHOOK,
    rows: { clients: await cnt('clients'), leads: await cnt('leads'), orders: await cnt('orders'), site_leads: await cnt('site_leads'), site_stats: await cnt('site_stats') } });
});
add('POST', '/admin/system/test-notify', 'admin', async ({ env, waitUntil }) => {
  const r = notify(env, waitUntil, { subject: 'Prueba de avisos · Línea Frontera', text: 'Si lees esto, los avisos funcionan.' });
  return json({ ok: true, ...r });
});
