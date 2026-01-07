import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, getToken, removeToken, setToken, login as apiLogin } from '@/lib/api';

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const result = await getCurrentUser();
      if (result) {
        setUser(result.user);
      } else {
        removeToken();
      }
      setIsLoading(false);
    }

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const result = await apiLogin(username, password);
    setToken(result.token);
    setUser(result.user);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
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
