# 🗺️ Route Management System

Sistema completo para gestionar rutas de viaje con proveedores reales y links de reserva.

## 📁 Estructura de Archivos

```
data/
├── popular_routes.json          # Archivo principal con todas las rutas
├── routes/                      # Archivos JSON individuales por ruta
│   ├── london_paris.json
│   ├── tokyo_kyoto.json
│   └── ...
generate_popular_routes.py       # Genera archivos individuales desde popular_routes.json
add_route.py                     # Herramienta interactiva para agregar rutas
```

## 🚀 Uso Rápido

### 1. Ver rutas existentes
```bash
python3 add_route.py
# Selecciona opción 2: "List all routes"
```

### 2. Agregar nueva ruta
```bash
python3 add_route.py
# Selecciona opción 1: "Add new route"
```

### 3. Generar archivos de rutas
```bash
python3 generate_popular_routes.py
```

## 📋 Tipos de Rutas

| Tipo | Descripción | Modos Disponibles |
|------|-------------|-------------------|
| `international_air` | Solo vuelos internacionales | ✈️ Flight |
| `international_coastal` | Vuelos + ferries costeros | ✈️ Flight, ⛴️ Ferry |
| `domestic_major` | Todas las opciones (ciudades principales) | ✈️ Flight, 🚄 Train, 🚌 Bus, 🚗 Car |
| `domestic_regional` | Sin vuelos (regional) | 🚄 Train, 🚌 Bus, 🚗 Car |
| `island_hopping` | Vuelos + ferries (islas) | ✈️ Flight, ⛴️ Ferry |

## 🔗 Proveedores Incluidos

### ✈️ Aerolíneas
- **British Airways** - https://www.britishairways.com
- **Air France** - https://www.airfrance.com
- **Lufthansa** - https://www.lufthansa.com
- **Qantas** - https://www.qantas.com
- **Japan Airlines** - https://www.jal.com
- **Singapore Airlines** - https://www.singaporeair.com
- Y muchas más...

### 🚄 Trenes
- **Eurostar** - https://www.eurostar.com
- **JR Shinkansen** - https://japanrailpass.net
- **Renfe AVE** - https://www.renfe.com
- **Deutsche Bahn** - https://www.bahn.com
- **VIA Rail** - https://www.viarail.ca

### 🚌 Buses
- **FlixBus** - https://www.flixbus.com
- **Greyhound** - https://www.greyhound.com
- **ALSA** - https://www.alsa.com
- **Willer Express** - https://willerexpress.com

### ⛴️ Ferries
- **Balearia** - https://www.balearia.com
- **Direct Ferries** - https://www.directferries.com

## 🌍 Rutas Actuales (17 rutas)

### Europa
- London → Paris (Eurostar, British Airways, Air France)
- London → Amsterdam (Eurostar, KLM)
- Paris → Rome (TGV, Air France, Alitalia)
- Barcelona → Madrid (Renfe AVE, Iberia)
- Berlin → Munich (Deutsche Bahn, Lufthansa)

### Asia
- Tokyo → Kyoto (JR Shinkansen, JAL, ANA)
- Seoul → Busan (KTX, Korean Air, Asiana)
- Singapore → Bangkok (Singapore Airlines, Thai Airways)
- Hong Kong → Taipei (Cathay Pacific, China Airlines)

### Américas
- New York → Los Angeles (American, Delta, United)
- Miami → Orlando (American, Southwest)
- Toronto → Montreal (Air Canada, VIA Rail)
- Mexico City → Cancun (Aeromexico, Volaris)

### Australia & Oceanía
- Sydney → Gold Coast (Qantas, Virgin Australia)
- Auckland → Wellington (Air New Zealand)

### África
- Cairo → Alexandria (Egyptian Railways)
- Johannesburg → Cape Town (South African Airways)

## 📝 Agregar Nueva Ruta

### Opción 1: Herramienta Interactiva
```bash
python3 add_route.py
```

### Opción 2: Editar JSON Manualmente
Edita `data/popular_routes.json`:

```json
{
  "origin": "madrid",
  "destination": "lisbon",
  "type": "domestic_major",
  "distance": "600 km",
  "providers": {
    "flight": {
      "providers": [
        {
          "name": "Iberia",
          "website": "https://www.iberia.com",
          "direct": true
        }
      ],
      "airports": {
        "origin": "Madrid Barajas (MAD)",
        "destination": "Lisbon Portela (LIS)"
      }
    },
    "bus": {
      "providers": [
        {
          "name": "ALSA",
          "website": "https://www.alsa.com",
          "direct": true
        }
      ]
    }
  }
}
```

## 🎯 Características del Sistema

### ✅ Datos Reales
- Links directos a sitios web de proveedores
- Información de aeropuertos, estaciones, puertos
- Badges "Direct" para rutas sin escalas

### ✅ Escalabilidad
- Fácil agregar 50-100+ rutas
- Sistema modular y organizado
- Generación automática de archivos

### ✅ Integración Web
- URLs SEO-friendly: `/route/origin/destination`
- Tarjetas dinámicas con proveedores
- Links de reserva integrados

### ✅ Herramientas de Gestión
- Script interactivo para agregar rutas
- Listado de rutas existentes
- Generación automática de archivos

## 🔧 Comandos Útiles

```bash
# Ver todas las rutas
python3 add_route.py

# Agregar nueva ruta
python3 add_route.py

# Generar archivos de rutas
python3 generate_popular_routes.py

# Iniciar servidor
python3 server.py
```

## 📊 Estructura JSON de Ruta

```json
{
  "route": {
    "origin": "london",
    "destination": "paris",
    "distance": "344 km",
    "available_modes": ["flight", "train", "bus", "car"]
  },
  "travel_modes": [
    {
      "icon": "✈️",
      "name": "Flight",
      "description": "Fastest option for long distances",
      "estimated_time": "2-8 hours",
      "estimated_cost": "$200-800",
      "frequency": "Daily",
      "providers": [
        {
          "name": "British Airways",
          "website": "https://www.britishairways.com",
          "direct": true
        }
      ],
      "airports": {
        "origin": "London Heathrow (LHR)",
        "destination": "Paris Charles de Gaulle (CDG)"
      },
      "booking_links": {
        "skyscanner": "https://www.skyscanner.com",
        "kayak": "https://www.kayak.com"
      }
    }
  ],
  "quick_tips": [
    "Book flights 2-3 months in advance for best prices",
    "Eurostar train is fastest and most convenient"
  ]
}
```

## 🎉 Próximas Mejoras

- [ ] Integración con APIs reales (Google Maps, Amadeus)
- [ ] Precios en tiempo real
- [ ] Comparador de precios
- [ ] Alertas de precios
- [ ] Mapa interactivo de rutas
- [ ] Filtros por región/tipo de transporte
- [ ] Sistema de reseñas de proveedores

---

**¿Necesitas ayuda?** Revisa los archivos de ejemplo o ejecuta `python3 add_route.py` para la herramienta interactiva. 