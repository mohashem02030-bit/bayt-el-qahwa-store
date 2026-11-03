import { useEffect, useState } from 'react';
import { PRODUCTS } from './data';
import { supabase } from './supabase';
import type { Product, ProductCategory } from './types';

/**
 * Override shape: admin can edit existing products, add new ones, or toggle stock.
 * Stored as a row per product id. Custom products use a `custom` prefix id.
 */
export type Override = Partial<Product> & { id: string; archived?: boolean };
type Overrides = Record<string, Override>;

type Listener = () => void;
const listeners = new Set<Listener>();

let overrides: Overrides = {};

function notify() {
  listeners.forEach((l) => l());
}

export async function refreshProducts(): Promise<string | null> {
  const { data, error } = await supabase.from('product_overrides').select('id, data');
  if (error) return error.message;
  overrides = Object.fromEntries(
    (data ?? []).map((row) => [row.id as string, { ...(row.data as Override), id: row.id as string }]),
  );
  notify();
  return null;
}

export function useProductOverrides(): Overrides {
  const [current, setCurrent] = useState<Overrides>(overrides);
  useEffect(() => {
    const sync = () => setCurrent(overrides);
    listeners.add(sync);
    sync();
    refreshProducts();
    return () => {
      listeners.delete(sync);
    };
  }, []);
  return current;
}

/** Merge base PRODUCTS with overrides + custom additions, filtering archived and out-of-stock ones. */
export function useProducts(): Product[] {
  return useAllProducts().filter((p) => p.inStock !== false);
}

export function useAllProducts(): Product[] {
  const current = useProductOverrides();
  const merged: Product[] = PRODUCTS.map((p) => ({ ...p, ...(current[p.id] ?? {}), id: p.id }));
  const customIds = Object.keys(current).filter((id) => !PRODUCTS.some((p) => p.id === id));
  customIds.forEach((id) => {
    const o = current[id];
    if (o) merged.push({ ...emptyProduct(), ...o, id });
  });
  return merged.filter((p) => !p.archived);
}

function emptyProduct(): Product {
  return {
    id: '',
    name: '',
    description: '',
    category: 'hot',
    image: '',
    price: 0,
    inStock: true,
  };
}

async function writeOverride(id: string, override: Override): Promise<string | null> {
  const { error } = await supabase
    .from('product_overrides')
    .upsert({ id, data: override, updated_at: new Date().toISOString() });
  if (error) return error.message;
  return refreshProducts();
}

export function saveProduct(product: Product): Promise<string | null> {
  return writeOverride(product.id, { ...overrides[product.id], ...product, id: product.id });
}

export function toggleStock(id: string): Promise<string | null> {
  const current = overrides[id] ?? {};
  const base = PRODUCTS.find((p) => p.id === id);
  const inStock = current.inStock ?? base?.inStock ?? true;
  return writeOverride(id, { ...current, id, inStock: !inStock });
}

export function deleteProduct(id: string): Promise<string | null> {
  return writeOverride(id, { ...overrides[id], id, archived: true, inStock: false });
}

export function genProductId(name: string): string {
  const slug = name.trim().slice(0, 20).replace(/\s+/g, '-');
  return `custom-${slug}-${Date.now().toString(36).slice(-4)}`;
}

export async function resetOverrides(): Promise<string | null> {
  const { error } = await supabase.from('product_overrides').delete().neq('id', '');
  if (error) return error.message;
  return refreshProducts();
}

export type { ProductCategory };
