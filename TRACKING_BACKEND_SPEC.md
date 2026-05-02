# Backend de Tracking & Attribution (MondoExplora)

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
- `placement` obligatorio (ej. `popunder` o `hotel_card`).

Respuesta:
- `outbound_click_id`, `sub_id`, `final_url`

### `POST /conversion`
Ingresa una conversión (manual o importada).

Reglas:
- Intentar match inmediato por `sub_id`:
  - `outbound_clicks.sub_id == conversions.sub_id` → set `outbound_click_id` y `matched=true`
  - si no, `matched=false` (unmatched queue)

### `GET /health`
OK + versión.

---

## Matching engine (básico)

Prioridad:
1. **Exact match** por `sub_id`
2. (Opcional futuro) fallback por `session_id` o `anon_user_id` + ventana temporal
3. Cola de no matcheadas para revisar

---

## Notas específicas sobre el front (MondoExplora)

El repo ya tiene consentimiento y tracking básico:
- `src/components/CookieConsent.tsx`
- `src/components/ConsentInitializer.tsx`
- `src/lib/trackingManager.ts`

Regla propuesta:
- Solo llamar al backend para guardar IDs de ads (gclid/fb*) si hay consentimiento para `marketing` (y/o `analytics`, según política).
- En popunders/hotel clicks: primero llamar `POST /outbound-click`, luego abrir el partner con la `final_url`.

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

### Pasos para activar en producción
1. Crear proyecto Supabase y ejecutar el SQL de la migración.
2. En Netlify → Site settings → Environment: pegar `SUPABASE_*` y CORS.
3. Deploy. Probar `GET /api/tracking/health` y luego un click real de hotel (ver fila en `outbound_clicks`).

