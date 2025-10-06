import { DestinationData, RouteData, CountryData, DealData, SupportedLanguage } from '@/types';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function getDestinationData(lang: string, city: string): Promise<DestinationData | null> {
  try {
    const filePath = path.join(DATA_DIR, lang, 'destination', `${city}.json`);
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading destination data for ${city}:`, error);
    return null;
  }
}

export async function getDestinationUrlData(destination: string): Promise<Record<string, unknown> | null> {
  try {
    const destinationKey = destination.toLowerCase().replace(/\s+/g, '-');
    const filePath = path.join(DATA_DIR, 'le_destination_urls', `${destinationKey}.json`);
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading destination URL data for ${destination}:`, error);
    return null;
  }
}

export async function getRouteData(lang: SupportedLanguage, origin: string, destination: string): Promise<RouteData | null> {
  try {
    const filePath = path.join(DATA_DIR, lang, 'route', `${origin}`, `${destination}.json`);
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading route data for ${origin}-${destination}:`, error);
    return null;
  }
}

export async function getCountryData(lang: SupportedLanguage, country: string): Promise<CountryData | null> {
  try {
    // Handle problematic file names
    let fileName = country;
    
    // Handle special cases
    if (country === 'tanzania,-united-republic-of') {
      fileName = 'tanzania,-united-republic-of';
    } else if (country === 'taiwan-(province-of-china)') {
      fileName = 'taiwan-(province-of-china)';
    }
    
    const filePath = path.join(DATA_DIR, lang, 'country', `${fileName}.json`);
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading country data for ${country}:`, error);
    return null;
  }
}

export async function getDealData(lang: SupportedLanguage, city: string): Promise<DealData | null> {
  try {
    const filePath = path.join(DATA_DIR, lang, 'deals', `${city}.json`);
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading deal data for ${city}:`, error);
    return null;
  }
}

export async function getAllDestinations(lang: SupportedLanguage): Promise<string[]> {
  try {
    const destDir = path.join(DATA_DIR, lang, 'destination');
    const files = await fs.promises.readdir(destDir);
    return files.map(file => file.replace('.json', ''));
  } catch (error) {
    console.error(`Error loading destinations for ${lang}:`, error);
    return [];
  }
}

export async function getAllRoutes(lang: SupportedLanguage): Promise<Array<{origin: string, destination: string}>> {
  try {
    const routes: Array<{origin: string, destination: string}> = [];
    const routeDir = path.join(DATA_DIR, lang, 'route');
    
    if (!fs.existsSync(routeDir)) return routes;
    
    const origins = await fs.promises.readdir(routeDir);
    
    for (const origin of origins) {
      const originPath = path.join(routeDir, origin);
      const stat = await fs.promises.stat(originPath);
      
      if (stat.isDirectory()) {
        const destinations = await fs.promises.readdir(originPath);
        for (const dest of destinations) {
          if (dest.endsWith('.json')) {
            routes.push({
              origin,
              destination: dest.replace('.json', '')
            });
          }
        }
      }
    }
    
    return routes;
  } catch (error) {
    console.error(`Error loading routes for ${lang}:`, error);
    return [];
  }
}

export async function getAllCountries(lang: SupportedLanguage): Promise<string[]> {
  try {
    const countryDir = path.join(DATA_DIR, lang, 'country');
    const files = await fs.promises.readdir(countryDir);
    return files.map(file => file.replace('.json', ''));
  } catch (error) {
    console.error(`Error loading countries for ${lang}:`, error);
    return [];
  }
}

// New functions for home page
export async function getPopularDestinations(lang: SupportedLanguage, limit: number = 6): Promise<Record<string, unknown>[]> {
  try {
    const destinations = await getAllDestinations(lang);
    const popularDestinations = [];
    
    // Get first few destinations with their data
    for (let i = 0; i < Math.min(limit, destinations.length); i++) {
      const destinationData = await getDestinationData(lang, destinations[i]);
      if (destinationData) {
        popularDestinations.push({
          slug: destinations[i],
          name: destinationData.city || destinations[i],
          country: destinationData.country || '',
          image: destinationData.hero_image,
          avg_price: destinationData.hotels?.[0]?.price || 0,
          hotel_deals: destinationData.hotels?.length || 0
        });
      }
    }
    
    return popularDestinations;
  } catch (error) {
    console.error(`Error loading popular destinations for ${lang}:`, error);
    return [];
  }
}

export async function getPopularRoutes(lang: SupportedLanguage, limit: number = 6): Promise<Record<string, unknown>[]> {
  try {
    const routes = await getAllRoutes(lang);
    return routes.slice(0, limit).map(route => ({
      origin: route.origin.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      destination: route.destination.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));
  } catch (error) {
    console.error(`Error loading popular routes for ${lang}:`, error);
    return [];
  }
}

export async function getPopularCountries(lang: SupportedLanguage, limit: number = 6): Promise<Record<string, unknown>[]> {
  try {
    const countries = await getAllCountries(lang);
    const popularCountries = [];
    
    // Get first few countries with their data
    for (let i = 0; i < Math.min(limit, countries.length); i++) {
      const countryData = await getCountryData(lang, countries[i]);
      if (countryData) {
        popularCountries.push({
          slug: countries[i],
          name: countryData.name || countries[i],
          hero_image: countryData.hero_image,
          description: countryData.description || '',
          popular_destinations: countryData.popular_destinations || []
        });
      }
    }
    
    return popularCountries;
  } catch (error) {
    console.error(`Error loading popular countries for ${lang}:`, error);
    return [];
  }
}

export async function getFeaturedDeals(lang: SupportedLanguage, limit: number = 6): Promise<Record<string, unknown>[]> {
  try {
    const destinations = await getAllDestinations(lang);
    const featuredDeals = [];
    
    // Get deals from first few destinations
    for (let i = 0; i < Math.min(limit, destinations.length); i++) {
      const destinationData = await getDestinationData(lang, destinations[i]);
      if (destinationData?.hotels && destinationData.hotels.length > 0) {
        // Get the first hotel as a featured deal
        const hotel = destinationData.hotels[0];
        featuredDeals.push({
          vendor_name: hotel.vendor_name,
          hero_image: hotel.hero_image,
          location_heading: hotel.location_heading || destinationData.city,
          location_subheading: hotel.location_subheading || destinationData.country,
          description: hotel.description,
          price: hotel.price,
          original_price: hotel.original_price,
          link: hotel.link
        });
      }
    }
    
    return featuredDeals.slice(0, limit);
  } catch (error) {
    console.error(`Error loading featured deals for ${lang}:`, error);
    return [];
  }
} 