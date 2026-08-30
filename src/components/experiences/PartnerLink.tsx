'use client';

import { useState } from 'react';
import { PARTNER_REL, partnerHref, outboundCampaign } from '@/lib/experienceLinks';
import {
  appendOutboundTrackingUrl,
  type OutboundPlacement,
} from '@/lib/trackingBackend';

interface PartnerLinkProps {
  partnerUrl: string;
  countrySlug: string;
  regionSlug: string;
  placement: OutboundPlacement;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * Outbound link to the booking partner.
 *
 * Renders a real anchor with the static UTMs and rel="sponsored nofollow ..." so
 * crawlers see (and discount) a genuine link — a window.open() handler would give
 * them nothing to read, which is exactly what the partner asked us to avoid.
 *
 * On click it registers the clickout, which mints the unique sub_id and returns
 * the final URL with it attached as utm_content. If that call fails or is slow to
 * fail, the plain href is followed instead: an untracked click beats a lost one.
 */
export default function PartnerLink({
  partnerUrl,
  countrySlug,
  regionSlug,
  placement,
  className,
  style,
  children,
}: PartnerLinkProps) {
  const [pending, setPending] = useState(false);
  const href = partnerHref(partnerUrl, countrySlug, regionSlug);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (new tab, download, middle click) behave natively.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    e.preventDefault();
    if (pending) return;
    setPending(true);

    // Opened before the await so the navigation stays inside the user gesture;
    // Safari blocks a window.open() that happens after an async boundary.
    const w = window.open('', '_blank', 'noopener,noreferrer');

    try {
      const finalUrl = await appendOutboundTrackingUrl(partnerUrl, {
        placement,
        partner: 'exploreshare',
        outboundCampaign: outboundCampaign(countrySlug, regionSlug),
      });
      if (w) w.location.href = finalUrl;
      else window.location.href = finalUrl;
    } catch {
      if (w) w.location.href = href;
      else window.location.href = href;
    } finally {
      setPending(false);
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel={PARTNER_REL}
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
