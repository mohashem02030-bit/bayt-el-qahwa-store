import { useEffect, useState } from 'react';
import { CartProvider } from './cart-context';
import { AuthProvider, useAuth, type PortalRole } from './auth-context';
import Header from './components/Header';
import Hero from './components/Hero';
import BrandStory from './components/BrandStory';
import Menu from './components/Menu';
import Offers from './components/Offers';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import InstallAppBanner from './components/InstallAppBanner';
import PushOptInBanner from './components/PushOptInBanner';
import AuthModal from './components/AuthModal';
import AdminView from './components/AdminView';
import BaristaView from './components/BaristaView';
import CashierView from './components/CashierView';

type View = 'store' | 'admin' | 'barista' | 'cashier';

function parseHash(): View {
  const h = window.location.hash.replace('#', '');
  if (h === 'admin') return 'admin';
  if (h === 'barista') return 'barista';
  if (h === 'cashier') return 'cashier';
  return 'store';
}

function AppContent() {
  const { role, login, logout } = useAuth();
  const [view, setView] = useState<View>(() => parseHash());
  const [authTarget, setAuthTarget] = useState<PortalRole | null>(null);

  useEffect(() => {
    const onHash = () => setView(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const onOpenPortal = (e: Event) => {
      const detail = (e as CustomEvent<PortalRole>).detail;
      setAuthTarget(detail);
    };
    window.addEventListener('bq-open-portal', onOpenPortal as EventListener);
    return () => window.removeEventListener('bq-open-portal', onOpenPortal as EventListener);
  }, []);

  const backToStore = () => {
    setView('store');
    window.location.hash = '';
  };

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    if (!authTarget) return false;
    const ok = await login(authTarget, username, password);
    if (ok) {
      setView(authTarget);
      window.location.hash = authTarget;
      setAuthTarget(null);
    }
    return ok;
  };

  if (view === 'admin' && role === 'admin') {
    return <AdminView onLogout={() => { logout(); backToStore(); }} onBack={backToStore} />;
  }
  if (view === 'barista' && role === 'barista') {
    return <BaristaView onLogout={() => { logout(); backToStore(); }} onBack={backToStore} />;
  }
  if (view === 'cashier' && role === 'cashier') {
    return <CashierView onLogout={() => { logout(); backToStore(); }} onBack={backToStore} />;
  }

  // If URL hash says admin/barista/cashier but not authenticated, prompt auth
  const needsAuth = view === 'admin' || view === 'barista' || view === 'cashier' ? (view as PortalRole) : null;

  return (
    <>
      <div className="min-h-screen bg-cream-50">
        <Header />
        <main>
          <Hero />
          <BrandStory />
          <Menu />
          <Offers />
          <PushOptInBanner />
        </main>
        <Footer />
        <CartDrawer />
        <FloatingWhatsApp />
        <InstallAppBanner />
      </div>
      {(authTarget || needsAuth) && (
        <AuthModal
          role={(authTarget ?? needsAuth) as PortalRole}
          onClose={() => { setAuthTarget(null); if (needsAuth) backToStore(); }}
          onLogin={handleLogin}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
