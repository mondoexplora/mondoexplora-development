'use client';

/** Stable anonymous browser session id (localStorage). */
export function getOrCreateMxSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('mx_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('mx_session_id', id);
  }
  return id;
}

/** Second stable id for analytics joins (optional). */
export function getOrCreateMxAnonUserId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('mx_anon_user_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('mx_anon_user_id', id);
  }
  return id;
}

export function getStoredVisitId(sessionId: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`mx_visit_id_${sessionId}`);
}

export function setStoredVisitId(sessionId: string, visitId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`mx_visit_id_${sessionId}`, visitId);
}
