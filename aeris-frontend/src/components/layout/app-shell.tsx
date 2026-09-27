'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TopHeader } from './top-header';
import { SideNavigation } from './side-navigation';
import { useAuth } from '@/lib/auth-context';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isGuest, isInitialized } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    // Strict Route Guard: If not authenticated, redirect to /login
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Guest Route Guard: Guest can only view /journey
    if (isGuest && pathname && pathname !== '/journey') {
      router.replace('/journey');
    }
  }, [isAuthenticated, isGuest, isInitialized, pathname, router]);

  // Loading state while checking authentication
  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F5F8FB] text-[#0B2F56] font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#087693] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500 tracking-wide uppercase font-mono">
            Verifying Authentication...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#F5F8FB] text-[#0B2F56] font-sans selection:bg-[#087693] selection:text-white overflow-hidden">
      <TopHeader />
      <div className="flex-1 flex flex-col md:flex-row w-full min-h-0 overflow-hidden">
        <SideNavigation />
        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-[#F5F8FB] px-3 sm:px-6 py-4 max-w-[1920px]">
          {children}
        </main>
      </div>
    </div>
  );
};
