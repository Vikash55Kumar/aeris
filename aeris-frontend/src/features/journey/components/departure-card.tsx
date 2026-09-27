'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Milestone, 
  CloudRain, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Navigation,
  Compass
} from 'lucide-react';
import { RouteStrategy, TravelMode } from '../types';
import { 
  getRoutesForLocationPair, 
  getDynamicDepartureOptions,
  getOffsetHHMM
} from '../services/journey-simulation-data';

interface DepartureCardProps {
  fromLocation: string;
  toLocation: string;
  selectedDepartureTime: string;
  onSelectDepartureTime: (time: string) => void;
  selectedRoute: RouteStrategy;
  onSelectRoute: (route: RouteStrategy) => void;
  travelMode: TravelMode;
  onSelectCorridor?: (from: string, to: string) => void;
}

export const DepartureCard: React.FC<DepartureCardProps> = ({ 
  fromLocation,
  toLocation,
  selectedDepartureTime,
  onSelectDepartureTime,
  selectedRoute,
  onSelectRoute,
  travelMode,
  onSelectCorridor,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const isBlank = !fromLocation || !toLocation;

  const routesData = getRoutesForLocationPair(fromLocation || 'Thane', toLocation || 'Borivali', selectedDepartureTime, travelMode);
  const activeRouteObj = routesData[selectedRoute] || routesData.balanced;

  // Generate dynamic 5 departure slots based on current real-time clock
  const dynamicOptions = getDynamicDepartureOptions(currentTime, activeRouteObj.duration);
  const recommendedSlot = dynamicOptions.find(o => o.isRecommended) || dynamicOptions[3];

  // Active chosen slot object
  const activeChosenSlot = dynamicOptions.find(o => o.time === selectedDepartureTime) || 
    (selectedDepartureTime ? {
      time: selectedDepartureTime,
      journeyTime: activeRouteObj.duration,
      risk: 'Low' as const,
      reason: 'User custom departure selection',
      isRecommended: false,
      score: 85,
    } : recommendedSlot);

  const isRecommendedActive = activeChosenSlot.isRecommended || activeChosenSlot.time === recommendedSlot.time;
  const isHighRisk = activeChosenSlot.risk === 'High' || activeChosenSlot.risk === 'Critical';
  const isModerateRisk = activeChosenSlot.risk === 'Moderate';

  // Confidence & Score
  const confidenceScore = isBlank ? 0 : isRecommendedActive ? 82 : isHighRisk ? 38 : 68;
  const strokeDashOffset = 113.1 * (1 - confidenceScore / 100);

  const getModeSpecificBullets = () => {
    if (isBlank) {
      return [
        'Awaiting departure origin and destination selection',
        'Spatial-temporal convective storm radar tracking ready',
        'NDMA & IMD weather threshold alerts will compute on selection',
        'Multi-route elevation and waterlogging bypass enabled',
      ];
    }
    const improveTime = getOffsetHHMM(currentTime, 35);
    if (isHighRisk) {
      return [
        `⚠️ High rainfall intensity (60–110 mm/hr) active along ${fromLocation} corridor`,
        'Increased risk of localized waterlogging on arterial underpasses and expressways',
        'Reduced braking efficiency and tire hydroplaning hazard',
        `Heavy precipitation expected to clear after ${improveTime} IST`,
      ];
    }
    if (isModerateRisk) {
      return [
        `Moderate rainfall active along ${fromLocation} corridor; runoff decreasing`,
        'Surface water draining on major expressways',
        'Visibility improving (>3.5 km) across transit links',
        `Optimal clear travel conditions expected after ${improveTime} IST`,
      ];
    }
    switch (travelMode) {
      case 'bike':
        return [
          `Avoids peak lightning discharge window along ${fromLocation} corridor`,
          'Wind gusts dropping from 48 km/h to 18 km/h on open expressways',
          'Tire traction and road grip restored on major links',
          `Conditions clear across all corridor segments after ${improveTime}`,
        ];
      case 'transit':
        return [
          'Suburban transit & bus routes operating without storm diversions',
          'Railway tracks clear of localized surface pooling',
          'Transit station footbridges safe from heavy downpours',
          `Estimated transit commute: ${activeRouteObj.duration} with normal frequency`,
        ];
      case 'emergency':
        return [
          'Zero-submergence corridor verified for emergency fleet',
          'Clear priority lanes identified across active segments',
          'Fastest emergency response time with minimal weather friction',
          'NDMA Protocol Level 1 advisory satisfied',
        ];
      case 'car':
      default:
        return [
          `Avoids severe convective rainfall window along ${fromLocation} corridor`,
          'Lower thunderstorm and lightning exposure',
          'Reduced risk of waterlogging on major roads and flyovers',
          `Conditions expected to improve after ${improveTime}`,
        ];
    }
  };

  const bullets = getModeSpecificBullets();

  if (isBlank) {
    return (
      <div className="space-y-4 font-sans select-none flex flex-col h-full justify-between">
        
        {/* 1. TOP BLANK CARD: Prompt to Select Journey */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between">
          <div>
            {/* Header Bar */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0070F3] border border-blue-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                  <Compass className="w-5 h-5 text-[#0070F3] animate-spin-slow" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <span>Awaiting Route Selection</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded-md font-semibold">
                      Initial State
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#0B2F56] tracking-tight mt-0.5">
                    Select Your Journey
                  </div>
                </div>
              </div>

              {/* Inactive Gauge */}
              <div className="flex flex-col items-center shrink-0 opacity-40">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" fill="transparent" stroke="#E2E8F0" strokeWidth="3" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-slate-400">
                    --
                  </div>
                </div>
                <span className="text-[9px] font-semibold text-slate-400 mt-0.5">Confidence</span>
              </div>
            </div>

            {/* Explanatory Prompt */}
            <p className="text-xs text-slate-500 font-medium mt-3 leading-relaxed">
              Choose your origin and destination above, or pick one of Mumbai&apos;s high-density demonstration corridors to evaluate real-time convective rainfall and compute the safest departure window.
            </p>

            {/* Quick Demo Corridors Pills */}
            <div className="mt-3.5 pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Demonstration Corridors:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSelectCorridor?.('Thane', 'Borivali')}
                  className="px-3 py-1.5 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-[#0070F3] font-bold text-xs border border-blue-200 cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <span>Thane &rarr; Borivali</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectCorridor?.('Mumbai Airport (BOM)', 'Thane')}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <span>Mumbai Airport &rarr; Thane</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectCorridor?.('BKC', 'Navi Mumbai (Vashi)')}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <span>BKC &rarr; Navi Mumbai</span>
                </button>
              </div>
            </div>

            {/* Metric Placeholders */}
            <div className="grid grid-cols-3 gap-3 my-4 pt-3 border-t border-slate-100 opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200/60">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Expected Time</div>
                  <div className="text-xs font-bold text-slate-600">--</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200/60">
                  <Milestone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Distance</div>
                  <div className="text-xs font-bold text-slate-600">--</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200/60">
                  <CloudRain className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Weather Exposure</div>
                  <div className="text-xs font-bold text-slate-600">--</div>
                </div>
              </div>
            </div>
          </div>

          {/* Capabilities List */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. BOTTOM BLANK CARD: Options Placeholder */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-700">
                Other Departure Options
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Select your origin and destination to generate departure windows
              </p>
            </div>
          </div>
          <div className="py-6 flex flex-col items-center justify-center text-center text-slate-400">
            <Clock className="w-6 h-6 text-slate-300 mb-1.5" />
            <span className="text-xs font-semibold text-slate-500">Departure Timeline Awaiting Input</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Slots will calculate spatial rain cells along your route</span>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans select-none flex flex-col h-full justify-between">
      
      {/* 1. TOP CARD: Dynamic Selected / Recommended Departure & XAI Engine */}
      <div className={`rounded-2xl border p-4 sm:p-5 shadow-xs relative overflow-hidden transition-all duration-300 ${
        isHighRisk
          ? 'bg-red-50/40 border-red-200'
          : isModerateRisk
          ? 'bg-amber-50/40 border-amber-200'
          : 'bg-white border-slate-200/90'
      }`}>
        
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {/* Status Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${
              isHighRisk
                ? 'bg-red-100 text-red-600 border-red-200'
                : isModerateRisk
                ? 'bg-amber-100 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
            }`}>
              {isHighRisk ? (
                <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
              ) : isModerateRisk ? (
                <Clock className="w-5 h-5 text-amber-700" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              )}
            </div>

            <div>
              {/* Title label */}
              <div className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                <span className={
                  isHighRisk
                    ? 'text-red-700'
                    : isModerateRisk
                    ? 'text-amber-800'
                    : 'text-emerald-700'
                }>
                  {isRecommendedActive ? 'Recommended Departure' : 'Selected Departure Window'}
                </span>
                <span className={`text-[10px] px-2 py-0.2 rounded-md font-semibold ${
                  isHighRisk
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : isModerateRisk
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isRecommendedActive ? 'AI Optimized' : activeChosenSlot.risk.toUpperCase() + ' RISK'}
                </span>
              </div>

              {/* Dynamic Time & Risk Badge */}
              <div className="flex flex-wrap items-center gap-2.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0B2F56] tracking-tight">
                  {activeChosenSlot.time} IST
                </span>
                <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                  isHighRisk
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : isModerateRisk
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}>
                  {activeChosenSlot.risk.toUpperCase()} WEATHER RISK
                </span>
              </div>
            </div>
          </div>

          {/* Circular Confidence Meter */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="transparent"
                  stroke="#E2E8F0"
                  strokeWidth="3.5"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="transparent"
                  stroke={isHighRisk ? '#EF4444' : isModerateRisk ? '#F59E0B' : '#10B981'}
                  strokeWidth="3.5"
                  strokeDasharray="113.1"
                  strokeDashoffset={strokeDashOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-[#0B2F56]">
                {confidenceScore}%
              </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Confidence</span>
          </div>
        </div>

        {/* AI Recommendation Alert if user picks a high/moderate risk time */}
        {!isRecommendedActive && (
          <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs animate-in fade-in-50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0070F3] shrink-0" />
              <span className="text-slate-700 font-medium text-[11px]">
                AI Recommendation: Delaying departure to <strong className="text-[#0070F3] font-bold">{recommendedSlot.time} IST</strong> provides lower weather risk.
              </span>
            </div>
            <button
              onClick={() => onSelectDepartureTime(recommendedSlot.time)}
              className="text-[11px] font-bold text-[#0070F3] hover:underline bg-white px-2 py-0.5 rounded-md border border-blue-300 shadow-2xs cursor-pointer shrink-0 ml-2"
            >
              Switch to {recommendedSlot.time}
            </button>
          </div>
        )}

        {/* 3 Metric Columns */}
        <div className="grid grid-cols-3 gap-3 my-4 pt-3 border-t border-slate-200/60">
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-slate-500 border border-slate-200/60">
              <Clock className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Expected Journey Time</div>
              <div className="text-xs sm:text-sm font-bold text-[#0B2F56]">{activeRouteObj.duration}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-slate-500 border border-slate-200/60">
              <Milestone className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Distance</div>
              <div className="text-xs sm:text-sm font-bold text-[#0B2F56]">{activeRouteObj.distance}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-slate-500 border border-slate-200/60">
              <CloudRain className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Weather Exposure</div>
              <div className={`text-xs sm:text-sm font-bold ${
                isHighRisk ? 'text-red-600' : isModerateRisk ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {activeChosenSlot.risk}
              </div>
            </div>
          </div>

        </div>

        {/* 4 Benefits / Risk Bullets (Explainable AI) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
          {bullets.map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              {isHighRisk ? (
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              ) : isModerateRisk ? (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              )}
              <span>{b}</span>
            </div>
          ))}
        </div>

        {/* Route Trade-off Selection Row */}
        <div className="mt-4 pt-3 border-t border-slate-200/60">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Route Strategy Trade-Offs
          </div>
          <div className="grid grid-cols-3 gap-2">
            
            {/* Fastest */}
            <div 
              onClick={() => onSelectRoute('fastest')}
              className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                selectedRoute === 'fastest'
                  ? 'bg-red-50/80 border-red-300 ring-2 ring-red-400/30'
                  : 'bg-white hover:bg-slate-50 border-slate-200/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-red-600">FASTEST</span>
                <Zap className="w-3 h-3 text-red-500" />
              </div>
              <div className="text-xs font-bold text-[#0B2F56] mt-0.5">{routesData.fastest.duration}</div>
              <div className="text-[9px] text-red-500 font-semibold truncate">{routesData.fastest.risk} exposure</div>
            </div>

            {/* Balanced (Recommended) */}
            <div 
              onClick={() => onSelectRoute('balanced')}
              className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                selectedRoute === 'balanced'
                  ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/30'
                  : 'bg-white hover:bg-slate-50 border-slate-200/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700">BALANCED</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              </div>
              <div className="text-xs font-bold text-[#0B2F56] mt-0.5">{routesData.balanced.duration}</div>
              <div className="text-[9px] text-emerald-600 font-semibold truncate">{routesData.balanced.risk} exposure</div>
            </div>

            {/* Safer */}
            <div 
              onClick={() => onSelectRoute('safer')}
              className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                selectedRoute === 'safer'
                  ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/30'
                  : 'bg-white hover:bg-slate-50 border-slate-200/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#0070F3]">SAFER</span>
                <ShieldCheck className="w-3 h-3 text-[#0070F3]" />
              </div>
              <div className="text-xs font-bold text-[#0B2F56] mt-0.5">{routesData.safer.duration}</div>
              <div className="text-[9px] text-blue-600 font-semibold truncate">{routesData.safer.risk} exposure</div>
            </div>

          </div>
        </div>

      </div>

      {/* 2. BOTTOM CARD: Other Departure Options Table (Live Real-Time Synchronized) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between">
        
        <div>
          {/* Table Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0B2F56]">
                Other Departure Options
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Click any slot to simulate corridor weather risk for {fromLocation} &rarr; {toLocation}
              </p>
            </div>
            <button 
              onClick={() => alert('Real-time 6-hour nowcast window updated.')}
              className="text-xs font-semibold text-[#0070F3] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>View Forecast</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Options Table */}
          <div className="w-full overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400">
                  <th className="py-2 px-2">Departure Time</th>
                  <th className="py-2 px-2">Journey Time</th>
                  <th className="py-2 px-2">Weather Risk</th>
                  <th className="py-2 px-2">Key Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {dynamicOptions.map((opt) => {
                  const isSelected = selectedDepartureTime === opt.time;
                  return (
                    <tr
                      key={opt.time}
                      onClick={() => onSelectDepartureTime(opt.time)}
                      className={`transition-colors cursor-pointer ${
                        opt.isRecommended
                          ? 'bg-emerald-50/70 font-semibold'
                          : isSelected
                          ? 'bg-blue-50/70 ring-1 ring-[#0070F3]'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Departure Time */}
                      <td className="py-2.5 px-2 font-bold text-[#0B2F56] whitespace-nowrap">
                        {opt.time} IST
                      </td>

                      {/* Journey Time */}
                      <td className="py-2.5 px-2 font-semibold whitespace-nowrap">
                        {opt.journeyTime}
                      </td>

                      {/* Weather Risk */}
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              opt.risk === 'High'
                                ? 'bg-red-500'
                                : opt.risk === 'Moderate'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span
                            className={`font-bold text-[11px] ${
                              opt.risk === 'High'
                                ? 'text-red-600'
                                : opt.risk === 'Moderate'
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }`}
                          >
                            {opt.risk}
                          </span>
                        </div>
                      </td>

                      {/* Key Reason & Badge */}
                      <td className="py-2.5 px-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-slate-600 text-[11px]">
                            {opt.reason}
                          </span>
                          {opt.isRecommended && (
                            <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-2xs shrink-0">
                              Recommended
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
