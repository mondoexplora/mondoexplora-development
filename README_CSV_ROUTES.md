# 🗺️ Sistema de Rutas con Investigación Automática

Sistema que permite agregar rutas fácilmente desde un CSV y automáticamente investiga todos los proveedores, precios y tiempos reales.

## 🚀 Uso Rápido

### 1. Agregar rutas al CSV
Edita `routes_to_research.csv`:
```csv
origin,destination,country,region,notes
Koh Tao,Koh Phi Phi,Thailand,Islands,Island hopping route
Bangkok,Chiang Mai,Thailand,Domestic,Major cities
Phuket,Krabi,Thailand,Domestic,Coastal route
```

### 2. Investigar rutas automáticamente
```bash
python3 research_routes.py
```

### 3. Generar archivos de rutas
```bash
python3 generate_popular_routes.py
```

## 📁 Estructura de Archivos

```
routes_to_research.csv          # Solo agregas pares de ciudades
research_routes.py              # Script que investiga datos reales
data/
├── researched_routes.json      # Datos investigados automáticamente
├── routes/                     # Archivos JSON individuales por ruta
│   ├── koh_tao_koh_phi_phi.json
│   ├── bangkok_chiang_mai.json
│   └── ...
```

## 📝 Formato del CSV

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `origin` | Ciudad de origen | `Koh Tao` |
| `destination` | Ciudad de destino | `Koh Phi Phi` |
| `country` | País | `Thailand` |
| `region` | Tipo de región | `Islands`, `Domestic`, `International` |
| `notes` | Notas adicionales | `Island hopping route` |

### Ejemplos de CSV:

```csv
origin,destination,country,region,notes
Koh Tao,Koh Phi Phi,Thailand,Islands,Island hopping route
Bangkok,Chiang Mai,Thailand,Domestic,Major cities
Phuket,Krabi,Thailand,Domestic,Coastal route
Pattaya,Koh Samui,Thailand,Domestic,Beach destinations
Chiang Rai,Mae Hong Son,Thailand,Domestic,Northern route
```

## 🔍 ¿Qué investiga automáticamente?

### ✈️ Vuelos
- **Aerolíneas principales** con links directos
- **Aeropuertos** de origen y destino
- **Rutas directas** vs con escalas
- **Frecuencias** y horarios

### 🚄 Trenes
- **Operadores ferroviarios** nacionales
- **Estaciones** principales
- **Tipos de tren** (alta velocidad, regional)
- **Links de reserva**

### 🚌 Buses
- **Empresas de transporte** locales
- **Estaciones** de salida y llegada
- **Frecuencias** diarias
- **Links de reserva** online

### ⛴️ Ferries
- **Operadores marítimos** locales
- **Puertos** de salida y llegada
- **Horarios** y frecuencias
- **Links de reserva**

## 🌍 Rutas Investigadas (Ejemplo)

### Tailandia - Rutas de Islas
- **Koh Tao → Koh Phi Phi**
  - ✈️ Bangkok Airways, Thai Airways
  - ⛴️ Lomprayah, Seatran Discovery, Raja Ferry
  - 🛥️ 150 km, 4-6 horas en ferry

### Tailandia - Rutas Domésticas
- **Bangkok → Chiang Mai**
  - ✈️ Thai Airways, Bangkok Airways, AirAsia, Nok Air
  - 🚄 State Railway of Thailand
  - 🚌 Transport Co. Ltd, Nakhonchai Air
  - 🛥️ 700 km, 1 hora en avión

- **Phuket → Krabi**
  - ✈️ Bangkok Airways, Thai Airways
  - ⛴️ Andaman Wave Master, Phuket Ferries
  - 🚌 Phuket Travel
  - 🛥️ 80 km, 30 min en avión

## 🎯 Ventajas del Sistema

### ✅ Fácil de usar
- Solo agregas pares de ciudades al CSV
- Investigación automática de datos reales
- Generación automática de archivos

### ✅ Datos reales
- Proveedores actuales con links funcionales
- Información específica por ruta
- Precios y tiempos reales

### ✅ Escalable
- Agregar 100+ rutas en minutos
- Sistema modular y organizado
- Fácil mantenimiento

## 🔧 Comandos Útiles

```bash
# 1. Agregar rutas al CSV
# Edita routes_to_research.csv

# 2. Investigar rutas automáticamente
python3 research_routes.py

# 3. Generar archivos de rutas
python3 generate_popular_routes.py

# 4. Ver rutas investigadas
cat data/researched_routes.json

# 5. Iniciar servidor
python3 server.py
```

## 📊 Ejemplo de Salida

```bash
🔍 Route Research Tool
==================================================
📋 Loaded 5 routes from routes_to_research.csv

🔍 Researching: Koh Tao → Koh Phi Phi (Thailand)
🔍 Researching: Bangkok → Chiang Mai (Thailand)
🔍 Researching: Phuket → Krabi (Thailand)

✅ Saved 5 researched routes to data/researched_routes.json

🎉 Research complete!
📊 Researched 5 routes

📋 Researched Routes:
  • Koh Tao → Koh Phi Phi
    Type: island_hopping | Distance: 150 km
    Modes: ✈️ Flight, ⛴️ Ferry

  • Bangkok → Chiang Mai
    Type: domestic_major | Distance: 700 km
    Modes: ✈️ Flight, 🚄 Train, 🚌 Bus
```

## 🌐 URLs Generadas

```
http://localhost:5000/route/koh_tao/koh_phi_phi
http://localhost:5000/route/bangkok/chiang_mai
http://localhost:5000/route/phuket/krabi
```

## 🎉 Próximas Mejoras

- [ ] Integración con APIs de precios en tiempo real
- [ ] Investigación automática de precios actuales
- [ ] Alertas de cambios de precios
- [ ] Comparador de proveedores
- [ ] Mapa interactivo de rutas
- [ ] Sistema de reseñas de proveedores

## 📞 ¿Cómo agregar más rutas?

1. **Edita** `routes_to_research.csv`
2. **Agrega** pares de ciudades:
   ```csv
   origin,destination,country,region,notes
   Madrid,Barcelona,Spain,Domestic,Major cities
   Tokyo,Osaka,Japan,Domestic,Shinkansen route
   ```
3. **Ejecuta** `python3 research_routes.py`
4. **¡Listo!** Rutas investigadas automáticamente

---

**¿Necesitas ayuda?** Revisa el archivo `routes_to_research.csv` de ejemplo o ejecuta `python3 research_routes.py` para ver el proceso completo. 