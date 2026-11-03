import { useEffect, useState } from 'react';
import { Download, Share, X, Smartphone } from 'lucide-react';
import { recordInstallClick } from '@/install-clicks-store';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function InstallAppBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    const timer = window.setTimeout(() => setVisible(true), 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      window.clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => setVisible(false);

  const install = async () => {
    if (!deferred) return;
    void recordInstallClick();
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setDeferred(null);
  };

  const ios = isIos();
  const canInstallNatively = !!deferred;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-espresso-900/70 p-5 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="حمّل تطبيق بيت القهوة"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm animate-slide-in overflow-hidden rounded-3xl bg-espresso-800 p-6 text-center text-cream-50 shadow-warm-lg ring-1 ring-gold-400/30"
      >
        <button
          onClick={dismiss}
          aria-label="إغلاق"
          className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-cream-50/10 text-cream-50 transition hover:bg-gold-400 hover:text-espresso-900"
        >
          <X className="h-4 w-4" />
        </button>

        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-b from-gold-400 to-gold-500 text-espresso-900 shadow-gold">
          <Smartphone className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-display text-xl font-extrabold text-cream-50">حمّل تطبيق بيت القهوة</h2>
        <p className="mt-1 text-sm text-cream-100/70">اطلب أسرع وخلّي المنيو معاك على الموبايل</p>

        {showSteps && (
          <ol className="mt-4 space-y-1.5 rounded-2xl bg-cream-50/5 p-3 text-right text-xs leading-relaxed text-cream-100/90">
            {ios ? (
              <>
                <li>1. اضغط زر المشاركة <Share className="inline h-3.5 w-3.5 align-text-bottom" /> تحت في سفاري</li>
                <li>2. اختار "إضافة إلى الشاشة الرئيسية"</li>
                <li>3. اضغط "إضافة" في الأعلى</li>
              </>
            ) : (
              <>
                <li>1. افتح قائمة المتصفح (الثلاث نقط)</li>
                <li>2. اختار "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"</li>
              </>
            )}
          </ol>
        )}

        <div className="mt-5 space-y-2">
          {canInstallNatively && (
            <button
              onClick={install}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold-400 to-gold-500 py-3 text-sm font-bold text-espresso-900 transition active:scale-95"
            >
              <Download className="h-4 w-4" />
              تحميل التطبيق
            </button>
          )}
          {!canInstallNatively && !showSteps && (
            <button
              onClick={() => {
                void recordInstallClick();
                setShowSteps(true);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold-400 to-gold-500 py-3 text-sm font-bold text-espresso-900 transition active:scale-95"
            >
              <Download className="h-4 w-4" />
              إزاي أحمّله؟
            </button>
          )}
          <button
            onClick={dismiss}
            className="w-full rounded-2xl py-2.5 text-sm font-semibold text-cream-100/70 transition hover:text-cream-50"
          >
            ممكن بعدين
          </button>
        </div>
      </div>
    </div>
  );
}
