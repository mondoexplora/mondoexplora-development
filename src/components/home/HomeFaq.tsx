import type { FaqEntry } from '@/lib/homepage-faq';

interface HomeFaqProps {
  entries: FaqEntry[];
}

/**
 * Collapsed FAQ.
 *
 * <details> rather than a state toggle: the answers stay in the HTML for
 * crawlers and for the FAQPage JSON-LD to match, and the accordion costs no
 * JavaScript.
 */
export default function HomeFaq({ entries }: HomeFaqProps) {
  return (
    <section className="mx-sec mx-sec-alt mx-faq" aria-labelledby="mx-faq-heading">
      <div className="mx-wrap">
        <div className="mx-sec-head">
          <h2 id="mx-faq-heading">Common questions</h2>
        </div>
        <p className="mx-sec-sub">
          How the deals work, and how we are paid.
        </p>

        {entries.map((entry) => (
          <details key={entry.question}>
            <summary>{entry.question}</summary>
            <p>{entry.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
