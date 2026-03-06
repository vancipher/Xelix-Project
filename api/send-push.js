import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Trim all env vars — PowerShell echo adds \r\n which breaks VAPID signing
const VAPID_EMAIL     = (process.env.VAPID_EMAIL        || '').trim();
const VAPID_PUBLIC    = (process.env.VAPID_PUBLIC_KEY   || '').trim();
const VAPID_PRIVATE   = (process.env.VAPID_PRIVATE_KEY  || '').trim();
const PUSH_SECRET     = (process.env.PUSH_SECRET        || '').trim();
const SUPABASE_URL    = (process.env.SUPABASE_URL       || '').trim();
const SUPABASE_KEY    = (process.env.SUPABASE_SERVICE_KEY || '').trim();

webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC, VAPID_PRIVATE);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Basic secret check — the admin UI passes the same secret
  const authHeader = (req.headers['x-push-secret'] || '').trim();
  if (!authHeader || authHeader !== PUSH_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { title, body, url } = req.body ?? {};
  if (!title) return res.status(400).json({ error: 'title required' });

  const { data: rows, error } = await supabase
    .from('push_subscriptions')
    .select('id, subscription');

  if (error) return res.status(500).json({ error: error.message });

  const payload = JSON.stringify({ title, body: body ?? '', url: url ?? '/' });

  const staleIds = [];
  const results = await Promise.allSettled(
    (rows ?? []).map(async ({ id, subscription }) => {
      try {
        await webpush.sendNotification(subscription, payload);
      } catch (err) {
        // 410 Gone / 404 Not Found means the subscription is no longer valid
        if (err.statusCode === 410 || err.statusCode === 404) staleIds.push(id);
        throw err;
      }
    })
  );

  // Prune stale subscriptions
  if (staleIds.length) {
    await supabase.from('push_subscriptions').delete().in('id', staleIds);
  }

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  res.json({ sent, total: rows?.length ?? 0 });
}
