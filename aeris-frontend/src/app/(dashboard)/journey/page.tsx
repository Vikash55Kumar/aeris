'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { JourneyHeader } from '@/features/journey/components/journey-header';
import { DepartureCard } from '@/features/journey/components/departure-card';
import { RouteSegmentAnalysis } from '@/features/journey/components/route-segment-analysis';
import { RouteWeatherTimeline } from '@/features/journey/components/route-weather-timeline';
import { KeyInsightsCard } from '@/features/journey/components/key-insights-card';
import { RouteStrategy, TravelMode } from '@/features/journey/types';
import { CORRIDOR_PRESETS, getOffsetHHMM } from '@/features/journey/services/journey-simulation-data';
import { CheckCircle2 } from 'lucide-react';

// Dynamically import Leaflet Map to avoid SSR issues
const DynamicJourneyMap = dynamic(
  () => import('@/features/journey/components/journey-map').then((mod) => mod.JourneyMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[460px] bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white/70 border border-slate-800 animate-pulse font-sans">
        <div className="w-8 h-8 border-2 border-[#0070F3] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold">Loading AERIS Location Tracking &amp; Route Simulation...</span>
      </div>
    ),
  }
);

export default function JourneyPage() {
  // Default to empty/null state as requested
  const [fromLocation, setFromLocation] = useState<string>('');
  const [toLocation, setToLocation] = useState<string>('');
  const [travelMode, setTravelMode] = useState<TravelMode>('car');
  const [selectedDepartureTime, setSelectedDepartureTime] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<RouteStrategy>('balanced');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisCompletedMsg, setAnalysisCompletedMsg] = useState<string | null>(null);

  // Quick preset / corridor selection helper
  const handleSelectCorridor = (from: string, to: string) => {
    setFromLocation(from);
    setToLocation(to);
    setSelectedDepartureTime(getOffsetHHMM(new Date(), 45));
    setSelectedRoute('balanced');
  };

  // Trigger simulated XAI optimization calculation
  const handleAnalyze = () => {
    if (!fromLocation || !toLocation) {
      setAnalysisCompletedMsg(
        'Please select both Origin (FROM) and Destination (TO) locations above to analyze corridor weather risk.'
      );
      setTimeout(() => setAnalysisCompletedMsg(null), 5000);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisCompletedMsg(null);

    setTimeout(() => {
      const optTime = getOffsetHHMM(new Date(), 45);
      setIsAnalyzing(false);
      setSelectedDepartureTime(optTime);
      setSelectedRoute('balanced');
      setAnalysisCompletedMsg(
        `AERIS Decision Engine: Optimum departure computed for ${fromLocation} → ${toLocation} at ${optTime} IST. Bypasses active convective storm cells with 82% confidence.`
      );
      setTimeout(() => setAnalysisCompletedMsg(null), 7000);
    }, 1100);
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = CORRIDOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setFromLocation(preset.from);
    setToLocation(preset.to);
    setSelectedDepartureTime(preset.defaultTime);
    setSelectedRoute('balanced');
  };

  return (
    <div className="space-y-4 pb-8 max-w-[1920px] mx-auto font-sans">
      
      {/* 1. Header & Filter Bar */}
      <JourneyHeader
        fromLocation={fromLocation}
        setFromLocation={setFromLocation}
        toLocation={toLocation}
        setToLocation={setToLocation}
        travelMode={travelMode}
        setTravelMode={setTravelMode}
        selectedDepartureTime={selectedDepartureTime}
        setSelectedDepartureTime={setSelectedDepartureTime}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        onSelectPreset={handleSelectPreset}
      />

      {/* Analysis Notification Toast */}
      {analysisCompletedMsg && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm animate-in fade-in-50 slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-emerald-900">
              {analysisCompletedMsg}
            </span>
          </div>
          <button
            onClick={() => setAnalysisCompletedMsg(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer ml-3 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Middle Grid: Route Map (Left) & Recommended Departure (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Left: Route & Weather Overview Map (7 Cols) */}
        <div className="lg:col-span-7 h-full min-h-[460px]">
          <DynamicJourneyMap
            fromLocation={fromLocation}
            toLocation={toLocation}
            selectedRoute={selectedRoute}
            onSelectRoute={setSelectedRoute}
            selectedDepartureTime={selectedDepartureTime}
            travelMode={travelMode}
          />
        </div>

        {/* Right: Recommended Departure & Other Options (5 Cols) */}
        <div className="lg:col-span-5 h-full">
          <DepartureCard
            fromLocation={fromLocation}
            toLocation={toLocation}
            selectedDepartureTime={selectedDepartureTime}
            onSelectDepartureTime={setSelectedDepartureTime}
            selectedRoute={selectedRoute}
            onSelectRoute={setSelectedRoute}
            travelMode={travelMode}
            onSelectCorridor={handleSelectCorridor}
          />
        </div>

      </div>

      {/* 3. Bottom Grid: Route Segment Analysis, Route Weather Timeline & Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Card 1: Route Segment Analysis (4.5 / 12 Cols) */}
        <div className="lg:col-span-4 h-full">
          <RouteSegmentAnalysis
            fromLocation={fromLocation}
            toLocation={toLocation}
            selectedRoute={selectedRoute}
            selectedDepartureTime={selectedDepartureTime}
            travelMode={travelMode}
          />
        </div>

        {/* Card 2: Route Weather Timeline (4.5 / 12 Cols) */}
        <div className="lg:col-span-5 h-full">
          <RouteWeatherTimeline
            fromLocation={fromLocation}
            toLocation={toLocation}
            selectedDepartureTime={selectedDepartureTime}
          />
        </div>

        {/* Card 3: Key Insights (3 / 12 Cols) */}
        <div className="md:col-span-2 lg:col-span-3 h-full">
          <KeyInsightsCard
            fromLocation={fromLocation}
            travelMode={travelMode}
          />
        </div>

      </div>

    </div>
  );
}
