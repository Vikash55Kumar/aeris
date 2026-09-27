'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'admin' | 'guest' | null;

export interface AuthUser {
  role: 'admin' | 'guest';
  name: string;
  subtitle: string;
  email: string;
}

interface AuthContextType {
  role: UserRole;
  user: AuthUser | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  login: (role: 'admin' | 'guest', email?: string) => void;
  logout: () => void;
}

const ADMIN_USER: AuthUser = {
  role: 'admin',
  name: 'Maharashtra SDMA',
  subtitle: 'State Disaster Mgmt Authority',
  email: 'sdma.officer@maharashtra.gov.in',
};

const GUEST_USER: AuthUser = {
  role: 'guest',
  name: 'Guest User',
  subtitle: 'Public Observer Access',
  email: 'guest.observer@aeris.in',
};

const AuthContext = createContext<AuthContextType>({
  role: null,
  user: null,
  isInitialized: false,
  isAuthenticated: false,
  isAdmin: false,
  isGuest: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('aeris_user_role');
      if (storedRole === 'admin' || storedRole === 'guest') {
        setRole(storedRole);
      } else {
        setRole(null);
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      setRole(null);
    } finally {
      setIsInitialized(true);
    }

    const handleStorageChange = () => {
      try {
        const currentRole = localStorage.getItem('aeris_user_role');
        if (currentRole === 'admin' || currentRole === 'guest') {
          setRole(currentRole);
        } else {
          setRole(null);
        }
      } catch (e) {
        setRole(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('aeris_auth_change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('aeris_auth_change', handleStorageChange);
    };
  }, []);

  const login = (newRole: 'admin' | 'guest', emailInput?: string) => {
    try {
      localStorage.setItem('aeris_user_role', newRole);
      if (emailInput) {
        localStorage.setItem('aeris_user_email', emailInput);
      }
      setRole(newRole);
      window.dispatchEvent(new Event('aeris_auth_change'));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }

    if (newRole === 'guest') {
      router.push('/journey');
    } else {
      router.push('/command-center');
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('aeris_user_role');
      localStorage.removeItem('aeris_user_email');
      setRole(null);
      window.dispatchEvent(new Event('aeris_auth_change'));
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    router.push('/login');
  };

  let user: AuthUser | null = null;
  if (role === 'admin') user = ADMIN_USER;
  if (role === 'guest') user = GUEST_USER;

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        isInitialized,
        isAuthenticated: role !== null,
        isAdmin: role === 'admin',
        isGuest: role === 'guest',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
