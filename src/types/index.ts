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

export interface RouteData {
  origin: string;
  destination: string;
  affiliate_link?: string;
}

export interface CountryData {
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

export interface DealData {
  title: string;
  description: string;
  price: number;
  original_price?: number;
  image: string;
  link: string;
}

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'it'; 