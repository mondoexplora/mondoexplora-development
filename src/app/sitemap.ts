import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mondoexplora.com';
  const languages = ['en', 'es', 'fr', 'it'];
  
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
        es: `${baseUrl}/es`,
        fr: `${baseUrl}/fr`,
        it: `${baseUrl}/it`,
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
            es: `${baseUrl}/es/destination/${destination}`,
            fr: `${baseUrl}/fr/destination/${destination}`,
            it: `${baseUrl}/it/destination/${destination}`,
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
            es: `${baseUrl}/es/country/${country}`,
            fr: `${baseUrl}/fr/country/${country}`,
            it: `${baseUrl}/it/country/${country}`,
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

  return [
    ...staticPages,
    ...languagePages,
    ...destinationPages,
    ...countryPages,
    ...routePages,
  ];
}
