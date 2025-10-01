import { notFound } from 'next/navigation';
import Hero from '@/components/Hero';
import HotelGrid from '@/components/HotelGrid';
import Footer from '@/components/Footer';
import { getDestinationData } from '@/lib/data';
import { SupportedLanguage } from '@/types';

interface PageProps {
  params: Promise<{
    lang: string;
    city: string;
  }>;
}

export default async function DestinationPage({ params }: PageProps) {
  const { lang, city } = await params;
  
  try {
    const destinationData = await getDestinationData(lang as SupportedLanguage, city);
    
    if (!destinationData) {
      notFound();
    }

    return (
      <main className="min-h-screen">
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