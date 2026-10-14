/* Línea Frontera · medición y formulario para la página de un cliente.
   Uso (en el <head> de su página):  <script defer src="https://lineafrontera.stream/t.js" data-key="lf_12_abcdef0123"></script>
   - Cuenta visitas, clics a WhatsApp y llamadas (sin cookies).
   - Todo <form data-lf> manda sus datos al panel del cliente (campos: name, phone, email, message).
   - window.LFLead({name, phone, email, message}) hace lo mismo desde código propio. */
(function () {
  var s = document.currentScript; if (!s) return;
  var key = s.getAttribute('data-key'); if (!key) return;
  var api = new URL(s.src).origin + '/api';
  function post(path, body) {
    var data = JSON.stringify(body);
    try { if (navigator.sendBeacon && path === '/collect') return navigator.sendBeacon(api + path, new Blob([data], { type: 'text/plain' })); } catch (e) {}
    return fetch(api + path, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: data, keepalive: true, credentials: 'omit' });
  }
  var q = new URLSearchParams(location.search);
  post('/collect', { k: key, t: 'view', p: location.pathname, r: document.referrer, s: q.get('utm_source') || '' });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var h = a.getAttribute('href') || '';
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|wa\.link)/i.test(h)) post('/collect', { k: key, t: 'wa' });
    else if (/^tel:/i.test(h)) post('/collect', { k: key, t: 'call' });
  }, true);
  function send(o) {
    return fetch(api + '/site-lead', { method: 'POST', headers: { 'content-type': 'text/plain' }, credentials: 'omit',
      body: JSON.stringify({ k: key, name: o.name || '', phone: o.phone || '', email: o.email || '', message: o.message || '', website: o.website || '', p: location.pathname }) })
      .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); }).catch(function () { return { ok: false }; });
  }
  window.LFLead = send;
  document.addEventListener('submit', function (e) {
    var f = e.target; if (!f || !f.hasAttribute || !f.hasAttribute('data-lf')) return;
    e.preventDefault();
    var v = function (n) { var el = f.elements[n]; return el ? el.value : ''; };
    var btn = f.querySelector('[type=submit]'); if (btn) btn.disabled = true;
    send({ name: v('name'), phone: v('phone'), email: v('email'), message: v('message'), website: v('website') }).then(function (r) {
      if (btn) btn.disabled = false;
      var ok = f.querySelector('[data-lf-ok]'), er = f.querySelector('[data-lf-error]');
      if (r && r.ok) { f.reset(); if (ok) ok.hidden = false; if (er) er.hidden = true; }
      else { if (er) er.hidden = false; if (ok) ok.hidden = true; }
    });
  }, true);
})();
