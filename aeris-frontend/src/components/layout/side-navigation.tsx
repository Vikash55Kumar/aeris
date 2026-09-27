'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CloudRain, 
  Waves, 
  Route,
  Database, 
  Sliders, 
  CheckCircle2 
} from 'lucide-react';

import { useAuth } from '@/lib/auth-context';

export const SideNavigation: React.FC = () => {
  const pathname = usePathname();
  const { isGuest, isAdmin } = useAuth();

  const isCommand = pathname?.includes('command-center') || pathname === '/';
  const isWeather = pathname?.includes('weather-intelligence');
  const isJourney = pathname?.includes('journey');

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between select-none shrink-0 h-full overflow-y-auto font-sans p-4 z-30 shadow-2xs">
      <div className="space-y-6">
        
        {/* Core Operations Section */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            {isGuest ? 'Public Intelligence' : 'Operations'}
          </div>
          
          <nav className="space-y-1.5">
            {/* Admin only: Command Center */}
            {isAdmin && (
              <Link
                href="/command-center"
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isCommand
                    ? 'bg-[#E6F3F7] text-[#087693] border border-[#087693]/30 shadow-2xs'
                    : 'text-slate-600 hover:text-[#0B2F56] hover:bg-slate-100/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className={`w-5 h-5 ${isCommand ? 'text-[#087693]' : 'text-slate-400'}`} />
                  <span className={isCommand ? 'text-[#087693] font-bold' : ''}>Command Center</span>
                </div>
                {isCommand && (
                  <span className="w-2 h-2 rounded-full bg-[#087693] animate-pulse" />
                )}
              </Link>
            )}

            {/* Admin only: Weather Intelligence */}
            {isAdmin && (
              <Link
                href="/weather-intelligence"
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isWeather
                    ? 'bg-[#E6F3F7] text-[#087693] border border-[#087693]/30 shadow-2xs'
                    : 'text-slate-600 hover:text-[#0B2F56] hover:bg-slate-100/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CloudRain className={`w-5 h-5 ${isWeather ? 'text-[#087693]' : 'text-slate-400'}`} />
                  <span className={isWeather ? 'text-[#087693] font-bold' : ''}>Weather Intelligence</span>
                </div>
                {isWeather && (
                  <span className="w-2 h-2 rounded-full bg-[#087693] animate-pulse" />
                )}
              </Link>
            )}

            {/* Both Admin & Guest (Only page shown for Guest) */}
            <Link
              href="/journey"
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                isJourney
                  ? 'bg-[#E6F3F7] text-[#087693] border border-[#087693]/30 shadow-2xs'
                  : 'text-slate-600 hover:text-[#0B2F56] hover:bg-slate-100/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Route className={`w-5 h-5 ${isJourney ? 'text-[#087693]' : 'text-slate-400'}`} />
                <span className={isJourney ? 'text-[#087693] font-bold' : ''}>AERIS Journey</span>
              </div>
              {isJourney && (
                <span className="w-2 h-2 rounded-full bg-[#087693] animate-pulse" />
              )}
            </Link>
          </nav>
        </div>

        {/* System & Protocols Section (Admin Only) */}
        {isAdmin && (
          <div>
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              System
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => alert('Data Status: 9/9 Ingestion Pipelines Synchronized & Operational.')}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-[#0B2F56] hover:bg-slate-100/80 transition-all text-left cursor-pointer border border-transparent"
              >
                <Database className="w-5 h-5 text-slate-400" />
                <span>Data Pipelines</span>
              </button>

              <button
                onClick={() => alert('Settings: Operational thresholds configured for NDMA Protocol Level 1.')}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-[#0B2F56] hover:bg-slate-100/80 transition-all text-left cursor-pointer border border-transparent"
              >
                <Sliders className="w-5 h-5 text-slate-400" />
                <span>System Settings</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* System Health / Access Footer */}
      <div className="pt-4 border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isGuest ? 'bg-cyan-500' : 'bg-emerald-500'}`} />
            <span className="text-xs font-semibold text-[#0B2F56]">
              {isGuest ? 'Guest Access' : 'Pipelines Live'}
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#087693] bg-[#E6F3F7] px-2 py-0.5 rounded-md">
            {isGuest ? 'Public' : '9 / 9'}
          </span>
        </div>
      </div>
    </aside>
  );
};

