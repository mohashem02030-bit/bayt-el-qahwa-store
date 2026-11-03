import { useEffect, useState } from 'react';
import { ShoppingBag, Phone, Facebook, Instagram } from 'lucide-react';
import { useCart } from '../cart-context';
import { formatEGP } from '../utils';

const NAV_LINKS = [
  { id: 'home', label: 'الرئيسية' },
  { id: 'menu', label: 'المشاريب والمنيو' },
  { id: 'beans', label: 'البن والمطحن' },
  { id: 'offers', label: 'العروض' },
  { id: 'branches', label: 'فروعنا' },
  { id: 'contact', label: 'تواصل معنا' },
];

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.5 3c.3 2.1 1.7 3.7 3.8 4v2.2c-1.4 0-2.7-.4-3.8-1v6.4c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.3 0 .7 0 1 .1v2.4c-.3-.1-.7-.2-1-.2-1.9 0-3.5 1.6-3.5 3.5s1.6 3.5 3.5 3.5 3.5-1.6 3.5-3.5V3h2.5Z" />
    </svg>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, total, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-espresso-800/95 shadow-warm-lg backdrop-blur-md'
          : 'bg-gradient-to-b from-espresso-900/70 to-transparent'
      }`}
    >
      <div className="container-px">
        <div className="flex h-16 items-center justify-between gap-4 sm:h-20">
          {/* Logo */}
          <button onClick={() => scrollTo('home')} className="flex items-center gap-3">
            <img src="/1793128790034.jpg" alt="شعار بيت القهوة" className="h-12 w-12 rounded-2xl object-cover shadow-gold ring-1 ring-gold-400/30 sm:h-14 sm:w-14" />
            <span className="flex flex-col items-start leading-none">
              <span className="font-display text-lg font-extrabold text-cream-50 sm:text-2xl">بيت القهوة</span>
              <span className="mt-0.5 text-[10px] font-medium text-gold-300 sm:text-xs">Bayt El-Qahwa</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="rounded-full px-3 py-2 text-sm font-semibold text-cream-100/90 transition-all duration-300 hover:bg-cream-50/10 hover:text-gold-300"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="tel:+201000000000"
              className="hidden h-10 w-10 place-items-center rounded-full bg-cream-50/10 text-cream-50 transition hover:bg-gold-400 hover:text-espresso-900 sm:grid"
              aria-label="كلمنا فون"
            >
              <Phone className="h-5 w-5" />
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 w-10 place-items-center rounded-full bg-cream-50/10 text-cream-50 transition hover:bg-gold-400 hover:text-espresso-900 md:grid"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 w-10 place-items-center rounded-full bg-cream-50/10 text-cream-50 transition hover:bg-gold-400 hover:text-espresso-900 md:grid"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 w-10 place-items-center rounded-full bg-cream-50/10 text-cream-50 transition hover:bg-gold-400 hover:text-espresso-900 md:grid"
              aria-label="TikTok"
            >
              <TikTokIcon className="h-5 w-5" />
            </a>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-400 to-gold-500 px-3 py-2 font-bold text-espresso-900 shadow-gold transition hover:from-gold-300 hover:to-gold-400 active:scale-95 sm:px-4"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={2.5} />
              <span className="hidden text-sm sm:inline">السلة</span>
              {count > 0 && (
                <>
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-espresso-800 px-1 text-[11px] font-bold text-cream-50">
                    {count}
                  </span>
                  <span className="hidden text-sm font-bold ltr:ml-1 rtl:mr-1 sm:inline">{formatEGP(total)}</span>
                </>
              )}
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full bg-cream-50/10 text-cream-50 transition hover:bg-cream-50/20 lg:hidden"
              aria-label="القائمة"
            >
              <div className="space-y-1.5">
                <span className={`block h-0.5 w-5 bg-current transition ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
                <span className={`block h-0.5 w-5 bg-current transition ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-5 bg-current transition ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${
            mobileOpen ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="grid grid-cols-2 gap-2">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="rounded-2xl bg-espresso-700/60 px-4 py-3 text-right text-sm font-semibold text-cream-100 transition hover:bg-gold-400 hover:text-espresso-900"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
