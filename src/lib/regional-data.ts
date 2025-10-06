import { readFile } from 'fs/promises';
import path from 'path';

interface Destination {
  name: string;
  hotelCount: number;
  slug: string;
}

interface Country {
  hotelCount: number;
  destinations: { [key: string]: { hotelCount: number; minPrice?: number } };
}

interface RegionalData {
  [region: string]: {
    countries: { [country: string]: Country };
    totalHotels: number;
  };
}

interface SearchItem {
  name: string;
  slug: string;
  type: 'country' | 'destination';
}

export async function loadRegionalData(): Promise<RegionalData> {
  try {
    const analysisPath = path.join(process.cwd(), 'data', 'homepage-data.json');
    const data = await readFile(analysisPath, 'utf8');
    const homepageData = JSON.parse(data);
    return homepageData.regionalData;
  } catch (error) {
    console.error('Error loading regional data:', error);
    return {};
  }
}


export async function loadSearchData(): Promise<SearchItem[]> {
  try {
    const analysisPath = path.join(process.cwd(), 'data', 'homepage-data.json');
    const data = await readFile(analysisPath, 'utf8');
    const homepageData = JSON.parse(data);
    return homepageData.searchData;
  } catch (error) {
    console.error('Error loading search data:', error);
    return [];
  }
}

// Helper function to get destination slug
export function getDestinationSlug(destination: string, country: string): string {
  return destination.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Helper function to get country slug
export function getCountrySlug(country: string): string {
  return country.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
