import { supabase } from '../firebase';

const VAPID_PUBLIC_KEY = (import.meta.env.VITE_VAPID_PUBLIC_KEY || '').trim();

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

export async function subscribeToPush() {
  if (!isPushSupported()) return null;
  if (!VAPID_PUBLIC_KEY) { console.warn('VITE_VAPID_PUBLIC_KEY not set'); return null; }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    // Timeout so we never hang forever waiting for the SW
    const reg = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Service worker timed out')), 10000)
      ),
    ]);

    // Return existing subscription if already subscribed
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Persist to Supabase (upsert by endpoint to avoid duplicates)
    const { error } = await supabase.from('push_subscriptions').upsert(
      { endpoint: sub.endpoint, subscription: sub.toJSON() },
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

/** Called by the admin after posting an event */
export async function sendEventPushNotification({ title, body, url = '/' }) {
  try {
    const secret = import.meta.env.VITE_PUSH_SECRET;
    const res = await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-push-secret': secret ?? '' },
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
