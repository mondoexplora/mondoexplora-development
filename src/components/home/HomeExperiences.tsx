'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Experience } from '@/lib/experiences';
import ActivityChips, {
  type ActivityOption,
} from '@/components/experiences/ActivityChips';
import ExperienceCard from '@/components/experiences/ExperienceCard';

interface HomeExperiencesProps {
  /** A sample spread across activities, not the whole catalogue. */
  experiences: Experience[];
  /** Counts are catalogue-wide, so the chips state the real size. */
  activities: ActivityOption[];
  totalExperiences: number;
  lang: string;
  /** Cards shown at once; the rest of the sample is behind a chip. */
  shown?: number;
}

/**
 * The experiences rail.
 *
 * The chips carry catalogue-wide counts but filter a sample of a couple of dozen
 * cards — 4,272 trips cannot ship in the homepage HTML. That gap is why the
 * section's call to action always names the real number and links into
 * /experiences with the activity in the hash, where the hub picks it up and
 * applies the same filter.
 */
export default function HomeExperiences({
  experiences,
  activities,
  totalExperiences,
  lang,
  shown = 4,
}: HomeExperiencesProps) {
  const [active, setActive] = useState<string | null>(null);

  const filtered = active
    ? experiences.filter((e) => e.activity === active)
    : experiences;

  const activeCount = active
    ? activities.find((a) => a.name === active)?.count ?? filtered.length
    : totalExperiences;

  const href = active
    ? `/${lang}/experiences/#${encodeURIComponent(active)}`
    : `/${lang}/experiences/`;

  return (
    <section className="mx-sec mx-sec-alt" aria-labelledby="mx-experiences">
      <div className="mx-wrap">
        <div className="mx-sec-head">
          <h2 id="mx-experiences">Guided experiences</h2>
          <Link href={href} className="mx-sec-all">
            All {activeCount.toLocaleString('en-GB')}{' '}
            {active ? `${active.toLowerCase()} trips` : 'trips'} →
          </Link>
        </div>
        <p className="mx-sec-sub">
          Hiking, climbing, ski touring and canyoning run by certified guides —
          each with a real price and how far it is from the nearest city.
        </p>

        <div className="mx-chips">
          <ActivityChips
            activities={activities}
            active={active}
            onChange={setActive}
            allLabel="All activities"
            allCount={totalExperiences}
            visible={6}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="mx-sec-sub">
            Nothing from this activity in today&apos;s selection —{' '}
            <Link href={href}>see all {activeCount.toLocaleString('en-GB')} →</Link>
          </p>
        ) : (
          // mx-grid, not exp-grid: the rail has to line up with the four deal
          // cards above it, and exp-grid's wider minimum column fits only three.
          <div className="mx-grid">
            {filtered.slice(0, shown).map((e) => (
              <ExperienceCard key={e.id} experience={e} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
