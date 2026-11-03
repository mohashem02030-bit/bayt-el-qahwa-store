import { useMemo, useState } from 'react';
import { useAllProducts, toggleStock, saveProduct, deleteProduct, genProductId, resetOverrides, type ProductCategory } from '../products-store';
import {
  useCashierUsers, addCashierUser, updateCashierUser, deleteCashierUser, toggleCashierUser, resetCashierUsers,
  type CashierUser,
} from '../cashier-users-store';
import { CATEGORIES, IMAGE_PRESETS } from '../data';
import { formatEGP } from '../utils';
import type { Product } from '../types';
import { Plus, Search, Pencil, Trash2, X, Check, ArrowRight, PackageOpen, Eye, EyeOff, RotateCcw, LogOut, Users, Package, KeyRound, UserPlus, BarChart3 } from 'lucide-react';
import InstallStats from './InstallStats';

const ADMIN_CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'beans', label: 'بن ومطحن' },
  { id: 'hot', label: 'مشروبات ساخنة' },
  { id: 'cold', label: 'مشروبات باردة' },
];

type AdminTab = 'products' | 'cashiers' | 'stats';

export default function AdminView({ onLogout, onBack }: { onLogout: () => void; onBack: () => void }) {
  const [tab, setTab] = useState<AdminTab>('products');
  const products = useAllProducts();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ProductCategory | 'all'>('all');
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    let list = products;
    if (filter !== 'all') list = list.filter((p) => p.category === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return list;
  }, [products, filter, search]);

  return (
    <div className="min-h-screen bg-cream-100 text-espresso-800">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-espresso-100 bg-espresso-800/95 text-cream-50 backdrop-blur-md">
        <div className="container-px flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-b from-gold-400 to-gold-500 text-espresso-900 shadow-gold">
              <PackageOpen className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <div>
              <h1 className="font-display text-lg font-extrabold">لوحة التحكم</h1>
              <p className="text-xs text-cream-100/60">إدارة المنيو والكاشير</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tab === 'products' && (
              <button
                onClick={() => {
                  if (confirm('متأكد؟ هترجع المنيو للأصل ومش هترجع تعديلاتك.')) report(resetOverrides());
                }}
                className="flex items-center gap-1.5 rounded-full bg-cream-50/10 px-3 py-2 text-xs font-bold transition hover:bg-red-600"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">إعادة الضبط</span>
              </button>
            )}
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
          </div>
        </div>
        {/* Tabs */}
        <div className="container-px">
          <div className="flex gap-2 pb-2">
            <TabButton active={tab === 'products'} onClick={() => setTab('products')} icon={Package} label="المنتجات" />
            <TabButton active={tab === 'cashiers'} onClick={() => setTab('cashiers')} icon={Users} label="الكاشير" />
            <TabButton active={tab === 'stats'} onClick={() => setTab('stats')} icon={BarChart3} label="الإحصائيات" />
          </div>
        </div>
      </header>

      <main className="container-px py-6">
      {tab === 'stats' ? (
        <InstallStats />
      ) : tab === 'cashiers' ? (
        <CashierManagement />
      ) : (
        <>
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن صنف..."
              className="w-full rounded-full border-2 border-espresso-100 bg-cream-50 py-2.5 pr-10 pl-4 text-sm outline-none transition focus:border-gold-400"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="الكل" />
            {ADMIN_CATEGORIES.map((c) => (
              <FilterChip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)} label={c.label} />
            ))}
            <button
              onClick={() => setEditing(blankProduct())}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-400 to-gold-500 px-4 py-2 text-sm font-bold text-espresso-900 shadow-gold transition hover:from-gold-300 hover:to-gold-400 active:scale-95"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              إضافة صنف
            </button>
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => {
            const inStock = product.inStock !== false;
            return (
              <div
                key={product.id}
                className={`relative flex flex-col overflow-hidden rounded-3xl bg-cream-50 shadow-warm ring-1 transition ${
                  inStock ? 'ring-espresso-100/60' : 'ring-red-200/60'
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={product.image} alt={product.name} loading="lazy" className={`h-full w-full object-cover transition ${inStock ? '' : 'grayscale'}`} />
                  <button
                    onClick={() => report(toggleStock(product.id))}
                    className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-md transition ${
                      inStock ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {inStock ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {inStock ? 'متاح' : 'غير متوفر'}
                  </button>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-[11px] font-bold text-gold-600">
                    {ADMIN_CATEGORIES.find((c) => c.id === product.category)?.label ?? product.category}
                  </span>
                  <h3 className="mt-0.5 font-bold leading-snug text-espresso-800">{product.name}</h3>
                  <p className="mt-1 flex-1 text-xs leading-relaxed text-espresso-500 line-clamp-2">{product.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-lg font-extrabold text-espresso-800">{formatEGP(product.price)}</span>
                      {product.oldPrice && <span className="text-xs text-espresso-400 line-through">{formatEGP(product.oldPrice)}</span>}
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setEditing(product)}
                        className="grid h-8 w-8 place-items-center rounded-full bg-espresso-100 text-espresso-700 transition hover:bg-gold-400 hover:text-espresso-900"
                        aria-label="تعديل"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(product)}
                        className="grid h-8 w-8 place-items-center rounded-full bg-red-100 text-red-600 transition hover:bg-red-600 hover:text-white"
                        aria-label="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-espresso-400">
            <PackageOpen className="mx-auto h-12 w-12" />
            <p className="mt-3 font-bold">مفيش أصناف مطابقة للبحث</p>
          </div>
        )}
      </>
      )}
      </main>

      {/* Edit modal */}
      {editing && <ProductModal product={editing} onClose={() => setEditing(null)} onSave={async (p) => { const err = await saveProduct(p); if (err) alert(err); else setEditing(null); }} />}

      {/* Delete confirm */}
      {confirmDelete && (
        <ConfirmDialog
          product={confirmDelete}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => { report(deleteProduct(confirmDelete.id)); setConfirmDelete(null); }}
        />
      )}
    </div>
  );
}

function blankProduct(): Product {
  return {
    id: '',
    name: '',
    description: '',
    category: 'hot',
    image: IMAGE_PRESETS[0],
    price: 0,
    inStock: true,
  };
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Package; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
        active ? 'bg-gold-400 text-espresso-900 shadow-gold' : 'bg-cream-50/10 text-cream-100/70 hover:bg-cream-50/20'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

// ── Cashier Management ──────────────────────────────────────────────────────

function report(pending: Promise<string | null>) {
  pending.then((error) => {
    if (error) alert(error);
  });
}

function CashierManagement() {
  const { users, error: usersError } = useCashierUsers();
  const [adding, setAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<CashierUser | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<CashierUser | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-extrabold text-espresso-800">إدارة حسابات الكاشير</h2>
          <p className="mt-1 text-sm text-espresso-500">ضيف كاشيرات متعددين، كل واحد باسم مستخدم وكلمة مرور خاصة بيه.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { if (confirm('هترجع الكاشيرات للإعداد الافتراضي. متأكد؟')) report(resetCashierUsers()); }}
            className="flex items-center gap-1.5 rounded-full bg-cream-50 px-4 py-2 text-xs font-bold text-espresso-600 ring-1 ring-espresso-100 transition hover:bg-red-50 hover:text-red-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            إعادة الضبط
          </button>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-400 to-gold-500 px-4 py-2 text-sm font-bold text-espresso-900 shadow-gold transition hover:from-gold-300 hover:to-gold-400 active:scale-95"
          >
            <UserPlus className="h-4 w-4" strokeWidth={2.5} />
            إضافة كاشير
          </button>
        </div>
      </div>

      {usersError && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-200">تعذر تحميل الكاشيرات: {usersError}</p>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div
            key={user.id}
            className={`flex flex-col rounded-2xl bg-cream-50 p-4 shadow-warm ring-1 transition ${
              user.active ? 'ring-espresso-100/60' : 'ring-red-200/60 opacity-70'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`grid h-12 w-12 place-items-center rounded-full text-white ${user.active ? 'bg-espresso-700' : 'bg-espresso-300'}`}>
                <Users className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h3 className="font-bold text-espresso-800">{user.name}</h3>
                <p className="text-xs text-espresso-400" dir="ltr">@{user.username}</p>
              </div>
              <button
                onClick={() => report(toggleCashierUser(user.id, !user.active))}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  user.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
              >
                {user.active ? 'مفعّل' : 'متوقف'}
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setEditingUser(user)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-espresso-100 py-2 text-sm font-bold text-espresso-700 transition hover:bg-gold-400 hover:text-espresso-900"
              >
                <Pencil className="h-3.5 w-3.5" />
                تعديل
              </button>
              <button
                onClick={() => setConfirmDeleteUser(user)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-red-100 text-red-600 transition hover:bg-red-600 hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {adding && (
        <CashierUserModal
          title="إضافة كاشير جديد"
          onClose={() => setAdding(false)}
          onSave={async (username, password, name) => {
            const res = await addCashierUser(username, password, name);
            if (res.ok) setAdding(false);
            return res;
          }}
        />
      )}
      {editingUser && (
        <CashierUserModal
          title="تعديل الكاشير"
          initial={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={async (username, password, name) => {
            const res = await updateCashierUser(editingUser.id, { username, password, name });
            if (res.ok) setEditingUser(null);
            return res;
          }}
        />
      )}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 animate-fade-in bg-espresso-900/70 backdrop-blur-sm" onClick={() => setConfirmDeleteUser(null)} />
          <div className="relative w-full max-w-sm animate-scale-in rounded-3xl bg-cream-50 p-6 text-center shadow-warm-lg">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="h-7 w-7" />
            </span>
            <h3 className="mt-4 font-display text-lg font-extrabold text-espresso-800">حذف الكاشير؟</h3>
            <p className="mt-2 text-sm text-espresso-500">هتتوقف حساب «{confirmDeleteUser.name}» ومش هيقدر يدخل تاني.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => { report(deleteCashierUser(confirmDeleteUser.id)); setConfirmDeleteUser(null); }} className="flex-1 rounded-full bg-red-600 py-2.5 font-bold text-white transition hover:bg-red-700 active:scale-95">
                نعم، احذف
              </button>
              <button onClick={() => setConfirmDeleteUser(null)} className="flex-1 rounded-full bg-cream-100 py-2.5 font-bold text-espresso-600 transition hover:bg-cream-200 active:scale-95">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CashierUserModal({
  title,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  initial?: CashierUser;
  onClose: () => void;
  onSave: (username: string, password: string, name: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [username, setUsername] = useState(initial?.username ?? '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(initial?.name ?? '');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!username.trim() || (!initial && !password) || !name.trim()) {
      setError('كل الحقول مطلوبة');
      return;
    }
    const res = await onSave(username.trim(), password, name.trim());
    if (!res.ok) setError(res.error ?? 'خطأ غير معروف');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 animate-fade-in bg-espresso-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-slide-in rounded-t-3xl bg-cream-50 shadow-warm-lg sm:rounded-3xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-espresso-100 bg-cream-50 px-5 py-4">
          <h3 className="font-display text-lg font-extrabold text-espresso-800">{title}</h3>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-espresso-100 text-espresso-700 transition hover:bg-red-100 hover:text-red-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <AdminField label="الاسم المعروض" required>
            <input value={name} onChange={(e) => { setName(e.target.value); setError(''); }} className="input-base" placeholder="مثلاً: كاشير ١" />
          </AdminField>
          <AdminField label="اسم المستخدم" required>
            <input value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }} className="input-base" placeholder="cashier1" dir="ltr" />
          </AdminField>
          <AdminField label="كلمة المرور" required>
            <input value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} className="input-base" placeholder={initial ? 'اتركه فاضي لو مش هتغيره' : '••••••••'} dir="ltr" />
          </AdminField>
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-200">{error}</p>
          )}
        </div>
        <div className="sticky bottom-0 flex gap-3 border-t border-espresso-100 bg-cream-50 p-4">
          <button onClick={handleSave} className="btn-gold flex-1">
            <Check className="h-5 w-5" />
            حفظ
          </button>
          <button onClick={onClose} className="btn-ghost">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
        active ? 'bg-espresso-700 text-cream-50 shadow-warm' : 'bg-cream-50 text-espresso-600 ring-1 ring-espresso-100 hover:ring-gold-300'
      }`}
    >
      {label}
    </button>
  );
}

// ── Product Modal ─────────────────────────────────────────────────────────────

function ProductModal({ product, onClose, onSave }: { product: Product; onClose: () => void; onSave: (p: Product) => void }) {
  const isNew = !product.id || product.id === '';
  const [draft, setDraft] = useState<Product>(product);

  const handleSave = () => {
    if (!draft.name.trim()) return;
    const finalId = isNew ? genProductId(draft.name) : draft.id;
    const isBean = draft.category === 'beans';
    onSave({ ...draft, id: finalId, isBean: isBean || undefined, isHot: draft.category === 'hot' || undefined, inStock: draft.inStock !== false });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 animate-fade-in bg-espresso-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-lg animate-slide-in overflow-y-auto rounded-t-3xl bg-cream-50 shadow-warm-lg sm:rounded-3xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-espresso-100 bg-cream-50 px-5 py-4">
          <h3 className="font-display text-lg font-extrabold text-espresso-800">{isNew ? 'إضافة صنف جديد' : 'تعديل الصنف'}</h3>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-espresso-100 text-espresso-700 transition hover:bg-red-100 hover:text-red-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <AdminField label="اسم الصنف" required>
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="input-base" placeholder="مثلاً: قهوة تركي" />
          </AdminField>

          <AdminField label="التصنيف">
            <div className="grid grid-cols-3 gap-2">
              {ADMIN_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setDraft({ ...draft, category: c.id })}
                  className={`rounded-2xl border-2 px-3 py-2.5 text-sm font-bold transition ${
                    draft.category === c.id ? 'border-gold-400 bg-gold-50 text-espresso-800' : 'border-espresso-100 bg-cream-50 text-espresso-500 hover:border-gold-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </AdminField>

          <div className="grid grid-cols-2 gap-3">
            <AdminField label="السعر الأساسي (ج.م)" required>
              <input
                type="number"
                value={draft.price || ''}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                className="input-base"
                placeholder="0"
              />
            </AdminField>
            <AdminField label="السعر قبل الخصم (اختياري)">
              <input
                type="number"
                value={draft.oldPrice || ''}
                onChange={(e) => setDraft({ ...draft, oldPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="input-base"
                placeholder="—"
              />
            </AdminField>
          </div>

          <AdminField label="الوصف">
            <textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={2}
              className="input-base resize-none"
              placeholder="وصف مختصر للصنف..."
            />
          </AdminField>

          <AdminField label="رابط الصورة">
            <input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} className="input-base" placeholder="https://..." dir="ltr" />
          </AdminField>
          {draft.image && (
            <div className="flex items-center gap-3">
              <img src={draft.image} alt="معاينة" className="h-16 w-16 rounded-xl object-cover" />
              <div className="flex flex-wrap gap-1.5">
                {IMAGE_PRESETS.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setDraft({ ...draft, image: url })}
                    className={`h-10 w-10 overflow-hidden rounded-lg ring-2 transition ${draft.image === url ? 'ring-gold-400' : 'ring-transparent hover:ring-gold-300'}`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Modifier toggles */}
          <AdminField label="خيارات التخصيص">
            <div className="grid grid-cols-2 gap-2">
              <ToggleChip
                active={draft.category === 'beans'}
                disabled
                label="أوزان البن"
              />
              <ToggleChip
                active={draft.category === 'beans'}
                disabled
                label="درجة الطحن"
              />
              <ToggleChip
                active={draft.category === 'hot'}
                disabled
                label="السكر / الحجم"
              />
              <ToggleChip
                active={!!draft.hasDouble}
                disabled={draft.category !== 'hot'}
                onClick={() => setDraft({ ...draft, hasDouble: !draft.hasDouble, doublePrice: !draft.hasDouble ? draft.price + 10 : undefined })}
                label="حجم دوبل"
              />
            </div>
          </AdminField>

          {draft.hasDouble && draft.category === 'hot' && (
            <AdminField label="سعر الحجم الدوبل (ج.م)">
              <input
                type="number"
                value={draft.doublePrice || ''}
                onChange={(e) => setDraft({ ...draft, doublePrice: Number(e.target.value) })}
                className="input-base"
                placeholder="0"
              />
            </AdminField>
          )}

          <AdminField label="الحالة">
            <button
              onClick={() => setDraft({ ...draft, inStock: draft.inStock !== false ? false : true })}
              className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-2.5 text-sm font-bold transition ${
                draft.inStock !== false ? 'border-green-400 bg-green-50 text-green-700' : 'border-red-300 bg-red-50 text-red-600'
              }`}
            >
              {draft.inStock !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {draft.inStock !== false ? 'متاح في المنيو' : 'غير متوفر حالياً'}
            </button>
          </AdminField>
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-espresso-100 bg-cream-50 p-4">
          <button
            onClick={handleSave}
            disabled={!draft.name.trim()}
            className="btn-gold flex-1 disabled:opacity-50"
          >
            <Check className="h-5 w-5" />
            حفظ
          </button>
          <button onClick={onClose} className="btn-ghost">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-espresso-700">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}

function ToggleChip({ active, onClick, label, disabled }: { active: boolean; onClick?: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 rounded-2xl border-2 px-3 py-2.5 text-xs font-bold transition ${
        active ? 'border-gold-400 bg-gold-50 text-espresso-800' : 'border-espresso-100 bg-cream-50 text-espresso-400'
      } ${disabled ? 'opacity-60' : 'hover:border-gold-300'}`}
    >
      {active && <Check className="h-3 w-3" />}
      {label}
    </button>
  );
}

// ── Confirm Delete ───────────────────────────────────────────────────────────

function ConfirmDialog({ product, onCancel, onConfirm }: { product: Product; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-espresso-900/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm animate-scale-in rounded-3xl bg-cream-50 p-6 text-center shadow-warm-lg">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-100 text-red-600">
          <Trash2 className="h-7 w-7" />
        </span>
        <h3 className="mt-4 font-display text-lg font-extrabold text-espresso-800">حذف الصنف؟</h3>
        <p className="mt-2 text-sm text-espresso-500">
          هتنقل «{product.name}» خارج المنيو. تقدر ترجعه من إعادة الضبط بعدين.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={onConfirm} className="flex-1 rounded-full bg-red-600 py-2.5 font-bold text-white transition hover:bg-red-700 active:scale-95">
            نعم، احذف
          </button>
          <button onClick={onCancel} className="flex-1 rounded-full bg-cream-100 py-2.5 font-bold text-espresso-600 transition hover:bg-cream-200 active:scale-95">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
