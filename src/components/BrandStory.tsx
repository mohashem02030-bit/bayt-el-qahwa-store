import { Flame, Heart, Leaf } from 'lucide-react';

const PILLARS = [
  {
    icon: Flame,
    title: 'تحميص على أصول',
    text: 'نحمص حبوبنا بشرافات صغيرة لضمان وصول النكهة لكم طازجة كأنها تحميص أمس.',
  },
  {
    icon: Heart,
    title: 'تجربة ترحاب',
    text: 'كل زبون عيلة. نعرف اسمك، نعرف خلطتك، ونحفظ طلبك من الفنجان الأول لليومي.',
  },
  {
    icon: Leaf,
    title: 'ثبات في الطعم',
    text: 'نوزن ونخلط بدقة عالية، عشان كل مرة تطلب تجد نفس المزاج اللي يعجبك.',
  },
];

export default function BrandStory() {
  return (
    <section className="relative overflow-hidden bg-cream-50 py-16 sm:py-24">
      <div className="container-px">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.pexels.com/photos/13735849/pexels-photo-13735849.jpeg?auto=compress&cs=tinysrgb&h=800&w=600"
                alt="باريستا يجهز القهوة"
                className="aspect-[3/4] w-full rounded-3xl object-cover shadow-warm"
                loading="lazy"
              />
              <img
                src="https://images.pexels.com/photos/16715815/pexels-photo-16715815.jpeg?auto=compress&cs=tinysrgb&h=800&w=600"
                alt="فنجان قهوة عربي"
                className="mt-8 aspect-[3/4] w-full rounded-3xl object-cover shadow-warm"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-4 right-1/2 translate-x-1/2 rounded-2xl bg-espresso-800 px-6 py-3 text-center shadow-warm-lg sm:right-auto sm:translate-x-0">
              <p className="font-display text-2xl font-extrabold text-gold-400">+10</p>
              <p className="text-xs font-medium text-cream-100">سنوات خبرة</p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="inline-block rounded-full bg-gold-100 px-4 py-1.5 text-sm font-bold text-gold-700">حكايتنا</span>
            <h2 className="mt-4 section-title">حكاية بيت القهوة</h2>
            <p className="mt-5 text-lg leading-relaxed text-espresso-600">
              من ميدان المؤسسة في قلب شبرا الخيمة، بدأنا حلمنا بفنجان قهوة يليق بأهلنا. لقينا في القهوة كلام ما
              بيتقالش، ولقينا في التحميص فنّ يعشقه القلب. مش بس بنبيع بن.. إحنا بنقدّم مزاج.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-espresso-600">
              كل حبوبة بتمر على عينينا، وكل توليفة ليها سرّها. عايزين كل مرة تطلب فيها تلاقي نفس الطعم اللي
              حبيته أول مرة، وكل ما تيجى تلاقي قهوتك في انتظارك.
            </p>

            <div className="mt-8 space-y-4">
              {PILLARS.map((p) => (
                <div key={p.title} className="flex gap-4 rounded-2xl bg-cream-100 p-4 ring-1 ring-espresso-100/60 transition hover:ring-gold-300/60">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-espresso-700 to-espresso-800 text-gold-400">
                    <p.icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="font-bold text-espresso-800">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-espresso-500">{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
