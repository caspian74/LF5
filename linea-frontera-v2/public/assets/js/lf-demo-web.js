/* Modo demo · página web, avisos, buscador y panel ampliado. Se engancha a lf-demo.js (mismos datos en localStorage). */
(function (g) {
  'use strict';
  var S = g.LF.shared;

  function kindsOf(db, h, c) { return S.clientKinds(h.content(db), { plan: c.plan, data: S.sanitizeClientData(c.data) }); }
  function siteKey(c) { return 'lf_' + c.id + '_demo000000'; }
  function stats(days) {
    var series = S.exampleSiteStats(days), t = { view: 0, wa: 0, call: 0, form: 0 };
    series.forEach(function (r) { t.view += r.view; t.wa += r.wa; t.call += r.call; t.form += r.form; });
    return { ok: true, days: days, series: series, totals: t, sources: [{ k: 'google', n: Math.round(t.view * 0.45) }, { k: 'facebook', n: Math.round(t.view * 0.25) }, { k: 'directo', n: Math.round(t.view * 0.2) }, { k: 'instagram', n: Math.round(t.view * 0.1) }],
      devices: [{ k: 'movil', n: Math.round(t.view * 0.72) }, { k: 'escritorio', n: Math.round(t.view * 0.28) }], pages: [{ k: '/', n: Math.round(t.view * 0.8) }, { k: '/servicios', n: Math.round(t.view * 0.2) }] };
  }
  function leadsFor(db, c) {
    db.siteleads = db.siteleads || [];
    var mine = db.siteleads.filter(function (l) { return l.client_id === c.id; });
    if (!mine.length) {
      var t = Date.now(); [['Laura Gómez', '6641112233', 'Quiero agendar una limpieza dental.', 2], ['Marco Ruiz', '6645556677', '¿Tienen ortodoncia para adolescentes?', 30]].forEach(function (x, i) { db.siteleads.push({ id: 9000 + c.id * 10 + i, client_id: c.id, name: x[0], phone: x[1], email: '', message: x[2], page: '/', status: i ? 'atendido' : 'nuevo', created_at: new Date(t - x[3] * 36e5).toISOString() }); });
      mine = db.siteleads.filter(function (l) { return l.client_id === c.id; });
    }
    return mine.slice().reverse();
  }
  function webCtx(db, h, u) { var c = h.clientOf(db, u.id); if (!c) return null; var d = S.sanitizeClientData(c.data); return d.web.enabled ? { c: c, d: d } : null; }
  function put(c, d, h) { c.data = S.sanitizeClientData(d); c.updated_at = h.now(); h.save(); }
  function portal(db, h, u, c) {
    var client = c ? h.cOut(c) : null;
    if (client) { var d = client.data; delete d.admin; client.kinds = S.clientKinds(h.content(db), { plan: c.plan, data: d }); client.siteKey = d.web.enabled ? siteKey(c) : ''; }
    var kinds = client ? client.kinds : { web: false, mkt: true }, today = new Date().toISOString().slice(0, 10);
    var ann = (db.announcements || []).filter(function (a) { return (!a.until || a.until >= today) && (a.audience === 'all' || (a.audience === 'web' && kinds.web) || (a.audience === 'marketing' && kinds.mkt)); });
    var uid = c && c.user_id ? c.user_id : u.id;
    return { ok: true, user: h.pubUser(u), client: client, serverTime: h.now(), announcements: ann,
      orders: db.orders.filter(function (o) { return o.user_id === uid || (c && o.client_id === c.id); }).reverse(), tickets: db.tickets.filter(function (t) { return t.user_id === uid; }).reverse() };
  }
  function activate(db, h, order) {
    var c = db.clients.filter(function (x) { return x.id === order.client_id; })[0]; if (!c) return;
    var pkg = S.packageOf(h.content(db), String(order.package_id).replace(/-mant$/, '')), d = S.sanitizeClientData(c.data);
    if (/-mant$/.test(order.package_id)) { d = S.webActivate(d, 'Pago confirmado. Proyecto de página web iniciado.'); d.web.maintenance = true; }
    else if (pkg && pkg.kind === 'unico') { d = S.webActivate(d, 'Pago confirmado. Proyecto de página web iniciado.'); if (!c.plan) c.plan = pkg.id; }
    else if (pkg) c.plan = pkg.id;
    c.status = 'activo'; c.data = S.sanitizeClientData(d);
  }

  g.LF.demoWeb = function (x) {
    var db = x.db, h = x.h, u = x.u, b = x.b, m, q = x.q, method = x.method, res = h.res, err = h.err;
    db.announcements = db.announcements || []; db.siteleads = db.siteleads || [];
    function admin() { return h.needAdmin(); }

    /* ---- portal ---- */
    if (method === 'GET' && q === '/portal') { if (h.need()) return h.need(); return res(200, portal(db, h, u, h.clientOf(db, u.id))); }
    if (method === 'GET' && q === '/portal/site') {
      if (h.need()) return h.need(); var w = webCtx(db, h, u); if (!w) return err(403, 'web_not_enabled');
      var days = +(/days=(\d+)/.exec(x.q) || [0, 30])[1]; return res(200, Object.assign(stats(Math.max(7, Math.min(90, days || 30))), { leads: leadsFor(db, w.c), key: siteKey(w.c) }));
    }
    if (method === 'PATCH' && (m = /^\/portal\/site-leads\/(\d+)$/.exec(q))) { if (h.need()) return h.need(); var l = db.siteleads.filter(function (z) { return z.id === +m[1]; })[0]; if (l) { l.status = b.status === 'atendido' ? 'atendido' : 'nuevo'; h.save(); } return res(200, { ok: true }); }
    if (method === 'PUT' && q === '/portal/web/brief') { if (h.need()) return h.need(); var w2 = webCtx(db, h, u); if (!w2) return err(403, 'web_not_enabled'); put(w2.c, S.webSetBrief(w2.d, b.brief), h); return res(200, { ok: true }); }
    if (method === 'POST' && q === '/portal/web/change') {
      if (h.need()) return h.need(); var w3 = webCtx(db, h, u); if (!w3) return err(403, 'web_not_enabled'); var title = h.str(b.title, 120); if (!title) return err(400, 'missing_fields');
      if (S.webPendingChanges(w3.d) >= 10) return err(400, 'too_many_pending'); put(w3.c, S.webAddChange(w3.d, { title: title, detail: h.str(b.detail, 1500), section: h.str(b.section, 60) }), h); return res(201, { ok: true });
    }
    if (method === 'POST' && q === '/portal/web/file') { if (h.need()) return h.need(); var w4 = webCtx(db, h, u); if (!w4) return err(403, 'web_not_enabled'); var url = S.safeUrl(h.str(b.url, 600)); if (!h.str(b.title, 120) || !/^https:\/\//.test(url)) return err(400, 'bad_url'); put(w4.c, S.webAddFile(w4.d, { title: h.str(b.title, 120), url: url }, 'cliente'), h); return res(201, { ok: true }); }
    if (method === 'DELETE' && (m = /^\/portal\/web\/file\/(.+)$/.exec(q))) { if (h.need()) return h.need(); var w5 = webCtx(db, h, u); if (!w5) return err(403, 'web_not_enabled'); put(w5.c, S.webRemoveFile(w5.d, decodeURIComponent(m[1]), 'cliente'), h); return res(200, { ok: true }); }

    /* ---- checkout con paquete de pago único y mantenimiento ---- */
    if (method === 'POST' && q === '/checkout') {
      if (h.need()) return h.need(); var content = h.content(db), pkg = S.packageOf(content, String(b.packageId)); if (!pkg) return err(404, 'package_not_found');
      var maint = b.addon === 'maint'; if (maint && !(pkg.kind === 'unico' && pkg.maint > 0)) return err(400, 'no_maintenance');
      var c = h.clientOf(db, u.id) || h.newClient(db, { user_id: u.id, name: u.name, business: u.business, email: u.email });
      var price = maint ? pkg.maint : pkg.price, name = maint ? pkg.name + ' · Mantenimiento mensual' : pkg.name;
      var o = { id: h.id(db), user_id: u.id, client_id: c.id, package_id: maint ? pkg.id + '-mant' : pkg.id, package_name: name, amount: Math.round(price), currency: 'MXN', status: 'pendiente', method: 'manual', created_at: h.now(), paid_at: null };
      db.orders.push(o); h.save();
      var txt = maint ? 'Hola, quiero activar el mantenimiento mensual de mi página (' + S.money(price) + ' MXN/mes). Pedido #' + o.id + '.' : pkg.kind === 'unico' ? 'Hola, quiero contratar el paquete ' + pkg.name + ' (' + S.money(price) + ' MXN, pago único). Pedido #' + o.id + '.' : 'Hola, quiero contratar el paquete ' + pkg.name + ' (' + S.money(price) + ' MXN/mes). Pedido #' + o.id + '.';
      return res(200, { ok: true, orderId: o.id, manual: true, whatsapp: S.waLink(content.brand.whatsapp, txt), package: { name: name, price: price } });
    }
    if (method === 'PATCH' && (m = /^\/admin\/orders\/(\d+)$/.exec(q)) && b.status === 'pagado') {
      if (admin()) return admin(); var o2 = db.orders.filter(function (z) { return z.id === +m[1]; })[0]; if (!o2) return err(404, 'not_found');
      o2.status = 'pagado'; o2.paid_at = h.now(); activate(db, h, o2); h.save(); return res(200, { ok: true });
    }

    /* ---- admin ---- */
    if (q.indexOf('/admin/') !== 0) return undefined;
    if (method === 'GET' && q === '/admin/overview') {
      if (admin()) return admin(); var cont = h.content(db), mrr = 0, act = 0, tot = { spend: 0, leads: 0, sales: 0 }, stages = { brief: 0, diseno: 0, desarrollo: 0, revision: 0, publicado: 0 }, attn = [], today = new Date().toISOString().slice(0, 10);
      db.clients.forEach(function (c) {
        var d = S.sanitizeClientData(c.data); if (c.status === 'activo') { act++; mrr += S.monthlyValue(cont, { plan: c.plan, data: d }); }
        var t = S.totals(d); tot.spend += t.spend; tot.leads += t.leads; tot.sales += t.sales; var nm = c.business || c.name;
        if (d.web.enabled) { stages[d.web.stage]++; var p = S.webPendingChanges(d); if (p) attn.push({ id: c.id, name: nm, why: p + ' cambio(s) web por atender', kind: 'cambio' }); if (d.web.dueDate && d.web.dueDate < today && d.web.stage !== 'publicado') attn.push({ id: c.id, name: nm, why: 'Entrega vencida (' + d.web.dueDate + ')', kind: 'vencido' }); }
        if (d.admin.nextDate && d.admin.nextDate <= today && c.status !== 'cancelado') attn.push({ id: c.id, name: nm, why: 'Seguimiento: ' + (d.admin.nextAction || 'pendiente'), kind: 'seguimiento' });
      });
      var ser = []; for (var i = 13; i >= 0; i--) { var dd = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10); ser.push({ d: dd, n: db.leads.filter(function (l) { return l.created_at.slice(0, 10) === dd; }).length }); }
      var by = {}; db.leads.forEach(function (l) { by[l.status] = (by[l.status] || 0) + 1; });
      var paid = db.orders.filter(function (o3) { return o3.status === 'pagado'; });
      return res(200, { ok: true, counts: { users: db.users.length, clients: db.clients.length, activeClients: act, leadsNew: db.leads.filter(function (l) { return l.status === 'nuevo'; }).length, leadsTotal: db.leads.length, ordersPending: db.orders.filter(function (o4) { return o4.status === 'pendiente'; }).length, ticketsOpen: db.tickets.filter(function (t) { return t.status !== 'resuelto'; }).length },
        mrr: mrr, revenuePaid: paid.reduce(function (a, o5) { return a + o5.amount; }, 0), revenueOneTime: paid.filter(function (o6) { return o6.package_id === 'sitio'; }).reduce(function (a, o7) { return a + o7.amount; }, 0), webStages: stages, attention: attn.slice(0, 12),
        siteLeadsNew: db.siteleads.filter(function (l) { return l.status === 'nuevo'; }).length, clientsTotals: tot, leadSeries: ser, leadsByStatus: Object.keys(by).map(function (k) { return { status: k, n: by[k] }; }), recentLeads: db.leads.slice(-6).reverse(), recentOrders: db.orders.slice(-6).reverse() });
    }
    if (method === 'GET' && q === '/admin/clients') {
      if (admin()) return admin(); var cn = h.content(db);
      return res(200, { ok: true, clients: db.clients.slice().reverse().map(function (c) {
        var uu = db.users.filter(function (z) { return z.id === c.user_id; })[0], d = S.sanitizeClientData(c.data);
        return { id: c.id, user_id: c.user_id, name: c.name, business: c.business, email: c.email, phone: c.phone, plan: c.plan, status: c.status, claim_code: c.claim_code, updated_at: c.updated_at, created_at: c.created_at, user_email: uu && uu.email, disabled: uu && uu.disabled ? 1 : 0, totals: S.totals(d),
          kinds: S.clientKinds(cn, { plan: c.plan, data: d }), web: d.web.enabled ? { stage: d.web.stage, pending: S.webPendingChanges(d), due: d.web.dueDate } : null, next: d.admin.nextDate ? { date: d.admin.nextDate, action: d.admin.nextAction } : null, tags: d.admin.tags };
      }) });
    }
    if (method === 'POST' && q === '/admin/clients') {
      if (admin()) return admin(); if (!h.str(b.name, 80)) return err(400, 'missing_name'); var code = Math.random().toString(16).slice(2, 10).toUpperCase();
      var data = b.example ? S.exampleClientData() : S.emptyClientData(); if (b.web) data = S.webActivate(data, 'Proyecto de página web creado por el equipo.');
      var nc = h.newClient(db, { name: h.str(b.name, 80), business: h.str(b.business, 100), email: h.str(b.email, 254), phone: h.str(b.phone, 20), plan: h.str(b.plan, 40), claim_code: code, data: data }); h.save(); return res(201, { ok: true, id: nc.id, claimCode: code });
    }
    if (method === 'GET' && q === '/admin/web') {
      if (admin()) return admin();
      return res(200, { ok: true, projects: db.clients.map(function (c) { var d = S.sanitizeClientData(c.data); return d.web.enabled ? { id: c.id, name: c.name, business: c.business, phone: c.phone, plan: c.plan, status: c.status, stage: d.web.stage, dueDate: d.web.dueDate, url: d.web.url, previewUrl: d.web.previewUrl, domain: d.web.domain, domainStatus: d.web.domainStatus, maintenance: d.web.maintenance, brief: S.briefDone(d.web).pct, pending: S.webPendingChanges(d), updated_at: c.updated_at } : null; }).filter(Boolean) });
    }
    if (method === 'PATCH' && (m = /^\/admin\/clients\/(\d+)\/web$/.exec(q))) {
      if (admin()) return admin(); var c1 = db.clients.filter(function (z) { return z.id === +m[1]; })[0]; if (!c1) return err(404, 'not_found'); var d1 = S.sanitizeClientData(c1.data);
      if (b.enabled === true) d1 = S.webActivate(d1); else if (!d1.web.enabled) return err(400, 'web_not_enabled');
      if (b.stage) d1 = S.webSetStage(d1, b.stage, b.stageNote);
      ['dueDate', 'url', 'previewUrl', 'domain', 'domainStatus', 'domainRenew', 'ssl', 'maintenance', 'changesIncluded', 'notifyEmail'].forEach(function (k) { if (k in b) d1.web[k] = b[k]; });
      if (b.note) d1.web.timeline.unshift({ id: S.uid('l'), text: h.str(b.note, 300), at: h.now() });
      if (b.change && b.change.id) { var ch = d1.web.changes.filter(function (z) { return z.id === b.change.id; })[0]; if (ch) { if (b.change.status) ch.status = b.change.status; if ('reply' in b.change) ch.reply = h.str(b.change.reply, 1000); } }
      if (b.addFile) d1 = S.webAddFile(d1, b.addFile, 'equipo'); if (b.removeFile) d1 = S.webRemoveFile(d1, b.removeFile, 'equipo');
      put(c1, d1, h); return res(200, { ok: true, web: S.sanitizeClientData(c1.data).web });
    }
    if (method === 'GET' && (m = /^\/admin\/clients\/(\d+)\/site/.exec(q))) { if (admin()) return admin(); var c2 = db.clients.filter(function (z) { return z.id === +m[1]; })[0]; if (!c2) return err(404, 'not_found'); return res(200, Object.assign(stats(30), { key: siteKey(c2), leads: leadsFor(db, c2) })); }
    if (method === 'PATCH' && (m = /^\/admin\/site-leads\/(\d+)$/.exec(q))) { if (admin()) return admin(); var sl = db.siteleads.filter(function (z) { return z.id === +m[1]; })[0]; if (sl) { sl.status = b.status === 'atendido' ? 'atendido' : 'nuevo'; h.save(); } return res(200, { ok: true }); }
    if (method === 'GET' && (m = /^\/admin\/clients\/(\d+)\/portal$/.exec(q))) {
      if (admin()) return admin(); var c3 = db.clients.filter(function (z) { return z.id === +m[1]; })[0]; if (!c3) return err(404, 'not_found');
      var p = portal(db, h, u, c3); p.readonly = true; p.site = p.client && p.client.data.web.enabled ? Object.assign(stats(30), { leads: leadsFor(db, c3), key: siteKey(c3) }) : null; return res(200, p);
    }
    if (method === 'GET' && q.indexOf('/admin/search') === 0) {
      if (admin()) return admin(); var term = decodeURIComponent((/q=([^&]*)/.exec(x.q) || [0, ''])[1]).toLowerCase(), out = [];
      if (term.length >= 2) {
        db.clients.forEach(function (c) { if ((c.name + ' ' + c.business + ' ' + c.phone + ' ' + c.email).toLowerCase().indexOf(term) > -1) out.push({ type: 'cliente', id: c.id, title: c.business || c.name, sub: c.name }); });
        db.leads.forEach(function (l) { if ((l.name + ' ' + l.business + ' ' + l.whatsapp).toLowerCase().indexOf(term) > -1) out.push({ type: 'lead', id: l.id, title: l.business || l.name, sub: l.name + ' · ' + l.status }); });
        db.tickets.forEach(function (t) { if (t.subject.toLowerCase().indexOf(term) > -1) out.push({ type: 'ticket', id: t.id, title: t.subject, sub: t.status }); });
        db.users.forEach(function (z) { if ((z.email + ' ' + z.name).toLowerCase().indexOf(term) > -1) out.push({ type: 'usuario', id: z.id, title: z.email, sub: z.name }); });
      }
      return res(200, { ok: true, results: out.slice(0, 20) });
    }
    if (method === 'GET' && q === '/admin/announcements') { if (admin()) return admin(); return res(200, { ok: true, announcements: db.announcements }); }
    if (method === 'PUT' && q === '/admin/announcements') {
      if (admin()) return admin(); var lv = ['info', 'ok', 'warn'], au = ['all', 'web', 'marketing'];
      db.announcements = (Array.isArray(b.announcements) ? b.announcements : []).slice(0, 10).map(function (a, i) { return { id: String(a.id || 'a' + i + Date.now().toString(36)).replace(/[^a-z0-9_-]/gi, '').slice(0, 30), text: h.str(a.text, 400), level: lv.indexOf(a.level) > -1 ? a.level : 'info', audience: au.indexOf(a.audience) > -1 ? a.audience : 'all', until: /^\d{4}-\d{2}-\d{2}$/.test(a.until) ? a.until : '' }; }).filter(function (a) { return a.text; });
      h.save(); return res(200, { ok: true, announcements: db.announcements });
    }
    if (method === 'POST' && q === '/admin/orders') {
      if (admin()) return admin(); var c5 = db.clients.filter(function (z) { return z.id === +b.clientId; })[0]; if (!c5) return err(404, 'not_found');
      var pk = S.packageOf(h.content(db), h.str(b.packageId, 40)), amt = Math.round(Number(b.amount !== '' && b.amount != null ? b.amount : pk && pk.price)); if (!(amt > 0)) return err(400, 'bad_amount');
      var o8 = { id: h.id(db), user_id: c5.user_id, client_id: c5.id, package_id: h.str(b.packageId, 40) || 'manual', package_name: h.str(b.packageName, 100) || (pk && pk.name) || 'Pago manual', amount: amt, currency: 'MXN', status: b.paid ? 'pagado' : 'pendiente', method: 'manual', created_at: h.now(), paid_at: b.paid ? h.now() : null };
      db.orders.push(o8); if (b.paid) activate(db, h, o8); h.save(); return res(201, { ok: true, id: o8.id });
    }
    if (method === 'POST' && q === '/admin/leads') {
      if (admin()) return admin(); if (!h.str(b.name, 80)) return err(400, 'missing_name');
      db.leads.push({ id: h.id(db), name: h.str(b.name, 80), business: h.str(b.business, 100) || h.str(b.name, 80), whatsapp: S.normalizeWhatsApp(b.whatsapp) || h.str(b.whatsapp, 20), niche: h.str(b.niche, 80), message: h.str(b.message, 600), status: 'nuevo', notes: '', utm: { source: 'manual' }, created_at: h.now() }); h.save(); return res(201, { ok: true });
    }
    if (method === 'GET' && q === '/admin/system') return admin() || res(200, { ok: true, schema: 2, stripe: false, webhook: false, turnstile: false, email: false, notifyEmail: false, notifyWebhook: false, rows: { clients: db.clients.length, leads: db.leads.length, orders: db.orders.length, site_leads: db.siteleads.length, site_stats: 0 } });
    if (method === 'POST' && q === '/admin/system/test-notify') return admin() || res(200, { ok: true, webhook: false, email: false });
    if (method === 'GET' && q === '/admin/export/siteleads') return admin() || res(200, S.toCSV(db.siteleads, ['id', 'client_id', 'name', 'phone', 'email', 'message', 'page', 'status', 'created_at']));
    return undefined;
  };
})(window);
