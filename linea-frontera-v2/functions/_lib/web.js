// Página web del cliente: visitas y mensajes que llegan desde su sitio (público) y acciones del portal.
import { add, json, fail } from './router.js';
import { now, str, isEmail, int, rateLimit, getIp, localDay, daysAgoLocal, notify } from './util.js';
import { S } from './content.js';
import { clientFor, clientData, saveClientData, siteKey, clientIdFromKey } from './clients.js';

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400' };
const noContent = () => new Response(null, { status: 204, headers: CORS });
const BOT = /bot|crawl|spider|slurp|headless|preview|facebookexternalhit|lighthouse|pingdom|monitor/i;

export function device(ua) { return /iPad|Tablet/i.test(ua) ? 'tablet' : /Mobi|Android|iPhone/i.test(ua) ? 'movil' : 'escritorio'; }
export function cleanPath(p) {
  p = String(p || '/').split(/[?#]/)[0].toLowerCase().replace(/[^a-z0-9/_.\-%]/g, '').slice(0, 60);
  return p.startsWith('/') ? p : '/' + p;
}
export function classifySource(ref, utm) {
  const u = String(utm || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20);
  if (u) return u;
  let h = '';
  try { h = new URL(ref).hostname.replace(/^www\./, ''); } catch { return 'directo'; }
  if (!h) return 'directo';
  if (/google\./.test(h)) return 'google';
  if (/(facebook|fb)\.com$|^l\.facebook|^m\.facebook/.test(h)) return 'facebook';
  if (/instagram\.com$/.test(h)) return 'instagram';
  if (/tiktok\.com$/.test(h)) return 'tiktok';
  if (/(wa\.me|whatsapp\.com)$/.test(h)) return 'whatsapp';
  if (/bing\.com$/.test(h)) return 'bing';
  return 'otro';
}

/* ---------- público: lo llama t.js desde la página del cliente ---------- */
add('OPTIONS', '/collect', 'ingest', async () => noContent());
add('OPTIONS', '/site-lead', 'ingest', async () => noContent());

add('POST', '/collect', 'ingest', async ({ req, env, body }) => {
  const b = await body(4096).catch(() => ({}));
  const id = await clientIdFromKey(env, b.k);
  const t = ['view', 'wa', 'call'].includes(b.t) ? b.t : null;
  if (!id || !t) return noContent();                         // sin pistas: nunca revelamos si una llave existe
  const ua = req.headers.get('user-agent') || '';
  if (BOT.test(ua)) return noContent();
  if (!(await rateLimit(env, 'col:' + getIp(req) + ':' + id, 240, 3600))) return noContent();
  const keys = t === 'view' ? ['view', 'src:' + classifySource(b.r, b.s), 'dev:' + device(ua), 'p:' + cleanPath(b.p)] : [t];
  const day = localDay();
  await env.DB.batch(keys.map((k) => env.DB.prepare('INSERT INTO site_stats (client_id, day, k, n) VALUES (?,?,?,1) ON CONFLICT(client_id, day, k) DO UPDATE SET n = n + 1').bind(id, day, k)));
  return noContent();
});

add('POST', '/site-lead', 'ingest', async ({ req, env, body, waitUntil }) => {
  const b = await body(8192).catch(() => ({}));
  if (b.website) return json({ ok: true }, 200, CORS);       // honeypot
  const id = await clientIdFromKey(env, b.k);
  if (!id) return json({ ok: false, error: 'bad_key' }, 404, CORS);
  if (!(await rateLimit(env, 'sl:' + getIp(req) + ':' + id, 6, 3600))) return json({ ok: false, error: 'rate_limited' }, 429, CORS);
  const name = str(b.name, 80), phone = str(b.phone, 25), email = str(b.email, 254).toLowerCase(), message = str(b.message, 800);
  if (!name || (!phone && !email)) return json({ ok: false, error: 'missing_fields' }, 400, CORS);
  if (email && !isEmail(email)) return json({ ok: false, error: 'bad_email' }, 400, CORS);
  const c = await env.DB.prepare('SELECT id, name, business, data FROM clients WHERE id = ?').bind(id).first();
  if (!c) return json({ ok: false, error: 'bad_key' }, 404, CORS);
  const data = clientData(c);
  if (!data.web.enabled) return json({ ok: false, error: 'web_not_enabled' }, 403, CORS);
  const r = await env.DB.prepare('INSERT INTO site_leads (client_id, name, phone, email, message, page, created_at) VALUES (?,?,?,?,?,?,?)').bind(id, name, phone, email, message, cleanPath(b.p), now()).run();
  await env.DB.prepare('INSERT INTO site_stats (client_id, day, k, n) VALUES (?,?,?,1) ON CONFLICT(client_id, day, k) DO UPDATE SET n = n + 1').bind(id, localDay(), 'form').run();
  notify(env, waitUntil, { subject: 'Nuevo mensaje en la página de ' + (c.business || c.name), text: `${name}\nTeléfono: ${phone || '—'}\nCorreo: ${email || '—'}\n${message}`, to: data.web.notifyEmail });
  return json({ ok: true, id: r.meta?.last_row_id ?? null }, 201, CORS);
});

/* ---------- estadísticas (las usan portal y admin) ---------- */
export async function siteStats(env, clientId, days) {
  days = Math.max(7, Math.min(90, days || 30));
  const since = daysAgoLocal(days - 1);
  const rows = (await env.DB.prepare('SELECT day, k, n FROM site_stats WHERE client_id = ? AND day >= ?').bind(clientId, since).all()).results;
  const series = {};
  for (let i = days - 1; i >= 0; i--) series[daysAgoLocal(i)] = { d: daysAgoLocal(i), view: 0, wa: 0, call: 0, form: 0 };
  const totals = { view: 0, wa: 0, call: 0, form: 0 }, src = {}, dev = {}, pages = {};
  for (const r of rows) {
    if (['view', 'wa', 'call', 'form'].includes(r.k)) { if (series[r.day]) series[r.day][r.k] += r.n; totals[r.k] += r.n; }
    else if (r.k.startsWith('src:')) src[r.k.slice(4)] = (src[r.k.slice(4)] || 0) + r.n;
    else if (r.k.startsWith('dev:')) dev[r.k.slice(4)] = (dev[r.k.slice(4)] || 0) + r.n;
    else if (r.k.startsWith('p:')) pages[r.k.slice(2)] = (pages[r.k.slice(2)] || 0) + r.n;
  }
  const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ k, n: v }));
  return { days, series: Object.values(series), totals, sources: top(src, 6), devices: top(dev, 3), pages: top(pages, 6) };
}
export async function siteLeads(env, clientId, limit = 50) {
  return (await env.DB.prepare('SELECT id, name, phone, email, message, page, status, created_at FROM site_leads WHERE client_id = ? ORDER BY id DESC LIMIT ?').bind(clientId, limit).all()).results;
}

/* ---------- portal del cliente ---------- */
async function webCtx(env, user) {
  const c = await clientFor(env, user.id);
  if (!c) return null;
  const data = clientData(c);
  return data.web.enabled ? { c, data } : null;
}

add('GET', '/portal/site', 'user', async ({ env, user, url }) => {
  const w = await webCtx(env, user); if (!w) return fail(403, 'web_not_enabled');
  const stats = await siteStats(env, w.c.id, int(url.searchParams.get('days'), 30));
  return json({ ok: true, ...stats, leads: await siteLeads(env, w.c.id), key: await siteKey(env, w.c.id) });
});
add('PATCH', '/portal/site-leads/:id', 'user', async ({ env, user, params, body }) => {
  const w = await webCtx(env, user); if (!w) return fail(403, 'web_not_enabled');
  const b = await body(); const status = b.status === 'atendido' ? 'atendido' : 'nuevo';
  await env.DB.prepare('UPDATE site_leads SET status = ? WHERE id = ? AND client_id = ?').bind(status, int(params.id), w.c.id).run();
  return json({ ok: true });
});
add('PUT', '/portal/web/brief', 'user', async ({ env, user, body }) => {
  const w = await webCtx(env, user); if (!w) return fail(403, 'web_not_enabled');
  const b = await body(32 * 1024);
  await saveClientData(env, w.c.id, S.webSetBrief(w.data, b.brief));
  return json({ ok: true });
});
add('POST', '/portal/web/change', 'user', async ({ env, user, body, waitUntil }) => {
  const w = await webCtx(env, user); if (!w) return fail(403, 'web_not_enabled');
  const b = await body(); const title = str(b.title, 120);
  if (!title) return fail(400, 'missing_fields');
  if (!(await rateLimit(env, 'wch:' + user.id, 20, 3600))) return fail(429, 'rate_limited');
  if (S.webPendingChanges(w.data) >= 10) return fail(400, 'too_many_pending');
  await saveClientData(env, w.c.id, S.webAddChange(w.data, { title, detail: str(b.detail, 1500), section: str(b.section, 60) }));
  notify(env, waitUntil, { subject: 'Solicitud de cambio: ' + (w.c.business || w.c.name), text: `${title}\n${str(b.detail, 500)}` });
  return json({ ok: true }, 201);
});
add('POST', '/portal/web/file', 'user', async ({ env, user, body }) => {
  const w = await webCtx(env, user); if (!w) return fail(403, 'web_not_enabled');
  const b = await body(); const title = str(b.title, 120), url = S.safeUrl(str(b.url, 600));
  if (!title || !url || !/^https:\/\//.test(url)) return fail(400, 'bad_url');
  await saveClientData(env, w.c.id, S.webAddFile(w.data, { title, url }, 'cliente'));
  return json({ ok: true }, 201);
});
add('DELETE', '/portal/web/file/:id', 'user', async ({ env, user, params }) => {
  const w = await webCtx(env, user); if (!w) return fail(403, 'web_not_enabled');
  await saveClientData(env, w.c.id, S.webRemoveFile(w.data, params.id, 'cliente'));
  return json({ ok: true });
});
