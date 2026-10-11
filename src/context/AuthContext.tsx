import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCustomer, type ShopifyCustomer } from '../lib/shopify-auth';

interface AuthContextType {
  user: ShopifyCustomer | null;
  loading: boolean;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<ShopifyCustomer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      localStorage.removeItem('shopify_access_token');
      sessionStorage.removeItem('shopify_access_token');
    } catch {
      // Ignore blocked browser storage.
    }
  }, []);

  const setAccessToken = useCallback((token: string | null) => {
    try {
      sessionStorage.removeItem('shopify_access_token');
    } catch {
      // Ignore blocked browser storage; the access token is never persisted.
    }
    try {
      // Remove the previous persistent bearer token left by older builds.
      localStorage.removeItem('shopify_access_token');
    } catch {
      // Ignore blocked local storage.
    }
    setUser(null);
    setLoading(Boolean(token));
    setAccessTokenState(token);
  }, []);

  const logout = useCallback(() => setAccessToken(null), [setAccessToken]);

  useEffect(() => {
    let active = true;
    async function fetchUser() {
      if (!accessToken) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const customer = await getCustomer(accessToken);
        if (!active) return;
        if (customer) {
          setUser(customer);
        } else {
          setAccessToken(null);
        }
      } catch {
        if (active) setAccessToken(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchUser();
    return () => {
      active = false;
    };
  }, [accessToken, setAccessToken]);

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, setAccessToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
