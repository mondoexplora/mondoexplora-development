'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { HomepageDeal } from '@/lib/homepage-deals';
import { openOutboundTab, resolveWithTimeout } from '@/lib/outboundWindow';
import { appendOutboundTrackingUrl } from '@/lib/trackingBackend';

interface DealCardProps {
  deal: HomepageDeal;
  lang: string;
}

const PARTNER_REL = 'sponsored nofollow noopener noreferrer';

/**
 * A hotel deal on the homepage.
 *
 * Same clickout contract as the experience pages: a real anchor so crawlers see
 * a genuine (discounted) link, a new tab opened synchronously inside the gesture,
 * and the current tab left untouched if the popup is blocked. See
 * lib/outboundWindow for why the handle is kept rather than passing `noopener`.
 *
 * The location line is a separate internal link to the destination page — the
 * card is otherwise entirely outbound, and the destination pages need the
 * internal links.
 */
export default function DealCard({ deal, lang }: DealCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [pending, setPending] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (new tab, download, middle click) behave natively.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (pending) {
      e.preventDefault();
      return;
    }

    // Must happen synchronously, inside the gesture, or Safari blocks it.
    const tab = openOutboundTab();

    // Popup blocked: let the anchor's target="_blank" open the untracked URL
    // rather than redirecting the page the visitor is reading.
    if (!tab) return;

    e.preventDefault();
    setPending(true);

    void resolveWithTimeout(
      appendOutboundTrackingUrl(deal.link, {
        placement: 'home_deal',
        partner: 'luxuryescapes',
      }),
      deal.link
    )
      .then((finalUrl) => tab.send(finalUrl))
      .finally(() => setPending(false));
  };

  return (
    <article className="mx-card">
      <a
        href={deal.link}
        target="_blank"
        rel={PARTNER_REL}
        className="mx-card-img"
        onClick={handleClick}
        aria-label={`View deal: ${deal.vendor}`}
      >
        <img
          src={imageFailed ? '/images/placeholder-hotel.jpg' : deal.image}
          alt={deal.vendor}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
        <span className="mx-off">−{deal.discount}%</span>
      </a>

      <div className="mx-card-body">
        <Link
          href={`/${lang}/destination/${deal.citySlug}/`}
          className="mx-card-loc"
        >
          {deal.city}
          {deal.country ? `, ${deal.country}` : ''}
        </Link>

        <h3 className="mx-card-title">
          <a
            href={deal.link}
            target="_blank"
            rel={PARTNER_REL}
            onClick={handleClick}
          >
            {deal.vendor}
          </a>
        </h3>

        <p className="mx-card-perks">{deal.title}</p>

        <div className="mx-card-foot">
          <span className="mx-price">
            {deal.originalPrice > deal.price && (
              <del>${deal.originalPrice.toLocaleString('en-GB')}</del>
            )}
            <b>${deal.price.toLocaleString('en-GB')}</b>
          </span>
          <a
            href={deal.link}
            target="_blank"
            rel={PARTNER_REL}
            className="mx-cta"
            onClick={handleClick}
          >
            {pending ? 'Opening…' : 'View deal →'}
          </a>
        </div>
      </div>
    </article>
  );
}
