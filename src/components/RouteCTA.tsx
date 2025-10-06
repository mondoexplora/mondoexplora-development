'use client';

interface RouteCTAProps {
  lang: string;
  origin: string;
  destination: string;
  affiliateLink?: string;
}

export default function RouteCTA({ lang, origin, destination, affiliateLink }: RouteCTAProps) {
  const handleClick = () => {
    // Open travel modes page in new tab
    window.open(`/${lang}/travel_modes/${origin}/${destination}`, '_blank');
    
    // Redirect current page to affiliate link if it exists
    if (affiliateLink) {
      window.location.href = affiliateLink;
    }
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