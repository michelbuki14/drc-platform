'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

export type Role =
  | 'traveler'
  | 'admin'
  | 'airline'
  | 'airport_ops'
  | 'ops'
  | 'partner'
  | 'backoffice'
  | 'agent';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  walletBalanceUsd?: number;
}

interface AuthCtx {
  user: AuthUser | null;
  role: Role | null;
  setUser: (u: AuthUser | null) => void;
  logout: () => void;
  loading: boolean;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  role: null,
  setUser: () => {},
  logout: () => {},
  loading: true,
});

const STORAGE_KEY = 'cc-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUserState(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const logout = useCallback(() => setUser(null), [setUser]);

  return (
    <Ctx.Provider value={{ user, role: user?.role ?? null, setUser, logout, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
