import type { Product } from '../types';
import { formatEGP } from '../utils';
import { useCart } from '../cart-context';
import { Star, Plus, Tag } from 'lucide-react';

interface Props {
  product: Product;
  onCustomize: (product: Product) => void;
}

export default function ProductCard({ product, onCustomize }: Props) {
  const { addItem } = useCart();

  const needsModal = product.isBean || product.isHot;

  const handleAdd = () => {
    if (needsModal) {
      onCustomize(product);
    } else {
      addItem(product, 1);
    }
  };

  const cta = product.isBean ? 'اختر التخصيص' : product.isHot ? 'جهّز طلبك' : 'اطلب الآن';

  return (
    <div className="card-base group flex flex-col overflow-hidden hover:-translate-y-1.5 hover:shadow-warm-lg">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Discount badge */}
        {product.discount && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
            <Tag className="h-3 w-3" />
            خصم {product.discount}%
          </span>
        )}

        {/* Badge (special) */}
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-gold-400 px-2.5 py-1 text-[11px] font-bold text-espresso-900 shadow-md">
            {product.badge}
          </span>
        )}

        {/* Rating */}
        {product.rating && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-espresso-900/70 px-2 py-1 text-xs font-semibold text-gold-300 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-gold-300" />
            {product.rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-bold leading-snug text-espresso-800">{product.name}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-espresso-500">{product.description}</p>

        {/* Offer items */}
        {product.isOffer && product.offerItems && (
          <ul className="mt-3 space-y-1 rounded-2xl bg-gold-50 p-3">
            {product.offerItems.map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs font-medium text-espresso-600">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                {item}
              </li>
            ))}
          </ul>
        )}

        {/* Price + action */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            {product.oldPrice && (
              <span className="ml-2 text-sm text-espresso-400 line-through">{formatEGP(product.oldPrice)}</span>
            )}
            <span className="font-display text-xl font-extrabold text-espresso-800">{formatEGP(product.price)}</span>
            {product.isBean && <span className="block text-[11px] text-espresso-400">يبدأ من 125جم</span>}
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 rounded-full bg-espresso-700 px-4 py-2.5 text-sm font-bold text-cream-50 shadow-warm transition hover:bg-gold-400 hover:text-espresso-900 active:scale-95"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}
