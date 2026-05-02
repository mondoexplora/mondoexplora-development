"use client";

import { useEffect } from "react";
import CookieConsent from "@/components/CookieConsent";
import { trackingManager } from "@/lib/trackingManager";
import { emitConsentChanged } from "@/lib/trackingBackend";

export default function ConsentInitializer({ lang = 'en' }: { lang?: string }) {
  useEffect(() => {
    // Check for existing consent on page load
    const existingConsent = localStorage.getItem('cookie-consent');
    const consentPreferences = localStorage.getItem('consent-preferences');
    
    if (existingConsent === 'accepted') {
      // User has previously accepted cookies
      const preferences = consentPreferences ? JSON.parse(consentPreferences) : {
        necessary: true,
        analytics: true,
        marketing: true,
        personalization: true,
      };
      
      // Apply the consent to tracking manager
      trackingManager.setConsent(preferences);
      
      // Initialize tracking with consent
      trackingManager.initialize();
    } else if (existingConsent === 'declined') {
      // User has previously declined cookies
      const preferences = consentPreferences ? JSON.parse(consentPreferences) : {
        necessary: true,
        analytics: false,
        marketing: false,
        personalization: false,
      };
      
      // Apply the consent to tracking manager
      trackingManager.setConsent(preferences);
    }
    // If no consent exists, let the banner handle it
    emitConsentChanged();
  }, []);

  return (
    <CookieConsent
      onAccept={() => {
        const consent = {
          necessary: true,
          analytics: true,
          marketing: true,
          personalization: true,
        };
        
        // Store consent
        localStorage.setItem('cookie-consent', 'accepted');
        localStorage.setItem('consent-preferences', JSON.stringify(consent));
        
        // Apply to tracking manager
        trackingManager.setConsent(consent);
        
        // Initialize tracking with consent
        trackingManager.initialize();
        emitConsentChanged();
      }}
      onDecline={() => {
        const consent = {
          necessary: true,
          analytics: false,
          marketing: false,
          personalization: false,
        };
        
        // Store consent
        localStorage.setItem('cookie-consent', 'declined');
        localStorage.setItem('consent-preferences', JSON.stringify(consent));
        
        // Apply to tracking manager
        trackingManager.setConsent(consent);
        emitConsentChanged();
      }}
      lang={lang}
    />
  );
}
