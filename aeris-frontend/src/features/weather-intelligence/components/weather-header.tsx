'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronDown } from 'lucide-react';

interface WeatherHeaderProps {
  liveTime: Date;
  selectedOffsetHours: number;
  onOffsetChange: (offset: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  timeStep: string;
  onTimeStepChange: (step: string) => void;
  isLive: boolean;
  onToggleLive: () => void;
}

const formatHHMM = (date: Date) => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const getOffsetTime = (baseDate: Date, offsetHours: number) => {
  const d = new Date(baseDate.getTime() + offsetHours * 60 * 60 * 1000);
  return formatHHMM(d);
};

const OFFSETS = [-3, -2, -1, 0, 1, 2, 3];

export const WeatherHeader: React.FC<WeatherHeaderProps> = ({
  liveTime,
  selectedOffsetHours,
  onOffsetChange,
  isPlaying,
  onTogglePlay,
  timeStep,
  onTimeStepChange,
  isLive,
  onToggleLive,
}) => {
  const [showStepDropdown, setShowStepDropdown] = useState(false);

  // Calculate position along timeline (0% to 100%)
  // -3h = 0%, 0h (Now) = 50%, +3h = 100%
  const getSliderPosition = () => {
    const minOffset = -3;
    const maxOffset = 3;
    const clamped = Math.min(maxOffset, Math.max(minOffset, selectedOffsetHours));
    return ((clamped - minOffset) / (maxOffset - minOffset)) * 100;
  };

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-transparent select-none pb-1">
      {/* Title & Subtitle */}
      <div className="flex items-start gap-3">
        {/* Blue 3-Wave Logo Icon */}
        <div className="w-9 h-9 rounded-xl bg-[#0284C7] flex items-center justify-center text-white shadow-2xs shrink-0 mt-0.5">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
            <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
            <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2F56] tracking-tight leading-none">
            Weather Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1.5 leading-snug">
            Atmospheric conditions, severe weather nowcasting and event evolution analysis for Mumbai
          </p>
        </div>
      </div>

      {/* Time Control Bar */}
      <div className="flex flex-col items-end gap-1 shrink-0 w-full lg:w-auto">
        <div className="text-[11px] font-semibold text-slate-500 w-full text-left lg:text-right">
          Time Control (Replay / Live)
        </div>

        <div className="flex items-center gap-2 sm:gap-3 bg-white border border-slate-200/90 rounded-2xl px-3 py-1.5 shadow-2xs w-full sm:w-auto">
          {/* Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white flex items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
            title={isPlaying ? 'Pause Simulation' : 'Play Timeline'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-white" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
            )}
          </button>

          {/* Timeline Slider / Markers */}
          <div className="flex-1 sm:w-64 md:w-80 flex flex-col justify-center px-1">
            <div className="relative w-full h-5 flex items-center">
              {/* Background Track */}
              <div className="absolute inset-x-0 h-1 bg-slate-200 rounded-full" />
              
              {/* Active Filled Track */}
              <div
                className="absolute left-0 h-1 bg-[#0284C7] rounded-full transition-all duration-300"
                style={{ width: `${getSliderPosition()}%` }}
              />

              {/* Hour Tick Markers */}
              {OFFSETS.map((offset, idx) => {
                const pos = (idx / (OFFSETS.length - 1)) * 100;
                const isSelected = selectedOffsetHours === offset;
                const isNow = offset === 0;

                return (
                  <button
                    key={offset}
                    onClick={() => onOffsetChange(offset)}
                    className={`absolute -translate-x-1/2 w-2.5 h-2.5 rounded-full transition-all z-10 cursor-pointer ${
                      isSelected
                        ? 'bg-[#0284C7] ring-2 ring-blue-300 scale-125'
                        : isNow
                        ? 'bg-[#0B2F56]'
                        : 'bg-slate-300 hover:bg-[#0284C7]'
                    }`}
                    style={{ left: `${pos}%` }}
                    title={offset === 0 ? `Live Now (${formatHHMM(liveTime)})` : `${offset > 0 ? '+' : ''}${offset}h (${getOffsetTime(liveTime, offset)})`}
                  />
                );
              })}

              {/* Active Thumb Indicator */}
              <div
                className="absolute -translate-x-1/2 w-4 h-4 bg-[#0284C7] rounded-full border-2 border-white shadow-md z-20 cursor-grab transition-all duration-300 ring-2 ring-[#0284C7]/30"
                style={{ left: `${getSliderPosition()}%` }}
              />
            </div>

            {/* Time Labels with Real-time Clock */}
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-0.5">
              {OFFSETS.map((offset) => {
                const isSelected = selectedOffsetHours === offset;
                const isNow = offset === 0;
                const timeStr = getOffsetTime(liveTime, offset);

                return (
                  <button
                    key={offset}
                    onClick={() => onOffsetChange(offset)}
                    className={`cursor-pointer transition-colors flex flex-col items-center ${
                      isSelected
                        ? 'text-[#0284C7] font-bold'
                        : isNow
                        ? 'text-[#0B2F56] font-bold'
                        : 'hover:text-slate-700'
                    }`}
                  >
                    <span>{timeStr}</span>
                    <span className="text-[8px] -mt-0.5 opacity-70">
                      {isNow ? 'Now' : `${offset > 0 ? '+' : ''}${offset}h`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Indicator Button */}
          <button
            onClick={onToggleLive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0 ${
              isLive
                ? 'bg-[#0B2F56] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
            <span>Live</span>
          </button>

          {/* Step Selector Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowStepDropdown(!showStepDropdown)}
              className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-2.5 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <span>{timeStep}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showStepDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showStepDropdown && (
              <div className="absolute right-0 mt-1.5 w-24 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 text-xs font-medium animate-in fade-in-50 zoom-in-95">
                {['1h', '3h', '6h', '12h'].map((step) => (
                  <button
                    key={step}
                    onClick={() => {
                      onTimeStepChange(step);
                      setShowStepDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 cursor-pointer ${
                      timeStep === step ? 'text-[#0284C7] font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
