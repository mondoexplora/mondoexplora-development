const fs = require('fs').promises;
const path = require('path');
const { sanitizeText } = require('./validation');

/**
 * Generates JSON files for each language and destination
 */
async function generateLanguageFiles(destinations, languages, dataDir) {
  console.log('📁 Generating JSON files for each language...');
  
  for (const lang of languages) {
    const langDir = path.join(dataDir, lang, 'destination');
    await fs.mkdir(langDir, { recursive: true });
    
    for (const [key, destination] of Object.entries(destinations)) {
      const fileName = `${destination.city.toLowerCase().replace(/\s+/g, '-')}.json`;
      const filePath = path.join(langDir, fileName);
      
      const jsonData = generateDestinationJSON(destination, lang);
      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
    }
  }
  
  // Generate country files
  console.log('🔄 Starting country file generation...');
  await generateCountryFiles(destinations, languages, dataDir);
  console.log('✅ Country file generation completed');
  
  // Generate route files
  console.log('🔄 Starting route file generation...');
  await generateRouteFiles(destinations, languages, dataDir);
  console.log('✅ Route file generation completed');
}

/**
 * Generates destination JSON for a specific language
 */
function generateDestinationJSON(destination, lang) {
  const citySlug = destination.city.toLowerCase().replace(/\s+/g, '-');
  
  return {
    city: destination.city,
    country: destination.country,
    country_code: destination.country_code,
    hero_title: getLocalizedTitle(destination.city, lang),
    description: getLocalizedDescription(destination.city, destination.country, lang),
    hero_image: destination.hotels[0]?.hero_image || 'https://images.unsplash.com/photo-1508009603885-50cf7c079365?w=1200&h=600&fit=crop',
         hotels: destination.hotels.map(hotel => ({
       vendor_name: hotel.vendor_name,
       offer_country_name: hotel.country,
       location_heading: hotel.city,
       title: sanitizeText(hotel.title),
       description: sanitizeText(hotel.description),
       location_subheading: hotel.country,
       price: hotel.price,
       original_price: hotel.original_price,
       discount_percentage: hotel.discount_percentage,
       link: hotel.link,
       hero_image: hotel.hero_image,
       image_two: hotel.image_two,
       image_three: hotel.image_three,
       deal_tier: hotel.deal_tier,
       min_duration: hotel.min_duration,
       end_date_utc: hotel.end_date
     })),
    seo: {
      title: `${getLocalizedTitle(destination.city, lang)} - ${getLocalizedCountry(destination.country, lang)} Hotels & Travel Guide 2024`,
      description: getLocalizedSEODescription(destination.city, destination.country, lang),
      keywords: generateKeywords(destination.city, destination.country, lang),
      canonical: `https://mondoexplora.com/${lang}/destination/${citySlug}`,
      hreflang: generateHreflang(citySlug, lang)
    },
    meta: {
      last_updated: new Date().toISOString().split('T')[0],
      hotel_count: destination.hotels.length,
      average_price: Math.round(destination.hotels.reduce((sum, h) => sum + h.price, 0) / destination.hotels.length),
      average_discount: Math.round(destination.hotels.reduce((sum, h) => sum + h.discount_percentage, 0) / destination.hotels.length)
    }
  };
}

/**
 * Generates country JSON files
 */
async function generateCountryFiles(destinations, languages, dataDir) {
  console.log('🌍 Generating country files...');
  console.log(`📊 Found ${Object.keys(destinations).length} destinations to process`);
  
  // Group destinations by country
  const countries = {};
  for (const destination of Object.values(destinations)) {
    const countryKey = destination.country_code;
    if (!countries[countryKey]) {
      countries[countryKey] = {
        name: destination.country,
        code: destination.country_code,
        destinations: []
      };
    }
    countries[countryKey].destinations.push({
      name: destination.city,
      slug: destination.city.toLowerCase().replace(/\s+/g, '-'),
      image: destination.hotels[0]?.hero_image || 'https://images.unsplash.com/photo-1508009603885-50cf7c079365?w=300&h=200&fit=crop',
      description: getLocalizedDestinationDescription(destination.city, 'en'),
      hotel_count: destination.hotels.length,
      hotel_deals: destination.hotels.length, // Same as hotel_count for now, but can be filtered differently later
      avg_price: Math.round(destination.hotels.reduce((sum, h) => sum + h.price, 0) / destination.hotels.length)
    });
  }
  
  // Sort destinations by hotel count (descending) for each country
  for (const country of Object.values(countries)) {
    country.destinations.sort((a, b) => b.hotel_count - a.hotel_count);
  }
  
  console.log(`🌍 Generated ${Object.keys(countries).length} countries:`, Object.keys(countries));
  
  for (const lang of languages) {
    const langDir = path.join(dataDir, lang, 'country');
    await fs.mkdir(langDir, { recursive: true });
    
             for (const [countryCode, country] of Object.entries(countries)) {
      const fileName = `${country.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      const filePath = path.join(langDir, fileName);
      
      console.log(`📝 Writing ${fileName} with ${country.destinations.length} destinations`);
      
      const jsonData = generateCountryJSON(country, lang);
      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
    }
  }
}

/**
 * Generates country JSON for a specific language
 */
function generateCountryJSON(country, lang) {
  const countrySlug = country.name.toLowerCase().replace(/\s+/g, '-');
  
  return {
    name: getLocalizedCountry(country.name, lang),
    code: country.code,
    hero_title: `${getLocalizedCountry(country.name, lang)} Travel Guide`,
    description: getLocalizedCountryDescription(country.name, lang),
    hero_image: country.destinations[0]?.image || 'https://images.unsplash.com/photo-1508009603885-50cf7c079365?w=1200&h=600&fit=crop',
    popular_destinations: country.destinations.slice(0, 6).map(dest => ({
      name: dest.name,
      slug: dest.slug,
      image: dest.image,
      description: dest.description,
      hotel_count: dest.hotel_count,
      hotel_deals: dest.hotel_deals,
      avg_price: dest.avg_price
    })),
    seo: {
      title: `${getLocalizedCountry(country.name, lang)} Hotels & Travel Guide 2024`,
      description: getLocalizedCountrySEODescription(country.name, lang),
      keywords: generateCountryKeywords(country.name, lang),
      canonical: `https://mondoexplora.com/${lang}/country/${countrySlug}`,
      hreflang: generateCountryHreflang(countrySlug, lang)
    }
  };
}

// Localization helpers
function getLocalizedTitle(city, lang) {
  const titles = {
    en: `Hotels in ${city}`,
    es: `Hoteles en ${city}`,
    fr: `Hôtels à ${city}`,
    it: `Hotel a ${city}`
  };
  return titles[lang] || titles.en;
}

function getLocalizedCountry(country, lang) {
  const countries = {
    'Thailand': { es: 'Tailandia', fr: 'Thaïlande', it: 'Thailandia' },
    'Australia': { es: 'Australia', fr: 'Australie', it: 'Australia' },
    'United States': { es: 'Estados Unidos', fr: 'États-Unis', it: 'Stati Uniti' }
  };
  
  if (countries[country] && countries[country][lang]) {
    return countries[country][lang];
  }
  return country;
}

function getLocalizedDescription(city, country, lang) {
  const descriptions = {
    en: `Discover the best hotels in ${city}, ${country}. Find exclusive deals and luxury accommodations.`,
    es: `Descubre los mejores hoteles en ${city}, ${country}. Encuentra ofertas exclusivas y alojamientos de lujo.`,
    fr: `Découvrez les meilleurs hôtels à ${city}, ${country}. Trouvez des offres exclusives et des hébergements de luxe.`,
    it: `Scopri i migliori hotel a ${city}, ${country}. Trova offerte esclusive e alloggi di lusso.`
  };
  return descriptions[lang] || descriptions.en;
}



function generateKeywords(city, country, lang) {
  const baseKeywords = [`${city.toLowerCase()} hotels`, `${city.toLowerCase()} travel`, `${country.toLowerCase()} hotels`];
  return baseKeywords;
}

function generateHreflang(citySlug, lang) {
  const languages = ['en', 'es', 'fr', 'it'];
  const hreflang = {};
  
  languages.forEach(l => {
    hreflang[l] = `https://mondoexplora.com/${l}/destination/${citySlug}`;
  });
  
  return hreflang;
}

// Additional helper functions for country files
function getLocalizedDestinationDescription(city, lang) {
  const descriptions = {
    en: `Explore ${city} with luxury accommodations`,
    es: `Explora ${city} con alojamientos de lujo`,
    fr: `Explorez ${city} avec des hébergements de luxe`,
    it: `Esplora ${city} con alloggi di lusso`
  };
  return descriptions[lang] || descriptions.en;
}

function getLocalizedCountryDescription(country, lang) {
  const descriptions = {
    en: `Discover the perfect blend of culture, luxury, and adventure in ${country}.`,
    es: `Descubre la mezcla perfecta de cultura, lujo y aventura en ${country}.`,
    fr: `Découvrez le mélange parfait de culture, luxe et aventure en ${country}.`,
    it: `Scopri la perfetta fusione di cultura, lusso e avventura in ${country}.`
  };
  return descriptions[lang] || descriptions.en;
}

function getLocalizedSEODescription(city, country, lang) {
  const descriptions = {
    en: `Find the best hotels in ${city}, ${country} with exclusive deals. Book your perfect getaway with up to 60% off.`,
    es: `Encuentra los mejores hoteles en ${city}, ${country} con ofertas exclusivas. Reserva tu escapada perfecta con hasta 60% de descuento.`,
    fr: `Trouvez les meilleurs hôtels à ${city}, ${country} avec des offres exclusives. Réservez votre escapade parfaite avec jusqu'à 60% de réduction.`,
    it: `Trova i migliori hotel a ${city}, ${country} con offerte esclusive. Prenota la tua fuga perfetta con fino al 60% di sconto.`
  };
  return descriptions[lang] || descriptions.en;
}

function getLocalizedCountrySEODescription(country, lang) {
  const descriptions = {
    en: `Find the best hotels in ${country} with exclusive deals. Explore luxury accommodations and travel guides.`,
    es: `Encuentra los mejores hoteles en ${country} con ofertas exclusivas. Explora alojamientos de lujo y guías de viaje.`,
    fr: `Trouvez les meilleurs hôtels en ${country} avec des offres exclusives. Explorez des hébergements de luxe et des guides de voyage.`,
    it: `Trova i migliori hotel in ${country} con offerte esclusive. Esplora alloggi di lusso e guide di viaggio.`
  };
  return descriptions[lang] || descriptions.en;
}

function generateCountryKeywords(country, lang) {
  const baseKeywords = [`${country.toLowerCase()} hotels`, `${country.toLowerCase()} travel`, `${country.toLowerCase()} luxury`];
  return baseKeywords;
}

function generateCountryHreflang(countrySlug, lang) {
  const languages = ['en', 'es', 'fr', 'it'];
  const hreflang = {};
  
  languages.forEach(l => {
    hreflang[l] = `https://mondoexplora.com/${l}/country/${countrySlug}`;
  });
  
  return hreflang;
}

/**
 * Generates route JSON files
 */
async function generateRouteFiles(destinations, languages, dataDir) {
  console.log('🛣️ Generating route files...');
  
  // Create popular routes based on destinations
  const popularRoutes = [
    { origin: 'madrid', destination: 'barcelona', originCountry: 'Spain', destCountry: 'Spain' },
    { origin: 'london', destination: 'paris', originCountry: 'United Kingdom', destCountry: 'France' },
    { origin: 'new-york', destination: 'los-angeles', originCountry: 'United States', destCountry: 'United States' },
    { origin: 'sydney', destination: 'melbourne', originCountry: 'Australia', destCountry: 'Australia' },
    { origin: 'bangkok', destination: 'chiang-mai', originCountry: 'Thailand', destCountry: 'Thailand' },
    { origin: 'tokyo', destination: 'osaka', originCountry: 'Japan', destCountry: 'Japan' },
    { origin: 'rome', destination: 'milan', originCountry: 'Italy', destCountry: 'Italy' },
    { origin: 'berlin', destination: 'munich', originCountry: 'Germany', destCountry: 'Germany' }
  ];
  
  for (const lang of languages) {
    for (const route of popularRoutes) {
      const originDir = path.join(dataDir, lang, 'route', route.origin);
      await fs.mkdir(originDir, { recursive: true });
      
      const fileName = `${route.destination}.json`;
      const filePath = path.join(originDir, fileName);
      
      console.log(`📝 Writing route: ${route.origin} → ${route.destination}`);
      
      const jsonData = generateRouteJSON(route, lang);
      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
    }
  }
}

/**
 * Generates route JSON for a specific language
 */
function generateRouteJSON(route, lang) {
  return {
    origin: route.origin.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    destination: route.destination.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    origin_country: route.originCountry,
    destination_country: route.destCountry,
    transport_modes: {
      flight: {
        duration: generateFlightDuration(route.origin, route.destination),
        price_range: generateFlightPrice(route.origin, route.destination),
        providers: ['Skyscanner', 'Kayak', 'Expedia']
      },
      train: {
        duration: generateTrainDuration(route.origin, route.destination),
        price_range: generateTrainPrice(route.origin, route.destination),
        providers: ['Rail Europe', 'Eurail', 'Trainline']
      },
      bus: {
        duration: generateBusDuration(route.origin, route.destination),
        price_range: generateBusPrice(route.origin, route.destination),
        providers: ['FlixBus', 'Greyhound', 'Megabus']
      },
      car: {
        duration: generateCarDuration(route.origin, route.destination),
        distance: generateCarDistance(route.origin, route.destination),
        price_range: generateCarPrice(route.origin, route.destination)
      }
    },
    seo: {
      title: `${route.origin.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} to ${route.destination.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - Transport Guide 2024`,
      description: `Compare transport options from ${route.origin.replace(/-/g, ' ')} to ${route.destination.replace(/-/g, ' ')}. Find the best deals on flights, trains, buses and car rentals.`,
      keywords: [`${route.origin} to ${route.destination}`, 'transport', 'travel', 'flights', 'trains']
    }
  };
}

// Helper functions for generating transport data
function generateFlightDuration(origin, destination) {
  const durations = ['1h 30m', '2h 15m', '3h 45m', '1h 55m', '4h 20m', '2h 30m'];
  return durations[Math.floor(Math.random() * durations.length)];
}

function generateFlightPrice(origin, destination) {
  const prices = ['$89 - $250', '$120 - $350', '$75 - $180', '$150 - $400', '$95 - $220'];
  return prices[Math.floor(Math.random() * prices.length)];
}

function generateTrainDuration(origin, destination) {
  const durations = ['2h 30m', '3h 15m', '4h 45m', '2h 55m', '5h 20m', '3h 30m'];
  return durations[Math.floor(Math.random() * durations.length)];
}

function generateTrainPrice(origin, destination) {
  const prices = ['$45 - $120', '$60 - $150', '$35 - $90', '$80 - $200', '$55 - $130'];
  return prices[Math.floor(Math.random() * prices.length)];
}

function generateBusDuration(origin, destination) {
  const durations = ['4h 30m', '5h 15m', '6h 45m', '4h 55m', '7h 20m', '5h 30m'];
  return durations[Math.floor(Math.random() * durations.length)];
}

function generateBusPrice(origin, destination) {
  const prices = ['$25 - $60', '$30 - $75', '$20 - $50', '$40 - $100', '$35 - $80'];
  return prices[Math.floor(Math.random() * prices.length)];
}

function generateCarDuration(origin, destination) {
  const durations = ['3h 30m', '4h 15m', '5h 45m', '3h 55m', '6h 20m', '4h 30m'];
  return durations[Math.floor(Math.random() * durations.length)];
}

function generateCarDistance(origin, destination) {
  const distances = ['280 km', '350 km', '420 km', '310 km', '480 km', '380 km'];
  return distances[Math.floor(Math.random() * distances.length)];
}

function generateCarPrice(origin, destination) {
  const prices = ['$35 - $85', '$45 - $110', '$30 - $70', '$60 - $140', '$40 - $95'];
  return prices[Math.floor(Math.random() * prices.length)];
}

module.exports = {
  generateLanguageFiles,
  generateCountryFiles,
  generateRouteFiles
}; 