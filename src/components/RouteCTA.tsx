'use client';

import { appendOutboundTrackingUrl } from '@/lib/trackingBackend';

interface RouteCTAProps {
  lang: string;
  origin: string;
  destination: string;
  affiliateLink?: string;
}

export default function RouteCTA({ lang, origin, destination, affiliateLink }: RouteCTAProps) {
  const handleClick = () => {
    void (async () => {
      window.open(`/${lang}/travel_modes/${origin}/${destination}`, '_blank');

      if (affiliateLink) {
        const url = await appendOutboundTrackingUrl(affiliateLink, {
          placement: 'route_cta_affiliate',
          partner: 'luxuryescapes',
        });
        window.location.href = url;
      }
    })();
  };

  return (
    <button
      onClick={handleClick}
      className="route-cta-button"
    >
      Compare Transport Options
    </button>
  );
} 