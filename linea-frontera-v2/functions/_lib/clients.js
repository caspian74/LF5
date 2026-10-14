// Ayudas compartidas sobre fichas de cliente: lectura, guardado, llave del sitio web, anuncios y la vista del portal.
import { S, getContent } from './content.js';
import { now, randomHex, sha256hex, safeEqual, localDay } from './util.js';

export const parse = (s, d) => { try { return JSON.parse(s); } catch { return d; } };
export const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, business: u.business, phone: u.phone, role: u.role });

export async function clientFor(env, userId) {
  return env.DB.prepare('SELECT * FROM clients WHERE user_id = ? ORDER BY id LIMIT 1').bind(userId).first();
}
export async function saveClientData(env, id, data) {
  await env.DB.prepare('UPDATE clients SET data = ?, updated_at = ? WHERE id = ?').bind(JSON.stringify(S.sanitizeClientData(data)), now(), id).run();
}
export const clientData = (c) => S.sanitizeClientData(parse(c.data, {}));

/* ----- llave pública del sitio web de un cliente (va en el script t.js de su página) ----- */
let secretCache = null;
export async function siteSecret(env) {
  if (secretCache) return secretCache;
  let row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'site_secret'").first();
  if (!row) {
    await env.DB.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('site_secret', ?)").bind(randomHex(24)).run();
    row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'site_secret'").first();
  }
  return (secretCache = row.value);
}
export async function siteKey(env, id) {
  return `lf_${id}_${(await sha256hex(`site:${id}:${await siteSecret(env)}`)).slice(0, 10)}`;
}
/** Devuelve el id de cliente si la llave es auténtica; si no, 0. */
export async function clientIdFromKey(env, key) {
  const m = /^lf_(\d{1,9})_([0-9a-f]{10})$/.exec(String(key || ''));
  if (!m) return 0;
  const id = parseInt(m[1], 10);
  return safeEqual(await siteKey(env, id), m[0]) ? id : 0;
}

/* ----- avisos del admin para los clientes ----- */
export async function getAnnouncements(env) {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'announcements'").first();
  const list = row ? parse(row.value, []) : [];
  return Array.isArray(list) ? list : [];
}
export function cleanAnnouncements(list) {
  const lv = ['info', 'ok', 'warn'], au = ['all', 'web', 'marketing'];
  return (Array.isArray(list) ? list : []).slice(0, 10).map((a, i) => ({
    id: String(a.id || 'a' + i + Date.now().toString(36)).replace(/[^a-z0-9_-]/gi, '').slice(0, 30),
    text: String(a.text || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, 400),
    level: lv.includes(a.level) ? a.level : 'info',
    audience: au.includes(a.audience) ? a.audience : 'all',
    until: /^\d{4}-\d{2}-\d{2}$/.test(a.until) ? a.until : '',
  })).filter((a) => a.text);
}
async function announcementsFor(env, kinds) {
  const today = localDay();
  return (await getAnnouncements(env)).filter((a) => (!a.until || a.until >= today) && (a.audience === 'all' || (a.audience === 'web' && kinds.web) || (a.audience === 'marketing' && kinds.mkt)));
}

/** Ficha del cliente tal como la ve él (sin campos internos del admin). */
export async function clientOut(env, c, content) {
  if (!c) return null;
  const data = clientData(c);
  delete data.admin;
  const kinds = S.clientKinds(content, { plan: c.plan, data });
  return { id: c.id, name: c.name, business: c.business, email: c.email, phone: c.phone, plan: c.plan, status: c.status, updated_at: c.updated_at, billing: !!c.stripe_customer, data, kinds, siteKey: data.web.enabled ? await siteKey(env, c.id) : '' };
}

/** Lo que recibe el portal. Lo usan el cliente (/portal) y el admin ("ver como cliente"). */
export async function portalPayload(env, user, c) {
  const { content } = await getContent(env);
  const client = await clientOut(env, c, content);
  const uid = c ? c.user_id : user.id;
  const orders = c ? (await env.DB.prepare('SELECT id, package_id, package_name, amount, currency, status, method, created_at, paid_at FROM orders WHERE client_id = ? OR user_id = ? ORDER BY id DESC LIMIT 50').bind(c.id, uid ?? -1).all()).results
    : (await env.DB.prepare('SELECT id, package_id, package_name, amount, currency, status, method, created_at, paid_at FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 50').bind(user.id).all()).results;
  const tickets = (await env.DB.prepare('SELECT id, subject, status, updated_at FROM tickets WHERE user_id = ? OR client_id = ? ORDER BY updated_at DESC LIMIT 50').bind(uid ?? -1, c ? c.id : -1).all()).results;
  const kinds = client ? client.kinds : { web: false, mkt: true };
  return { ok: true, user: publicUser(user), client, orders, tickets, announcements: await announcementsFor(env, kinds), serverTime: now() };
}
