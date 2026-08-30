'use client';

import { useState } from 'react';
import { PARTNER_REL, partnerHref, outboundCampaign } from '@/lib/experienceLinks';
import { openOutboundTab, resolveWithTimeout } from '@/lib/outboundWindow';
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
 * crawlers see (and discount) a genuine link — a bare window.open() handler would
 * give them nothing to read, which is what the partner asked us to avoid.
 *
 * On click it opens a NEW TAB and leaves the page the visitor is reading exactly
 * as it was, then points that tab at the tracked URL once the clickout has been
 * registered and the sub_id minted. See lib/outboundWindow for why the current
 * tab is never redirected.
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

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (new tab, download, middle click) behave natively.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (pending) {
      e.preventDefault();
      return;
    }

    // Must happen synchronously, inside the gesture, or Safari blocks it.
    const tab = openOutboundTab();

    // Popup blocked: do nothing and let the anchor's target="_blank" open the
    // untracked fallback. Never redirect the tab the visitor is reading.
    if (!tab) return;

    e.preventDefault();
    setPending(true);

    void resolveWithTimeout(
      appendOutboundTrackingUrl(partnerUrl, {
        placement,
        partner: 'exploreshare',
        outboundCampaign: outboundCampaign(countrySlug, regionSlug),
      }),
      href
    )
      .then((finalUrl) => tab.send(finalUrl))
      .finally(() => setPending(false));
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
