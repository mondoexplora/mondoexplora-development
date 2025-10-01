'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Footer from './Footer';

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
    totalHotels: number;
    countries: { [country: string]: Country };
  };
}

interface RegionalHomepageProps {
  regionalData: RegionalData;
  searchData: { name: string; slug: string; type: 'country' | 'destination' }[];
}

export default function RegionalHomepage({ regionalData, searchData }: RegionalHomepageProps) {
  const [activeRegion, setActiveRegion] = useState('Australia & New Zealand');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof searchData>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const regions = Object.keys(regionalData);
  
  // Get top 6 countries for active region
  const activeCountries = Object.entries(regionalData[activeRegion]?.countries || {})
    .slice(0, 6)
    .map(([name, data]) => ({ name, ...data }));

  // Handle search
  useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = searchData.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10);
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery, searchData]);

  const handleSearchSelect = (item: typeof searchData[0]) => {
    setSearchQuery(item.name);
    setShowSearchResults(false);
    // Navigate to the selected item
    const url = item.type === 'country' 
      ? `/en/country/${item.slug}` 
      : `/en/destination/${item.slug}`;
    window.location.href = url;
  };

  const getDestinationSlug = (destination: string, country: string) => {
    return destination.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const getCountrySlug = (country: string) => {
    return country.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  // Format destination name for display (convert slug to proper case)
  const formatDestinationName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get real minimum price from hotel data
  const getDestinationPrice = (destination: string, country: string) => {
    try {
      // Find the region and country data
      const region = Object.keys(regionalData).find(r => 
        regionalData[r].countries[country]
      );
      
      if (region && regionalData[region].countries[country]) {
        const countryData = regionalData[region].countries[country];
        const destinationData = countryData.destinations[destination];
        
        // Return real minimum price if available
        if (destinationData && destinationData.minPrice) {
          return Math.round(destinationData.minPrice);
        }
      }
      
      // Fallback to regional minimum prices if no real price found
      const fallbackPrices: { [key: string]: number } = {
        'South East Asia': 45,
        'Japan & South Korea': 80,
        'US, Canada & Mexico': 90,
        'Australia & New Zealand': 100,
        'Europe': 70,
        'Latin America': 60
      };
      
      return fallbackPrices[region || 'South East Asia'] || 45;
    } catch (error) {
      console.error('Error getting destination price:', error);
      return 45; // Default fallback
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section with Logo */}
      <div className="hero-section" style={{ backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(42, 63, 89, 0.8) 100%), url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')` }}>
        <div className="page-header">
          {/* Logo in top right corner */}
          <div className="logo-overlay">
            <span>Mondo</span>
            <span>Explora</span>
          </div>
          
          <div className="text-center text-white pr-16 sm:pr-32 md:pr-64">
            <h1 className="page-header h1">
              Find the best hotels and exclusive deals around the world
            </h1>
          </div>
          
          {/* Search Box */}
          <div className="relative w-full max-w-md mx-auto mt-8 z-50">
            <div className="relative">
              <input
                type="text"
                placeholder="Search destinations or countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
                className="w-full px-4 py-3 pl-10 pr-4 bg-white/90 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 text-gray-900 placeholder-gray-600"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchSelect(item)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="text-gray-900">{item.name}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Regional Navigation Tabs */}
      <section className="bg-white sticky top-0 z-20">
        <div className="main-content">
          <div className="flex space-x-1 overflow-x-auto">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                className={`px-6 py-4 whitespace-nowrap font-medium transition-colors ${
                  activeRegion === region
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
          {/* Blue line that extends from active tab */}
          <div className="h-1 bg-blue-600"></div>
        </div>
      </section>

      {/* Country Grid */}
      <section className="main-content py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeCountries.map((country) => {
                const topDestinations = Object.entries(country.destinations)
                  .slice(0, 5)
                  .map(([name, data]) => {
                    return {
                      name,
                      count: data.hotelCount,
                      slug: getDestinationSlug(name, country.name)
                    };
                  });

            return (
              <div key={country.name} className="destination-card">
                {/* Country Header */}
                <div className="destination-info">
                  <h3 className="destination-name">{country.name}</h3>
                  <div className="destination-deals">
                    {country.hotelCount.toLocaleString()} hotels available
                  </div>
                </div>

                {/* Destinations List */}
                <div className="mt-4">
                  <div className="space-y-2">
                    {topDestinations.map((destination) => {
                      const price = getDestinationPrice(destination.name, country.name);
                      return (
                        <Link
                          key={destination.name}
                          href={`/en/destination/${destination.slug}`}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex flex-col">
                            <span className="text-gray-900 group-hover:text-blue-600 transition-colors font-medium">
                              {formatDestinationName(destination.name)}
                            </span>
                            <span className="text-sm text-green-600 font-semibold">
                              from ${price}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {destination.count}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  
                  {/* View All Link */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <Link
                      href={`/en/country/${getCountrySlug(country.name)}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View all destinations in {country.name}
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <Footer currentLang="en" />
    </main>
  );
}
