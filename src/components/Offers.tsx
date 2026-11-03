import { Tag, Clock, Gift } from 'lucide-react';
import { PRODUCTS } from '../data';
import { useCart } from '../cart-context';
import type { Product } from '../types';
import { formatEGP } from '../utils';

const OFFERS = PRODUCTS.filter((p) => p.isOffer);

const OFFER_FEATURES = [
  { icon: Gift, label: 'وفّر أكتر مع العروض' },
  { icon: Clock, label: 'متاحة كل أيام الأسبوع' },
  { icon: Tag, label: 'كميات محدودة' },
];

export default function Offers() {
  const { addItem } = useCart();

  const handleAdd = (product: Product) => {
    addItem(product, 1, undefined, product.price);
  };

  return (
    <section id="offers" className="relative overflow-hidden bg-espresso-800 py-16 sm:py-24">
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.pexels.com/photos/36343666/pexels-photo-36343666.jpeg?auto=compress&cs=tinysrgb&h=600&w=1600"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="container-px relative">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/15 px-4 py-1.5 text-sm font-bold text-gold-300 ring-1 ring-gold-400/30">
            <Tag className="h-4 w-4" /> عروض التوفير
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold text-cream-50 sm:text-4xl lg:text-5xl">عروض اليوم</h2>
          <p className="mx-auto mt-3 max-w-2xl text-cream-100/70">عروض مختارة بعناية توفر لك التوليفة المثالية بسعر يفرّحك.</p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {OFFER_FEATURES.map((f) => (
            <span
              key={f.label}
              className="flex items-center gap-2 rounded-full bg-espresso-700/60 px-4 py-2 text-xs font-semibold text-cream-100 ring-1 ring-cream-50/10"
            >
              <f.icon className="h-4 w-4 text-gold-400" />
              {f.label}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="group relative overflow-hidden rounded-3xl bg-cream-50 shadow-warm transition-all duration-500 hover:-translate-y-2 hover:shadow-warm-lg"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {offer.discount && (
                  <span className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                    وفّر {offer.discount}%
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-espresso-800">{offer.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-espresso-500">{offer.description}</p>

                {offer.offerItems && (
                  <ul className="mt-3 space-y-1">
                    {offer.offerItems.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs font-medium text-espresso-600">
                        <Gift className="h-3.5 w-3.5 text-gold-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    {offer.oldPrice && (
                      <span className="ml-2 text-sm text-espresso-400 line-through">{formatEGP(offer.oldPrice)}</span>
                    )}
                    <span className="font-display text-2xl font-extrabold text-espresso-800">{formatEGP(offer.price)}</span>
                  </div>
                  <button
                    onClick={() => handleAdd(offer)}
                    className="rounded-full bg-gold-400 px-4 py-2.5 text-sm font-bold text-espresso-900 shadow-gold transition hover:bg-gold-300 active:scale-95"
                  >
                    أضف للسلة
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
