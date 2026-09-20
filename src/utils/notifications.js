import { supabase } from '../firebase';

const VAPID_PUBLIC_KEY = (import.meta.env.VITE_VAPID_PUBLIC_KEY || '').trim();

/** Canonical After Break hosts — Xelix / other origins are not push targets */
export const AFTERBREAK_PUSH_ORIGINS = new Set([
  'https://afterbreak.afterain.dev',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

const APP_ID = 'afterbreak';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function getNotifPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

export function isAfterBreakPushOrigin(origin = window.location.origin) {
  return AFTERBREAK_PUSH_ORIGINS.has(origin.replace(/\/$/, ''));
}

function toPushSubscriptionJSON(subscription) {
  if (!subscription || typeof subscription !== 'object') return null;
  const { endpoint, expirationTime, keys } = subscription;
  if (!endpoint || !keys?.p256dh || !keys?.auth) return null;
  return { endpoint, expirationTime: expirationTime ?? null, keys };
}

/** Strip legacy Xelix subscriptions from this browser and the DB when opened on a non-After Break host */
async function revokeLocalPushIfWrongOrigin() {
  if (!isPushSupported()) return;
  if (isAfterBreakPushOrigin()) return;

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;

    await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
    await sub.unsubscribe();
  } catch (err) {
    console.warn('Failed to revoke legacy push subscription:', err);
  }
}

export async function subscribeToPush() {
  if (!isPushSupported()) return null;
  if (!VAPID_PUBLIC_KEY) { console.warn('VITE_VAPID_PUBLIC_KEY not set'); return null; }

  // Never register push from the old Xelix URL (or any non-canonical host)
  if (!isAfterBreakPushOrigin()) {
    await revokeLocalPushIfWrongOrigin();
    console.warn('Push subscribe blocked: not an After Break origin', window.location.origin);
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const reg = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Service worker timed out')), 10000)
      ),
    ]);

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const pushJson = toPushSubscriptionJSON(sub.toJSON());
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        endpoint: sub.endpoint,
        // origin/app live inside subscription JSON so no DB migration is required
        subscription: {
          ...pushJson,
          origin: window.location.origin,
          app: APP_ID,
        },
      },
      { onConflict: 'endpoint' }
    );
    if (error) console.error('Failed to save push subscription:', error.message);

    return sub;
  } catch (err) {
    console.error('subscribeToPush error:', err);
    return null;
  }
}

export async function unsubscribeFromPush() {
  if (!isPushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
  await sub.unsubscribe();
}

/**
 * Keep After Break push registration healthy; revoke push if this tab is on a legacy Xelix host.
 * Safe to call on every app load.
 */
export async function syncPushSubscription() {
  if (!isPushSupported()) return;

  if (!isAfterBreakPushOrigin()) {
    await revokeLocalPushIfWrongOrigin();
    return;
  }

  if (getNotifPermission() !== 'granted') return;
  await subscribeToPush();
}

/** Called by the admin after posting an event */
export async function sendEventPushNotification({ title, body, url = '/' }) {
  try {
    const secret = (import.meta.env.VITE_PUSH_SECRET || '').trim();
    const res = await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-push-secret': secret },

      body: JSON.stringify({ title, body, url }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Push send failed:', err);
    }
  } catch (e) {
    console.error('Push send error:', e);
  }
}
