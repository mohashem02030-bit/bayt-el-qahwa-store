import { useEffect, useState } from 'react';
import { useCart } from '../cart-context';
import { formatEGP, customizationSummary, buildOrderPayload } from '../utils';
import { PAYMENT_METHODS, INSTAPAY_URL, INSTAPAY_ADDRESS, WALLET_NUMBER } from '../data';
import { createOrder } from '../orders-store';
import type { CheckoutInfo, PaymentMethod } from '../types';
import { X, Minus, Plus, Trash2, ShoppingBag, Store, Truck, Copy, Check, Banknote, Smartphone, ExternalLink } from 'lucide-react';

const EMPTY_INFO: CheckoutInfo = {
  name: '',
  phone: '',
  mode: 'delivery',
  address: '',
  notes: '',
  payment: 'cash',
  paymentRef: '',
};

const PAYMENT_ICONS: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  cash: Banknote,
  instapay: Smartphone,
  wallet: Smartphone,
};

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, count, clear } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [info, setInfo] = useState<CheckoutInfo>(EMPTY_INFO);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setShowCheckout(false);
      setSent(false);
    }
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const canCheckout =
    !!info.name.trim() &&
    /^\d{10,11}$/.test(info.phone.replace(/\s/g, '')) &&
    (info.mode === 'pickup' || !!info.address.trim()) &&
    (info.payment === 'cash' || !!info.paymentRef.trim());

  const handleSend = async () => {
    if (!canCheckout || sending) return;
    setSending(true);
    setSendError(null);
    const result = await createOrder(buildOrderPayload(items, info));
    setSending(false);
    if (!result.ok) {
      setSendError('تعذر إرسال الطلب، جرّب تاني بعد شوية.');
      return;
    }
    clear();
    setSent(true);
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[70] bg-espresso-900/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-[80] flex w-full max-w-md flex-col bg-cream-50 shadow-warm-lg transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-espresso-100 bg-espresso-800 px-5 py-4">
          <div className="flex items-center gap-3 text-cream-50">
            <ShoppingBag className="h-5 w-5 text-gold-400" />
            <div>
              <h3 className="font-display text-lg font-bold">سلة الطلب</h3>
              <p className="text-xs text-cream-100/70">{count} منتج</p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="grid h-9 w-9 place-items-center rounded-full bg-cream-50/10 text-cream-50 transition hover:bg-gold-400 hover:text-espresso-900"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-cream-100 text-espresso-300">
              <ShoppingBag className="h-10 w-10" />
            </span>
            <p className="font-bold text-espresso-700">سلتك لسه فاضية</p>
            <p className="text-sm text-espresso-400">ابدأ اختيار مزاجك من المنيو</p>
            <button onClick={closeCart} className="btn-ghost mt-3">
              تصفح المنيو
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {items.map((item) => (
                <div key={item.uid} className="flex gap-3 rounded-2xl bg-cream-100 p-3 ring-1 ring-espresso-100/60">
                  <img src={item.product.image} alt={item.product.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold leading-tight text-espresso-800">{item.product.name}</h4>
                      <button
                        onClick={() => removeItem(item.uid)}
                        className="text-espresso-300 transition hover:text-red-600"
                        aria-label="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {item.customization && (
                      <p className="mt-0.5 text-[11px] leading-tight text-espresso-400">
                        {customizationSummary(item.customization)}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5 rounded-full bg-cream-50 p-1 ring-1 ring-espresso-100">
                        <button
                          onClick={() => updateQuantity(item.uid, -1)}
                          className="grid h-7 w-7 place-items-center rounded-full text-espresso-600 transition hover:bg-gold-400 hover:text-espresso-900"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.uid, 1)}
                          className="grid h-7 w-7 place-items-center rounded-full text-espresso-600 transition hover:bg-gold-400 hover:text-espresso-900"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-display font-extrabold text-espresso-800">{formatEGP(item.unitPrice * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={clear} className="flex items-center gap-1.5 text-xs font-semibold text-red-600 transition hover:text-red-700">
                <Trash2 className="h-3.5 w-3.5" />
                تفريغ السلة
              </button>
            </div>

            {/* Checkout / Footer */}
            <div className="shrink-0 max-h-[65vh] overflow-y-auto border-t border-espresso-100 bg-cream-50 p-4">
              {sent ? (
                <div className="rounded-2xl bg-green-50 p-4 text-center ring-1 ring-green-200">
                  <Check className="mx-auto h-8 w-8 text-green-600" />
                  <p className="mt-2 font-bold text-green-700">تم استلام طلبك!</p>
                  <p className="mt-1 text-sm text-green-600">طلبك وصل للمحل وهيظهر عند الباريستا فوراً.</p>
                  <button onClick={() => { setSent(false); setShowCheckout(false); closeCart(); }} className="mt-3 text-sm font-bold text-espresso-600 hover:text-espresso-800">
                    تمام
                  </button>
                </div>
              ) : !showCheckout ? (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-bold text-espresso-700">الإجمالي</span>
                    <span className="font-display text-2xl font-extrabold text-espresso-800">{formatEGP(total)}</span>
                  </div>
                  <button onClick={() => setShowCheckout(true)} className="btn-gold w-full text-base">
                    <ShoppingBag className="h-5 w-5" />
                    تأكيد الطلب
                  </button>
                </>
              ) : (
                <CheckoutForm
                  info={info}
                  setInfo={setInfo}
                  total={total}
                  canCheckout={canCheckout}
                  onSend={handleSend}
                  sendError={sendError}
                  sending={sending}
                  onBack={() => setShowCheckout(false)}
                  copied={copied}
                  onCopy={copyToClipboard}
                  PAYMENT_ICONS={PAYMENT_ICONS}
                />
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

interface CheckoutFormProps {
  info: CheckoutInfo;
  setInfo: React.Dispatch<React.SetStateAction<CheckoutInfo>>;
  total: number;
  canCheckout: boolean;
  onSend: () => void;
  sendError: string | null;
  sending: boolean;
  onBack: () => void;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
  PAYMENT_ICONS: Record<PaymentMethod, React.ComponentType<{ className?: string }>>;
}

function CheckoutForm({ info, setInfo, total, canCheckout, onSend, sendError, sending, onBack, copied, onCopy, PAYMENT_ICONS }: CheckoutFormProps) {
  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-bold text-espresso-700">الإجمالي</span>
        <span className="font-display text-xl font-extrabold text-espresso-800">{formatEGP(total)}</span>
      </div>

      <div className="space-y-3">
        <Field label="الاسم بالكامل" required>
          <input
            value={info.name}
            onChange={(e) => setInfo((i) => ({ ...i, name: e.target.value }))}
            placeholder="اكتب اسمك"
            className="input-base"
          />
        </Field>
        <Field label="رقم الموبايل" required>
          <input
            value={info.phone}
            onChange={(e) => setInfo((i) => ({ ...i, phone: e.target.value }))}
            inputMode="tel"
            placeholder="01xxxxxxxxx"
            className="input-base"
          />
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <ModeButton
            active={info.mode === 'delivery'}
            onClick={() => setInfo((i) => ({ ...i, mode: 'delivery' }))}
            icon={Truck}
            label="توصيل دليفري"
          />
          <ModeButton
            active={info.mode === 'pickup'}
            onClick={() => setInfo((i) => ({ ...i, mode: 'pickup' }))}
            icon={Store}
            label="استلام من المحل"
          />
        </div>

        {info.mode === 'delivery' && (
          <Field label="العنوان بالتفصيل" required>
            <textarea
              value={info.address}
              onChange={(e) => setInfo((i) => ({ ...i, address: e.target.value }))}
              placeholder="شبرا الخيمة والمناطق المحيطة..."
              rows={2}
              className="input-base resize-none"
            />
          </Field>
        )}

        {/* Payment method */}
        <Field label="طريقة الدفع" required>
          <div className="grid gap-2">
            {PAYMENT_METHODS.map((m) => {
              const Icon = PAYMENT_ICONS[m.id];
              return (
                <button
                  key={m.id}
                  onClick={() => setInfo((i) => ({ ...i, payment: m.id, paymentRef: '' }))}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-right transition ${
                    info.payment === m.id
                      ? 'border-gold-400 bg-gold-50 ring-2 ring-gold-300/40'
                      : 'border-espresso-100 bg-cream-50 hover:border-gold-300'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0 text-gold-600" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-espresso-800">{m.label}</p>
                    <p className="text-[11px] text-espresso-500">{m.desc}</p>
                  </div>
                  {info.payment === m.id && <Check className="h-4 w-4 text-gold-600" />}
                </button>
              );
            })}
          </div>
        </Field>

        {/* InstaPay details */}
        {info.payment === 'instapay' && (
          <div className="space-y-2 rounded-2xl bg-espresso-800 p-3 text-cream-50">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-cream-100/70">عنوان الحساب</p>
                <p className="font-mono text-sm font-bold text-gold-400" dir="ltr">{INSTAPAY_ADDRESS}</p>
              </div>
              <button
                onClick={() => onCopy(INSTAPAY_ADDRESS, 'instapay')}
                className="flex shrink-0 items-center gap-1 rounded-full bg-cream-50/10 px-3 py-1.5 text-xs font-bold transition hover:bg-gold-400 hover:text-espresso-900"
              >
                {copied === 'instapay' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === 'instapay' ? 'تم النسخ' : 'نسخ العنوان'}
              </button>
            </div>
            <a
              href={INSTAPAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-gold-400 py-2.5 text-sm font-bold text-espresso-900 transition hover:bg-gold-300"
            >
              <ExternalLink className="h-4 w-4" />
              تحويل عبر إنستا باي
            </a>
            <input
              value={info.paymentRef}
              onChange={(e) => setInfo((i) => ({ ...i, paymentRef: e.target.value }))}
              placeholder="اسم صاحب الحساب أو كود التحويل للتحقق"
              className="w-full rounded-xl border-2 border-cream-50/20 bg-espresso-900/60 px-3 py-2.5 text-sm text-cream-50 outline-none transition placeholder:text-cream-100/40 focus:border-gold-400"
            />
          </div>
        )}

        {/* Wallet details */}
        {info.payment === 'wallet' && (
          <div className="space-y-2 rounded-2xl bg-espresso-800 p-3 text-cream-50">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-cream-100/70">رقم المحفظة (فودافون كاش)</p>
                <p className="font-mono text-lg font-bold text-gold-400" dir="ltr">{WALLET_NUMBER}</p>
              </div>
              <button
                onClick={() => onCopy(WALLET_NUMBER, 'wallet')}
                className="flex shrink-0 items-center gap-1 rounded-full bg-cream-50/10 px-3 py-1.5 text-xs font-bold transition hover:bg-gold-400 hover:text-espresso-900"
              >
                {copied === 'wallet' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === 'wallet' ? 'تم النسخ' : 'نسخ الرقم'}
              </button>
            </div>
            <p className="rounded-xl bg-gold-400/15 px-3 py-2 text-[11px] font-medium text-gold-200">
              يرجى تحويل المبلغ الإجمالي ثم إرسال سكرين شوت أو كود العملية.
            </p>
            <input
              value={info.paymentRef}
              onChange={(e) => setInfo((i) => ({ ...i, paymentRef: e.target.value }))}
              placeholder="كود العملية أو ملاحظة التحويل"
              className="w-full rounded-xl border-2 border-cream-50/20 bg-espresso-900/60 px-3 py-2.5 text-sm text-cream-50 outline-none transition placeholder:text-cream-100/40 focus:border-gold-400"
            />
          </div>
        )}

        <Field label="ملاحظات خاصة">
          <textarea
            value={info.notes}
            onChange={(e) => setInfo((i) => ({ ...i, notes: e.target.value }))}
            placeholder="مثلاً: تحميص غامق، سكر زيادة..."
            rows={2}
            className="input-base resize-none"
          />
        </Field>

        {sendError && <p className="text-center text-xs text-red-600">{sendError}</p>}
        <button
          onClick={onSend}
          disabled={!canCheckout || sending}
          className="btn-gold w-full text-base disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          <Check className="h-5 w-5" />
          تأكيد الطلب
        </button>
        {!canCheckout && (
          <p className="text-center text-xs text-red-600">
            {!info.name.trim() || !info.phone.trim()
              ? 'أكمل الاسم ورقم الموبايل.'
              : info.payment !== 'cash' && !info.paymentRef.trim()
                ? 'أدخل مرجع التحويل للتحقق من الدفع.'
                : 'أكمل البيانات المطلوبة.'}
          </p>
        )}
        <button onClick={onBack} className="w-full text-center text-sm font-medium text-espresso-500 hover:text-espresso-700">
          رجوع للسلة
        </button>
      </div>
    </>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-espresso-700">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-3 py-2.5 text-sm font-bold transition ${
        active ? 'border-gold-400 bg-gold-50 text-espresso-800' : 'border-espresso-100 bg-cream-50 text-espresso-500 hover:border-gold-300'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
