import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Order, OrderStatus } from './types';

const POLL_INTERVAL_MS = 4000;
const ORDER_LIMIT = 200;

type OrderInput = Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>;
type OrderRow = {
  id: number;
  status: OrderStatus;
  data: OrderInput;
  created_at: number;
  updated_at: number;
};

export type CreateOrderResult = { ok: true; order: Order } | { ok: false; error: string };

const ORDER_COLUMNS = 'id, status, data, created_at, updated_at';

function toOrder(row: OrderRow): Order {
  return {
    ...row.data,
    id: row.id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchOrders(): Promise<{ orders: Order[] } | { error: string }> {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(ORDER_LIMIT);
  if (error) return { error: error.message };
  return { orders: (data as OrderRow[]).map(toOrder) };
}

export function useOrders(): { orders: Order[]; error: string | null } {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const result = await fetchOrders();
      if (!active) return;
      if ('error' in result) setError(result.error);
      else {
        setError(null);
        setOrders(result.orders);
      }
    };
    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return { orders, error };
}

export async function createOrder(input: OrderInput): Promise<CreateOrderResult> {
  const now = Date.now();
  const { data, error } = await supabase
    .from('orders')
    .insert({ status: 'pending', data: input, created_at: now, updated_at: now })
    .select(ORDER_COLUMNS)
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'تعذر حفظ الطلب' };
  return { ok: true, order: toOrder(data as OrderRow) };
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<string | null> {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: Date.now() })
    .eq('id', id);
  return error ? error.message : null;
}

export async function deleteOrder(id: number): Promise<string | null> {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  return error ? error.message : null;
}

export async function clearCompleted(): Promise<string | null> {
  const { error } = await supabase.from('orders').delete().eq('status', 'completed');
  return error ? error.message : null;
}

/** Live "Xs ago" tick hook for KDS timers. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

// Audio chime via Web Audio API — plays on new orders
let audioCtx: AudioContext | null = null;
function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return audioCtx;
  } catch {
    return null;
  }
}

export function playChime() {
  const ctx = ensureCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  const now = ctx.currentTime;
  // two-tone bell
  [
    { f: 880, t: 0 },
    { f: 1175, t: 0.12 },
  ].forEach(({ f, t }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0.0001, now + t);
    gain.gain.exponentialRampToValueAtTime(0.3, now + t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + t);
    osc.stop(now + t + 0.55);
  });
}
