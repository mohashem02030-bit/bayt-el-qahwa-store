import { useEffect, useRef, useState } from 'react';
import { useOrders, updateOrderStatus, deleteOrder, clearCompleted, useNow, playChime } from '../orders-store';
import { formatTime, elapsedLabel, formatEGP } from '../utils';
import type { Order, OrderStatus } from '../types';
import { Coffee, Clock, Bike, ShoppingBag, CheckCircle2, ChefHat, BellRing, Trash2, History, ArrowRight, Volume2, VolumeX, LogOut, Phone, MapPin } from 'lucide-react';

const STATUS_FLOW: { id: OrderStatus; label: string; color: string; next: OrderStatus; nextLabel: string }[] = [
  { id: 'pending', label: 'قيد الانتظار', color: 'bg-amber-500', next: 'prep', nextLabel: 'بدء التحضير' },
  { id: 'prep', label: 'جاري التحضير', color: 'bg-blue-500', next: 'ready', nextLabel: 'جاهز للتسليم' },
  { id: 'ready', label: 'جاهز للتسليم', color: 'bg-green-500', next: 'completed', nextLabel: 'تم التسليم' },
];

function reportError(error: string | null) {
  if (error) alert(error);
}

function statusInfo(s: OrderStatus) {
  return STATUS_FLOW.find((x) => x.id === s);
}

export default function BaristaView({ onLogout, onBack }: { onLogout: () => void; onBack: () => void }) {
  const { orders } = useOrders();
  const now = useNow(1000);
  const [soundOn, setSoundOn] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const prevOrderIds = useRef<Set<number>>(new Set());

  // Detect new orders and play chime
  useEffect(() => {
    const currentIds = new Set(orders.map((o) => o.id));
    const newIds = [...currentIds].filter((id) => !prevOrderIds.current.has(id));
    // Only chime for genuinely new orders (not the initial load)
    if (prevOrderIds.current.size > 0 && newIds.length > 0 && soundOn) {
      playChime();
    }
    prevOrderIds.current = currentIds;
  }, [orders, soundOn]);

  const active = orders.filter((o) => o.status !== 'completed');
  const completed = orders.filter((o) => o.status === 'completed');

  const visible = showHistory ? completed : active;

  return (
    <div className="min-h-screen bg-espresso-900 text-cream-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-cream-50/10 bg-espresso-800/95 backdrop-blur-md">
        <div className="container-px flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-b from-gold-400 to-gold-500 text-espresso-900 shadow-gold">
              <Coffee className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <div>
              <h1 className="font-display text-lg font-extrabold">شاشة الباريستا</h1>
              <p className="text-xs text-cream-100/60">Kitchen Display System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <span className="flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1.5 text-xs font-bold text-green-400 ring-1 ring-green-500/30">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              مباشر
            </span>

            <button
              onClick={() => setSoundOn((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full bg-cream-50/10 transition hover:bg-gold-400 hover:text-espresso-900"
              aria-label="الصوت"
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-full bg-red-600/80 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">تسجيل خروج</span>
            </button>

            <button
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-full bg-cream-50/10 px-3 py-2 text-xs font-bold transition hover:bg-gold-400 hover:text-espresso-900"
            >
              <ArrowRight className="h-4 w-4" />
              <span className="hidden sm:inline">الرجوع للمتجر</span>
            </button>

            <button
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center gap-1.5 rounded-full bg-cream-50/10 px-3 py-2 text-xs font-bold transition hover:bg-gold-400 hover:text-espresso-900"
            >
              {showHistory ? <Coffee className="h-4 w-4" /> : <History className="h-4 w-4" />}
              {showHistory ? 'الطلبات النشطة' : `السجل (${completed.length})`}
            </button>
          </div>
        </div>
      </header>

      <main className="container-px py-6">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <span className="grid h-24 w-24 place-items-center rounded-full bg-cream-50/5 text-cream-100/30">
              {showHistory ? <History className="h-12 w-12" /> : <BellRing className="h-12 w-12" />}
            </span>
            <p className="font-display text-xl font-bold text-cream-100/70">
              {showHistory ? 'مفيش طلبات مكتملة بعد' : 'مفيش طلبات دلوقتي — استنى أول طلب'}
            </p>
            <p className="text-sm text-cream-100/50">
              {showHistory ? 'الطلبات المكتملة هتظهر هنا للمراجعة.' : 'أي طلب جديد من الموقع هيظهر هنا فوراً مع نغمة تنبيه.'}
            </p>
          </div>
        ) : (
          <>
            {!showHistory && (
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
                <StatBadge label="انتظار" count={active.filter((o) => o.status === 'pending').length} color="text-amber-400" />
                <StatBadge label="تحضير" count={active.filter((o) => o.status === 'prep').length} color="text-blue-400" />
                <StatBadge label="جاهز" count={active.filter((o) => o.status === 'ready').length} color="text-green-400" />
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((order) => (
                <OrderCard key={order.id} order={order} now={now} completed={showHistory} />
              ))}
            </div>
            {showHistory && completed.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={async () => reportError(await clearCompleted())}
                  className="inline-flex items-center gap-2 rounded-full bg-red-600/80 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  مسح السجل
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function StatBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <span className="flex items-center gap-2 rounded-full bg-cream-50/10 px-4 py-2 font-bold">
      <span className={color}>{count}</span>
      <span className="text-cream-100/70">{label}</span>
    </span>
  );
}

function OrderCard({ order, now, completed }: { order: Order; now: number; completed: boolean }) {
  const elapsed = now - order.createdAt;
  const isOverdue = elapsed > 10 * 60 * 1000; // 10 minutes
  const info = statusInfo(order.status);
  const isDelivery = order.mode === 'delivery';

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border-2 bg-cream-50 p-5 text-espresso-800 shadow-warm transition ${
        isOverdue && !completed ? 'border-red-500 ring-2 ring-red-300/50' : 'border-espresso-100'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-3xl font-extrabold text-espresso-900">#{order.id}</span>
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white ${
                isDelivery ? 'bg-green-600' : 'bg-amber-500'
              }`}
            >
              {isDelivery ? <Bike className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
              {isDelivery ? 'توصيل / دليفري' : 'استلام فوري / تيك أواي'}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-espresso-500">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(order.createdAt)}
          </div>
        </div>
        {!completed && info && (
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold text-white ${info.color}`}>{info.label}</span>
        )}
      </div>

      {/* Timer */}
      {!completed && (
        <div
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${
            isOverdue ? 'bg-red-100 text-red-700' : 'bg-espresso-100 text-espresso-700'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          {elapsedLabel(elapsed)}
          {isOverdue && <span className="text-xs">— متأخر!</span>}
        </div>
      )}

      {/* Customer */}
      <div className="mt-4 rounded-2xl bg-espresso-800/5 p-3">
        <p className="text-sm font-bold text-espresso-800">{order.customerName}</p>
        {order.phone && (
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-espresso-500">
            <Phone className="h-3 w-3" />
            <span dir="ltr">{order.phone}</span>
          </p>
        )}
        {isDelivery && order.address && (
          <p className="mt-0.5 flex items-start gap-1.5 text-xs text-espresso-500">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            {order.address}
          </p>
        )}
        {order.notes && (
          <p className="mt-1 text-xs text-espresso-500">
            <span className="font-bold">ملاحظات: </span>
            {order.notes}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="mt-3 space-y-2">
        {order.lines.map((line, idx) => (
          <div key={idx} className="rounded-2xl border border-espresso-100 p-3">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-lg font-bold text-espresso-900">{line.name}</span>
              <span className="rounded-full bg-gold-400 px-2.5 py-0.5 text-sm font-extrabold text-espresso-900">×{line.quantity}</span>
            </div>
            {line.specs.length > 0 && (
              <ul className="mt-1.5 space-y-0.5">
                {line.specs.map((spec, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-sm text-espresso-600">
                    <span className="h-1 w-1 rounded-full bg-gold-500" />
                    {spec}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-bold text-espresso-700">الإجمالي: {formatEGP(order.total)}</span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            order.payment === 'cash'
              ? 'bg-green-100 text-green-700'
              : order.payment === 'instapay'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-purple-100 text-purple-700'
          }`}
        >
          {order.payment === 'cash' ? 'كاش' : order.payment === 'instapay' ? 'إنستا باي' : 'فودافون كاش'}
        </span>
      </div>
      {order.payment !== 'cash' && order.paymentRef && (
        <p className="mt-1 rounded-xl bg-espresso-100 px-3 py-1.5 text-xs font-semibold text-espresso-600">
          كود/اسم التحويل: <span className="font-bold text-espresso-800">{order.paymentRef}</span>
        </p>
      )}

      {/* Action buttons */}
      {!completed && info && info.id !== 'completed' && (
        <button
          onClick={async () => reportError(await updateOrderStatus(order.id, info.next))}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-espresso-800 py-3 font-display text-base font-bold text-cream-50 transition hover:bg-espresso-700 active:scale-95"
        >
          {info.next === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <ChefHat className="h-5 w-5" />}
          {info.nextLabel}
        </button>
      )}
      {!completed && (
        <button
          onClick={async () => reportError(await deleteOrder(order.id))}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          إلغاء الطلب
        </button>
      )}
    </div>
  );
}
