import { hex, safeEqual, now } from './util.js';
import { getContent, S } from './content.js';
const enc = new TextEncoder();

export async function stripeApi(env, path, params) {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') body.append(k, String(v));
  const r = await fetch('https://api.stripe.com/v1/' + path, { method: 'POST', headers: { authorization: 'Bearer ' + env.STRIPE_SECRET_KEY, 'content-type': 'application/x-www-form-urlencoded' }, body });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || 'stripe_error');
  return j;
}

export async function verifyStripeSignature(raw, header, secret, toleranceSec = 300) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  const t = parts.t, sig = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  if (!t || !sig.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > toleranceSec) return false;
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = hex(await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${raw}`)));
  return sig.some((s) => safeEqual(s, mac));
}

export async function markOrderPaid(env, orderId, extra = {}) {
  const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first();
  if (!order || order.status === 'pagado') return order;
  await env.DB.prepare("UPDATE orders SET status = 'pagado', paid_at = ?, stripe_session = COALESCE(?, stripe_session), method = COALESCE(NULLIF(?, ''), method) WHERE id = ?")
    .bind(now(), extra.session || null, extra.method || '', orderId).run();
  if (order.client_id) {
    const client = await env.DB.prepare('SELECT id, data, plan FROM clients WHERE id = ?').bind(order.client_id).first();
    if (client) {
      const isMaint = /-mant$/.test(order.package_id), pkgId = order.package_id.replace(/-mant$/, '');
      const { content } = await getContent(env);
      const pkg = S.packageOf(content, pkgId);
      let data = S.sanitizeClientData(parseJson(client.data));
      if (isMaint) {                       // mantenimiento de la página web
        data = S.webActivate(data, 'Pago confirmado. Mantenimiento activo.'); data.web.maintenance = true;
        data.web.timeline.unshift({ id: S.uid('l'), text: 'Mantenimiento mensual activado.', at: now() });
        await env.DB.prepare("UPDATE clients SET data = ?, status = 'activo', stripe_customer = COALESCE(?, stripe_customer), updated_at = ? WHERE id = ?").bind(JSON.stringify(S.sanitizeClientData(data)), extra.customer || null, now(), client.id).run();
      } else {
        let plan = pkgId;
        if (pkg && pkg.kind === 'unico') {
          data = S.webActivate(data, 'Pago confirmado. Proyecto de página web iniciado.');
          const cur = S.packageOf(content, client.plan);
          if (cur && cur.kind === 'mensual') plan = client.plan;     // no pisa un plan mensual que ya tenga
        }
        await env.DB.prepare("UPDATE clients SET plan = ?, status = 'activo', data = ?, stripe_customer = COALESCE(?, stripe_customer), updated_at = ? WHERE id = ?")
          .bind(plan, JSON.stringify(S.sanitizeClientData(data)), extra.customer || null, now(), client.id).run();
      }
    }
  }
  return order;
}
const parseJson = (s) => { try { return JSON.parse(s); } catch { return {}; } };
