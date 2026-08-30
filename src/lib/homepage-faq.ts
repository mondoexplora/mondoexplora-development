/**
 * Homepage FAQ.
 *
 * One source for the accordion and the FAQPage JSON-LD, so the two can never
 * drift apart. The numbers are passed in and interpolated rather than written
 * into the copy: the previous version of this page claimed "up to 60% off" and
 * "over 9,835 hotels" as hardcoded strings while the data said otherwise.
 */

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface FaqFacts {
  totalHotels: number;
  countries: number;
  /** Steepest discount in the current feed. */
  maxDiscount: number;
  discountedCount: number;
  /** Zero on languages without an experiences catalogue. */
  experiences: number;
}

export function buildHomepageFaq(facts: FaqFacts): FaqEntry[] {
  const n = (value: number) => value.toLocaleString('en-GB');

  const entries: FaqEntry[] = [
    {
      question: 'How much can I save on these deals?',
      answer:
        `${n(facts.discountedCount)} of the ${n(facts.totalHotels)} stays we list are ` +
        `discounted right now, and the steepest reduction in today's feed is ` +
        `${facts.maxDiscount}% off the standard rate. Every price on this page is ` +
        `the partner's live price, refreshed each morning — we do not add a markup.`,
    },
    {
      question: 'Do you charge a booking fee?',
      answer:
        'No. Booking happens on our partner\'s own site at their price, and we are ' +
        'paid a commission by them afterwards. That commission is how the site is ' +
        'funded, and it does not change what you pay.',
    },
    {
      question: 'Which countries have the most hotels?',
      answer:
        `We list stays in ${n(facts.countries)} countries. The deepest catalogues are ` +
        'in Australia and New Zealand, South East Asia (Thailand, Indonesia, Vietnam) ' +
        'and Europe. Use the region tabs above to see every destination we cover.',
    },
    {
      question: 'Are the prices guaranteed?',
      answer:
        'Prices come straight from the partner feed and are accurate at the time the ' +
        'page is built, but availability moves quickly and the final price is always ' +
        'the one shown at checkout on the partner site. Deals sell out.',
    },
  ];

  if (facts.experiences > 0) {
    entries.push({
      question: 'Who runs the guided experiences?',
      answer:
        `The ${n(facts.experiences)} trips we list are run by certified local guides ` +
        'and mountain professionals, not by MondoExplora. Each trip page shows the ' +
        'price, the duration, and how far the meeting point is from the nearest city.',
    });
  }

  return entries;
}

export function faqJsonLd(entries: FaqEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((e) => ({
      '@type': 'Question',
      name: e.question,
      acceptedAnswer: { '@type': 'Answer', text: e.answer },
    })),
  };
}
