import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { fetchInstallClickStats, type InstallClickStats, type InstallPlatform } from '@/install-clicks-store';

const PLATFORM_LABELS: Record<InstallPlatform, string> = {
  android: 'أندرويد',
  ios: 'آيفون',
  desktop: 'كمبيوتر',
  other: 'أخرى',
};

export default function InstallStats() {
  const [stats, setStats] = useState<InstallClickStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchInstallClickStats();
    setStats(result.data);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const maxPlatform = stats ? Math.max(1, ...Object.values(stats.byPlatform)) : 1;

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold text-espresso-800">ضغطات تحميل التطبيق</h2>
          <p className="mt-1 text-sm text-espresso-400">عدد الزوار اللي ضغطوا على زرار التحميل من النافذة</p>
        </div>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream-50 text-espresso-600 ring-1 ring-espresso-100 transition hover:bg-gold-400 hover:text-espresso-900 disabled:opacity-50"
          aria-label="تحديث"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700 ring-1 ring-red-200">
          <p className="font-bold">تعذر تحميل الإحصائيات</p>
          <p className="mt-1">جرّب تحدّث الصفحة بعد شوية.</p>
        </div>
      ) : loading && !stats ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-28 animate-pulse rounded-3xl bg-cream-100" />
          <div className="h-28 animate-pulse rounded-3xl bg-cream-100" />
        </div>
      ) : stats ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="إجمالي الضغطات" value={stats.total} />
            <StatCard label="آخر 7 أيام" value={stats.last7Days} />
          </div>

          <div className="rounded-3xl bg-cream-50 p-5 ring-1 ring-espresso-100">
            <h3 className="mb-4 text-sm font-bold text-espresso-700">حسب الجهاز</h3>
            <ul className="space-y-4">
              {(Object.keys(PLATFORM_LABELS) as InstallPlatform[]).map((platform) => {
                const count = stats.byPlatform[platform];
                const width = Math.round((count / maxPlatform) * 100);
                return (
                  <li key={platform}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-semibold text-espresso-700">
                        <Download className="h-3.5 w-3.5 text-espresso-400" />
                        {PLATFORM_LABELS[platform]}
                      </span>
                      <span className="font-display font-extrabold text-espresso-800">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-cream-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-500 transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-espresso-800 p-5 text-cream-50 shadow-warm-lg ring-1 ring-gold-400/20">
      <p className="text-xs font-semibold text-cream-100/70">{label}</p>
      <p className="mt-2 font-display text-4xl font-extrabold text-gold-400">{value}</p>
    </div>
  );
}
