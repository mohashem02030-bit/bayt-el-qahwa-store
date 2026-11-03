import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { CartItem, Product, Customization } from './types';

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  total: number;
  count: number;
  addItem: (product: Product, quantity?: number, customization?: Customization, unitPrice?: number) => void;
  removeItem: (uid: string) => void;
  updateQuantity: (uid: string, delta: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function buildUid(product: Product, customization?: Customization) {
  if (!customization) return `${product.id}:std`;
  if (customization.kind === 'bean') {
    return `${product.id}:${customization.weight}-${customization.roast}-${customization.grind}-${customization.spice}`;
  }
  return `${product.id}:${customization.size}-${customization.sugar}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback(
    (product: Product, quantity = 1, customization?: Customization, unitPrice?: number) => {
      const uid = buildUid(product, customization);
      setItems((prev) => {
        const existing = prev.find((i) => i.uid === uid);
        if (existing) {
          return prev.map((i) => (i.uid === uid ? { ...i, quantity: i.quantity + quantity } : i));
        }
        return [...prev, { uid, product, quantity, customization, unitPrice: unitPrice ?? product.price }];
      });
      setIsOpen(true);
    },
    [],
  );

  const removeItem = useCallback((uid: string) => {
    setItems((prev) => prev.filter((i) => i.uid !== uid));
  }, []);

  const updateQuantity = useCallback((uid: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.uid === uid ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value: CartContextValue = {
    items,
    isOpen,
    total,
    count,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    openCart,
    closeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
