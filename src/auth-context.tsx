import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { verifyCashier } from './cashier-users-store';

export type PortalRole = 'admin' | 'barista' | 'cashier';

interface AuthState {
  role: PortalRole | null;
  cashierName?: string; // display name of the logged-in cashier
}

interface AuthContextValue {
  role: PortalRole | null;
  cashierName: string | null;
  login: (role: PortalRole, username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const CREDENTIALS: Record<Exclude<PortalRole, 'cashier'>, { username: string; password: string }> = {
  admin: { username: 'admin', password: 'admin123' },
  barista: { username: 'barista', password: 'coffee123' },
};

const STORAGE_KEY = 'bq_auth_session';

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): AuthState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { role: null };
    return JSON.parse(raw) as AuthState;
  } catch {
    return { role: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => readSession());

  const login = useCallback(async (target: PortalRole, username: string, password: string): Promise<boolean> => {
    if (target === 'cashier') {
      const user = await verifyCashier(username, password);
      if (!user) return false;
      const next: AuthState = { role: 'cashier', cashierName: user.name };
      setState(next);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return true;
    }
    const cred = CREDENTIALS[target];
    if (username.trim() === cred.username && password === cred.password) {
      const next: AuthState = { role: target };
      setState(next);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setState({ role: null });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AuthContext.Provider value={{ role: state.role, cashierName: state.cashierName ?? null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
