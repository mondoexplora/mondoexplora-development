'use client';

import { useState } from 'react';

export interface ActivityOption {
  name: string;
  count: number;
}

interface ActivityChipsProps {
  activities: ActivityOption[];
  /** Currently selected activity, or null for "all". */
  active: string | null;
  onChange: (activity: string | null) => void;
  allLabel: string;
  allCount: number;
  /** Activities beyond this are hidden behind a "+N more" toggle. */
  visible?: number;
}

/**
 * The activity filter row. Shared by every page that filters by activity so the
 * chips behave identically wherever they appear.
 */
export default function ActivityChips({
  activities,
  active,
  onChange,
  allLabel,
  allCount,
  visible = 8,
}: ActivityChipsProps) {
  const [expanded, setExpanded] = useState(false);

  // Always keep the selected chip visible, even if it sits past the cut-off.
  const shown = expanded ? activities : activities.slice(0, visible);
  const hiddenSelected =
    active && !shown.some((a) => a.name === active)
      ? activities.find((a) => a.name === active)
      : undefined;
  const chips = hiddenSelected ? [...shown, hiddenSelected] : shown;
  const remaining = activities.length - shown.length - (hiddenSelected ? 1 : 0);

  return (
    <div className="exp-chips">
      <button
        type="button"
        className={active === null ? 'exp-chip on' : 'exp-chip'}
        aria-pressed={active === null}
        onClick={() => onChange(null)}
      >
        {allLabel} <span className="n">{allCount}</span>
      </button>

      {chips.map((a) => (
        <button
          key={a.name}
          type="button"
          className={active === a.name ? 'exp-chip on' : 'exp-chip'}
          aria-pressed={active === a.name}
          onClick={() => onChange(active === a.name ? null : a.name)}
        >
          {a.name} <span className="n">{a.count}</span>
        </button>
      ))}

      {remaining > 0 && (
        <button
          type="button"
          className="exp-chip exp-chip-muted"
          onClick={() => setExpanded(true)}
        >
          +{remaining} more
        </button>
      )}
    </div>
  );
}
