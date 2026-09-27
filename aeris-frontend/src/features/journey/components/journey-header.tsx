'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, 
  MapPin, 
  ArrowLeftRight, 
  Clock, 
  ChevronDown, 
  ArrowRight, 
  X,
  Bike,
  Bus,
  ShieldAlert,
  Search,
  Check,
  Layers
} from 'lucide-react';
import { TravelMode } from '../types';
import { 
  MUMBAI_LOCATIONS, 
  CORRIDOR_PRESETS,
  formatHHMM,
  getOffsetHHMM
} from '../services/journey-simulation-data';

interface JourneyHeaderProps {
  fromLocation: string;
  setFromLocation: (val: string) => void;
  toLocation: string;
  setToLocation: (val: string) => void;
  travelMode: TravelMode;
  setTravelMode: (mode: TravelMode) => void;
  selectedDepartureTime: string;
  setSelectedDepartureTime: (time: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onSelectPreset: (presetId: string) => void;
}

export const JourneyHeader: React.FC<JourneyHeaderProps> = ({
  fromLocation,
  setFromLocation,
  toLocation,
  setToLocation,
  travelMode,
  setTravelMode,
  selectedDepartureTime,
  setSelectedDepartureTime,
  onAnalyze,
  isAnalyzing,
  onSelectPreset,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  
  // Dropdown open states
  const [fromDropdownOpen, setFromDropdownOpen] = useState<boolean>(false);
  const [toDropdownOpen, setToDropdownOpen] = useState<boolean>(false);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState<boolean>(false);
  const [modeDropdownOpen, setModeDropdownOpen] = useState<boolean>(false);
  const [presetDropdownOpen, setPresetDropdownOpen] = useState<boolean>(false);

  // Search filter states
  const [fromSearchQuery, setFromSearchQuery] = useState<string>('');
  const [toSearchQuery, setToSearchQuery] = useState<string>('');

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);
  const presetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) setFromDropdownOpen(false);
      if (toRef.current && !toRef.current.contains(e.target as Node)) setToDropdownOpen(false);
      if (timeRef.current && !timeRef.current.contains(e.target as Node)) setTimeDropdownOpen(false);
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) setModeDropdownOpen(false);
      if (presetRef.current && !presetRef.current.contains(e.target as Node)) setPresetDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic real-time synchronized departure intervals
  const timeSlots = [
    { label: `Now (${formatHHMM(currentTime)})`, val: formatHHMM(currentTime), tag: 'Live Now' },
    { label: `+15 min (${getOffsetHHMM(currentTime, 15)})`, val: getOffsetHHMM(currentTime, 15), tag: 'High Risk' },
    { label: `+30 min (${getOffsetHHMM(currentTime, 30)})`, val: getOffsetHHMM(currentTime, 30), tag: 'Moderate' },
    { label: `${getOffsetHHMM(currentTime, 45)} IST (Recommended)`, val: getOffsetHHMM(currentTime, 45), tag: 'Optimal' },
    { label: `+1 hour (${getOffsetHHMM(currentTime, 60)})`, val: getOffsetHHMM(currentTime, 60), tag: 'Clear' },
    { label: `+1h 30m (${getOffsetHHMM(currentTime, 90)})`, val: getOffsetHHMM(currentTime, 90), tag: 'Clear' },
  ];

  const travelModes: Array<{ id: TravelMode; label: string; icon: any; note: string }> = [
    { id: 'car', label: 'Car (Private)', icon: Car, note: 'Waterlogging & hydroplaning evaluation' },
    { id: 'bike', label: 'Two Wheeler', icon: Bike, note: 'Lightning & wind safety thresholds' },
    { id: 'transit', label: 'Transit (Bus/Rail)', icon: Bus, note: 'Rail track inundation & bus delays' },
    { id: 'emergency', label: 'Emergency Response', icon: ShieldAlert, note: 'Zero-delay flood clearance routing' },
  ];

  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const selectedTimeObj = timeSlots.find(s => s.val === selectedDepartureTime) || {
    label: selectedDepartureTime ? `${selectedDepartureTime} IST` : `${getOffsetHHMM(currentTime, 45)} IST (Recommended)`,
    val: selectedDepartureTime || getOffsetHHMM(currentTime, 45),
  };

  const currentModeObj = travelModes.find(m => m.id === travelMode) || travelModes[0];
  const CurrentModeIcon = currentModeObj.icon;

  const filteredFromLocations = MUMBAI_LOCATIONS.filter(l => 
    l.name.toLowerCase().includes(fromSearchQuery.toLowerCase()) ||
    l.subname.toLowerCase().includes(fromSearchQuery.toLowerCase())
  );

  const filteredToLocations = MUMBAI_LOCATIONS.filter(l => 
    l.name.toLowerCase().includes(toSearchQuery.toLowerCase()) ||
    l.subname.toLowerCase().includes(toSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 mb-4 select-none font-sans">
      
      {/* Top Banner & Preset Quick-Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#0070F3] text-white flex items-center justify-center shadow-md shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#0B2F56] tracking-tight">
                AERIS Journey
              </h1>
              <span className="bg-blue-50 text-[#0070F3] border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Decision Support
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Spatial &amp; temporal weather risk optimization for safer commute &amp; emergency response
            </p>
          </div>
        </div>

        {/* Quick Corridor Presets */}
        <div className="relative" ref={presetRef}>
          <button
            onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-[#0B2F56] shadow-2xs cursor-pointer transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-[#0070F3]" />
            <span>{fromLocation && toLocation ? `Preset: ${fromLocation} → ${toLocation}` : 'Quick Corridor Presets'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${presetDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {presetDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in-50 zoom-in-95 font-sans">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Major Demonstration Corridors
              </div>
              {CORRIDOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    onSelectPreset(preset.id);
                    setPresetDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-[#0070F3] hover:bg-blue-50/70 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Query Search / Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2 sm:p-2.5 shadow-xs flex flex-wrap items-center gap-2 lg:gap-2.5">
        
        {/* 1. FROM Field Dropdown */}
        <div className="relative flex-1 min-w-[190px]" ref={fromRef}>
          <div 
            onClick={() => {
              setFromDropdownOpen(!fromDropdownOpen);
              setToDropdownOpen(false);
              setTimeDropdownOpen(false);
              setModeDropdownOpen(false);
            }}
            className="flex flex-col justify-center px-3 py-1.5 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl transition-colors cursor-pointer group relative"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FROM</span>
            <div className="flex items-center justify-between gap-1.5 mt-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className={`w-4 h-4 shrink-0 ${fromLocation ? 'text-[#0070F3]' : 'text-slate-400'}`} />
                <span className={`text-xs sm:text-sm truncate ${fromLocation ? 'font-bold text-[#0B2F56]' : 'font-medium text-slate-400'}`}>
                  {fromLocation || 'Select Origin Location...'}
                </span>
              </div>
              {fromLocation && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFromLocation('');
                    setFromDropdownOpen(true);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 cursor-pointer shrink-0"
                  title="Clear origin"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* FROM Searchable Dropdown */}
          {fromDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 rounded-lg text-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={fromSearchQuery}
                    onChange={(e) => setFromSearchQuery(e.target.value)}
                    placeholder="Search Mumbai origin area..."
                    className="w-full bg-transparent outline-none text-xs font-medium text-slate-800 placeholder-slate-400"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 pt-1">
                {filteredFromLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setFromLocation(loc.name);
                      setFromDropdownOpen(false);
                      setFromSearchQuery('');
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-blue-50/70 transition-colors flex items-center justify-between cursor-pointer ${
                      fromLocation === loc.name ? 'bg-blue-50 text-[#0070F3]' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0B2F56]">{loc.name}</div>
                      <div className="text-[10px] text-slate-400">{loc.subname}</div>
                    </div>
                    {fromLocation === loc.name && <Check className="w-4 h-4 text-[#0070F3] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer shrink-0 active:rotate-180 duration-300"
          title="Swap origin and destination"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* 2. TO Field Dropdown */}
        <div className="relative flex-1 min-w-[190px]" ref={toRef}>
          <div 
            onClick={() => {
              setToDropdownOpen(!toDropdownOpen);
              setFromDropdownOpen(false);
              setTimeDropdownOpen(false);
              setModeDropdownOpen(false);
            }}
            className="flex flex-col justify-center px-3 py-1.5 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl transition-colors cursor-pointer group relative"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TO</span>
            <div className="flex items-center justify-between gap-1.5 mt-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className={`w-4 h-4 shrink-0 ${toLocation ? 'text-[#0070F3]' : 'text-slate-400'}`} />
                <span className={`text-xs sm:text-sm truncate ${toLocation ? 'font-bold text-[#0B2F56]' : 'font-medium text-slate-400'}`}>
                  {toLocation || 'Select Destination Location...'}
                </span>
              </div>
              {toLocation && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setToLocation('');
                    setToDropdownOpen(true);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 cursor-pointer shrink-0"
                  title="Clear destination"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* TO Searchable Dropdown */}
          {toDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 rounded-lg text-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={toSearchQuery}
                    onChange={(e) => setToSearchQuery(e.target.value)}
                    placeholder="Search Mumbai destination area..."
                    className="w-full bg-transparent outline-none text-xs font-medium text-slate-800 placeholder-slate-400"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 pt-1">
                {filteredToLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setToLocation(loc.name);
                      setToDropdownOpen(false);
                      setToSearchQuery('');
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-blue-50/70 transition-colors flex items-center justify-between cursor-pointer ${
                      toLocation === loc.name ? 'bg-blue-50 text-[#0070F3]' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0B2F56]">{loc.name}</div>
                      <div className="text-[10px] text-slate-400">{loc.subname}</div>
                    </div>
                    {toLocation === loc.name && <Check className="w-4 h-4 text-[#0070F3] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. DEPARTURE TIME Dropdown (Dynamic Real-Time Intervals) */}
        <div className="relative min-w-[210px]" ref={timeRef}>
          <div 
            onClick={() => {
              setTimeDropdownOpen(!timeDropdownOpen);
              setFromDropdownOpen(false);
              setToDropdownOpen(false);
              setModeDropdownOpen(false);
            }}
            className="flex flex-col justify-center px-3 py-1.5 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl cursor-pointer transition-colors"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DEPARTURE TIME</span>
            <div className="flex items-center justify-between gap-1.5 mt-0.5">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold truncate">
                <Clock className={`w-4 h-4 shrink-0 ${selectedDepartureTime ? 'text-slate-500' : 'text-slate-400'}`} />
                <span className={`truncate ${selectedDepartureTime ? 'text-[#0B2F56] font-bold' : 'text-slate-400 font-medium'}`}>
                  {selectedDepartureTime ? selectedTimeObj.label : 'Select Departure Time...'}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${timeDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {timeDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-68 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Live Forecast Departure Window
              </div>
              {timeSlots.map((slot) => (
                <button
                  key={slot.val}
                  onClick={() => {
                    setSelectedDepartureTime(slot.val);
                    setTimeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                    selectedDepartureTime === slot.val ? 'text-[#0070F3] bg-blue-50/70' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{slot.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    slot.tag === 'Optimal' ? 'bg-emerald-100 text-emerald-700' :
                    slot.tag === 'High Risk' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {slot.tag}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. TRAVEL MODE Dropdown */}
        <div className="relative min-w-[155px]" ref={modeRef}>
          <div 
            onClick={() => {
              setModeDropdownOpen(!modeDropdownOpen);
              setFromDropdownOpen(false);
              setToDropdownOpen(false);
              setTimeDropdownOpen(false);
            }}
            className="flex flex-col justify-center px-3 py-1.5 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl cursor-pointer transition-colors"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TRAVEL MODE</span>
            <div className="flex items-center justify-between gap-1.5 mt-0.5">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0B2F56] truncate">
                <CurrentModeIcon className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">{currentModeObj.label}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${modeDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {modeDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Vehicle Risk Profile
              </div>
              {travelModes.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setTravelMode(mode.id);
                      setModeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 ${
                      travelMode === mode.id ? 'text-[#0070F3] bg-blue-50/70' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4 text-[#0070F3]" />
                      <span className="font-bold">{mode.label}</span>
                    </div>
                    <div className="text-[10px] font-normal text-slate-500 mt-0.5 pl-6">
                      {mode.note}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Action Analyze Journey Button */}
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className={`flex-1 min-w-[160px] lg:flex-none bg-[#0070F3] hover:bg-[#005bb5] active:scale-[0.98] text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
            isAnalyzing ? 'opacity-80 cursor-wait' : ''
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Optimizing...</span>
            </>
          ) : (
            <>
              <span>Analyze Journey</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>
    </div>
  );
};
