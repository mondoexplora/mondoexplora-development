/**
 * Outbound link helpers shared by the server-rendered href and the client-side
 * clickout. No fs, no window — safe on both sides of the boundary.
 */

/** Partner links are commercial. Google wants `sponsored`; `nofollow` covers
 *  older crawlers. Explore-share asked for nofollow explicitly, given the volume
 *  of links a 4,000-page section creates. */
export const PARTNER_REL = 'sponsored nofollow noopener noreferrer';

export const UTM_SOURCE = 'mondoexplora';
export const UTM_MEDIUM = 'affiliate';

/** Readable campaign label the partner groups their revenue report by. */
export function outboundCampaign(countrySlug: string, regionSlug: string): string {
  return `experiences_${countrySlug}_${regionSlug}`;
}

/**
 * The href rendered into the HTML.
 *
 * Carries the static UTMs but NOT the sub_id — that is minted per click by the
 * tracking function, so it cannot exist at build time. This URL is the fallback
 * a crawler sees and what a visitor with JS disabled follows: the click is then
 * untracked but the visit still reaches the partner, which is the right failure
 * mode for a revenue link.
 */
export function partnerHref(
  partnerUrl: string,
  countrySlug: string,
  regionSlug: string
): string {
  try {
    const u = new URL(partnerUrl);
    u.searchParams.set('utm_source', UTM_SOURCE);
    u.searchParams.set('utm_medium', UTM_MEDIUM);
    u.searchParams.set('utm_campaign', outboundCampaign(countrySlug, regionSlug));
    return u.toString();
  } catch {
    return partnerUrl;
  }
}
