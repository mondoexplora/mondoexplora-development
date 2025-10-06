// Geographic SEO utilities for location-based optimization

export interface GeoLocation {
  name: string;
  country: string;
  region: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timezone?: string;
  currency?: string;
  language?: string;
}

export interface GeoContent {
  localKeywords: string[];
  regionalDescription: string;
  localAttractions: string[];
  climate: string;
  bestTimeToVisit: string;
  localCurrency: string;
  localLanguage: string;
}

// Geographic data for major destinations
export const GEO_DATA: Record<string, GeoLocation> = {
  'bangkok': {
    name: 'Bangkok',
    country: 'Thailand',
    region: 'South East Asia',
    coordinates: { latitude: 13.7563, longitude: 100.5018 },
    timezone: 'Asia/Bangkok',
    currency: 'THB',
    language: 'Thai'
  },
  'phuket': {
    name: 'Phuket',
    country: 'Thailand',
    region: 'South East Asia',
    coordinates: { latitude: 7.8804, longitude: 98.3923 },
    timezone: 'Asia/Bangkok',
    currency: 'THB',
    language: 'Thai'
  },
  'koh-samui': {
    name: 'Koh Samui',
    country: 'Thailand',
    region: 'South East Asia',
    coordinates: { latitude: 9.5018, longitude: 100.0000 },
    timezone: 'Asia/Bangkok',
    currency: 'THB',
    language: 'Thai'
  },
  'sydney': {
    name: 'Sydney',
    country: 'Australia',
    region: 'Australia & New Zealand',
    coordinates: { latitude: -33.8688, longitude: 151.2093 },
    timezone: 'Australia/Sydney',
    currency: 'AUD',
    language: 'English'
  },
  'melbourne': {
    name: 'Melbourne',
    country: 'Australia',
    region: 'Australia & New Zealand',
    coordinates: { latitude: -37.8136, longitude: 144.9631 },
    timezone: 'Australia/Melbourne',
    currency: 'AUD',
    language: 'English'
  },
  'paris': {
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    coordinates: { latitude: 48.8566, longitude: 2.3522 },
    timezone: 'Europe/Paris',
    currency: 'EUR',
    language: 'French'
  },
  'rome': {
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    coordinates: { latitude: 41.9028, longitude: 12.4964 },
    timezone: 'Europe/Rome',
    currency: 'EUR',
    language: 'Italian'
  },
  'barcelona': {
    name: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    coordinates: { latitude: 41.3851, longitude: 2.1734 },
    timezone: 'Europe/Madrid',
    currency: 'EUR',
    language: 'Spanish'
  },
  'tokyo': {
    name: 'Tokyo',
    country: 'Japan',
    region: 'Japan & South Korea',
    coordinates: { latitude: 35.6762, longitude: 139.6503 },
    timezone: 'Asia/Tokyo',
    currency: 'JPY',
    language: 'Japanese'
  },
  'seoul': {
    name: 'Seoul',
    country: 'South Korea',
    region: 'Japan & South Korea',
    coordinates: { latitude: 37.5665, longitude: 126.9780 },
    timezone: 'Asia/Seoul',
    currency: 'KRW',
    language: 'Korean'
  }
};

// Generate location-specific content for SEO
export function generateGeoContent(destination: string): GeoContent {
  const geo = GEO_DATA[destination.toLowerCase()];
  
  if (!geo) {
    // Fallback content for unknown destinations
    return {
      localKeywords: [`${destination} hotels`, `luxury hotels ${destination}`, `hotels in ${destination}`],
      regionalDescription: `Discover luxury hotels in ${destination} with exclusive deals and world-class amenities.`,
      localAttractions: ['Local attractions', 'Cultural sites', 'Shopping districts'],
      climate: 'Temperate climate',
      bestTimeToVisit: 'Year-round destination',
      localCurrency: 'USD',
      localLanguage: 'English'
    };
  }

  const regionalDescriptions: Record<string, string> = {
    'South East Asia': `Experience the vibrant culture and tropical paradise of ${geo.name}, ${geo.country}. From ancient temples to pristine beaches, discover luxury accommodations in the heart of Southeast Asia.`,
    'Europe': `Immerse yourself in the rich history and cultural heritage of ${geo.name}, ${geo.country}. Explore world-class museums, architectural marvels, and luxury hotels in this European gem.`,
    'Australia & New Zealand': `Discover the natural beauty and cosmopolitan lifestyle of ${geo.name}, ${geo.country}. From stunning coastlines to urban sophistication, find luxury accommodations in the Pacific region.`,
    'Japan & South Korea': `Experience the perfect blend of tradition and modernity in ${geo.name}, ${geo.country}. From ancient temples to futuristic cityscapes, enjoy luxury hospitality in East Asia.`,
    'US, Canada & Mexico': `Explore the diverse landscapes and vibrant cities of ${geo.name}, ${geo.country}. From natural wonders to cultural attractions, find luxury accommodations in North America.`,
    'Latin America': `Discover the rich cultural heritage and natural beauty of ${geo.name}, ${geo.country}. From colonial architecture to pristine beaches, experience luxury hospitality in Latin America.`
  };

  const localAttractions: Record<string, string[]> = {
    'bangkok': ['Grand Palace', 'Wat Pho Temple', 'Chatuchak Weekend Market', 'Chao Phraya River'],
    'phuket': ['Patong Beach', 'Big Buddha', 'Old Phuket Town', 'Phi Phi Islands'],
    'sydney': ['Sydney Opera House', 'Harbour Bridge', 'Bondi Beach', 'Royal Botanic Gardens'],
    'melbourne': ['Federation Square', 'Royal Botanic Gardens', 'Great Ocean Road', 'Queen Victoria Market'],
    'paris': ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Champs-Élysées'],
    'rome': ['Colosseum', 'Vatican City', 'Trevi Fountain', 'Roman Forum'],
    'barcelona': ['Sagrada Familia', 'Park Güell', 'Gothic Quarter', 'La Rambla'],
    'tokyo': ['Senso-ji Temple', 'Tokyo Skytree', 'Shibuya Crossing', 'Meiji Shrine'],
    'seoul': ['Gyeongbokgung Palace', 'Myeongdong', 'N Seoul Tower', 'Bukchon Hanok Village']
  };

  const climateInfo: Record<string, string> = {
    'South East Asia': 'Tropical climate with warm temperatures year-round. Best visited during dry season (November to April).',
    'Europe': 'Temperate climate with four distinct seasons. Spring and fall offer the most comfortable weather.',
    'Australia & New Zealand': 'Varied climate from tropical north to temperate south. Best weather typically in spring and autumn.',
    'Japan & South Korea': 'Temperate climate with four seasons. Cherry blossom season (spring) and autumn foliage are particularly beautiful.',
    'US, Canada & Mexico': 'Diverse climate zones. Best time varies by region, generally spring and fall offer pleasant weather.',
    'Latin America': 'Tropical and subtropical climate. Dry season typically offers the best weather for travel.'
  };

  return {
    localKeywords: [
      `${geo.name} luxury hotels`,
      `hotels in ${geo.name} ${geo.country}`,
      `${geo.name} accommodation`,
      `${geo.region} luxury hotels`,
      `${geo.country} travel`,
      `${geo.name} city center hotels`,
      `${geo.name} airport hotels`,
      `${geo.name} beachfront hotels`
    ],
    regionalDescription: regionalDescriptions[geo.region] || `Discover luxury hotels in ${geo.name}, ${geo.country} with exclusive deals and world-class amenities.`,
    localAttractions: localAttractions[destination.toLowerCase()] || ['Local attractions', 'Cultural sites', 'Shopping districts'],
    climate: climateInfo[geo.region] || 'Temperate climate with comfortable weather year-round.',
    bestTimeToVisit: geo.region === 'South East Asia' ? 'November to April (dry season)' : 
                    geo.region === 'Europe' ? 'May to September (summer season)' :
                    geo.region === 'Australia & New Zealand' ? 'October to April (summer season)' :
                    'Year-round destination',
    localCurrency: geo.currency || 'USD',
    localLanguage: geo.language || 'English'
  };
}

// Generate geo-targeted meta tags
export function generateGeoMetaTags(destination: string, lang: string = 'en') {
  const geo = GEO_DATA[destination.toLowerCase()];
  if (!geo) return {};

  return {
    'geo.region': geo.country,
    'geo.placename': geo.name,
    'geo.position': geo.coordinates ? `${geo.coordinates.latitude};${geo.coordinates.longitude}` : '',
    'ICBM': geo.coordinates ? `${geo.coordinates.latitude}, ${geo.coordinates.longitude}` : '',
    'geo.timezone': geo.timezone || '',
    'DC.coverage': geo.country,
    'DC.coverage.placename': geo.name
  };
}

// Generate location breadcrumbs for structured data
export function generateLocationBreadcrumbs(destination: string) {
  const geo = GEO_DATA[destination.toLowerCase()];
  if (!geo) return [];

  return [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://mondoexplora.com/en"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": geo.region,
      "item": `https://mondoexplora.com/en?region=${geo.region.toLowerCase().replace(/\s+/g, '-')}`
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": geo.country,
      "item": `https://mondoexplora.com/en/country/${geo.country.toLowerCase().replace(/\s+/g, '-')}`
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": geo.name,
      "item": `https://mondoexplora.com/en/destination/${destination}`
    }
  ];
}
