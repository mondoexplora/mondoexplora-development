'use client';

import { PARTNER_REL } from '@/lib/experienceLinks';
import { openOutboundTab, resolveWithTimeout } from '@/lib/outboundWindow';
import { appendOutboundTrackingUrl } from '@/lib/trackingBackend';

interface GatewayLinkProps {
  rome2rioUrl: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * "Plan this journey" link in the how-to-get-there module.
 *
 * Same new-tab behaviour as PartnerLink: the experience page stays open behind
 * it. Tracked as a `gateway_city` clickout so we can see how much of the
 * section's traffic that module earns. Rome2Rio has no partner profile, so its
 * sub_id lands under the default TRACKING_SUB_ID_PARAM rather than utm_content.
 */
export default function GatewayLink({
  rome2rioUrl,
  className,
  children,
}: GatewayLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const tab = openOutboundTab();
    if (!tab) return; // popup blocked — let target="_blank" handle it

    e.preventDefault();

    void resolveWithTimeout(
      appendOutboundTrackingUrl(rome2rioUrl, {
        placement: 'gateway_city',
        partner: 'rome2rio',
      }),
      rome2rioUrl
    ).then((finalUrl) => tab.send(finalUrl));
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
