import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  return (
    <main>
      <Hero 
        title="Welcome to MondoExplora"
        subtitle="Discover amazing destinations around the world"
        backgroundImage="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to MondoExplora - Fixed!
        </h1>
        <p className="text-center text-lg text-gray-600 mb-8">
          Discover amazing destinations around the world
        </p>
      </div>
      <Footer />
    </main>
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