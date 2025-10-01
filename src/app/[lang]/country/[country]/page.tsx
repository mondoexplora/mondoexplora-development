import { notFound } from 'next/navigation';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { getCountryData, getDestinationData } from '@/lib/data';
import Link from 'next/link';
import DestinationImage from '@/components/DestinationImage';
import { SupportedLanguage } from '@/types';

interface PageProps {
  params: Promise<{
    lang: string;
    country: string;
  }>;
}

export default async function CountryPage({ params }: PageProps) {
  const { lang, country } = await params;
  
  try {
    const countryData = await getCountryData(lang as SupportedLanguage, country);
    
    if (!countryData) {
      console.log(`Country data not found for: ${country}`);
      notFound();
    }

    // Get destination images for popular destinations
    const destinationsWithImages = await Promise.all(
      (countryData.popular_destinations || []).map(async (destination) => {
        try {
          const destinationData = await getDestinationData(lang as SupportedLanguage, destination.slug);
          return {
            ...destination,
            hero_image: destinationData?.hero_image || destinationData?.hotels?.[0]?.hero_image || destination.image
          };
        } catch (error) {
          console.error(`Error loading destination data for ${destination.name}:`, error);
          return {
            ...destination,
            hero_image: destination.image
          };
        }
      })
    );

    return (
      <main className="min-h-screen">
        <Hero
          title={`Discover ${countryData.name}`}
          subtitle={countryData.description}
          backgroundImage={countryData.hero_image}
        />
        
        <div className="main-content">
          <div className="hotel-section-header">
            <h2>Hotel Deals in {countryData.name}</h2>
            <p>Find the best accommodation options across {countryData.name}</p>
          </div>
          
                                {/* Popular Destinations Section */}
                      {destinationsWithImages && destinationsWithImages.length > 0 && (
                        <div className="popular-destinations">
                          <div className="destination-grid">
                            {destinationsWithImages.map((destination, index) => (
                              <Link
                                key={index}
                                href={`/${lang}/destination/${destination.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="destination-card"
                              >
                                <div className="destination-image-container">
                                  <DestinationImage 
                                    src={destination.hero_image || `https://images.luxuryescapes.com/k8poq69wndgino863vk`}
                                    alt={`${destination.name} hotels`}
                                    className="destination-image"
                                  />
                                  <div className="destination-price-badge">
                                    <span className="destination-price">${destination.avg_price}</span>
                                  </div>
                                </div>
                                <div className="destination-info">
                                  <h4 className="destination-name">{destination.name}</h4>
                                  <p className="destination-description">{destination.description}</p>
                                  <div className="destination-deals">
                                    {destination.hotel_deals} hotel deals
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
          
          {/* Country content would go here */}
          <div className="text-center py-8">
            <p className="text-gray-600">More country information coming soon...</p>
          </div>
        </div>
        
        <Footer currentLang={lang} />
      </main>
    );
  } catch (error) {
    console.error(`Error loading country data for ${country}:`, error);
    notFound();
  }
}

// Generate static params for all supported languages and countries
export async function generateStaticParams() {
  const languages = ['en'];
  
  // Get all available countries from the generated JSON files
  const fs = await import('fs').then(m => m.promises);
  const path = await import('path');
  
  try {
    const dataDir = path.join(process.cwd(), 'data', 'en', 'country');
    const files = await fs.readdir(dataDir);
    const countries = files
      .filter((file: string) => file.endsWith('.json'))
      .map((file: string) => file.replace('.json', ''));
    
    const params = [];
    for (const lang of languages) {
      for (const country of countries) {
        params.push({ lang, country });
      }
    }
    
    return params;
  } catch (error) {
    console.log('No country files found, using default');
    return [{ lang: 'en', country: 'thailand' }];
  }
} 