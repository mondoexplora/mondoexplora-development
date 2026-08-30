'use client';

/**
 * Opening an outbound clickout in a new tab.
 *
 * The sub_id is minted server-side, so the final URL does not exist until the
 * tracking call returns. That forces the sequence: open a tab synchronously
 * inside the user gesture (Safari blocks a window.open after an await), then
 * point it at the tracked URL once we have it.
 *
 * Two things this gets right that the obvious version does not:
 *
 * 1. NO `noopener` IN THE FEATURE STRING. Per the HTML spec, window.open with
 *    `noopener` returns null — verified in-browser — so there is no handle left
 *    to redirect, and the naive fallback ends up navigating the CURRENT tab.
 *    We pass no feature string and sever `opener` on the handle instead, which
 *    gives the same protection and keeps the reference.
 *
 * 2. IF THE POPUP IS BLOCKED, THE CURRENT TAB IS NEVER TOUCHED. The caller
 *    leaves the anchor's default behaviour intact, so the browser follows
 *    target="_blank" to the untracked fallback href. Losing the sub_id on a
 *    blocked popup is acceptable; hijacking the tab the visitor is reading is
 *    not.
 */

/** A tracking call that hangs must not leave the visitor on a blank tab. */
const TRACKING_TIMEOUT_MS = 2500;

export interface OutboundWindow {
  /** Point the opened tab at the tracked URL. */
  send(url: string): void;
}

/**
 * Opens a blank tab within the user gesture. Returns null when the browser
 * blocked it — the caller must then let the plain link proceed normally rather
 * than redirecting the current tab.
 */
export function openOutboundTab(): OutboundWindow | null {
  const w = window.open('', '_blank');
  if (!w) return null;

  // Same protection `noopener` would give, without losing the handle.
  try {
    w.opener = null;
  } catch {
    /* cross-origin or locked down; the tab is still ours to redirect */
  }

  return {
    send(url: string) {
      // The visitor may have closed the tab while the tracking call was in flight.
      if (w.closed) return;
      w.location.href = url;
    },
  };
}

/** Resolves to the tracked URL, or to `fallback` if tracking is slow or fails. */
export async function resolveWithTimeout(
  tracked: Promise<string>,
  fallback: string
): Promise<string> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      tracked,
      new Promise<string>((resolve) => {
        timer = setTimeout(() => resolve(fallback), TRACKING_TIMEOUT_MS);
      }),
    ]);
  } catch {
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
