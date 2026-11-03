import { useEffect, useState, useRef } from 'react';
import type { Product, DrinkCustomization } from '../types';
import { DRINK_SIZE_OPTIONS, SUGAR_OPTIONS, drinkUnitPrice } from '../data';
import { formatEGP } from '../utils';
import { useCart } from '../cart-context';
import { X, Check } from 'lucide-react';

interface Props {
  product: Product | null;
  onClose: () => void;
}

const DEFAULT_DRINK: DrinkCustomization = { kind: 'drink', size: 'single', sugar: 'medium' };

export default function DrinkModal({ product, onClose }: Props) {
  const { addItem } = useCart();
  const [custom, setCustom] = useState<DrinkCustomization>(DEFAULT_DRINK);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      setCustom({ ...DEFAULT_DRINK, size: product.hasDouble ? 'single' : 'single' });
      setQty(1);
      setAdded(false);
      scrollRef.current?.scrollTo(0, 0);
    }
  }, [product]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!product) return null;

  const showSize = product.hasDouble === true;
  const unit = drinkUnitPrice(product, custom);
  const total = unit * qty;

  const handleAdd = () => {
    addItem(product, qty, custom, unit);
    setAdded(true);
    setTimeout(onClose, 600);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 animate-fade-in bg-espresso-900/70 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={scrollRef}
        className="relative max-h-[92vh] w-full max-w-md animate-slide-in overflow-y-auto rounded-t-3xl bg-cream-50 shadow-warm-lg sm:rounded-3xl"
      >
        {/* Header image */}
        <div className="relative h-36 w-full overflow-hidden sm:h-44">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/80 to-transparent" />
          <button
            onClick={onClose}
            className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-espresso-900/50 text-cream-50 backdrop-blur-sm transition hover:bg-espresso-900"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 right-4 text-right">
            <h3 className="font-display text-xl font-extrabold text-cream-50 sm:text-2xl">{product.name}</h3>
            <p className="text-xs text-cream-100/80">جهّز طلبك بالضبط على مزاجك</p>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {/* Size (only when double option exists on this product) */}
          {showSize && (
            <Group label="الحجم">
              <div className="grid grid-cols-2 gap-2">
                {DRINK_SIZE_OPTIONS.map((s) => (
                  <OptionChip
                    key={s.id}
                    active={custom.size === s.id}
                    onClick={() => setCustom((c) => ({ ...c, size: s.id }))}
                  >
                    <span className="font-bold">{s.label}</span>
                    <span className="text-xs text-gold-600">
                      {formatEGP(s.id === 'double' && product.doublePrice ? product.doublePrice : product.price)}
                    </span>
                  </OptionChip>
                ))}
              </div>
            </Group>
          )}

          {/* Sugar */}
          <Group label="السكر">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SUGAR_OPTIONS.map((s) => (
                <OptionChip
                  key={s.id}
                  active={custom.sugar === s.id}
                  onClick={() => setCustom((c) => ({ ...c, sugar: s.id }))}
                >
                  {s.label}
                </OptionChip>
              ))}
            </div>
          </Group>

          {/* Quantity + total */}
          <div className="flex items-center justify-between rounded-2xl bg-espresso-800 p-4 text-cream-50">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-cream-100">الكمية</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-8 w-8 place-items-center rounded-full bg-cream-50/10 font-bold transition hover:bg-gold-400 hover:text-espresso-900"
                >
                  −
                </button>
                <span className="w-8 text-center font-display text-lg font-bold">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-cream-50/10 font-bold transition hover:bg-gold-400 hover:text-espresso-900"
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-left">
              <p className="text-xs text-cream-100/70">الإجمالي</p>
              <p className="font-display text-2xl font-extrabold text-gold-400">{formatEGP(total)}</p>
            </div>
          </div>

          <button onClick={handleAdd} className="btn-gold w-full text-base">
            {added ? (
              <>
                <Check className="h-5 w-5" /> تمت الإضافة للسلة
              </>
            ) : (
              'إضافة للطلب'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-espresso-700">{label}</p>
      {children}
    </div>
  );
}

function OptionChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-row items-center justify-between rounded-2xl border-2 p-3 text-right transition-all duration-200 ${
        active ? 'border-gold-400 bg-gold-50 ring-2 ring-gold-300/40' : 'border-espresso-100 bg-cream-50 hover:border-gold-300'
      }`}
    >
      {children}
      {active && <Check className="h-4 w-4 shrink-0 text-gold-600" />}
    </button>
  );
}
