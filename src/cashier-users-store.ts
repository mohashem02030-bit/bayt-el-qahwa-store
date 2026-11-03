import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface CashierUser {
  id: string;
  username: string;
  name: string; // display name shown on the POS
  active: boolean;
  createdAt: number;
}

export type CashierResult = { ok: true } | { ok: false; error: string };

const DUPLICATE_USERNAME = '23505';
const USER_COLUMNS = 'id, username, name, active, created_at';
const DEFAULT_CASHIER = { username: 'cashier', password: 'cashier123', name: 'كاشير ١' };

type CashierRow = { id: string; username: string; name: string; active: boolean; created_at: number };

function toUser(row: CashierRow): CashierUser {
  return { id: row.id, username: row.username, name: row.name, active: row.active, createdAt: row.created_at };
}

type Listener = () => void;
const listeners = new Set<Listener>();

let users: CashierUser[] = [];

async function refreshCashierUsers(): Promise<string | null> {
  const { data, error } = await supabase.from('cashier_users').select(USER_COLUMNS).order('created_at');
  if (error) return error.message;
  users = (data as CashierRow[]).map(toUser);
  listeners.forEach((l) => l());
  return null;
}

export function useCashierUsers(): { users: CashierUser[]; error: string | null } {
  const [current, setCurrent] = useState<CashierUser[]>(users);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const sync = () => setCurrent(users);
    listeners.add(sync);
    refreshCashierUsers().then(setError);
    return () => {
      listeners.delete(sync);
    };
  }, []);
  return { users: current, error };
}

/** Returns the cashier's display name when the credentials match an active account, otherwise null. */
export async function verifyCashier(username: string, password: string): Promise<{ name: string } | null> {
  const { data, error } = await supabase.rpc('verify_cashier', { p_username: username, p_password: password });
  if (error || !Array.isArray(data) || data.length === 0) return null;
  return { name: String((data[0] as { name: string }).name) };
}

function describeError(code: string | undefined, message: string): string {
  return code === DUPLICATE_USERNAME ? 'اسم المستخدم موجود بالفعل' : message;
}

export async function addCashierUser(username: string, password: string, name: string): Promise<CashierResult> {
  if (!username.trim() || !password || !name.trim()) return { ok: false, error: 'كل الحقول مطلوبة' };
  const { error } = await supabase.from('cashier_users').insert({
    username: username.trim(),
    password,
    name: name.trim(),
    active: true,
    created_at: Date.now(),
  });
  if (error) return { ok: false, error: describeError(error.code, error.message) };
  const refreshError = await refreshCashierUsers();
  return refreshError ? { ok: false, error: refreshError } : { ok: true };
}

/** An empty password keeps the current one. */
export async function updateCashierUser(
  id: string,
  patch: { username: string; name: string; password?: string },
): Promise<CashierResult> {
  const { error } = await supabase
    .from('cashier_users')
    .update({
      username: patch.username.trim(),
      name: patch.name.trim(),
      ...(patch.password ? { password: patch.password } : {}),
    })
    .eq('id', id);
  if (error) return { ok: false, error: describeError(error.code, error.message) };
  const refreshError = await refreshCashierUsers();
  return refreshError ? { ok: false, error: refreshError } : { ok: true };
}

export async function deleteCashierUser(id: string): Promise<string | null> {
  const { error } = await supabase.from('cashier_users').delete().eq('id', id);
  if (error) return error.message;
  return refreshCashierUsers();
}

export async function toggleCashierUser(id: string, active: boolean): Promise<string | null> {
  const { error } = await supabase.from('cashier_users').update({ active }).eq('id', id);
  if (error) return error.message;
  return refreshCashierUsers();
}

export async function resetCashierUsers(): Promise<string | null> {
  const { error: deleteError } = await supabase.from('cashier_users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) return deleteError.message;
  const { error: insertError } = await supabase.from('cashier_users').insert({
    ...DEFAULT_CASHIER,
    active: true,
    created_at: Date.now(),
  });
  if (insertError) return insertError.message;
  return refreshCashierUsers();
}
