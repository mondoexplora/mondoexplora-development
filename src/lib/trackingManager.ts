'use client';

interface TrackingConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

class TrackingManager {
  private consent: TrackingConsent = {
    necessary: true, // Always true for basic functionality
    analytics: false,
    marketing: false,
    personalization: false
  };

  constructor() {
    this.loadConsent();
  }

  private loadConsent(): void {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem('cookie-consent');
    if (stored === 'accepted') {
      this.consent = {
        necessary: true,
        analytics: true,
        marketing: true,
        personalization: true
      };
    } else if (stored === 'declined') {
      this.consent = {
        necessary: true,
        analytics: false,
        marketing: false,
        personalization: false
      };
    }
  }

  public setConsent(consent: Partial<TrackingConsent>): void {
    this.consent = { ...this.consent, ...consent };
    this.saveConsent();
    this.initializeTracking();
  }

  private saveConsent(): void {
    if (typeof window === 'undefined') return;
    
    const allAccepted = this.consent.analytics && this.consent.marketing && this.consent.personalization;
    const allDeclined = !this.consent.analytics && !this.consent.marketing && !this.consent.personalization;
    
    if (allAccepted) {
      localStorage.setItem('cookie-consent', 'accepted');
    } else if (allDeclined) {
      localStorage.setItem('cookie-consent', 'declined');
    } else {
      localStorage.setItem('cookie-consent', 'partial');
    }
  }

  public hasConsent(type: keyof TrackingConsent): boolean {
    return this.consent[type];
  }

  public initializeTracking(): void {
    if (typeof window === 'undefined') return;

    // Initialize Google Tag Manager
    if (this.consent.analytics || this.consent.marketing) {
      this.initializeGTM();
    }

    // Initialize Google Analytics
    if (this.consent.analytics) {
      this.initializeGA();
    }

    // Initialize Facebook Pixel
    if (this.consent.marketing) {
      this.initializeFacebookPixel();
    }

    // Initialize Microsoft Clarity
    if (this.consent.analytics) {
      this.initializeClarity();
    }
  }

  private initializeGTM(): void {
    const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
    if (!gtmId) return;

    // Initialize dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    
    // GTM script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `;
    document.head.appendChild(script);

    // GTM noscript
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.appendChild(noscript);
  }

  private initializeGA(): void {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (!gaId) return;

    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = (...args: unknown[]) => {
      (window as any).dataLayer.push(args);
    };
    (window as any).gtag('js', new Date());
    (window as any).gtag('config', gaId, {
      anonymize_ip: true,
      allow_google_signals: this.consent.personalization,
      allow_ad_personalization_signals: this.consent.marketing
    });
  }

  private initializeFacebookPixel(): void {
    const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
    if (!pixelId) return;

    // Facebook Pixel script
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  }

  private initializeClarity(): void {
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
    if (!clarityId) return;

    // Microsoft Clarity script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${clarityId}");
    `;
    document.head.appendChild(script);
  }

  // Tracking methods that respect consent
  public trackPageView(pageType: string, destination?: string, country?: string, origin?: string, hotelCount?: number, minPrice?: number): void {
    if (!this.consent.analytics) return;

    if (typeof window !== 'undefined' && (window as any).gtag) {
      const gtag = (window as any).gtag;
      
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
    }
  }

  public trackConversion(action: string, value?: number, currency: string = 'USD'): void {
    if (!this.consent.marketing) return;

    // Google Ads Conversion
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const gtag = (window as any).gtag;
      const accountId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ACCOUNT_ID;
      const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
      const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
      
      if (accountId && conversionId && conversionLabel) {
        gtag('event', 'conversion', {
          send_to: `${accountId}/${conversionId}/${conversionLabel}`,
          value: value || 0,
          currency,
          transaction_id: `${action}_${Date.now()}`
        });
      }
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      const fbq = (window as any).fbq;
      fbq('track', action, {
        value: value || 0,
        currency
      });
    }
  }

  public trackHotelBooking(hotelName: string, price: number, destination: string): void {
    if (!this.consent.marketing) return;

    // Google Analytics Enhanced Ecommerce
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const gtag = (window as any).gtag;
      
      gtag('event', 'purchase', {
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

    // Track conversion
    this.trackConversion('hotel_booking', price);
  }

  public trackHotelView(hotelName: string, price: number, destination: string): void {
    if (!this.consent.analytics) return;

    if (typeof window !== 'undefined' && (window as any).gtag) {
      const gtag = (window as any).gtag;
      
      gtag('event', 'view_item', {
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
  }
}

// Export singleton instance
export const trackingManager = new TrackingManager();
