'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import { getDynamicTimelineBuckets } from '../services/journey-simulation-data';

interface RouteWeatherTimelineProps {
  fromLocation?: string;
  toLocation?: string;
  selectedDepartureTime?: string;
}

interface WaypointTimeline {
  name: string;
  bars: Array<{ risk: 'low' | 'moderate' | 'high' | 'very-high'; widthPercent: number }>;
}

const WAYPOINT_TIMELINES: WaypointTimeline[] = [
  {
    name: 'Origin Sector',
    bars: [
      { risk: 'high', widthPercent: 20 },
      { risk: 'moderate', widthPercent: 20 },
      { risk: 'low', widthPercent: 30 },
      { risk: 'low', widthPercent: 30 },
    ],
  },
  {
    name: 'Western Hub',
    bars: [
      { risk: 'high', widthPercent: 25 },
      { risk: 'moderate', widthPercent: 25 },
      { risk: 'low', widthPercent: 25 },
      { risk: 'low', widthPercent: 25 },
    ],
  },
  {
    name: 'Central Link',
    bars: [
      { risk: 'very-high', widthPercent: 30 },
      { risk: 'high', widthPercent: 25 },
      { risk: 'moderate', widthPercent: 25 },
      { risk: 'low', widthPercent: 20 },
    ],
  },
  {
    name: 'Lowland Basin',
    bars: [
      { risk: 'very-high', widthPercent: 35 },
      { risk: 'high', widthPercent: 25 },
      { risk: 'moderate', widthPercent: 20 },
      { risk: 'low', widthPercent: 20 },
    ],
  },
  {
    name: 'Eastern Highway',
    bars: [
      { risk: 'very-high', widthPercent: 30 },
      { risk: 'high', widthPercent: 25 },
      { risk: 'moderate', widthPercent: 25 },
      { risk: 'low', widthPercent: 20 },
    ],
  },
  {
    name: 'Corridor Toll',
    bars: [
      { risk: 'high', widthPercent: 20 },
      { risk: 'moderate', widthPercent: 30 },
      { risk: 'low', widthPercent: 30 },
      { risk: 'low', widthPercent: 20 },
    ],
  },
  {
    name: 'Destination City',
    bars: [
      { risk: 'moderate', widthPercent: 30 },
      { risk: 'moderate', widthPercent: 30 },
      { risk: 'low', widthPercent: 25 },
      { risk: 'low', widthPercent: 15 },
    ],
  },
];

export const RouteWeatherTimeline: React.FC<RouteWeatherTimelineProps> = ({
  fromLocation,
  toLocation,
  selectedDepartureTime,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!fromLocation || !toLocation) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs font-sans flex flex-col justify-between select-none h-full">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-700">
                Route Weather Timeline
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Live forward risk heatmap
              </p>
            </div>
          </div>
          <div className="py-14 flex flex-col items-center justify-center text-center text-slate-400">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-2.5">
              <Clock className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-xs font-bold text-slate-600">Timeline Awaiting Corridor</span>
            <p className="text-[11px] text-slate-400 max-w-[230px] mt-1 leading-relaxed">
              Select origin and destination above to view live spatial-temporal waypoint risk heatmap.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic time buckets synchronized with real-time clock
  const timeBuckets = getDynamicTimelineBuckets(currentTime);

  const getRiskColor = (risk: 'low' | 'moderate' | 'high' | 'very-high') => {
    switch (risk) {
      case 'very-high':
        return 'bg-purple-600';
      case 'high':
        return 'bg-red-500';
      case 'moderate':
        return 'bg-amber-400';
      case 'low':
      default:
        return 'bg-emerald-400';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs font-sans flex flex-col justify-between select-none h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-[#0B2F56]">
            Route Weather Timeline
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">
            Live forward risk heatmap from {timeBuckets[0]} to {timeBuckets[timeBuckets.length - 1]} IST
          </p>
        </div>
        <button 
          onClick={() => alert('Hourly radar nowcast track updated.')}
          className="text-xs font-semibold text-[#0070F3] hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>View Forecast</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeline Gantt Chart Frame */}
      <div className="relative mt-2 pt-2">
        
        {/* Dynamic Time Axis Header */}
        <div className="grid grid-cols-5 pl-24 pr-2 text-center text-[10px] font-mono font-bold text-slate-400 pb-2 border-b border-slate-100">
          {timeBuckets.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        {/* Recommended Departure Guideline Marker at +40m (50% position) */}
        <div className="absolute top-1 bottom-7 left-[calc(24px+45%)] sm:left-[calc(96px+40%)] w-0 flex flex-col items-center pointer-events-none z-20">
          <div className="flex items-center gap-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>Recommended</span>
          </div>
          <div className="w-[2px] flex-1 border-l-2 border-dashed border-emerald-500" />
          <div className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded whitespace-nowrap">
            Departure
          </div>
        </div>

        {/* Waypoint Rows */}
        <div className="space-y-2 py-2">
          {WAYPOINT_TIMELINES.map((wp) => (
            <div key={wp.name} className="flex items-center text-xs">
              
              {/* Waypoint Label */}
              <div className="w-24 text-[11px] font-semibold text-slate-700 truncate pr-2 shrink-0">
                {wp.name}
              </div>

              {/* Multi-segment Risk Bar */}
              <div className="flex-1 h-3.5 bg-slate-100 rounded-md overflow-hidden flex shadow-2xs">
                {wp.bars.map((bar, i) => (
                  <div
                    key={i}
                    style={{ width: `${bar.widthPercent}%` }}
                    className={`h-full ${getRiskColor(bar.risk)} transition-all`}
                    title={`${wp.name}: ${bar.risk.toUpperCase()} risk`}
                  />
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* Timeline Bottom Legend */}
        <div className="flex items-center justify-center gap-4 pt-2.5 border-t border-slate-100 text-[10px] font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-600" />
            <span>Very High</span>
          </div>
        </div>

      </div>

    </div>
  );
};
