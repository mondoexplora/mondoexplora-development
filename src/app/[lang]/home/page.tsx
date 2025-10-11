import RegionalHomepage from '@/components/RegionalHomepage';
import { loadRegionalData, loadSearchData } from '@/lib/regional-data';
import { Metadata } from 'next';
import StructuredData, { generateHomepageStructuredData } from '@/components/StructuredData';
import ConversionTracking from '@/components/ConversionTracking';
import TestConversionButton from '@/components/TestConversionButton';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  
  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish', 
    fr: 'French',
    it: 'Italian'
  };

  const titles: Record<string, string> = {
    en: "Find the Best Hotels and Exclusive Deals Worldwide | MondoExplora",
    es: "Encuentra los Mejores Hoteles y Ofertas Exclusivas en Todo el Mundo | MondoExplora",
    fr: "Trouvez les Meilleurs Hôtels et Offres Exclusives dans le Monde | MondoExplora",
    it: "Trova i Migliori Hotel e Offerte Esclusive in Tutto il Mondo | MondoExplora"
  };

  const descriptions: Record<string, string> = {
    en: "Discover luxury hotels with exclusive deals in 65+ countries worldwide. Compare prices, read reviews, and book with confidence. Best rates guaranteed with up to 60% off.",
    es: "Descubre hoteles de lujo con ofertas exclusivas en más de 65 países del mundo. Compara precios, lee reseñas y reserva con confianza. Mejores tarifas garantizadas con hasta 60% de descuento.",
    fr: "Découvrez des hôtels de luxe avec des offres exclusives dans plus de 65 pays du monde. Comparez les prix, lisez les avis et réservez en toute confiance. Meilleurs tarifs garantis avec jusqu'à 60% de réduction.",
    it: "Scopri hotel di lusso con offerte esclusive in più di 65 paesi del mondo. Confronta i prezzi, leggi le recensioni e prenota con fiducia. Migliori tariffe garantite con sconti fino al 60%."
  };

  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    openGraph: {
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
      locale: lang === 'en' ? 'en_US' : lang === 'es' ? 'es_ES' : lang === 'fr' ? 'fr_FR' : 'it_IT',
      url: `https://mondoexplora.com/${lang}/home`,
      siteName: "MondoExplora",
      images: [
        {
          url: "https://mondoexplora.com/og-image-homepage.jpg",
          width: 1200,
          height: 630,
          alt: `MondoExplora - ${languageNames[lang] || 'English'} Homepage`,
        }
      ],
    },
    twitter: {
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
      images: ["https://mondoexplora.com/og-image-homepage.jpg"],
    },
    alternates: {
      canonical: `https://mondoexplora.com/${lang}/home`,
    },
    keywords: [
      "luxury hotels",
      "hotel deals",
      "travel booking",
      "exclusive discounts",
      "worldwide destinations",
      "hotel comparison",
      "best hotel rates",
      lang === 'es' ? "hoteles de lujo" : 
      lang === 'fr' ? "hôtels de luxe" :
      lang === 'it' ? "hotel di lusso" : "luxury hotels"
    ],
  };
}

export default async function HomePage({
  params,
}: PageProps) {
  const { lang } = await params;
  
  // Load regional data and search data
  const [regionalData, searchData] = await Promise.all([
    loadRegionalData(),
    loadSearchData()
  ]);
  
  // Calculate total hotels and minimum price for tracking
  const totalHotels = Object.values(regionalData).reduce((sum, region) => sum + region.totalHotels, 0);
  const minPrice = 30; // Minimum price from our data

  return (
    <>
      <ConversionTracking 
        pageType="homepage" 
        hotelCount={totalHotels}
        minPrice={minPrice}
      />
      <StructuredData data={generateHomepageStructuredData(lang)} />
      <TestConversionButton />
      <RegionalHomepage 
        regionalData={regionalData}
        searchData={searchData}
      />
    </>
  );
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'es' },
    { lang: 'fr' },
    { lang: 'it' }
  ];
}
