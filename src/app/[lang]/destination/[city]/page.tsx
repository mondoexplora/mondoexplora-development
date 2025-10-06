import { notFound } from 'next/navigation';
import Hero from '@/components/Hero';
import HotelGrid from '@/components/HotelGrid';
import Footer from '@/components/Footer';
import { getDestinationData } from '@/lib/data';
import { SupportedLanguage } from '@/types';
import { Metadata } from 'next';
import StructuredData, { generateDestinationStructuredData } from '@/components/StructuredData';
import ConversionTracking from '@/components/ConversionTracking';

interface PageProps {
  params: Promise<{
    lang: string;
    city: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, city } = await params;
  
  try {
    const destinationData = await getDestinationData(lang as SupportedLanguage, city);
    
    if (!destinationData) {
      return {
        title: 'Destination Not Found | MondoExplora',
        description: 'The requested destination could not be found.'
      };
    }

    const cityName = destinationData.city;
    const countryName = destinationData.country;
    const hotelCount = destinationData.hotels?.length || 0;

    const titles: Record<string, string> = {
      en: `Best Hotels in ${cityName}, ${countryName} | ${hotelCount}+ Luxury Accommodations | MondoExplora`,
      es: `Mejores Hoteles en ${cityName}, ${countryName} | ${hotelCount}+ Alojamientos de Lujo | MondoExplora`,
      fr: `Meilleurs Hôtels à ${cityName}, ${countryName} | ${hotelCount}+ Hébergements de Luxe | MondoExplora`,
      it: `Migliori Hotel a ${cityName}, ${countryName} | ${hotelCount}+ Alloggi di Lusso | MondoExplora`
    };

    const descriptions: Record<string, string> = {
      en: `Discover the best luxury hotels in ${cityName}, ${countryName}. Compare ${hotelCount}+ hotels with exclusive deals, read reviews, and book with confidence. Best rates guaranteed with up to 60% off.`,
      es: `Descubre los mejores hoteles de lujo en ${cityName}, ${countryName}. Compara ${hotelCount}+ hoteles con ofertas exclusivas, lee reseñas y reserva con confianza. Mejores tarifas garantizadas con hasta 60% de descuento.`,
      fr: `Découvrez les meilleurs hôtels de luxe à ${cityName}, ${countryName}. Comparez ${hotelCount}+ hôtels avec des offres exclusives, lisez les avis et réservez en toute confiance. Meilleurs tarifs garantis avec jusqu'à 60% de réduction.`,
      it: `Scopri i migliori hotel di lusso a ${cityName}, ${countryName}. Confronta ${hotelCount}+ hotel con offerte esclusive, leggi le recensioni e prenota con fiducia. Migliori tariffe garantite con sconti fino al 60%.`
    };

    const keywords = [
      `${cityName} hotels`,
      `luxury hotels ${cityName}`,
      `hotels in ${cityName}`,
      `${cityName} ${countryName} hotels`,
      `best hotels ${cityName}`,
      `hotel deals ${cityName}`,
      `${cityName} accommodation`,
      `luxury accommodation ${cityName}`,
      lang === 'es' ? `hoteles ${cityName}` :
      lang === 'fr' ? `hôtels ${cityName}` :
      lang === 'it' ? `hotel ${cityName}` : `${cityName} hotels`
    ];

    return {
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
      keywords,
      openGraph: {
        title: titles[lang] || titles.en,
        description: descriptions[lang] || descriptions.en,
        locale: lang === 'en' ? 'en_US' : lang === 'es' ? 'es_ES' : lang === 'fr' ? 'fr_FR' : 'it_IT',
        url: `https://mondoexplora.com/${lang}/destination/${city}`,
        siteName: "MondoExplora",
        images: [
          {
            url: destinationData.hero_image || "https://mondoexplora.com/og-image-destination.jpg",
            width: 1200,
            height: 630,
            alt: `Best Hotels in ${cityName}, ${countryName}`,
          }
        ],
      },
      twitter: {
        title: titles[lang] || titles.en,
        description: descriptions[lang] || descriptions.en,
        images: [destinationData.hero_image || "https://mondoexplora.com/og-image-destination.jpg"],
      },
      alternates: {
        canonical: `https://mondoexplora.com/${lang}/destination/${city}`,
      },
      other: {
        'geo.region': countryName,
        'geo.placename': cityName,
        'geo.position': (destinationData as any).coordinates || '',
        'ICBM': (destinationData as any).coordinates || '',
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Destination | MondoExplora',
      description: 'Discover luxury hotels and exclusive deals worldwide.'
    };
  }
}

export default async function DestinationPage({ params }: PageProps) {
  const { lang, city } = await params;
  
  try {
    const destinationData = await getDestinationData(lang as SupportedLanguage, city);
    
    if (!destinationData) {
      notFound();
    }

    // Calculate minimum price for tracking
    const hotelPrices = destinationData.hotels?.map((hotel: any) => hotel.price || 0).filter((price: number) => price > 0) || [];
    const minPrice = hotelPrices.length > 0 ? Math.min(...hotelPrices) : 30;

    return (
      <main className="min-h-screen">
        <ConversionTracking 
          pageType="destination"
          destination={destinationData.city}
          country={destinationData.country}
          hotelCount={destinationData.hotels?.length || 0}
          minPrice={minPrice}
        />
        <StructuredData data={generateDestinationStructuredData(destinationData, lang)} />
        <Hero
          title={destinationData.hero_title}
          subtitle={destinationData.description}
          backgroundImage={destinationData.hero_image}
          location={`${destinationData.city}, ${destinationData.country}`}
        />
        
        <div className="main-content">
          <HotelGrid hotels={destinationData.hotels} lang={lang} />
        </div>
        
        <Footer currentLang={lang} />
      </main>
    );
  } catch (error) {
    console.error('Error loading destination data:', error);
    notFound();
  }
}

// Generate static params for all supported languages and cities
export async function generateStaticParams() {
  const languages = ['en'];
  
  // Get all available cities from the generated JSON files
  const fs = await import('fs').then(m => m.promises);
  const path = await import('path');
  
  try {
    const dataDir = path.join(process.cwd(), 'data', 'en', 'destination');
    const files = await fs.readdir(dataDir);
    const cities = files
      .filter((file: string) => file.endsWith('.json'))
      .map((file: string) => file.replace('.json', ''));
    
    const params = [];
    for (const lang of languages) {
      for (const city of cities) {
        params.push({ lang, city });
      }
    }
    
    return params;
  } catch (error) {
    console.log('No destination files found, using default');
    return [{ lang: 'en', city: 'bangkok' }];
  }
} 