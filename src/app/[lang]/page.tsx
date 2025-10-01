import RegionalHomepage from '@/components/RegionalHomepage';
import { loadRegionalData, loadSearchData } from '@/lib/regional-data';

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  // Load regional data and search data
  const [regionalData, searchData] = await Promise.all([
    loadRegionalData(),
    loadSearchData()
  ]);
  
  return (
    <RegionalHomepage 
      regionalData={regionalData}
      searchData={searchData}
    />
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