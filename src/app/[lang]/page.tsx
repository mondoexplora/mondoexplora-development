import RegionalHomepage from '@/components/RegionalHomepage';
import { Metadata } from 'next';
import StructuredData, { generateHomepageStructuredData } from '@/components/StructuredData';
import ConversionTracking from '@/components/ConversionTracking';
import { loadHomepageContent } from '@/lib/homepage-content';
import { faqJsonLd } from '@/lib/homepage-faq';
import '@/styles/home.css';
import '@/styles/experiences.css';

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
    de: "Die Besten Hotels und Exklusive Angebote Weltweit Finden | MondoExplora",
    fr: "Trouvez les Meilleurs Hôtels et Offres Exclusives dans le Monde | MondoExplora",
    es: "Encuentra los Mejores Hoteles y Ofertas Exclusivas en Todo el Mundo | MondoExplora",
    it: "Trova i Migliori Hotel e Offerte Esclusive in Tutto il Mondo | MondoExplora",
    pt: "Encontre os Melhores Hotéis e Ofertas Exclusivas em Todo o Mundo | MondoExplora"
  };

  const descriptions: Record<string, string> = {
    en: "Discover luxury hotels with exclusive deals in 65+ countries worldwide. Compare prices, read reviews, and book with confidence. Best rates guaranteed with up to 60% off.",
    de: "Entdecken Sie Luxushotels mit exklusiven Angeboten in 65+ Ländern weltweit. Preise vergleichen, Bewertungen lesen und sicher buchen. Beste Preise garantiert mit bis zu 60% Rabatt.",
    fr: "Découvrez des hôtels de luxe avec des offres exclusives dans plus de 65 pays du monde. Comparez les prix, lisez les avis et réservez en toute confiance. Meilleurs tarifs garantis avec jusqu'à 60% de réduction.",
    es: "Descubre hoteles de lujo con ofertas exclusivas en más de 65 países del mundo. Compara precios, lee reseñas y reserva con confianza. Mejores tarifas garantizadas con hasta 60% de descuento.",
    it: "Scopri hotel di lusso con offerte esclusive in più di 65 paesi del mondo. Confronta i prezzi, leggi le recensioni e prenota con fiducia. Migliori tariffe garantite con sconti fino al 60%.",
    pt: "Descubra hotéis de luxo com ofertas exclusivas em mais de 65 países em todo o mundo. Compare preços, leia avaliações e reserve com confiança. Melhores tarifas garantidas com até 60% de desconto."
  };

  return {
    title: titles[lang] || titles.en,
    description: descriptions[lang] || descriptions.en,
    openGraph: {
      title: titles[lang] || titles.en,
      description: descriptions[lang] || descriptions.en,
      locale: lang === 'en' ? 'en_US' : lang === 'es' ? 'es_ES' : lang === 'fr' ? 'fr_FR' : 'it_IT',
      url: `https://mondoexplora.com/${lang}`,
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
      canonical: `https://mondoexplora.com/${lang}`,
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

export default async function LocaleHomePage({
  params,
}: PageProps) {
  const { lang } = await params;
  const content = await loadHomepageContent(lang);

  return (
    <>
      <ConversionTracking
        pageType="homepage"
        hotelCount={content.totalHotels}
        minPrice={content.minPrice}
      />
      <StructuredData
        data={generateHomepageStructuredData(lang, content.totalHotels)}
      />
      <StructuredData data={faqJsonLd(content.faq)} />
      <RegionalHomepage {...content} lang={lang} />
    </>
  );
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'de' },
    { lang: 'fr' },
    { lang: 'es' },
    { lang: 'it' },
    { lang: 'pt' }
  ];
}
