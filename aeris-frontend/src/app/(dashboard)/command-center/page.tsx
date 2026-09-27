'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { 
  CloudRain, 
  AlertTriangle, 
  Clock, 
  Users, 
  ShieldCheck, 
  ChevronRight, 
  Zap,
  ArrowRight,
  Radio,
  Satellite,
  Crosshair
} from 'lucide-react';

const InteractiveSimulationMap = dynamic(
  () => import('@/components/maps/weather-map').then((mod) => mod.InteractiveSimulationMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[540px] sm:h-[580px] bg-slate-950 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-800">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-300">Initializing Live Simulation Map...</span>
        </div>
      </div>
    ),
  }
);

export default function CommandCenterPage() {
  const [activeLayer, setActiveLayer] = useState<'Composite' | 'Rainfall' | 'Radar' | 'Satellite (INSAT)' | 'Lightning' | 'Risk Layer'>('Composite');
  const [selectedTimeline, setSelectedTimeline] = useState<string>('Now');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-play timeline progression loop
  useEffect(() => {
    if (!isPlaying) return;
    const timelineLabels = ['-2h', '-1h', 'Now', '+1h', '+2h', '+3h', '+4h', '+6h'];
    const timer = setInterval(() => {
      setSelectedTimeline((curr) => {
        const nextIdx = (timelineLabels.indexOf(curr) + 1) % timelineLabels.length;
        return timelineLabels[nextIdx];
      });
    }, 1400);
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="space-y-4 font-sans max-w-[1920px] mx-auto pb-6 select-none">
      
      {/* 1. Header: Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0B2F56] tracking-tight">
          Command Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
          Live situation overview and early warnings for Mumbai and surrounding regions
        </p>
      </div>

      {/* 2. Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Active Events */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
              <CloudRain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Active Events</div>
              <div className="text-2xl font-black text-[#0B2F56] leading-none mt-0.5">3</div>
              <div className="text-[10px] text-slate-400 font-medium mt-1">
                <span className="text-slate-600 font-semibold">1 Severe</span> <span className="text-slate-300">|</span> 2 Moderate
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>

        {/* Card 2: Highest Risk */}
        <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#EF4444] flex items-center justify-center shrink-0 shadow-2xs text-white">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-600">Highest Risk</div>
              <div className="text-2xl font-black text-[#DC2626] leading-none mt-0.5">Severe</div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">Eastern Mumbai</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Card 3: Nearest Impact (ETA) */}
        <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#0284C7] flex items-center justify-center shrink-0 shadow-2xs text-white">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-600">Nearest Impact (ETA)</div>
              <div className="text-2xl font-black text-[#0B2F56] leading-none mt-0.5">1h 45m</div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">Kurla – Sion – BKC</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Card 4: People Potentially Affected */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">People Potentially Affected</div>
              <div className="text-2xl font-black text-[#0B2F56] leading-none mt-0.5">1.2M</div>
              <div className="text-[10px] text-slate-400 font-medium mt-1">In high &amp; very high risk zones</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>

        {/* Card 5: System Status */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#10B981] flex items-center justify-center shrink-0 shadow-2xs text-white">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-600">System Status</div>
              <div className="text-sm font-black text-[#059669] leading-tight mt-0.5">All Systems Operational</div>
              <div className="text-[10px] text-emerald-700/80 font-medium mt-1">Data ingesting in real time</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Left Map + Right Active Severe Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: Real Leaflet Map with Animated Simulation, Overlays, Scrubber and Legend (7 Cols) */}
        <div className="lg:col-span-7 xl:col-span-7">
          <InteractiveSimulationMap
            activeLayer={activeLayer}
            onLayerChange={setActiveLayer}
            selectedTimeline={selectedTimeline}
            onTimelineChange={setSelectedTimeline}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
          />
        </div>

        {/* RIGHT COLUMN: Active Severe Weather Events (5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-between space-y-3.5">
          
          {/* Header Row */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-lg font-bold text-[#0B2F56] tracking-tight">
              Active Severe Weather Events
            </h2>
            <button className="text-xs text-[#087693] hover:underline font-semibold flex items-center gap-1 cursor-pointer">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* EVENT CARD 1: A1027 Severe Convective System (Expanded / High Risk) */}
          <div className="bg-white border-l-4 border-l-[#DC2626] border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            {/* Top Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#0B2F56]">A1027</span>
                    <span className="text-sm font-black text-[#DC2626]">Severe Convective System</span>
                    <span className="bg-[#DC2626] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      High Risk
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-snug font-normal">
                    Intense rainfall and localized cloudburst risk over Eastern &amp; Central Mumbai. Moving NE at 25 km/h.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] text-slate-400 font-medium">Started</div>
                <div className="text-xs font-bold font-mono text-slate-700">14:10 IST</div>
              </div>
            </div>

            {/* Bottom 4-Column Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 pt-3 border-t border-slate-100">
              <div>
                <div className="text-sm sm:text-base font-black text-[#0B2F56] leading-tight">
                  80–120 mm
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight font-medium">
                  Expected Rainfall <br />(next 3 hours)
                </div>
              </div>

              <div>
                <div className="text-sm sm:text-base font-black text-[#0B2F56] leading-tight">
                  2–3 hours
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight font-medium">
                  Time to Impact
                </div>
              </div>

              <div>
                <div className="text-sm sm:text-base font-black text-[#0B2F56] leading-tight">
                  NE 25 km/h
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight font-medium">
                  Movement
                </div>
              </div>

              <div>
                <div className="text-sm sm:text-base font-black text-[#0B2F56] leading-tight">
                  87%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight font-medium">
                  Risk Probability
                </div>
              </div>
            </div>
          </div>

          {/* EVENT CARD 2: A1025 Thunderstorm Cluster (Moderate Risk) */}
          <div className="bg-white border-l-4 border-l-[#F59E0B] border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:bg-slate-50/70 transition-all cursor-pointer">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#0B2F56]">A1025</span>
                    <span className="text-sm font-bold text-[#D97706]">Thunderstorm Cluster</span>
                    <span className="bg-[#FEF3C7] text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                      Moderate
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug font-normal">
                    Scattered thunderstorms over Western Suburbs.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-medium">Started</div>
                  <div className="text-xs font-bold font-mono text-slate-700">13:40 IST</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* EVENT CARD 3: A1023 Heavy Rainfall Event (Moderate Risk) */}
          <div className="bg-white border-l-4 border-l-[#2563EB] border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:bg-slate-50/70 transition-all cursor-pointer">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <CloudRain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#0B2F56]">A1023</span>
                    <span className="text-sm font-bold text-[#2563EB]">Heavy Rainfall Event</span>
                    <span className="bg-[#FEF3C7] text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                      Moderate
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug font-normal">
                    Persistent moderate to heavy rainfall over Navi Mumbai.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-medium">Started</div>
                  <div className="text-xs font-bold font-mono text-slate-700">11:30 IST</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. AERIS EVENT EVOLUTION: From atmospheric signals to expected impact     */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        
        {/* Event Evolution Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#E6F3F7] text-[#087693] font-black text-sm px-2 py-0.5 rounded-md tracking-wider uppercase">
                AERIS
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#0B2F56] tracking-tight flex items-center gap-1.5">
                <span>EVENT EVOLUTION</span>
                <span className="text-slate-400 font-normal text-xs" title="Causal Atmospheric Progression">ⓘ</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              From atmospheric signals to expected impact
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="inline-flex items-center gap-1.5 bg-[#FFF1F2] border border-[#FECDD3] text-[#991B1B] text-xs font-bold px-3 py-1 rounded-full">
              <Zap className="w-3.5 h-3.5 text-[#DC2626] fill-[#DC2626]" />
              <span>Event A1027 – Severe Convective System</span>
            </div>
            <div className="text-xs font-bold text-slate-600 hidden md:block">
              Current Stage: <span className="text-[#DC2626] font-black">Intensification</span>
            </div>
          </div>
        </div>

        {/* 5-Step Connected Evolutionary Pipeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 items-center">
          
          {/* STEP 1: Moisture Accumulation */}
          <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl p-3.5 flex flex-col justify-between h-full shadow-2xs relative">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-sky-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0B2F56] leading-tight">Moisture Accumulation</h4>
                  <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                    High moisture over Arabian Sea and Konkan
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full">
                <span>✓ Completed</span>
              </span>
            </div>
          </div>

          {/* STEP 2: Convection Initiation */}
          <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl p-3.5 flex flex-col justify-between h-full shadow-2xs relative">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <CloudRain className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0B2F56] leading-tight">Convection Initiation</h4>
                  <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                    Convective cells forming over Eastern Mumbai
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full">
                <span>✓ Completed</span>
              </span>
            </div>
          </div>

          {/* STEP 3: Intensification (Current Active Stage) */}
          <div className="bg-[#FFF5F5] border-2 border-[#F87171] rounded-2xl p-3.5 flex flex-col justify-between h-full shadow-sm relative">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#991B1B] leading-tight">Intensification</h4>
                  <p className="text-[10px] text-slate-700 mt-1 leading-snug">
                    Rapid increase in radar reflectivity and lightning
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-[#DC2626] text-white px-3 py-0.5 rounded-full shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>Current Stage</span>
              </span>
            </div>
          </div>

          {/* STEP 4: Heavy Rainfall */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-3.5 flex flex-col justify-between h-full shadow-2xs relative">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <CloudRain className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0B2F56] leading-tight">Heavy Rainfall</h4>
                  <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                    Intense rainfall expected over Eastern &amp; Central Mumbai
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-amber-200 px-2.5 py-0.5 rounded-full">
                <Clock className="w-3 h-3 text-[#92400E]" />
                <span>Next 1 – 3 hours</span>
              </span>
            </div>
          </div>

          {/* STEP 5: Impact */}
          <div className="bg-[#FAF5FF] border border-[#E9D5FF] rounded-2xl p-3.5 flex flex-col justify-between h-full shadow-2xs relative">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 10l9-7 9 7v2H3v-2z" />
                    <path d="M5 12v4M19 12v4" />
                    <path d="M2 17c3-1.5 6-1.5 9 0s6 1.5 9 0 3-1.5 3-1.5" />
                    <path d="M2 20c3-1.5 6-1.5 9 0s6 1.5 9 0 3-1.5 3-1.5" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0B2F56] leading-tight">Impact</h4>
                  <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                    Risk of localized cloudburst, urban flooding and disruption
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#F3E8FF] text-[#6B21A8] border border-purple-200 px-2.5 py-0.5 rounded-full">
                <Clock className="w-3 h-3 text-[#6B21A8]" />
                <span>Next 2 – 3 hours</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM 3-CARD ROW: Impact Areas + Recent Situation + Alerts             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* CARD 1: Impact Areas (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                  <Crosshair className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B2F56]">Impact Areas</h3>
                  <p className="text-[10px] text-slate-400">Areas likely to be affected in next 2–3 hours</p>
                </div>
              </div>
              <button className="text-xs text-[#087693] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer">
                <span>View on Map</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Split Content: Left Mini Map + Right Ranked Impact Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-3.5">
              
              {/* Mini Map Visual (5 cols) */}
              <div className="sm:col-span-5 relative aspect-[4/3] sm:aspect-auto sm:h-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-2xs">
                <Image
                  src="/images/mumbai-radar.jpg"
                  alt="Impact Risk Map"
                  fill
                  className="object-cover object-center"
                />
                
                {/* Landmarks on Mini Map */}
                <span className="absolute top-2 left-2 text-[9px] font-bold text-white bg-black/60 px-1 rounded">Borivali</span>
                <span className="absolute top-8 left-2 text-[9px] font-bold text-white bg-black/60 px-1 rounded">Andheri</span>
                <span className="absolute top-14 left-6 text-[9px] font-bold text-white bg-black/60 px-1 rounded">BKC</span>
                <span className="absolute top-14 left-14 text-[9px] font-black text-white bg-red-600 px-1 rounded">Kurla</span>
                <span className="absolute top-5 right-2 text-[9px] font-bold text-white bg-black/60 px-1 rounded">Thane</span>
                <span className="absolute bottom-6 right-2 text-[8px] font-bold text-white bg-black/60 px-1 rounded">Navi Mumbai</span>
                <span className="absolute bottom-6 left-3 text-[10px] font-black text-white bg-blue-900/80 px-1.5 rounded">Mumbai</span>

                {/* Legend at bottom of mini map */}
                <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-xs p-1.5 text-white">
                  <div className="text-[8px] font-bold text-slate-300">Impact Risk</div>
                  <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 mt-0.5" />
                  <div className="flex justify-between text-[7px] text-slate-300 font-mono mt-0.5">
                    <span>Low</span>
                    <span>Moderate</span>
                    <span>Very High</span>
                  </div>
                </div>
              </div>

              {/* Top 5 Impact Area Rows (7 cols) */}
              <div className="sm:col-span-7 space-y-1.5">
                <div className="text-[11px] font-bold text-[#0B2F56] mb-1">
                  Top Impact Areas (Current Projection)
                </div>

                {[
                  { rank: 1, name: 'Kurla, Kalina, Santa Cruz', severity: 'Very High', badge: 'bg-[#EF4444] text-white' },
                  { rank: 2, name: 'BKC, Bandra East', severity: 'High', badge: 'bg-[#FEE2E2] text-[#DC2626]' },
                  { rank: 3, name: 'Chembur, Govandi', severity: 'High', badge: 'bg-[#FEE2E2] text-[#DC2626]' },
                  { rank: 4, name: 'Andheri, Jogeshwari', severity: 'Moderate', badge: 'bg-[#FEF3C7] text-[#D97706]' },
                  { rank: 5, name: 'Eastern Suburbs (Thane border)', severity: 'Moderate', badge: 'bg-[#FEF3C7] text-[#D97706]' },
                ].map((item) => (
                  <div key={item.rank} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        {item.rank}
                      </span>
                      <span className="text-slate-700 font-semibold text-[11px] truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${item.badge}`}>
                      {item.severity}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* CARD 2: Recent Situation (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3v18h18v-2H5V3H3zm4 14h2v-4H7v4zm4 0h2V7h-2v10zm4 0h2v-7h-2v7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B2F56]">Recent Situation</h3>
                  <p className="text-[10px] text-slate-400">Key changes in the last 1 hour</p>
                </div>
              </div>
            </div>

            {/* Telemetry Metric Rows */}
            <div className="space-y-2 mt-3 text-xs">
              
              {/* 1. Rainfall Intensity */}
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                  <span>Rainfall Intensity</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-bold">▲▲▲</span>
                  <span className="font-bold text-[#0B2F56] font-mono">92 mm/hr</span>
                  <span className="text-[10px] font-bold bg-red-50 text-red-700 px-1.5 py-0.2 rounded border border-red-200">
                    Increasing
                  </span>
                </div>
              </div>

              {/* 2. Radar Reflectivity */}
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Radar Reflectivity</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-bold">↗</span>
                  <span className="font-bold text-[#0B2F56] font-mono">52 dBZ</span>
                  <span className="text-[10px] font-bold bg-red-50 text-red-700 px-1.5 py-0.2 rounded border border-red-200">
                    Increasing
                  </span>
                </div>
              </div>

              {/* 3. Lightning Activity */}
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Lightning Activity</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold">▲▲</span>
                  <span className="font-bold text-[#0B2F56] font-mono">36 strikes</span>
                  <span className="text-[10px] font-bold bg-red-50 text-red-700 px-1.5 py-0.2 rounded border border-red-200">
                    High
                  </span>
                </div>
              </div>

              {/* 4. Cloud Top Temp */}
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Satellite className="w-3.5 h-3.5 text-blue-500" />
                  <span>Cloud Top Temp</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sky-500 font-bold">↘</span>
                  <span className="font-bold text-[#0B2F56] font-mono">-72 °C</span>
                  <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-1.5 py-0.2 rounded border border-sky-200">
                    Rapid Cooling
                  </span>
                </div>
              </div>

              {/* 5. Wind (Surface) */}
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.7 7.7A7.1 7.1 0 1 1 5 14.9" /><path d="M9.6 17.7A7.1 7.1 0 0 0 21 12.3" /></svg>
                  <span>Wind (Surface)</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold">~</span>
                  <span className="font-bold text-[#0B2F56] font-mono">NE 25 km/h</span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                    Steady
                  </span>
                </div>
              </div>

              {/* 6. Moisture (IMDAA) */}
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                  <span>Moisture (IMDAA)</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">↗</span>
                  <span className="font-bold text-[#0B2F56] font-mono">High CAPE</span>
                  <span className="text-[10px] font-bold bg-red-50 text-red-700 px-1.5 py-0.2 rounded border border-red-200">
                    High
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Yellow Lightbulb Diagnostic Callout Box */}
          <div className="mt-3 p-2.5 rounded-xl bg-[#FEFCE8] border border-[#FEF08A] flex items-start gap-2">
            <span className="text-base shrink-0">💡</span>
            <p className="text-[10px] text-amber-900 font-medium leading-snug">
              Atmospheric conditions are rapidly intensifying, increasing the likelihood of heavy rainfall and localized cloudburst.
            </p>
          </div>
        </div>

        {/* CARD 3: Alerts (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B2F56]">Alerts</h3>
                  <p className="text-[10px] text-slate-400">Latest alerts and notifications</p>
                </div>
              </div>
              <button className="text-xs text-[#087693] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer">
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Alerts List */}
            <div className="space-y-2.5 mt-3">
              {[
                { time: '15:45', title: 'Heavy rainfall intensifying over Kurla and BKC', level: 'High', badge: 'bg-[#FEE2E2] text-[#DC2626]', dot: 'bg-red-500' },
                { time: '15:20', title: 'Thunderstorm with frequent lightning', level: 'Moderate', badge: 'bg-[#FEF3C7] text-[#D97706]', dot: 'bg-amber-500' },
                { time: '14:50', title: 'Localized cloudburst risk increasing in Eastern Mumbai', level: 'High', badge: 'bg-[#FEE2E2] text-[#DC2626]', dot: 'bg-red-500' },
                { time: '14:10', title: 'Severe convective system detected (A1027)', level: 'High', badge: 'bg-[#FEE2E2] text-[#DC2626]', dot: 'bg-red-500' },
                { time: '13:35', title: 'Rising water level in Mithi River', level: 'Moderate', badge: 'bg-[#FEF3C7] text-[#D97706]', dot: 'bg-amber-500' },
              ].map((alert, idx) => (
                <div key={idx} className="flex items-start justify-between gap-1.5 text-xs">
                  <div className="flex items-start gap-1.5 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${alert.dot}`} />
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{alert.time}</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-700 font-medium leading-tight line-clamp-2">
                      {alert.title}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${alert.badge}`}>
                    {alert.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}



