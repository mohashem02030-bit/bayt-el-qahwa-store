import { supabase } from './supabase';

export type InstallPlatform = 'android' | 'ios' | 'desktop' | 'other';

export interface InstallClickStats {
  total: number;
  last7Days: number;
  byPlatform: Record<InstallPlatform, number>;
}

type StatsRow = { platform: InstallPlatform; clicks: number | string; last_7_days: number | string };

const PLATFORMS: InstallPlatform[] = ['android', 'ios', 'desktop', 'other'];

export function detectInstallPlatform(): InstallPlatform {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  if (/windows|macintosh|linux/i.test(ua)) return 'desktop';
  return 'other';
}

export async function recordInstallClick(): Promise<void> {
  await supabase.from('install_button_clicks').insert({ platform: detectInstallPlatform() });
}

export async function fetchInstallClickStats(): Promise<{ data: InstallClickStats | null; error: string | null }> {
  const { data, error } = await supabase.rpc('install_click_stats');
  if (error) return { data: null, error: error.message };
  if (!Array.isArray(data)) return { data: null, error: 'تعذر تحميل الإحصائيات' };

  const stats: InstallClickStats = {
    total: 0,
    last7Days: 0,
    byPlatform: { android: 0, ios: 0, desktop: 0, other: 0 },
  };
  for (const row of data as StatsRow[]) {
    if (!PLATFORMS.includes(row.platform)) continue;
    const clicks = Number(row.clicks);
    stats.total += clicks;
    stats.last7Days += Number(row.last_7_days);
    stats.byPlatform[row.platform] += clicks;
  }
  return { data: stats, error: null };
}
