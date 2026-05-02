import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConsentInitializer from "@/components/ConsentInitializer";
import TrackingBootstrap from "@/components/TrackingBootstrap";

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
      'de': 'https://mondoexplora.com/de',
      'fr': 'https://mondoexplora.com/fr',
      'es': 'https://mondoexplora.com/es',
      'it': 'https://mondoexplora.com/it',
      'pt': 'https://mondoexplora.com/pt',
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
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <head>
        <meta name="color-scheme" content="light only" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <ConsentInitializer lang="en" />
        <TrackingBootstrap />
      </body>
    </html>
  );
}
