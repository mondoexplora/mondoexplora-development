'use client';

import { useEffect } from 'react';
import {
  subscribeConsentChanges,
  syncVisitWithBackend,
} from '@/lib/trackingBackend';

/**
 * Registers / refreshes the server-side visit row when consent or session context changes.
 */
export default function TrackingBootstrap() {
  useEffect(() => {
    void syncVisitWithBackend();
    const off = subscribeConsentChanges(() => {
      void syncVisitWithBackend();
    });
    return off;
  }, []);

  return null;
}
