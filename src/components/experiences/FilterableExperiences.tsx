'use client';

import { useEffect, useState } from 'react';
import type { Experience } from '@/lib/experiences';
import ActivityChips, { type ActivityOption } from './ActivityChips';
import ExperienceCard from './ExperienceCard';

interface FilterableExperiencesProps {
  experiences: Experience[];
  activities: ActivityOption[];
  lang: string;
}

/**
 * Region page: the activity chips filter the experience list in place.
 *
 * Client-side rather than one page per activity — the whole region is already in
 * the HTML, so filtering is instant and adds no pages to a 4,700-page build. The
 * selection is mirrored to the URL hash so a filtered view can be linked and
 * survives a reload.
 */
export default function FilterableExperiences({
  experiences,
  activities,
  lang,
}: FilterableExperiencesProps) {
  const [active, setActive] = useState<string | null>(null);

  // Read the hash after mount: the server-rendered HTML is the unfiltered view,
  // so applying it during render would mismatch and hydrate incorrectly.
  useEffect(() => {
    const fromHash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    if (fromHash && activities.some((a) => a.name === fromHash)) {
      setActive(fromHash);
    }
  }, [activities]);

  const change = (activity: string | null) => {
    setActive(activity);
    // replaceState, not a hash assignment: filtering should not stack up
    // history entries the back button has to walk through.
    const url = activity
      ? `${window.location.pathname}#${encodeURIComponent(activity)}`
      : window.location.pathname;
    window.history.replaceState(null, '', url);
  };

  const shown = active
    ? experiences.filter((e) => e.activity === active)
    : experiences;

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <ActivityChips
          activities={activities}
          active={active}
          onChange={change}
          allLabel="All"
          allCount={experiences.length}
        />
      </div>

      <div className="exp-grid">
        {shown.map((e) => (
          <ExperienceCard
            key={e.id}
            experience={e}
            lang={lang}
            showRegion={false}
          />
        ))}
      </div>
    </>
  );
}
