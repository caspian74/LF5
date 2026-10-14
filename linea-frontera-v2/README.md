# Línea Frontera · sitio, cuentas de cliente y panel de admin

Sitio de agencia de marketing para Tijuana. Todo corre en Cloudflare (gratis para empezar) y se despliega desde GitHub.

- **Landing** (`/`): portada moderna, servicios, sección de páginas web, proceso, panel de ejemplo, paquetes (mensuales y de **pago único**), calculadora, FAQ y formulario de diagnóstico.
- **Paquete "Página Web"**: $5,900 MXN pago único (editable), mantenimiento opcional de $490/mes. Al pagarlo se crea el **proyecto web** del cliente.
- **Cuentas** (`/auth.html`): registro e inicio de sesión.
- **Portal del cliente** (`/dashboard.html`): clientes de marketing ven KPIs, campañas, contenido y SEO; clientes de **página web** ven avance por etapas, su información (brief), cambios, visitas y mensajes de su página. Ambos: paquete, pagos, soporte y avisos tuyos.
- **Admin** (`/admin.html`): resumen con "requiere atención", clientes (campañas, resultados, contenido, SEO, tareas, **Sitio web** e **Interno**), **Proyectos web** (tablero por etapas), **Generador** de páginas, leads, pedidos (también manuales), tickets, usuarios, editor de todo el sitio con vista previa y versiones, herramientas (UTM, cotizador de páginas, avisos a clientes), buscador **Ctrl+K**, "ver como cliente" y estado del sistema.
- **`/t.js`**: script de medición para la página de un cliente (visitas, clics a WhatsApp, llamadas y formularios que llegan a su panel).

## Actualizar el sitio en Cloudflare (lo que haces cada vez que recibes archivos nuevos)

La base de datos **se actualiza sola**: no tienes que pegar SQL.

1. Descomprime el zip. **No sustituyas tu `wrangler.toml`** (ahí está el ID real de tu base de datos); el zip de actualización ya viene sin ese archivo.
2. En GitHub abre tu repositorio y entra a la carpeta del proyecto (`linea-frontera-v2`).
3. **Add file → Upload files**, arrastra todo el contenido de la carpeta descomprimida (carpetas incluidas: `functions`, `public`, `scripts`, `templates`, `migrations`) y presiona **Commit changes**.
4. Cloudflare detecta el cambio y publica solo: **Workers & Pages → tu proyecto → Deployments** (espera a que diga *Success*, 1 a 2 minutos).
5. Abre `https://lineafrontera.stream` con recarga fuerte (Ctrl+Shift+R). Entra a `/admin.html`: la primera vez que se abre cualquier página después del deploy, la base se actualiza sola.
6. Revisa **Admin → Ajustes → Listo para operar**: ahí ves qué falta (Stripe, avisos por correo, etc.).

Si usas la terminal en lugar de la web de GitHub: copia los archivos sobre tu carpeta, `git add . && git commit -m "Actualización" && git push`.

## Publicar en 6 pasos

1. **GitHub**: crea un repositorio y sube esta carpeta.
2. **Cloudflare → Workers & Pages → Create → Pages → Connect to Git**. Build command: `node scripts/bake.mjs`. Output directory: `public`.
3. **Base de datos**: en la terminal, con Node 22: `npm install`, `npx wrangler login`, `npx wrangler d1 create linea-frontera-db`. Copia el `database_id` a `wrangler.toml`, y corre `npm run db:init`.
4. En el proyecto de Pages: **Settings → Bindings → D1 database**, variable `DB` → `linea-frontera-db`. En **Settings → Variables and Secrets** agrega `ADMIN_SETUP_TOKEN` con una frase larga y secreta.
5. **Dominio**: Custom domains → `lineafrontera.stream` (si el dominio ya está en Cloudflare, se configura solo).
6. **Primer administrador**: abre `https://lineafrontera.stream/auth.html`, toca "Primera vez: configurar administrador", pon tu token, correo y una contraseña de 10+ caracteres. Solo funciona una vez. Después puedes borrar `ADMIN_SETUP_TOKEN`.

Haz un nuevo deploy después de agregar variables o el binding.

## Cobrar con Stripe (opcional; sin esto los pedidos se confirman por WhatsApp)

1. En Stripe crea un producto por paquete con precio mensual recurrente en MXN.
2. En Admin → **Sitio → Paquetes y precios**, pega el `price_…` de cada uno en "Stripe Price ID" y publica.
3. Variables en Cloudflare: `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`.
4. En Stripe → Developers → Webhooks agrega `https://lineafrontera.stream/api/stripe/webhook` con el evento `checkout.session.completed`.
5. Activa el portal de clientes en Stripe (Settings → Billing → Customer portal) para que cada cliente administre su tarjeta y facturas.

Con Stripe, al pagar el paquete se activa solo en la cuenta del cliente. Si prefieres, en lugar del Price ID puedes pegar un Payment Link de Stripe.

## Otras variables (todas opcionales)

| Variable | Para qué |
|---|---|
| `TURNSTILE_SITEKEY` y `TURNSTILE_SECRET` | Captcha de Cloudflare en registro, login y formulario |
| `NOTIFY_WEBHOOK` | Aviso de cada lead nuevo a Discord, Slack o Zapier |
| `RESEND_API_KEY`, `NOTIFY_EMAIL`, `RESEND_FROM` | Correo cuando llega un lead, un mensaje del sitio de un cliente o una solicitud de cambio |

Guarda las llaves y secretos como **Secret** (no como Variable de texto). En Admin → Ajustes hay un botón para enviar un aviso de prueba.

Google Analytics 4 y Meta Pixel se pegan desde Admin → Sitio → SEO y analítica (sin tocar código).

## Cómo se maneja el día a día

- **Cliente nuevo que se registra**: aparece en Clientes con su ficha vacía. Ábrela y carga campañas, resultados y contenido; él los ve en su panel.
- **Cliente que aún no tiene cuenta**: Clientes → Nuevo cliente. Te da un código; el cliente lo escribe en Cuenta → "¿Ya eras cliente?".
- **Lead del formulario**: Leads → ábrelo → "Escribir por WhatsApp" o "Convertir en cliente".
- **Transferencia**: Pedidos → "Marcar pagado" activa el paquete.
- **Cambiar textos, precios, colores o el orden de secciones**: Sitio. La vista previa se actualiza al escribir y "Publicar cambios" lo manda al sitio. Cada publicación queda en Versiones.
- **Resultados diarios**: en el cliente → Resultados diarios puedes pegar filas desde Excel (fecha, gasto, leads, ventas, ingresos).

## Vender y operar páginas web

1. **Venta**: el cliente elige "Página Web" en el sitio, se registra y paga (Stripe o transferencia por WhatsApp). Al marcarse pagado se crea su proyecto web y ve el panel de página web.
2. **Proyecto**: Admin → Proyectos web. Arrastra la tarjeta entre etapas (Brief → Diseño → Desarrollo → Revisión → Publicado); el cliente ve cada cambio en su historial.
3. **Información del cliente**: él llena su brief en el portal; tú lo ves en la ficha → Sitio web.
4. **Construir la página**: en esa pestaña pulsa "Autollenar desde el brief", ajusta textos y colores y usa **Vista previa** o **Descargar index.html**. Súbelo a un proyecto de Cloudflare Pages del cliente (Upload assets) y conecta su dominio. El archivo ya incluye el código de medición y el formulario conectado al panel del cliente.
5. **Página que no hiciste tú**: dale el código de medición (pestaña Sitio web → "Código de medición", o en su portal → Visitas) para pegar en su `<head>`. Los formularios con el atributo `data-lf` envían sus mensajes al panel.
6. **Cambios**: el cliente los pide desde su panel (2 rondas incluidas, editable por cliente); tú respondes y cambias el estado desde su ficha.
7. **Mantenimiento mensual** ($490): lo activa el cliente desde Mi paquete o tú desde la ficha; cuenta en tu ingreso mensual recurrente.

## Probar en tu computadora

```
node scripts/bake.mjs        # genera public/index.html
node scripts/dev-server.mjs  # http://localhost:8788  (base SQLite en memoria; token admin: dev-setup-token)
node scripts/test-api.mjs    # 90+ pruebas de la API
node scripts/test-migrate.mjs # prueba que una base vieja se actualiza sola
python3 scripts/e2e.py       # recorrido completo en navegador (requiere Playwright)
```

Si publicas solo la carpeta `public` en un hosting estático sin Functions (por ejemplo GitHub Pages), el sitio entra en **modo demo**: guarda todo en el navegador y muestra un aviso (la primera cuenta que crees es admin). Sirve para enseñarlo, no para operar.

## Seguridad incluida

Contraseñas con PBKDF2-SHA256, sesiones en cookie HttpOnly/Secure con token guardado como hash, protección CSRF, límites de intentos, consultas parametrizadas, todo el texto escapado, validación de enlaces y colores, CSV a prueba de fórmulas, cabeceras CSP, firma verificada en el webhook de Stripe y sin contraseñas escritas en el código.

## Pendiente de tu lado

- Revisa los textos de **aviso de privacidad y términos** con un abogado y agrega tu domicilio.
- Los **testimonios** están vacíos a propósito: en Sitio → Confianza agrégalos cuando tengas reales (si no tienen texto, no se muestran).
- Confirma si tus precios incluyen IVA y ajusta la nota de paquetes. Los $5,900 de la página web están publicados como precio final, con nota de que la factura agrega IVA; cámbialo en Sitio → Paquetes.
- Ajusta el texto de entrega (7 días hábiles) y lo que incluye el hosting del primer año si no coincide con tu operación.
- Las cifras del panel de ejemplo en la portada son demostrativas y están etiquetadas como tal.
