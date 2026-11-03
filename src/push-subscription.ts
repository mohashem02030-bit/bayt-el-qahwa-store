import { supabase } from './supabase';

const VAPID_PUBLIC_KEY = 'BPSVpHhIIJgg_IyVdRjqDE1EHeDLYqwve3u4Ljvklzqrt9kDoj9ZEZY_uvfSwBfIdQwWxf8jkeEOTB7zorFuC30';
const UNIQUE_VIOLATION = '23505';

export type PushEnableResult = 'subscribed' | 'denied' | 'dismissed' | 'error';

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function base64UrlToKey(base64Url: string): BufferSource {
  const padded = base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0)) as BufferSource;
}

export async function enablePushNotifications(): Promise<PushEnableResult> {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'denied') return 'denied';
    if (permission !== 'granted') return 'dismissed';

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return 'error';

    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToKey(VAPID_PUBLIC_KEY),
      }));

    const json = subscription.toJSON();
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;
    if (!json.endpoint || !p256dh || !auth) return 'error';

    const { error } = await supabase
      .from('push_subscriptions')
      .insert({ endpoint: json.endpoint, p256dh, auth });
    if (error && error.code !== UNIQUE_VIOLATION) return 'error';

    return 'subscribed';
  } catch {
    return 'error';
  }
}
