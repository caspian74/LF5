/* Línea Frontera · movimiento de la landing (scroll, parallax, ticker, magnetismo).
   Todo se apaga con prefers-reduced-motion y el contenido queda en su estado final legible. */
(function (g) {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = g.matchMedia && g.matchMedia('(hover: hover) and (pointer: fine)');
  var st = { spin: [], paper: [], top: null, bar: null, par: [], scrub: [], steps: [], ticks: [], fab: null, links: [], secs: [], lastY: 0, vel: 0, raf: 0, tickOn: false, tickVis: true, bound: false, tickIo: null, spyIo: null };

  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function off() { return !reduce || reduce.matches; }

  function frame() {
    st.raf = 0;
    var y = g.scrollY || 0, vh = g.innerHeight, dh = root.scrollHeight - vh;
    var dy = y - st.lastY; st.vel = st.vel * 0.85 + dy * 0.15;

    if (st.bar) st.bar.style.setProperty('--sp', dh > 0 ? (y / dh).toFixed(4) : 0);
    if (st.top) {
      var nav = doc.getElementById('nav'), open = nav && nav.classList.contains('open');
      st.top.classList.toggle('stuck', y > 8);
      if (!open && !(doc.activeElement && st.top.contains(doc.activeElement))) st.top.classList.toggle('hide', y > 480 && dy > 2 ? true : dy < -2 ? false : st.top.classList.contains('hide'));
    }
    if (st.fab) st.fab.classList.toggle('away', y < vh * 0.5);

    st.par.forEach(function (p) {
      var r = p.box.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
      p.el.style.transform = 'translate3d(0,' + (y * p.k).toFixed(1) + 'px,0)';
    });
    st.scrub.forEach(function (s) {
      var r = s.el.parentNode.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      var t = (vh - r.top) / (vh + r.height);
      s.el.style.transform = 'translate3d(' + ((t - 0.5) * s.k * 100).toFixed(2) + '%,0,0)';
    });
    st.steps.forEach(function (o) {
      var r = o.getBoundingClientRect(), p = clamp((vh * 0.72 - r.top) / Math.max(r.height, 1), 0, 1);
      o.style.setProperty('--p', p.toFixed(3));
      var items = o.querySelectorAll('.step'), n = items.length;
      for (var i = 0; i < n; i++) items[i].classList.toggle('on', p >= (i + 0.35) / n);
    });
    st.spin.forEach(function (el) { el.style.setProperty('--rot', (y * 0.12 % 360).toFixed(1) + 'deg'); });
    st.paper.forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.top > vh || r.bottom < 0) return;
      var k = clamp((vh - r.top) / (vh * 0.6), 0, 1); el.style.setProperty('--cut', ((1 - k) * 110).toFixed(1) + 'px');
    });
    st.lastY = y;
    if (Math.abs(st.vel) > 0.1 && !st.raf) st.raf = g.requestAnimationFrame(frame);
  }
  function onScroll() { if (!st.raf) st.raf = g.requestAnimationFrame(frame); }

  /* ticker: velocidad base + empujón por velocidad de scroll */
  var tickT0 = 0;
  function tickLoop(t) {
    if (!st.tickOn) return;
    var dt = tickT0 ? Math.min(t - tickT0, 64) : 16; tickT0 = t;
    if (st.tickVis && !doc.hidden) {
      var boost = 1 + Math.min(Math.abs(st.vel) * 0.12, 6);
      st.ticks.forEach(function (k) {
        var w = k.el.scrollWidth / 2; if (!w) return;
        k.x -= k.dir * 0.045 * dt * boost;
        if (k.x <= -w) k.x += w; if (k.x > 0) k.x -= w;
        k.el.style.transform = 'translate3d(' + k.x.toFixed(1) + 'px,0,0)';
      });
    }
    g.requestAnimationFrame(tickLoop);
  }

  /* inclinación suave de las tarjetas del hero según el puntero */
  function heroTilt() {
    var hero = doc.querySelector('.hero'); if (!hero || !fine.matches) return;
    var els = $$('[data-tilt]', hero), raf = 0, mx = 0, my = 0;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = g.requestAnimationFrame(function () {
        raf = 0; els.forEach(function (el) { var k = parseFloat(el.dataset.tilt) || 10; el.style.transform = 'translate3d(' + (mx * k).toFixed(1) + 'px,' + (my * k).toFixed(1) + 'px,0)'; });
      });
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { els.forEach(function (el) { el.style.transform = ''; }); });
  }

  /* botones con imán */
  function magnets() {
    if (!fine.matches) return;
    $$('[data-magnet]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect(), x = (e.clientX - r.left - r.width / 2) * 0.18, y = (e.clientY - r.top - r.height / 2) * 0.3;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* cursor con estrella que sigue al puntero (escritorio) */
  var cur = null;
  function cursor() {
    if (!fine.matches || cur) return;
    cur = doc.createElement('div'); cur.className = 'cursor'; cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = g.LF.render && g.LF.render.star ? g.LF.render.star() : '';
    doc.body.appendChild(cur);
    var x = -100, y = -100, cx = x, cy = y, run = false;
    function loop() { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)'; if (Math.abs(x - cx) + Math.abs(y - cy) > 0.3) g.requestAnimationFrame(loop); else run = false; }
    doc.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; x = e.clientX; y = e.clientY; cur.classList.add('on'); if (!run) { run = true; g.requestAnimationFrame(loop); } }, { passive: true });
    doc.addEventListener('pointerover', function (e) { cur.classList.toggle('big', !!(e.target.closest && e.target.closest('a,button,summary,label,input,textarea,[data-buy]'))); }, { passive: true });
    doc.addEventListener('pointerdown', function () { cur.classList.add('down'); });
    doc.addEventListener('pointerup', function () { cur.classList.remove('down'); });
    doc.documentElement.addEventListener('pointerleave', function () { cur.classList.remove('on'); });
  }

  /* etiquetas que se "decodifican" letra por letra al aparecer */
  var GLY = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789✦/·';
  function scramble(el) {
    var final = el.textContent, n = final.length, t0 = 0, dur = 700;
    function step(t) {
      if (!t0) t0 = t; var k = Math.min((t - t0) / dur, 1), out = '';
      for (var i = 0; i < n; i++) out += final[i] === ' ' || i < k * n ? final[i] : GLY[(Math.random() * GLY.length) | 0];
      el.textContent = out; if (k < 1) g.requestAnimationFrame(step); else el.textContent = final;
    }
    g.requestAnimationFrame(step);
  }
  var scrIo = null;
  function scrambles() {
    if (!('IntersectionObserver' in g)) return;
    if (scrIo) scrIo.disconnect();
    scrIo = new IntersectionObserver(function (l) { l.forEach(function (en) { if (en.isIntersecting) { scrIo.unobserve(en.target); scramble(en.target); } }); }, { threshold: 1 });
    $$('.label-t, .hero-meta span, .svc-n, .commit-n').forEach(function (el) { scrIo.observe(el); });
  }

  /* inclinación 3D de tarjetas */
  function tilt() {
    if (!fine.matches) return;
    $$('.pkg, .svc, [data-tilt-card]').forEach(function (c) {
      var r = null;
      c.addEventListener('pointerenter', function () { r = c.getBoundingClientRect(); c.style.transition = 'transform .15s ease-out'; });
      c.addEventListener('pointermove', function (e) {
        if (!r) r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5, k = c.classList.contains('svc') ? 4 : 7;
        c.style.transform = 'perspective(900px) rotateX(' + (-py * k).toFixed(2) + 'deg) rotateY(' + (px * k).toFixed(2) + 'deg) translateY(-4px)';
      });
      c.addEventListener('pointerleave', function () { r = null; c.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)'; c.style.transform = ''; });
    });
  }

  /* resalta el enlace del menú de la sección visible */
  function scrollSpy() {
    if (!('IntersectionObserver' in g)) return;
    var links = $$('#nav a[href^="#"]'), map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    if (st.spyIo) st.spyIo.disconnect();
    st.spyIo = new IntersectionObserver(function (list) {
      list.forEach(function (en) { if (en.isIntersecting && map[en.target.id]) { links.forEach(function (a) { a.classList.remove('on'); }); map[en.target.id].classList.add('on'); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = doc.getElementById(id); if (s) st.spyIo.observe(s); });
  }

  function init() {
    st.top = doc.getElementById('top');
    st.bar = doc.querySelector('.progress');
    st.fab = doc.querySelector('.wa-fab');
    scrollSpy();
    if (off()) { if (st.top) st.top.classList.remove('hide'); if (!st.bound) { g.addEventListener('scroll', onScroll, { passive: true }); st.bound = true; } st.par = []; st.scrub = []; st.steps = $$('[data-steps]'); frame(); return; }

    st.par = $$('[data-par]').map(function (el) { return { el: el, k: parseFloat(el.dataset.par) || 0, box: el.closest('section') || el }; });
    st.scrub = $$('[data-scrub]').map(function (el) { return { el: el, k: parseFloat(el.dataset.scrub) || 0.3 }; });
    st.steps = $$('[data-steps]');

    var ticker = doc.querySelector('.ticker');
    st.ticks = $$('[data-tick]').map(function (el) { return { el: el, dir: parseFloat(el.dataset.tick) || 1, x: parseFloat(el.dataset.tick) < 0 ? -1 : 0 }; });
    if (ticker && st.ticks.length) {
      ticker.classList.add('js-tick');
      st.ticks.forEach(function (k) { if (k.dir < 0) k.x = -k.el.scrollWidth / 2; });
      if ('IntersectionObserver' in g) {
        if (st.tickIo) st.tickIo.disconnect();
        st.tickIo = new IntersectionObserver(function (l) { st.tickVis = l[0].isIntersecting; }); st.tickIo.observe(ticker);
      }
      if (!st.tickOn) { st.tickOn = true; g.requestAnimationFrame(tickLoop); }
    }

    // el reloj de las ventanas de la ciudad no parpadea al unísono
    $$('.sk-win rect').forEach(function (r, i) { r.style.setProperty('--d', (i % 7) * 0.6); });

    st.spin = $$('[data-spin]'); st.paper = $$('.paper');
    heroTilt(); magnets(); cursor(); scrambles(); tilt();
    if (!st.bound) { g.addEventListener('scroll', onScroll, { passive: true }); g.addEventListener('resize', onScroll, { passive: true }); st.bound = true; }
    st.lastY = g.scrollY || 0; frame();
  }

  if (reduce && reduce.addEventListener) reduce.addEventListener('change', function () { g.location.reload(); });

  g.LF = g.LF || {};
  g.LF.motion = { init: init };
})(window);
