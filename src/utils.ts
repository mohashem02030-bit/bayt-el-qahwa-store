import type { BeanCustomization, DrinkCustomization, CartItem, CheckoutInfo, Order, OrderLine, PaymentMethod } from './types';
import {
  WEIGHT_OPTIONS,
  ROAST_OPTIONS,
  GRIND_OPTIONS,
  SPICE_OPTIONS,
  DRINK_SIZE_OPTIONS,
  SUGAR_OPTIONS,
} from './data';

export function formatEGP(amount: number): string {
  return `${amount.toLocaleString('ar-EG')} ج.م`;
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

export function elapsedLabel(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (mins > 0) return `منذ ${mins} د ${secs} ث`;
  return `منذ ${secs} ث`;
}

function beanLabel(c: BeanCustomization): string[] {
  const w = WEIGHT_OPTIONS.find((o) => o.id === c.weight)?.label ?? c.weight;
  const r = ROAST_OPTIONS.find((o) => o.id === c.roast)?.label ?? c.roast;
  const g = GRIND_OPTIONS.find((o) => o.id === c.grind)?.label ?? c.grind;
  const s = SPICE_OPTIONS.find((o) => o.id === c.spice)?.label ?? c.spice;
  return [`الوزن: ${w}`, `التحميص: ${r}`, `الطحن: ${g}`, `المحوجات: ${s}`];
}

function drinkLabel(c: DrinkCustomization): string[] {
  const size = DRINK_SIZE_OPTIONS.find((o) => o.id === c.size)?.label ?? c.size;
  const sugar = SUGAR_OPTIONS.find((o) => o.id === c.sugar)?.label ?? c.sugar;
  return [`الحجم: ${size}`, `السكر: ${sugar}`];
}

export function customizationSummary(c: BeanCustomization | DrinkCustomization): string {
  const lines = c.kind === 'bean' ? beanLabel(c) : drinkLabel(c);
  return lines.join(' · ');
}

/** Build the line items for an order. */
function orderLines(items: CartItem[]): { lines: OrderLine[]; total: number } {
  const lines: OrderLine[] = items.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    specs: item.customization
      ? item.customization.kind === 'bean'
        ? beanLabel(item.customization)
        : drinkLabel(item.customization)
      : [],
  }));
  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  return { lines, total };
}

/** Create an order payload (without id/timestamps) from the cart + checkout info. */
export function buildOrderPayload(items: CartItem[], info: CheckoutInfo) {
  const { lines, total } = orderLines(items);
  return {
    customerName: info.name,
    phone: info.phone,
    mode: info.mode,
    address: info.address,
    notes: info.notes,
    payment: info.payment,
    paymentRef: info.paymentRef,
    total,
    lines,
  };
}
