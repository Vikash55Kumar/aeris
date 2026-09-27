'use client';

import React from 'react';
import { 
  CloudRain, 
  CloudLightning, 
  CloudDrizzle, 
  ChevronRight,
  AlertTriangle,
  Milestone
} from 'lucide-react';
import { RouteStrategy, TravelMode } from '../types';
import { getRoutesForLocationPair } from '../services/journey-simulation-data';

interface RouteSegmentAnalysisProps {
  fromLocation: string;
  toLocation: string;
  selectedRoute: RouteStrategy;
  selectedDepartureTime: string;
  travelMode: TravelMode;
}

export const RouteSegmentAnalysis: React.FC<RouteSegmentAnalysisProps> = ({
  fromLocation,
  toLocation,
  selectedRoute,
  selectedDepartureTime,
  travelMode,
}) => {
  if (!fromLocation || !toLocation) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs font-sans flex flex-col justify-between h-full select-none">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-700">
                Route Segment Analysis
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Corridor legs and localized weather risks
              </p>
            </div>
          </div>
          <div className="py-14 flex flex-col items-center justify-center text-center text-slate-400">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-2.5">
              <Milestone className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-xs font-bold text-slate-600">No Active Route Selected</span>
            <p className="text-[11px] text-slate-400 max-w-[230px] mt-1 leading-relaxed">
              Select origin and destination above to view step-by-step corridor weather hazard breakdowns.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const routesData = getRoutesForLocationPair(fromLocation, toLocation, selectedDepartureTime, travelMode);
  const currentRouteObj = routesData[selectedRoute] || routesData.balanced;
  const segments = currentRouteObj.getSegments(selectedDepartureTime, travelMode);

  const highRiskSegment = segments.find(s => s.risk === 'High' || s.risk === 'Critical');

  const renderWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'thunder':
        return <CloudLightning className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
      case 'heavy':
        return <CloudRain className="w-3.5 h-3.5 text-blue-700 shrink-0 font-bold" />;
      case 'moderate':
        return <CloudRain className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'light':
      default:
        return <CloudDrizzle className="w-3.5 h-3.5 text-cyan-600 shrink-0" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs font-sans flex flex-col justify-between h-full">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#0B2F56]">
              Route Segment Analysis <span className="font-normal text-slate-500 text-xs">({currentRouteObj.shortLabel})</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Corridor legs for {fromLocation} &rarr; {toLocation} at {selectedDepartureTime} IST
            </p>
          </div>
          <button 
            onClick={() => alert(`Tracking all ${segments.length} segments along ${fromLocation} corridor.`)}
            className="text-xs font-semibold text-[#0070F3] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View on Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* High Risk Segment Callout Banner if present */}
        {highRiskSegment && (
          <div className="my-2.5 p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 animate-in fade-in-50">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-red-800">
                High-Risk Segment Detected: {highRiskSegment.from} &rarr; {highRiskSegment.to} ({highRiskSegment.timeWindow})
              </span>
              <p className="text-[11px] text-red-700 mt-0.5">
                {highRiskSegment.alert || 'Severe precipitation and localized road waterlogging expected.'}
              </p>
            </div>
          </div>
        )}

        {/* Segments Table with Subway Connected Nodes */}
        <div className="w-full overflow-x-auto mt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400">
                <th className="py-2 px-2">Segment</th>
                <th className="py-2 px-2">Time Window</th>
                <th className="py-2 px-2">Distance</th>
                <th className="py-2 px-2">Weather</th>
                <th className="py-2 px-2 text-right">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {segments.map((seg, idx) => (
                <tr key={seg.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Segment Name with vertical connector line */}
                  <td className="py-2 px-2 relative">
                    <div className="flex items-center gap-2">
                      <div className="relative flex flex-col items-center">
                        <span className={`w-2.5 h-2.5 rounded-full ${seg.nodeColor} ring-2 ring-white shadow-xs shrink-0`} />
                        {idx < segments.length - 1 && (
                          <span className="absolute top-2.5 w-[2px] h-6 bg-slate-200" />
                        )}
                      </div>
                      <span className="font-semibold text-[#0B2F56] text-[11px] whitespace-nowrap">
                        {seg.from} &rarr; {seg.to}
                      </span>
                    </div>
                  </td>

                  {/* Dynamic Time Window */}
                  <td className="py-2 px-2 text-slate-600 text-[11px] font-mono whitespace-nowrap">
                    {seg.timeWindow}
                  </td>

                  {/* Distance */}
                  <td className="py-2 px-2 text-slate-600 text-[11px] whitespace-nowrap">
                    {seg.distance}
                  </td>

                  {/* Weather Condition */}
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium whitespace-nowrap">
                      {renderWeatherIcon(seg.weatherIcon)}
                      <span>{seg.weatherCondition}</span>
                    </div>
                  </td>

                  {/* Risk Badge */}
                  <td className="py-2 px-2 text-right">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        seg.risk === 'Critical'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : seg.risk === 'High'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : seg.risk === 'Moderate'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {seg.risk}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
