"use client";

import CookieConsent from "@/components/CookieConsent";
import { trackingManager } from "@/lib/trackingManager";

export default function ConsentInitializer({ lang = 'en' }: { lang?: string }) {
  return (
    <CookieConsent
      onAccept={() => {
        trackingManager.setConsent({
          necessary: true,
          analytics: true,
          marketing: true,
          personalization: true,
        });
      }}
      onDecline={() => {
        trackingManager.setConsent({
          necessary: true,
          analytics: false,
          marketing: false,
          personalization: false,
        });
      }}
      lang={lang}
    />
  );
}
