import RegionalHomepage from '@/components/RegionalHomepage';
import { loadRegionalData, loadSearchData } from '@/lib/regional-data';
import { Metadata } from 'next';
import StructuredData, { generateHomepageStructuredData } from '@/components/StructuredData';
import ConversionTracking from '@/components/ConversionTracking';
import TestConversionButton from '@/components/TestConversionButton';

export const metadata: Metadata = {
  title: "Find the Best Hotels and Exclusive Deals Worldwide | MondoExplora",
  description: "Discover luxury hotels with exclusive deals in 65+ countries worldwide. Compare prices, read reviews, and book with confidence. Best rates guaranteed with up to 60% off.",
  openGraph: {
    title: "Find the Best Hotels and Exclusive Deals Worldwide | MondoExplora",
    description: "Discover luxury hotels with exclusive deals in 65+ countries worldwide. Compare prices, read reviews, and book with confidence. Best rates guaranteed with up to 60% off.",
    locale: 'en_US',
    url: 'https://mondoexplora.com',
    siteName: "MondoExplora",
    images: [
      {
        url: "https://mondoexplora.com/og-image-homepage.jpg",
        width: 1200,
        height: 630,
        alt: "MondoExplora - English Homepage",
      }
    ],
  },
  twitter: {
    title: "Find the Best Hotels and Exclusive Deals Worldwide | MondoExplora",
    description: "Discover luxury hotels with exclusive deals in 65+ countries worldwide. Compare prices, read reviews, and book with confidence. Best rates guaranteed with up to 60% off.",
    images: ["https://mondoexplora.com/og-image-homepage.jpg"],
  },
  alternates: {
    canonical: "https://mondoexplora.com",
  },
  keywords: [
    "luxury hotels",
    "hotel deals",
    "travel booking",
    "exclusive discounts",
    "worldwide destinations",
    "hotel comparison",
    "best hotel rates"
  ],
};

export default async function HomePage() {
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
      <StructuredData data={generateHomepageStructuredData('en')} />
      <TestConversionButton />
      <RegionalHomepage 
        regionalData={regionalData}
        searchData={searchData}
      />
    </>
  );
}
