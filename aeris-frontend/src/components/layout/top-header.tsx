'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  Bell, 
  MapPin, 
  Radio, 
  Satellite, 
  CloudRain, 
  Waves, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  X, 
  ExternalLink,
  Sliders,
  LogOut,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

const BASINS = [
  { id: 'mumbai', name: 'Mumbai MMR', region: 'Konkan Basin', status: 'Red Alert', active: true },
  { id: 'pune', name: 'Pune Catchment', region: 'Western Ghats', status: 'Normal', active: false },
  { id: 'coastal', name: 'Coastal Konkan', region: 'Ratnagiri / Sindhudurg', status: 'Watch', active: false },
  { id: 'national', name: 'National Overview', region: 'All India Synoptic', status: 'Active', active: false },
];

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Flash Flood Warning — Mithi River',
    time: '2 mins ago',
    type: 'critical',
    desc: 'Water level crossed 3.82m (Warning threshold 3.50m) at CST Bridge.',
  },
  {
    id: 2,
    title: 'Severe Convective Cell Detected',
    time: '6 mins ago',
    type: 'critical',
    desc: 'Doppler radar reflectivity 56.8 dBZ moving NE over Kurla-Chembur.',
  },
  {
    id: 3,
    title: 'Waterlogging Alert — Sion Circle',
    time: '12 mins ago',
    type: 'warning',
    desc: 'Depth reached 42cm. Traffic diversion recommended for LBS Marg.',
  },
  {
    id: 4,
    title: 'INSAT-3DR Cloud-Top Rapid Cooling',
    time: '18 mins ago',
    type: 'warning',
    desc: 'Cloud top temperature dropped to -68.4°C over Mumbai Basin.',
  },
  {
    id: 5,
    title: 'CAP Warning Broadcast Dispatched',
    time: '25 mins ago',
    type: 'info',
    desc: 'Cellular emergency alert successfully sent to 1.2M citizens in Zone 3.',
  },
];

export const TopHeader: React.FC = () => {
  const { user, isGuest, logout } = useAuth();
  const [selectedBasin, setSelectedBasin] = useState(BASINS[0]);
  const [basinDropdownOpen, setBasinDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState(5);

  const basinRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Live real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata',
        }) + ' IST'
      );
      setCurrentDate(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: 'Asia/Kolkata',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (basinRef.current && !basinRef.current.contains(e.target as Node)) {
        setBasinDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="shrink-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-900 select-none px-4 sm:px-6 py-2.5 shadow-xs z-50">
      <div className="flex items-center justify-between gap-3 xl:gap-6">
        
        {/* LEFT: Brand Logo & Jurisdiction Switcher */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link href="/command-center" className="flex items-center gap-2.5 shrink-0 group">
            <Image
              src="/logo.png"
              alt="AERIS Logo"
              width={128}
              height={30}
              className="h-7 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              priority
            />
          </Link>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Basin / Jurisdiction Selector */}
          <div className="relative" ref={basinRef}>
            <button
              onClick={() => setBasinDropdownOpen(!basinDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 border border-slate-200/80 bg-slate-50/60 text-left transition-all cursor-pointer group"
              title="Select Operational Basin"
            >
              <div className="w-6 h-6 rounded-md bg-[#087693]/10 text-[#087693] flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#087693]" />
              </div>
              <div className="hidden md:block leading-tight">
                <div className="text-xs font-bold text-[#0B2F56] flex items-center gap-1.5">
                  {selectedBasin.name}
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {selectedBasin.region}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${basinDropdownOpen ? 'rotate-180 text-[#087693]' : ''}`} />
            </button>

            {/* Basin Dropdown */}
            {basinDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Select Operational Jurisdiction
                </div>
                {BASINS.map((basin) => (
                  <button
                    key={basin.id}
                    onClick={() => {
                      setSelectedBasin(basin);
                      setBasinDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      selectedBasin.id === basin.id ? 'bg-[#E6F3F7]/50 font-semibold' : ''
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0B2F56]">{basin.name}</div>
                      <div className="text-[10px] text-slate-500">{basin.region}</div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        basin.status === 'Red Alert'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : basin.status === 'Watch'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {basin.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CENTER: Real-Time Telemetry Feed & Ingestion Status */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6 shrink-0">
          {/* Time and Date */}
          <div className="text-center font-sans border-r border-slate-200 pr-4 xl:pr-6">
            <div className="text-[13px] text-slate-500 font-medium tracking-tight">
              {currentDate || 'Mon, 21 Jul 2025'}
            </div>
            <div className="text-base md:text-md font-black text-[#0B2F56] font-mono tracking-tight leading-none mt-0.5">
              {currentTime || '14:20:00 IST'}
            </div>
          </div>

          {/* Live Ingestion Indicator */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="flex flex-col text-left leading-none">
              <span className="text-[11px] font-bold text-emerald-800 tracking-tight">LIVE RADAR</span>
              <span className="text-[9px] text-emerald-600 font-medium">Sync: 1.2m ago</span>
            </div>
          </div>

          {/* 4 Sensor Telemetry Indicators */}
          <div className="flex items-center gap-3 xl:gap-4 text-center text-[10px] font-sans text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl">
            {/* IMD Radar */}
            <div className="flex items-center gap-1.5 px-1 py-0.5 group" title="IMD Doppler Weather Radar (Santacruz): Active 56.8 dBZ peak">
              <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-[#087693]">
                <Radio className="w-4 h-4 text-[#087693]" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-[10px] font-bold text-[#0B2F56]">IMD</span>
                <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                  Radar <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
              </div>
            </div>

            <div className="w-px h-4 bg-slate-200" />

            {/* INSAT Satellite */}
            <div className="flex items-center gap-1.5 px-1 py-0.5 group" title="INSAT-3DR Rapid Cloud Top Cooling: -68.4°C detected">
              <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-[#087693]">
                <Satellite className="w-4 h-4 text-[#087693]" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-[10px] font-bold text-[#0B2F56]">INSAT</span>
                <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                  Thermal <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
              </div>
            </div>

            <div className="w-px h-4 bg-slate-200" />

            {/* IMDAA Model */}
            <div className="flex items-center gap-1.5 px-1 py-0.5 group" title="IMDAA High-Resolution Atmospheric Model: 4km Grid Synchronized">
              <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-[#087693]">
                <CloudRain className="w-4 h-4 text-[#087693]" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-[10px] font-bold text-[#0B2F56]">IMDAA</span>
                <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                  NWP <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
              </div>
            </div>

            <div className="w-px h-4 bg-slate-200" />

            {/* CWC River Gauges */}
            <div className="flex items-center gap-1.5 px-1 py-0.5 group" title="Central Water Commission River Gauges: 14 Inundation Nodes Live">
              <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-[#087693]">
                <Waves className="w-4 h-4 text-[#087693]" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-[10px] font-bold text-[#0B2F56]">CWC</span>
                <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                  Hydro <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Alert Bell Popover & Agency Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          
          {/* Quick Alert Bell with Interactive Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 rounded-full hover:bg-slate-100 cursor-pointer text-slate-600 hover:text-[#0B2F56] transition-colors"
              title="View Emergency Alerts"
              aria-label="Emergency Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#DC2626] text-white font-mono text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in-50 zoom-in-95 font-sans">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
                    <span className="text-xs font-bold text-[#0B2F56]">Active Incident Feeds</span>
                    <span className="bg-red-50 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-red-200">
                      {unreadCount}
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => setUnreadCount(0)}
                      className="text-[11px] font-medium text-[#087693] hover:underline cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
                  {NOTIFICATIONS.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 text-left cursor-pointer"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          item.type === 'critical'
                            ? 'bg-red-500'
                            : item.type === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-[#087693]'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-[#0B2F56] truncate">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 border-t border-slate-100 bg-slate-50 rounded-b-2xl text-center">
                  <Link
                    href="/command-center"
                    onClick={() => setNotifDropdownOpen(false)}
                    className="text-xs font-medium text-[#087693] hover:text-[#0B2F56] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Open Command Center Incident Board</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200" />

          {/* Agency & User Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
            >
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-bold text-[#0B2F56] tracking-tight group-hover:text-[#087693] transition-colors flex items-center gap-1.5">
                  <span>{user?.name || 'Maharashtra SDMA'}</span>
                  {isGuest && (
                    <span className="text-[9px] font-bold bg-cyan-50 text-[#087693] border border-cyan-200 px-1.5 py-0.2 rounded">
                      Guest
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {user?.subtitle || 'State Disaster Mgmt Authority'}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180 text-[#087693]' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in-50 zoom-in-95 font-sans">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-[#0B2F56]">{user?.name || 'Operations Officer'}</div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">{user?.email || 'sdma.officer@maharashtra.gov.in'}</div>
                  <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-1.5 ${
                    isGuest 
                      ? 'bg-slate-100 text-slate-600' 
                      : 'bg-[#E6F3F7] text-[#087693] border border-[#087693]/20'
                  }`}>
                    {isGuest ? 'Public Observer Mode' : 'Operations Officer'}
                  </span>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer font-semibold"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>{isGuest ? 'Exit Guest Mode / Sign In' : 'Sign Out / Switch Operator'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

