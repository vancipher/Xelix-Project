import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ensureVisitCounted } from '../../utils/visits';

/** Counts one visit per browser session (After Rain). Skips admin screens. */
export default function VisitTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    ensureVisitCounted().catch(() => {});
  }, [pathname]);

  return null;
}
