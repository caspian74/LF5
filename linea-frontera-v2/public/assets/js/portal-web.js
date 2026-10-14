/* Portal del cliente · proyecto de página web: avance, información, cambios, visitas y mensajes. */
(function (g) {
  'use strict';
  var P = g.LF.portal, S = g.LF.shared, K = g.LF.kit, ui = g.LF.ui, e = S.esc, st = P.st, V = P.V, api = P.api;
  var site = null, days = 30;

  var BRIEF = [
    ['about', 'Cuéntanos de tu negocio', 'textarea', 'Qué haces, desde cuándo, qué te hace diferente'],
    ['services', 'Servicios o productos', 'textarea', 'Uno por línea, con precio si quieres mostrarlo'],
    ['audience', 'Tu cliente ideal', 'text', 'Ej. familias de Zona Río, empresas pequeñas'],
    ['slogan', 'Frase o eslogan', 'text', 'Opcional'],
    ['colors', 'Colores y estilo', 'text', 'Ej. azul y blanco, limpio y profesional'],
    ['refs', 'Páginas que te gustan', 'textarea', 'Pega enlaces de ejemplo'],
    ['whatsapp', 'WhatsApp para recibir mensajes', 'tel', '664 123 4567'],
    ['hours', 'Horario', 'text', 'Lun a Vie 9:00–18:00'],
    ['address', 'Dirección', 'text', 'Calle, colonia, ciudad'],
    ['social', 'Redes sociales', 'textarea', 'Enlaces de Instagram, Facebook, TikTok'],
    ['extra', 'Algo más que debamos saber', 'textarea', '']
  ];
  var SRC = { directo: 'Directo', google: 'Google', facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', whatsapp: 'WhatsApp', bing: 'Bing', otro: 'Otros sitios' };
  var DEV = { movil: 'Celular', escritorio: 'Computadora', tablet: 'Tablet' };
  var CH_TAG = { recibida: 'info', 'en proceso': 'warn', lista: 'ok', rechazada: 'bad' };

  function web() { return st.d.client.data.web; }
  function ro() { return P.RO; }

  function loadSite() {
    if (ro()) { site = st.d.site || null; return Promise.resolve(site); }
    return api.get('/portal/site?days=' + days).then(function (r) { site = r.ok ? r.data : null; return site; });
  }
  function bars(rows, labels, tot) {
    if (!rows.length) return '<p class="hint">Aún no hay datos.</p>';
    var max = Math.max.apply(null, rows.map(function (r) { return r.n; })) || 1;
    return '<div class="bars-h">' + rows.map(function (r) { return '<div class="bh"><span>' + e(labels[r.k] || r.k) + '</span><div class="meter"><b style="width:' + Math.max(4, r.n / max * 100) + '%"></b></div><b>' + S.num(r.n) + '</b></div>'; }).join('') + '</div>';
  }
  function linkBtn(url, label, cls) { return url ? '<a class="btn btn-sm ' + (cls || 'btn-ghost') + '" href="' + e(url) + '" target="_blank" rel="noopener"><span>' + e(label) + '</span></a>' : ''; }

  /* ---------- Mi página web ---------- */
  V.sitio = function () {
    var w = web(), stg = S.webStage(w), idx = S.WEB_STAGES.indexOf(stg), bd = S.briefDone(w), data = st.d.client.data;
    var live = w.stage === 'publicado' && w.url;
    var hero = '<div class="hero-web"><span class="kk">Tu proyecto de página web</span><h2>' + (live ? '¡Tu página está en línea!' : e(stg.t)) + '</h2><p>' + e(live ? 'Ya la pueden encontrar tus clientes. Aquí ves cuántas visitas y mensajes recibe.' : (stg.d || '')) + '</p>' +
      '<div class="stages" role="list" aria-label="Avance del proyecto">' + S.WEB_STAGES.map(function (x, i) { return '<div class="stg ' + (i < idx || live ? 'done' : i === idx ? 'now' : '') + '" role="listitem"><i></i>' + e(x.t.replace(/^Tu /, '').split(' ')[0]) + '</div>'; }).join('') + '</div>' +
      '<div class="row-btns">' + (live ? linkBtn(w.url, 'Ver mi página', 'btn-primary') : linkBtn(w.previewUrl, 'Ver el avance', 'btn-primary')) + (w.dueDate && !live ? '<span class="tag info" style="align-self:center">Entrega estimada: ' + e(ui.fmtDate(w.dueDate)) + '</span>' : '') + '</div></div>';
    var chk = [
      ['Llena tu información', bd.pct === 100, 'brief', bd.filled + ' de ' + bd.total + ' datos · mientras más completo, más rápido avanzamos'],
      ['Revisa el diseño', !!w.previewUrl && idx >= 3, w.previewUrl ? 'cambios' : '', w.previewUrl ? 'Ya puedes ver el avance y pedir cambios' : 'Te avisamos cuando haya algo que revisar'],
      ['Dominio ' + (w.domain ? '(' + w.domain + ')' : ''), w.domainStatus === 'activo', '', 'Estado: ' + w.domainStatus],
      ['Candado de seguridad (SSL)', w.ssl === 'activo', '', 'Estado: ' + w.ssl],
      ['Publicada', live, live ? 'visitas' : '', live ? 'Revisa tus visitas y mensajes' : 'Último paso: la publicamos contigo']
    ];
    var list = '<div class="checklist">' + chk.map(function (c) { return '<' + (c[2] ? 'button type="button" data-v="' + c[2] + '"' : 'div') + ' class="cl ' + (c[1] ? 'ok' : '') + '" style="' + (c[2] ? 'width:100%;text-align:left;border:1px solid var(--line);cursor:pointer;font:inherit' : '') + '"><span class="dotc">' + (c[1] ? '✓' : '•') + '</span><span class="grow"><b>' + e(c[0]) + '</b><small>' + e(c[3]) + '</small></span></' + (c[2] ? 'button' : 'div') + '>'; }).join('') + '</div>';
    var tl = w.timeline.length ? '<ul class="tl">' + w.timeline.slice(0, 8).map(function (t) { return '<li>' + e(t.text) + '<small>' + e(ui.fmtDate(t.at, true)) + '</small></li>'; }).join('') + '</ul>' : '<p class="hint">Aquí irás viendo cada avance.</p>';
    var mini = live ? '<div class="grid-a ga4" style="margin-top:16px" id="mini-stats"><div class="skel"></div></div>' : '';
    var maint = w.maintenance ? K.tag('activo') + ' <span class="hint">Mantenimiento mensual</span>' : '<span class="hint">Sin mantenimiento mensual · <a href="#pagos" data-v="pagos">Ver opciones</a></span>';
    return P.head('Mi página web', e(st.d.client.business || 'Tu proyecto')) + hero + mini +
      '<div class="grid-a ga-1-2" style="margin-top:16px"><div class="panel"><h2>Qué sigue</h2>' + list + '</div><div class="panel"><h2>Historial</h2>' + tl + '<div style="margin-top:14px">' + maint + '</div></div></div>' +
      (w.domain || w.url ? '<div class="panel" style="margin-top:16px"><h2>Datos de tu sitio</h2><div class="linkrow"><span class="hint">Dirección:</span>' + (w.url ? '<a class="big" href="' + e(w.url) + '" target="_blank" rel="noopener">' + e(w.url) + '</a>' : '<span>' + e(w.domain) + '</span>') + '</div>' + (w.domainRenew ? '<p class="hint" style="margin-top:6px">Renovación del dominio: ' + e(ui.fmtDate(w.domainRenew)) + '</p>' : '') + '</div>' : '');
  };
  function afterSitio() {
    var box = document.getElementById('mini-stats'); if (!box) return;
    loadSite().then(function (s) {
      if (!s || !document.getElementById('mini-stats')) return;
      box.innerHTML = K.stat('Visitas (30 días)', S.num(s.totals.view), '', 'var(--accent2)') + K.stat('Clics a WhatsApp', S.num(s.totals.wa), '', 'var(--accent3)') + K.stat('Llamadas', S.num(s.totals.call), '', 'var(--accent)') + K.stat('Mensajes del formulario', S.num(s.totals.form), '', 'var(--sun)');
    });
  }

  /* ---------- Visitas y mensajes ---------- */
  V.visitas = function () {
    var sel = '<label class="fld" style="min-width:150px"><span class="sr">Periodo</span><select id="sdays">' + [[7, 'Últimos 7 días'], [30, 'Últimos 30 días'], [90, 'Últimos 90 días']].map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === days ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>';
    return P.head('Visitas y mensajes', 'Lo que pasa en tu página', ro() ? '' : sel) + '<div id="vis"><div class="skel" style="min-height:260px"></div></div>';
  };
  function afterVisitas() {
    var box = document.getElementById('vis'); if (!box) return;
    loadSite().then(function (s) {
      box = document.getElementById('vis'); if (!box) return;
      if (!s) { box.innerHTML = P.empty('Aún no hay datos', 'Cuando tu página esté publicada verás aquí las visitas.'); return; }
      var t = s.totals, rows = s.series.map(function (r) { return { date: r.d, view: r.view, wa: r.wa, form: r.form }; });
      var conv = t.view ? (t.wa + t.call + t.form) / t.view * 100 : 0;
      var leads = s.leads.length ? '<div class="list">' + s.leads.map(function (l) {
        return '<div class="item"><span class="svc-ic" style="width:42px;height:42px;margin:0;flex:none">' + K.ic('mail') + '</span><div class="grow"><h4>' + e(l.name) + '</h4><small>' + e([l.phone, l.email].filter(Boolean).join(' · ')) + ' · ' + e(ui.ago(l.created_at)) + '</small>' + (l.message ? '<p style="margin-top:4px;font-size:.92rem">' + e(l.message) + '</p>' : '') + '</div>' +
          (l.phone ? '<a class="btn-icon" href="' + e(S.waLink(l.phone, 'Hola ' + l.name + ', recibimos tu mensaje desde la página.')) + '" target="_blank" rel="noopener" aria-label="Responder por WhatsApp">' + K.ic('wa') + '</a>' : '') +
          (ro() ? K.tag(l.status) : '<button class="btn btn-sm ' + (l.status === 'nuevo' ? 'btn-primary' : 'btn-ghost') + '" data-sl="' + l.id + '" data-s="' + (l.status === 'nuevo' ? 'atendido' : 'nuevo') + '" type="button"><span>' + (l.status === 'nuevo' ? 'Marcar atendido' : 'Atendido ✓') + '</span></button>') + '</div>';
      }).join('') + '</div>' : '<p class="hint">Todavía no llegan mensajes del formulario. Cuando alguien escriba, lo verás aquí y te avisamos por correo.</p>';
      var snip = ro() || !s.key ? '' : '<details class="panel acc-p" style="margin-top:16px"><summary style="cursor:pointer;font-weight:700">¿Ya tienes otra página? Conéctala a este panel</summary><p class="hint" style="margin:10px 0">Pega esta línea dentro del &lt;head&gt; de tu página. Cuenta visitas, clics a WhatsApp y llamadas, y envía los formularios con <code>data-lf</code> a este panel.</p><div class="snip" id="snip">' + e('<script defer src="' + location.origin + '/t.js" data-key="' + s.key + '"></script>') + '</div><button class="btn btn-ghost btn-sm" id="copy-snip" type="button" style="margin-top:10px"><span>Copiar código</span></button></details>';
      box.innerHTML = '<div class="grid-a ga4">' + K.stat('Visitas', S.num(t.view), '', 'var(--accent2)') + K.stat('Clics a WhatsApp', S.num(t.wa), '', 'var(--accent3)') + K.stat('Llamadas', S.num(t.call), '', 'var(--accent)') + K.stat('Mensajes', S.num(t.form), conv ? S.pct(conv) + ' de visitas contactan' : '', 'var(--sun)') + '</div>' +
        '<div class="panel" style="margin-top:16px"><h2>Visitas por día</h2>' + K.line(rows, [{ key: 'view', label: 'Visitas', color: '#6C4DFF' }, { key: 'wa', label: 'WhatsApp', color: '#3DDBB0' }, { key: 'form', label: 'Mensajes', color: '#FF3B5C' }], { label: 'Visitas por día' }) + '</div>' +
        '<div class="grid-a ga3" style="margin-top:16px"><div class="panel"><h2>De dónde llegan</h2>' + bars(s.sources, SRC) + '</div><div class="panel"><h2>Dispositivo</h2>' + bars(s.devices, DEV) + '</div><div class="panel"><h2>Páginas más vistas</h2>' + bars(s.pages, {}) + '</div></div>' +
        '<div class="panel" style="margin-top:16px"><h2>Mensajes de tu formulario</h2>' + leads + '</div>' + snip;
      K.bindCharts(box);
    });
  }

  /* ---------- Cambios ---------- */
  V.cambios = function () {
    var w = web(), used = w.changes.filter(function (c) { return c.status !== 'rechazada'; }).length, left = Math.max(0, w.changesIncluded - used);
    var info = '<div class="banner ' + (left ? 'info' : 'warn') + '">' + K.ic('wand') + '<span>' + (left ? 'Te quedan <b>' + left + '</b> ronda' + (left > 1 ? 's' : '') + ' de ajustes incluidas.' : 'Ya usaste tus rondas incluidas. Seguimos atendiendo, pero podemos cotizarte los cambios extra o activar el mantenimiento mensual.') + '</span></div>';
    var form = ro() ? '' : '<form class="panel" id="chg-f" novalidate><h2>Pedir un cambio</h2><div class="form-grid"><div class="full">' + K.field('¿Qué quieres cambiar?', 'title', '', { req: 1, max: 120, ph: 'Ej. Cambiar la foto del inicio' }) + '</div><div class="full">' + K.field('Detalles', 'detail', '', { type: 'textarea', max: 1500, rows: 4, opt: 1, ph: 'Texto nuevo, enlace a la imagen, qué sección…' }) + '</div>' + K.field('Sección', 'section', '', { type: 'select', options: [['', 'No sé / general'], ['Inicio', 'Inicio'], ['Servicios', 'Servicios'], ['Nosotros', 'Nosotros'], ['Contacto', 'Contacto'], ['Precios', 'Precios'], ['Otra', 'Otra']], opt: 1 }) + '</div><p class="form-msg" id="chg-m"></p><button class="btn btn-primary btn-sm" type="submit"><span>Enviar solicitud</span></button></form>';
    var list = w.changes.length ? '<div class="list">' + w.changes.map(function (c) {
      return '<div class="chg"><div style="display:flex;gap:10px;justify-content:space-between;align-items:start"><b>' + e(c.title) + '</b><span class="tag ' + (CH_TAG[c.status] || '') + '">' + e(c.status) + '</span></div>' + (c.detail ? '<p class="hint">' + e(c.detail) + '</p>' : '') + '<small class="hint">' + e(c.section ? c.section + ' · ' : '') + e(ui.fmtDate(c.at)) + '</small>' + (c.reply ? '<div class="rep-line"><b>Equipo:</b> ' + e(c.reply) + '</div>' : '') + '</div>';
    }).join('') + '</div>' : '<p class="hint">Todavía no has pedido cambios.</p>';
    return P.head('Cambios', 'Pídenos ajustes y sigue su estado') + info + '<div class="grid-a ga-1-2">' + '<div class="panel"><h2>Tus solicitudes</h2>' + list + '</div>' + form + '</div>';
  };

  /* ---------- Mi información (brief) y archivos ---------- */
  V.brief = function () {
    var w = web(), b = w.brief, bd = S.briefDone(w);
    var fields = BRIEF.map(function (f) { return K.field(f[1], f[0], b[f[0]], { type: f[2] === 'textarea' ? 'textarea' : f[2], rows: 3, max: f[2] === 'textarea' ? 1500 : 200, ph: f[3], cls: f[2] === 'textarea' ? 'full' : '', opt: 1 }); }).join('');
    var files = w.files.length ? '<div class="list">' + w.files.map(function (f) { return '<div class="item"><span class="svc-ic" style="width:42px;height:42px;margin:0;flex:none">' + K.ic('link') + '</span><div class="grow"><h4>' + e(f.title) + '</h4><small>' + (f.by === 'equipo' ? 'Del equipo' : 'Tuyo') + '</small></div><a class="btn btn-sm btn-ghost" href="' + e(f.url) + '" target="_blank" rel="noopener"><span>Abrir</span></a>' + (!ro() && f.by === 'cliente' ? '<button class="btn-icon danger" data-rmfile="' + e(f.id) + '" type="button" aria-label="Quitar">' + K.ic('trash') + '</button>' : '') + '</div>'; }).join('') + '</div>' : '<p class="hint">Aquí van tu logo, fotos y documentos. Súbelos a Google Drive o Dropbox y pega el enlace.</p>';
    return P.head('Mi información', 'Con esto armamos tu página', '<div style="min-width:180px"><div class="hint">Completo al ' + bd.pct + '%</div><div class="meter" style="margin-top:6px"><b style="width:' + bd.pct + '%"></b></div></div>') +
      '<form class="panel" id="brief-f" novalidate><div class="form-grid">' + fields + '</div><p class="form-msg" id="brief-m"></p>' + (ro() ? '' : '<button class="btn btn-primary btn-sm" type="submit"><span>Guardar información</span></button>') + '</form>' +
      '<div class="panel" style="margin-top:16px"><h2>Logo, fotos y archivos</h2>' + files + (ro() ? '' : '<form id="file-f" class="form-grid" style="margin-top:14px" novalidate>' + K.field('Nombre', 'title', '', { req: 1, max: 100, ph: 'Logo en alta' }) + K.field('Enlace (https)', 'url', '', { type: 'url', req: 1, max: 600, ph: 'https://drive.google.com/…' }) + '<div class="full"><p class="form-msg" id="file-m"></p><button class="btn btn-ghost btn-sm" type="submit"><span>Agregar enlace</span></button></div></form>') + '</div>';
  };

  /* ---------- pintado y eventos ---------- */
  P.A.sitio = afterSitio; P.A.visitas = afterVisitas;

  document.addEventListener('change', function (ev) {
    if (ev.target.id === 'sdays') { days = +ev.target.value; site = null; P.paint(); }
  });
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-sl],[data-rmfile],#copy-snip'); if (!t) return;
    if (t.id === 'copy-snip') return K.copy(document.getElementById('snip').textContent);
    if (t.dataset.sl) { t.disabled = true; return api.patch('/portal/site-leads/' + t.dataset.sl, { status: t.dataset.s }).then(function () { site = null; P.paint(); }); }
    if (t.dataset.rmfile) return api.del('/portal/web/file/' + encodeURIComponent(t.dataset.rmfile)).then(function (r) { if (!r.ok) return ui.toast(api.errText(r)); return P.load(true).then(P.paint); });
  });
  document.addEventListener('submit', function (ev) {
    var f = ev.target, id = f.id; if (!/^(chg-f|brief-f|file-f)$/.test(id)) return; ev.preventDefault();
    var d = {}; new FormData(f).forEach(function (v, k) { d[k] = v; });
    if (id === 'chg-f') {
      if (!String(d.title || '').trim()) return P.msgBox('chg-m', 0, 'Escribe qué quieres cambiar.');
      api.post('/portal/web/change', d).then(function (r) { if (!r.ok) return P.msgBox('chg-m', 0, r.data && r.data.error === 'too_many_pending' ? 'Ya tienes varias solicitudes en proceso. Espera a que avancemos con ellas.' : api.errText(r)); ui.toast('Solicitud enviada'); return P.load(true).then(P.paint); });
    }
    if (id === 'brief-f') api.put('/portal/web/brief', { brief: d }).then(function (r) { P.msgBox('brief-m', r.ok, r.ok ? 'Guardado. ¡Gracias!' : api.errText(r)); if (r.ok) P.load(true); });
    if (id === 'file-f') {
      if (!/^https:\/\//i.test(d.url || '')) return P.msgBox('file-m', 0, 'El enlace debe empezar con https://');
      api.post('/portal/web/file', d).then(function (r) { if (!r.ok) return P.msgBox('file-m', 0, api.errText(r)); ui.toast('Enlace agregado'); return P.load(true).then(P.paint); });
    }
  });
})(window);
