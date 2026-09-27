'use client';

import React from 'react';
import { ArrowRight, Check, AlertTriangle, AlertCircle } from 'lucide-react';

interface EventTimelineCardProps {
  onViewFullTimeline?: () => void;
}

export const EventTimelineCard: React.FC<EventTimelineCardProps> = ({ onViewFullTimeline }) => {
  const steps = [
    {
      time: '11:30',
      label: 'Moisture Accumulation',
      status: 'completed',
      node: (
        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      ),
      lineColor: 'bg-emerald-500',
    },
    {
      time: '12:20',
      label: 'Convective Initiation',
      status: 'completed',
      node: (
        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      ),
      lineColor: 'bg-gradient-to-r from-emerald-500 to-amber-500',
    },
    {
      time: '13:20',
      label: 'Rapid Intensification',
      status: 'warning',
      node: (
        <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
          !
        </div>
      ),
      lineColor: 'bg-gradient-to-r from-amber-500 to-red-500',
    },
    {
      time: '14:20',
      label: 'Heavy Rainfall (Current)',
      status: 'current',
      node: (
        <div className="relative">
          <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md animate-pulse">
            <AlertTriangle className="w-3 h-3 fill-white" />
          </div>
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600 animate-ping" />
        </div>
      ),
      lineColor: 'bg-blue-400',
    },
    {
      time: '15:20',
      label: 'Cloudburst Possible',
      status: 'predicted',
      node: (
        <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-400 text-blue-600 flex items-center justify-center shadow-2xs">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        </div>
      ),
      lineColor: 'bg-slate-200',
    },
    {
      time: '16:20',
      label: 'Gradual Decrease',
      status: 'predicted',
      node: (
        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center shadow-2xs">
          <div className="w-2 h-2 rounded-full bg-slate-300" />
        </div>
      ),
      lineColor: 'bg-transparent',
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-[#0B2F56]">Event Evolution Timeline (Cell A1027)</h3>
        <button
          onClick={onViewFullTimeline}
          className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer flex items-center gap-0.5"
        >
          <span>View Full Timeline</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stepper Grid / Track */}
      <div className="mt-4 px-1">
        {/* Horizontal Track with Nodes */}
        <div className="relative flex items-center justify-between">
          
          {/* Background Connecting Line Segments */}
          <div className="absolute top-2.5 left-2 right-2 h-0.5 -translate-y-1/2 flex">
            <div className="flex-1 bg-emerald-500" />
            <div className="flex-1 bg-gradient-to-r from-emerald-500 to-amber-500" />
            <div className="flex-1 bg-gradient-to-r from-amber-500 to-red-500" />
            <div className="flex-1 bg-blue-400" />
            <div className="flex-1 bg-slate-200" />
          </div>

          {/* Stepper Nodes */}
          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              {step.node}
            </div>
          ))}
        </div>

        {/* Labels underneath */}
        <div className="grid grid-cols-6 gap-1 mt-2 text-center">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-[11px] font-mono font-bold text-slate-700">
                {step.time}
              </span>
              <span className={`text-[10px] leading-tight mt-0.5 max-w-[80px] ${
                step.status === 'current' 
                  ? 'text-[#DC2626] font-extrabold' 
                  : 'text-slate-500 font-medium'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
