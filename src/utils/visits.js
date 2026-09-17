import { supabase } from '../firebase';

const SESSION_KEY = 'after-break-session-id';
const SESSION_TS = 'after-break-session-ts';
const SESSION_COUNTED = 'after-break-session-counted';
const SESSION_TTL = 30 * 60 * 1000;
const COUNTER_ID = 'global';

function id() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `v_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

/** One browser session — same tab / 30 minutes, matching After Rain. */
export function readSession() {
  try {
    const now = Date.now();
    const ts = Number(sessionStorage.getItem(SESSION_TS) || 0);
    let sid = sessionStorage.getItem(SESSION_KEY);
    let isNewSession = false;
    if (!sid || !ts || now - ts > SESSION_TTL) {
      sid = id();
      isNewSession = true;
    }
    sessionStorage.setItem(SESSION_KEY, sid);
    sessionStorage.setItem(SESSION_TS, String(now));
    return { sessionId: sid, isNewSession };
  } catch {
    return { sessionId: id(), isNewSession: true };
  }
}

async function loadCount() {
  const { data, error } = await supabase
    .from('visits')
    .select('count')
    .eq('id', COUNTER_ID)
    .maybeSingle();
  if (error) throw error;
  const n = Number(data?.count);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

async function writeCount(count) {
  const { error } = await supabase
    .from('visits')
    .upsert({ id: COUNTER_ID, count });
  if (error) throw error;
}

function wasCounted(sessionId) {
  try {
    return sessionStorage.getItem(SESSION_COUNTED) === sessionId;
  } catch {
    return false;
  }
}

function markCounted(sessionId) {
  try {
    sessionStorage.setItem(SESSION_COUNTED, sessionId);
  } catch {
    /* ignore */
  }
}

/**
 * Read the live Supabase total. Increment by 1 only for a new session
 * that has not already been counted. Never resets the stored number.
 */
async function recordSessionVisit() {
  const { sessionId, isNewSession } = readSession();
  const current = await loadCount();

  if (!isNewSession || wasCounted(sessionId)) return current;

  const next = current + 1;
  await writeCount(next);
  markCounted(sessionId);
  return next;
}

export function ensureVisitCounted() {
  return recordSessionVisit();
}
