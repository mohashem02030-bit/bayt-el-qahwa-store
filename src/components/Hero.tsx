import { Sparkles, Flame, Truck, Repeat, MessageCircle } from 'lucide-react';

const BADGES = [
  { icon: Sparkles, label: 'حبوب بن منتقاة بعناية' },
  { icon: Flame, label: 'طحن فوري لكل فنجان' },
  { icon: Truck, label: 'توصيل سريع' },
  { icon: Repeat, label: 'طعم ثابت في كل مرة' },
];

export default function Hero() {
  const scrollToMenu = () => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const scrollToOffers = () => document.getElementById('offers')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <section id="home" className="relative overflow-hidden bg-espresso-900 pt-16 sm:pt-20">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/6612572/pexels-photo-6612572.jpeg?auto=compress&cs=tinysrgb&h=900&w=1600"
          alt=""
          className="h-full w-full object-cover opacity-30"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-espresso-900/80 via-espresso-900/70 to-espresso-800" />
        <div className="absolute inset-0 bg-gradient-to-l from-espresso-900 via-transparent to-espresso-900/40" />
      </div>

      <div className="container-px relative">
        <div className="grid min-h-[88vh] items-center gap-8 py-12 lg:grid-cols-2 lg:py-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/15 px-4 py-1.5 text-sm font-semibold text-gold-300 ring-1 ring-gold-400/30">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-400" />
              </span>
              مفتوح دلوقتي · شبرا الخيمة
            </span>

            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-cream-50 sm:text-5xl lg:text-6xl">
              قهوة معمولة على أصولها..
              <br />
              <span className="bg-gradient-to-l from-gold-300 to-gold-500 bg-clip-text text-transparent">
                من قلب شبرا لمزاجك
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-cream-100/80">
              توليفات بن طازجة بأعلى جودة تحميص، ومشروبات باردة وساخنة معمولة مخصوص لراحتك.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={scrollToMenu} className="btn-gold text-base">
                <MessageCircle className="h-5 w-5" />
                اطلب دلوقتي على واتساب
              </button>
              <button onClick={scrollToOffers} className="btn-ghost text-base">
                <Sparkles className="h-5 w-5" />
                شوف عروض اليوم
              </button>
            </div>

            {/* Badges */}
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {BADGES.map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-2 rounded-2xl bg-espresso-800/60 px-3 py-2.5 text-xs font-semibold text-cream-100 ring-1 ring-cream-50/10 backdrop-blur-sm transition hover:ring-gold-400/40"
                >
                  <b.icon className="h-4 w-4 shrink-0 text-gold-400" strokeWidth={2} />
                  <span className="leading-tight">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating cup visual */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto aspect-square w-full max-w-md animate-fade-up">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-400/20 to-transparent blur-3xl" />
              <img
                src="https://images.pexels.com/photos/38003558/pexels-photo-38003558.jpeg?auto=compress&cs=tinysrgb&h=800&w=800"
                alt="فنجان قهوة بيت القهوة"
                className="relative h-full w-full rounded-[2.5rem] object-cover shadow-warm-lg ring-4 ring-gold-400/20"
                loading="eager"
              />
              {/* Floating price tag */}
              <div className="absolute -bottom-4 -left-4 animate-fade-in rounded-2xl bg-cream-50 px-5 py-3 shadow-warm-lg" style={{ animationDelay: '0.3s' }}>
                <p className="text-xs font-medium text-espresso-400">يبدأ من</p>
                <p className="font-display text-2xl font-extrabold text-espresso-800">30 ج.م</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative">
          <svg viewBox="0 0 1440 80" className="h-12 w-full text-cream-50 sm:h-16" preserveAspectRatio="none">
            <path fill="currentColor" d="M0 40c240-30 480-30 720 0s480 30 720 0v40H0V40Z" />
          </svg>
        </div>
      </div>
    </section>
  );
}
