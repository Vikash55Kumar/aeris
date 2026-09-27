'use client';

import React from 'react';
import { CloudRain, Radio, Droplets, Zap, Wind, ArrowRight } from 'lucide-react';

interface RiskFactorsCardProps {
  onViewDetailedAnalysis?: () => void;
}

export const RiskFactorsCard: React.FC<RiskFactorsCardProps> = ({ onViewDetailedAnalysis }) => {
  const telemetryItems = [
    {
      id: 'ctt',
      name: 'Cloud Top Temperature',
      icon: <CloudRain className="w-4 h-4 text-[#0284C7]" />,
      value: '-72 °C',
      sparkline: (
        <svg className="w-16 h-5" viewBox="0 0 60 20" fill="none">
          <path d="M2 3 L16 5 L32 10 L46 15 L58 18" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      badgeText: 'Rapid Cooling',
      badgeClass: 'bg-[#FFF5F5] text-[#DC2626] border border-[#FED7D7]',
    },
    {
      id: 'radar',
      name: 'Radar Reflectivity',
      icon: <Radio className="w-4 h-4 text-[#0284C7]" />,
      value: '52 dBZ',
      sparkline: (
        <svg className="w-16 h-5" viewBox="0 0 60 20" fill="none">
          <path d="M2 18 L16 15 L32 10 L46 5 L58 2" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      badgeText: 'Increasing',
      badgeClass: 'bg-[#FFF5F5] text-[#DC2626] border border-[#FED7D7]',
    },
    {
      id: 'moisture',
      name: 'Moisture (Atmospheric Baseline)',
      icon: <Droplets className="w-4 h-4 text-emerald-500" />,
      value: 'High CAPE',
      sparkline: (
        <svg className="w-16 h-5" viewBox="0 0 60 20" fill="none">
          <path d="M2 17 L18 14 L34 9 L50 4 L58 3" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      badgeText: 'High',
      badgeClass: 'bg-[#FFF5F5] text-[#DC2626] border border-[#FED7D7]',
    },
    {
      id: 'lightning',
      name: 'Lightning Activity',
      icon: <Zap className="w-4 h-4 text-purple-600 fill-purple-600/30" />,
      value: '36 strikes',
      sparkline: (
        <svg className="w-16 h-5" viewBox="0 0 60 20" fill="none">
          <rect x="6" y="14" width="4" height="6" rx="1" fill="#F59E0B" />
          <rect x="14" y="11" width="4" height="9" rx="1" fill="#F59E0B" />
          <rect x="22" y="9" width="4" height="11" rx="1" fill="#F59E0B" />
          <rect x="30" y="7" width="4" height="13" rx="1" fill="#F59E0B" />
          <rect x="38" y="5" width="4" height="15" rx="1" fill="#F59E0B" />
          <rect x="46" y="2" width="4" height="18" rx="1" fill="#F59E0B" />
        </svg>
      ),
      badgeText: 'Increasing',
      badgeClass: 'bg-[#FFF5F5] text-[#DC2626] border border-[#FED7D7]',
    },
    {
      id: 'wind',
      name: 'Wind (Surface)',
      icon: <Wind className="w-4 h-4 text-[#0284C7]" />,
      value: 'NE 25 km/h',
      sparkline: (
        <svg className="w-16 h-5" viewBox="0 0 60 20" fill="none">
          <path d="M2 17 L16 13 L32 10 L46 6 L58 5" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      badgeText: 'Steady',
      badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200',
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs select-none font-sans flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-[#0B2F56]">Why is the risk increasing?</h3>
        <button
          onClick={onViewDetailedAnalysis}
          className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer flex items-center gap-0.5"
        >
          <span>View Detailed Analysis</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100/80">
        {telemetryItems.map((item) => (
          <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
            {/* Left: Icon & Name + Observed Badge */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0B2F56] truncate leading-tight">
                  {item.name}
                </div>
                <span className="inline-block text-[9px] font-extrabold text-[#0284C7] bg-blue-50/80 border border-blue-100/80 px-1.5 py-0.2 rounded mt-0.5 uppercase tracking-wider">
                  OBSERVED
                </span>
              </div>
            </div>

            {/* Middle: Value & Sparkline */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-xs font-bold text-[#0B2F56] font-mono text-right min-w-[64px]">
                {item.value}
              </div>
              <div className="hidden sm:block shrink-0">
                {item.sparkline}
              </div>
            </div>

            {/* Right: Trend Status Pill */}
            <div className="shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeClass}`}>
                {item.badgeText}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
