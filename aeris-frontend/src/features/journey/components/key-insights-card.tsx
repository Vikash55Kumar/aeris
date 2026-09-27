'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CloudRain, 
  CloudSun, 
  ShieldCheck, 
  Lightbulb 
} from 'lucide-react';
import { TravelMode } from '../types';
import { formatHHMM, getOffsetHHMM } from '../services/journey-simulation-data';

interface KeyInsightsCardProps {
  fromLocation?: string;
  travelMode?: TravelMode;
}

export const KeyInsightsCard: React.FC<KeyInsightsCardProps> = ({ 
  fromLocation, 
  travelMode = 'car' 
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!fromLocation) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs font-sans flex flex-col justify-between select-none h-full">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-[#0070F3] flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700">
                Key Insights
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Live nowcasting updates
              </p>
            </div>
          </div>
          <div className="py-14 flex flex-col items-center justify-center text-center text-slate-400">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-2.5">
              <Sparkles className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-xs font-bold text-slate-600">Awaiting Journey Selection</span>
            <p className="text-[11px] text-slate-400 max-w-[200px] mt-1 leading-relaxed">
              AI weather intelligence and severe rainfall bypass tips will appear once a route is active.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tStart = formatHHMM(currentTime);
  const tPeakEnd = getOffsetHHMM(currentTime, 30);
  const tImprove = getOffsetHHMM(currentTime, 35);
  const tRecommend = getOffsetHHMM(currentTime, 45);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs font-sans flex flex-col justify-between select-none h-full">
      
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-6 h-6 rounded-lg bg-blue-100 text-[#0070F3] flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0B2F56]">
              Key Insights
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Live nowcasting updates
            </p>
          </div>
        </div>

        {/* 4 Dynamic Callout Cards */}
        <div className="space-y-3 mt-3">
          
          {/* Insight 1: Severe Rainfall window */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-red-50/70 border border-red-100 transition-colors hover:bg-red-50">
            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0B2F56]">
                Severe rainfall active {tStart} &ndash; {tPeakEnd} IST
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                High rainfall intensity (60&ndash;110 mm/hr) with active thunderstorm runoff along arterial roads.
              </p>
            </div>
          </div>

          {/* Insight 2: Conditions Improving */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 transition-colors hover:bg-amber-50">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <CloudSun className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0B2F56]">
                Conditions improving after {tImprove} IST
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Rainfall intensity expected to decrease as the convective cloud cluster moves northeast.
              </p>
            </div>
          </div>

          {/* Insight 3: Recommended to travel */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 transition-colors hover:bg-emerald-50">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0B2F56]">
                Recommended departure after {tRecommend} IST
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Lower weather exposure and clear road drainage across recommended route with high visibility.
              </p>
            </div>
          </div>

          {/* Insight 4: Alternative Route */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/90 border border-slate-200 transition-colors hover:bg-slate-100/80">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0B2F56]">
                Alternative Route 2 (Scenic Bypass)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Slightly longer (+10 min) but completely skirts severe weather exposure if you need to depart immediately.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
