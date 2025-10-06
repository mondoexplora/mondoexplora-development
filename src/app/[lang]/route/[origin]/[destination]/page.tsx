import { notFound } from 'next/navigation';
import Link from 'next/link';
import Hero from '@/components/Hero';
import RouteCTA from '@/components/RouteCTA';
import HotelGrid from '@/components/HotelGrid';
import Footer from '@/components/Footer';
import { getDestinationData, getDestinationUrlData } from '@/lib/data';
import { SupportedLanguage } from '@/types';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    lang: string;
    origin: string;
    destination: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, origin, destination } = await params;
  
  try {
    // Get destination data for hotels
    const destinationData = await getDestinationData(lang as SupportedLanguage, destination);
    
    // Get destination URL data for affiliate link and country name
    const destinationUrlData = await getDestinationUrlData(destination);
    
    if (!destinationData || !destinationUrlData) {
      return {
        title: 'Route Not Found | MondoExplora',
        description: 'The requested travel route could not be found.'
      };
    }

    // Format display names with proper capitalization
    const formatCityName = (cityName: string) => {
      return cityName
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };
    
    const displayOrigin = formatCityName(origin);
    const displayDestination = formatCityName(destination);
    const countryName = destinationUrlData.country_name as string;
    const hotelCount = destinationData.hotels?.length || 0;

    const titles: Record<string, string> = {
      en: `${displayOrigin} to ${displayDestination} | Travel Guide & Hotel Deals | ${hotelCount}+ Hotels | MondoExplora`,
      es: `${displayOrigin} a ${displayDestination} | Guía de Viaje y Ofertas de Hoteles | ${hotelCount}+ Hoteles | MondoExplora`,
      fr: `${displayOrigin} vers ${displayDestination} | Guide de Voyage et Offres d'Hôtels | ${hotelCount}+ Hôtels | MondoExplora`,
      it: `${displayOrigin} a ${displayDestination} | Guida di Viaggio e Offerte Hotel | ${hotelCount}+ Hotel | MondoExplora`
    };

    const descriptions: Record<string, string> = {
      en: `Plan your trip from ${displayOrigin} to ${displayDestination}, ${countryName}. Find the best travel routes, compare ${hotelCount}+ hotels, and book exclusive deals. Best rates guaranteed with up to 60% off.`,
      es: `Planifica tu viaje de ${displayOrigin} a ${displayDestination}, ${countryName}. Encuentra las mejores rutas de viaje, compara ${hotelCount}+ hoteles y reserva ofertas exclusivas. Mejores tarifas garantizadas con hasta 60% de descuento.`,
      fr: `Planifiez votre voyage de ${displayOrigin} vers ${displayDestination}, ${countryName}. Trouvez les meilleures routes de voyage, comparez ${hotelCount}+ hôtels et réservez des offres exclusives. Meilleurs tarifs garantis avec jusqu'à 60% de réduction.`,
      it: `Pianifica il tuo viaggio da ${displayOrigin} a ${displayDestination}, ${countryName}. Trova le migliori rotte di viaggio, confronta ${hotelCount}+ hotel e prenota offerte esclusive. Migliori tariffe garantite con sconti fino al 60%.`
    };

    const keywords = [
      `${displayOrigin} to ${displayDestination}`,
      `${displayOrigin} ${displayDestination} travel`,
      `${displayDestination} hotels`,
      `travel ${displayOrigin} ${displayDestination}`,
      `${displayOrigin} ${displayDestination} route`,
      `hotels in ${displayDestination}`,
      `${displayDestination} accommodation`,
      `travel guide ${displayOrigin} ${displayDestination}`,
      `${countryName} travel`,
      lang === 'es' ? `viaje ${displayOrigin} ${displayDestination}` :
      lang === 'fr' ? `voyage ${displayOrigin} ${displayDestination}` :
      lang === 'it' ? `viaggio ${displayOrigin} ${displayDestination}` : `${displayOrigin} to ${displayDestination} travel`
    ];

    return {
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
      keywords,
      openGraph: {
        title: titles[lang] || titles.en,
        description: descriptions[lang] || descriptions.en,
        locale: lang === 'en' ? 'en_US' : lang === 'es' ? 'es_ES' : lang === 'fr' ? 'fr_FR' : 'it_IT',
        url: `https://mondoexplora.com/${lang}/route/${origin}/${destination}`,
        siteName: "MondoExplora",
        images: [
          {
            url: destinationData.hero_image || "https://mondoexplora.com/og-image-route.jpg",
            width: 1200,
            height: 630,
            alt: `Travel from ${displayOrigin} to ${displayDestination}`,
          }
        ],
      },
      twitter: {
        title: titles[lang] || titles.en,
        description: descriptions[lang] || descriptions.en,
        images: [destinationData.hero_image || "https://mondoexplora.com/og-image-route.jpg"],
      },
      alternates: {
        canonical: `https://mondoexplora.com/${lang}/route/${origin}/${destination}`,
      },
      other: {
        'geo.region': countryName,
        'geo.placename': displayDestination,
        'geo.position': (destinationData as any).coordinates || '',
        'ICBM': (destinationData as any).coordinates || '',
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Travel Route | MondoExplora',
      description: 'Discover luxury hotels and exclusive travel deals worldwide.'
    };
  }
}

export default async function RoutePage({ params }: PageProps) {
  const { lang, origin, destination } = await params;
  
  try {
    // Get destination data for hotels
    const destinationData = await getDestinationData(lang as SupportedLanguage, destination);
    
    // Get destination URL data for affiliate link and country name
    const destinationUrlData = await getDestinationUrlData(destination);
    
    if (!destinationData || !destinationUrlData) {
      notFound();
    }

    // Format display names with proper capitalization
    const formatCityName = (cityName: string) => {
      return cityName
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };
    
    const displayOrigin = formatCityName(origin);
    const displayDestination = formatCityName(destination);
    
    // Create headline
    const headline = `${displayOrigin} to ${displayDestination}`;

    return (
      <main className="min-h-screen">
        <Hero
          title={headline}
          subtitle={`Discover the best way to travel from ${displayOrigin} to ${displayDestination}. Compare travel modes and find exclusive hotel deals.`}
          backgroundImage={destinationData.hero_image}
          cta={<RouteCTA origin={origin} destination={destination} lang={lang} affiliateLink={destinationUrlData?.affiliate_link as string | undefined} />}
        />
        
        <div className="main-content">
          {/* Hotel Deals Section */}
          <div className="hotel-section-header">
            <h2>Hotel Deals in {displayDestination}</h2>
            <p>Find the best accommodation options for your stay in {displayDestination}</p>
          </div>
          
          <HotelGrid hotels={destinationData.hotels.slice(0, 6)} lang={lang} />
          
          {/* Related Links Section */}
          <div className="related-links">
            <h3>Explore More</h3>
            <div className="related-links-grid">
              {destinationUrlData && (
                                          <Link
                            href={`/${lang}/country/${(destinationUrlData.country_name as string).toLowerCase().replace(/\s+/g, '-')}`}
                            className="related-link-card"
                          >
                            <h4>{destinationUrlData.country_name as string} Travel Guide</h4>
                            <p>Discover more destinations and travel information for {destinationUrlData.country_name as string}</p>
                </Link>
              )}
              
              <Link
                href={`/${lang}/destination/${destination}`}
                className="related-link-card"
              >
                <h4>{displayDestination} Destination Guide</h4>
                <p>Explore {displayDestination} in detail with our comprehensive travel guide</p>
              </Link>
              
              <Link
                href={`/${lang}/travel_modes/${origin}/${destination}`}
                className="related-link-card"
              >
                <h4>Compare Travel Modes</h4>
                <p>Find the best way to travel from {displayOrigin} to {displayDestination}</p>
              </Link>
            </div>
          </div>
        </div>
        
        <Footer currentLang={lang} />
      </main>
    );
  } catch (error) {
    console.error('Error loading route data:', error);
    notFound();
  }
}

// Generate static params for all supported routes
export async function generateStaticParams() {
  const languages = ['en'];
  
  // Read routes from config file
  const fs = await import('fs').then(m => m.promises);
  const path = await import('path');
  
  try {
    const configPath = path.join(process.cwd(), 'config', 'routes.json');
    const configData = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configData);
    
    const params = [];
    for (const lang of languages) {
      for (const route of config.routes) {
        params.push({
          lang,
          origin: route.origin,
          destination: route.destination
        });
      }
    }
    
    return params;
  } catch (error) {
    console.error('Error reading routes config:', error);
    // Fallback to default routes
    return [
      { lang: 'en', origin: 'new-york', destination: 'bangkok' },
      { lang: 'en', origin: 'london', destination: 'paris' }
    ];
  }
} 