import { useMemo, useState } from 'react';
import { useProducts } from '../products-store';
import { createOrder } from '../orders-store';
import { useAuth } from '../auth-context';
import {
  WEIGHT_OPTIONS,
  ROAST_OPTIONS,
  GRIND_OPTIONS,
  SPICE_OPTIONS,
  DRINK_SIZE_OPTIONS,
  SUGAR_OPTIONS,
  CATEGORIES,
  beanUnitPrice,
  drinkUnitPrice,
  PAYMENT_METHODS,
} from '../data';
import { formatEGP, customizationSummary } from '../utils';
import CashierReceiptPreview from './CashierReceiptPreview';
import type { Product, BeanCustomization, DrinkCustomization, Customization, PaymentMethod, OrderLine } from '../types';
import {
  ArrowRight, LogOut, Search, Plus, Minus, Trash2, X, Check,
  ShoppingCart, CreditCard, Receipt, Coffee, User as UserIcon, Printer,
} from 'lucide-react';

interface CartEntry {
  uid: string;
  product: Product;
  quantity: number;
  customization?: Customization;
  unitPrice: number;
}

let uidCounter = 0;
function nextUid() {
  uidCounter += 1;
  return `pos-${uidCounter}`;
}

function lineSpecs(custom: Customization): string[] {
  if (custom.kind === 'bean') {
    const w = WEIGHT_OPTIONS.find((o) => o.id === custom.weight)?.label ?? custom.weight;
    const r = ROAST_OPTIONS.find((o) => o.id === custom.roast)?.label ?? custom.roast;
    const g = GRIND_OPTIONS.find((o) => o.id === custom.grind)?.label ?? custom.grind;
    const s = SPICE_OPTIONS.find((o) => o.id === custom.spice)?.label ?? custom.spice;
    return [`الوزن: ${w}`, `التحميص: ${r}`, `الطحن: ${g}`, `المحوجات: ${s}`];
  }
  const size = DRINK_SIZE_OPTIONS.find((o) => o.id === custom.size)?.label ?? custom.size;
  const sugar = SUGAR_OPTIONS.find((o) => o.id === custom.sugar)?.label ?? custom.sugar;
  return [`الحجم: ${size}`, `السكر: ${sugar}`];
}

export default function CashierView({ onLogout, onBack }: { onLogout: () => void; onBack: () => void }) {
  const products = useProducts();
  const { cashierName } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<'all' | 'beans' | 'hot' | 'cold'>('all');
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [mode, setMode] = useState<'pickup' | 'delivery'>('pickup');
  const [showCheckout, setShowCheckout] = useState(false);
  const [receipt, setReceipt] = useState<{ id: number; total: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = products.filter((p) => !p.isOffer);
    if (activeCat !== 'all') list = list.filter((p) => p.category === activeCat);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return list;
  }, [products, activeCat, search]);

  const total = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);

  const addToCart = (product: Product, quantity: number, customization: Customization | undefined, unitPrice: number) => {
    setCart((prev) => {
      const key = `${product.id}-${customization ? JSON.stringify(customization) : 'none'}-${unitPrice}`;
      const existing = prev.find((e) => e.uid === key);
      if (existing) {
        return prev.map((e) => (e.uid === key ? { ...e, quantity: e.quantity + quantity } : e));
      }
      return [...prev, { uid: key, product, quantity, customization, unitPrice }];
    });
  };

  const updateQty = (uid: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((e) => (e.uid === uid ? { ...e, quantity: e.quantity + delta } : e))
        .filter((e) => e.quantity > 0),
    );
  };

  const removeEntry = (uid: string) => setCart((prev) => prev.filter((e) => e.uid !== uid));

  const buildOrderLines = (): OrderLine[] =>
    cart.map((e) => ({
      name: e.product.name,
      quantity: e.quantity,
      unitPrice: e.unitPrice,
      specs: e.customization ? lineSpecs(e.customization) : [],
    }));

  const handleCheckout = async () => {
    if (cart.length === 0 || saving) return;
    const lines = buildOrderLines();
    setSaving(true);
    const result = await createOrder({
      customerName: customerName.trim() || 'عميل كاشير',
      phone: '',
      mode,
      address: '',
      notes: `طلب كاشير — ${cashierName ?? 'كاشير'}`,
      payment,
      paymentRef: '',
      total,
      lines,
    });
    setSaving(false);
    if (!result.ok) {
      alert('تعذر حفظ الطلب، جرّب تاني.');
      return;
    }
    setReceipt({ id: result.order.id, total });
    setCart([]);
    setCustomerName('');
    setShowCheckout(false);
    setPayment('cash');
    setMode('pickup');
  };

  return (
    <div className="flex min-h-screen flex-col bg-espresso-900 text-cream-50 lg:flex-row">
      {/* ── Top bar (mobile) / Sidebar header (desktop) ───────────────────── */}
      <header className="sticky top-0 z-40 border-b border-cream-50/10 bg-espresso-800/95 backdrop-blur-md lg:fixed lg:left-0 lg:top-0 lg:z-50 lg:h-screen lg:w-80 lg:border-b-0 lg:border-l lg:border-cream-50/10">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:flex-col lg:items-stretch lg:gap-4 lg:overflow-y-auto lg:py-5">
          {/* Brand + cashier name */}
          <div className="flex items-center gap-3 lg:flex-col lg:items-center lg:text-center">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-gold-400 to-gold-500 text-espresso-900 shadow-gold">
              <Coffee className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <div>
              <h1 className="font-display text-lg font-extrabold lg:text-xl">الكاشير</h1>
              <p className="text-xs text-cream-100/60 lg:mt-1">{cashierName ?? 'نقطة بيع'}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 lg:flex-col lg:gap-2">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-full bg-cream-50/10 px-3 py-2 text-xs font-bold transition hover:bg-gold-400 hover:text-espresso-900"
            >
              <ArrowRight className="h-4 w-4" />
              <span className="hidden sm:inline">المتجر</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-full bg-red-600/80 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>

          {/* Search — desktop only in sidebar */}
          <div className="hidden lg:block">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-100/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن صنف..."
                className="w-full rounded-full border border-cream-50/15 bg-espresso-900/60 py-2.5 pr-10 pl-4 text-sm text-cream-50 outline-none transition focus:border-gold-400"
              />
            </div>
          </div>

          {/* Category filter — desktop */}
          <div className="hidden lg:flex lg:flex-col lg:gap-1.5">
            {CATEGORIES.filter((c) => c.id === 'all' || c.id === 'beans' || c.id === 'hot' || c.id === 'cold').map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id as typeof activeCat)}
                className={`rounded-full px-4 py-2.5 text-sm font-bold transition ${
                  activeCat === cat.id
                    ? 'bg-gradient-to-b from-gold-400 to-gold-500 text-espresso-900 shadow-gold'
                    : 'bg-cream-50/5 text-cream-100/70 hover:bg-cream-50/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Product grid ────────────────────────────────────────────────────── */}
      <main className="flex-1 pb-32 lg:ml-80 lg:mr-96 lg:pb-0">
        {/* Mobile search + filter */}
        <div className="sticky top-[57px] z-30 space-y-3 border-b border-cream-50/10 bg-espresso-800/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-100/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن صنف..."
              className="w-full rounded-full border border-cream-50/15 bg-espresso-900/60 py-2.5 pr-10 pl-4 text-sm text-cream-50 outline-none transition focus:border-gold-400"
            />
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.filter((c) => c.id === 'all' || c.id === 'beans' || c.id === 'hot' || c.id === 'cold').map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id as typeof activeCat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                  activeCat === cat.id
                    ? 'bg-gradient-to-b from-gold-400 to-gold-500 text-espresso-900'
                    : 'bg-cream-50/5 text-cream-100/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="container-px py-5">
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-cream-100/40">
              <Coffee className="mx-auto h-12 w-12" />
              <p className="mt-3 font-bold">مفيش أصناف مطابقة</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setModalProduct(product)}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-espresso-800 text-right ring-1 ring-cream-50/10 transition hover:ring-gold-400"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                    <span className="absolute bottom-2 right-2 rounded-full bg-espresso-900/80 px-2.5 py-1 text-xs font-bold text-gold-400 backdrop-blur-sm">
                      {formatEGP(product.price)}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <p className="line-clamp-2 text-xs font-bold leading-snug text-cream-50">{product.name}</p>
                    {product.isBean && <span className="mt-1 block text-[10px] font-bold text-gold-500/70">بن ومطحن</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Floating cart bar (mobile) / Fixed cart panel (desktop) ────────── */}
      {/* Mobile: bottom bar */}
      {cart.length > 0 && !showCheckout && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-cream-50/10 bg-espresso-800 px-4 py-3 lg:hidden">
          <button
            onClick={() => setShowCheckout(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-b from-gold-400 to-gold-500 px-5 py-3 font-bold text-espresso-900 shadow-gold active:scale-[0.98]"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {count} صنف
            </span>
            <span className="font-display text-lg">{formatEGP(total)}</span>
          </button>
        </div>
      )}

      {/* Desktop: fixed cart panel */}
      <div className="hidden lg:flex lg:fixed lg:bottom-0 lg:right-0 lg:top-0 lg:z-40 lg:w-96 lg:flex-col lg:border-r lg:border-cream-50/10 lg:bg-espresso-800">
        <CartPanel
          cart={cart}
          total={total}
          count={count}
          customerName={customerName}
          setCustomerName={setCustomerName}
          payment={payment}
          setPayment={setPayment}
          mode={mode}
          setMode={setMode}
          onQty={updateQty}
          onRemove={removeEntry}
          onCheckout={handleCheckout}
          onPreview={() => setPreviewOpen(true)}
          onClear={() => setCart([])}
          showCheckout={showCheckout}
          setShowCheckout={setShowCheckout}
        />
      </div>

      {/* Mobile: checkout overlay */}
      {showCheckout && (
        <div className="fixed inset-0 z-[60] flex items-end lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-espresso-900/70 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
          <div className="relative max-h-[88vh] w-full animate-slide-in overflow-y-auto rounded-t-3xl bg-espresso-800 shadow-warm-lg">
            <div className="sticky top-0 flex items-center justify-between border-b border-cream-50/10 bg-espresso-800 px-5 py-4">
              <h3 className="font-display text-lg font-extrabold text-cream-50">إتمام الطلب</h3>
              <button onClick={() => setShowCheckout(false)} className="grid h-9 w-9 place-items-center rounded-full bg-cream-50/10 text-cream-50">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <CartPanelContent
                cart={cart}
                total={total}
                customerName={customerName}
                setCustomerName={setCustomerName}
                payment={payment}
                setPayment={setPayment}
                mode={mode}
                setMode={setMode}
                onQty={updateQty}
                onRemove={removeEntry}
                onCheckout={handleCheckout}
                onPreview={() => setPreviewOpen(true)}
                onClear={() => setCart([])}
              />
            </div>
          </div>
        </div>
      )}

      {previewOpen && (
        <CashierReceiptPreview
          lines={buildOrderLines()}
          total={total}
          customerName={customerName}
          cashierName={cashierName}
          payment={payment}
          mode={mode}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {/* Customization modal */}
      {modalProduct && (
        <CashierProductModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onAdd={(qty, custom, unitPrice) => {
            addToCart(modalProduct, qty, custom, unitPrice);
            setModalProduct(null);
          }}
        />
      )}

      {/* Receipt confirmation */}
      {receipt && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 animate-fade-in bg-espresso-900/80 backdrop-blur-sm" onClick={() => setReceipt(null)} />
          <div className="relative w-full max-w-sm animate-scale-in rounded-3xl bg-cream-50 p-6 text-center shadow-warm-lg">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100 text-green-600">
              <Check className="h-8 w-8" />
            </span>
            <h3 className="mt-4 font-display text-xl font-extrabold text-espresso-800">تم استلام الطلب!</h3>
            <p className="mt-2 text-sm text-espresso-500">
              رقم الطلب <span className="font-display text-lg font-extrabold text-espresso-800">#{receipt.id}</span>
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold text-gold-600">{formatEGP(receipt.total)}</p>
            <p className="mt-2 text-xs text-espresso-400">الطلب اتبعت لشاشة الباريستا.</p>
            <button onClick={() => setReceipt(null)} className="btn-gold mt-5 w-full">
              طلب جديد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Desktop cart panel wrapper ──────────────────────────────────────────────

function CartPanel(props: {
  cart: CartEntry[];
  total: number;
  count: number;
  customerName: string;
  setCustomerName: (v: string) => void;
  payment: PaymentMethod;
  setPayment: (v: PaymentMethod) => void;
  mode: 'pickup' | 'delivery';
  setMode: (v: 'pickup' | 'delivery') => void;
  onQty: (uid: string, delta: number) => void;
  onRemove: (uid: string) => void;
  onCheckout: () => void;
  onPreview: () => void;
  onClear: () => void;
  showCheckout: boolean;
  setShowCheckout: (v: boolean) => void;
}) {
  return (
    <>
      <div className="border-b border-cream-50/10 px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-extrabold text-cream-50">
            <ShoppingCart className="h-5 w-5 text-gold-400" />
            الطلب الحالي
          </h3>
          {props.cart.length > 0 && (
            <button onClick={props.onClear} className="text-xs font-bold text-red-400 transition hover:text-red-300">
              تفريغ
            </button>
          )}
        </div>
      </div>
      <CartPanelContent {...props} />
    </>
  );
}

function CartPanelContent({
  cart,
  total,
  customerName,
  setCustomerName,
  payment,
  setPayment,
  mode,
  setMode,
  onQty,
  onRemove,
  onCheckout,
  onPreview,
}: {
  cart: CartEntry[];
  total: number;
  customerName: string;
  setCustomerName: (v: string) => void;
  payment: PaymentMethod;
  setPayment: (v: PaymentMethod) => void;
  mode: 'pickup' | 'delivery';
  setMode: (v: 'pickup' | 'delivery') => void;
  onQty: (uid: string, delta: number) => void;
  onRemove: (uid: string) => void;
  onCheckout: () => void;
  onPreview: () => void;
  onClear: () => void;
}) {
  return (
    <>
      {/* Cart items */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center text-cream-100/30">
            <ShoppingCart className="h-10 w-10" />
            <p className="text-sm font-bold">الطلب فاضي</p>
            <p className="text-xs">اضغط على صنف لإضافته</p>
          </div>
        ) : (
          cart.map((entry) => (
            <div key={entry.uid} className="rounded-2xl bg-espresso-700/50 p-3 ring-1 ring-cream-50/5">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold leading-snug text-cream-50">{entry.product.name}</h4>
                <button onClick={() => onRemove(entry.uid)} className="shrink-0 text-cream-100/40 transition hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {entry.customization && (
                <p className="mt-0.5 text-[11px] leading-tight text-cream-100/50">{customizationSummary(entry.customization)}</p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 rounded-full bg-espresso-900/60 p-1">
                  <button
                    onClick={() => onQty(entry.uid, -1)}
                    className="grid h-7 w-7 place-items-center rounded-full text-cream-100 transition hover:bg-gold-400 hover:text-espresso-900"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{entry.quantity}</span>
                  <button
                    onClick={() => onQty(entry.uid, 1)}
                    className="grid h-7 w-7 place-items-center rounded-full text-cream-100 transition hover:bg-gold-400 hover:text-espresso-900"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="font-display text-sm font-bold text-gold-400">{formatEGP(entry.unitPrice * entry.quantity)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Checkout section */}
      {cart.length > 0 && (
        <div className="border-t border-cream-50/10 p-4">
          {/* Customer name */}
          <div className="mb-3">
            <label className="mb-1 block text-xs font-bold text-cream-100/60">اسم العميل (اختياري)</label>
            <div className="relative">
              <UserIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-100/40" />
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="عميل كاشير"
                className="w-full rounded-xl border border-cream-50/15 bg-espresso-900/60 py-2.5 pr-10 pl-4 text-sm text-cream-50 outline-none transition focus:border-gold-400"
              />
            </div>
          </div>

          {/* Mode */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode('pickup')}
              className={`rounded-xl py-2.5 text-sm font-bold transition ${
                mode === 'pickup' ? 'bg-gold-400 text-espresso-900' : 'bg-cream-50/5 text-cream-100/70'
              }`}
            >
              استلام من المحل
            </button>
            <button
              onClick={() => setMode('delivery')}
              className={`rounded-xl py-2.5 text-sm font-bold transition ${
                mode === 'delivery' ? 'bg-gold-400 text-espresso-900' : 'bg-cream-50/5 text-cream-100/70'
              }`}
            >
              توصيل
            </button>
          </div>

          {/* Payment */}
          <div className="mb-3">
            <label className="mb-1 block text-xs font-bold text-cream-100/60">طريقة الدفع</label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={`rounded-xl py-2 text-xs font-bold transition ${
                    payment === m.id ? 'bg-gold-400 text-espresso-900' : 'bg-cream-50/5 text-cream-100/70'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Total + checkout */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-cream-100/70">الإجمالي</span>
            <span className="font-display text-2xl font-extrabold text-gold-400">{formatEGP(total)}</span>
          </div>
          <button
            onClick={onPreview}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-cream-50/5 py-3 text-sm font-bold text-cream-100 ring-1 ring-cream-50/15 transition hover:bg-cream-50/10"
          >
            <Printer className="h-4 w-4" />
            معاينة الفاتورة
          </button>
          <button onClick={onCheckout} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold-400 to-gold-500 py-3.5 font-display text-base font-bold text-espresso-900 shadow-gold transition active:scale-[0.98]">
            <Receipt className="h-5 w-5" />
            تأكيد الطلب
          </button>
        </div>
      )}
    </>
  );
}

// ── Product customization modal ─────────────────────────────────────────────

function CashierProductModal({
  product,
  onClose,
  onAdd,
}: {
  product: Product;
  onClose: () => void;
  onAdd: (qty: number, custom: Customization | undefined, unitPrice: number) => void;
}) {
  const [qty, setQty] = useState(1);

  // Bean customization state
  const [bean, setBean] = useState<BeanCustomization>({
    kind: 'bean',
    weight: '125g',
    roast: 'medium',
    grind: 'whole',
    spice: 'plain',
  });

  // Drink customization state
  const [drink, setDrink] = useState<DrinkCustomization>({
    kind: 'drink',
    size: 'single',
    sugar: 'medium',
  });

  const isBean = product.isBean === true;
  const custom = isBean ? bean : drink;
  const unitPrice = isBean ? beanUnitPrice(product.price, bean) : drinkUnitPrice(product, drink);
  const total = unitPrice * qty;

  const handleAdd = () => {
    onAdd(qty, custom, unitPrice);
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 animate-fade-in bg-espresso-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[88vh] w-full max-w-lg animate-slide-in overflow-y-auto rounded-t-3xl bg-cream-50 text-espresso-800 shadow-warm-lg sm:rounded-3xl">
        {/* Header */}
        <div className="relative h-32 w-full overflow-hidden sm:h-40">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/80 to-transparent" />
          <button onClick={onClose} className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-espresso-900/50 text-cream-50 backdrop-blur-sm">
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 right-4">
            <h3 className="font-display text-xl font-extrabold text-cream-50">{product.name}</h3>
            <p className="text-xs text-cream-100/80">اختر التخصيص</p>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {isBean ? (
            <>
              {/* Weight */}
              <div>
                <p className="mb-2 text-sm font-bold text-espresso-700">الوزن</p>
                <div className="grid grid-cols-2 gap-2">
                  {WEIGHT_OPTIONS.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setBean((c) => ({ ...c, weight: w.id }))}
                      className={`flex items-center justify-between rounded-xl border-2 p-3 text-right transition ${
                        bean.weight === w.id ? 'border-gold-400 bg-gold-50' : 'border-espresso-100 bg-cream-50 hover:border-gold-300'
                      }`}
                    >
                      <span className="font-bold text-sm">{w.label}</span>
                      <span className="text-xs text-gold-600">{formatEGP(product.price * w.multiplier)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Roast */}
              {!product.isGreenBean && (
                <div>
                  <p className="mb-2 text-sm font-bold text-espresso-700">درجة التحميص</p>
                  <div className="grid grid-cols-3 gap-2">
                    {ROAST_OPTIONS.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setBean((c) => ({ ...c, roast: r.id }))}
                        className={`rounded-xl border-2 px-3 py-2.5 text-center text-sm font-bold transition ${
                          bean.roast === r.id ? 'border-gold-400 bg-gold-50' : 'border-espresso-100 bg-cream-50 hover:border-gold-300'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Grind */}
              <div>
                <p className="mb-2 text-sm font-bold text-espresso-700">درجة الطحن</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {GRIND_OPTIONS.filter((g) => (product.isGreenBean ? g.id === 'whole' : true)).map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setBean((c) => ({ ...c, grind: g.id }))}
                      className={`rounded-xl border-2 px-3 py-2.5 text-center text-sm font-bold transition ${
                        bean.grind === g.id ? 'border-gold-400 bg-gold-50' : 'border-espresso-100 bg-cream-50 hover:border-gold-300'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spice */}
              <div>
                <p className="mb-2 text-sm font-bold text-espresso-700">التحويج</p>
                <div className="grid gap-2">
                  {SPICE_OPTIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setBean((c) => ({ ...c, spice: s.id }))}
                      className={`flex items-center justify-between rounded-xl border-2 p-3 text-right transition ${
                        bean.spice === s.id ? 'border-gold-400 bg-gold-50' : 'border-espresso-100 bg-cream-50 hover:border-gold-300'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-sm">{s.label}</span>
                        <span className="mt-0.5 block text-[11px] text-espresso-500">
                          {s.desc}
                          {s.addOn > 0 && <span className="mr-1 font-bold text-gold-600"> (+{s.addOn} ج.م)</span>}
                        </span>
                      </div>
                      {bean.spice === s.id && <Check className="h-4 w-4 shrink-0 text-gold-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Size */}
              {product.hasDouble && (
                <div>
                  <p className="mb-2 text-sm font-bold text-espresso-700">الحجم</p>
                  <div className="grid grid-cols-2 gap-2">
                    {DRINK_SIZE_OPTIONS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setDrink((c) => ({ ...c, size: s.id }))}
                        className={`flex items-center justify-between rounded-xl border-2 p-3 text-right transition ${
                          drink.size === s.id ? 'border-gold-400 bg-gold-50' : 'border-espresso-100 bg-cream-50 hover:border-gold-300'
                        }`}
                      >
                        <span className="font-bold text-sm">{s.label}</span>
                        <span className="text-xs text-gold-600">
                          {formatEGP(s.id === 'double' && product.doublePrice ? product.doublePrice : product.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugar */}
              <div>
                <p className="mb-2 text-sm font-bold text-espresso-700">السكر</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SUGAR_OPTIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setDrink((c) => ({ ...c, sugar: s.id }))}
                      className={`rounded-xl border-2 px-3 py-2.5 text-center text-sm font-bold transition ${
                        drink.sugar === s.id ? 'border-gold-400 bg-gold-50' : 'border-espresso-100 bg-cream-50 hover:border-gold-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Quantity + total */}
          <div className="flex items-center justify-between rounded-2xl bg-espresso-800 p-4 text-cream-50">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-cream-100">الكمية</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-8 w-8 place-items-center rounded-full bg-cream-50/10 font-bold transition hover:bg-gold-400 hover:text-espresso-900"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-display text-lg font-bold">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-cream-50/10 font-bold transition hover:bg-gold-400 hover:text-espresso-900"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="text-left">
              <p className="text-xs text-cream-100/70">الإجمالي</p>
              <p className="font-display text-xl font-extrabold text-gold-400">{formatEGP(total)}</p>
            </div>
          </div>

          <button onClick={handleAdd} className="btn-gold w-full text-base">
            <Plus className="h-5 w-5" />
            إضافة للطلب
          </button>
        </div>
      </div>
    </div>
  );
}
