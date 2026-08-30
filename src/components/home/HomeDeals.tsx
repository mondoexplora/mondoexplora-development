import type { HomepageDeal } from '@/lib/homepage-deals';
import DealCard from './DealCard';

interface HomeDealsProps {
  deals: HomepageDeal[];
  /** Every discounted stay in the feed, not just the ones on this row. */
  discountedCount: number;
  lang: string;
}

/**
 * The first thing below the hero: real, currently discounted hotels.
 *
 * There is no "all deals" index to link to, so the count lives in the copy
 * instead of behind a call to action that would have nowhere to go.
 */
export default function HomeDeals({
  deals,
  discountedCount,
  lang,
}: HomeDealsProps) {
  if (deals.length === 0) return null;

  return (
    <section className="mx-sec" id="deals" aria-labelledby="mx-deals">
      <div className="mx-wrap">
        <div className="mx-sec-head">
          <h2 id="mx-deals">Biggest price drops this week</h2>
          <a href="#regions" className="mx-sec-all">
            Browse every destination →
          </a>
        </div>
        <p className="mx-sec-sub">
          {discountedCount.toLocaleString('en-GB')} stays are discounted right now.
          These are the steepest, one per country, straight from the partner feed.
        </p>

        <div className="mx-grid">
          {deals.map((deal) => (
            <DealCard key={deal.link} deal={deal} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
}
