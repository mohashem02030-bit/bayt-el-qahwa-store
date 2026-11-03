import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';
import { PAYMENT_METHODS } from '../data';
import { formatEGP } from '../utils';
import type { OrderLine, PaymentMethod } from '../types';

interface Props {
  lines: OrderLine[];
  total: number;
  customerName: string;
  cashierName: string | null;
  payment: PaymentMethod;
  mode: 'pickup' | 'delivery';
  onClose: () => void;
}

export default function CashierReceiptPreview({
  lines,
  total,
  customerName,
  cashierName,
  payment,
  mode,
  onClose,
}: Props) {
  const now = new Date();
  const paymentLabel = PAYMENT_METHODS.find((m) => m.id === payment)?.label ?? payment;
  const modeLabel = mode === 'delivery' ? 'توصيل' : 'استلام من المحل';

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-espresso-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-sm animate-scale-in flex-col overflow-hidden rounded-3xl bg-cream-50 shadow-warm-lg">
        <div className="flex items-center justify-between border-b border-espresso-800/10 px-5 py-4">
          <h3 className="font-display text-lg font-extrabold text-espresso-800">معاينة الفاتورة</h3>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-9 w-9 place-items-center rounded-full bg-espresso-800/5 text-espresso-800 transition hover:bg-espresso-800/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-espresso-800/5 p-4">
          <div id="receipt-print" className="mx-auto w-full max-w-[280px] bg-white p-5 text-[12px] leading-relaxed text-black shadow-sm">
            <div className="text-center">
              <p className="font-display text-base font-extrabold">بيت القهوة</p>
              <p className="text-[11px]">قهوة على أصولها</p>
            </div>
            <div className="my-3 border-t border-dashed border-black/40" />
            <div className="space-y-0.5">
              <p>التاريخ: {now.toLocaleDateString('ar-EG')} - {now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
              <p>الكاشير: {cashierName ?? '-'}</p>
              <p>العميل: {customerName.trim() || 'عميل كاشير'}</p>
              <p>نوع الطلب: {modeLabel}</p>
              <p>طريقة الدفع: {paymentLabel}</p>
            </div>
            <div className="my-3 border-t border-dashed border-black/40" />
            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div key={`${line.name}-${idx}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold">{line.name}</p>
                    <p className="shrink-0 font-bold">{formatEGP(line.unitPrice * line.quantity)}</p>
                  </div>
                  <p className="text-[11px]">
                    {line.quantity} × {formatEGP(line.unitPrice)}
                  </p>
                  {line.specs.length > 0 && <p className="text-[11px] text-black/70">{line.specs.join(' - ')}</p>}
                </div>
              ))}
            </div>
            <div className="my-3 border-t border-dashed border-black/40" />
            <div className="flex items-center justify-between font-display text-base font-extrabold">
              <span>الإجمالي</span>
              <span>{formatEGP(total)}</span>
            </div>
            <div className="my-3 border-t border-dashed border-black/40" />
            <p className="text-center text-[11px]">شكراً لزيارتكم</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-espresso-800/10 p-4">
          <button
            onClick={onClose}
            className="rounded-2xl bg-espresso-800/10 py-3 text-sm font-bold text-espresso-800 transition hover:bg-espresso-800/15"
          >
            رجوع
          </button>
          <button onClick={() => window.print()} className="btn-gold justify-center py-3 text-sm">
            <Printer className="h-4 w-4" />
            طباعة
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
