/* Admin · clientes: listado y editor completo de campañas, resultados, contenido y SEO */
(function (g) {
  'use strict';
  var S = g.LF.shared, api = g.LF.api, ui = g.LF.ui, K = g.LF.kit, A = g.LF.admin, e = S.esc, st = A.st;
  var cur = null, tab = 'datos', dirty = false, orders = [], origStage = 'brief';
  var CHANNELS = ['Meta', 'Google', 'TikTok', 'Email', 'WhatsApp', 'Otro'], CST = ['activa', 'pausada', 'finalizada'], CTYPES = ['Reel', 'Foto', 'Carrusel', 'Historia', 'Video', 'Blog'], KST = ['por aprobar', 'aprobado', 'cambios solicitados', 'publicado'];
  var TABS = [['datos', 'Datos'], ['web', 'Sitio web'], ['campanas', 'Campañas'], ['resultados', 'Resultados diarios'], ['contenido', 'Contenido'], ['seo', 'SEO y Google'], ['tareas', 'Tareas y reportes'], ['interno', 'Interno']];
  var today = function () { return new Date().toISOString().slice(0, 10); };

  /* ---------- listado ---------- */
  function kindTags(c) {
    var o = [];
    if (c.kinds && c.kinds.web) o.push('<span class="tag info">Web' + (c.web ? ' · ' + e(S.webStage({ stage: c.web.stage }).t) : '') + (c.web && c.web.pending ? ' · ' + c.web.pending + ' cambio(s)' : '') + '</span>');
    if (c.kinds && c.kinds.mkt && (c.plan || !(c.kinds && c.kinds.web))) o.push('<span class="tag">Marketing</span>');
    return o.join(' ') || '<span class="hint">—</span>';
  }
  A.views.clientes = function () {
    return api.get('/admin/clients').then(function (r) {
      if (!r.ok) return A.head('Clientes') + '<div class="alert bad">' + e(A.msg(r)) + '</div>';
      st.clients = r.data.clients; var q = (st.cq || '').toLowerCase(), f = st.cf || '', ty = st.ct || '';
      var list = st.clients.filter(function (c) { return (!f || c.status === f) && (!ty || (ty === 'web' ? c.kinds && c.kinds.web : c.kinds && c.kinds.mkt)) && (!q || (c.name + ' ' + c.business + ' ' + (c.email || '') + ' ' + (c.user_email || '')).toLowerCase().indexOf(q) > -1); });
      return A.head('Clientes', S.num(st.clients.length) + (st.clients.length === 1 ? ' ficha' : ' fichas') + ' · edita campañas, resultados y contenido de cada una', '<button class="btn btn-primary btn-sm" data-a="newc" type="button"><span>+ Nuevo cliente</span></button> <button class="btn btn-ghost btn-sm" data-a="export" data-t="clients" type="button"><span>' + K.ic('download') + ' CSV</span></button>') +
        '<div class="tools"><input type="search" id="cq" placeholder="Buscar cliente, negocio o correo…" value="' + e(st.cq || '') + '" aria-label="Buscar clientes"><select id="ct" aria-label="Tipo"><option value="">Todos los tipos</option><option value="web"' + (ty === 'web' ? ' selected' : '') + '>Página web</option><option value="mkt"' + (ty === 'mkt' ? ' selected' : '') + '>Marketing</option></select><select id="cf" aria-label="Estado"><option value="">Todos los estados</option>' + ['onboarding', 'activo', 'pausado', 'cancelado'].map(function (s) { return '<option' + (s === f ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></div>' +
        (list.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Cliente</th><th>Tipo</th><th>Paquete</th><th>Estado</th><th class="num">Leads</th><th class="num">Costo/lead</th><th class="num">Ventas</th><th>Cuenta</th><th>Actualizado</th></tr></thead><tbody>' + list.map(function (c) {
          return '<tr data-open data-a="client" data-id="' + c.id + '" tabindex="0"><td><b>' + e(c.business || c.name || 'Sin nombre') + '</b><div class="hint">' + e(c.name) + '</div></td><td>' + kindTags(c) + '</td><td>' + (c.plan ? e(A.pkgName(c.plan)) : '<span class="hint">—</span>') + '</td><td>' + K.tag(c.status) + (c.next && c.next.date <= today() ? ' <span class="tag warn" title="' + e(c.next.action) + '">Seguimiento</span>' : '') + '</td><td class="num">' + S.num(c.totals.leads) + '</td><td class="num">' + (c.totals.leads ? S.money(c.totals.cpl) : '—') + '</td><td class="num">' + S.num(c.totals.sales) + '</td><td>' + (c.user_id ? '<span class="tag ok">Con cuenta</span>' : '<span class="tag warn" title="Código para vincular">' + e(c.claim_code || 'sin código') + '</span>') + '</td><td>' + e(ui.ago(c.updated_at)) + '</td></tr>';
        }).join('') + '</tbody></table></div>' : '<div class="panel">' + A.empty('Sin clientes', 'Crea uno o convierte un lead. Cuando alguien se registre en el sitio aparecerá aquí.') + '</div>');
    });
  };
  A.views.clientes.after = function (el) {
    var q = el.querySelector('#cq'), f = el.querySelector('#cf'), ct = el.querySelector('#ct');
    if (ct) ct.onchange = function () { st.ct = ct.value; A.render(true); };
    if (q) q.addEventListener('input', ui.debounce(function () { st.cq = q.value; A.render(true).then(function () { var n = document.getElementById('cq'); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }); }, 220));
    if (f) f.onchange = function () { st.cf = f.value; A.render(true); };
    el.onkeydown = function (ev) { if (ev.key === 'Enter' && ev.target.matches('tr[data-open]')) A.openClient(ev.target.dataset.id); };
  };

  A.newClient = function () {
    var d = document.createElement('dialog'); d.className = 'modal';
    d.innerHTML = '<form class="modal-in" novalidate><h3>Nuevo cliente</h3><div class="form-grid">' + K.field('Nombre', 'name', '', { req: 1, max: 80 }) + K.field('Negocio', 'business', '', { max: 100 }) + K.field('Correo', 'email', '', { type: 'email' }) + K.field('Teléfono', 'phone', '', { type: 'tel' }) + K.field('Paquete', 'plan', '', { type: 'select', options: [['', 'Sin paquete']].concat(st.content.packages.items.map(function (p) { return [p.id, p.name]; })), cls: 'full' }) + '</div><label class="check"><input type="checkbox" name="web"><span>Incluye proyecto de página web</span></label><label class="check"><input type="checkbox" name="example"><span>Llenar con datos de ejemplo (para probar el portal)</span></label><p class="form-msg" id="ncm"></p><div class="row-btns"><button class="btn btn-ghost btn-sm" type="button" data-x><span>Cancelar</span></button><button class="btn btn-primary btn-sm" type="submit"><span>Crear</span></button></div></form>';
    document.body.appendChild(d); function end() { d.close(); setTimeout(function () { d.remove(); }, 300); }
    d.querySelector('[data-x]').onclick = end; d.addEventListener('cancel', function (ev) { ev.preventDefault(); end(); });
    d.querySelector('form').onsubmit = function (ev) {
      ev.preventDefault(); var f = ev.target, body = { name: f.name.value, business: f.business.value, email: f.email.value, phone: f.phone.value, plan: f.plan.value, example: f.example.checked, web: f.web.checked };
      api.post('/admin/clients', body).then(function (r) { if (!r.ok) { d.querySelector('#ncm').className = 'form-msg err'; d.querySelector('#ncm').textContent = A.msg(r); return; } end(); ui.toast('Cliente creado · código de cuenta ' + r.data.claimCode); A.go('clientes').then(function () { A.openClient(r.data.id); }); });
    };
    d.showModal();
  };

  /* ---------- editor ---------- */
  function setPath(obj, path, val) { var p = path.split('.'), o = obj; for (var i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = val; }
  function blank(list) {
    if (list === 'admin.site.services' || list === 'admin.site.benefits') return { t: '', d: '' };
    if (list === 'admin.site.faq') return { q: '', a: '' };
    var b = S.sanitizeClientData({ campaigns: [{}], series: [{}], content: [{}], tasks: [{}], reports: [{}], seo: { rankings: [{}] } });
    var m = { campaigns: b.campaigns[0], series: b.series[0], content: b.content[0], tasks: b.tasks[0], reports: b.reports[0], 'seo.rankings': b.seo.rankings[0] }[list];
    m = JSON.parse(JSON.stringify(m)); if (m.id !== undefined) m.id = S.uid(list[0]);
    if (list === 'series' || list === 'content') m.date = today(); if (list === 'campaigns') m.name = ''; return m;
  }
  function listRef(path) { var p = path.split('.'), o = cur.data; p.forEach(function (k) { o = o[k]; }); return o; }
  function f(label, path, val, o) { o = o || {}; o.attrs = (o.attrs || '') + ' data-p="' + path + '"'; return K.field(label, path.replace(/\./g, '_'), val, o); }
  function rm(list, i) { return '<button class="btn-icon danger rm" type="button" data-c="rm" data-l="' + list + '" data-i="' + i + '" aria-label="Quitar">' + K.ic('x') + '</button>'; }
  function addBtn(list, label) { return '<button class="btn btn-ghost btn-sm" type="button" data-c="add" data-l="' + list + '"><span>' + K.ic('plus') + ' ' + label + '</span></button>'; }

  var T = {};
  T.datos = function () {
    var d = cur.data, link = cur.user_id ? '<span class="tag ok">Cuenta vinculada</span>' : '<span class="tag warn">Sin cuenta</span> Código para que el cliente se vincule: <code id="cc">' + e(cur.claim_code || '—') + '</code> <button class="btn btn-sm btn-ghost" type="button" data-c="newcode"><span>Nuevo código</span></button> <button class="btn-icon" type="button" data-c="copycode" aria-label="Copiar código">' + K.ic('copy') + '</button>';
    return '<div class="form-grid">' + f('Nombre', 'name', cur.name, { max: 80 }) + f('Negocio', 'business', cur.business, { max: 100 }) + f('Correo', 'email', cur.email, { type: 'email' }) + f('Teléfono', 'phone', cur.phone, { type: 'tel' }) +
      f('Paquete', 'plan', cur.plan, { type: 'select', options: [['', 'Sin paquete']].concat(st.content.packages.items.map(function (p) { return [p.id, p.name + ' · ' + S.money(p.price)]; })) }) + f('Estado', 'status', cur.status, { type: 'select', options: ['onboarding', 'activo', 'pausado', 'cancelado'] }) +
      f('Notas visibles para el cliente', 'data.notes', d.notes, { type: 'textarea', rows: 3, cls: 'full', max: 2000 }) + '</div><div class="item" style="margin-top:14px;flex-wrap:wrap">' + link + '</div>' +
      '<div class="row-btns" style="justify-content:flex-start;margin-top:12px"><button class="btn btn-ghost btn-sm" type="button" data-c="example"><span>Llenar con datos de ejemplo</span></button>' + (cur.phone ? '<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="' + e(S.waLink(cur.phone)) + '"><span>' + K.ic('wa') + ' WhatsApp</span></a>' : '') + '</div>' +
      '<h3 style="margin-top:22px">Pedidos</h3>' + (orders.length ? '<div class="tbl-wrap"><table class="tbl"><tbody>' + orders.map(function (o) { return '<tr><td>#' + o.id + '</td><td>' + e(o.package_name) + '</td><td class="num">' + S.money(o.amount) + '</td><td>' + K.tag(o.status) + '</td><td>' + e(ui.fmtDate(o.created_at)) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="hint">Sin pedidos.</p>');
  };
  T.campanas = function () {
    var cs = cur.data.campaigns;
    return '<div class="sub-rows">' + cs.map(function (c, i) {
      var b = 'data.campaigns.' + i + '.', n = function (l, k) { return f(l, b + k, c[k], { type: 'number', cls: 'c2' }); };
      return '<div class="sub-row">' + rm('campaigns', i) + f('Nombre de la campaña', b + 'name', c.name, { cls: 'c4', max: 200 }) + f('Canal', b + 'channel', c.channel, { type: 'select', options: CHANNELS, cls: 'c2' }) + f('Estado', b + 'status', c.status, { type: 'select', options: CST, cls: 'c2' }) + n('Presupuesto', 'budget') + n('Gastado', 'spent') + n('Impresiones', 'impressions') + n('Clics', 'clicks') + n('Leads', 'leads') + n('Ventas', 'sales') + n('Ingresos', 'revenue') + f('Nota para el cliente', b + 'note', c.note, { cls: 'c6', max: 200 }) + '</div>';
    }).join('') + '</div>' + (cs.length ? '' : '<p class="hint">Sin campañas todavía.</p>') + '<div style="margin-top:12px">' + addBtn('campaigns', 'Agregar campaña') + '</div>';
  };
  T.resultados = function () {
    var rows = cur.data.series, all = !!st.showAll, idx = rows.map(function (r, i) { return i; }).sort(function (a, b) { return rows[a].date < rows[b].date ? 1 : -1; }); if (!all) idx = idx.slice(0, 45);
    return '<p class="hint" style="margin-bottom:10px">Un renglón por día. El cliente ve estas cifras en su gráfica y KPIs. ' + S.num(rows.length) + ' días cargados.</p><div class="table-edit"><table><thead><tr><th>Fecha</th><th>Gasto</th><th>Leads</th><th>Ventas</th><th>Ingresos</th><th></th></tr></thead><tbody>' + idx.map(function (i) {
      var r = rows[i], b = 'data.series.' + i + '.'; function c(k, t) { return '<td><input data-p="' + b + k + '" type="' + (t || 'number') + '" value="' + e(r[k]) + '" aria-label="' + k + '"' + (t ? '' : ' inputmode="decimal" step="any"') + '></td>'; }
      return '<tr>' + c('date', 'date') + c('spend') + c('leads') + c('sales') + c('revenue') + '<td>' + rm('series', i).replace(' rm"', '"') + '</td></tr>';
    }).join('') + '</tbody></table></div><div class="row-btns" style="justify-content:flex-start;margin-top:12px">' + addBtn('series', 'Agregar día') + (rows.length > 45 ? '<button class="btn btn-ghost btn-sm" type="button" data-c="showall"><span>' + (all ? 'Ver menos' : 'Ver todos') + '</span></button>' : '') + '<button class="btn btn-ghost btn-sm" type="button" data-c="seed"><span>Generar 30 días de ejemplo</span></button><button class="btn btn-ghost btn-sm danger" type="button" data-c="clear"><span>Vaciar</span></button></div>' +
      '<details class="acc" style="margin-top:16px"><summary>Pegar desde Excel o CSV</summary><div class="acc-in"><p class="hint">Columnas: fecha (AAAA-MM-DD), gasto, leads, ventas, ingresos. Separadas por coma, tabulador o punto y coma. Si la fecha ya existe se reemplaza.</p><textarea id="csvin" rows="6" placeholder="2026-10-01,180,6,2,1300" style="width:100%;border:2px solid var(--line);border-radius:10px;padding:10px;font-size:16px"></textarea><button class="btn btn-primary btn-sm" type="button" data-c="import" style="justify-self:start"><span>Importar</span></button></div></details>';
  };
  T.contenido = function () {
    var cs = cur.data.content;
    return '<div class="sub-rows">' + cs.map(function (c, i) { var b = 'data.content.' + i + '.'; return '<div class="sub-row">' + rm('content', i) + f('Título', b + 'title', c.title, { cls: 'c4', max: 200 }) + f('Tipo', b + 'type', c.type, { type: 'select', options: CTYPES, cls: 'c2' }) + f('Estado', b + 'status', c.status, { type: 'select', options: KST, cls: 'c2' }) + f('Fecha', b + 'date', c.date, { type: 'date', cls: 'c2' }) + f('Enlace', b + 'url', c.url, { type: 'url', cls: 'c2', opt: 1, ph: 'https://' }) + '</div>'; }).join('') + '</div>' + (cs.length ? '' : '<p class="hint">Sin piezas. Las que pongas en "por aprobar" le aparecen al cliente con botones para aprobar.</p>') + '<div style="margin-top:12px">' + addBtn('content', 'Agregar pieza') + '</div>';
  };
  T.seo = function () {
    var s = cur.data.seo;
    return '<h3>Ficha de Google Business</h3><div class="form-grid">' + f('Vistas', 'data.seo.gbp.views', s.gbp.views, { type: 'number' }) + f('Llamadas', 'data.seo.gbp.calls', s.gbp.calls, { type: 'number' }) + f('Cómo llegar', 'data.seo.gbp.directions', s.gbp.directions, { type: 'number' }) + f('Reseñas', 'data.seo.gbp.reviews', s.gbp.reviews, { type: 'number' }) + f('Calificación', 'data.seo.gbp.rating', s.gbp.rating, { type: 'number' }) + '</div>' +
      '<h3 style="margin-top:22px">Posiciones en Google</h3><div class="sub-rows">' + s.rankings.map(function (r, i) { var b = 'data.seo.rankings.' + i + '.'; return '<div class="sub-row">' + rm('seo.rankings', i) + f('Búsqueda', b + 'kw', r.kw, { cls: 'c4', max: 200 }) + f('Posición', b + 'pos', r.pos, { type: 'number', cls: 'c1' }) + f('Antes', b + 'prev', r.prev, { type: 'number', cls: 'c1' }) + '</div>'; }).join('') + '</div><div style="margin-top:12px">' + addBtn('seo.rankings', 'Agregar palabra clave') + '</div>';
  };
  T.tareas = function () {
    var d = cur.data;
    return '<h3>Tareas del cliente</h3><div class="sub-rows">' + d.tasks.map(function (t, i) { var b = 'data.tasks.' + i + '.'; return '<div class="sub-row">' + rm('tasks', i) + f('Tarea', b + 'title', t.title, { cls: 'c4', max: 200 }) + '<label class="check c2" style="align-self:end"><input type="checkbox" data-p="' + b + 'done"' + (t.done ? ' checked' : '') + '><span>Hecha</span></label></div>'; }).join('') + '</div><div style="margin:12px 0 22px">' + addBtn('tasks', 'Agregar tarea') + '</div>' +
      '<h3>Reportes</h3><div class="sub-rows">' + d.reports.map(function (r, i) { var b = 'data.reports.' + i + '.'; return '<div class="sub-row">' + rm('reports', i) + f('Título', b + 'title', r.title, { cls: 'c3', max: 200 }) + f('Enlace (PDF o Looker)', b + 'url', r.url, { type: 'url', cls: 'c3', ph: 'https://' }) + '</div>'; }).join('') + '</div><div style="margin-top:12px">' + addBtn('reports', 'Agregar reporte') + '</div>';
  };


  /* ---------- pestaña: Sitio web ---------- */
  var ST3 = ['pendiente', 'en proceso', 'activo'];
  var BL = { about: 'Sobre el negocio', services: 'Servicios', audience: 'Cliente ideal', colors: 'Colores y estilo', refs: 'Referencias', social: 'Redes sociales', hours: 'Horario', address: 'Dirección', whatsapp: 'WhatsApp', slogan: 'Eslogan', extra: 'Otros' };
  function genHtml(preview) { return g.LF.gen.build({ client: cur, origin: location.origin, key: preview ? '' : (cur._siteKey || '') }); }   // la vista previa no lleva medición: no cuenta visitas
  T.web = function () {
    var w = cur.data.web;
    if (!w.enabled) return '<div class="banner info">' + K.ic('window') + '<span style="flex:1">Este cliente no tiene proyecto de página web. Al activarlo ve el panel web en su cuenta (etapas, información, cambios, visitas).</span><button class="btn btn-primary btn-sm" type="button" data-c="webon"><span>Activar proyecto web</span></button></div>';
    var bd = S.briefDone(w), site = cur.data.admin.site;
    var stageOpts = S.WEB_STAGES.map(function (x) { return [x.id, x.t]; });
    var brief = S.BRIEF_KEYS.filter(function (k) { return w.brief[k]; }).map(function (k) { return '<div><span class="hint">' + e(BL[k] || k) + '</span><div style="white-space:pre-wrap">' + e(w.brief[k]) + '</div></div>'; }).join('') || '<p class="hint">El cliente aún no llena su información.</p>';
    var chg = w.changes.length ? w.changes.map(function (c, i) { var b = 'data.web.changes.' + i + '.';
      return '<div class="sub-row">' + rm('web.changes', i) + '<div class="c6"><b>' + e(c.title) + '</b> <span class="hint">' + e(c.section) + ' · ' + e(ui.fmtDate(c.at)) + '</span>' + (c.detail ? '<div class="hint">' + e(c.detail) + '</div>' : '') + '</div>' + f('Estado', b + 'status', c.status, { type: 'select', options: S.CHANGE_ST, cls: 'c2' }) + f('Respuesta para el cliente', b + 'reply', c.reply, { cls: 'c4', max: 1000 }) + '</div>'; }).join('') : '<p class="hint">Sin solicitudes.</p>';
    var files = w.files.map(function (x, i) { return '<div class="item"><div class="grow"><h4>' + e(x.title) + '</h4><small>' + (x.by === 'equipo' ? 'Equipo' : 'Cliente') + '</small></div><a class="btn btn-sm btn-ghost" href="' + e(x.url) + '" target="_blank" rel="noopener"><span>Abrir</span></a><button class="btn-icon danger" type="button" data-c="rm" data-l="web.files" data-i="' + i + '" aria-label="Quitar">' + K.ic('x') + '</button></div>'; }).join('');
    var tl = w.timeline.slice(0, 6).map(function (t) { return '<li>' + e(t.text) + '<small>' + e(ui.fmtDate(t.at, true)) + '</small></li>'; }).join('');
    var sv = site.services.map(function (x, i) { var b = 'data.admin.site.services.' + i + '.'; return '<div class="sub-row">' + rm('admin.site.services', i) + f('Servicio', b + 't', x.t, { cls: 'c3', max: 200 }) + f('Descripción', b + 'd', x.d, { cls: 'c3', max: 300 }) + '</div>'; }).join('');
    var bn = site.benefits.map(function (x, i) { var b = 'data.admin.site.benefits.' + i + '.'; return '<div class="sub-row">' + rm('admin.site.benefits', i) + f('Beneficio', b + 't', x.t, { cls: 'c3', max: 200 }) + f('Descripción', b + 'd', x.d, { cls: 'c3', max: 300 }) + '</div>'; }).join('');
    var fq = site.faq.map(function (x, i) { var b = 'data.admin.site.faq.' + i + '.'; return '<div class="sub-row">' + rm('admin.site.faq', i) + f('Pregunta', b + 'q', x.q, { cls: 'c3', max: 200 }) + f('Respuesta', b + 'a', x.a, { cls: 'c3', max: 600 }) + '</div>'; }).join('');
    var sf = function (l, k, o) { return f(l, 'data.admin.site.' + k, site[k], o || { max: 200 }); };
    return '<div class="item" style="margin-bottom:14px"><div class="grow"><h4>Avance: ' + e(S.webStage(w).t) + '</h4><small>Información del cliente completa al ' + bd.pct + '%</small></div><div style="min-width:140px"><div class="meter"><b style="width:' + S.webStage(w).pct + '%"></b></div></div></div>' +
      '<div class="form-grid">' + f('Etapa del proyecto', 'data.web.stage', w.stage, { type: 'select', options: stageOpts }) + f('Fecha de entrega', 'data.web.dueDate', w.dueDate, { type: 'date' }) +
      f('Enlace de avance (preview)', 'data.web.previewUrl', w.previewUrl, { type: 'url', ph: 'https://…pages.dev', opt: 1 }) + f('Página publicada', 'data.web.url', w.url, { type: 'url', ph: 'https://…', opt: 1 }) +
      f('Dominio', 'data.web.domain', w.domain, { ph: 'minegocio.mx', opt: 1 }) + f('Estado del dominio', 'data.web.domainStatus', w.domainStatus, { type: 'select', options: ST3 }) + f('Renovación del dominio', 'data.web.domainRenew', w.domainRenew, { type: 'date', opt: 1 }) + f('SSL', 'data.web.ssl', w.ssl, { type: 'select', options: ST3 }) +
      f('Rondas de cambios incluidas', 'data.web.changesIncluded', w.changesIncluded, { type: 'number' }) + f('Avisos de mensajes a este correo', 'data.web.notifyEmail', w.notifyEmail, { type: 'email', opt: 1 }) +
      '<label class="check full"><input type="checkbox" data-p="data.web.maintenance"' + (w.maintenance ? ' checked' : '') + '><span>Mantenimiento mensual activo</span></label></div>' +
      '<h3 style="margin-top:22px">Información que llenó el cliente</h3><div class="panel flat" style="display:grid;gap:10px">' + brief + '</div>' +
      '<h3 style="margin-top:22px">Solicitudes de cambio</h3><div class="sub-rows">' + chg + '</div>' +
      '<h3 style="margin-top:22px">Archivos y enlaces</h3><div class="list">' + (files || '<p class="hint">Sin archivos.</p>') + '</div><div class="form-grid" style="margin-top:10px"><label class="fld"><span>Nombre</span><input id="wf-t" maxlength="100"></label><label class="fld"><span>Enlace https</span><input id="wf-u" type="url" placeholder="https://"></label><div class="full"><button class="btn btn-ghost btn-sm" type="button" data-c="addfile"><span>Agregar archivo del equipo</span></button></div></div>' +
      '<h3 style="margin-top:22px">Historial para el cliente</h3><ul class="tl">' + (tl || '<li>Sin movimientos<small></small></li>') + '</ul><div class="linkrow" style="margin-top:10px"><input id="wn" maxlength="300" placeholder="Agregar nota visible para el cliente" style="flex:1"><button class="btn btn-ghost btn-sm" type="button" data-c="addnote"><span>Publicar</span></button></div>' +
      '<h3 style="margin-top:22px">Visitas y mensajes</h3><div id="wsite" class="panel flat"><div class="skel" style="min-height:70px"></div></div>' +
      '<h3 style="margin-top:22px">Contenido de la página (generador)</h3><p class="hint" style="margin-bottom:10px">Con esto el generador arma una página lista para publicar. Lo que dejes vacío se toma del brief del cliente.</p>' +
      '<div class="row-btns" style="justify-content:flex-start;margin-bottom:12px"><button class="btn btn-ghost btn-sm" type="button" data-c="autosite"><span>' + K.ic('wand') + ' Autollenar desde el brief</span></button><button class="btn btn-ghost btn-sm" type="button" data-c="prev"><span>' + K.ic('eye') + ' Vista previa</span></button><button class="btn btn-primary btn-sm" type="button" data-c="dlsite"><span>' + K.ic('download') + ' Descargar index.html</span></button><button class="btn btn-ghost btn-sm" type="button" data-c="copysnip"><span>' + K.ic('copy') + ' Código de medición</span></button></div>' +
      '<div class="form-grid">' + sf('Titular', 'headline', { max: 120, cls: 'full' }) + sf('Subtítulo', 'sub', { type: 'textarea', rows: 2, max: 300, cls: 'full' }) + sf('Texto del botón', 'cta', { max: 60 }) + sf('Logo (texto)', 'logoText', { max: 60 }) + sf('Sobre nosotros', 'about', { type: 'textarea', rows: 3, max: 600, cls: 'full' }) +
      sf('Color principal', 'accent', { type: 'color', max: 7 }) + sf('Color secundario', 'accent2', { type: 'color', max: 7 }) + sf('Tema', 'theme', { type: 'select', options: ['claro', 'oscuro'] }) + sf('WhatsApp', 'whatsapp', { type: 'tel', max: 20 }) + sf('Correo', 'email', { type: 'email', max: 200 }) + sf('Horario', 'hours', { max: 200 }) + sf('Dirección', 'address', { max: 200 }) + sf('Enlace de mapa (Google Maps)', 'mapUrl', { type: 'url', max: 600 }) + sf('Instagram (URL)', 'instagram', { type: 'url', max: 600 }) + sf('Facebook (URL)', 'facebook', { type: 'url', max: 600 }) + sf('TikTok (URL)', 'tiktok', { type: 'url', max: 600 }) + '</div>' +
      '<h4 style="margin:16px 0 8px">Servicios</h4><div class="sub-rows">' + sv + '</div><div style="margin-top:8px">' + addBtn('admin.site.services', 'Agregar servicio') + '</div>' +
      '<h4 style="margin:16px 0 8px">Beneficios</h4><div class="sub-rows">' + bn + '</div><div style="margin-top:8px">' + addBtn('admin.site.benefits', 'Agregar beneficio') + '</div>' +
      '<h4 style="margin:16px 0 8px">Preguntas frecuentes</h4><div class="sub-rows">' + fq + '</div><div style="margin-top:8px">' + addBtn('admin.site.faq', 'Agregar pregunta') + '</div>';
  };
  function afterWeb() {
    var box = document.getElementById('wsite'); if (!box || !cur.data.web.enabled) return;
    api.get('/admin/clients/' + cur.id + '/site').then(function (r) {
      box = document.getElementById('wsite'); if (!box) return;
      if (!r.ok) { box.innerHTML = '<p class="hint">No se pudieron cargar las visitas.</p>'; return; }
      cur._siteKey = r.data.key; var t = r.data.totals;
      box.innerHTML = '<div class="grid-a ga4">' + K.stat('Visitas 30d', S.num(t.view), '', 'var(--accent2)') + K.stat('WhatsApp', S.num(t.wa), '', 'var(--accent3)') + K.stat('Llamadas', S.num(t.call), '', 'var(--accent)') + K.stat('Mensajes', S.num(t.form), '', 'var(--sun)') + '</div>' +
        '<p class="hint" style="margin-top:10px">Llave del sitio: <code>' + e(r.data.key) + '</code></p>' +
        (r.data.leads.length ? '<div class="list" style="margin-top:10px">' + r.data.leads.slice(0, 5).map(function (l) { return '<div class="item"><div class="grow"><h4>' + e(l.name) + '</h4><small>' + e([l.phone, l.email].filter(Boolean).join(' · ')) + ' · ' + e(ui.ago(l.created_at)) + '</small>' + (l.message ? '<div>' + e(l.message) + '</div>' : '') + '</div>' + K.tag(l.status) + '</div>'; }).join('') + '</div>' : '');
    });
  }
  function autoSite() {
    var d = cur.data, w = d.web, b = w.brief, s = d.admin.site;
    var take = function (k, v) { if (!s[k] && v) s[k] = v; };
    take('headline', b.slogan || cur.business); take('sub', String(b.about || '').slice(0, 280)); take('about', b.about); take('whatsapp', b.whatsapp || cur.phone); take('email', cur.email); take('hours', b.hours); take('address', b.address); take('logoText', cur.business || cur.name);
    if (!s.services.length && b.services) s.services = String(b.services).split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 12).map(function (x) { var p = x.split(/\s[-–:]\s/); return { t: p[0].slice(0, 200), d: (p[1] || '').slice(0, 300) }; });
    var m = /#[0-9a-f]{6}/i.exec(b.colors || ''); if (m) s.accent = m[0];
    markDirty(); paintEditor();
  }
  function openHtml(download) {
    var html = genHtml(!download);
    if (download) { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' })); a.download = 'index.html'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); return; }
    var w = window.open(URL.createObjectURL(new Blob([html], { type: 'text/html' })), '_blank'); if (!w) ui.toast('Permite ventanas emergentes para ver la vista previa');
  }
  A.genHtml = function (client, preview) { var prev = cur; cur = client; try { return genHtml(preview); } finally { cur = prev; } };

  /* ---------- pestaña: Interno ---------- */
  T.interno = function () {
    var a = cur.data.admin, paid = orders.filter(function (o) { return o.status === 'pagado'; }).reduce(function (n, o) { return n + o.amount; }, 0), mv = S.monthlyValue(st.content, cur);
    return '<div class="banner warn">' + K.ic('flag') + '<span>Esta pestaña es solo para ti. El cliente nunca la ve.</span></div>' +
      '<div class="grid-a ga3" style="margin-bottom:14px">' + K.stat('Cobrado', S.money(paid), orders.filter(function (o) { return o.status === 'pagado'; }).length + ' pagos', 'var(--accent3)') + K.stat('Ingreso mensual', S.money(mv), 'por este cliente', 'var(--accent2)') + K.stat('Valor por hora', a.hours ? S.money(paid / a.hours) : '—', a.hours + ' h dedicadas', 'var(--sun)') + '</div>' +
      '<div class="form-grid">' + f('Próxima acción', 'data.admin.nextAction', a.nextAction, { max: 200 }) + f('Fecha de seguimiento', 'data.admin.nextDate', a.nextDate, { type: 'date', opt: 1 }) + f('Cotización acordada (MXN)', 'data.admin.quote', a.quote, { type: 'number' }) + f('Horas dedicadas', 'data.admin.hours', a.hours, { type: 'number' }) +
      '<label class="fld full"><span>Etiquetas <em>(separadas por coma)</em></span><input data-tags value="' + e((a.tags || []).join(', ')) + '" maxlength="200" placeholder="dentista, referido, prioridad"></label>' + f('Notas internas', 'data.admin.notes', a.notes, { type: 'textarea', rows: 8, cls: 'full', max: 2000 }) + '</div>';
  };

  function paintEditor() {
    var d = A.drawer.el; if (!d.querySelector('.dr-body')) return;
    d.querySelector('.tabs').innerHTML = TABS.map(function (t) { return '<button type="button" role="tab" data-c="tab" data-t="' + t[0] + '" aria-selected="' + (tab === t[0]) + '">' + t[1] + '</button>'; }).join('');
    var body = d.querySelector('#cbody'), sc = d.querySelector('.dr-body').scrollTop; body.innerHTML = T[tab](); d.querySelector('.dr-body').scrollTop = sc; if (tab === 'web') afterWeb();
    d.querySelector('#dirty').hidden = !dirty;
  }
  A.openClient = function (id, startTab) {
    api.get('/admin/clients/' + id).then(function (r) {
      if (!r.ok) return A.fail(r);
      cur = r.data.client; orders = r.data.orders || []; tab = T[startTab] ? startTab : 'datos'; origStage = cur.data.web.stage; dirty = false; st.showAll = false;
      A.drawer.requestClose = function () { if (!dirty) return A.drawer.close(); ui.confirm('¿Descartar cambios?', 'Tienes cambios sin guardar.', 'Descartar', true).then(function (ok) { if (ok) { dirty = false; A.drawer.close(); } }); };
      A.drawer.open('<div class="dr-head"><h2>' + e(cur.business || cur.name || 'Cliente') + '</h2><a class="btn btn-ghost btn-sm" href="/dashboard.html?as=' + cur.id + '" target="_blank" rel="noopener"><span>' + K.ic('eye') + ' Ver como cliente</span></a><button class="btn-icon" data-a="dclose" type="button" aria-label="Cerrar">' + K.ic('x') + '</button></div><div class="dr-body"><div class="tabs" role="tablist"></div><div id="cbody"></div></div><div class="dr-foot"><button class="btn btn-sm danger" data-c="del" type="button"><span>Eliminar</span></button><span class="dirty" id="dirty" hidden>Cambios sin guardar</span><button class="btn btn-sm btn-primary" data-c="save" type="button"><span>Guardar cambios</span></button></div>');
      paintEditor();
    });
  };

  function markDirty() { dirty = true; var d = document.getElementById('dirty'); if (d) d.hidden = false; }
  document.addEventListener('input', function (ev) {
    var t = ev.target; if (t.dataset && t.dataset.tags !== undefined && cur) { cur.data.admin.tags = t.value.split(',').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 12); markDirty(); return; }
    if (!t.dataset || !t.dataset.p || !cur) return;
    var v = t.type === 'checkbox' ? t.checked : t.type === 'number' ? (t.value === '' ? 0 : parseFloat(t.value)) : t.value; if (v !== v) v = 0; setPath(cur, t.dataset.p, v); markDirty();
  });
  document.addEventListener('change', function (ev) { var t = ev.target; if (t.dataset && t.dataset.p && cur && (t.tagName === 'SELECT' || t.type === 'checkbox' || t.type === 'date')) { setPath(cur, t.dataset.p, t.type === 'checkbox' ? t.checked : t.value); markDirty(); } });

  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-c]'); if (!t || !cur) return; var c = t.dataset.c;
    if (c === 'tab') { tab = t.dataset.t; return paintEditor(); }
    if (c === 'webon') { cur.data = S.webActivate(cur.data, 'Proyecto de página web iniciado por el equipo.'); markDirty(); return paintEditor(); }
    if (c === 'autosite') return autoSite();
    if (c === 'prev') return openHtml(false);
    if (c === 'dlsite') return openHtml(true);
    if (c === 'copysnip') return K.copy('<script defer src="' + location.origin + '/t.js" data-key="' + (cur._siteKey || '') + '"></script>');
    if (c === 'addfile') { var ft = document.getElementById('wf-t').value.trim(), fu = document.getElementById('wf-u').value.trim(); if (!ft || !/^https:\/\//i.test(fu)) return ui.toast('Pon un nombre y un enlace que empiece con https://'); cur.data = S.webAddFile(cur.data, { title: ft, url: fu }, 'equipo'); markDirty(); return paintEditor(); }
    if (c === 'addnote') { var wn = document.getElementById('wn').value.trim(); if (!wn) return; cur.data.web.timeline.unshift({ id: S.uid('l'), text: wn.slice(0, 300), at: new Date().toISOString() }); markDirty(); return paintEditor(); }
    if (c === 'add') { var l = listRef(t.dataset.l); l.push(blank(t.dataset.l)); markDirty(); return paintEditor(); }
    if (c === 'rm') { listRef(t.dataset.l).splice(+t.dataset.i, 1); markDirty(); return paintEditor(); }
    if (c === 'showall') { st.showAll = !st.showAll; return paintEditor(); }
    if (c === 'seed') { var ex = S.exampleClientData(); cur.data.series = ex.series; markDirty(); return paintEditor(); }
    if (c === 'example') return ui.confirm('¿Reemplazar los datos?', 'Se sustituyen campañas, resultados, contenido y SEO por datos de ejemplo.', 'Reemplazar', true).then(function (ok) { if (ok) { var ex = S.exampleClientData(); cur.data = ex; markDirty(); paintEditor(); } });
    if (c === 'clear') return ui.confirm('¿Vaciar resultados diarios?', '', 'Vaciar', true).then(function (ok) { if (ok) { cur.data.series = []; markDirty(); paintEditor(); } });
    if (c === 'import') {
      var txt = document.getElementById('csvin').value, n = 0, map = {}; cur.data.series.forEach(function (r) { map[r.date] = r; });
      txt.split(/\r?\n/).forEach(function (line) { var p = line.split(/[,\t;]/).map(function (x) { return x.trim(); }); if (!/^\d{4}-\d{2}-\d{2}$/.test(p[0])) return; map[p[0]] = { date: p[0], spend: +p[1] || 0, leads: +p[2] || 0, sales: +p[3] || 0, revenue: +p[4] || 0 }; n++; });
      cur.data.series = Object.keys(map).sort().map(function (k) { return map[k]; }); if (n) markDirty(); ui.toast(n ? n + ' días importados' : 'No encontré filas con fecha AAAA-MM-DD'); return paintEditor();
    }
    if (c === 'newcode') return api.post('/admin/clients/' + cur.id + '/claim-code').then(function (r) { if (r.ok) { cur.claim_code = r.data.claimCode; paintEditor(); } else A.fail(r); });
    if (c === 'copycode') return K.copy(cur.claim_code || '');
    if (c === 'del') return ui.confirm('¿Eliminar este cliente?', 'Se borra su ficha y sus datos. La cuenta de usuario se conserva.', 'Eliminar', true).then(function (ok) { if (ok) api.del('/admin/clients/' + cur.id).then(function (r) { if (!r.ok) return A.fail(r); dirty = false; A.drawer.close(); A.render(true); }); });
    if (c === 'save') { if (cur.data.web.stage !== origStage) { var ns = cur.data.web.stage; cur.data.web.stage = origStage; cur.data = S.webSetStage(cur.data, ns); origStage = ns; } t.disabled = true; return api.put('/admin/clients/' + cur.id, { name: cur.name, business: cur.business, email: cur.email, phone: cur.phone, plan: cur.plan, status: cur.status, data: cur.data }).then(function (r) { t.disabled = false; if (!r.ok) return A.fail(r); dirty = false; ui.toast('Guardado. El cliente lo ve en su panel.'); A.drawer.close(); A.render(true); }); }
  });
  document.addEventListener('click', function (ev) { var t = ev.target.closest('[data-a="client"]'); if (t) A.openClient(t.dataset.id, t.dataset.tab); if (ev.target.closest('[data-a="newc"]')) A.newClient(); });
})(window);
