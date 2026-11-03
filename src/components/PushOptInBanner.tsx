import { useState } from 'react';
import { Bell, BellRing, Check, Coffee, Sparkles, Tag } from 'lucide-react';
import { enablePushNotifications, isPushSupported, type PushEnableResult } from '@/push-subscription';

const DISMISS_KEY = 'bq_push_dismissed';

type Status = 'idle' | 'working' | 'subscribed' | 'denied' | 'error';

function shouldShowBanner(): boolean {
  if (!isPushSupported()) return false;
  if (Notification.permission !== 'default') return false;
  try {
    return !localStorage.getItem(DISMISS_KEY);
  } catch {
    return true;
  }
}

const RESULT_TO_STATUS: Record<PushEnableResult, Status> = {
  subscribed: 'subscribed',
  denied: 'denied',
  dismissed: 'idle',
  error: 'error',
};

const PERKS = [
  { icon: Coffee, label: 'أول من يعرف بالتوليفات الجديدة' },
  { icon: Tag, label: 'عروض حصرية للمشتركين' },
];

export default function PushOptInBanner() {
  const [visible, setVisible] = useState(shouldShowBanner);
  const [status, setStatus] = useState<Status>('idle');

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  const enable = async () => {
    setStatus('working');
    const result = await enablePushNotifications();
    setStatus(RESULT_TO_STATUS[result]);
  };

  const subscribed = status === 'subscribed';

  return (
    <section className="bg-cream-50 pb-12 sm:pb-16">
      <div className="container-px">
        <div className="relative overflow-hidden rounded-3xl bg-cream-100 p-6 shadow-warm ring-1 ring-espresso-100 sm:p-8 md:flex md:items-center md:justify-between md:gap-8">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-gold-400 to-gold-500 text-espresso-900 shadow-gold">
              {subscribed ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
            </span>
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-600">
                <Sparkles className="h-3.5 w-3.5" /> إشعارات بيت القهوة
              </span>
              <h2 className="mt-1 font-display text-xl font-extrabold text-espresso-800 sm:text-2xl">
                ما تفوّتش أي توليفة جديدة ولا عرض
              </h2>
              <ul className="mt-3 space-y-1.5">
                {PERKS.map((perk) => (
                  <li key={perk.label} className="flex items-center gap-2 text-sm text-espresso-600">
                    <perk.icon className="h-4 w-4 text-gold-600" />
                    {perk.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 md:mt-0 md:shrink-0">
            {subscribed ? (
              <p className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800 ring-1 ring-green-200">
                <Check className="h-4 w-4" /> تمام! هنبعتلك أول بأول أخبار التوليفات والعروض.
              </p>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <button
                  onClick={enable}
                  disabled={status === 'working'}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-espresso-800 px-6 py-3 text-sm font-bold text-cream-50 shadow-warm transition hover:bg-espresso-700 active:scale-95 disabled:opacity-60"
                >
                  <Bell className="h-4 w-4 text-gold-400" />
                  {status === 'working' ? 'جاري التفعيل...' : 'فعّل الإشعارات'}
                </button>
                <button
                  onClick={dismiss}
                  className="rounded-full px-6 py-3 text-sm font-semibold text-espresso-600 transition hover:bg-espresso-100 hover:text-espresso-800"
                >
                  مش دلوقتي
                </button>
              </div>
            )}

            {status === 'denied' && (
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-red-700">
                الإشعارات متقفلة من إعدادات المتصفح. تقدر تفعّلها من هناك في أي وقت.
              </p>
            )}
            {status === 'error' && (
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-red-700">
                حصلت مشكلة ومقدرناش نفعّل الإشعارات. جرّب تاني بعد شوية.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
