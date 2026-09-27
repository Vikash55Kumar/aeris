'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { WeatherHeader } from '@/features/weather-intelligence/components/weather-header';
import { TopForecastCards } from '@/features/weather-intelligence/components/top-forecast-cards';
import { RiskFactorsCard } from '@/features/weather-intelligence/components/risk-factors-card';
import { EventTimelineCard } from '@/features/weather-intelligence/components/event-timeline-card';
import { BottomForecastCards } from '@/features/weather-intelligence/components/bottom-forecast-cards';
import { AnalysisModal } from '@/features/weather-intelligence/components/analysis-modal';

// Dynamically import WeatherMapView to disable SSR for Leaflet
const WeatherMapView = dynamic(
  () => import('@/features/weather-intelligence/components/weather-map-view').then((mod) => mod.WeatherMapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] lg:h-[660px] bg-slate-950 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-800">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-300">Loading High-Resolution Radar Simulation...</span>
        </div>
      </div>
    ),
  }
);

export default function WeatherIntelligencePage() {
  const [liveTime, setLiveTime] = useState<Date>(() => new Date());
  const [selectedOffsetHours, setSelectedOffsetHours] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeStep, setTimeStep] = useState<string>('3h');
  const [isLive, setIsLive] = useState<boolean>(true);

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    category: 'telemetry' | 'timeline' | 'rainfall' | 'thunderstorm' | 'cloudburst';
  }>({
    isOpen: false,
    title: '',
    category: 'telemetry',
  });

  // Synchronize live clock
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setLiveTime(new Date());
    }, 10000);
    return () => clearInterval(clockInterval);
  }, []);

  // Timeline progression auto-player
  useEffect(() => {
    if (!isPlaying) return;
    const offsets = [-3, -2, -1, 0, 1, 2, 3];
    const timer = setInterval(() => {
      setSelectedOffsetHours((curr) => {
        const nextIdx = (offsets.indexOf(curr) + 1) % offsets.length;
        const nextOffset = offsets[nextIdx];
        setIsLive(nextOffset === 0);
        return nextOffset;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleOffsetChange = (offset: number) => {
    setSelectedOffsetHours(offset);
    setIsLive(offset === 0);
  };

  const handleToggleLive = () => {
    if (!isLive) {
      setSelectedOffsetHours(0);
      setIsLive(true);
    } else {
      setIsLive(false);
    }
  };

  return (
    <div className="space-y-4 font-sans max-w-[1920px] mx-auto pb-8 select-none">
      {/* 1. Header: Title, Subtitle, Time Scrubber, Play/Pause, Live */}
      <WeatherHeader
        liveTime={liveTime}
        selectedOffsetHours={selectedOffsetHours}
        onOffsetChange={handleOffsetChange}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        timeStep={timeStep}
        onTimeStepChange={setTimeStep}
        isLive={isLive}
        onToggleLive={handleToggleLive}
      />

      {/* 2. Top AERIS Forecast Cards (Rainfall, Thunderstorm, Cloudburst) */}
      <TopForecastCards
        onSelectForecast={(type) => {
          if (type === 'rainfall') {
            setModalState({
              isOpen: true,
              title: 'Rainfall Forecast Detailed Model Analysis',
              category: 'rainfall',
            });
          } else if (type === 'thunderstorm') {
            setModalState({
              isOpen: true,
              title: 'Thunderstorm Severe Cell Telemetry & Probability',
              category: 'thunderstorm',
            });
          } else {
            setModalState({
              isOpen: true,
              title: 'Cloudburst Instability & Deluge Risk Assessment',
              category: 'cloudburst',
            });
          }
        }}
      />

      {/* 3. Middle Section: Interactive Full-Height Map (Left) + Telemetry & Timeline (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Weather Map View (7 cols on lg/xl) */}
        <div className="lg:col-span-7 xl:col-span-7">
          <WeatherMapView
            liveTime={liveTime}
            selectedOffsetHours={selectedOffsetHours}
          />
        </div>

        {/* Right: Telemetry Diagnostic & Event Evolution Timeline (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-4">
          {/* Card 1: Why is the risk increasing? */}
          <RiskFactorsCard
            onViewDetailedAnalysis={() => {
              setModalState({
                isOpen: true,
                title: 'Multi-Sensor Atmospheric Telemetry Deep Dive',
                category: 'telemetry',
              });
            }}
          />

          {/* Card 2: Event Evolution Timeline (Cell A1027) */}
          <EventTimelineCard
            onViewFullTimeline={() => {
              setModalState({
                isOpen: true,
                title: 'Full Event Evolution History & Forecast — Cell A1027',
                category: 'timeline',
              });
            }}
          />
        </div>
      </div>

      {/* 4. Bottom Section: 3 Forecast & Risk Cards */}
      <BottomForecastCards
        onViewRainfallDetails={() => {
          setModalState({
            isOpen: true,
            title: 'Hourly Rainfall Hyetograph & Ensembles',
            category: 'rainfall',
          });
        }}
        onViewThunderstormDetails={() => {
          setModalState({
            isOpen: true,
            title: 'Thunderstorm Convective Initiation Analysis',
            category: 'thunderstorm',
          });
        }}
        onViewCloudburstDetails={() => {
          setModalState({
            isOpen: true,
            title: 'Cloudburst Potential Index & Microburst Tracking',
            category: 'cloudburst',
          });
        }}
      />

      {/* 5. Detailed Analysis Modal */}
      <AnalysisModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        category={modalState.category}
      />
    </div>
  );
}
