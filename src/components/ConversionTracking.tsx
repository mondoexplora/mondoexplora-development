'use client';

import { useEffect } from 'react';

interface ConversionTrackingProps {
  pageType: 'homepage' | 'destination' | 'country' | 'route' | 'article';
  destination?: string;
  country?: string;
  origin?: string;
  hotelCount?: number;
  minPrice?: number;
}

export default function ConversionTracking({ 
  pageType, 
  destination, 
  country, 
  origin, 
  hotelCount, 
  minPrice 
}: ConversionTrackingProps) {
  
  useEffect(() => {
    // Wait for tracking scripts to load
    const initializeTracking = () => {
      // Google Analytics 4 Enhanced Ecommerce
      if (typeof window !== 'undefined' && (window as any).gtag) {
        const gtag = (window as any).gtag;
        
        // Page view with custom parameters
        gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_type: pageType,
          destination: destination || '',
          country: country || '',
          origin: origin || '',
          hotel_count: hotelCount || 0,
          min_price: minPrice || 0,
          currency: 'USD',
          value: minPrice || 0
        });

      // Custom conversion events based on page type
      switch (pageType) {
        case 'destination':
          gtag('event', 'view_item', {
            currency: 'USD',
            value: minPrice || 0,
            items: [{
              item_id: destination,
              item_name: `${destination} Hotels`,
              category: 'Luxury Hotels',
              quantity: hotelCount || 0,
              price: minPrice || 0
            }]
          });
          break;
          
        case 'country':
          gtag('event', 'view_item_list', {
            currency: 'USD',
            value: minPrice || 0,
            items: [{
              item_id: country,
              item_name: `${country} Hotels`,
              category: 'Luxury Hotels',
              quantity: hotelCount || 0
            }]
          });
          break;
          
        case 'route':
          gtag('event', 'view_search_results', {
            search_term: `${origin} to ${destination}`,
            currency: 'USD',
            value: minPrice || 0
          });
          break;
          
        case 'homepage':
          gtag('event', 'view_homepage', {
            currency: 'USD',
            value: minPrice || 0
          });
          break;
      }
    }

    // Facebook Pixel tracking
    if (typeof window !== 'undefined' && (window as any).fbq) {
      const fbq = (window as any).fbq;
      
      fbq('track', 'PageView', {
        content_type: pageType,
        destination: destination || '',
        country: country || '',
        origin: origin || '',
        hotel_count: hotelCount || 0,
        min_price: minPrice || 0
      });

      // Custom events for better attribution
      fbq('track', 'ViewContent', {
        content_type: pageType,
        content_ids: [destination || country || 'homepage'],
        content_name: `${destination || country || 'MondoExplora'} Hotels`,
        content_category: 'Luxury Travel',
        value: minPrice || 0,
        currency: 'USD'
      });
    }

      // Microsoft Clarity for user behavior tracking
      if (typeof window !== 'undefined' && (window as any).clarity) {
        const clarity = (window as any).clarity;
        clarity('set', 'pageType', pageType);
        clarity('set', 'destination', destination || '');
        clarity('set', 'country', country || '');
      }
    };

    // Initialize tracking immediately if scripts are already loaded
    initializeTracking();
    
    // Also try after a short delay to ensure scripts are loaded
    const timeoutId = setTimeout(initializeTracking, 100);

    return () => clearTimeout(timeoutId);
  }, [pageType, destination, country, origin, hotelCount, minPrice]);

  return null;
}

// Google Tag Manager data layer push
export function pushDataLayer(event: string, data: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
}

// Conversion tracking for specific actions
export function trackConversion(action: string, value?: number, currency: string = 'USD') {
  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      currency,
      value: value || 0
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', action, {
      value: value || 0,
      currency
    });
  }

  // Data layer for GTM
  pushDataLayer(action, {
    value: value || 0,
    currency
  });
}

// Test function to trigger conversion (for debugging)
export function testConversion() {
  console.log('Testing Google Ads conversion...');
  
  // Google Ads Conversion Tracking
  if (typeof window !== 'undefined' && (window as any).gtag) {
    const accountId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ACCOUNT_ID;
    const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
    const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
    
    console.log('Google Ads Conversion Debug:', {
      accountId,
      conversionId,
      conversionLabel,
      sendTo: `${accountId}/${conversionId}/${conversionLabel}`
    });
    
    (window as any).gtag('event', 'conversion', {
      send_to: `${accountId}/${conversionId}/${conversionLabel}`,
      value: 100,
      currency: 'USD',
      transaction_id: `test_${Date.now()}`
    });
    
    console.log('Google Ads conversion event sent:', {
      send_to: `${accountId}/${conversionId}/${conversionLabel}`,
      value: 100,
      currency: 'USD'
    });
  }
  
  // Also push to data layer for GTM
  pushDataLayer('hotel_booking', {
    value: 100,
    currency: 'USD',
    hotel_name: 'Test Hotel',
    destination: 'Test Destination'
  });
  
  console.log('Data layer event pushed: hotel_booking');
}

// Hotel booking conversion tracking
export function trackHotelBooking(hotelName: string, price: number, destination: string) {
  // Google Analytics Enhanced Ecommerce
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'purchase', {
      transaction_id: `booking_${Date.now()}`,
      value: price,
      currency: 'USD',
      items: [{
        item_id: hotelName.toLowerCase().replace(/\s+/g, '_'),
        item_name: hotelName,
        category: 'Luxury Hotels',
        quantity: 1,
        price: price
      }]
    });
  }

  // Google Ads Conversion Tracking
  if (typeof window !== 'undefined' && (window as any).gtag) {
    const accountId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ACCOUNT_ID;
    const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
    const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
    
    console.log('Google Ads Conversion Debug:', {
      accountId,
      conversionId,
      conversionLabel,
      sendTo: `${accountId}/${conversionId}/${conversionLabel}`
    });
    
    (window as any).gtag('event', 'conversion', {
      send_to: `${accountId}/${conversionId}/${conversionLabel}`,
      value: price,
      currency: 'USD',
      transaction_id: `booking_${Date.now()}`
    });
    
    console.log('Google Ads conversion event sent:', {
      send_to: `${accountId}/${conversionId}/${conversionLabel}`,
      value: price,
      currency: 'USD'
    });
  }

  // Facebook Pixel Purchase
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Purchase', {
      content_type: 'hotel_booking',
      content_ids: [hotelName.toLowerCase().replace(/\s+/g, '_')],
      content_name: hotelName,
      content_category: 'Luxury Hotels',
      value: price,
      currency: 'USD'
    });
  }

  // Custom conversion tracking
  trackConversion('hotel_booking', price);
}

// Search tracking
export function trackSearch(searchTerm: string, resultsCount: number) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'search', {
      search_term: searchTerm,
      results_count: resultsCount
    });
  }

  pushDataLayer('search', {
    search_term: searchTerm,
    results_count: resultsCount
  });
}

// Hotel view tracking
export function trackHotelView(hotelName: string, price: number, destination: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'view_item', {
      currency: 'USD',
      value: price,
      items: [{
        item_id: hotelName.toLowerCase().replace(/\s+/g, '_'),
        item_name: hotelName,
        category: 'Luxury Hotels',
        quantity: 1,
        price: price,
        destination: destination
      }]
    });
  }

  trackConversion('hotel_view', price);
}
