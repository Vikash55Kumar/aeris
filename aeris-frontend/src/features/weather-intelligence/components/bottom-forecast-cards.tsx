'use client';

import React from 'react';
import { 
  ArrowRight, 
  Clock, 
  Wind, 
  MapPin, 
  Zap, 
  CloudRain,
  Layers
} from 'lucide-react';

interface BottomForecastCardsProps {
  onViewRainfallDetails?: () => void;
  onViewThunderstormDetails?: () => void;
  onViewCloudburstDetails?: () => void;
}

export const BottomForecastCards: React.FC<BottomForecastCardsProps> = ({
  onViewRainfallDetails,
  onViewThunderstormDetails,
  onViewCloudburstDetails,
}) => {
  const rainfallBars = [
    { label: 'Now', value: 12, heightPct: 24 },
    { label: '+1h', value: 28, heightPct: 56 },
    { label: '+2h', value: 46, heightPct: 92, isPeak: true },
    { label: '+3h', value: 38, heightPct: 76 },
    { label: '+4h', value: 24, heightPct: 48 },
    { label: '+5h', value: 16, heightPct: 32 },
    { label: '+6h', value: 8, heightPct: 16 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 select-none font-sans">
      
      {/* 1. Rainfall Forecast (Next 6 Hours) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-[#0B2F56]">
              Rainfall Forecast (Next 6 Hours)
            </h3>
            <span className="text-[10px] font-bold text-[#0284C7] bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded tracking-tight uppercase">
              MODEL FORECAST
            </span>
          </div>
          <button
            onClick={onViewRainfallDetails}
            className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bar Chart */}
        <div className="mt-3 flex items-stretch gap-2 h-44">
          {/* Y-Axis Label + Ticks */}
          <div className="flex items-center gap-1.5">
            <span className="-rotate-90 text-[10px] font-semibold text-slate-400 whitespace-nowrap -ml-2 select-none">
              Rainfall (mm)
            </span>
            <div className="flex flex-col justify-between text-[10px] font-mono text-slate-400 h-32 pb-4 text-right pr-1">
              <span>50</span>
              <span>40</span>
              <span>30</span>
              <span>20</span>
              <span>10</span>
              <span>0</span>
            </div>
          </div>

          {/* Bars Area */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Grid & Bars */}
            <div className="relative h-32 w-full flex items-end justify-between border-b border-slate-200 px-2">
              {/* Horizontal Gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="w-full border-b border-slate-100 border-dashed" />
                <div className="w-full border-b border-slate-100 border-dashed" />
                <div className="w-full border-b border-slate-100 border-dashed" />
                <div className="w-full border-b border-slate-100 border-dashed" />
                <div className="w-full border-b border-slate-100 border-dashed" />
                <div className="w-full" />
              </div>

              {/* Bars */}
              {rainfallBars.map((bar, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center group w-8">
                  {/* Number on top */}
                  <span className="text-[11px] font-black text-[#0B2F56] font-mono mb-1 group-hover:text-[#0284C7] transition-colors">
                    {bar.value}
                  </span>
                  {/* Bar */}
                  <div
                    className={`w-6 sm:w-7 rounded-t-md transition-all duration-300 ${
                      bar.isPeak 
                        ? 'bg-[#3B82F6] group-hover:bg-[#2563EB]' 
                        : 'bg-[#3B82F6]/90 group-hover:bg-[#2563EB]'
                    }`}
                    style={{ height: `${bar.heightPct}%` }}
                  />
                </div>
              ))}
            </div>

            {/* X-Axis Labels */}
            <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] font-medium text-slate-500 font-mono">
              {rainfallBars.map((bar, idx) => (
                <span key={idx} className="w-8 text-center">
                  {bar.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Thunderstorm Forecast (Next 3 Hours) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-[#0B2F56]">
              Thunderstorm Forecast (Next 3 Hours)
            </h3>
            <span className="text-[10px] font-bold text-[#DC2626] bg-red-50 border border-red-100 px-1.5 py-0.2 rounded tracking-tight uppercase">
              MODEL PROBABILITY
            </span>
          </div>
          <button
            onClick={onViewThunderstormDetails}
            className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top Metrics Row: Circular Gauge + Onset + Intensity */}
        <div className="grid grid-cols-3 gap-2 py-3 items-center text-center">
          {/* Circular Gauge */}
          <div className="flex flex-col items-center">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#FEE2E2"
                  strokeWidth="3.2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="3.2"
                  strokeDasharray="87, 100"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-black text-[#0B2F56]">87%</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Probability</span>
          </div>

          {/* Expected Onset */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-sm sm:text-base font-black text-[#0B2F56]">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>~45 min</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Expected Onset</span>
          </div>

          {/* Intensity */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-[#FFF5F5] text-[#DC2626] border border-[#FED7D7] font-black text-xs px-3 py-1 rounded-xl">
              Severe
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Intensity</span>
          </div>
        </div>

        {/* Sub-Metrics Row: Movement + Affected Area */}
        <div className="grid grid-cols-2 gap-2 py-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">Movement</div>
              <div className="font-bold text-[#0B2F56]">NE 25 km/h</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">Affected Area</div>
              <div className="font-bold text-[#0B2F56] truncate">Eastern & Central Mumbai</div>
            </div>
          </div>
        </div>

        {/* Bottom Alert Container */}
        <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-xl p-2.5 flex items-start gap-2 mt-1">
          <Zap className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5 fill-[#DC2626]" />
          <p className="text-[11px] text-red-950 font-normal leading-tight">
            High chance of lightning, gusty winds (40–60 km/h) and intense short-duration rainfall.
          </p>
        </div>
      </div>

      {/* 3. Cloudburst Risk (Next 6 Hours) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-[#0B2F56]">
              Cloudburst Risk (Next 6 Hours)
            </h3>
            <span className="text-[10px] font-bold text-[#DC2626] bg-red-50 border border-red-100 px-1.5 py-0.2 rounded tracking-tight uppercase">
              MODEL PROBABILITY
            </span>
          </div>
          <button
            onClick={onViewCloudburstDetails}
            className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>View Full Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top Metrics Row: Circular Gauge + Window + Risk Level */}
        <div className="grid grid-cols-3 gap-2 py-3 items-center text-center">
          {/* Circular Gauge */}
          <div className="flex flex-col items-center">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#FFEDD5"
                  strokeWidth="3.2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="3.2"
                  strokeDasharray="74, 100"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-black text-[#0B2F56]">74%</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Probability</span>
          </div>

          {/* Expected Window */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-sm sm:text-base font-black text-[#0B2F56]">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>1.5 – 3 hours</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Expected Window</span>
          </div>

          {/* Risk Level */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-[#FFF5F5] text-[#DC2626] border border-[#FED7D7] font-black text-xs px-3 py-1 rounded-xl">
              High
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Risk Level</span>
          </div>
        </div>

        {/* Affected Zone */}
        <div className="py-2 border-t border-slate-100 flex items-center gap-2 text-xs">
          <MapPin className="w-4 h-4 text-slate-600 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 mr-1.5">Affected Zone</span>
            <span className="font-bold text-[#0B2F56]">Kurla – Thane – Eastern Mumbai</span>
          </div>
        </div>

        {/* Bottom Alert Container */}
        <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl p-2.5 flex items-start gap-2 mt-1">
          <CloudRain className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-950 font-normal leading-tight">
            Conditions favorable for localized cloudburst due to rapid convective intensification and high moisture.
          </p>
        </div>
      </div>

    </div>
  );
};
