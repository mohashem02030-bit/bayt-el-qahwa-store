export type CategoryId = 'all' | 'offers' | 'beans' | 'hot' | 'cold';

export type WeightOption = '125g' | '250g' | '500g' | '1kg';
export type RoastOption = 'light' | 'medium' | 'dark';
export type GrindOption = 'turkish' | 'espresso' | 'filter' | 'french-press' | 'whole';
export type SpiceOption = 'plain' | 'spiced' | 'cardamom' | 'double-spiced';

export interface BeanCustomization {
  kind: 'bean';
  weight: WeightOption;
  roast: RoastOption;
  grind: GrindOption;
  spice: SpiceOption;
}

export type DrinkSize = 'single' | 'double';
export type SugarOption = 'none' | 'light' | 'medium' | 'extra' | 'caramel';

export interface DrinkCustomization {
  kind: 'drink';
  size: DrinkSize;
  sugar: SugarOption;
}

export type Customization = BeanCustomization | DrinkCustomization;

export type ProductCategory = 'beans' | 'hot' | 'cold';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  image: string;
  price: number; // base price in EGP (125g for beans, single for drinks)
  oldPrice?: number; // before discount
  discount?: number; // percentage
  badge?: string;
  rating?: number;
  isBean?: boolean;
  isHot?: boolean;
  isOffer?: boolean;
  offerItems?: string[];
  hasDouble?: boolean; // drink available in double size at a different price
  doublePrice?: number;
  isDecaf?: boolean;
  isGreenBean?: boolean;
  inStock?: boolean; // admin stock toggle; defaults to true
  archived?: boolean; // admin delete/archive toggle
}

export interface CartItem {
  uid: string;
  product: Product;
  quantity: number;
  customization?: Customization;
  unitPrice: number;
}

// ── Payment ──────────────────────────────────────────────────────────────────

export type PaymentMethod = 'cash' | 'instapay' | 'wallet';

export interface CheckoutInfo {
  name: string;
  phone: string;
  mode: 'delivery' | 'pickup';
  address: string;
  notes: string;
  payment: PaymentMethod;
  paymentRef: string; // account name / transfer code / screenshot note
}

// ── Orders (KDS) ──────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'prep' | 'ready' | 'completed';

export interface OrderLine {
  name: string;
  quantity: number;
  unitPrice: number;
  specs: string[]; // customization lines for barista
}

export interface Order {
  id: number;
  createdAt: number;
  customerName: string;
  phone: string;
  mode: 'delivery' | 'pickup';
  address: string;
  notes: string;
  payment: PaymentMethod;
  paymentRef: string;
  total: number;
  lines: OrderLine[];
  status: OrderStatus;
  updatedAt: number;
}
