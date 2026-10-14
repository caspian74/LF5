/* Generador de la página del cliente: toma la ficha (client.data.admin.site + brief) y devuelve un HTML completo, listo para subir a Cloudflare Pages.
   LF.gen.build({ client, origin, key }) -> string. Puro: sin DOM, funciona en navegador y Node. */
(function (g) {
  'use strict';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var hex = function (s, d) { return /^#[0-9a-fA-F]{6}$/.test(s) ? s : d; };
  var okUrl = function (u) { u = String(u || '').trim(); return /^https:\/\//i.test(u) ? u : ''; };
  var digits = function (s) { var n = String(s || '').replace(/\D/g, ''); if (n.length === 10) n = '52' + n; return n; };

  function build(o) {
    var c = o.client || {}, d = c.data || {}, site = (d.admin && d.admin.site) || {}, brief = (d.web && d.web.brief) || {};
    var name = c.business || c.name || 'Mi negocio';
    var logo = site.logoText || name;
    var head = site.headline || brief.slogan || name;
    var sub = site.sub || brief.about || '';
    var cta = site.cta || 'Escríbenos por WhatsApp';
    var a1 = hex(site.accent, '#FF3B5C'), a2 = hex(site.accent2, '#6C4DFF'), dark = site.theme === 'oscuro';
    var wa = digits(site.whatsapp || brief.whatsapp || c.phone);
    var waLink = wa ? 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Hola, vi su página y quiero más información.') : '';
    var hours = site.hours || brief.hours || '', addr = site.address || brief.address || '';
    var services = (site.services || []).filter(function (s) { return s.t; });
    if (!services.length && brief.services) services = String(brief.services).split(/\n|,/).map(function (t) { return { t: t.trim(), d: '' }; }).filter(function (s) { return s.t; }).slice(0, 8);
    var benefits = (site.benefits || []).filter(function (s) { return s.t; });
    var faq = (site.faq || []).filter(function (s) { return s.q; });
    var socials = [['Instagram', okUrl(site.instagram)], ['Facebook', okUrl(site.facebook)], ['TikTok', okUrl(site.tiktok)]].filter(function (x) { return x[1]; });
    var map = okUrl(site.mapUrl);
    var bg = dark ? '#0d0f14' : '#ffffff', fg = dark ? '#f2f4f8' : '#14161c', mut = dark ? '#a3a9b8' : '#5b6170', card = dark ? '#171a22' : '#f6f7fb', line = dark ? '#262a35' : '#e5e7ef';
    var ld = { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: name, description: sub, telephone: wa ? '+' + wa : undefined, address: addr || undefined, openingHours: hours || undefined, url: o.siteUrl || undefined, sameAs: socials.map(function (x) { return x[1]; }) };
    var tracker = o.key && o.origin ? '<script defer src="' + esc(o.origin) + '/t.js" data-key="' + esc(o.key) + '"></script>' : '';
    var h = [];
    h.push('<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">');
    h.push('<title>' + esc(name + (site.headline ? ' · ' + site.headline : '')) + '</title>');
    h.push('<meta name="description" content="' + esc(String(sub).slice(0, 155)) + '"><meta property="og:title" content="' + esc(name) + '"><meta property="og:description" content="' + esc(String(sub).slice(0, 155)) + '"><meta name="theme-color" content="' + a1 + '">');
    h.push('<script type="application/ld+json">' + JSON.stringify(ld).replace(/</g, '\\u003c') + '</script>');
    h.push('<style>:root{--a:' + a1 + ';--b:' + a2 + ';--bg:' + bg + ';--fg:' + fg + ';--mut:' + mut + ';--card:' + card + ';--line:' + line + '}*{box-sizing:border-box;margin:0}html{scroll-behavior:smooth}body{font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--fg)}');
    h.push('.w{max-width:1040px;margin:0 auto;padding:0 20px}header{position:sticky;top:0;background:color-mix(in srgb,var(--bg) 85%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);z-index:5}header .w{display:flex;justify-content:space-between;align-items:center;height:60px}.logo{font-weight:800;font-size:1.15rem}');
    h.push('.btn{display:inline-block;background:linear-gradient(135deg,var(--a),var(--b));color:#fff;text-decoration:none;font-weight:700;padding:.8rem 1.4rem;border-radius:999px;border:0;cursor:pointer;font-size:1rem;box-shadow:0 8px 24px -8px var(--a)}.btn.s{padding:.5rem 1rem;font-size:.9rem}');
    h.push('.hero{padding:72px 0 56px}.hero h1{font-size:clamp(2rem,6vw,3.4rem);line-height:1.1;letter-spacing:-.02em;max-width:18ch}.hero p{color:var(--mut);font-size:1.15rem;max-width:56ch;margin:1rem 0 1.6rem}h2{font-size:1.7rem;margin-bottom:1.2rem;letter-spacing:-.01em}section{padding:44px 0}');
    h.push('.grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}.c{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:20px}.c h3{font-size:1.05rem;margin-bottom:.3rem}.c p{color:var(--mut);font-size:.95rem}');
    h.push('details{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 18px;margin-bottom:10px}summary{cursor:pointer;font-weight:600}details p{color:var(--mut);margin-top:.5rem}');
    h.push('form{display:grid;gap:10px;max-width:480px}input,textarea{font:inherit;padding:.8rem 1rem;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--fg)}footer{border-top:1px solid var(--line);padding:28px 0;color:var(--mut);font-size:.9rem}footer a{color:var(--mut)}.wa{position:fixed;right:16px;bottom:16px;z-index:9}[hidden]{display:none!important}</style>');
    h.push('</head><body>');
    h.push('<header><div class="w"><span class="logo">' + esc(logo) + '</span>' + (waLink ? '<a class="btn s" href="' + waLink + '">WhatsApp</a>' : '<a class="btn s" href="#contacto">Contacto</a>') + '</div></header>');
    h.push('<main><section class="hero"><div class="w"><h1>' + esc(head) + '</h1>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '<a class="btn" href="' + (waLink || '#contacto') + '">' + esc(cta) + '</a></div></section>');
    if (services.length) h.push('<section id="servicios"><div class="w"><h2>Servicios</h2><div class="grid">' + services.map(function (s) { return '<div class="c"><h3>' + esc(s.t) + '</h3>' + (s.d ? '<p>' + esc(s.d) + '</p>' : '') + '</div>'; }).join('') + '</div></div></section>');
    if (benefits.length) h.push('<section><div class="w"><h2>Por qué elegirnos</h2><div class="grid">' + benefits.map(function (s) { return '<div class="c"><h3>' + esc(s.t) + '</h3>' + (s.d ? '<p>' + esc(s.d) + '</p>' : '') + '</div>'; }).join('') + '</div></div></section>');
    if (site.about || brief.about) h.push('<section id="nosotros"><div class="w"><h2>Sobre nosotros</h2><p style="color:var(--mut);max-width:70ch">' + esc(site.about || brief.about) + '</p></div></section>');
    if (faq.length) h.push('<section><div class="w"><h2>Preguntas frecuentes</h2>' + faq.map(function (f) { return '<details><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>'; }).join('') + '</div></section>');
    h.push('<section id="contacto"><div class="w"><h2>Contáctanos</h2><div class="grid" style="align-items:start"><form data-lf><input name="name" placeholder="Tu nombre" required maxlength="80" autocomplete="name"><input name="phone" type="tel" placeholder="Tu teléfono" maxlength="25" autocomplete="tel"><input name="email" type="email" placeholder="Correo (opcional)" maxlength="254" autocomplete="email"><textarea name="message" rows="3" placeholder="¿En qué te ayudamos?" maxlength="800"></textarea><input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px"><button class="btn" type="submit">Enviar mensaje</button><p data-lf-ok hidden style="color:var(--b);font-weight:600">¡Listo! Te contactaremos pronto.</p><p data-lf-error hidden style="color:#d33">No se pudo enviar. Escríbenos por WhatsApp.</p></form>');
    h.push('<div class="c">' + (addr ? '<p><b>Dirección</b><br>' + esc(addr) + '</p><br>' : '') + (hours ? '<p><b>Horario</b><br>' + esc(hours) + '</p><br>' : '') + (wa ? '<p><b>WhatsApp</b><br><a href="' + waLink + '">+' + esc(wa) + '</a></p><br>' : '') + (site.email ? '<p><b>Correo</b><br>' + esc(site.email) + '</p><br>' : '') + (map ? '<p><a href="' + esc(map) + '" rel="noopener">Ver en el mapa →</a></p>' : '') + '</div></div></div></section></main>');
    h.push('<footer><div class="w">© ' + new Date().getFullYear() + ' ' + esc(name) + (socials.length ? ' · ' + socials.map(function (x) { return '<a href="' + esc(x[1]) + '" rel="noopener">' + x[0] + '</a>'; }).join(' · ') : '') + ' · Sitio por <a href="https://lineafrontera.stream">Línea Frontera</a></div></footer>');
    if (waLink) h.push('<a class="btn wa" href="' + waLink + '" aria-label="WhatsApp">WhatsApp</a>');
    h.push(tracker + '</body></html>');
    return h.join('');
  }
  g.LF = g.LF || {}; g.LF.gen = { build: build };
  if (typeof module !== 'undefined' && module.exports) module.exports = g.LF.gen;
})(typeof window !== 'undefined' ? window : globalThis);
