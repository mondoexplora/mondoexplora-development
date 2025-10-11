import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getArticleData } from '@/lib/data';
import { SupportedLanguage } from '@/types';
import ArticleRenderer from '@/components/ArticleRenderer';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import ConversionTracking from '@/components/ConversionTracking';

interface PageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  
  try {
    const article = await getArticleData(lang as SupportedLanguage, slug);
    
    if (!article) {
      return {
        title: 'Article Not Found | MondoExplora',
        description: 'The requested article could not be found.'
      };
    }

    const keywords = [
      ...article.tags,
      'travel guide',
      'travel tips',
      'travel blog',
      lang === 'es' ? 'guía de viaje' :
      lang === 'fr' ? 'guide de voyage' :
      lang === 'it' ? 'guida di viaggio' : 'travel guide'
    ];

    return {
      title: `${article.title} | MondoExplora`,
      description: article.summary,
      keywords,
      authors: [{ name: article.author }],
      openGraph: {
        title: article.title,
        description: article.summary,
        locale: lang === 'en' ? 'en_US' : lang === 'es' ? 'es_ES' : lang === 'fr' ? 'fr_FR' : 'it_IT',
        url: `https://mondoexplora.com/${lang}/article/${slug}`,
        siteName: "MondoExplora",
        images: [
          {
            url: article.featured_image,
            width: 1200,
            height: 630,
            alt: article.title,
          }
        ],
        type: 'article',
        publishedTime: article.date,
        authors: [article.author],
        tags: article.tags,
      },
      twitter: {
        title: article.title,
        description: article.summary,
        images: [article.featured_image],
        card: 'summary_large_image',
      },
      alternates: {
        canonical: `https://mondoexplora.com/${lang}/article/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Travel Article | MondoExplora',
      description: 'Discover travel guides and tips from MondoExplora.'
    };
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { lang, slug } = await params;
  
  try {
    const article = await getArticleData(lang as SupportedLanguage, slug);
    
    if (!article) {
      notFound();
    }

    // Format date for display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString(lang === 'en' ? 'en-US' : 
                                    lang === 'es' ? 'es-ES' : 
                                    lang === 'fr' ? 'fr-FR' : 'it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return (
      <main className="min-h-screen">
        <ConversionTracking 
          pageType="article" 
          hotelCount={0}
          minPrice={0}
        />
        
        <Hero
          title={article.title}
          subtitle={article.summary}
          backgroundImage={article.featured_image}
        />
        
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Article Meta */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <span>By {article.author}</span>
              <span>•</span>
              <span>{formatDate(article.date)}</span>
              {article.featured && (
                <>
                  <span>•</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Featured
                  </span>
                </>
              )}
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <ArticleRenderer contentBlocks={article.content_blocks} />
          </div>
          
          {/* Article Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">About the Author</h3>
              <p className="text-gray-600">
                {article.author} is a travel writer passionate about sharing authentic travel experiences and local insights.
              </p>
            </div>
          </div>
        </div>
        
        <Footer currentLang={lang} />
      </main>
    );
  } catch (error) {
    console.error('Error loading article:', error);
    notFound();
  }
}

// Generate static params for all articles
export async function generateStaticParams() {
  const languages = ['en', 'es', 'fr', 'it'];
  const params = [];
  
  for (const lang of languages) {
    // For now, we only have the Bali article in English
    if (lang === 'en') {
      params.push({
        lang,
        slug: 'bali-travel-guide'
      });
    }
  }
  
  return params;
}
