import { useEffect, useMemo, useRef, useState } from 'react';
import type { Product, CategoryId } from '../types';
import { CATEGORIES } from '../data';
import { useProducts } from '../products-store';
import ProductCard from './ProductCard';
import BeanModal from './BeanModal';
import DrinkModal from './DrinkModal';
import { Sparkles } from 'lucide-react';

export default function Menu() {
  const [active, setActive] = useState<CategoryId>('all');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const sentinel = barRef.current?.previousElementSibling as HTMLElement | null;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), { threshold: 0 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const products = useProducts();
  const filtered = useMemo(() => {
    if (active === 'all') return products;
    if (active === 'offers') return products.filter((p) => p.isOffer);
    return products.filter((p) => p.category === active && !p.isOffer);
  }, [active, products]);

  return (
    <section id="menu" className="bg-cream-100 py-16 sm:py-24">
      <div className="container-px">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-4 py-1.5 text-sm font-bold text-gold-700">
            <Sparkles className="h-4 w-4" /> المنيو والمتجر
          </span>
          <h2 className="mt-4 section-title">اختر مزاجك</h2>
          <p className="mx-auto mt-3 max-w-2xl text-espresso-500">
            من توليفات البن المختارة للمشروبات الساخنة والباردة، كل حاجة معمولة على أصولها.
          </p>
        </div>
      </div>

      {/* Sticky category bar */}
      <div ref={barRef} className="sticky top-16 z-30 mt-8 sm:top-20">
        <div className={`transition-all duration-300 ${stuck ? 'bg-cream-50/95 py-3 shadow-warm backdrop-blur-md' : 'bg-transparent'}`}>
          <div className="container-px">
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActive(cat.id)}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                    active === cat.id
                      ? 'bg-gradient-to-b from-gold-400 to-gold-500 text-espresso-900 shadow-gold'
                      : 'bg-cream-50 text-espresso-600 ring-1 ring-espresso-100 hover:ring-gold-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-px mt-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onCustomize={setModalProduct} />
          ))}
        </div>
      </div>

      {modalProduct?.isBean ? (
        <BeanModal product={modalProduct} onClose={() => setModalProduct(null)} />
      ) : (
        <DrinkModal product={modalProduct} onClose={() => setModalProduct(null)} />
      )}
    </section>
  );
}
