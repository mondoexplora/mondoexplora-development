# PÁGINAS DETALLES - MONDOEXPLORA

## 📋 **Resumen**
Documentación técnica detallada de todas las páginas del proyecto MondoExplora Next.js.

## 🏠 **PÁGINA HOME** (`/[lang]/page.tsx`)

### **URL Structure**
- **Patrón**: `/[lang]/` (ej: `/en/`, `/es/`, `/fr/`, `/it/`)
- **Ejemplo**: `https://mondoexplora.com/en/`

### **Funcionalidad**
- **H1**: "Discover Amazing Destinations"
- **Contenido**: Destinos populares, rutas, países y ofertas destacadas
- **Data Source**: `getPopularDestinations()`, `getPopularRoutes()`, `getPopularCountries()`, `getFeaturedDeals()`

### **Componentes**
- `Hero` - Sección principal con título y CTA
- `HotelGrid` - Grid de ofertas destacadas
- `Footer` - Pie de página con navegación

### **generateStaticParams**
```typescript
export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'es' },
    { lang: 'fr' },
    { lang: 'it' }
  ];
}
```

---

## 🏙️ **PÁGINA DESTINATION** (`/[lang]/destination/[city]/page.tsx`)

### **URL Structure**
- **Patrón**: `/[lang]/destination/[city]`
- **Ejemplo**: `https://mondoexplora.com/en/destination/bangkok`

### **Funcionalidad**
- **H1**: Generado desde `destinationData.hero_title`
- **Hoteles**: Muestra hasta 6 hoteles del destino
- **Data Source**: `getDestinationData(lang, city)`

### **Data Structure**
```typescript
interface DestinationData {
  city: string;
  country: string;
  hero_title: string;
  description: string;
  hero_image: string;
  hotels?: Hotel[];
}
```

### **Componentes**
- `Hero` - Con título, descripción e imagen de fondo
- `HotelGrid` - Grid de hoteles con paginación
- `Footer` - Pie de página

### **generateStaticParams**
Lee todos los archivos JSON de `data/[lang]/destination/` y genera parámetros para cada ciudad.

---

## 🛣️ **PÁGINA ROUTE** (`/[lang]/route/[origin]/[destination]/page.tsx`)

### **URL Structure**
- **Patrón**: `/[lang]/route/[origin]/[destination]`
- **Ejemplo**: `https://mondoexplora.com/en/route/new-york/bangkok`

### **Funcionalidad**
- **H1**: Generado dinámicamente (ej: "New York to Bangkok")
- **CTA Dual**: Abre `/travel_modes/` en nueva tab + redirección a affiliate link
- **Hoteles**: Muestra 6 hoteles del destino
- **Data Sources**: 
  - `getDestinationData(lang, destination)` - Para hoteles
  - `getDestinationUrlData(destination)` - Para affiliate link

### **CTA System**
```typescript
// RouteCTA Component
- Nuevo tab: /[lang]/travel_modes/[origin]/[destination]
- Redirección actual: affiliate_link del destino
```

### **Componentes**
- `Hero` - Con título dinámico y CTA dual
- `RouteCTA` - Botón con lógica dual (Client Component)
- `HotelGrid` - 6 hoteles del destino
- `Related Links` - Enlaces a país y travel modes

### **generateStaticParams**
Lee rutas desde `config/routes.json`:
```json
{
  "routes": [
    { "origin": "new-york", "destination": "bangkok" },
    { "origin": "london", "destination": "paris" }
  ]
}
```

---

## 🌍 **PÁGINA COUNTRY** (`/[lang]/country/[country]/page.tsx`)

### **URL Structure**
- **Patrón**: `/[lang]/country/[country]`
- **Ejemplo**: `https://mondoexplora.com/en/country/thailand`

### **Funcionalidad**
- **H1**: "Discover [Country]"
- **Destinos**: Grid de destinos populares del país
- **Data Source**: `getCountryData(lang, country)`

### **Data Structure**
```typescript
interface CountryData {
  name: string;
  hero_image: string;
  description?: string;
  popular_destinations?: Array<{
    name: string;
    slug: string;
    image: string;
    description: string;
    hotel_count: number;
    hotel_deals: number;
    avg_price: number;
  }>;
}
```

### **Componentes**
- `Hero` - Con título "Discover [Country]"
- `Destination Cards` - Grid de destinos populares
- `Footer` - Pie de página

### **Destination Cards**
- **Imagen**: Desde `destination.hero_image` o `destination.image`
- **Precio**: Badge en esquina superior derecha (fondo blanco, texto verde)
- **Link**: `/[lang]/destination/[slug]`

### **generateStaticParams**
Lee todos los archivos JSON de `data/[lang]/country/` y genera parámetros para cada país.

---

## 🚗 **PÁGINA TRAVEL_MODES** (`/[lang]/travel_modes/[origin]/[destination]/page.tsx`)

### **URL Structure**
- **Patrón**: `/[lang]/travel_modes/[origin]/[destination]`
- **Ejemplo**: `https://mondoexplora.com/en/travel_modes/new-york/bangkok`

### **Funcionalidad**
- **Estado**: Placeholder (pendiente de implementación)
- **Propósito**: Comparación de modos de transporte
- **Data Source**: `getRouteData(lang, origin, destination)`

### **generateStaticParams**
Mismo sistema que route pages - lee desde `config/routes.json`.

---

## 🔧 **CONFIGURACIÓN TÉCNICA**

### **TypeScript Interfaces**
```typescript
// src/types/index.ts
export interface Hotel {
  title: string;
  description: string;
  price: number;
  original_price?: number;
  hero_image: string;
  link: string;
  location_heading: string;
  location_subheading: string;
  vendor_name?: string;
}

export interface DestinationData {
  city: string;
  country: string;
  hero_title: string;
  description: string;
  hero_image: string;
  hotels?: Hotel[];
}

export interface CountryData {
  name: string;
  hero_image: string;
  description?: string;
  popular_destinations?: Array<{...}>;
}

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'it';
```

### **Data Loading Functions**
```typescript
// src/lib/data.ts
- getDestinationData(lang: SupportedLanguage, city: string)
- getCountryData(lang: SupportedLanguage, country: string)
- getDestinationUrlData(destination: string)
- getRouteData(lang: SupportedLanguage, origin: string, destination: string)
```

### **CSS Classes Principales**
```css
- .main-content - Contenedor principal
- .hotel-section-header - Título de sección de hoteles
- .destination-grid - Grid de destinos
- .destination-card - Tarjeta de destino
- .destination-price-badge - Badge de precio
- .hero-section - Sección hero
- .related-links - Enlaces relacionados
```

---

## ⚠️ **ERRORES COMUNES Y SOLUCIONES**

### **TypeScript Errors**
1. **"Property does not exist on type"**
   - **Solución**: Verificar interface en `src/types/index.ts`
   - **Ejemplo**: `hotel.value` → `hotel.original_price`

2. **"Argument of type 'string' is not assignable to parameter of type 'SupportedLanguage'"**
   - **Solución**: Cast `lang as SupportedLanguage`
   - **Ejemplo**: `getDestinationData(lang as SupportedLanguage, city)`

3. **"Module has no exported member"**
   - **Solución**: Verificar imports y exports en `src/types/index.ts`

### **Build Errors**
1. **"Page is missing generateStaticParams()"**
   - **Solución**: Agregar función `generateStaticParams()` al archivo
   - **Causa**: Next.js `output: 'export'` requiere parámetros estáticos

2. **"Cannot find module '@/components/'"**
   - **Solución**: Verificar `tsconfig.json` paths y existencia de archivos

### **Runtime Errors**
1. **"Event handlers cannot be passed to Client Component props"**
   - **Solución**: Mover lógica a Client Component separado
   - **Ejemplo**: `DestinationImage` component para `onError`

---

## 🚀 **DEPLOYMENT**

### **Netlify Configuration**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "out"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **Build Process**
1. `npm run build` - Genera páginas estáticas en `/out`
2. Netlify publica desde `/out`
3. Redirects manejan rutas dinámicas

### **Branch Strategy**
- **`spa-experiment`**: Desarrollo activo
- **`main`**: Producción estable
- **Deploy automático** desde `spa-experiment`

---

## 📊 **ESTADÍSTICAS**

### **Páginas Generadas**
- **Destinations**: ~1000+ (por idioma × ciudades)
- **Countries**: ~200+ (por idioma × países)
- **Routes**: Configurable via `config/routes.json`
- **Home**: 4 páginas (uno por idioma)

### **Performance**
- **Build Time**: ~15-20 segundos
- **Bundle Size**: Optimizado para producción
- **Lighthouse Score**: 90+ (estimado)

---

## 🔄 **MANTENIMIENTO**

### **Agregar Nuevas Rutas**
1. Editar `config/routes.json`
2. Agregar `{ "origin": "city1", "destination": "city2" }`
3. Commit y push a `spa-experiment`

### **Agregar Nuevos Destinos**
1. Crear archivo `data/[lang]/destination/[city].json`
2. Seguir estructura de `DestinationData`
3. Deploy automático desde GitHub

### **Actualizar Tipos**
1. Editar `src/types/index.ts`
2. Verificar todos los usos en el código
3. Testear build local: `npm run build` 