import { MapPin, Clock, Phone, MessageCircle, Map, Facebook, Instagram, Settings, ClipboardList, Calculator } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../data';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.5 3c.3 2.1 1.7 3.7 3.8 4v2.2c-1.4 0-2.7-.4-3.8-1v6.4c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.3 0 .7 0 1 .1v2.4c-.3-.1-.7-.2-1-.2-1.9 0-3.5 1.6-3.5 3.5s1.6 3.5 3.5 3.5 3.5-1.6 3.5-3.5V3h2.5Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden bg-espresso-900 text-cream-100">
      {/* Top: branches */}
      <div id="branches" className="container-px py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/15 px-4 py-1.5 text-sm font-bold text-gold-300 ring-1 ring-gold-400/30">
              <MapPin className="h-4 w-4" /> فروعنا
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-cream-50 sm:text-4xl">زورنا في بيت القهوة</h2>
            <p className="mt-3 max-w-md text-cream-100/70">
              موجودين في قلب شبرا الخيمة، نستقبلكم كل يوم بفنجان طازج وابتسامة ترحاب.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex gap-4 rounded-2xl bg-espresso-800/60 p-4 ring-1 ring-cream-50/10">
                <MapPin className="h-5 w-5 shrink-0 text-gold-400" />
                <div>
                  <h3 className="font-bold text-cream-50">العنوان</h3>
                  <p className="mt-0.5 text-sm text-cream-100/70">ميدان المؤسسة، شبرا الخيمة، القليوبية</p>
                </div>
              </div>
              <div className="flex gap-4 rounded-2xl bg-espresso-800/60 p-4 ring-1 ring-cream-50/10">
                <Clock className="h-5 w-5 shrink-0 text-gold-400" />
                <div>
                  <h3 className="font-bold text-cream-50">مواعيد العمل</h3>
                  <p className="mt-0.5 text-sm text-cream-100/70">يومياً من 7 صباحاً حتى 2 صباحاً</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="tel:+201000000000" className="btn-gold text-sm">
                <Phone className="h-4 w-4" />
                كلمنا فون
              </a>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="btn-espresso text-sm">
                <MessageCircle className="h-4 w-4" />
                راسلنا واتساب
              </a>
              <a
                href="https://maps.google.com/?q=ميدان المؤسسة شبرا الخيمة القليوبية"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-sm"
              >
                <Map className="h-4 w-4" />
                افتح اللوكيشن
              </a>
            </div>
          </div>

          {/* Map embed */}
          <div className="overflow-hidden rounded-3xl shadow-warm-lg ring-1 ring-cream-50/10">
            <iframe
              title="موقع بيت القهوة"
              src="https://www.openstreetmap.org/export/embed.html?bbox=31.236%2C30.115%2C31.260%2C30.130&layer=mapnik&marker=30.122%2C31.248"
              className="h-full min-h-[320px] w-full"
              loading="lazy"
              style={{ border: 0 }}
            />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream-50/10">
        <div className="container-px py-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <img src="/1793128790034.jpg" alt="شعار بيت القهوة" className="h-12 w-12 rounded-2xl object-cover shadow-gold ring-1 ring-gold-400/30" />
              <div>
                <p className="font-display text-lg font-extrabold text-cream-50">بيت القهوة</p>
                <p className="text-xs text-cream-100/60">قهوة على أصولها من قلب شبرا</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {[
                { Icon: Facebook, href: 'https://www.facebook.com', label: 'Facebook' },
                { Icon: Instagram, href: 'https://www.instagram.com', label: 'Instagram' },
                { Icon: TikTokIcon, href: 'https://www.tiktok.com', label: 'TikTok' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-cream-50/10 text-cream-100 transition hover:bg-gold-400 hover:text-espresso-900"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-cream-100/50">
            © {new Date().getFullYear()} بيت القهوة — جميع الحقوق محفوظة · صُنع بشغف في مصر
          </p>

          {/* Discreet admin portals */}
          <div className="mt-3 flex items-center justify-center gap-4 opacity-30 transition-opacity hover:opacity-100">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('bq-open-portal', { detail: 'admin' }))}
              className="flex items-center gap-1.5 text-xs text-stone-400 transition hover:text-gold-300"
            >
              <Settings className="h-3 w-3" />
              الإدارة
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('bq-open-portal', { detail: 'barista' }))}
              className="flex items-center gap-1.5 text-xs text-stone-400 transition hover:text-gold-300"
            >
              <ClipboardList className="h-3 w-3" />
              الطلبات
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('bq-open-portal', { detail: 'cashier' }))}
              className="flex items-center gap-1.5 text-xs text-stone-400 transition hover:text-gold-300"
            >
              <Calculator className="h-3 w-3" />
              الكاشير
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
