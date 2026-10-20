/* Línea Frontera · render puro de la landing (HTML como string). Se usa en bake (Node) y en el navegador.
   Identidad v3: negro, marfil, rojo señal, dorado; monograma LF con estrella; horizonte de Tijuana en semitono. */
(function (g) {
  'use strict';
  var S = g.LF && g.LF.shared ? g.LF.shared : (typeof require !== 'undefined' ? require('./lf-shared.js') : null);
  var e = S.esc;

  var ICONS = {
    megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z"/><path d="M15 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 4v16M16 4v16M3 9h5M3 15h5M16 9h5M16 15h5"/>',
    pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12Z"/><path d="M8.5 11h7M8.5 14h4"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="m7 15 4-4 3 3 5-6"/>',
    window: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    wa: '<path d="M20 12a8 8 0 0 1-11.9 7L4 20l1.1-4A8 8 0 1 1 20 12Z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2L9 8.5Z"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6L12 16.7 6.6 19.6l1.1-6L3.2 9.4l6.1-.8L12 3Z"/>'
  };
  function icon(n, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[n] || ICONS.star) + '</svg>';
  }

  /* ---------- utilidades de marcado ---------- */
  function hl(s) { return e(s).replace(/\|\|(.+?)\|\|/g, '<em class="hl">$1</em>'); }

  /* Divide un título en palabras con máscara (para la animación de entrada). Respeta ||resaltado||
     y mantiene la puntuación pegada a su palabra ("encuentre," no se separa). */
  function words(s) {
    var toks = [], cur = [], hlOn = false;
    String(s == null ? '' : s).split(/(\|\|)/).forEach(function (seg) {
      if (seg === '||') { hlOn = !hlOn; return; }
      seg.split(/(\s+)/).forEach(function (bit) {
        if (!bit) return;
        if (/^\s+$/.test(bit)) { if (cur.length) toks.push(cur); cur = []; return; }
        cur.push({ t: bit, h: hlOn });
      });
    });
    if (cur.length) toks.push(cur);
    return toks.map(function (parts, n) {
      var inner = parts.map(function (p) { return p.h ? '<em class="hl">' + e(p.t) + '</em>' : e(p.t); }).join('');
      return '<span class="w"><span style="--wi:' + n + '">' + inner + '</span></span>';
    }).join(' ');
  }

  function rv(i, kind) { return ' data-reveal' + (kind ? '="' + kind + '"' : '') + ' style="--i:' + i + '"'; }

  var secN = 0;
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function head(kicker, title, sub, center, idAttr) {
    secN++;
    return '<header class="sec-head' + (center ? ' center' : '') + '">' +
      '<p class="label"' + rv(0) + '><span class="label-n">' + pad2(secN) + '</span><span class="label-t">' + e(kicker || '') + '</span></p>' +
      '<h2' + (idAttr ? ' id="' + idAttr + '"' : '') + rv(1, 'words') + '>' + words(title) + '</h2>' +
      (sub ? '<p class="lead"' + rv(2) + '>' + e(sub) + '</p>' : '') + '</header>';
  }

  /* ---------- piezas de marca (SVG) ---------- */
  function starPath(cx, cy, r, w) {
    return 'M' + cx + ' ' + (cy - r) + 'Q' + (cx + w) + ' ' + (cy - w) + ' ' + (cx + r) + ' ' + cy + 'Q' + (cx + w) + ' ' + (cy + w) + ' ' + cx + ' ' + (cy + r) +
      'Q' + (cx - w) + ' ' + (cy + w) + ' ' + (cx - r) + ' ' + cy + 'Q' + (cx - w) + ' ' + (cy - w) + ' ' + cx + ' ' + (cy - r) + 'Z';
  }
  function star(cls) {
    return '<svg class="star ' + (cls || '') + '" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d="' + starPath(50, 50, 50, 7) + '" fill="currentColor"/></svg>';
  }
  /* Monograma LF con estrella (trazo propio de la marca) */
  function mark(cls) {
    return '<svg class="lf-mark ' + (cls || '') + '" viewBox="215 100 610 400" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M440 125h56L306 355h200l-26 37H228z"/>' +
      '<path fill="currentColor" d="M525 232h190l-24 40H558l-21 28h114l-24 42H504L388 490h-68z"/>' +
      '<path class="lf-mark-star" fill="currentColor" d="' + starPath(748, 178, 72, 9) + '"/></svg>';
  }
  function wordmark(c, cls) {
    var n = String(c.brand.name || '').trim(), parts = n.split(/\s+/);
    var l1 = parts.length > 1 ? parts.slice(0, Math.ceil(parts.length / 2)).join(' ') : n, l2 = parts.length > 1 ? parts.slice(Math.ceil(parts.length / 2)).join(' ') : '';
    return '<span class="wordmark ' + (cls || '') + '"><span>' + e(l1) + '</span>' + (l2 ? '<span>' + e(l2) + '</span>' : '') + '</span>';
  }
  /* Sello circular con texto */
  var stampN = 0;
  function stamp(text, cls, inner) {
    var id = 'stp' + (++stampN);
    return '<span class="stamp ' + (cls || '') + '" aria-hidden="true"><svg viewBox="0 0 200 200" focusable="false"><defs><path id="' + id + '" d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1-156 0"/></defs>' +
      '<circle cx="100" cy="100" r="97" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<g class="stamp-ring"><text><textPath href="#' + id + '" startOffset="0" textLength="486" lengthAdjust="spacing">' + e(text) + '</textPath></text></g></svg>' +
      '<span class="stamp-in">' + (inner || mark()) + '</span></span>';
  }

  /* Franjas diagonales rojo/dorado (patrón de la marca) */
  function stripes(cls) {
    return '<svg class="stripes ' + (cls || '') + '" viewBox="0 0 600 600" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      '<path class="s1" d="M0 600 600 0v70L70 600z"/><path class="s2" d="M110 600 600 110v42L152 600z"/><path class="s3" d="M190 600 600 190v20L210 600z"/></svg>';
  }

  /* Horizonte de Tijuana en semitono: cerros, ciudad, el Arco, palmeras y el muro fronterizo */
  function skyline() {
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var b = '', x = 0;
    while (x < 1600) {
      var w = 34 + Math.round(rnd() * 70), h = 70 + Math.round(rnd() * 150);
      if (x > 330 && x < 420) h = 300; // torre
      if (x > 1240 && x < 1320) h = 250;
      b += '<rect x="' + x + '" y="' + (600 - h) + '" width="' + w + '" height="' + (h + 10) + '"/>';
      x += w + 2 + Math.round(rnd() * 6);
    }
    var win = '';
    for (var i = 0; i < 70; i++) { win += '<rect x="' + Math.round(rnd() * 1580) + '" y="' + Math.round(420 + rnd() * 160) + '" width="4" height="6"/>'; }
    function palm(px, py, s) {
      var t = 'M' + px + ' 610 Q' + (px - 8 * s) + ' ' + (py + 120 * s) + ' ' + px + ' ' + py;
      var fr = '';
      [[-70, -8], [-58, 22], [-30, 36], [62, 4], [52, 30], [26, 40], [-10, -30], [24, -26]].forEach(function (f) {
        fr += 'M' + px + ' ' + py + ' q' + (f[0] * s * .5) + ' ' + (f[1] * s * .2 - 26 * s) + ' ' + (f[0] * s) + ' ' + (f[1] * s);
      });
      return '<path class="palm-t" d="' + t + '" stroke-width="' + (6 * s) + '"/><path class="palm-f" d="' + fr + '" stroke-width="' + (4.5 * s) + '"/>';
    }
    var fence = '';
    for (var f = 0; f < 1600; f += 11) fence += 'M' + f + ' 700V' + (606 + ((f / 11) % 3)) + ' ';
    return '<svg class="skyline" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">' +
      '<defs><pattern id="ht" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="1.7" fill="currentColor"/></pattern>' +
      '<pattern id="ht2" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="3" cy="3" r="1.1" fill="currentColor"/></pattern>' +
      '<linearGradient id="fadeUp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".55" stop-color="#fff"/></linearGradient><mask id="mk"><rect width="1600" height="700" fill="url(#fadeUp)"/></mask></defs>' +
      '<g class="sk-hills" data-par="0.06"><path mask="url(#mk)" fill="url(#ht)" d="M0 470 120 410 230 432 360 330 470 380 560 300 700 372 820 318 930 386 1060 296 1180 352 1300 286 1420 360 1600 300V700H0z"/></g>' +
      '<g class="sk-city" data-par="0.12"><g class="sk-blds">' + b + '</g><g class="sk-win">' + win + '</g>' +
      '<g class="sk-arch"><path d="M1010 600V470a90 90 0 0 1 180 0v130" fill="none" stroke-width="14"/><circle cx="1100" cy="380" r="24" fill="none" stroke-width="6"/><path d="M1100 366v14l9 6" fill="none" stroke-width="4"/></g>' +
      '<path class="sk-halftone" fill="url(#ht2)" d="M0 600h1600v12H0z"/></g>' +
      '<g class="sk-palms" data-par="0.2">' + palm(170, 420, 1.1) + palm(260, 470, .8) + palm(1440, 400, 1.2) + palm(1520, 470, .85) + palm(880, 470, .7) + '</g>' +
      '<path class="sk-fence" d="' + fence + '"/></svg>';
  }

  /* ---------- gráfica de ejemplo (SVG sin JS) ---------- */
  function areaChart(values, w, h) {
    var max = Math.max.apply(null, values) || 1, n = values.length, pad = 6;
    var pts = values.map(function (v, i) { return [pad + i * (w - pad * 2) / (n - 1), h - pad - (v / max) * (h - pad * 2)]; });
    var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var area = line + ' L' + pts[n - 1][0].toFixed(1) + ' ' + (h - pad) + ' L' + pts[0][0].toFixed(1) + ' ' + (h - pad) + ' Z';
    var gid = 'ga' + w;
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="chart" role="img" aria-label="Gráfica de ejemplo de mensajes por día" preserveAspectRatio="none">' +
      '<defs><linearGradient id="' + gid + '" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent2)" stop-opacity=".32"/><stop offset="1" stop-color="var(--accent2)" stop-opacity="0"/></linearGradient></defs>' +
      '<path class="chart-area" d="' + area + '" fill="url(#' + gid + ')"/><path class="chart-line" pathLength="1" d="' + line + '" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>';
  }

  /* ---------- secciones ---------- */
  var R = {};

  R.problem = function (c) {
    var p = c.problem;
    return '<section class="sec" id="problema" aria-labelledby="h-problema"><div class="wrap">' + head('Te entendemos', p.title, '', false, 'h-problema') +
      '<ol class="pains">' + p.items.map(function (it, i) {
        return '<li class="pain"' + rv(i + 1) + '><span class="pain-n" aria-hidden="true">' + pad2(i + 1) + '</span><div><h3>' + e(it.t) + '</h3><p>' + e(it.d) + '</p></div>' + star('pain-star') + '</li>';
      }).join('') + '</ol></div></section>';
  };

  R.services = function (c) {
    var s = c.services;
    return '<section class="sec" id="servicios"><div class="wrap">' + head('Servicios', s.title, s.sub) +
      '<div class="svc-grid">' + s.items.map(function (it, i) {
        return '<article class="card svc"' + rv(i % 3 + 1) + '><div class="svc-top"><span class="svc-n">Servicio / ' + pad2(i + 1) + '</span><span class="svc-ic">' + icon(it.icon) + '</span></div>' +
          '<h3>' + e(it.t) + '</h3><p>' + e(it.d) + '</p><span class="svc-bar" aria-hidden="true"></span></article>';
      }).join('') + '</div></div></section>';
  };

  R.web = function (c) {
    var w = c.web, sitio = S.packageOf(c, 'sitio'), price = sitio ? S.money(sitio.price) : '';
    return '<section class="sec paper web-sec" id="paginas-web"><div class="wrap web-grid">' +
      '<div class="web-copy">' + head('Páginas web', w.title, w.sub) +
      '<ul class="web-points">' + w.points.map(function (pt, i) { return '<li' + rv(i + 2) + '><span class="tick" aria-hidden="true">' + icon('check') + '</span><div><h3>' + e(pt.t) + '</h3><p>' + e(pt.d) + '</p></div></li>'; }).join('') + '</ul>' +
      '<div class="cta-row"' + rv(5) + '><a class="btn btn-dark" href="' + e(S.safeUrl(w.ctaLink) || '#paquetes') + '" data-track="cta_clicked" data-where="web_cta"><span>' + e(w.cta) + (price ? ' · ' + price : '') + '</span>' + icon('arrow') + '</a></div></div>' +
      '<div class="browser" data-reveal="build" style="--i:1" aria-hidden="true"><div class="browser-bar"><i></i><i></i><i></i><span>tunegocio.mx</span></div>' +
      '<div class="browser-body"><div class="b-nav"><b></b><span></span><span></span><span></span></div>' +
      '<div class="b-hero"><span class="b-kick"></span><b></b><b class="s"></b><span class="b-btn"></span></div>' +
      '<div class="b-cards"><span></span><span></span><span></span></div><div class="b-wa">' + icon('wa') + '<span>¡Hola! ¿Tienen cita hoy?</span></div></div>' +
      '<span class="b-cursor"></span></div></div></section>';
  };

  R.process = function (c) {
    var p = c.process;
    return '<section class="sec" id="proceso"><div class="wrap">' + head('Proceso', p.title) +
      '<ol class="steps" data-steps style="--n:' + p.steps.length + '">' + p.steps.map(function (st, i) {
        return '<li class="step"' + rv(i + 1) + '><span class="step-n">' + pad2(i + 1) + '</span><h3>' + e(st.t) + '</h3><p>' + e(st.d) + '</p></li>';
      }).join('') + '</ol></div></section>';
  };

  R.demo = function (c) {
    var d = c.demo, ex = S.exampleClientData(), t = S.totals(ex);
    var leads = ex.series.map(function (r) { return r.leads; });
    var kp = [
      ['Mensajes del mes', S.num(t.leads)],
      ['Costo por mensaje', S.money(t.cpl)],
      ['Ventas cerradas', S.num(t.sales)],
      ['Retorno', t.roas.toFixed(1) + 'x']
    ];
    return '<section class="sec" id="panel"><div class="wrap">' + head('Panel del cliente', d.title, d.sub) +
      '<div class="mock"' + rv(2, 'rise') + '><div class="mock-bar"><i></i><i></i><i></i><span>' + e(c.brand.domain) + '/cuenta</span><b class="tag-ex">Ejemplo</b></div>' +
      '<div class="mock-body"><div class="kpis">' + kp.map(function (k, i) {
        return '<div class="kpi"><span>' + e(k[0]) + '</span><strong data-count="' + e(k[1]) + '">' + e(k[1]) + '</strong>' + (i === 0 ? '<em>+18% vs. mes anterior</em>' : '') + '</div>';
      }).join('') + '</div>' +
      '<div class="mock-grid"><div class="mock-chart"><h4>Mensajes por día</h4>' + areaChart(leads, 520, 150) + '</div>' +
      '<div class="mock-list"><h4>Campañas</h4>' + ex.campaigns.map(function (cp) {
        return '<div class="row"><span class="dot ' + (cp.status === 'activa' ? 'on' : '') + '"></span><span class="grow">' + e(cp.name) + '</span><b>' + S.num(cp.leads) + '</b></div>';
      }).join('') + '<h4>Posiciones en Google</h4>' + ex.seo.rankings.map(function (r) {
        return '<div class="row"><span class="grow">' + e(r.kw) + '</span><b>#' + r.pos + '</b></div>';
      }).join('') + '</div></div></div></div></div></section>';
  };

  R.packages = function (c) {
    var p = c.packages;
    return '<section class="sec" id="paquetes"><div class="wrap">' + head('Paquetes', p.title, p.sub, true) +
      '<div class="pkgs" style="--cols:' + Math.min(Math.max(p.items.length, 1), 4) + '">' + p.items.map(function (pk, i) {
        var one = pk.kind === 'unico';
        return '<article class="card pkg' + (pk.featured ? ' featured' : '') + (one ? ' unico' : '') + '"' + rv(i + 1) + ' data-pkg-card="' + e(pk.id) + '">' +
          (pk.featured ? stamp('Recomendado ✦ Línea Frontera ✦ Est. 2026 ✦ ', 'pkg-stamp', star()) : '') +
          '<div class="pkg-head">' + (pk.badge ? '<span class="badge">' + e(pk.badge) + '</span>' : '<span class="badge ghost">' + (one ? 'Pago único' : 'Mensual') + '</span>') +
          '<h3>' + e(pk.name) + '</h3><p class="tagline">' + e(pk.tagline) + '</p></div>' +
          '<p class="price"><span class="amt">' + S.money(pk.price) + '</span><span class="per">MXN ' + (one ? 'pago único' : '/ mes') + '</span></p>' +
          (one && pk.priceNote ? '<p class="price-note">' + e(pk.priceNote) + '</p>' : '') +
          '<ul class="ticks">' + pk.features.map(function (f) { return '<li>' + icon('check') + '<span>' + e(f) + '</span></li>'; }).join('') + '</ul>' +
          (one && pk.maint ? '<p class="maint">' + icon('plus') + '<span>Mantenimiento opcional: <b>' + S.money(pk.maint) + '/mes</b> (cambios, respaldos y soporte)</span></p>' : '') +
          (one && pk.delivery ? '<p class="delivery">' + e(pk.delivery) + '</p>' : '') +
          '<div class="pkg-foot"><button class="btn ' + (pk.featured ? 'btn-primary' : one ? 'btn-dark' : 'btn-ghost') + ' block" type="button" data-buy="' + e(pk.id) + '"><span>' + (one ? 'Quiero mi página' : 'Contratar ' + e(pk.name)) + '</span>' + icon('arrow') + '</button>' +
          '<a class="mini-link" href="' + e(S.waLink(c.brand.whatsapp, 'Hola, me interesa el paquete ' + pk.name + ' de Línea Frontera.')) + '" target="_blank" rel="noopener" data-track="cta_clicked" data-where="paquete_' + e(pk.id) + '">Prefiero hablarlo primero</a></div>' +
          '</article>';
      }).join('') + '</div>' +
      (p.addons.length ? '<div class="addons"' + rv(4) + '><strong>Extras</strong>' + p.addons.map(function (a) { return '<span class="chip">' + e(a.name) + ' · ' + e(a.price) + '</span>'; }).join('') + '</div>' : '') +
      (p.note ? '<p class="fine center"' + rv(5) + '>' + e(p.note) + '</p>' : '') + '</div></section>';
  };

  R.calculator = function (c) {
    var k = c.calculator, def = c.packages.items.filter(function (p) { return p.featured && p.kind !== 'unico'; })[0] || c.packages.items.filter(function (p) { return p.kind !== 'unico'; })[0] || { price: 9900 };
    function f(id, label, val, step, suffix) {
      return '<label class="fld"><span>' + label + '</span><div class="num-in"><input id="' + id + '" type="number" inputmode="decimal" min="0" step="' + step + '" value="' + val + '">' + (suffix ? '<i>' + suffix + '</i>' : '') + '</div></label>';
    }
    return '<section class="sec" id="calculadora"><div class="wrap">' + head('Calculadora', k.title, k.sub) +
      '<div class="calc"' + rv(2, 'rise') + ' data-fee="' + (def.price || 0) + '"><div class="calc-in">' +
      f('c-fee', 'Honorarios mensuales (MXN)', def.price || 9900, 100, '') + f('c-ads', 'Inversión en anuncios (MXN)', 4000, 100, '') +
      f('c-cpl', 'Costo por mensaje o lead (MXN)', 60, 5, '') + f('c-close', 'De cada 100 mensajes, ¿cuántos compran?', 20, 1, '%') + f('c-ticket', 'Venta promedio por cliente (MXN)', 1500, 50, '') +
      '</div><div class="calc-out" aria-live="polite"><div><span>Mensajes al mes</span><strong id="o-leads">0</strong></div><div><span>Ventas al mes</span><strong id="o-sales">0</strong></div>' +
      '<div><span>Ingresos estimados</span><strong id="o-rev">$0</strong></div><div class="hero-o"><span>Ventas para recuperar tu inversión</span><strong id="o-be">0</strong></div>' +
      '<p class="fine" id="o-msg"></p><a class="btn btn-primary" href="#contacto" data-track="cta_clicked" data-where="calculadora"><span>Quiero revisar mis números</span>' + icon('arrow') + '</a></div></div></div></section>';
  };

  R.audience = function (c) {
    var a = c.audience;
    return '<section class="sec" id="giros"><div class="wrap">' + head('Para quién', a.title, a.sub, true) +
      '<ul class="giros"' + rv(3) + '>' + a.chips.map(function (x, i) { return '<li style="--i:' + i + '"><span>' + e(x) + '</span>' + star() + '</li>'; }).join('') + '</ul></div></section>';
  };

  R.proof = function (c) {
    var p = c.proof, tm = p.testimonials.filter(function (t) { return t.text; });
    return '<section class="sec paper" id="compromisos"><div class="wrap">' + head('Confianza', p.title) +
      '<div class="commits">' + p.commitments.map(function (it, i) {
        return '<article class="commit"' + rv(i + 1) + '><span class="seal" aria-hidden="true">' + icon('check') + '</span><div><span class="commit-n">Compromiso ' + pad2(i + 1) + '</span><h3>' + e(it.t) + '</h3><p>' + e(it.d) + '</p></div></article>';
      }).join('') + '</div>' +
      (tm.length ? '<div class="tms">' + tm.map(function (t, i) {
        return '<figure class="tm"' + rv(i + 1) + '><blockquote>' + e(t.text) + '</blockquote><figcaption><b>' + e(t.name) + '</b> ' + e(t.role) + '</figcaption></figure>';
      }).join('') + '</div>' : '') + '</div></section>';
  };

  R.faq = function (c) {
    return '<section class="sec" id="faq"><div class="wrap faq-grid"><div class="faq-side">' + head('Preguntas frecuentes', 'Lo que casi todos ||preguntan||', '¿Te quedó otra duda? Escríbenos y te contestamos en el día.') +
      '<a class="btn btn-ghost" href="' + e(S.waLink(c.brand.whatsapp, 'Hola, tengo una pregunta sobre Línea Frontera.')) + '" target="_blank" rel="noopener" data-track="cta_clicked" data-where="faq_wa"' + rv(3) + '><span>Preguntar por WhatsApp</span>' + icon('wa') + '</a></div>' +
      '<div class="faq"' + rv(2) + '>' + c.faq.map(function (q, i) {
        return '<details' + (i === 0 ? ' open' : '') + '><summary><span class="faq-n" aria-hidden="true">' + pad2(i + 1) + '</span><span class="faq-q">' + e(q.q) + '</span>' + icon('plus', 'pl') + '</summary><div class="ans"><div><p>' + e(q.a) + '</p></div></div></details>';
      }).join('') + '</div></div></section>';
  };

  R.contact = function (c) {
    var k = c.contact, b = c.brand;
    return '<section class="sec contact" id="contacto"><div class="wrap contact-grid"><div class="contact-copy">' +
      '<p class="label"' + rv(0) + '><span class="label-n">' + pad2(++secN) + '</span><span class="label-t">Contacto</span></p>' +
      '<h2' + rv(1, 'words') + '>' + words(k.title) + '</h2><p class="lead"' + rv(2) + '>' + e(k.sub) + '</p>' +
      '<ul class="ticks"' + rv(3) + '><li>' + icon('check') + '<span>Respuesta el mismo día hábil</span></li><li>' + icon('check') + '<span>Sin compromiso</span></li><li>' + icon('check') + '<span>Ideas concretas para tu negocio</span></li></ul>' +
      '<a class="mini-link" href="' + e(S.waLink(b.whatsapp, 'Hola, quiero un diagnóstico para mi negocio.')) + '" target="_blank" rel="noopener" data-track="cta_clicked" data-where="contacto_wa"' + rv(4) + '>O escríbenos directo por WhatsApp</a>' +
      stamp(String(b.name).toUpperCase() + ' ✦ ' + String(b.city).toUpperCase() + ' ✦ ', 'contact-stamp') + '</div>' +
      '<form class="form" id="lead-form" novalidate autocomplete="on"' + rv(2, 'rise') + '><p class="form-head"><span>Diagnóstico gratis</span><span>Formulario / 01</span></p><div class="hp" aria-hidden="true"><label>Sitio web<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
      '<label class="fld"><span>Tu nombre</span><input name="name" required maxlength="80" autocomplete="name" placeholder="Ana Pérez"></label>' +
      '<label class="fld"><span>Nombre de tu negocio</span><input name="business" required maxlength="100" autocomplete="organization" placeholder="Clínica Sol"></label>' +
      '<label class="fld"><span>Tu WhatsApp</span><input name="whatsapp" required type="tel" inputmode="tel" maxlength="20" autocomplete="tel" placeholder="664 123 4567"></label>' +
      '<label class="fld"><span>Giro <em>(opcional)</em></span><input name="niche" maxlength="80" placeholder="Dentista, restaurante, gimnasio…"></label>' +
      '<label class="fld"><span>¿Qué quieres lograr? <em>(opcional)</em></span><textarea name="message" rows="3" maxlength="600" placeholder="Más citas, más pedidos, aparecer en Google…"></textarea></label>' +
      '<label class="check"><input type="checkbox" name="consent" required><span>Acepto que me contacten por WhatsApp y el <a href="/aviso-de-privacidad.html" target="_blank">aviso de privacidad</a>.</span></label>' +
      '<p class="form-msg" id="lead-msg" role="status" aria-live="polite"></p>' +
      '<button class="btn btn-primary block" type="submit"><span>' + e(k.button) + '</span>' + icon('arrow') + '</button></form></div></section>';
  };

  R.cta = function (c) {
    var k = c.cta, line = e(c.brand.tagline) + ' ' + star() + ' Creatividad sin límites ' + star() + ' ';
    return '<section class="sec final" aria-labelledby="h-final"><div class="manifesto" aria-hidden="true"><div class="manifesto-row" data-scrub="-0.35">' + line + line + line + '</div>' +
      '<div class="manifesto-row alt" data-scrub="0.25">' + line + line + line + '</div></div>' +
      '<div class="wrap final-in">' + stripes('final-stripes') + '<h2 id="h-final"' + rv(0, 'words') + '>' + words(k.title) + '</h2><p class="lead"' + rv(1) + '>' + e(k.sub) + '</p>' +
      '<a class="btn btn-primary btn-lg" data-magnet href="' + e(S.waLink(c.brand.whatsapp, 'Hola, quiero platicar sobre marketing para mi negocio.')) + '" target="_blank" rel="noopener" data-track="cta_clicked" data-where="cta_final"' + rv(2) + '><span>' + e(k.button) + '</span>' + icon('wa') + '</a></div></section>';
  };

  /* ---------- piezas fijas ---------- */
  var NAV = [['#servicios', 'Servicios'], ['#paginas-web', 'Páginas web'], ['#proceso', 'Proceso'], ['#paquetes', 'Paquetes'], ['#calculadora', 'Calculadora'], ['#faq', 'Preguntas']];

  function header(c) {
    return '<a class="skip" href="#main">Saltar al contenido</a>' +
      (c.announce.enabled && c.announce.text ? '<div class="announce">' + star() + '<span>' + e(c.announce.text) + '</span>' + (c.announce.link ? ' <a href="' + e(S.safeUrl(c.announce.link)) + '">' + e(c.announce.linkText) + '</a>' : '') + '</div>' : '') +
      '<header class="top" id="top"><div class="top-in"><a class="logo" href="/" aria-label="' + e(c.brand.name) + ', inicio">' + mark() + wordmark(c) + '</a>' +
      '<nav class="nav" id="nav" aria-label="Principal"><span class="nav-meta" aria-hidden="true">Menú</span>' + NAV.map(function (l, i) { return '<a href="' + l[0] + '" style="--i:' + i + '"><small aria-hidden="true">' + pad2(i + 1) + '</small>' + l[1] + '</a>'; }).join('') +
      '<a class="nav-m" href="/auth.html">Entrar</a><a class="nav-m strong" href="/auth.html?mode=register">Crear cuenta</a>' +
      '<span class="nav-foot" aria-hidden="true">' + e(c.brand.city) + ' · ' + e(c.brand.tagline) + '</span></nav>' +
      '<div class="top-cta"><a class="btn-txt" href="/auth.html">Entrar</a><a class="btn btn-sm btn-primary" href="#contacto" data-track="cta_clicked" data-where="header"><span>Diagnóstico gratis</span></a></div>' +
      '<button class="burger" id="burger" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav"><i></i><i></i></button></div>' +
      '<div class="progress" aria-hidden="true"><i></i></div></header>';
  }

  function hero(c) {
    var h = c.hero, ex = S.exampleClientData(), t = S.totals(ex);
    return '<section class="hero" id="inicio" aria-labelledby="h-hero"><div class="hero-bg" aria-hidden="true">' + skyline() + stripes('hero-stripes') + '<div class="hero-glow"></div></div>' +
      '<div class="hero-meta" aria-hidden="true"><span>Agencia de marketing</span><i></i><span>Tijuana · Baja California</span><i></i><span>Est. 2026</span></div>' +
      '<div class="hero-in"><div class="hero-copy"><span class="pill" data-reveal style="--i:0">' + star() + e(h.badge) + '</span>' +
      '<h1 id="h-hero" data-reveal="words" style="--i:1">' + words(h.title) + '</h1><p class="lead" data-reveal style="--i:6">' + e(h.sub) + '</p>' +
      '<div class="cta-row" data-reveal style="--i:7"><a class="btn btn-primary btn-lg" data-magnet href="#contacto" data-track="cta_clicked" data-where="hero_diagnostico"><span>' + e(h.cta1) + '</span>' + icon('arrow') + '</a>' +
      '<a class="btn btn-ghost btn-lg" href="#paquetes" data-track="cta_clicked" data-where="hero_paquetes"><span>' + e(h.cta2) + '</span></a></div>' +
      (h.note ? '<p class="fine" data-reveal style="--i:8">' + e(h.note) + '</p>' : '') + '</div>' +
      '<div class="hero-vis" aria-hidden="true"><div class="hero-mark" data-tilt="18">' + mark('big') + '</div>' +
      '<div class="float f1" data-tilt="-30"><span>Mensajes · ejemplo</span><strong data-count="' + S.num(t.leads) + '">' + S.num(t.leads) + '</strong>' + areaChart(ex.series.map(function (r) { return r.leads; }), 200, 50) + '</div>' +
      '<div class="float f2" data-tilt="24"><span class="dot on"></span><div><b>Campaña activa</b><small>Mensajes de WhatsApp</small></div></div>' +
      '<div class="float f3" data-tilt="-16"><b>Google · #3</b><small>dentista en tijuana</small></div><span class="hero-tag">Datos de ejemplo</span></div></div>' +
      '<a class="scroll-cue" href="#main-start" aria-label="Bajar al contenido"><span>Desliza</span><i></i></a></section>';
  }

  function ticker(c) {
    var items = c.ticker.map(function (t) { return '<span>' + e(t) + '</span>' + star(); }).join('');
    return '<div class="ticker" id="main-start" aria-hidden="true"><div class="ticker-band a"><div class="ticker-track" data-tick="1"><div>' + items + '</div><div>' + items + '</div></div></div>' +
      '<div class="ticker-band b"><div class="ticker-track" data-tick="-1"><div>' + items + '</div><div>' + items + '</div></div></div></div>';
  }

  function footer(c) {
    var b = c.brand, yr = new Date().getFullYear();
    var soc = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok']].filter(function (s) { return S.safeUrl(b[s[0]]); });
    return '<footer class="foot"><div class="wrap"><div class="foot-top"><div class="foot-brand"><a class="logo" href="/" aria-label="' + e(b.name) + ', inicio">' + mark() + wordmark(c) + '</a><p>' + e(b.tagline) + '</p>' +
      stamp(String(b.name).toUpperCase() + ' ✦ TIJUANA ✦ BAJA CALIFORNIA ✦ EST. 2026 ✦ ', 'foot-stamp') + '</div>' +
      '<div class="foot-col"><h4>Contacto</h4><a href="' + e(S.waLink(b.whatsapp)) + '" target="_blank" rel="noopener">WhatsApp ' + e(b.whatsapp) + '</a><a href="mailto:' + e(b.email) + '">' + e(b.email) + '</a><span>' + e(b.city) + '</span>' +
      soc.map(function (s) { return '<a href="' + e(S.safeUrl(b[s[0]])) + '" target="_blank" rel="noopener">' + s[1] + '</a>'; }).join('') + '</div>' +
      '<div class="foot-col"><h4>Sitio</h4>' + NAV.slice(0, 4).map(function (l) { return '<a href="' + l[0] + '">' + l[1] + '</a>'; }).join('') + '</div>' +
      '<div class="foot-col"><h4>Cuenta</h4><a href="/auth.html">Entrar</a><a href="/auth.html?mode=register">Crear cuenta</a><a href="/aviso-de-privacidad.html">Aviso de privacidad</a><a href="/terminos.html">Términos</a></div></div>' +
      '<p class="foot-word" aria-hidden="true" data-reveal="rise">' + e(b.name) + star() + '</p>' +
      '<p class="copy"><span>© ' + yr + ' ' + e(b.name) + '</span><span>' + e(b.domain) + '</span><span>Hecho en Tijuana</span></p></div></footer>' +
      '<a class="wa-fab" href="' + e(S.waLink(b.whatsapp, 'Hola, vengo de la página de Línea Frontera.')) + '" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp" data-track="cta_clicked" data-where="fab">' + icon('wa') + '<span>WhatsApp</span></a>';
  }

  function renderBody(c) {
    c = S.resolveContent(c);
    secN = 0; stampN = 0;
    var hidden = c.sections.hidden, out = [];
    c.sections.order.forEach(function (id) { if (hidden.indexOf(id) < 0 && R[id]) out.push(R[id](c)); });
    return header(c) + '<main id="main">' + hero(c) + ticker(c) + out.join('') + '</main>' + footer(c);
  }

  function renderJsonLd(c) {
    c = S.resolveContent(c);
    var url = 'https://' + c.brand.domain + '/';
    var graph = [
      { '@type': 'WebSite', '@id': url + '#site', url: url, name: c.brand.name, inLanguage: 'es-MX' },
      { '@type': 'ProfessionalService', '@id': url + '#org', name: c.brand.name, url: url, description: c.seo.description, email: c.brand.email, telephone: '+' + S.normalizeWhatsApp(c.brand.whatsapp),
        areaServed: { '@type': 'City', name: 'Tijuana' }, address: { '@type': 'PostalAddress', addressLocality: 'Tijuana', addressRegion: 'Baja California', addressCountry: 'MX' },
        priceRange: '$$',
        hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Paquetes de marketing', itemListElement: c.packages.items.map(function (p) {
          return { '@type': 'Offer', name: p.name, description: p.tagline, price: String(p.price), priceCurrency: 'MXN', itemOffered: { '@type': 'Service', name: 'Paquete ' + p.name } };
        }) } },
      { '@type': 'FAQPage', mainEntity: c.faq.map(function (q) { return { '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } }; }) }
    ];
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  }

  function themeCss(c) {
    var t = S.resolveContent(c).theme;
    return ':root{--accent:' + t.accent + ';--accent2:' + t.accent2 + ';--accent3:' + t.accent3 + ';--sun:' + t.sun + ';--sakura:' + t.sakura + ';--ink:' + t.ink + ';--paper:' + t.paper + ';--panel:' + t.sakura + ';--star:' + t.sun + '}';
  }

  g.LF = g.LF || {};
  g.LF.render = { renderBody: renderBody, renderJsonLd: renderJsonLd, themeCss: themeCss, icon: icon, areaChart: areaChart, mark: mark, star: star };
  if (typeof module !== 'undefined' && module.exports) module.exports = g.LF.render;
})(typeof window !== 'undefined' ? window : globalThis);
