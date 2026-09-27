import React from 'react';

export const MapLegend: React.FC = () => {
  return (
    <div className="absolute bottom-3 left-3.5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-3 py-2 z-10 shadow-md text-[10px] font-sans select-none">
      <div className="text-slate-800 font-semibold mb-1">Rainfall Intensity (mm/hr)</div>
      <div className="w-48 h-2 rounded-full overflow-hidden bg-gradient-to-r from-[#38BDF8] via-[#22C55E] via-[#FACC15] via-[#F97316] via-[#EF4444] via-[#D946EF] to-[#7C3AED]" />
      <div className="w-48 flex justify-between text-[9px] text-slate-500 mt-1 font-mono font-bold">
        <span>0</span>
        <span>1</span>
        <span>5</span>
        <span>10</span>
        <span>20</span>
        <span>50</span>
        <span>100+</span>
      </div>
    </div>
  );
};
