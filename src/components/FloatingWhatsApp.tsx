import { MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../data';

export default function FloatingWhatsApp() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="راسلنا واتساب"
      className="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-warm-lg transition-transform hover:scale-110 active:scale-95"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-green-500 opacity-30" />
      <MessageCircle className="relative h-7 w-7" />
    </a>
  );
}
