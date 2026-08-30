import RegionalHomepage from '@/components/RegionalHomepage';
import { loadHomepageContent } from '@/lib/homepage-content';
import { faqJsonLd } from '@/lib/homepage-faq';
import '@/styles/home.css';
import '@/styles/experiences.css';
import { Metadata } from 'next';
import StructuredData, { generateHomepageStructuredData } from '@/components/StructuredData';
import ConversionTracking from '@/components/ConversionTracking';

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
  const content = await loadHomepageContent('en');

  return (
    <>
      <ConversionTracking
        pageType="homepage"
        hotelCount={content.totalHotels}
        minPrice={content.minPrice}
      />
      <StructuredData
        data={generateHomepageStructuredData('en', content.totalHotels)}
      />
      <StructuredData data={faqJsonLd(content.faq)} />
      <RegionalHomepage {...content} lang="en" />
    </>
  );
}
