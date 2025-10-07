import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mondoexplora.com'),
  title: {
    default: "MondoExplora - Find the Best Hotels and Exclusive Deals Worldwide",
    template: "%s | MondoExplora"
  },
  description: "Discover luxury hotels with exclusive deals in 65+ countries worldwide. Compare prices, read reviews, and book with confidence. Best rates guaranteed with up to 60% off.",
  keywords: [
    "luxury hotels",
    "hotel deals", 
    "travel booking",
    "exclusive discounts",
    "worldwide destinations",
    "hotel comparison",
    "best hotel rates",
    "luxury accommodations",
    "travel deals",
    "hotel booking platform"
  ],
  authors: [{ name: "MondoExplora Team" }],
  creator: "MondoExplora",
  publisher: "MondoExplora",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mondoexplora.com",
    siteName: "MondoExplora",
    title: "MondoExplora - Find the Best Hotels and Exclusive Deals Worldwide",
    description: "Discover luxury hotels with exclusive deals in 65+ countries worldwide. Compare prices, read reviews, and book with confidence.",
    images: [
      {
        url: "https://mondoexplora.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MondoExplora - Luxury Hotel Deals Worldwide",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mondoexplora",
    creator: "@mondoexplora",
    title: "MondoExplora - Find the Best Hotels and Exclusive Deals Worldwide",
    description: "Discover luxury hotels with exclusive deals in 65+ countries worldwide.",
    images: ["https://mondoexplora.com/og-image.jpg"],
  },
  alternates: {
    canonical: "https://mondoexplora.com",
    languages: {
      'en': 'https://mondoexplora.com/en',
      'es': 'https://mondoexplora.com/es',
      'fr': 'https://mondoexplora.com/fr',
      'it': 'https://mondoexplora.com/it',
      'x-default': 'https://mondoexplora.com/en'
    }
  },
  verification: {
    google: "google-site-verification-code", // Add your Google Search Console verification code
  },
  category: 'travel',
  classification: 'Travel and Tourism',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/favicon.svg', sizes: '180x180', type: 'image/svg+xml' }
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get tracking IDs from environment variables
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        {gtmId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />
        )}
        
        {/* Google Analytics 4 */}
        {gaId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_title: document.title,
                    page_location: window.location.href
                  });
                `,
              }}
            />
          </>
        )}
        
        {/* Facebook Pixel */}
        {fbPixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${fbPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
        
        {/* Microsoft Clarity */}
        {clarityId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${clarityId}");
              `,
            }}
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        
        {children}
      </body>
    </html>
  );
}
