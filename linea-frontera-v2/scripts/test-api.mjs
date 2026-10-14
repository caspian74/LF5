// Pruebas de humo de la API contra el servidor local: node scripts/test-api.mjs [base]
import crypto from 'node:crypto';
const base = process.argv[2] || 'http://localhost:8788';
let pass = 0, failed = 0;
const ok = (c, m) => { if (c) pass++; else { failed++; console.log('  ✗', m); } };
function client() {
  let cookie = '';
  return async (method, path, body, extra = {}) => {
    const r = await fetch(base + '/api' + path, { method, headers: { 'content-type': 'application/json', 'x-lf': '1', origin: base, ...(cookie ? { cookie } : {}), ...extra }, body: body ? JSON.stringify(body) : undefined });
    const sc = r.headers.getSetCookie?.()[0]; if (sc) cookie = sc.split(';')[0];
    const ct = r.headers.get('content-type') || ''; return { status: r.status, data: ct.includes('json') ? await r.json() : await r.text(), headers: r.headers };
  };
}
const anon = client(), user = client(), admin = client(), rnd = crypto.randomBytes(3).toString('hex');

let r = await anon('GET', '/health'); ok(r.data.ok, 'health');
r = await anon('POST', '/lead', { name: 'Ana', business: 'Clínica Sol', whatsapp: '664 123 4567', consent: true, utm: { utm_source: 'ig' } }); ok(r.status === 201, 'lead creado ' + r.status);
r = await anon('POST', '/lead', { name: 'Ana', business: 'X', whatsapp: '12', consent: true }); ok(r.status === 400, 'whatsapp inválido rechazado');
r = await anon('POST', '/lead', { name: 'Ana', business: 'X', whatsapp: '6641234567' }); ok(r.status === 400, 'sin consentimiento rechazado');
r = await anon('POST', '/lead', { name: 'Bot', business: 'X', whatsapp: '6641234567', consent: true, website: 'spam' }); ok(r.status === 200 && !r.data.id, 'honeypot');
r = await fetch(base + '/api/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }); ok(r.status === 403, 'CSRF sin cabecera X-LF');
r = await fetch(base + '/api/lead', { method: 'POST', headers: { 'content-type': 'application/json', 'x-lf': '1', origin: 'https://evil.example' }, body: '{}' }); ok(r.status === 403, 'CSRF con origen ajeno');

r = await user('POST', '/auth/register', { name: 'Cliente', email: `c${rnd}@ejemplo.com`, password: 'corta' }); ok(r.status === 400, 'password débil');
r = await user('POST', '/auth/register', { name: 'Cliente', email: `c${rnd}@ejemplo.com`, password: 'una-clave-larga-1', business: 'Dental Sol' }); ok(r.status === 201 && r.data.user.role === 'client', 'registro');
r = await user('POST', '/auth/register', { name: 'Otro', email: `c${rnd}@ejemplo.com`, password: 'una-clave-larga-1' }); ok(r.status === 409, 'correo duplicado');
r = await user('GET', '/portal'); ok(r.data.client && r.data.client.status === 'onboarding' && r.data.client.data.campaigns.length === 0, 'portal vacío');
r = await user('GET', '/admin/overview'); ok(r.status === 403, 'cliente no accede a admin');
r = await anon('GET', '/portal'); ok(r.status === 401, 'portal exige sesión');
r = await user('POST', '/checkout', { packageId: 'crecimiento' }); ok(r.data.manual && r.data.whatsapp.includes('wa.me/525632960874'), 'checkout manual → WhatsApp');
const orderId = r.data.orderId;
r = await user('POST', '/checkout', { packageId: 'nope' }); ok(r.status === 404, 'paquete inexistente');
r = await user('POST', '/tickets', { subject: 'Duda', body: 'Hola, ¿cómo apruebo mi calendario?' }); ok(r.status === 201, 'ticket');
const tid = r.data.id;

r = await admin('POST', '/auth/setup-admin', { token: 'mal', email: 'admin@ejemplo.com', password: 'clave-admin-larga' }); ok(r.status === 403, 'setup con token malo');
r = await admin('POST', '/auth/setup-admin', { token: 'dev-setup-token', email: 'admin@ejemplo.com', name: 'Admin', password: 'clave-admin-larga' }); ok(r.status === 201, 'setup admin');
r = await anon('POST', '/auth/setup-admin', { token: 'dev-setup-token', email: 'otro@ejemplo.com', password: 'clave-admin-larga' }); ok(r.status === 403, 'setup solo una vez');
r = await admin('GET', '/admin/overview'); ok(r.data.counts.users >= 2 && r.data.counts.leadsTotal >= 1 && r.data.leadSeries.length === 14, 'overview');
r = await admin('GET', '/admin/clients'); const c = r.data.clients.find((x) => x.email === `c${rnd}@ejemplo.com`); ok(!!c, 'admin ve cuentas');
r = await admin('GET', '/admin/clients/' + c.id); const full = r.data.client;
const ex = { ...full.data, campaigns: [{ name: '<img src=x onerror=alert(1)>', channel: 'Meta', status: 'activa', budget: 1000, spent: 300, leads: 20, sales: 4, revenue: 6000 }], series: [{ date: '2026-10-01', spend: 100, leads: 5, sales: 1, revenue: 1500 }], content: [{ id: 'k1', title: 'Reel 1', type: 'Reel', status: 'por aprobar', date: '2026-10-12' }], seo: { rankings: [{ kw: 'dentista', pos: 4, prev: 8 }], gbp: { views: 10 } } };
r = await admin('PUT', '/admin/clients/' + c.id, { ...full, status: 'activo', plan: 'crecimiento', data: ex }); ok(r.data.ok, 'admin edita cliente');
r = await user('GET', '/portal'); ok(r.data.client.data.campaigns[0].leads === 20 && r.data.client.status === 'activo', 'cliente ve cambios del admin');
r = await user('POST', '/portal/content', { id: 'k1', status: 'aprobado' }); ok(r.data.ok, 'cliente aprueba contenido');
r = await user('GET', '/portal'); ok(r.data.client.data.content[0].status === 'aprobado', 'aprobación guardada');
r = await admin('PATCH', '/admin/orders/' + orderId, { status: 'pagado' }); ok(r.data.ok, 'admin marca pagado');
r = await user('GET', '/portal'); ok(r.data.orders[0].status === 'pagado' && r.data.client.plan === 'crecimiento', 'plan activado');
r = await admin('POST', '/admin/tickets/' + tid + '/reply', { body: 'Entra a Contenido y presiona Aprobar.', status: 'resuelto' }); ok(r.data.ok, 'admin responde ticket');
r = await user('GET', '/tickets/' + tid); ok(r.data.messages.length === 2 && r.data.ticket.status === 'resuelto', 'cliente ve respuesta');
r = await admin('GET', '/admin/overview'); ok(r.data.mrr === 9900, 'MRR calculado ' + r.data.mrr);

r = await admin('GET', '/admin/content'); const content = r.data.content;
content.hero.title = 'Título <script>alert(1)</script> ||nuevo||'; content.theme.accent = 'javascript:1'; content.packages.items.find((p) => p.id === 'arranque').price = 5100; content.packages.items.find((p) => p.id === 'arranque').paymentLink = 'javascript:alert(1)';
r = await admin('PUT', '/admin/content', { content, label: 'prueba' }); ok(r.data.ok, 'guardar contenido');
r = await anon('GET', '/content'); ok(r.data.content.hero.title.includes('nuevo') && r.data.content.theme.accent === '#FF3B5C' && r.data.content.packages.items.find((p) => p.id === 'arranque').paymentLink === '', 'contenido saneado y público');
r = await user('POST', '/checkout', { packageId: 'arranque' }); ok(r.data.whatsapp.includes(encodeURIComponent('$5,100')), 'checkout usa precio del servidor');
r = await user('PUT', '/admin/content', { content }); ok(r.status === 405 || r.status === 403, 'cliente no edita sitio');
r = await admin('GET', '/admin/versions'); ok(r.data.versions.length === 1, 'versión guardada');
r = await admin('POST', '/admin/versions/' + r.data.versions[0].id + '/restore'); ok(r.data.ok, 'restaurar versión');
r = await admin('GET', '/admin/export/leads'); ok(typeof r.data === 'string' && r.data.includes('Clínica Sol'), 'exportar CSV');
r = await admin('POST', '/admin/clients', { name: 'Manual', business: 'Taquería', example: true }); ok(r.status === 201 && r.data.claimCode, 'admin crea cliente sin cuenta');
const code = r.data.claimCode;
r = await user('POST', '/portal/claim', { code }); ok(r.data.ok, 'cliente reclama cuenta con código');
r = await user('POST', '/portal/claim', { code }); ok(r.status === 404, 'código de un solo uso');
r = await user('GET', '/portal'); ok(r.data.client.business === 'Taquería' && r.data.client.data.campaigns.length === 3, 'datos del cliente reclamado');

// Stripe webhook
const secret = 'whsec_test';
r = await anon('POST', '/stripe/webhook', { type: 'x' }); ok(r.status === 400, 'webhook sin firma rechazado');
r = await user('POST', '/checkout', { packageId: 'dominancia' }); const oid2 = r.data.orderId;
const payload = JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: 'cs_test', customer: 'cus_1', status: 'complete', payment_status: 'paid', client_reference_id: String(oid2), metadata: { order_id: String(oid2) } } } });
const sign = (t) => crypto.createHmac('sha256', secret).update(t + '.' + payload).digest('hex');
let t = Math.floor(Date.now() / 1000);
let w = await fetch(base + '/api/stripe/webhook', { method: 'POST', headers: { 'stripe-signature': `t=${t},v1=${'0'.repeat(64)}` }, body: payload }); ok(w.status === 400, 'webhook firma falsa');
w = await fetch(base + '/api/stripe/webhook', { method: 'POST', headers: { 'stripe-signature': `t=${t - 4000},v1=${sign(t - 4000)}` }, body: payload }); ok(w.status === 400, 'webhook firma vieja');
w = await fetch(base + '/api/stripe/webhook', { method: 'POST', headers: { 'stripe-signature': `t=${t},v1=${sign(t)}` }, body: payload }); ok(w.status === 200, 'webhook firma válida');
r = await user('GET', '/portal'); ok(r.data.orders.find((o) => o.id === oid2).status === 'pagado' && r.data.client.plan === 'dominancia' && r.data.client.billing, 'webhook activa plan');


// ---- Página web: compra única, panel, visitas y mensajes del sitio ----
const wuser = client(), wrnd = crypto.randomBytes(3).toString('hex');
r = await wuser('POST', '/auth/register', { name: 'Dra. Web', email: `w${wrnd}@ejemplo.com`, password: 'una-clave-larga-1', business: 'Clínica Web' }); ok(r.status === 201, 'registro cliente web');
r = await wuser('POST', '/checkout', { packageId: 'sitio' }); ok(r.data.manual && decodeURIComponent(r.data.whatsapp).includes('5,900') && /pago único/i.test(decodeURIComponent(r.data.whatsapp)), 'checkout sitio: precio y pago único');
const woid = r.data.orderId;
r = await wuser('POST', '/checkout', { packageId: 'sitio', addon: 'maint' }); ok(r.data.manual && decodeURIComponent(r.data.whatsapp).includes('490'), 'checkout mantenimiento $490');
r = await wuser('GET', '/portal/site'); ok(r.status === 403, 'portal/site cerrado sin proyecto web');
r = await admin('PATCH', '/admin/orders/' + woid, { status: 'pagado' }); ok(r.data.ok, 'admin marca pagado el sitio');
r = await wuser('GET', '/portal'); ok(r.data.client.data.web.enabled && r.data.client.kinds.web && !r.data.client.kinds.mkt && r.data.client.siteKey.startsWith('lf_') && !r.data.client.data.admin, 'proyecto web activado, sin datos internos');
const wid = r.data.client.id, skey = r.data.client.siteKey;
r = await wuser('PUT', '/portal/web/brief', { brief: { about: 'Clínica dental familiar', whatsapp: '6641234567' } }); ok(r.data.ok, 'cliente llena brief');
r = await wuser('POST', '/portal/web/change', { title: 'Cambiar foto del inicio', detail: 'Usar la nueva' }); ok(r.status === 201, 'cliente pide cambio');
r = await wuser('POST', '/portal/web/file', { title: 'Logo', url: 'javascript:alert(1)' }); ok(r.status === 400, 'archivo con javascript: rechazado');
r = await wuser('POST', '/portal/web/file', { title: 'Logo', url: 'https://drive.google.com/x' }); ok(r.status === 201, 'archivo https aceptado');
r = await wuser('GET', '/portal'); ok(r.data.client.data.web.brief.about.includes('dental') && r.data.client.data.web.changes.length === 1 && r.data.client.data.web.files.length === 1, 'brief, cambio y archivo guardados');
r = await admin('PATCH', '/admin/clients/' + wid + '/web', { stage: 'diseno', note: 'Primer diseño listo', domain: 'clinicaweb.mx' }); ok(r.data.ok && r.data.web.stage === 'diseno' && r.data.web.domain === 'clinicaweb.mx', 'admin avanza etapa');
const chId = (await wuser('GET', '/portal')).data.client.data.web.changes[0].id;
r = await admin('PATCH', '/admin/clients/' + wid + '/web', { change: { id: chId, status: 'lista', reply: 'Hecho' } }); ok(r.data.web.changes[0].status === 'lista' && r.data.web.changes[0].reply === 'Hecho', 'admin responde cambio');
r = await admin('GET', '/admin/web'); ok(r.data.projects.some((p) => p.id === wid && p.stage === 'diseno'), 'tablero de proyectos web');

// llave del sitio + tracking público (sin cookies ni X-LF, desde otro origen)
const pub = (path, body, ua = 'Mozilla/5.0 (iPhone; Mobile)') => fetch(base + '/api' + path, { method: 'POST', headers: { 'content-type': 'text/plain', origin: 'https://clinicaweb.mx', 'user-agent': ua }, body: JSON.stringify(body) });
let pr = await pub('/collect', { k: skey, t: 'view', p: '/', r: 'https://www.google.com/' }); ok(pr.status === 204 && pr.headers.get('access-control-allow-origin') === '*', 'collect view 204 + CORS');
await pub('/collect', { k: skey, t: 'view', p: '/', r: '', s: 'facebook' });
await pub('/collect', { k: skey, t: 'wa' });
pr = await pub('/collect', { k: skey, t: 'view' }, 'Googlebot/2.1'); ok(pr.status === 204, 'bots ignorados');
pr = await pub('/collect', { k: 'lf_' + wid + '_0000000000', t: 'view' }); ok(pr.status === 204, 'llave falsa no revela nada');
pr = await fetch(base + '/api/collect', { method: 'OPTIONS', headers: { origin: 'https://x.mx' } }); ok(pr.status === 204 && pr.headers.get('access-control-allow-origin') === '*', 'preflight CORS');
pr = await pub('/site-lead', { k: skey, name: 'Paciente Uno', phone: '6649998888', message: 'Quiero cita', p: '/' }); ok(pr.status === 201, 'mensaje del sitio recibido');
pr = await pub('/site-lead', { k: skey, name: 'Spam', phone: '1', website: 'x' }); ok(pr.status === 200, 'site-lead honeypot');
pr = await pub('/site-lead', { k: 'lf_1_bad', name: 'X', phone: '6641111111' }); ok(pr.status === 404, 'site-lead llave inválida');
pr = await pub('/site-lead', { k: skey, name: 'Sin contacto' }); ok(pr.status === 400, 'site-lead sin contacto');
r = await wuser('GET', '/portal/site'); ok(r.data.totals.view === 2 && r.data.totals.wa === 1 && r.data.totals.form === 1 && r.data.leads.length === 1 && r.data.sources.some((x) => x.k === 'google') && r.data.sources.some((x) => x.k === 'facebook') && r.data.devices[0].k === 'movil', 'estadísticas del sitio ' + JSON.stringify(r.data.totals));
r = await wuser('PATCH', '/portal/site-leads/' + r.data.leads[0].id, { status: 'atendido' }); ok(r.data.ok, 'marcar mensaje atendido');
const other = client(); await other('POST', '/auth/register', { name: 'Otro', email: `o${wrnd}@ejemplo.com`, password: 'una-clave-larga-1' });
r = await other('GET', '/portal/site'); ok(r.status === 403, 'otro cliente no ve las visitas');

// admin: vista como cliente, buscador, avisos, manuales, sistema
r = await admin('GET', '/admin/clients/' + wid + '/portal'); ok(r.data.readonly && r.data.client.data.web.enabled && r.data.site.totals.view === 2 && !r.data.client.data.admin, 'ver como cliente');
r = await admin('GET', '/admin/clients/' + wid + '/site'); ok(r.data.leads.length === 1 && r.data.key === skey, 'admin ve sitio del cliente');
r = await admin('GET', '/admin/search?q=Cl%C3%ADnica'); ok(r.data.results.some((x) => x.type === 'cliente' && x.id === wid), 'buscador global');
r = await admin('PUT', '/admin/announcements', { announcements: [{ text: 'Mantenimiento el sábado', level: 'warn', audience: 'web' }, { text: '<b>x</b>', level: 'zzz' }] }); ok(r.data.announcements.length === 2 && r.data.announcements[1].level === 'info', 'avisos guardados y saneados');
r = await wuser('GET', '/portal'); ok(r.data.announcements.some((a) => a.text.includes('sábado')), 'cliente web ve aviso');
r = await user('GET', '/portal'); ok(!r.data.announcements.some((a) => a.text.includes('sábado')), 'aviso solo para su público');
r = await admin('POST', '/admin/orders', { clientId: wid, packageId: 'sitio', amount: 1200, packageName: 'Página adicional', paid: true }); ok(r.status === 201, 'pedido manual pagado');
r = await admin('POST', '/admin/leads', { name: 'Lead manual', business: 'Óptica Sol', whatsapp: '6641112233' }); ok(r.status === 201, 'lead manual');
r = await admin('GET', '/admin/overview'); ok(typeof r.data.revenueOneTime === 'number' && r.data.webStages && Array.isArray(r.data.attention), 'overview con web y atención');
r = await admin('GET', '/admin/system'); ok(r.data.ok && r.data.schema === 2 && r.data.rows.clients > 0, 'estado del sistema');
r = await admin('GET', '/admin/export/siteleads'); ok(typeof r.data === 'string' && r.data.includes('Paciente Uno'), 'exportar mensajes de sitios');
r = await admin('POST', '/admin/clients', { name: 'Solo web', business: 'Taller', web: true }); ok(r.status === 201, 'admin crea cliente web');
// mantenimiento pagado no pisa plan
const mo = (await wuser('POST', '/checkout', { packageId: 'sitio', addon: 'maint' })).data.orderId;
await admin('PATCH', '/admin/orders/' + mo, { status: 'pagado' });
r = await wuser('GET', '/portal'); ok(r.data.client.data.web.maintenance === true && r.data.client.plan === 'sitio', 'mantenimiento activado');
r = await admin('GET', '/admin/overview'); ok(r.data.mrr >= 9900 + 490, 'MRR incluye mantenimiento ' + r.data.mrr);

// login / logout / disable
const u2 = client();
r = await u2('POST', '/auth/login', { email: `c${rnd}@ejemplo.com`, password: 'mala-clave-xx' }); ok(r.status === 401, 'login incorrecto');
r = await u2('POST', '/auth/login', { email: `c${rnd}@ejemplo.com`, password: 'una-clave-larga-1' }); ok(r.data.ok, 'login');
r = await admin('GET', '/admin/users'); const uu = r.data.users.find((x) => x.email === `c${rnd}@ejemplo.com`);
r = await admin('PATCH', '/admin/users/' + uu.id, { disabled: true }); ok(r.data.ok, 'desactivar usuario');
r = await u2('GET', '/portal'); ok(r.status === 401, 'sesión de usuario desactivado cae');
r = await u2('POST', '/auth/logout'); ok(r.data.ok, 'logout');
r = await anon('GET', '/nope'); ok(r.status === 404, '404 JSON');

console.log(`\n${pass} ok, ${failed} fallas`); process.exit(failed ? 1 : 0);
