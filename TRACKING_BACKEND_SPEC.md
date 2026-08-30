# Backend de Tracking & Attribution (MondoExplora)

**Índice rápido:** [Resumen](#resumen-para-una-persona) · [Especificación / esquema](#especificación-para-ais--implementación) · [Implementación en el repo](#implementación-en-este-repositorio-mvp) · [Runbook (deploy + troubleshooting)](#runbook-de-operaciones-github--netlify--supabase)

## Resumen (para una persona)

### Objetivo
Tener un backend liviano que conecte:

**Ads/Organic → Sesión (visita) → Clicks a partners (incl. popunders) → Conversiones (Impact u otros) → Offline Conversions (Google Ads / Meta Ads)**.

La idea central es:
- **Una sesión** (un usuario anónimo en una ventana/navegador durante un periodo) se guarda como **1 registro**.
- Esa sesión puede generar **muchos clickouts** (popunder + clicks en hoteles).
- Cada clickout tiene un **`sub_id` único**. Ese `sub_id` viaja en el link hacia el partner y luego vuelve en el reporte de conversiones (Impact), permitiendo **match 1:1** entre conversión y clickout.

### Cómo mejora el “match”
Para maximizar el match rate de **Google** y **Meta** (offline conversions), guardamos (si el usuario consiente) los identificadores de ads:
- **Google**: `gclid`, `gbraid`, `wbraid`
- **Meta**: `fbclid`, `fbc`, `fbp`

Y los UTMs + contexto del click (partner, placement, page_url, etc.) para auditoría y reporting.

### Consentimiento / privacidad
El sitio ya tiene un sistema de consentimiento. El backend debe:
- Guardar **`consent_status`** (accepted/declined/partial/unknown) por sesión/visita.
- Si el usuario **declina**, **no guardar** identificadores de ads (`gclid`, `fb*`, etc.) ni eventos “de marketing/analytics” (según la política definida).
- Mantener **retención limitada** (ej. 90–180 días) para IDs de ads y URLs.

### Popunders y múltiples clicks
- El **popunder** se registra como un `outbound_click` normal, con `placement="popunder"`.
- Si el usuario luego hace click en varios hoteles, se crean **más filas** en `outbound_clicks` (una por click).
- **No** se reutiliza `sub_id`: **1 `sub_id` por clickout** para evitar ambigüedad al matchear conversiones.

---

## Especificación (para AIs / implementación)

### Definiciones (glosario)
- **Session / session_id**: id anónimo persistido en el navegador (p.ej. `localStorage`) que agrupa eventos.
- **Visit**: **una fila por sesión**, creada al inicio (Opción A).
- **Outbound click / clickout**: evento donde el usuario sale a un partner (popunder o click en hotel).
- **sub_id**: identificador único por clickout, incluido como parámetro en el link hacia el partner, que luego se usa para unir conversiones.

### Reglas de negocio
1. **Modelo A (1 visit por sesión)**: `visits` tiene una fila por `session_id`.
2. **1 `sub_id` por clickout** (incluye popunder).
3. **Idempotencia**:
   - `POST /visit` debe ser idempotente por `session_id` (si llega dos veces, no duplica).
   - `POST /outbound-click` puede duplicarse por retries; opcionalmente aceptar `Idempotency-Key`.
4. **Consent**:
   - Si `consent_status` es `declined`, NO persistir IDs de ads.
   - Guardar siempre `consent_status` y timestamps de cambio.
5. **Retención**:
   - IDs de ads + URLs completas: sugerido 90–180 días.
   - Agregar proceso/cron para purge (futuro).

### Checklist de identificadores por plataforma

#### Google Ads (offline)
- **Primarios**: `gclid` o `gbraid` o `wbraid`
- **Siempre**: `conversion_time`, `value`, `currency`
- **Opcional**: `order_id` / `transaction_id` (si existe)

#### Meta Ads (offline events)
- **Primarios**: `fbc` y/o `fbp` (derivados/guardados cuando hay consentimiento)
- **Complementarios**: `fbclid` (sirve para derivar `fbc` si lo construyes)
- **Siempre**: `event_time`, `value`, `currency`, `event_name`

> Nota: Los payloads exactos de upload dependen de la integración (CAPI/Offline Conversions). Este documento define qué guardar para no quedarte sin IDs.

---

## Esquema de base de datos (mínimo recomendado)

### Tabla: `visits` (1 fila por sesión)
**Propósito**: registrar entrada al sitio + consentimiento + IDs de ads y UTMs.

Campos recomendados:
- `id` (PK)
- `created_at` (timestamp)
- `session_id` (string, unique)
- `anon_user_id` (string; estable por browser si aplica, opcional)
- `landing_url` (text)
- `referrer` (text)
- `utm_source` (text)
- `utm_medium` (text)
- `utm_campaign` (text)
- `utm_content` (text)
- `utm_term` (text)
- `gclid` (text, nullable)
- `gbraid` (text, nullable)
- `wbraid` (text, nullable)
- `fbclid` (text, nullable)
- `fbc` (text, nullable)
- `fbp` (text, nullable)
- `device_type` (text)
- `browser` (text)
- `os` (text)
- `country` (text)
- `consent_status` (enum/text: `accepted|declined|partial|unknown`)
- `consent_updated_at` (timestamp, nullable)

Índices:
- unique(`session_id`)
- index(`created_at`)

---

### Tabla: `outbound_clicks` (1 fila por clickout)
**Propósito**: registrar salidas a partners y generar `sub_id` único por click.

Campos recomendados:
- `id` (PK)
- `created_at` (timestamp)
- `visit_id` (FK -> visits.id, nullable para soportar race conditions)
- `session_id` (string, index)
- `anon_user_id` (string, nullable)
- `partner` (text)
- `destination_url` (text) — URL “base” antes de insertar el parámetro
- `final_url` (text) — URL final con `sub_id`
- `sub_id` (text, unique)
- `parameter_name` (text) — nombre del parámetro en partner (ej: `sub_id`, `sid`, etc.)
- `placement` (text) — ej: `popunder|hotel_card|hero_cta|other`
- `page_url` (text) — página donde ocurrió (ej: `/en/country/x`)
- `utm_source` (text, nullable) — opcional (copia para facilitar queries)
- `utm_medium` (text, nullable)
- `utm_campaign` (text, nullable)
- `gclid` (text, nullable)
- `gbraid` (text, nullable)
- `wbraid` (text, nullable)
- `fbclid` (text, nullable)
- `fbc` (text, nullable)
- `fbp` (text, nullable)

Índices:
- unique(`sub_id`)
- index(`created_at`)
- index(`session_id`, `created_at`)
- index(`partner`, `created_at`)

Notas:
- Guardar IDs en esta tabla evita depender de join a `visits` si hay cambios futuros.
- Si `consent_status=declined`, estos campos deben guardarse nulos o no guardarse (según política).

---

### Tabla: `conversions`
**Propósito**: guardar conversiones importadas (Impact) y su match a clickouts.

Campos recomendados:
- `id` (PK)
- `created_at` (timestamp) — cuándo se ingresa al sistema
- `conversion_at` (timestamp) — timestamp real de la conversión
- `partner` (text)
- `impact_action_id` (text, nullable) — o id equivalente del proveedor
- `sub_id` (text, index)
- `outbound_click_id` (FK -> outbound_clicks.id, nullable)
- `revenue` (numeric)
- `commission` (numeric, nullable)
- `currency` (text)
- `status` (text) — approved/pending/rejected/etc.
- `matched` (boolean)
- `uploaded_to_google` (boolean)
- `uploaded_to_meta` (boolean)

Índices:
- index(`sub_id`)
- index(`conversion_at`)
- index(`matched`, `conversion_at`)

---

### Tabla: `consent_events` (recomendado)
**Propósito**: auditoría de cuándo cambian preferencias (cumplimiento y debugging).

Campos recomendados:
- `id` (PK)
- `created_at` (timestamp)
- `session_id` (string, index)
- `anon_user_id` (string, nullable)
- `consent_status` (text)
- `preferences_json` (jsonb) — `{necessary, analytics, marketing, personalization}`
- `source` (text) — `banner|privacy_page|other`

---

## Endpoints (MVP)

### `POST /visit`
**Crea o actualiza** la fila de `visits` por `session_id`.

Reglas:
- Si ya existe `visits.session_id`, retornar el existente (idempotente).
- Guardar IDs de ads solo si `consent_status != declined`.

Respuesta:
- `visit_id`, `session_id`, `consent_status`

### `POST /outbound-click`
**Crea** un `outbound_click` y devuelve el `sub_id` + `final_url`.

Reglas:
- Siempre generar `sub_id` único por click.
- Permitir `visit_id` null (si no llegó `/visit` aún).
- `placement` obligatorio (ej. `popunder`, `hotel_card`, `experience_book`,
  `gateway_city`).
- El parámetro donde viaja el `sub_id` **depende del partner** (ver abajo). Se
  guarda en `parameter_name` de la fila, para que la reconciliación posterior
  sepa dónde mirar.

Respuesta:
- `outbound_click_id`, `sub_id`, `final_url`

#### Perfiles por partner (`PARTNER_PROFILES` en `_tracking-shared.js`)

Agregado 2026-08-29 junto con `/experiences`.

| Partner | Param del `sub_id` | UTMs añadidas |
|---|---|---|
| Explore-share | `utm_content` | `utm_source=mondoexplora`, `utm_medium=affiliate`, `utm_campaign` |
| LuxuryEscapes y el resto | `TRACKING_SUB_ID_PARAM` (p. ej. `mx_sub`) | ninguna |

**Por qué `utm_content` lleva el `sub_id` y no el `gclid`.** Explore-share no
está en Impact ni ShareASale: reportan revenue contra los UTMs que reciben, a
último clic pago. El `sub_id` es único por clickout, así que su línea de revenue
hace join 1:1 contra la fila de `outbound_clicks`, y el `gclid` / `gbraid` /
`fbc` que hace falta para subir la conversión offline se lee **de esa fila**.

Mandar el `gclid` sería incorrecto por tres motivos: es uno-a-muchos (un clic de
anuncio, muchos clickouts, así que no se puede saber qué experiencia generó el
revenue), no existe para tráfico orgánico o directo, y reenviaría un
identificador publicitario saltándose el gate de consentimiento que
`stripAdsWhenDeclined()` existe para aplicar.

El `utm_campaign` que sale (`experiences_{country}_{region}`) es una etiqueta
legible para que el reporte del partner agrupe bien. Llega en el body como
`outbound_campaign` y es **distinto** del `utm_campaign` de entrada que trajo al
visitante, que se guarda en la fila sin tocar.

### `POST /conversion`
Ingresa una conversión (manual o importada).

Reglas:
- Intentar match inmediato por `sub_id`:
  - `outbound_clicks.sub_id == conversions.sub_id` → set `outbound_click_id` y `matched=true`
  - si no, `matched=false` (unmatched queue)

### `GET /api/tracking/health`
Comprueba env Supabase + lectura mínima de `visits`. Respuesta JSON: `ok`, `supabase` (`ok` | `missing_env` | `misconfigured_or_no_table`).

---

## Matching engine (básico)

Prioridad:
1. **Exact match** por `sub_id`
2. (Opcional futuro) fallback por `session_id` o `anon_user_id` + ventana temporal
3. Cola de no matcheadas para revisar

---

## Notas específicas sobre el front (MondoExplora)

El repo integra consentimiento con el tracking backend:

- `src/components/ConsentInitializer.tsx`, `src/components/PrivacyConsentBox.tsx` (evento `mx-consent-changed` para re-sincronizar la visita).
- `src/components/TrackingBootstrap.tsx` (montado en `src/app/layout.tsx`).
- `src/lib/mxSession.ts`, `src/lib/trackingSnapshot.ts`, `src/lib/trackingBackend.ts`.
- CTAs que disparan clickout: p. ej. `HotelCard`, `RouteCTA` (llaman al backend y abren `final_url` con el parámetro configurable, p. ej. `mx_sub`).
- `/experiences`: `PartnerLink` (`experience_book`) y `GatewayLink`
  (`gateway_city`), con la mecánica de nueva pestaña en `src/lib/outboundWindow.ts`.

Reglas:

- Solo persistir IDs de ads (`gclid`, `fb*`, etc.) cuando el consentimiento lo permite (ver lógica en funciones y snapshot).
- En cada clickout: registrar con el backend y abrir el partner con la URL que ya incluye `sub_id`.
- Los links de partner son `<a href>` reales con
  `rel="sponsored nofollow noopener noreferrer"`, no `window.open()` a secas: un
  handler sin ancla no le deja nada que leer al crawler, y Explore-share pidió
  nofollow explícitamente por el volumen de links.
- **`window.open()` con `noopener` en el string de features devuelve `null`**
  (así lo especifica el HTML). Pasarlo deja sin handle que redirigir y el
  fallback obvio termina navegando la pestaña actual, reemplazando la página que
  el visitante está leyendo. Abrir sin feature string y anular `opener` a mano.
  Si el popup está bloqueado no hay handle: hay que dejar que el ancla siga su
  `target="_blank"` en lugar de tocar la pestaña actual.

---

## Implementación en este repositorio (MVP)

### Qué se agregó
- **SQL**: `supabase/migrations/20260503000000_tracking_mvp.sql` — tablas `visits`, `outbound_clicks`, `conversions` + RLS.
- **Netlify Functions**: `netlify/functions/tracking-visit.js`, `tracking-outbound-click.js`, `tracking-health.js`, helper `_tracking-shared.js`.
- **Redirects**: `netlify.toml` expone `POST/OPTIONS` en:
  - `/api/tracking/visit`
  - `/api/tracking/outbound-click`
  - `GET /api/tracking/health`
- **Front**:
  - `src/lib/mxSession.ts`, `src/lib/trackingSnapshot.ts`, `src/lib/trackingBackend.ts`
  - `src/components/TrackingBootstrap.tsx` (montado en `src/app/layout.tsx`)
  - `HotelCard` y `RouteCTA` llaman al backend y abren la `final_url` con `mx_sub` (param configurable).
  - `ConsentInitializer` y `PrivacyConsentBox` emiten `mx-consent-changed` para re-sincronizar visitas.

### Dependencia
- `@supabase/supabase-js` (para las Netlify Functions).

### Variables de entorno
Ver `env_example.txt`:
- **Netlify (server)**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TRACKING_ALLOW_ORIGIN`, `TRACKING_SUB_ID_PARAM`.
- **Browser (opcional)**: `NEXT_PUBLIC_TRACKING_API_BASE` (vacío en prod = mismo origen), `NEXT_PUBLIC_TRACKING_ENABLED` (`0` desactiva).

### Pasos para activar en producción (resumen)
1. Crear proyecto Supabase y ejecutar el SQL de la migración (`supabase/migrations/20260503000000_tracking_mvp.sql`).
2. En Netlify → Environment variables: configurar `SUPABASE_*`, CORS y parámetro de sub-id (ver runbook abajo).
3. Deploy de producción. Probar `GET /api/tracking/health` y un click real (filas en `visits` / `outbound_clicks`).

El detalle operativo (PR, claves, errores frecuentes, permisos SQL) está en **Runbook de operaciones** más abajo.

---

## Runbook de operaciones (GitHub + Netlify + Supabase)

Esta sección documenta el flujo real usado para llevar el MVP a producción y los problemas que aparecieron al activarlo.

### 1. Código en GitHub: merge “solo tracking”

Para no arrastrar otros cambios de otra rama, el trabajo de tracking se integró a `main` desde la rama **`feature/tracking-only`** (cherry-picks sobre `main`), no desde `feature/tracking-backend-mvp` (que podía incluir más commits ajenos al tracking).

Pasos típicos:

1. En GitHub, **Compare & pull request** para **`feature/tracking-only`** (o abrir el comparador manualmente).
2. **Base:** `main` · **Compare:** `feature/tracking-only`.
3. Revisar que el diff sea razonable (~19 archivos: SQL, `netlify.toml`, functions, front, `package.json`, docs).
4. **Create pull request** → **Merge pull request** (o squash, según convención del repo).

Tras el merge, Netlify (si está enganchado a `main`) dispara un deploy de producción.

### 2. Netlify: deploy y variables por contexto

1. **Deploys**: confirmar que el último deploy de **Production** corresponde al merge en `main` y está **Published** (verde).
2. **Site configuration → Environment variables**: usar **“Different value for each deploy context”** solo si necesitás valores distintos; si no, un valor único para todos los contextos reduce errores.
3. Variables obligatorias para las functions de tracking (mismos nombres que en `env_example.txt`):

| Variable | Uso |
|----------|-----|
| `SUPABASE_URL` | URL base del proyecto, p. ej. `https://<project-ref>.supabase.co` (sin `/rest/v1`). |
| `SUPABASE_SERVICE_ROLE_KEY` | JWT **`service_role`** (ver sección de claves). |
| `TRACKING_ALLOW_ORIGIN` | Lista separada por comas de orígenes permitidos para CORS (incluir `https://mondoexplora.com` y localhost si probás en dev). |
| `TRACKING_SUB_ID_PARAM` | Nombre del query param en la URL del partner, p. ej. `mx_sub`. |

4. Si editás variables: **Save** y luego **Trigger deploy → Deploy site** en **Production** para que las functions vean los valores nuevos.

**Nota sobre caché:** no hace falta “limpiar caché” de Netlify por cambiar env vars; basta redeploy. Si el navegador muestra una respuesta vieja de `GET /api/tracking/health`, probá ventana privada o recarga forzada.

### 3. Supabase: dónde ver los datos

1. Dashboard → proyecto correcto (el **`project-ref`** debe coincidir con `SUPABASE_URL`).
2. **Table Editor** → esquema **`public`** → tablas **`visits`**, **`outbound_clicks`**, **`conversions`**.
3. Alternativa: **Database → Tables** para la misma lista.

### 4. Health check

En producción (mismo dominio que el sitio, para evitar CORS en pruebas manuales):

`GET /api/tracking/health`

Respuesta esperada cuando todo está bien:

```json
{"ok":true,"supabase":"ok"}
```

La function hace `select('id').limit(1)` sobre `public.visits` vía `@supabase/supabase-js` y el **service role**.

### 5. Claves de Supabase (qué pegar en Netlify)

En **Project Settings → API** de Supabase aparecen varias cosas; para **`SUPABASE_SERVICE_ROLE_KEY`** en Netlify hay que usar:

- **Sí:** la clave **service_role** de la sección **Legacy anon / service_role API keys** (JWT largo que empieza con **`eyJ`**). Es la que identifica el rol `service_role` ante PostgREST.

- **No:** el **Legacy JWT secret** (bloque “JWT Keys”): sirve para **firmar** tokens, **no** es la API key que se pasa a `createClient(url, key)`.

- **No:** la clave **anon** / publishable para esta variable (no bypass / permisos distintos).

Comprobación sin compartir secretos: pegar el token en [jwt.io](https://jwt.io) (solo en tu máquina) y verificar en el payload JSON:

- `"role": "service_role"`
- `"ref": "<project-ref>"` debe ser el mismo subdominio que en `SUPABASE_URL` (`https://<project-ref>.supabase.co`).

### 6. Error: `permission denied for table visits`

Si `/api/tracking/health` devuelve algo como:

```json
{"ok":false,"supabase":"misconfigured_or_no_table","detail":"permission denied for table visits"}
```

Orden de diagnóstico:

1. **`SUPABASE_URL`** y **`SUPABASE_SERVICE_ROLE_KEY`** del **mismo** proyecto (mismo `ref` en JWT y en la URL).
2. **`SUPABASE_SERVICE_ROLE_KEY`** en Netlify: en **Production** (y en cualquier contexto desde el que probés) debe ser el JWT **`service_role`**, no anon ni el JWT secret.
3. Tras cualquier cambio: **Trigger deploy** de producción.
4. Si el JWT es correcto y la URL coincide pero el error persiste, en **SQL Editor** del proyecto ejecutar (no devuelve filas; es normal):

```sql
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.visits to service_role;
grant select, insert, update, delete on table public.outbound_clicks to service_role;
grant select, insert, update, delete on table public.conversions to service_role;
```

La migración MVP habilita **RLS** en esas tablas; en teoría el rol `service_role` debería poder operar; en algunos entornos conviene dejar explícitos los `GRANT` anteriores.

### 7. Matching: `sub_id` de conversión → identificador de click de Google

Objetivo: cuando una conversión llega del partner (p. ej. Impact) con el mismo identificador que enviaste en el link (`sub_id`), poder subir **offline conversions** a Google usando **`gclid`** (o `gbraid` / `wbraid` según corresponda).

Cadena lógica:

1. La conversión trae **`sub_id`** (el que pusiste en el query param del partner, p. ej. vía `TRACKING_SUB_ID_PARAM`).
2. Buscás **`outbound_clicks.sub_id`** (unique en el MVP) → una fila = un clickout concreto.
3. Para Google Ads, preferís el **`gclid`** (o variantes) guardado en **esa fila** de `outbound_clicks` (alineado en tiempo con el click).
4. Si en `outbound_clicks` viniera vacío pero tenés **`visit_id`**, podés subir a **`visits`** y usar el `gclid` de la sesión (según política de atribución).
5. En **`conversions`** podés persistir **`outbound_click_id`** y/o copiar el id de ads al importar, para no depender del join en cada export.

**Consentimiento:** si el usuario no aceptó marketing/analytics según vuestra política, los campos de ads pueden ir **nulos**; en ese caso el `sub_id` sigue uniendo conversión con clickout comercial, pero puede no haber **`gclid`** utilizable para Google (valorar enhanced conversions u otras vías).

### 8. Campos `os` / `browser` u otros “raros” en el MVP

Los valores de dispositivo/navegador vienen del **snapshot en el cliente** (user-agent y heurísticas). Si algo se ve mal, revisar `trackingSnapshot` / payload enviado a `POST` visit y el consentimiento; se puede afinar en una iteración posterior sin cambiar el modelo de tablas.

### 9. Endpoints expuestos en producción (MVP actual)

Rutas públicas del sitio (vía redirects en `netlify.toml` hacia functions):

- `POST /api/tracking/visit` → `tracking-visit`
- `POST /api/tracking/outbound-click` → `tracking-outbound-click`
- `GET /api/tracking/health` → `tracking-health`

Los paths exactos y el comportamiento CORS están definidos en el código de `netlify/functions/` y en `netlify.toml`.

