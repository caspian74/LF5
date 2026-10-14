/* Línea Frontera · utilidades y contenido por defecto (navegador + Node + Workers) */
(function (g) {
  'use strict';

  var SECTION_IDS = ['problem', 'services', 'web', 'process', 'demo', 'packages', 'calculator', 'audience', 'proof', 'faq', 'contact', 'cta'];

  var DEFAULTS = {
    v: 2,
    brand: {
      name: 'Línea Frontera',
      tagline: 'Marketing chill para negocios de Tijuana',
      whatsapp: '5632960874',
      email: 'rcabrerar17@gmail.com',
      city: 'Tijuana, Baja California',
      domain: 'lineafrontera.stream',
      instagram: '',
      facebook: '',
      tiktok: ''
    },
    theme: { accent: '#FF3B5C', accent2: '#6C4DFF', accent3: '#3DDBB0', sun: '#FFC93C', sakura: '#FF8FB1', ink: '#17112E', paper: '#FFF8F0' },
    seo: {
      title: 'Línea Frontera · Marketing para negocios de Tijuana',
      description: 'Páginas web desde $5,900 MXN (pago único) y marketing mensual desde $4,900 para negocios de Tijuana: anuncios, contenido, SEO local y panel de resultados. Pide tu diagnóstico gratis.',
      ga4: '',
      metaPixel: ''
    },
    announce: { enabled: true, text: 'Diagnóstico gratis para negocios de Tijuana. Cupo de nuevos clientes cada mes.', link: '#contacto', linkText: 'Pedirlo' },
    sections: { order: SECTION_IDS.slice(), hidden: [] },
    hero: {
      badge: 'Agencia de Tijuana',
      title: 'Haz que Tijuana te ||encuentre||, te escriba y te compre.',
      sub: 'Juntamos anuncios, contenido y SEO local en un solo plan mensual. Tú ves cuántos mensajes y ventas llegaron en tu panel, sin tecnicismos.',
      cta1: 'Pedir diagnóstico gratis',
      cta2: 'Ver paquetes',
      note: 'Sin contrato forzoso. Tu inversión en anuncios se paga directo a Meta y Google.'
    },
    ticker: ['Anuncios en Meta', 'Google Business', 'Reels y TikTok', 'SEO local', 'WhatsApp que vende', 'Páginas web', 'Panel de resultados', 'Reseñas'],
    problem: {
      title: 'Si algo de esto te suena, vamos a trabajar bien juntos',
      items: [
        { t: 'Publico y no pasa nada', d: 'Subes contenido seguido y los mensajes no llegan. Falta alguien que conecte lo que publicas con lo que la gente busca.' },
        { t: 'Pagué anuncios y no sé qué pasó', d: 'Gastaste, te dieron un reporte lleno de números y sigues sin saber cuántas ventas fueron. Aquí ves leads, costo por lead y ventas.' },
        { t: 'Mi competencia sale primero en Google', d: 'Cuando alguien busca tu servicio en Tijuana, aparece otro. Con SEO local y reseñas te movemos hacia arriba.' }
      ]
    },
    services: {
      title: 'Todo lo que necesita tu negocio para vender más',
      sub: 'Cada servicio se puede contratar dentro de un paquete. Todos terminan en el mismo lugar: más mensajes de gente que sí quiere comprar.',
      items: [
        { icon: 'megaphone', t: 'Anuncios que traen mensajes', d: 'Campañas en Meta y Google con presupuesto cuidado, pruebas de creativos y ajustes cada semana.' },
        { icon: 'film', t: 'Contenido con intención', d: 'Reels, fotos y carruseles pensados para que te recuerden y te escriban. Grabamos en tu local.' },
        { icon: 'pin', t: 'SEO local y Google Business', d: 'Ficha optimizada, reseñas, citas y páginas por servicio para que aparezcas cuando te buscan cerca.' },
        { icon: 'chat', t: 'WhatsApp que cierra ventas', d: 'Mensajes de bienvenida, respuestas rápidas y seguimiento para que ningún prospecto se quede esperando.' },
        { icon: 'chart', t: 'Panel de KPIs en tiempo real', d: 'Leads, costo por lead, ventas y retorno en un panel claro. Lo revisas cuando quieras.' },
        { icon: 'window', t: 'Páginas web que convierten', d: 'Una página rápida, hecha para celular, con WhatsApp y formulario conectados a tu panel. La medimos para saber qué funciona.' }
      ]
    },
    process: {
      title: 'Así arrancamos, paso por paso',
      steps: [
        { t: 'Diagnóstico gratis', d: 'Revisamos tu presencia en Google, redes y anuncios, y te decimos dónde está el dinero que hoy se te escapa.' },
        { t: 'Plan y paquete', d: 'Eliges el paquete que te acomoda y firmamos objetivos claros: mensajes, citas o ventas por mes.' },
        { t: 'Producción y lanzamiento', d: 'Grabamos, publicamos y encendemos campañas. En la primera semana ya hay algo corriendo.' },
        { t: 'Medimos y mejoramos', d: 'Cada mes revisamos resultados contigo y movemos presupuesto hacia lo que sí vende.' }
      ]
    },
    demo: {
      title: 'Así se ve tu panel de resultados',
      sub: 'Cada cliente tiene su cuenta con campañas, contenido por aprobar, posiciones en Google y tickets de soporte. Los números de abajo son un ejemplo para mostrar el panel.'
    },
    web: {
      title: 'Una página web que trabaja por ti desde la primera semana',
      sub: 'Una página clara, rápida y hecha para celular. Pensada para que la gente te encuentre, confíe en ti y te escriba por WhatsApp.',
      points: [
        { t: 'Hecha para que te escriban', d: 'Botón de WhatsApp siempre visible y un formulario cuyos mensajes llegan directo a tu panel.' },
        { t: 'Rápida y lista para Google', d: 'Carga rápido en celular y sale con lo básico de SEO local para que te encuentren en tu zona.' },
        { t: 'Tuya, sin amarres', d: 'El dominio queda a tu nombre. Tienes un panel con visitas, mensajes recibidos y solicitudes de cambio.' }
      ],
      cta: 'Ver el paquete de página web',
      ctaLink: '#paquetes'
    },
    packages: {
      title: 'Paquetes claros, en pesos mexicanos',
      sub: 'Elige una página web con pago único o un plan mensual de marketing. La inversión en anuncios se paga aparte, directo a Meta y Google, y tú controlas el monto.',
      note: 'Los planes mensuales no tienen plazo forzoso: puedes pausar con 30 días de aviso. La página web se paga una sola vez.',
      items: [
        { id: 'sitio', name: 'Página Web', tagline: 'Tu negocio en Google y en WhatsApp, con una página que carga rápido', price: 5900, kind: 'unico', featured: false, badge: 'Pago único', stripePriceId: '', paymentLink: '',
          maint: 490, maintStripePriceId: '', delivery: 'Entrega en 7 días hábiles desde que recibimos tu material.', priceNote: 'Precio final. Si necesitas factura, se agrega IVA.',
          features: ['Página de una sola pantalla con hasta 6 secciones', 'Diseño con tu marca, hecho para celular', 'Botón de WhatsApp y formulario conectado a tu panel', 'SEO local básico y datos listos para Google', 'Hosting y certificado SSL incluidos el primer año', 'Panel con visitas, mensajes y solicitudes de cambio', '2 rondas de ajustes incluidas'] },
        { id: 'arranque', name: 'Arranque', tagline: 'Para empezar a aparecer y recibir mensajes', price: 4900, kind: 'mensual', featured: false, badge: '', stripePriceId: '', paymentLink: '', maint: 0, maintStripePriceId: '', delivery: '', priceNote: '',
          features: ['Google Business optimizado', '8 piezas de contenido al mes', 'Calendario y publicación en Instagram y Facebook', '1 campaña de anuncios en Meta', 'Panel mensual con tus números', 'Soporte por WhatsApp en horario hábil'] },
        { id: 'crecimiento', name: 'Crecimiento', tagline: 'Para crecer ventas con anuncios y SEO local', price: 9900, kind: 'mensual', featured: true, badge: 'Recomendado', stripePriceId: '', paymentLink: '', maint: 0, maintStripePriceId: '', delivery: '', priceNote: '',
          features: ['Todo lo de Arranque', '16 piezas al mes y 1 sesión de grabación', 'SEO local: reseñas, citas y páginas por servicio', 'Campañas en Meta y Google Búsqueda', 'Seguimiento de leads a ventas por WhatsApp', 'Reunión mensual de resultados'] },
        { id: 'dominancia', name: 'Dominancia', tagline: 'Para liderar tu zona y escalar', price: 16500, kind: 'mensual', featured: false, badge: '', stripePriceId: '', paymentLink: '', maint: 0, maintStripePriceId: '', delivery: '', priceNote: '',
          features: ['Todo lo de Crecimiento', '24 piezas al mes y 2 sesiones de grabación', 'Página web para campañas', 'Reactivación de clientes por WhatsApp y email', 'Reporte semanal', 'Soporte prioritario'] }
      ],
      addons: [
        { name: 'Sesión extra de grabación', price: 'Cotiza' },
        { name: 'Página adicional', price: 'Cotiza' },
        { name: 'Identidad visual', price: 'Cotiza' }
      ]
    },
    calculator: {
      title: '¿Cuántas ventas necesitas para que se pague solo?',
      sub: 'Mueve los números con los de tu negocio. Es una estimación para planear, no una promesa de resultados.'
    },
    audience: {
      title: 'Trabajamos con negocios locales, con especialidad en salud',
      sub: 'Consultorios, clínicas, dentistas, estéticas, laboratorios y también restaurantes, gimnasios, tiendas y servicios de Tijuana.',
      chips: ['Dentistas', 'Clínicas', 'Consultorios', 'Estética y spa', 'Laboratorios', 'Gimnasios', 'Restaurantes', 'Tiendas locales', 'Servicios del hogar']
    },
    proof: {
      title: 'Cómo cuidamos tu inversión',
      commitments: [
        { t: 'Tus cuentas son tuyas', d: 'Las cuentas de anuncios, Google Business y redes quedan a tu nombre. Si decides irte, te llevas todo.' },
        { t: 'Reporte que se entiende', d: 'Leads, costo por lead y ventas en español claro. Si un número no sube, te decimos por qué y qué haremos.' },
        { t: 'Sin letra chiquita', d: 'Sin plazo forzoso. Avisas con 30 días y pausamos, sin penalización.' },
        { t: 'Cupo limitado', d: 'Tomamos pocos clientes por mes para atender bien a cada uno.' }
      ],
      testimonials: []
    },
    faq: [
      { q: '¿La inversión en anuncios está incluida en el paquete?', a: 'No. El paquete cubre nuestro trabajo. El presupuesto de anuncios lo pagas directo a Meta y Google, tú decides el monto y ves cada peso gastado.' },
      { q: '¿Hay contrato o plazo forzoso?', a: 'No. Trabajamos mes a mes. Si quieres pausar, avisas con 30 días.' },
      { q: '¿En cuánto tiempo veo resultados?', a: 'Los anuncios pueden traer mensajes desde las primeras semanas. El SEO local suele tardar de 2 a 4 meses en moverse. Te lo explicamos en el diagnóstico con tu caso.' },
      { q: '¿Qué necesito para empezar?', a: 'Acceso a tus redes y a tu ficha de Google, o te ayudamos a crearlas. Con eso y una llamada de 30 minutos arrancamos.' },
      { q: '¿Me aseguran un número de ventas?', a: 'Nadie honesto puede asegurar ventas. Sí nos comprometemos a lo que controlamos: publicar, optimizar, reportar y mejorar cada mes.' },
      { q: '¿Trabajan con negocios que no son de salud?', a: 'Sí. Tenemos especialidad en salud, pero atendemos cualquier negocio local de Tijuana con clientes en la zona.' },
      { q: '¿Cómo pago?', a: 'Con tarjeta desde esta página o por transferencia. Te llega tu recibo y activamos tu cuenta con panel.' },
      { q: '¿Puedo ver mis resultados en tiempo real?', a: 'Sí. Al comprar un paquete tienes cuenta con panel donde ves campañas, contenido, posiciones en Google y puedes abrir tickets de soporte.' },
      { q: '¿Qué incluye el paquete de página web?', a: 'Una página de una sola pantalla con hasta 6 secciones, diseñada con tu marca y lista para celular, con botón de WhatsApp, formulario conectado a tu panel y lo básico de SEO local. Incluye hosting y certificado SSL el primer año y 2 rondas de ajustes.' },
      { q: '¿El dominio de mi página es mío?', a: 'Sí. El dominio (.com o .mx, entre $250 y $350 al año aproximadamente) se registra a tu nombre y lo pagas directo al registrador. Si algún día te vas, te entregamos los archivos de tu página.' },
      { q: '¿Cuánto tarda mi página y qué pasa después?', a: 'Entregamos en 7 días hábiles desde que recibimos tu material. Después puedes contratar el mantenimiento opcional (hosting, cambios menores y reporte de visitas) o llevarte los archivos y publicarlos donde prefieras.' }
    ],
    contact: {
      title: 'Pide tu diagnóstico gratis',
      sub: 'Cuéntanos de tu negocio y te respondemos por WhatsApp el mismo día hábil con ideas concretas.',
      button: 'Quiero mi diagnóstico',
      success: 'Listo, recibimos tus datos. Te escribimos por WhatsApp pronto.'
    },
    cta: { title: 'Tu competencia ya está anunciándose. Tu turno.', sub: 'Platica con nosotros 20 minutos y sal con un plan para tu negocio.', button: 'Escribir por WhatsApp' }
  };

  var SHAPES = {
    'proof.testimonials': { name: '', role: '', text: '' },
    'packages.items': { id: '', name: '', tagline: '', price: 0, kind: 'mensual', featured: false, badge: '', stripePriceId: '', paymentLink: '', maint: 0, maintStripePriceId: '', delivery: '', priceNote: '', features: [''] }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"'`]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c];
    });
  }

  function safeUrl(u) {
    u = String(u == null ? '' : u).trim();
    if (!u) return '';
    if (/^(https:\/\/|\/|#|mailto:|tel:)/i.test(u) && !/^\/\//.test(u)) return u.slice(0, 600);
    return '';
  }

  var HEX = /^#[0-9a-f]{6}$/i;

  /* Sanea `val` con la forma de `tpl`. Descarta claves desconocidas, fuerza tipos y longitudes. */
  function sanitize(val, tpl, path) {
    path = path || '';
    if (Array.isArray(tpl)) {
      if (!Array.isArray(val)) return clone(tpl);
      var itemTpl = SHAPES[path] !== undefined ? SHAPES[path] : tpl[0];
      if (itemTpl === undefined) itemTpl = '';
      var out = [];
      for (var i = 0; i < val.length && i < 60; i++) out.push(sanitize(val[i], itemTpl, path));
      return out;
    }
    if (tpl && typeof tpl === 'object') {
      var o = {};
      val = val && typeof val === 'object' ? val : {};
      Object.keys(tpl).forEach(function (k) {
        var p = path ? path + '.' + k : k;
        o[k] = k in val ? sanitize(val[k], tpl[k], p) : clone(tpl[k]);
      });
      return o;
    }
    if (typeof tpl === 'boolean') return val === true || val === 'true';
    if (typeof tpl === 'number') { var n = Number(val); return isFinite(n) ? Math.max(-1e9, Math.min(1e9, n)) : tpl; }
    var s = String(val == null ? '' : val).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
    var key = path.split('.').pop();
    if (/^(accent|accent2|accent3|sun|sakura|ink|paper)$/.test(key) && path.indexOf('theme.') === 0) return HEX.test(s) ? s : tpl;
    if (/(link|url|href|paymentLink)$/i.test(key)) return safeUrl(s);
    if (key === 'whatsapp') return s.replace(/[^\d+ ]/g, '').slice(0, 20);
    if (key === 'id') return s.replace(/[^a-z0-9_-]/gi, '').slice(0, 40);
    if (key === 'kind' && path === 'packages.items.kind') return s === 'unico' ? 'unico' : 'mensual';
    return s.slice(0, key === 'a' || key === 'd' || key === 'sub' || key === 'description' || key === 'text' || key === 'delivery' ? 1500 : 300);
  }

  /* Contenido guardado con una versión anterior: agrega el paquete y la sección de página web sin perder lo editado. */
  function upgradeContent(c) {
    if (!c || typeof c !== 'object') return {};
    var s = clone(c);
    if (!(Number(s.v) >= 2)) {
      if (s.packages && Array.isArray(s.packages.items) && !s.packages.items.some(function (p) { return p && p.id === 'sitio'; })) s.packages.items.unshift(clone(DEFAULTS.packages.items[0]));
      if (s.sections && Array.isArray(s.sections.order) && s.sections.order.indexOf('web') < 0) { var i = s.sections.order.indexOf('services'); s.sections.order.splice(i < 0 ? 0 : i + 1, 0, 'web'); }
      s.v = 2;
    }
    return s;
  }

  function sanitizeContent(c) {
    c = upgradeContent(c);
    var out = sanitize(c, DEFAULTS, '');
    var seen = {}, order = [];
    (c && c.sections && Array.isArray(c.sections.order) ? c.sections.order : []).forEach(function (id) {
      if (SECTION_IDS.indexOf(id) > -1 && !seen[id]) { seen[id] = 1; order.push(id); }
    });
    SECTION_IDS.forEach(function (id) { if (!seen[id]) order.push(id); });
    out.sections.order = order;
    out.sections.hidden = (c && c.sections && Array.isArray(c.sections.hidden) ? c.sections.hidden : []).filter(function (id) { return SECTION_IDS.indexOf(id) > -1; });
    var ids = {};
    out.packages.items.forEach(function (p, i) {
      if (!p.id || ids[p.id]) p.id = 'pkg' + (i + 1) + Math.random().toString(36).slice(2, 5);
      ids[p.id] = 1;
      if (p.price < 0) p.price = 0;
      p.stripePriceId = /^price_[A-Za-z0-9]+$/.test(p.stripePriceId) ? p.stripePriceId : '';
      p.maintStripePriceId = /^price_[A-Za-z0-9]+$/.test(p.maintStripePriceId) ? p.maintStripePriceId : '';
      if (p.maint < 0) p.maint = 0;
      if (!Array.isArray(p.features)) p.features = [];
    });
    return out;
  }

  /* Contenido guardado + defaults, siempre completo */
  function resolveContent(saved) { return sanitizeContent(saved && typeof saved === 'object' ? saved : {}); }

  function stable(o) {
    if (Array.isArray(o)) return '[' + o.map(stable).join(',') + ']';
    if (o && typeof o === 'object') return '{' + Object.keys(o).sort().map(function (k) { return JSON.stringify(k) + ':' + stable(o[k]); }).join(',') + '}';
    return JSON.stringify(o);
  }
  function contentHash(c) {
    var s = stable(c), h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h.toString(36);
  }

  /* ---------- formato ---------- */
  function money(n) {
    n = Number(n);
    if (!isFinite(n)) return '$0';
    return '$' + Math.round(n).toLocaleString('en-US');
  }
  function num(n) { n = Number(n); return isFinite(n) ? Math.round(n).toLocaleString('en-US') : '0'; }
  function pct(n) { n = Number(n); return isFinite(n) ? (Math.round(n * 10) / 10) + '%' : '0%'; }

  function normalizeWhatsApp(v) {
    var d = String(v == null ? '' : v).replace(/\D/g, '');
    if (d.length === 13 && d.indexOf('521') === 0) d = '52' + d.slice(3);
    if (d.length === 10) d = '52' + d;
    return d.length === 12 && d.indexOf('52') === 0 ? d : (d.length >= 11 && d.length <= 15 ? d : '');
  }
  function waLink(number, text) {
    var n = normalizeWhatsApp(number);
    return 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  function uid(p) { return (p || 'id') + '_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3); }

  /* ---------- datos del cliente (portal) ---------- */
  var WEB_STAGES = [
    { id: 'brief', t: 'Brief', d: 'Nos cuentas de tu negocio y nos mandas tu material.', pct: 10 },
    { id: 'diseno', t: 'Diseño', d: 'Armamos el diseño de tu página con tu marca.', pct: 35 },
    { id: 'desarrollo', t: 'Desarrollo', d: 'La construimos y conectamos WhatsApp y formulario.', pct: 60 },
    { id: 'revision', t: 'Revisión', d: 'Tú la revisas y pides los ajustes que necesites.', pct: 85 },
    { id: 'publicado', t: 'Publicada', d: 'Tu página ya está en línea.', pct: 100 }
  ];
  var WEB_STAGE_IDS = WEB_STAGES.map(function (x) { return x.id; });
  var CHANGE_ST = ['recibida', 'en proceso', 'lista', 'rechazada'];
  var ST3 = ['pendiente', 'en proceso', 'activo'];
  var BRIEF_KEYS = ['about', 'services', 'audience', 'colors', 'refs', 'social', 'hours', 'address', 'whatsapp', 'slogan', 'extra'];

  var CLIENT_TPL = {
    plan: '',
    status: 'onboarding',
    notes: '',
    campaigns: [{ id: '', name: '', channel: 'Meta', status: 'activa', budget: 0, spent: 0, impressions: 0, clicks: 0, leads: 0, sales: 0, revenue: 0, note: '' }],
    series: [{ date: '', spend: 0, leads: 0, sales: 0, revenue: 0 }],
    content: [{ id: '', title: '', type: 'Reel', status: 'por aprobar', date: '', url: '' }],
    seo: { rankings: [{ kw: '', pos: 0, prev: 0 }], gbp: { views: 0, calls: 0, directions: 0, reviews: 0, rating: 0 } },
    reports: [{ title: '', url: '' }],
    tasks: [{ id: '', title: '', done: false }],
    web: {
      enabled: false, stage: 'brief', dueDate: '', url: '', previewUrl: '', domain: '', domainStatus: 'pendiente', domainRenew: '', ssl: 'pendiente',
      maintenance: false, changesIncluded: 2, notifyEmail: '',
      brief: { about: '', services: '', audience: '', colors: '', refs: '', social: '', hours: '', address: '', whatsapp: '', slogan: '', extra: '' },
      changes: [{ id: '', title: '', detail: '', section: '', status: 'recibida', at: '', reply: '' }],
      files: [{ id: '', title: '', url: '', by: 'cliente' }],
      timeline: [{ id: '', text: '', at: '' }]
    },
    admin: {
      notes: '', quote: 0, hours: 0, nextAction: '', nextDate: '', tags: [''],
      site: {
        headline: '', sub: '', cta: '', accent: '#FF3B5C', accent2: '#6C4DFF', theme: 'claro', logoText: '', about: '', hours: '', address: '', mapUrl: '', whatsapp: '', email: '', instagram: '', facebook: '', tiktok: '',
        services: [{ t: '', d: '' }], benefits: [{ t: '', d: '' }], faq: [{ q: '', a: '' }]
      }
    }
  };
  var CLIENT_SHAPES = { 'campaigns': CLIENT_TPL.campaigns[0], 'series': CLIENT_TPL.series[0], 'content': CLIENT_TPL.content[0], 'seo.rankings': CLIENT_TPL.seo.rankings[0], 'reports': CLIENT_TPL.reports[0], 'tasks': CLIENT_TPL.tasks[0],
    'web.changes': CLIENT_TPL.web.changes[0], 'web.files': CLIENT_TPL.web.files[0], 'web.timeline': CLIENT_TPL.web.timeline[0],
    'admin.site.services': CLIENT_TPL.admin.site.services[0], 'admin.site.benefits': CLIENT_TPL.admin.site.benefits[0], 'admin.site.faq': CLIENT_TPL.admin.site.faq[0] };
  var CLIENT_ENUM = { 'web.stage': WEB_STAGE_IDS, 'web.domainStatus': ST3, 'web.ssl': ST3, 'web.changes.status': CHANGE_ST, 'web.files.by': ['cliente', 'equipo'], 'admin.site.theme': ['claro', 'oscuro'] };
  var CLIENT_MAX = { series: 400, 'web.changes': 100, 'web.files': 100, 'web.timeline': 100, 'admin.site.services': 12, 'admin.site.benefits': 8, 'admin.site.faq': 12, 'admin.tags': 12 };
  var LONG_KEYS = /^(notes|note|about|services|audience|refs|extra|detail|reply|text|headline|sub|d|a|nextAction)$/;
  var DATE_KEYS = /^(date|dueDate|domainRenew|nextDate)$/;

  function sanitizeClientData(d) {
    // sanea con rutas propias para no chocar con las de contenido
    function walk(v, t, p) {
      if (Array.isArray(t)) {
        if (!Array.isArray(v)) return [];
        var it = CLIENT_SHAPES[p] !== undefined ? CLIENT_SHAPES[p] : t[0], out = [], max = CLIENT_MAX[p] || 200;
        for (var i = 0; i < v.length && i < max; i++) out.push(walk(v[i], it, p));
        return out;
      }
      if (t && typeof t === 'object') {
        var o = {}; v = v && typeof v === 'object' ? v : {};
        Object.keys(t).forEach(function (k) { var kp = p ? p + '.' + k : k; o[k] = k in v ? walk(v[k], t[k], kp) : (Array.isArray(t[k]) ? [] : (t[k] && typeof t[k] === 'object' ? walk({}, t[k], kp) : clone(t[k]))); });
        return o;
      }
      if (typeof t === 'boolean') return v === true || v === 'true';
      if (typeof t === 'number') { var n = Number(v); return isFinite(n) ? Math.max(-1e12, Math.min(1e12, n)) : 0; }
      var s = String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
      var key = p.split('.').pop();
      if (CLIENT_ENUM[p]) return CLIENT_ENUM[p].indexOf(s) > -1 ? s : CLIENT_ENUM[p][0];
      if (/url$/i.test(key) || key === 'mapUrl' || key === 'instagram' || key === 'facebook' || key === 'tiktok') return safeUrl(s);
      if (key === 'id') return s.replace(/[^a-z0-9_-]/gi, '').slice(0, 40);
      if (DATE_KEYS.test(key)) return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
      if (key === 'at') return /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(s) ? s : '';
      if (key === 'domain') return s.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/[^a-z0-9.-]/g, '').slice(0, 100);
      if (key === 'email' || key === 'notifyEmail') { s = s.trim().slice(0, 254); return /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(s) ? s : ''; }
      if (p.indexOf('admin.site.') === 0 && /^(accent|accent2)$/.test(key)) return HEX.test(s) ? s : t;
      if (key === 'whatsapp') return s.replace(/[^\d+ ]/g, '').slice(0, 20);
      return s.slice(0, LONG_KEYS.test(key) ? 1500 : 200);
    }
    var out = walk(d, CLIENT_TPL, '');
    out.campaigns.forEach(function (c) { if (!c.id) c.id = uid('c'); });
    out.content.forEach(function (c) { if (!c.id) c.id = uid('k'); });
    out.tasks.forEach(function (c) { if (!c.id) c.id = uid('t'); });
    out.web.changes.forEach(function (c) { if (!c.id) c.id = uid('w'); });
    out.web.files.forEach(function (c) { if (!c.id) c.id = uid('f'); });
    out.web.timeline.forEach(function (c) { if (!c.id) c.id = uid('l'); });
    out.admin.tags = out.admin.tags.filter(Boolean);
    return out;
  }
  function emptyClientData() { return sanitizeClientData({}); }

  /* ---------- proyecto web: operaciones puras (las usan el servidor y el modo demo) ---------- */
  function nowIso() { return new Date().toISOString(); }
  function webStage(web) { var i = WEB_STAGE_IDS.indexOf(web && web.stage); return WEB_STAGES[i < 0 ? 0 : i]; }
  function briefDone(web) {
    var b = (web && web.brief) || {}, n = 0;
    BRIEF_KEYS.forEach(function (k) { if (String(b[k] || '').trim()) n++; });
    return { filled: n, total: BRIEF_KEYS.length, pct: Math.round(n / BRIEF_KEYS.length * 100) };
  }
  function webPendingChanges(data) { return ((data.web && data.web.changes) || []).filter(function (c) { return c.status === 'recibida' || c.status === 'en proceso'; }).length; }
  function webActivate(data, text) {
    var d = sanitizeClientData(data);
    if (!d.web.enabled) { d.web.enabled = true; d.web.timeline.unshift({ id: uid('l'), text: text || 'Proyecto de página web iniciado.', at: nowIso() }); }
    return d;
  }
  function webSetBrief(data, brief) {
    var d = sanitizeClientData(data); brief = brief && typeof brief === 'object' ? brief : {};
    BRIEF_KEYS.forEach(function (k) { if (k in brief) d.web.brief[k] = brief[k]; });
    return sanitizeClientData(d);
  }
  function webAddChange(data, o) {
    var d = sanitizeClientData(data), title = String((o && o.title) || '').trim();
    if (!title) return d;
    d.web.changes.unshift({ id: uid('w'), title: title, detail: (o && o.detail) || '', section: (o && o.section) || '', status: 'recibida', at: nowIso(), reply: '' });
    d.web.timeline.unshift({ id: uid('l'), text: 'Solicitud de cambio: ' + title.slice(0, 80), at: nowIso() });
    return sanitizeClientData(d);
  }
  function webAddFile(data, o, by) {
    var d = sanitizeClientData(data), url = safeUrl(o && o.url), title = String((o && o.title) || '').trim();
    if (!url || !title) return d;
    d.web.files.unshift({ id: uid('f'), title: title, url: url, by: by === 'equipo' ? 'equipo' : 'cliente' });
    return sanitizeClientData(d);
  }
  function webRemoveFile(data, id, by) {
    var d = sanitizeClientData(data);
    d.web.files = d.web.files.filter(function (f) { return !(f.id === id && (by === 'equipo' || f.by === 'cliente')); });
    return d;
  }
  function webSetStage(data, stage, text) {
    var d = sanitizeClientData(data);
    if (WEB_STAGE_IDS.indexOf(stage) < 0 || d.web.stage === stage) return d;
    d.web.stage = stage;
    d.web.timeline.unshift({ id: uid('l'), text: text || ('Tu proyecto pasó a: ' + webStage(d.web).t), at: nowIso() });
    return sanitizeClientData(d);
  }

  /* Un cliente es de página web si el proyecto está activo; de marketing si tiene paquete mensual o no tiene proyecto web. */
  function packageOf(content, id) { return (content && content.packages && content.packages.items || []).filter(function (p) { return p.id === id; })[0] || null; }
  function clientKinds(content, client) {
    var data = client.data || {}, pk = packageOf(content, client.plan), web = !!(data.web && data.web.enabled);
    var mkt = !!(pk && pk.kind === 'mensual') || (!web);
    return { web: web, mkt: mkt };
  }
  function monthlyValue(content, client) {
    var pk = packageOf(content, client.plan), v = 0, data = client.data || {};
    if (pk && pk.kind === 'mensual') v += pk.price;
    var web = packageOf(content, 'sitio');
    if (data.web && data.web.enabled && data.web.maintenance && web) v += web.maint || 0;
    return v;
  }

  function exampleWeb() {
    var t0 = Date.now(), iso = function (d) { return new Date(t0 - d * 864e5).toISOString(); };
    return {
      enabled: true, stage: 'revision', dueDate: new Date(t0 + 3 * 864e5).toISOString().slice(0, 10), url: '', previewUrl: 'https://ejemplo.pages.dev', domain: 'clinicasol.mx', domainStatus: 'en proceso', domainRenew: '', ssl: 'pendiente', maintenance: false, changesIncluded: 2, notifyEmail: '',
      brief: { about: 'Clínica dental familiar en Zona Río con 10 años de experiencia.', services: 'Limpieza dental\nOrtodoncia\nBlanqueamiento', audience: 'Familias y jóvenes de Tijuana', colors: 'Azul y blanco', refs: '', social: '@clinicasol', hours: 'Lun a Vie 9:00 a 19:00', address: 'Blvd. Sánchez Taboada 1234, Zona Río', whatsapp: '6641234567', slogan: 'Sonríe sin miedo', extra: '' },
      changes: [{ id: 'w1', title: 'Cambiar la foto del inicio', detail: 'Usar la foto del equipo completo.', section: 'Inicio', status: 'en proceso', at: iso(1), reply: 'Ya la estamos acomodando.' }],
      files: [{ id: 'f1', title: 'Logo y fotos (Drive)', url: 'https://drive.google.com/', by: 'cliente' }],
      timeline: [{ id: 'l3', text: 'Tu proyecto pasó a: Revisión', at: iso(1) }, { id: 'l2', text: 'Tu proyecto pasó a: Desarrollo', at: iso(3) }, { id: 'l1', text: 'Pago confirmado. Proyecto de página web iniciado.', at: iso(6) }]
    };
  }

  /* estadísticas de ejemplo (modo demo y vistas de muestra) */
  function exampleSiteStats(days) {
    var out = [], base = Date.now(); days = days || 30;
    for (var i = days - 1; i >= 0; i--) {
      var d = new Date(base - i * 864e5), w = 1 + Math.sin(i / 2.2) * 0.3 + (days - i) / (days * 2), view = Math.round(34 * w);
      out.push({ d: d.toISOString().slice(0, 10), view: view, wa: Math.round(view * 0.09), call: Math.round(view * 0.03), form: Math.round(view * 0.04) });
    }
    return out;
  }

  function exampleClientData() {
    var series = [], base = new Date(Date.UTC(2026, 8, 1));
    for (var i = 0; i < 30; i++) {
      var d = new Date(base.getTime() + i * 86400000);
      var w = 1 + Math.sin(i / 3) * 0.25 + i / 60;
      var spend = Math.round(180 * w), leads = Math.round(6 * w), sales = Math.round(leads * 0.3);
      series.push({ date: d.toISOString().slice(0, 10), spend: spend, leads: leads, sales: sales, revenue: sales * 650 });
    }
    return sanitizeClientData({
      plan: 'crecimiento', status: 'activo', notes: 'Datos de ejemplo.',
      campaigns: [
        { id: 'c1', name: 'Mensajes WhatsApp · Servicio estrella', channel: 'Meta', status: 'activa', budget: 4500, spent: 3120, impressions: 61200, clicks: 1480, leads: 92, sales: 27, revenue: 37800, note: 'Creativo 2 rinde mejor.' },
        { id: 'c2', name: 'Búsqueda local · Tijuana', channel: 'Google', status: 'activa', budget: 3000, spent: 2410, impressions: 14800, clicks: 760, leads: 51, sales: 16, revenue: 22400, note: '' },
        { id: 'c3', name: 'Remarketing', channel: 'Meta', status: 'pausada', budget: 1000, spent: 380, impressions: 9100, clicks: 140, leads: 8, sales: 2, revenue: 2800, note: 'En pausa mientras llega nuevo creativo.' }
      ],
      series: series,
      content: [
        { id: 'k1', title: 'Reel · Antes y después', type: 'Reel', status: 'por aprobar', date: '2026-10-12', url: '' },
        { id: 'k2', title: 'Carrusel · 5 dudas frecuentes', type: 'Carrusel', status: 'aprobado', date: '2026-10-10', url: '' },
        { id: 'k3', title: 'Foto · Equipo', type: 'Foto', status: 'publicado', date: '2026-10-05', url: '' }
      ],
      seo: { rankings: [{ kw: 'dentista en tijuana', pos: 6, prev: 11 }, { kw: 'limpieza dental zona río', pos: 3, prev: 4 }, { kw: 'ortodoncia tijuana', pos: 9, prev: 9 }], gbp: { views: 4120, calls: 138, directions: 211, reviews: 64, rating: 4.8 } },
      reports: [{ title: 'Reporte de septiembre', url: '' }],
      tasks: [{ id: 't1', title: 'Enviar fotos del consultorio', done: true }, { id: 't2', title: 'Aprobar calendario de octubre', done: false }]
    });
  }

  function totals(data) {
    var t = { spend: 0, leads: 0, sales: 0, revenue: 0 };
    (data.series || []).forEach(function (r) { t.spend += r.spend; t.leads += r.leads; t.sales += r.sales; t.revenue += r.revenue; });
    t.cpl = t.leads ? t.spend / t.leads : 0;
    t.close = t.leads ? t.sales / t.leads * 100 : 0;
    t.roas = t.spend ? t.revenue / t.spend : 0;
    return t;
  }

  function toCSV(rows, cols) {
    function cell(v) {
      v = String(v == null ? '' : v);
      if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; // evita inyección de fórmulas
      return '"' + v.replace(/"/g, '""') + '"';
    }
    return '﻿' + [cols.join(',')].concat(rows.map(function (r) { return cols.map(function (c) { return cell(r[c]); }).join(','); })).join('\r\n');
  }

  g.LF = g.LF || {};
  g.LF.shared = {
    SECTION_IDS: SECTION_IDS, DEFAULTS: DEFAULTS, clone: clone, esc: esc, safeUrl: safeUrl,
    sanitizeContent: sanitizeContent, resolveContent: resolveContent, contentHash: contentHash,
    money: money, num: num, pct: pct, normalizeWhatsApp: normalizeWhatsApp, waLink: waLink, uid: uid,
    sanitizeClientData: sanitizeClientData, emptyClientData: emptyClientData, exampleClientData: exampleClientData,
    WEB_STAGES: WEB_STAGES, CHANGE_ST: CHANGE_ST, ST3: ST3, BRIEF_KEYS: BRIEF_KEYS, webStage: webStage, briefDone: briefDone, webPendingChanges: webPendingChanges, webActivate: webActivate,
    webSetBrief: webSetBrief, webAddChange: webAddChange, webAddFile: webAddFile, webRemoveFile: webRemoveFile, webSetStage: webSetStage, packageOf: packageOf, clientKinds: clientKinds, monthlyValue: monthlyValue,
    exampleWeb: exampleWeb, exampleSiteStats: exampleSiteStats,
    totals: totals, toCSV: toCSV
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = g.LF.shared;
})(typeof window !== 'undefined' ? window : globalThis);
