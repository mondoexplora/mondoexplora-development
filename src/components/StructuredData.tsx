import { ReactNode } from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2)
      }}
    />
  );
}

// Helper functions to generate structured data
export function generateHomepageStructuredData(
  lang: string = 'en',
  totalHotels?: number
) {
  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French', 
    it: 'Italian'
  };

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MondoExplora",
    "description": "Discover luxury hotels with exclusive deals in 65+ countries worldwide. Compare prices, read reviews, and book with confidence.",
    "url": `https://mondoexplora.com/${lang}`,
    "inLanguage": lang,
    "publisher": {
      "@type": "Organization",
      "name": "MondoExplora",
      "url": "https://mondoexplora.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mondoexplora.com/logo.png"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://mondoexplora.com/{lang}/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Luxury Hotels Worldwide",
      "description": "Comprehensive list of luxury hotels with exclusive deals",
      "numberOfItems": totalHotels ?? undefined,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "South East Asia Hotels",
          "description": "Luxury hotels in Thailand, Vietnam, Indonesia, Philippines, Malaysia, Singapore"
        },
        {
          "@type": "ListItem", 
          "position": 2,
          "name": "Europe Hotels",
          "description": "Luxury hotels in France, Italy, Spain, Germany, United Kingdom"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Australia & New Zealand Hotels", 
          "description": "Luxury hotels in Australia, New Zealand, and Pacific destinations"
        }
      ]
    }
  };
}

export function generateDestinationStructuredData(destinationData: any, lang: string = 'en') {
  const hotels = destinationData.hotels || [];
  const averagePrice = hotels.reduce((sum: number, hotel: any) => sum + (hotel.price || 0), 0) / hotels.length;
  
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": destinationData.city,
    "description": destinationData.description,
    "containedInPlace": {
      "@type": "Country",
      "name": destinationData.country
    },
    "url": `https://mondoexplora.com/${lang}/destination/${destinationData.city.toLowerCase().replace(/\s+/g, '-')}`,
    "image": destinationData.hero_image,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `Hotels in ${destinationData.city}`,
      "itemListElement": hotels.slice(0, 10).map((hotel: any, index: number) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "LodgingBusiness",
          "name": hotel.name,
          "description": hotel.description,
          "image": hotel.hero_image,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": destinationData.city,
            "addressCountry": destinationData.country
          },
          "priceRange": hotel.price ? `$${hotel.price}` : "$$",
          "amenityFeature": [
            {
              "@type": "LocationFeatureSpecification",
              "name": "Free WiFi"
            },
            {
              "@type": "LocationFeatureSpecification", 
              "name": "Luxury Accommodation"
            }
          ]
        },
        "price": hotel.price || averagePrice,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": hotel.booking_url || `https://mondoexplora.com/${lang}/destination/${destinationData.city.toLowerCase().replace(/\s+/g, '-')}`
      }))
    },
    "geo": destinationData.coordinates ? {
      "@type": "GeoCoordinates",
      "latitude": destinationData.coordinates.split(',')[0],
      "longitude": destinationData.coordinates.split(',')[1]
    } : undefined,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": hotels.length,
      "bestRating": "5",
      "worstRating": "1"
    }
  };
}

export function generateCountryStructuredData(countryData: any, lang: string = 'en') {
  const destinations = countryData.popular_destinations || [];
  
  return {
    "@context": "https://schema.org",
    "@type": "Country",
    "name": countryData.name,
    "description": countryData.description,
    "url": `https://mondoexplora.com/${lang}/country/${countryData.name.toLowerCase().replace(/\s+/g, '-')}`,
    "image": countryData.hero_image,
    "containsPlace": destinations.map((destination: any) => ({
      "@type": "City",
      "name": destination.name,
      "description": destination.description,
      "url": `https://mondoexplora.com/${lang}/destination/${destination.name.toLowerCase().replace(/\s+/g, '-')}`,
      "image": destination.image,
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": `Hotels in ${destination.name}`,
        "numberOfItems": destination.hotel_deals || 0
      }
    })),
    "geo": countryData.coordinates ? {
      "@type": "GeoCoordinates", 
      "latitude": countryData.coordinates.split(',')[0],
      "longitude": countryData.coordinates.split(',')[1]
    } : undefined,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `Luxury Hotels in ${countryData.name}`,
      "numberOfItems": destinations.reduce((sum: number, dest: any) => sum + (dest.hotel_deals || 0), 0),
      "itemListElement": destinations.slice(0, 5).map((destination: any, index: number) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "City",
          "name": destination.name,
          "description": destination.description
        },
        "price": destination.avg_price,
        "priceCurrency": "USD"
      }))
    }
  };
}

export function generateRouteStructuredData(origin: string, destination: string, destinationData: any, lang: string = 'en') {
  const formatCityName = (cityName: string) => {
    return cityName
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  const displayOrigin = formatCityName(origin);
  const displayDestination = formatCityName(destination);
  
  return {
    "@context": "https://schema.org",
    "@type": "TravelAction",
    "name": `Travel from ${displayOrigin} to ${displayDestination}`,
    "description": `Plan your trip from ${displayOrigin} to ${displayDestination}. Find the best travel routes and exclusive hotel deals.`,
    "url": `https://mondoexplora.com/${lang}/route/${origin}/${destination}`,
    "fromLocation": {
      "@type": "City",
      "name": displayOrigin
    },
    "toLocation": {
      "@type": "City", 
      "name": displayDestination,
      "containedInPlace": {
        "@type": "Country",
        "name": destinationData.country
      }
    },
    "object": {
      "@type": "TouristDestination",
      "name": displayDestination,
      "description": destinationData.description,
      "image": destinationData.hero_image,
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": `Hotels in ${displayDestination}`,
        "itemListElement": (destinationData.hotels || []).slice(0, 6).map((hotel: any) => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "LodgingBusiness",
            "name": hotel.name,
            "description": hotel.description,
            "image": hotel.hero_image,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": displayDestination,
              "addressCountry": destinationData.country
            }
          },
          "price": hotel.price,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }))
      }
    },
    "potentialAction": {
      "@type": "BookAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `https://mondoexplora.com/${lang}/destination/${destination}`
      }
    }
  };
}
