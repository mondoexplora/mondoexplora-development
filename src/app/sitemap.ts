import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mondoexplora.com';
  const languages = ['en', 'de', 'fr', 'es', 'it', 'pt'];
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    }
  ];

  // Language-specific homepages
  const languagePages: MetadataRoute.Sitemap = languages.map(lang => ({
    url: `${baseUrl}/${lang}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
    alternates: {
      languages: {
        en: `${baseUrl}/en`,
        de: `${baseUrl}/de`,
        fr: `${baseUrl}/fr`,
        es: `${baseUrl}/es`,
        it: `${baseUrl}/it`,
        pt: `${baseUrl}/pt`,
      }
    }
  }));

  // Dynamic pages - destinations
  let destinationPages: MetadataRoute.Sitemap = [];
  try {
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    
    const dataDir = path.join(process.cwd(), 'data', 'en', 'destination');
    const files = await fs.readdir(dataDir);
    const destinations = files
      .filter((file: string) => file.endsWith('.json'))
      .map((file: string) => file.replace('.json', ''));

    destinationPages = languages.flatMap(lang =>
      destinations.map(destination => ({
        url: `${baseUrl}/${lang}/destination/${destination}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: {
            en: `${baseUrl}/en/destination/${destination}`,
            de: `${baseUrl}/de/destination/${destination}`,
            fr: `${baseUrl}/fr/destination/${destination}`,
            es: `${baseUrl}/es/destination/${destination}`,
            it: `${baseUrl}/it/destination/${destination}`,
            pt: `${baseUrl}/pt/destination/${destination}`,
          }
        }
      }))
    );
  } catch (error) {
    console.error('Error reading destination files:', error);
  }

  // Dynamic pages - countries
  let countryPages: MetadataRoute.Sitemap = [];
  try {
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    
    const dataDir = path.join(process.cwd(), 'data', 'en', 'country');
    const files = await fs.readdir(dataDir);
    const countries = files
      .filter((file: string) => file.endsWith('.json'))
      .map((file: string) => file.replace('.json', ''));

    countryPages = languages.flatMap(lang =>
      countries.map(country => ({
        url: `${baseUrl}/${lang}/country/${country}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: {
            en: `${baseUrl}/en/country/${country}`,
            de: `${baseUrl}/de/country/${country}`,
            fr: `${baseUrl}/fr/country/${country}`,
            es: `${baseUrl}/es/country/${country}`,
            it: `${baseUrl}/it/country/${country}`,
            pt: `${baseUrl}/pt/country/${country}`,
          }
        }
      }))
    );
  } catch (error) {
    console.error('Error reading country files:', error);
  }

  // Dynamic pages - routes
  let routePages: MetadataRoute.Sitemap = [];
  try {
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    
    const configPath = path.join(process.cwd(), 'config', 'routes.json');
    const configData = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configData);

    routePages = languages.flatMap(lang =>
      config.routes.map((route: any) => ({
        url: `${baseUrl}/${lang}/route/${route.origin}/${route.destination}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
        alternates: {
          languages: {
            en: `${baseUrl}/en/route/${route.origin}/${route.destination}`,
            es: `${baseUrl}/es/route/${route.origin}/${route.destination}`,
            fr: `${baseUrl}/fr/route/${route.origin}/${route.destination}`,
            it: `${baseUrl}/it/route/${route.origin}/${route.destination}`,
          }
        }
      }))
    );
  } catch (error) {
    console.error('Error reading routes config:', error);
  }

  // Dynamic pages - experiences (English only: the feed is not translated yet)
  let experiencePages: MetadataRoute.Sitemap = [];
  try {
    const { getAllExperiences, getCountries, getRegions } = await import(
      '@/lib/experiences'
    );
    const { EXPERIENCE_LANGUAGES } = await import('@/lib/experienceLanguages');

    const [experiences, countries, regions] = await Promise.all([
      getAllExperiences(),
      getCountries(),
      getRegions(),
    ]);

    experiencePages = EXPERIENCE_LANGUAGES.flatMap((lang) => [
      {
        url: `${baseUrl}/${lang}/experiences/`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      ...countries.map((c) => ({
        url: `${baseUrl}/${lang}/experiences/${c.slug}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      ...regions.map((r) => ({
        url: `${baseUrl}/${lang}/experiences/${r.countrySlug}/${r.slug}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...experiences.map((e) => ({
        url: `${baseUrl}/${lang}/experiences/${e.countrySlug}/${e.regionSlug}/${e.slug}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    ]);
  } catch (error) {
    console.error('Error building experience sitemap entries:', error);
  }

  return [
    ...staticPages,
    ...languagePages,
    ...destinationPages,
    ...countryPages,
    ...routePages,
    ...experiencePages,
  ];
}
