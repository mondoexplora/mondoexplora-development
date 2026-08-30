'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ActivityChips, { type ActivityOption } from './ActivityChips';

export interface FilterableTile {
  key: string;
  href: string;
  title: string;
  /** Unfiltered count, rendered in the green accent. */
  metaCount: number;
  /** Text after the unfiltered count, e.g. "experiences · 38 regions". */
  metaSuffix: string;
  sub: string;
  activityCounts: Record<string, number>;
}

interface FilterableTilesProps {
  tiles: FilterableTile[];
  activities: ActivityOption[];
  allLabel: string;
  allCount: number;
  /** Singular noun for the filtered count, e.g. "trip". */
  noun?: string;
}

/**
 * Country and hub pages: the chips filter the tiles below to those that actually
 * offer the activity, and each tile's count switches to that activity's own
 * number.
 *
 * The count has to change with the filter — leaving "515 experiences" on the
 * France tile while filtering by canyoning would be a straightforwardly false
 * statement about the catalogue.
 */
export default function FilterableTiles({
  tiles,
  activities,
  allLabel,
  allCount,
  noun = 'trip',
}: FilterableTilesProps) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const fromHash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    if (fromHash && activities.some((a) => a.name === fromHash)) {
      setActive(fromHash);
    }
  }, [activities]);

  const change = (activity: string | null) => {
    setActive(activity);
    const url = activity
      ? `${window.location.pathname}#${encodeURIComponent(activity)}`
      : window.location.pathname;
    window.history.replaceState(null, '', url);
  };

  const shown = active
    ? tiles.filter((t) => (t.activityCounts[active] ?? 0) > 0)
    : tiles;

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <ActivityChips
          activities={activities}
          active={active}
          onChange={change}
          allLabel={allLabel}
          allCount={allCount}
        />
      </div>

      <div className="exp-tiles">
        {shown.map((t) => {
          const n = active ? t.activityCounts[active] ?? 0 : 0;
          return (
            <Link key={t.key} href={t.href} className="exp-tile">
              <span className="stackable">
                <h3>{t.title}</h3>
                <span className="count">
                  {active ? (
                    <>
                      <strong>{n}</strong> {active.toLowerCase()}{' '}
                      {n === 1 ? noun : `${noun}s`}
                    </>
                  ) : (
                    <>
                      <strong>{t.metaCount}</strong> {t.metaSuffix}
                    </>
                  )}
                </span>
                <span className="sub">{t.sub}</span>
              </span>
            </Link>
          );
        })}
      </div>

      {shown.length === 0 && (
        <p className="exp-filter-empty">
          No {active?.toLowerCase()} here yet.
        </p>
      )}
    </>
  );
}
