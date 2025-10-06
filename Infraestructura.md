# MondoExplora - Documento de Infraestructura y Tecnologías

## 📋 Tabla de Contenidos
1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Diagrama de Flujo Completo](#4-diagrama-de-flujo-completo)
5. [Tecnologías Detalladas](#5-tecnologías-detalladas)
6. [Interacciones y APIs](#6-interacciones-y-apis)
7. [Flujo de Datos](#7-flujo-de-datos)
8. [Escalabilidad y Performance](#8-escalabilidad-y-performance)
9. [Costos y Recursos](#9-costos-y-recursos)
10. [Monitoreo y Analytics](#10-monitoreo-y-analytics)

---

## 1. Resumen Ejecutivo

**MondoExplora** utiliza un stack moderno de tecnologías web para crear un sitio de afiliación de viajes altamente escalable, con soporte para 100,000+ páginas estáticas, tracking avanzado de conversiones y optimización SEO/SEM.

### Objetivos de la Infraestructura:
- **Performance:** Carga ultra-rápida con HTML estático prerenderizado
- **Escalabilidad:** Soporte para decenas de miles de páginas
- **SEO:** Optimización completa para motores de búsqueda
- **Tracking:** Medición precisa de conversiones y ROI
- **Costos:** Infraestructura gratuita hasta escalar significativamente

---

## 2. Stack Tecnológico

### 🎯 **Frontend & Framework**
- **Next.js 14+** - Framework React con SSG
- **React 18** - Librería de interfaz de usuario
- **TypeScript** - JavaScript tipado para mayor seguridad
- **Tailwind CSS** - Framework CSS utilitario

### 🚀 **Hosting & Despliegue**
- **Netlify** - Hosting, CDN y CI/CD
- **GitHub** - Control de versiones y repositorio
- **Vercel** (alternativa) - Hosting especializado en Next.js

### 📊 **Analytics & Tracking**
- **Google Analytics 4** - Analytics web
- **Google Tag Manager** - Gestión de tags
- **Meta Pixel** - Tracking de Facebook/Instagram
- **Microsoft Clarity** - Heatmaps y grabaciones
- **Google Ads** - Tracking de campañas SEM
- **Microsoft Ads** - Tracking de campañas Bing

### 🗄️ **Base de Datos & Almacenamiento**
- **JSON Estático** - Datos de hoteles y rutas
- **BigQuery** - Data warehouse para analytics
- **Netlify Functions** - Serverless functions
- **GitHub Actions** - Automatización de builds

### 🌐 **APIs & Integraciones**
- **Geolocation APIs** - Detección de ubicación del usuario
- **Affiliate APIs** - Integración con partners (Booking, Expedia)
- **Currency APIs** - Conversión de monedas
- **Weather APIs** - Información meteorológica

---

## 3. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Next.js App (React + TypeScript + Tailwind CSS)          │
│  ├── Pages Router (/[lang]/[type]/[slug])                 │
│  ├── Static Site Generation (SSG)                         │
│  ├── Client-side Hydration                                │
│  └── Progressive Web App (PWA)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   HOSTING & CDN                            │
├─────────────────────────────────────────────────────────────┤
│  Netlify                                                    │
│  ├── Global CDN (200+ locations)                          │
│  ├── Automatic SSL/HTTPS                                  │
│  ├── Edge Functions                                       │
│  └── Form Handling                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  Static JSON Files                                        │
│  ├── /data/json/{lang}/route/{origin}/{destination}.json  │
│  ├── /data/json/{lang}/destination/{city}.json           │
│  ├── /data/json/{lang}/country/{country}.json            │
│  └── /data/json/{lang}/deals/{city}.json                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  ANALYTICS LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Google Analytics 4 + BigQuery                            │
│  ├── Real-time tracking                                   │
│  ├── Conversion tracking                                  │
│  ├── User behavior analysis                               │
│  └── Custom dimensions & metrics                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Diagrama de Flujo Completo

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DEVELOPER     │    │    GITHUB       │    │    NETLIFY      │
│                 │    │                 │    │                 │
│ 1. Code Changes │───▶│ 2. Push Code    │───▶│ 3. Auto Build   │
│    (React/TS)   │    │    (Repo)       │    │   (CI/CD)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NEXT.JS       │    │   STATIC HTML   │    │    CDN GLOBAL   │
│                 │    │                 │    │                 │
│ 4. SSG Process  │◀───│ 5. Generate     │◀───│ 6. Deploy to    │
│   (Build Time)  │    │   100k+ Pages   │    │   200+ Locations│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USER        │    │   REACT APP     │    │   TRACKING      │
│                 │    │                 │    │                 │
│ 7. Visit URL    │───▶│ 8. Hydration    │───▶│ 9. Analytics    │
│   (Browser)     │    │   (Client)      │    │   (GA4/Pixel)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AFFILIATE     │    │   BIGQUERY      │    │   OPTIMIZATION  │
│                 │    │                 │    │                 │
│ 10. CTA Click   │───▶│ 11. Data Export │───▶│ 12. Campaign    │
│    (Partner)    │    │   (Analytics)   │    │   Optimization  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔄 **Flujo Detallado por Etapa:**

#### **Etapa 1: Desarrollo (Developer)**
- Escribe código React/TypeScript
- Usa Tailwind CSS para estilos
- Crea componentes reutilizables
- Define estructura de datos JSON

#### **Etapa 2: Versionado (GitHub)**
- Control de versiones del código
- Branching para features
- Pull requests para reviews
- Integración continua

#### **Etapa 3: Build (Netlify)**
- Detecta cambios automáticamente
- Ejecuta `npm run build`
- Next.js genera páginas estáticas
- Optimiza assets (imágenes, CSS, JS)

#### **Etapa 4: Generación (Next.js SSG)**
- Lee archivos JSON de datos
- Genera HTML estático para cada ruta
- Aplica SEO optimizations
- Crea sitemap y robots.txt

#### **Etapa 5: Despliegue (Netlify CDN)**
- Distribuye archivos a 200+ ubicaciones
- Configura SSL automáticamente
- Optimiza cache y compression
- Monitorea performance

#### **Etapa 6: Usuario (Browser)**
- Solicita página específica
- Recibe HTML estático optimizado
- React se hidrata en cliente
- Interfaz se vuelve interactiva

#### **Etapa 7: Tracking (Analytics)**
- Google Analytics 4 captura eventos
- Meta Pixel trackea conversiones
- Data se envía a BigQuery
- Reportes se generan automáticamente

#### **Etapa 8: Conversión (Affiliate)**
- Usuario hace clic en CTA
- Se abre nueva pestaña con contenido interno
- Pestaña original redirige a partner
- Tracking de conversión final

---

## 5. Tecnologías Detalladas

### 🎯 **Next.js 14+**

**Rol en el proyecto:**
- Framework principal para el frontend
- Generación estática de páginas (SSG)
- Routing dinámico con parámetros
- Optimización automática de performance

**Funciones específicas:**
```javascript
// Generación de rutas dinámicas
export async function getStaticPaths() {
  return {
    paths: [
      { params: { lang: 'es', type: 'route', origin: 'madrid', destination: 'valencia' } },
      { params: { lang: 'en', type: 'destination', city: 'bangkok' } }
    ],
    fallback: false
  };
}

// Carga de datos por página
export async function getStaticProps({ params }) {
  const data = await loadPageData(params);
  return { props: { data } };
}
```

**Ventajas para MondoExplora:**
- ✅ Genera 100,000+ páginas estáticas
- ✅ SEO optimizado con HTML prerenderizado
- ✅ Performance excepcional con CDN
- ✅ Hydration para interactividad SPA

### ⚛️ **React 18**

**Rol en el proyecto:**
- Librería de interfaz de usuario
- Componentes reutilizables
- Gestión de estado y efectos
- Interactividad del lado del cliente

**Componentes principales:**
```jsx
// HotelCard Component
function HotelCard({ hotel }) {
  const handleCTAClick = () => {
    // Lógica de afiliación dual
    window.open(`/destination/${hotel.city}`, '_blank');
    window.location.href = hotel.affiliateLink;
  };

  return (
    <div className="hotel-card">
      <img src={hotel.image} alt={hotel.name} />
      <h3>{hotel.name}</h3>
      <p>{hotel.location}</p>
      <span className="price">${hotel.price}</span>
      <button onClick={handleCTAClick}>Ver oferta</button>
    </div>
  );
}
```

**Ventajas para MondoExplora:**
- ✅ Componentes reutilizables en todas las páginas
- ✅ Interactividad avanzada con CTAs
- ✅ Gestión eficiente de estado
- ✅ Virtual DOM para performance

### 🎨 **Tailwind CSS**

**Rol en el proyecto:**
- Framework CSS utilitario
- Diseño responsive
- Consistencia visual
- Desarrollo rápido

**Ejemplo de uso:**
```jsx
function HeroSection({ title, subtitle }) {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 h-96">
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-xl">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
```

**Ventajas para MondoExplora:**
- ✅ Desarrollo rápido de interfaces
- ✅ Diseño responsive automático
- ✅ Bundle size optimizado
- ✅ Consistencia en todo el sitio

### 🚀 **Netlify**

**Rol en el proyecto:**
- Hosting y CDN global
- CI/CD automático
- SSL/HTTPS automático
- Edge Functions

**Configuración típica:**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

**Ventajas para MondoExplora:**
- ✅ CDN global con 200+ ubicaciones
- ✅ Despliegues automáticos desde GitHub
- ✅ SSL gratuito automático
- ✅ Edge Functions para lógica serverless

### 📊 **Google Analytics 4 + BigQuery**

**Rol en el proyecto:**
- Tracking de usuarios y comportamiento
- Medición de conversiones
- Análisis de performance
- Exportación de datos para optimización

**Configuración de eventos:**
```javascript
// Tracking de eventos personalizados
gtag('event', 'hotel_click', {
  hotel_name: 'Baur Au Lac',
  destination: 'Zurich',
  price: 163,
  currency: 'USD',
  user_country: 'ES'
});

// Tracking de conversiones
gtag('event', 'conversion', {
  send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
  value: 163,
  currency: 'USD',
  transaction_id: 'T_12345'
});
```

**Ventajas para MondoExplora:**
- ✅ Tracking granular de conversiones
- ✅ Integración con Google Ads
- ✅ Exportación automática a BigQuery
- ✅ Reportes personalizados

### 🔗 **GitHub**

**Rol en el proyecto:**
- Control de versiones
- Colaboración en equipo
- Integración continua
- Gestión de releases

**Workflow típico:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: '.next'
```

**Ventajas para MondoExplora:**
- ✅ Control de versiones robusto
- ✅ Integración automática con Netlify
- ✅ Colaboración en equipo
- ✅ Rollbacks rápidos

---

## 6. Interacciones y APIs

### 🔄 **Flujo de Datos entre Tecnologías**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   JSON      │    │   Next.js   │    │   React     │
│   Files     │───▶│   SSG       │───▶│   Components│
│             │    │             │    │             │
│ Hotel Data  │    │ Build Time  │    │ UI Render   │
│ Route Data  │    │ Generation  │    │ Interaction │
└─────────────┘    └─────────────┘    └─────────────┘
                                                        │
                                                        ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Netlify   │    │   Analytics │    │   BigQuery  │
│   CDN       │◀───│   Tracking  │───▶│   Data      │
│             │    │             │    │   Warehouse │
│ HTML Static │    │ GA4/Pixel   │    │ Reports     │
│ Global CDN  │    │ Events      │    │ Optimization│
└─────────────┘    └─────────────┘    └─────────────┘
```

### 🌐 **APIs Externas Integradas**

#### **Geolocation API**
```javascript
// Detección de ubicación del usuario
navigator.geolocation.getCurrentPosition((position) => {
  const { latitude, longitude } = position.coords;
  // Enviar a analytics para personalización
  gtag('event', 'user_location', {
    latitude,
    longitude
  });
});
```

#### **Currency API**
```javascript
// Conversión de monedas en tiempo real
async function convertCurrency(amount, from, to) {
  const response = await fetch(
    `https://api.exchangerate-api.com/v4/latest/${from}`
  );
  const data = await response.json();
  return amount * data.rates[to];
}
```

#### **Weather API**
```javascript
// Información meteorológica para destinos
async function getWeather(city) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
  );
  return response.json();
}
```

---

## 7. Flujo de Datos

### 📊 **Pipeline de Datos Completo**

```
1. USER INTERACTION
   └── Click en CTA de hotel
       │
       ▼
2. REACT EVENT HANDLER
   └── handleCTAClick()
       │
       ▼
3. DUAL ACTION
   ├── window.open() → Nueva pestaña interna
   └── window.location → Redirección afiliado
       │
       ▼
4. TRACKING EVENTS
   ├── Google Analytics 4
   ├── Meta Pixel
   ├── Microsoft Ads
   └── Custom Events
       │
       ▼
5. DATA COLLECTION
   └── BigQuery Tables
       │
       ▼
6. ANALYSIS & OPTIMIZATION
   ├── Conversion Reports
   ├── ROI Analysis
   ├── Campaign Optimization
   └── A/B Testing
```

### 🗄️ **Estructura de Datos en BigQuery**

```sql
-- Tabla de eventos de usuario
CREATE TABLE user_events (
  event_id STRING,
  user_id STRING,
  session_id STRING,
  event_name STRING,
  event_timestamp TIMESTAMP,
  page_url STRING,
  destination STRING,
  origin STRING,
  hotel_name STRING,
  price FLOAT64,
  currency STRING,
  user_country STRING,
  user_city STRING,
  utm_source STRING,
  utm_medium STRING,
  utm_campaign STRING
);

-- Tabla de conversiones
CREATE TABLE conversions (
  conversion_id STRING,
  user_id STRING,
  event_id STRING,
  conversion_value FLOAT64,
  currency STRING,
  affiliate_partner STRING,
  conversion_timestamp TIMESTAMP,
  attribution_data STRUCT<
    first_click_source STRING,
    last_click_source STRING,
    assisted_conversions ARRAY<STRING>
  >
);
```

---

## 8. Escalabilidad y Performance

### 📈 **Estrategias de Escalabilidad**

#### **Horizontal Scaling (Netlify CDN)**
- **200+ ubicaciones globales** para distribución de contenido
- **Auto-scaling** basado en demanda
- **Edge caching** para contenido estático
- **Load balancing** automático

#### **Vertical Scaling (Next.js SSG)**
- **Pre-rendering** de todas las páginas en build time
- **Code splitting** automático por rutas
- **Image optimization** automática
- **Bundle optimization** con Tree Shaking

### ⚡ **Optimizaciones de Performance**

#### **Frontend Optimizations**
```javascript
// Next.js Image Component
import Image from 'next/image';

function HotelCard({ hotel }) {
  return (
    <Image
      src={hotel.image}
      alt={hotel.name}
      width={300}
      height={200}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      priority={true}
    />
  );
}
```

#### **Backend Optimizations**
```javascript
// Netlify Edge Function
export default async (request, context) => {
  const { geo } = context;
  
  // Personalización basada en ubicación
  const userCountry = geo.country;
  const userCity = geo.city;
  
  return new Response(JSON.stringify({
    country: userCountry,
    city: userCity,
    currency: getCurrencyForCountry(userCountry)
  }));
};
```

### 📊 **Métricas de Performance**

#### **Core Web Vitals**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

#### **SEO Metrics**
- **Page Speed:** 95+ en Lighthouse
- **Mobile Friendly:** 100%
- **Accessibility:** 95+
- **Best Practices:** 95+

---

## 9. Costos y Recursos

### 💰 **Análisis de Costos**

#### **Free Tier (Hasta 100,000 páginas)**
| Servicio | Costo | Límites |
|----------|-------|---------|
| **Netlify** | $0/mes | 600 min build/mes |
| **GitHub** | $0/mes | Repos públicos ilimitados |
| **Google Analytics 4** | $0/mes | 10M hits/mes |
| **BigQuery** | $0/mes | 1TB procesamiento/mes |
| **Next.js** | $0/mes | Open source |

#### **Paid Tier (Escalado)**
| Servicio | Costo | Cuándo necesitar |
|----------|-------|------------------|
| **Netlify Pro** | $19/mes | >600 min build o Edge Functions |
| **BigQuery** | $5/TB | >1TB procesamiento/mes |
| **Google Analytics 360** | $150k/año | Enterprise features |

### 📊 **Recursos de Desarrollo**

#### **Tiempo de Desarrollo Estimado**
- **Setup inicial:** 1-2 semanas
- **Componentes base:** 2-3 semanas
- **Integración tracking:** 1 semana
- **Testing y optimización:** 1-2 semanas
- **Total MVP:** 5-8 semanas

#### **Equipo Recomendado**
- **1 Frontend Developer** (React/Next.js)
- **1 Data Analyst** (Analytics/BigQuery)
- **1 Marketing Specialist** (SEM/Tracking)

---

## 10. Monitoreo y Analytics

### 📈 **Dashboard de Monitoreo**

#### **KPIs Principales**
```javascript
// Métricas clave a monitorear
const KPIs = {
  // Performance
  pageLoadTime: '< 2s',
  coreWebVitals: '95+ score',
  
  // SEO
  organicTraffic: 'Monthly growth',
  searchRankings: 'Top 10 positions',
  
  // Conversions
  conversionRate: 'Target: 2-5%',
  revenuePerClick: 'Track by campaign',
  
  // User Experience
  bounceRate: '< 40%',
  timeOnSite: '> 2 minutes',
  
  // Technical
  uptime: '99.9%',
  errorRate: '< 0.1%'
};
```

#### **Alertas Automáticas**
```javascript
// Configuración de alertas
const alerts = {
  // Performance alerts
  pageLoadTime: {
    threshold: 3000, // 3 seconds
    action: 'sendSlackNotification'
  },
  
  // Conversion alerts
  conversionRate: {
    threshold: 0.01, // 1%
    action: 'sendEmailAlert'
  },
  
  // Error alerts
  errorRate: {
    threshold: 0.05, // 5%
    action: 'createJiraTicket'
  }
};
```

### 🔍 **Herramientas de Monitoreo**

#### **Performance Monitoring**
- **Lighthouse CI** - Automatización de métricas
- **Web Vitals** - Core Web Vitals tracking
- **Netlify Analytics** - Performance insights

#### **Error Tracking**
- **Sentry** - Error monitoring y alertas
- **LogRocket** - Session replay
- **Bugsnag** - Real-time error tracking

#### **Business Intelligence**
- **Google Data Studio** - Dashboards personalizados
- **Tableau** - Análisis avanzado
- **Metabase** - Self-service analytics

---

## 🚀 **Próximos Pasos de Implementación**

### **Fase 1: Setup Inicial (Semana 1-2)**
- [ ] Configurar repositorio GitHub
- [ ] Crear proyecto Next.js con TypeScript
- [ ] Configurar Netlify deployment
- [ ] Implementar estructura de carpetas

### **Fase 2: Desarrollo Core (Semana 3-5)**
- [ ] Crear componentes React base
- [ ] Implementar SSG con getStaticPaths
- [ ] Migrar CSS de hotel boxes
- [ ] Configurar i18n

### **Fase 3: Integración Analytics (Semana 6)**
- [ ] Configurar Google Analytics 4
- [ ] Implementar Meta Pixel
- [ ] Configurar BigQuery export
- [ ] Crear dashboards de tracking

### **Fase 4: Testing y Optimización (Semana 7-8)**
- [ ] Testing de performance
- [ ] Optimización SEO
- [ ] Testing de conversiones
- [ ] Deployment a producción

---

*Documento actualizado: Julio 2025* 