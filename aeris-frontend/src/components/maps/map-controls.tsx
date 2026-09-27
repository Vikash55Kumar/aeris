'use client';

import React from 'react';
import { Plus, Minus, Crosshair, Layers } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onToggleLayer: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onToggleLayer,
}) => {
  return (
    <div className="absolute top-3.5 left-3.5 bg-white rounded-xl shadow-xl flex flex-col items-center overflow-hidden z-10">
      <button
        onClick={onZoomIn}
        className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors border-b border-slate-200"
        title="Zoom In"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={onZoomOut}
        className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors border-b border-slate-200"
        title="Zoom Out"
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        onClick={onRecenter}
        className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors border-b border-slate-200"
        title="Recenter"
      >
        <Crosshair className="w-4 h-4" />
      </button>
      <button
        onClick={onToggleLayer}
        className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
        title="Layers"
      >
        <Layers className="w-4 h-4" />
      </button>
    </div>
  );
};
