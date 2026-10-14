/* Admin · resumen ampliado, proyectos web, generador, avisos, cotizador, buscador (Ctrl+K), pedidos/leads manuales y estado del sistema */
(function (g) {
  'use strict';
  var S = g.LF.shared, api = g.LF.api, ui = g.LF.ui, K = g.LF.kit, A = g.LF.admin, e = S.esc, st = A.st;

  // navegación: Proyectos web y Generador junto a Clientes
  var NAV = A.NAV, ci = NAV.map(function (n) { return n[0]; }).indexOf('clientes');
  NAV.splice(ci + 1, 0, ['web', 'Proyectos web', 'window'], ['generador', 'Generador', 'wand']);

  /* ---------- Resumen ---------- */
  A.views.resumen = function () {
    return api.get('/admin/overview').then(function (r) {
      if (!r.ok) return A.head('Resumen') + '<div class="alert bad">' + e(A.msg(r)) + '</div>';
      var d = r.data, c = d.counts, st2 = d.leadsByStatus.map(function (x) { return { l: x.status, v: x.n }; });
      var stages = S.WEB_STAGES, totalWeb = stages.reduce(function (n, x) { return n + (d.webStages[x.id] || 0); }, 0);
      var attn = d.attention.length ? '<div class="list">' + d.attention.map(function (x) {
        return '<button class="item" data-a="client" data-id="' + x.id + '" data-tab="' + (x.kind === 'seguimiento' ? 'interno' : 'web') + '" type="button" style="text-align:left;width:100%"><span class="tag ' + (x.kind === 'vencido' ? 'bad' : 'warn') + '">' + e(x.kind) + '</span><div class="grow"><h4>' + e(x.name) + '</h4><small>' + e(x.why) + '</small></div>' + K.ic('arrow') + '</button>';
      }).join('') + '</div>' : '<p class="hint">Todo al día. Nada urgente por atender.</p>';
      var inbox = [];
      if (c.leadsNew) inbox.push(['leads', c.leadsNew + ' lead(s) nuevo(s)', 'inbox']);
      if (c.ordersPending) inbox.push(['pedidos', c.ordersPending + ' pedido(s) por confirmar', 'card']);
      if (c.ticketsOpen) inbox.push(['tickets', c.ticketsOpen + ' ticket(s) abierto(s)', 'help']);
      if (d.siteLeadsNew) inbox.push(['web', d.siteLeadsNew + ' mensaje(s) en sitios de clientes', 'mail']);
      var inb = inbox.length ? '<div class="list">' + inbox.map(function (x) { return '<button class="item" data-v="' + x[0] + '" type="button" style="text-align:left;width:100%">' + K.ic(x[2]) + '<div class="grow"><h4>' + e(x[1]) + '</h4></div>' + K.ic('arrow') + '</button>'; }).join('') + '</div>' : '<p class="hint">Bandeja vacía.</p>';
      return A.head('Resumen', 'Lo importante de tu agencia hoy', '<button class="btn btn-ghost btn-sm" data-a="search" type="button"><span>' + K.ic('search') + ' Buscar (Ctrl+K)</span></button> <button class="btn btn-primary btn-sm" data-a="go" data-v="clientes" data-new type="button"><span>+ Nuevo cliente</span></button>') +
        '<div class="grid-a ga4">' + K.stat('Ingreso mensual recurrente', S.money(d.mrr), c.activeClients + ' clientes activos', 'var(--accent3)') + K.stat('Páginas web vendidas', S.money(d.revenueOneTime), 'pago único cobrado', 'var(--accent2)') +
        K.stat('Cobrado en total', S.money(d.revenuePaid), '', 'var(--accent)') + K.stat('Leads nuevos', S.num(c.leadsNew), S.num(c.leadsTotal) + ' en total', 'var(--sun)') + '</div>' +
        '<div class="grid-a ga-1-2" style="margin-top:16px"><div class="panel"><h2>Requiere tu atención</h2>' + attn + '</div><div class="panel"><h2>Bandeja</h2>' + inb + '</div></div>' +
        '<div class="panel" style="margin-top:16px"><h2>Proyectos web en curso</h2>' + (totalWeb ? '<div class="funnel">' + stages.slice(0, 4).map(function (x, i) { return '<button class="fn" data-v="web" type="button" style="--k:' + K.COL[i] + ';text-align:left;cursor:pointer"><span>' + e(x.t) + '</span><strong>' + (d.webStages[x.id] || 0) + '</strong></button>'; }).join('') + '</div><p class="hint" style="margin-top:10px">' + (d.webStages.publicado || 0) + ' publicada(s).</p>' : '<p class="hint">Aún no hay proyectos web. Vende el paquete "Página Web" o activa uno desde la ficha de un cliente.</p>') + '</div>' +
        '<div class="grid-a ga-1-2" style="margin-top:16px"><div class="panel"><h2>Leads en los últimos 14 días</h2>' + K.bars(d.leadSeries.map(function (x) { return x.n; }), d.leadSeries.map(function (x) { return x.d; }), '#FF3B5C') + '</div><div class="panel"><h2>Embudo de leads</h2>' + K.donut(st2) + '</div></div>' +
        '<div class="grid-a ga4" style="margin-top:16px">' + K.stat('Cuentas registradas', S.num(c.users), S.num(c.clients) + ' fichas de cliente') + K.stat('Leads de tus clientes', S.num(d.clientsTotals.leads), 'Ventas ' + S.num(d.clientsTotals.sales), 'var(--accent3)') + K.stat('Inversión en anuncios de clientes', S.money(d.clientsTotals.spend), '', 'var(--accent2)') + K.stat('Tickets abiertos', S.num(c.ticketsOpen), '', 'var(--accent)') + '</div>' +
        '<div class="grid-a ga2" style="margin-top:16px"><div class="panel"><h2>Últimos leads</h2>' + (d.recentLeads.length ? '<div class="list">' + d.recentLeads.map(function (l) { return '<button class="item" data-a="lead" data-id="' + l.id + '" type="button" style="text-align:left;width:100%"><div class="grow"><h4>' + e(l.business) + '</h4><small>' + e(l.name) + ' · ' + e(ui.ago(l.created_at)) + '</small></div>' + K.tag(l.status) + '</button>'; }).join('') + '</div>' : A.empty('Sin leads todavía', 'Cuando alguien llene el formulario aparecerá aquí.')) + '</div>' +
        '<div class="panel"><h2>Últimos pedidos</h2>' + (d.recentOrders.length ? '<div class="list">' + d.recentOrders.map(function (o) { return '<div class="item"><div class="grow"><h4>' + e(o.package_name) + '</h4><small>#' + o.id + ' · ' + e(ui.ago(o.created_at)) + '</small></div><b>' + S.money(o.amount) + '</b>' + K.tag(o.status) + '</div>'; }).join('') + '</div>' : A.empty('Sin pedidos todavía', 'Aquí verás las compras de paquetes.')) + '</div></div>';
    });
  };

  /* ---------- Proyectos web (kanban) ---------- */
  A.views.web = function () {
    return api.get('/admin/web').then(function (r) {
      if (!r.ok) return A.head('Proyectos web') + '<div class="alert bad">' + e(A.msg(r)) + '</div>';
      var ps = r.data.projects, by = {}; S.WEB_STAGES.forEach(function (x) { by[x.id] = []; }); ps.forEach(function (p) { (by[p.stage] || by.brief).push(p); });
      var today = new Date().toISOString().slice(0, 10);
      return A.head('Proyectos web', ps.length + ' proyecto(s) · arrastra una tarjeta para cambiar su etapa', '<button class="btn btn-ghost btn-sm" data-a="export" data-t="siteleads" type="button"><span>' + K.ic('download') + ' Mensajes de sitios (CSV)</span></button>') +
        (ps.length ? '<div class="kan stages-k">' + S.WEB_STAGES.map(function (x) {
          return '<div class="kcol" data-wdrop="' + x.id + '"><h3><span>' + e(x.t) + '</span><span>' + by[x.id].length + '</span></h3>' + by[x.id].map(function (p) {
            var late = p.dueDate && p.dueDate < today && p.stage !== 'publicado';
            return '<div class="kcard" draggable="true" data-a="client" data-tab="web" data-id="' + p.id + '"><b>' + e(p.business || p.name) + '</b><span class="hint">' + e(p.domain || 'sin dominio') + '</span><div class="meter"><b style="width:' + p.brief + '%"></b></div><span class="hint">Brief ' + p.brief + '%' + (p.dueDate ? ' · entrega ' + e(ui.fmtDate(p.dueDate)) : '') + '</span>' + (late ? '<span class="tag bad">Entrega vencida</span>' : '') + (p.pending ? '<span class="tag warn">' + p.pending + ' cambio(s)</span>' : '') + (p.maintenance ? '<span class="tag ok">Mantenimiento</span>' : '') + '</div>';
          }).join('') + '</div>';
        }).join('') + '</div>' : '<div class="panel">' + A.empty('Aún no hay proyectos web', 'Se crean solos cuando un cliente paga el paquete Página Web, o actívalos desde la ficha del cliente (pestaña Sitio web).') + '</div>');
    });
  };
  A.views.web.after = function (el) {
    var dragId = null;
    el.ondragstart = function (ev) { var c = ev.target.closest('.kcard'); if (!c) return; dragId = c.dataset.id; c.classList.add('drag'); ev.dataTransfer.effectAllowed = 'move'; try { ev.dataTransfer.setData('text/plain', dragId); } catch (x) { /* noop */ } };
    el.ondragend = function (ev) { var c = ev.target.closest('.kcard'); if (c) c.classList.remove('drag'); Array.prototype.forEach.call(el.querySelectorAll('.over'), function (x) { x.classList.remove('over'); }); };
    el.ondragover = function (ev) { var col = ev.target.closest('.kcol'); if (col) { ev.preventDefault(); Array.prototype.forEach.call(el.querySelectorAll('.over'), function (x) { x.classList.remove('over'); }); col.classList.add('over'); } };
    el.ondrop = function (ev) { var col = ev.target.closest('.kcol'); if (!col || !dragId) return; ev.preventDefault(); api.patch('/admin/clients/' + dragId + '/web', { stage: col.dataset.wdrop }).then(function (r) { if (!r.ok) A.fail(r); A.render(true); }); };
  };

  /* ---------- Generador ---------- */
  A.views.generador = function () {
    return api.get('/admin/web').then(function (r) {
      if (!r.ok) return A.head('Generador') + '<div class="alert bad">' + e(A.msg(r)) + '</div>';
      var ps = r.data.projects; if (!st.genId || !ps.some(function (p) { return p.id === +st.genId; })) st.genId = ps[0] && ps[0].id;
      if (!ps.length) return A.head('Generador de páginas') + '<div class="panel">' + A.empty('Sin proyectos web', 'Activa un proyecto web en la ficha de un cliente para generar su página.') + '</div>';
      return A.head('Generador de páginas', 'Arma la página del cliente con su brief y descárgala lista para Cloudflare Pages',
        '<label class="fld" style="min-width:220px"><span class="sr">Cliente</span><select id="gen-c">' + ps.map(function (p) { return '<option value="' + p.id + '"' + (p.id === +st.genId ? ' selected' : '') + '>' + e(p.business || p.name) + '</option>'; }).join('') + '</select></label>') +
        '<div class="row-btns" style="justify-content:flex-start;margin-bottom:12px"><button class="btn btn-ghost btn-sm" data-a="gedit" type="button"><span>Editar contenido</span></button><button class="btn btn-primary btn-sm" data-a="gdl" type="button"><span>' + K.ic('download') + ' Descargar index.html</span></button><button class="btn btn-ghost btn-sm" data-a="gsnip" type="button"><span>' + K.ic('copy') + ' Código de medición</span></button><span class="hint" style="align-self:center">Sube el archivo a un proyecto de Cloudflare Pages y conecta el dominio del cliente.</span></div>' +
        '<div class="preview" id="gprev"><div class="preview-bar"><b>Vista previa</b></div><iframe id="gen-f" title="Vista previa" sandbox=""></iframe></div>';
    });
  };
  A.views.generador.after = function (el) {
    var sel = el.querySelector('#gen-c'); if (!sel) return;
    sel.onchange = function () { st.genId = +sel.value; A.render(true); };
    api.get('/admin/clients/' + st.genId).then(function (r) {
      if (!r.ok) return; st.genClient = r.data.client;
      return api.get('/admin/clients/' + st.genId + '/site').then(function (s) {
        st.genClient._siteKey = s.ok ? s.data.key : '';
        var f = document.getElementById('gen-f'); if (f) f.srcdoc = A.genHtml(st.genClient, true);
      });
    });
  };

  /* ---------- Herramientas: cotizador y avisos ---------- */
  var origTools = A.views.herramientas;
  A.views.herramientas = function () {
    return Promise.all([Promise.resolve(origTools()), api.get('/admin/announcements')]).then(function (res) {
      st.ann = res[1].ok ? res[1].data.announcements : [];
      var web = S.packageOf(st.content, 'sitio') || { price: 5900, maint: 490 };
      var extra = '<div class="grid-a ga2" style="margin-top:16px">' +
        '<form class="panel" id="t-quote" novalidate><h2>Cotizador de página web</h2><div class="form-grid">' + K.field('Precio base', 'base', web.price, { type: 'number' }) + K.field('Páginas adicionales', 'pages', 0, { type: 'number' }) + K.field('Precio por página extra', 'pp', 1200, { type: 'number' }) + K.field('Identidad visual (logo)', 'logo', 0, { type: 'number' }) + K.field('Descuento %', 'disc', 0, { type: 'number' }) + K.field('Mantenimiento al mes', 'maint', web.maint || 0, { type: 'number' }) + '</div>' +
        '<label class="check" style="margin-top:10px"><input type="checkbox" name="iva"><span>Agregar IVA (16%)</span></label><div class="grid-a ga2" style="margin-top:12px" id="quote-out"></div><div class="item" style="margin-top:12px"><code id="quote-txt" style="flex:1;background:none;white-space:pre-wrap"></code><button class="btn-icon" type="button" data-a="copy" data-from="quote-txt" aria-label="Copiar">' + K.ic('copy') + '</button></div></form>' +
        '<form class="panel" id="t-ann" novalidate><h2>Avisos para clientes</h2><p class="hint" style="margin-bottom:10px">Aparecen arriba del portal. Máximo 10.</p><div id="ann-list" class="sub-rows"></div><div class="row-btns" style="justify-content:flex-start;margin-top:10px"><button class="btn btn-ghost btn-sm" type="button" data-a="annadd"><span>' + K.ic('plus') + ' Agregar aviso</span></button><button class="btn btn-primary btn-sm" type="submit"><span>Publicar avisos</span></button></div></form></div>';
      return res[0] + extra;
    });
  };
  A.views.herramientas.after = function (el) {
    origTools.after(el);
    var f = el.querySelector('#t-quote');
    function quote() {
      var v = function (n) { return +f[n].value || 0; }, sub = v('base') + v('pages') * v('pp') + v('logo'), disc = sub * v('disc') / 100, net = sub - disc, iva = f.iva.checked ? net * 0.16 : 0, tot = net + iva;
      el.querySelector('#quote-out').innerHTML = K.stat('Subtotal', S.money(net), disc ? 'Descuento ' + S.money(disc) : '', 'var(--accent2)') + K.stat('Total' + (f.iva.checked ? ' con IVA' : ''), S.money(tot), v('maint') ? '+ ' + S.money(v('maint')) + '/mes de mantenimiento' : '', 'var(--accent3)');
      el.querySelector('#quote-txt').textContent = 'Propuesta de página web\n• Página web' + (v('pages') ? ' + ' + v('pages') + ' página(s) extra' : '') + (v('logo') ? ' + identidad visual' : '') + ': ' + S.money(net) + (f.iva.checked ? ' + IVA = ' + S.money(tot) : ' (precio final)') + '\n' + (v('maint') ? '• Mantenimiento opcional: ' + S.money(v('maint')) + '/mes\n' : '') + '• Entrega en 7 días hábiles desde que recibimos tu material.';
    }
    f.addEventListener('input', quote); f.addEventListener('submit', function (ev) { ev.preventDefault(); }); quote();
    paintAnn();
    el.querySelector('#t-ann').addEventListener('submit', function (ev) { ev.preventDefault(); readAnn(); api.put('/admin/announcements', { announcements: st.ann }).then(function (r) { if (!r.ok) return A.fail(r); st.ann = r.data.announcements; paintAnn(); ui.toast('Avisos publicados'); }); });
  };
  function paintAnn() {
    var box = document.getElementById('ann-list'); if (!box) return;
    box.innerHTML = st.ann.length ? st.ann.map(function (a, i) {
      return '<div class="sub-row" data-ann="' + i + '"><button class="btn-icon danger rm" type="button" data-a="annrm" data-i="' + i + '" aria-label="Quitar">' + K.ic('x') + '</button><label class="fld c6"><span>Mensaje</span><input name="text" maxlength="400" value="' + e(a.text) + '"></label>' +
        '<label class="fld c2"><span>Tipo</span><select name="level">' + ['info', 'ok', 'warn'].map(function (l) { return '<option value="' + l + '"' + (a.level === l ? ' selected' : '') + '>' + { info: 'Informativo', ok: 'Buena noticia', warn: 'Importante' }[l] + '</option>'; }).join('') + '</select></label>' +
        '<label class="fld c2"><span>Para</span><select name="audience">' + [['all', 'Todos'], ['web', 'Clientes de página web'], ['marketing', 'Clientes de marketing']].map(function (o) { return '<option value="' + o[0] + '"' + (a.audience === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>' +
        '<label class="fld c2"><span>Hasta</span><input name="until" type="date" value="' + e(a.until) + '"></label></div>';
    }).join('') : '<p class="hint">Sin avisos activos.</p>';
  }
  function readAnn() { st.ann = Array.prototype.map.call(document.querySelectorAll('[data-ann]'), function (row, i) { var o = { id: (st.ann[i] && st.ann[i].id) || '' }; ['text', 'level', 'audience', 'until'].forEach(function (k) { o[k] = row.querySelector('[name=' + k + ']').value; }); return o; }); }

  /* ---------- Ajustes: estado del sistema ---------- */
  var origSet = A.views.ajustes;
  A.views.ajustes = function () {
    return Promise.all([Promise.resolve(origSet()), api.get('/admin/system')]).then(function (res) {
      var s = res[1].ok ? res[1].data : null; if (!s) return res[0];
      var row = function (a, ok, hint) { return '<div class="item"><div class="grow"><h4>' + a + '</h4>' + (hint && !ok ? '<small>' + hint + '</small>' : '') + '</div>' + (ok ? K.tag('activo') : K.tag('pendiente')) + '</div>'; };
      var panel = '<div class="panel" style="margin-bottom:16px"><h2>Listo para operar</h2><div class="list">' +
        row('Base de datos (versión ' + s.schema + ')', true) + row('Pagos con Stripe', s.stripe, 'Sin Stripe los pedidos se confirman a mano por WhatsApp. Agrega STRIPE_SECRET_KEY como Secret.') + row('Confirmación automática de pagos', s.webhook, 'Agrega STRIPE_WEBHOOK_SECRET.') +
        row('Captcha Turnstile', s.turnstile, 'Opcional: protege el formulario de spam (TURNSTILE_SECRET).') + row('Avisos por correo (Resend)', s.email, 'Opcional: RESEND_API_KEY + NOTIFY_EMAIL para enterarte de cada lead.') + row('Avisos por webhook (Discord/Slack)', s.notifyWebhook, 'Opcional: NOTIFY_WEBHOOK.') + '</div>' +
        '<p class="hint" style="margin:12px 0">' + [['clientes', s.rows.clients], ['leads', s.rows.leads], ['pedidos', s.rows.orders], ['mensajes de sitios', s.rows.site_leads]].map(function (x) { return x[1] + ' ' + x[0]; }).join(' · ') + '</p><button class="btn btn-ghost btn-sm" data-a="testnotify" type="button"><span>' + K.ic('bell') + ' Enviar aviso de prueba</span></button></div>';
      return res[0].replace(/(<div class="grid-a ga2"><div class="panel"><h2>Estado<\/h2>)/, panel + '$1');
    });
  };
  A.views.ajustes.after = origSet.after;

  /* ---------- diálogos: pedido y lead manual ---------- */
  function dialog(title, body, onSubmit) {
    var d = document.createElement('dialog'); d.className = 'modal';
    d.innerHTML = '<form class="modal-in" novalidate><h3>' + e(title) + '</h3>' + body + '<p class="form-msg" id="dm"></p><div class="row-btns"><button class="btn btn-ghost btn-sm" type="button" data-x><span>Cancelar</span></button><button class="btn btn-primary btn-sm" type="submit"><span>Guardar</span></button></div></form>';
    document.body.appendChild(d); function end() { d.close(); setTimeout(function () { d.remove(); }, 300); }
    d.querySelector('[data-x]').onclick = end; d.addEventListener('cancel', function (ev) { ev.preventDefault(); end(); });
    d.querySelector('form').onsubmit = function (ev) { ev.preventDefault(); onSubmit(ev.target, function (r) { if (!r.ok) { var m = d.querySelector('#dm'); m.className = 'form-msg err'; m.textContent = A.msg(r); return; } end(); A.render(true); }); };
    d.showModal();
  }
  function newOrder() {
    api.get('/admin/clients').then(function (r) {
      if (!r.ok) return A.fail(r);
      dialog('Pedido manual', '<div class="form-grid">' + K.field('Cliente', 'clientId', '', { type: 'select', options: r.data.clients.map(function (c) { return [c.id, c.business || c.name]; }), cls: 'full' }) +
        K.field('Paquete', 'packageId', 'sitio', { type: 'select', options: st.content.packages.items.map(function (p) { return [p.id, p.name + ' · ' + S.money(p.price)]; }).concat([['manual', 'Otro concepto']]), cls: 'full' }) +
        K.field('Concepto (si es otro)', 'packageName', '', { max: 100, opt: 1 }) + K.field('Monto (vacío = precio del paquete)', 'amount', '', { type: 'number', opt: 1 }) + '</div><label class="check"><input type="checkbox" name="paid" checked><span>Ya está pagado (activa el paquete)</span></label>',
        function (f, done) { api.post('/admin/orders', { clientId: +f.clientId.value, packageId: f.packageId.value, packageName: f.packageName.value, amount: f.amount.value, paid: f.paid.checked }).then(done); });
    });
  }
  function newLead() {
    dialog('Nuevo lead', '<div class="form-grid">' + K.field('Nombre', 'name', '', { req: 1, max: 80 }) + K.field('Negocio', 'business', '', { max: 100 }) + K.field('WhatsApp', 'whatsapp', '', { type: 'tel', max: 20 }) + K.field('Giro', 'niche', '', { max: 80, opt: 1 }) + K.field('Notas', 'message', '', { type: 'textarea', rows: 3, max: 600, cls: 'full', opt: 1 }) + '</div>',
      function (f, done) { api.post('/admin/leads', { name: f.name.value, business: f.business.value, whatsapp: f.whatsapp.value, niche: f.niche.value, message: f.message.value }).then(done); });
  }

  /* ---------- buscador Ctrl+K ---------- */
  var pal = null;
  function openSearch() {
    if (pal && pal.open) return;
    pal = document.createElement('dialog'); pal.className = 'palette';
    pal.innerHTML = '<input type="search" id="pq" placeholder="Buscar clientes, leads, tickets, usuarios…" autocomplete="off" aria-label="Buscar"><div class="pal-list" id="pl"><p class="hint" style="padding:14px">Escribe al menos 2 letras.</p></div>';
    document.body.appendChild(pal);
    var input = pal.querySelector('#pq'), list = pal.querySelector('#pl'), items = [], sel = 0;
    function draw() { list.innerHTML = items.length ? items.map(function (x, i) { return '<button class="pal-it' + (i === sel ? ' on' : '') + '" data-i="' + i + '" type="button"><span class="tag">' + e(x.type) + '</span><span><b>' + e(x.title) + '</b><small>' + e(x.sub) + '</small></span></button>'; }).join('') : '<p class="hint" style="padding:14px">Sin resultados.</p>'; }
    function go(x) {
      pal.close(); pal.remove();
      if (x.type === 'cliente') A.go('clientes').then(function () { A.openClient(x.id); });
      else if (x.type === 'lead') A.go('leads').then(function () { A.openLead(x.id); });
      else if (x.type === 'ticket') A.go('tickets').then(function () { A.openTicket(x.id); });
      else A.go('usuarios');
    }
    input.addEventListener('input', ui.debounce(function () { var q = input.value.trim(); if (q.length < 2) return; api.get('/admin/search?q=' + encodeURIComponent(q)).then(function (r) { items = r.ok ? r.data.results : []; sel = 0; draw(); }); }, 180));
    input.addEventListener('keydown', function (ev) { if (ev.key === 'ArrowDown') { sel = Math.min(items.length - 1, sel + 1); draw(); ev.preventDefault(); } else if (ev.key === 'ArrowUp') { sel = Math.max(0, sel - 1); draw(); ev.preventDefault(); } else if (ev.key === 'Enter' && items[sel]) go(items[sel]); });
    list.addEventListener('click', function (ev) { var b = ev.target.closest('[data-i]'); if (b) go(items[+b.dataset.i]); });
    pal.addEventListener('click', function (ev) { if (ev.target === pal) { pal.close(); pal.remove(); } });
    pal.addEventListener('close', function () { pal.remove(); });
    pal.showModal(); input.focus();
  }
  document.addEventListener('keydown', function (ev) { if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k' && A.drawer) { ev.preventDefault(); openSearch(); } });

  /* ---------- eventos ---------- */
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-a]'); if (!t) return; var a = t.dataset.a;
    if (a === 'search') return openSearch();
    if (a === 'neworder') return newOrder();
    if (a === 'newlead') return newLead();
    if (a === 'annadd') { readAnn(); if (st.ann.length >= 10) return ui.toast('Máximo 10 avisos'); st.ann.push({ id: '', text: '', level: 'info', audience: 'all', until: '' }); return paintAnn(); }
    if (a === 'annrm') { readAnn(); st.ann.splice(+t.dataset.i, 1); return paintAnn(); }
    if (a === 'testnotify') return api.post('/admin/system/test-notify').then(function (r) { if (!r.ok) return A.fail(r); ui.toast(r.data.webhook || r.data.email ? 'Aviso enviado. Revisa tu correo o canal.' : 'No hay avisos configurados todavía (ver lista de arriba).'); });
    if (a === 'gedit') return A.openClient(st.genId, 'web');
    if (a === 'gdl' && st.genClient) { var h = A.genHtml(st.genClient), l = document.createElement('a'); l.href = URL.createObjectURL(new Blob([h], { type: 'text/html' })); l.download = 'index.html'; document.body.appendChild(l); l.click(); setTimeout(function () { URL.revokeObjectURL(l.href); l.remove(); }, 500); return; }
    if (a === 'gsnip' && st.genClient) return K.copy('<script defer src="' + location.origin + '/t.js" data-key="' + (st.genClient._siteKey || '') + '"></script>');
  });
})(window);
