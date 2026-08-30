'use client';

import { PARTNER_REL } from '@/lib/experienceLinks';
import { appendOutboundTrackingUrl } from '@/lib/trackingBackend';

interface GatewayLinkProps {
  rome2rioUrl: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * "Plan this journey" link in the how-to-get-there module.
 *
 * Tracked as a `gateway_city` clickout so we can see how much of the section's
 * traffic it actually earns, and carries the same sponsored/nofollow rel as the
 * booking link. Rome2Rio has no partner profile, so its sub_id lands under the
 * default TRACKING_SUB_ID_PARAM rather than utm_content.
 */
export default function GatewayLink({
  rome2rioUrl,
  className,
  children,
}: GatewayLinkProps) {
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    e.preventDefault();
    const w = window.open('', '_blank', 'noopener,noreferrer');
    try {
      const finalUrl = await appendOutboundTrackingUrl(rome2rioUrl, {
        placement: 'gateway_city',
        partner: 'rome2rio',
      });
      if (w) w.location.href = finalUrl;
      else window.location.href = finalUrl;
    } catch {
      if (w) w.location.href = rome2rioUrl;
      else window.location.href = rome2rioUrl;
    }
  };

  return (
    <a
      href={rome2rioUrl}
      target="_blank"
      rel={PARTNER_REL}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
