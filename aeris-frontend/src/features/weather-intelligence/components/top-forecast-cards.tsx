'use client';

import React from 'react';
import { Info, CloudRain, Zap, ChevronRight, CloudLightning } from 'lucide-react';

interface TopForecastCardsProps {
  onSelectForecast?: (type: 'rainfall' | 'thunderstorm' | 'cloudburst') => void;
}

export const TopForecastCards: React.FC<TopForecastCardsProps> = ({ onSelectForecast }) => {
  return (
    <div className="space-y-2 font-sans select-none">
      {/* Banner / Input Metadata */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-black tracking-tight text-[#0284C7]">
          <span>AERIS FORECAST</span>
          <Info className="w-3.5 h-3.5 text-[#0284C7] cursor-help" />
        </div>
        <span className="text-slate-500 font-medium">
          Inputs: INSAT + Radar + Atmospheric State + Lightning
        </span>
      </div>

      {/* 3 Forecast Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* Card 1: Rainfall Forecast */}
        <div 
          onClick={() => onSelectForecast?.('rainfall')}
          className="group bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between"
        >
          {/* Top Row: Tag + Arrow */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#0284C7] bg-blue-50/90 border border-blue-100 px-2 py-0.5 rounded-md tracking-tight uppercase">
              MODEL FORECAST
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0284C7] group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Middle: Icon & Metrics */}
          <div className="flex items-center justify-between gap-3 mt-2.5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center shrink-0 text-[#0284C7]">
                <CloudRain className="w-7 h-7 text-[#0284C7]" />
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#0B2F56]">Rainfall Forecast</h3>
                <div className="text-[11px] font-bold text-[#0284C7] mt-0.5">High Intensity Expected</div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-lg sm:text-xl font-black text-[#0B2F56] tracking-tight">80 – 120 mm</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">(Next 3 hours)</div>
              </div>
            </div>

            {/* Probability Pill Container */}
            <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-xl px-2.5 py-2 text-center shrink-0 min-w-[72px]">
              <div className="text-xs font-black text-[#DC2626] leading-none">High</div>
              <div className="text-[9px] text-slate-500 font-medium mt-1">Probability</div>
            </div>
          </div>
        </div>

        {/* Card 2: Thunderstorm Forecast */}
        <div 
          onClick={() => onSelectForecast?.('thunderstorm')}
          className="group bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs hover:border-red-200 transition-all cursor-pointer flex flex-col justify-between"
        >
          {/* Top Row: Tag + Arrow */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#DC2626] bg-red-50/90 border border-red-100 px-2 py-0.5 rounded-md tracking-tight uppercase">
              MODEL PROBABILITY
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#DC2626] group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Middle: Icon & Metrics */}
          <div className="flex items-center justify-between gap-3 mt-2.5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-50/80 border border-red-100 flex items-center justify-center shrink-0 text-[#EF4444]">
                <Zap className="w-7 h-7 text-[#EF4444] fill-[#EF4444]" />
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#0B2F56]">Thunderstorm Forecast</h3>
                <div className="text-[11px] font-bold text-[#DC2626] mt-0.5">High Probability</div>
                <div className="text-xs text-slate-600 font-semibold mt-1.5">Next 2–3 hours</div>
              </div>
            </div>

            {/* Severity Pill Container */}
            <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-xl px-2.5 py-2 text-center shrink-0 min-w-[84px]">
              <div className="text-xs font-black text-[#DC2626] leading-none">Severe</div>
              <div className="text-[9px] text-slate-500 font-medium mt-1">Probability 87%</div>
            </div>
          </div>
        </div>

        {/* Card 3: Cloudburst Risk */}
        <div 
          onClick={() => onSelectForecast?.('cloudburst')}
          className="group bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs hover:border-amber-200 transition-all cursor-pointer flex flex-col justify-between"
        >
          {/* Top Row: Tag + Arrow */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#D97706] bg-amber-50/90 border border-amber-100 px-2 py-0.5 rounded-md tracking-tight uppercase">
              MODEL PROBABILITY
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#D97706] group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Middle: Icon & Metrics */}
          <div className="flex items-center justify-between gap-3 mt-2.5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50/80 border border-amber-100 flex items-center justify-center shrink-0 text-[#D97706]">
                <CloudLightning className="w-7 h-7 text-[#D97706]" />
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#0B2F56]">Cloudburst Risk</h3>
                <div className="text-[11px] font-bold text-[#D97706] mt-0.5">Moderate to High</div>
                <div className="text-xs text-slate-600 font-semibold mt-1.5">Next 1–6 hours</div>
              </div>
            </div>

            {/* Risk Pill Container */}
            <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-xl px-2.5 py-2 text-center shrink-0 min-w-[84px]">
              <div className="text-xs font-black text-[#DC2626] leading-none">High</div>
              <div className="text-[9px] text-slate-500 font-medium mt-1">Probability 74%</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
