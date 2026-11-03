import { useEffect, useState } from 'react';
import type { PortalRole } from '../auth-context';
import { X, Lock, User, AlertCircle, Coffee, Settings, Calculator } from 'lucide-react';

interface Props {
  role: PortalRole;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<boolean>;
}

const ROLE_INFO: Record<PortalRole, { title: string; subtitle: string; icon: typeof Settings; placeholder: string }> = {
  admin: { title: 'بوابة الإدارة', subtitle: 'لوحة تعديل المنتجات', icon: Settings, placeholder: 'admin' },
  barista: { title: 'بوابة الطلبات', subtitle: 'شاشة متابعة الطلبات', icon: Coffee, placeholder: 'barista' },
  cashier: { title: 'بوابة الكاشير', subtitle: 'نقطة بيع POS', icon: Calculator, placeholder: 'cashier' },
};

export default function AuthModal({ role, onClose, onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const info = ROLE_INFO[role];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('من فضلك أدخل اسم المستخدم وكلمة المرور');
      return;
    }
    setBusy(true);
    const ok = await onLogin(username.trim(), password);
    setBusy(false);
    if (!ok) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-espresso-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm animate-scale-in overflow-hidden rounded-3xl bg-cream-50 shadow-warm-lg">
        {/* Header */}
        <div className="relative bg-gradient-to-b from-espresso-700 to-espresso-800 px-6 py-8 text-center">
          <button
            onClick={onClose}
            className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-cream-50/10 text-cream-50 transition hover:bg-gold-400 hover:text-espresso-900"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-b from-gold-400 to-gold-500 text-espresso-900 shadow-gold">
            <info.icon className="h-8 w-8" strokeWidth={2} />
          </span>
          <h2 className="mt-4 font-display text-xl font-extrabold text-cream-50">{info.title}</h2>
          <p className="mt-1 text-sm text-cream-100/70">{info.subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-espresso-700">اسم المستخدم</span>
            <div className="relative">
              <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400" />
              <input
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder={info.placeholder}
                autoFocus
                className="w-full rounded-2xl border-2 border-espresso-100 bg-cream-50 py-3 pr-10 pl-4 text-sm text-espresso-800 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-300/40"
                dir="ltr"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-espresso-700">كلمة المرور</span>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full rounded-2xl border-2 border-espresso-100 bg-cream-50 py-3 pr-10 pl-10 text-sm text-espresso-800 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-300/40"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute left-2 top-1/2 -translate-y-1/2 px-2 text-[10px] font-bold text-espresso-400 hover:text-gold-600"
              >
                {showPass ? 'إخفاء' : 'إظهار'}
              </button>
            </div>
          </label>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 ring-1 ring-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button type="submit" disabled={busy} className="btn-gold w-full text-base disabled:opacity-60">
            {busy ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
