'use client';

import React from 'react';
import { X, CloudRain, Radio, Zap, Droplets, Wind, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category?: 'telemetry' | 'timeline' | 'rainfall' | 'thunderstorm' | 'cloudburst';
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  title,
  category = 'telemetry',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-black text-[#0B2F56]">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time IMD &amp; INSAT Multi-sensor Diagnostic Telemetry</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {category === 'telemetry' && (
            <div className="space-y-4 text-xs font-sans">
              <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4">
                <h4 className="font-bold text-[#0B2F56] text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#0284C7]" />
                  Convective Deepening Warning Index
                </h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  INSAT-3DR IR1 band shows rapid cloud top cooling from -42°C to -72.4°C within 45 minutes (-8.2°C/hr rate), indicating explosive vertical convective development exceeding the 14km tropopause.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                  <div className="text-slate-400 font-medium text-[11px]">CAPE (Instability)</div>
                  <div className="text-xl font-black text-[#0B2F56] mt-1 font-mono">2,850 J/kg</div>
                  <div className="text-[10px] text-red-600 font-bold mt-0.5">Extreme Thermodynamic Instability</div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                  <div className="text-slate-400 font-medium text-[11px]">Precipitable Water (PW)</div>
                  <div className="text-xl font-black text-[#0B2F56] mt-1 font-mono">68.2 mm</div>
                  <div className="text-[10px] text-red-600 font-bold mt-0.5">99th Percentile for July MMR</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                <div className="font-bold text-[#0B2F56]">Model Ingestion Checklist</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Santacruz S-Band Doppler (14:18)</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> INSAT-3DR Rapid Scan (14:15)</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ILDN Lightning Network (Live)</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> IMDAA 4km Reanalysis (12:00 UTC)</div>
                </div>
              </div>
            </div>
          )}

          {category === 'timeline' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-950 font-medium">
                Cell A1027 has tracked 18km NE over the past 90 minutes. Present core dBZ is 58.5 over Kurla-Chembur basin, transitioning towards Thane MMR.
              </div>
              <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                <div className="p-3 flex justify-between bg-slate-50 font-bold text-[#0B2F56]">
                  <span>Timeline Phase</span>
                  <span>Hydrometeorological State</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-mono font-bold text-emerald-700">11:30 IST</span>
                  <span className="text-slate-600">High moisture convergence along coastal shear zone</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-mono font-bold text-emerald-700">12:20 IST</span>
                  <span className="text-slate-600">First radar echo &gt; 35 dBZ at 4.2 km altitude</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-mono font-bold text-amber-700">13:20 IST</span>
                  <span className="text-slate-600">Rapid CTT cooling to -60°C; 22 lightning flashes/min</span>
                </div>
                <div className="p-3 flex justify-between bg-red-50/50">
                  <span className="font-mono font-bold text-red-700">14:20 IST (NOW)</span>
                  <span className="text-red-900 font-bold">Max dBZ 58.5; Surface rain rate 95 mm/hr</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-mono font-bold text-blue-700">15:20 IST (PROJ)</span>
                  <span className="text-slate-600">High cloudburst potential over Thane / Eastern Suburbs</span>
                </div>
              </div>
            </div>
          )}

          {category === 'rainfall' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                AERIS Nowcasting ensemble projects total cumulative rainfall of <strong>80–120 mm</strong> over the next 3 hours with peak deluge rate between 16:00 and 17:00 IST.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-[11px] space-y-1">
                <div>Probability of &gt; 50 mm in 1h: <span className="font-bold text-red-600">88%</span></div>
                <div>Probability of &gt; 100 mm in 3h: <span className="font-bold text-red-600">79%</span></div>
                <div>Confidence Metric (Multi-model Consensus): <span className="font-bold text-emerald-600">Very High (0.91)</span></div>
              </div>
            </div>
          )}

          {(category === 'thunderstorm' || category === 'cloudburst') && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Atmospheric sounding indicates severe convective updrafts with vertical velocity exceeding 28 m/s. Hail formation aloft is detected in radar differential reflectivity (ZDR) signatures.
              </p>
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 space-y-1">
                <div className="font-bold">Automated Advisory Triggered</div>
                <div>NDMA Protocol Level 2 Active for BMC Zone 3 (Kurla, Ghatkopar, Chembur).</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0B2F56] hover:bg-[#071F3A] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
