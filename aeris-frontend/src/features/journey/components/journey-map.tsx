'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Plus, 
  Minus, 
  Crosshair, 
  Maximize2, 
  Minimize2, 
  Layers,
  MapPin,
  AlertTriangle,
  Sparkles,
  Info,
  Map as MapIcon,
  ChevronDown,
  Satellite,
  Moon,
  CheckCircle2
} from 'lucide-react';
import { RouteStrategy, TravelMode, MapBasemapType } from '../types';
import { 
  findLocationByName, 
  getRoutesForLocationPair 
} from '../services/journey-simulation-data';

interface JourneyMapProps {
  fromLocation: string;
  toLocation: string;
  selectedRoute: RouteStrategy;
  onSelectRoute: (route: RouteStrategy) => void;
  selectedDepartureTime: string;
  travelMode: TravelMode;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({
  fromLocation,
  toLocation,
  selectedRoute,
  onSelectRoute,
  selectedDepartureTime,
  travelMode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayersGroupRef = useRef<any[]>([]);
  const polylinesRef = useRef<Record<string, any>>({});
  const markersRef = useRef<any[]>([]);
  
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeBasemap, setActiveBasemap] = useState<MapBasemapType>('satellite-labels');
  const [basemapDropdownOpen, setBasemapDropdownOpen] = useState<boolean>(false);

  // Retrieve actual coordinates for selected locations
  const originLoc = findLocationByName(fromLocation);
  const destLoc = findLocationByName(toLocation);

  // Dynamic route data based on actual location pair
  const routesData = getRoutesForLocationPair(fromLocation, toLocation, selectedDepartureTime, travelMode);

  // Compute storm center shift based on departure time
  const getStormOffset = useCallback(() => {
    let [h, m] = selectedDepartureTime.includes(':') 
      ? selectedDepartureTime.split(':').map(Number) 
      : [16, 30];
    if (isNaN(h)) h = 16;
    if (isNaN(m)) m = 30;
    const timeMins = h * 60 + m;

    if (timeMins <= 915) {
      return { dLat: -0.01, dLng: -0.01, intensity: 1.0, label: 'Peak Storm over Kurla (15:00–15:30)' };
    } else if (timeMins <= 945) {
      return { dLat: 0, dLng: 0, intensity: 0.95, label: 'Active Convective Cell (15:30–16:00)' };
    } else if (timeMins <= 975) {
      return { dLat: 0.04, dLng: 0.035, intensity: 0.70, label: 'System moving Northeast (16:00–16:20)' };
    } else if (timeMins <= 1005) {
      return { dLat: 0.10, dLng: 0.08, intensity: 0.35, label: 'Convective Cell Cleared (16:30+)' };
    } else {
      return { dLat: 0.16, dLng: 0.12, intensity: 0.20, label: 'Dry Corridors (17:00+)' };
    }
  }, [selectedDepartureTime]);

  // Doppler Radar Canvas Simulation
  const drawDopplerSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    const map = mapInstanceRef.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = map.getSize().x;
    const height = canvas.height = map.getSize().y;

    ctx.clearRect(0, 0, width, height);

    const { dLat, dLng, intensity } = getStormOffset();

    const kurlaLat = 19.0728 + dLat;
    const kurlaLng = 72.8797 + dLng;

    const kurlaPt = map.latLngToContainerPoint([kurlaLat, kurlaLng]);
    const ghatkoparPt = map.latLngToContainerPoint([kurlaLat + 0.02, kurlaLng + 0.02]);
    const thanePt = map.latLngToContainerPoint([19.2000 + dLat * 0.5, 72.9600 + dLng * 0.5]);

    const zoomScale = Math.pow(2, map.getZoom() - 11);
    const baseRadius = Math.max(60, Math.min(width, height) * 0.32) * zoomScale;

    const radarStops: Array<[number, string]> = [
      [0, `rgba(168, 85, 247, ${0.95 * intensity})`],  // Magenta
      [0.2, `rgba(220, 38, 38, ${0.90 * intensity})`], // Red
      [0.4, `rgba(234, 88, 12, ${0.80 * intensity})`], // Orange
      [0.6, `rgba(250, 204, 21, ${0.65 * intensity})`], // Yellow
      [0.8, `rgba(34, 197, 94, ${0.45 * intensity})`],  // Green
      [0.95, `rgba(2, 132, 199, ${0.25 * intensity})`], // Cyan
      [1, 'rgba(2, 132, 199, 0)']
    ];

    const drawBlob = (px: number, py: number, radius: number) => {
      if (radius <= 0) return;
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius);
      radarStops.forEach(([stop, color]) => gradient.addColorStop(stop, color));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    drawBlob(kurlaPt.x, kurlaPt.y, baseRadius);
    drawBlob(ghatkoparPt.x, ghatkoparPt.y, baseRadius * 0.75);
    drawBlob(thanePt.x, thanePt.y, baseRadius * 0.45);

    if (intensity > 0.5) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(kurlaPt.x, kurlaPt.y, baseRadius * 0.55, 0, Math.PI * 2);
      ctx.stroke();

      const arrowX = kurlaPt.x + baseRadius * 0.75;
      const arrowY = kurlaPt.y - baseRadius * 0.75;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(kurlaPt.x, kurlaPt.y);
      ctx.lineTo(arrowX, arrowY);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(arrowX, arrowY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

  }, [getStormOffset]);

  const drawRef = useRef(drawDopplerSimulation);
  useEffect(() => {
    drawRef.current = drawDopplerSimulation;
  }, [drawDopplerSimulation]);

  // Helper: Apply Basemap Layers
  const setBasemapLayers = useCallback((map: any, L: any, type: MapBasemapType) => {
    // Clear existing base tile layers
    tileLayersGroupRef.current.forEach((layer) => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });
    tileLayersGroupRef.current = [];

    if (type === 'streets') {
      // CartoDB Voyager (Vivid streets, clear Google Maps style neighborhood and area labels)
      const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c', 'd'],
      }).addTo(map);
      tileLayersGroupRef.current.push(streetLayer);
    } else if (type === 'satellite-labels') {
      // Esri Satellite Base Imagery
      const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c', 'd'],
      }).addTo(map);

      // Esri Places & Boundaries Labels Overlay (shows all neighborhood names, area names, districts)
      const labelsLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c', 'd'],
      }).addTo(map);

      // Esri Transportation / Road Network Overlay
      const roadLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c', 'd'],
      }).addTo(map);

      tileLayersGroupRef.current.push(satLayer, labelsLayer, roadLayer);
    } else if (type === 'osm') {
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
      tileLayersGroupRef.current.push(osmLayer);
    } else {
      const darkLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c', 'd'],
      }).addTo(map);
      tileLayersGroupRef.current.push(darkLayer);
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [19.1400, 72.8900],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Set initial basemap (Satellite with real Places and Road Labels)
      setBasemapLayers(map, L, activeBasemap);

      const handleRedraw = () => drawRef.current?.();
      map.on('move moveend zoom zoomend viewreset resize', handleRedraw);

      handleRedraw();
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Basemap when activeBasemap changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      if (!mapInstanceRef.current) return;
      setBasemapLayers(mapInstanceRef.current, L, activeBasemap);
    });
  }, [activeBasemap, setBasemapLayers]);

  // Update Routes, Waypoint Markers, and Fit Bounds when Origin / Destination / Route Strategy changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear previous markers
      markersRef.current.forEach((m) => {
        if (map.hasLayer(m)) map.removeLayer(m);
      });
      markersRef.current = [];

      // Clear previous polylines
      Object.values(polylinesRef.current).forEach((line) => {
        if (map.hasLayer(line)) map.removeLayer(line);
      });
      polylinesRef.current = {};

      if (!fromLocation || !toLocation) {
        // Center on Mumbai metropolitan overview
        map.setView([19.1200, 72.8800], 11);
        drawRef.current?.();
        return;
      }

      // 1. Draw Polylines for balanced, fastest, safer routes
      const recLine = L.polyline(routesData.balanced.coords, {
        color: '#10B981',
        weight: selectedRoute === 'balanced' ? 6 : 3.5,
        opacity: selectedRoute === 'balanced' ? 1.0 : 0.45,
        dashArray: selectedRoute === 'balanced' ? '' : '6, 6',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      const fastLine = L.polyline(routesData.fastest.coords, {
        color: '#DC2626',
        weight: selectedRoute === 'fastest' ? 6 : 3.5,
        opacity: selectedRoute === 'fastest' ? 1.0 : 0.45,
        dashArray: selectedRoute === 'fastest' ? '' : '6, 6',
      }).addTo(map);

      const safeLine = L.polyline(routesData.safer.coords, {
        color: '#087693',
        weight: selectedRoute === 'safer' ? 6 : 3.5,
        opacity: selectedRoute === 'safer' ? 1.0 : 0.45,
        dashArray: selectedRoute === 'safer' ? '' : '6, 6',
      }).addTo(map);

      polylinesRef.current = {
        balanced: recLine,
        fastest: fastLine,
        safer: safeLine,
      };

      if (selectedRoute === 'balanced') recLine.bringToFront();
      else if (selectedRoute === 'fastest') fastLine.bringToFront();
      else safeLine.bringToFront();

      // 2. Add Origin Marker (Blue) at actual Origin coords
      const originHtml = `
        <div class="flex items-center gap-1.5 bg-[#0070F3] text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xl border border-white/80 whitespace-nowrap animate-pulse">
          <span class="w-2 h-2 rounded-full bg-white"></span>
          <span>${originLoc.name} (FROM)</span>
        </div>
      `;
      const originIcon = L.divIcon({
        className: 'origin-marker',
        html: originHtml,
        iconSize: [130, 28],
        iconAnchor: [65, 14],
      });
      const originMarker = L.marker(originLoc.coords, { icon: originIcon, interactive: false }).addTo(map);
      markersRef.current.push(originMarker);

      // 3. Add Destination Marker (Red) at actual Dest coords
      const destHtml = `
        <div class="flex items-center gap-1.5 bg-[#DC2626] text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xl border border-white/80 whitespace-nowrap">
          <span class="w-2 h-2 rounded-full bg-white"></span>
          <span>${destLoc.name} (TO)</span>
        </div>
      `;
      const destIcon = L.divIcon({
        className: 'dest-marker',
        html: destHtml,
        iconSize: [120, 28],
        iconAnchor: [60, 14],
      });
      const destMarker = L.marker(destLoc.coords, { icon: destIcon, interactive: false }).addTo(map);
      markersRef.current.push(destMarker);

      // 4. Smoothly Pan and Fit Bounds to track the actual locations!
      try {
        const bounds = L.latLngBounds([originLoc.coords, destLoc.coords]);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 13,
          animate: true,
          duration: 0.8,
        });
      } catch (err) {
        console.error('FitBounds error:', err);
      }

      drawRef.current?.();
    });
  }, [fromLocation, toLocation, selectedRoute, selectedDepartureTime, travelMode, originLoc, destLoc, routesData]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        drawRef.current?.();
      }
    }, 200);
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter = () => {
    if (mapInstanceRef.current && originLoc && destLoc) {
      import('leaflet').then((L) => {
        const bounds = L.latLngBounds([originLoc.coords, destLoc.coords]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      });
    }
  };

  const basemapDropdownRef = useRef<HTMLDivElement>(null);

  // Close Basemap dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (basemapDropdownRef.current && !basemapDropdownRef.current.contains(e.target as Node)) {
        setBasemapDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const BASEMAP_OPTIONS: Array<{
    id: MapBasemapType;
    label: string;
    badge: string;
    desc: string;
    icon: any;
  }> = [
    {
      id: 'satellite-labels',
      label: 'Satellite Labels',
      badge: 'High-Res',
      desc: 'Esri Satellite + places & road labels',
      icon: Satellite,
    },
    {
      id: 'streets',
      label: 'Voyager Streets',
      badge: 'Google Style',
      desc: 'Clean roads & neighborhood labels',
      icon: MapIcon,
    },
    {
      id: 'osm',
      label: 'OpenStreetMap',
      badge: 'Standard',
      desc: 'Detailed community cartography',
      icon: Layers,
    },
    {
      id: 'dark',
      label: 'Dark Canvas',
      badge: 'Night View',
      desc: 'High-contrast dark base for radar',
      icon: Moon,
    },
  ];

  const getBasemapLabel = (type: MapBasemapType) => {
    const found = BASEMAP_OPTIONS.find((b) => b.id === type);
    return found ? found.label : 'Satellite Labels';
  };

  const stormInfo = getStormOffset();

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col font-sans transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : 'relative h-full min-h-[460px]'
    }`}>
      
      {/* Top Map Card Header Bar with Higher Stacking Context */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-white relative z-40 shrink-0 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-[#0B2F56] tracking-tight">
            Route &amp; Weather Overview
          </h2>
          {fromLocation && toLocation ? (
            <span className="hidden sm:inline-block text-[10px] font-semibold text-[#0070F3] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
              {originLoc.name} &rarr; {destLoc.name}
            </span>
          ) : (
            <span className="hidden sm:inline-block text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
              Awaiting Route
            </span>
          )}
        </div>

        {/* Route Strategy Tabs & Basemap Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Route Strategy Tabs (Scrollable independently without clipping dropdown) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {/* Recommended Route */}
            <button
              type="button"
              onClick={() => onSelectRoute('balanced')}
              disabled={!fromLocation || !toLocation}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                !fromLocation || !toLocation
                  ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                  : selectedRoute === 'balanced'
                  ? 'bg-[#0070F3] text-white shadow-sm'
                  : 'bg-white text-[#0070F3] border border-[#0070F3]/40 hover:bg-blue-50/60'
              }`}
            >
              <span>Recommended Route</span>
            </button>

            {/* Alternative Route 1 */}
            <button
              type="button"
              onClick={() => onSelectRoute('fastest')}
              disabled={!fromLocation || !toLocation}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                !fromLocation || !toLocation
                  ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                  : selectedRoute === 'fastest'
                  ? 'bg-[#0070F3] text-white shadow-sm'
                  : 'bg-white text-[#0070F3] border border-[#0070F3]/40 hover:bg-blue-50/60'
              }`}
            >
              <span>Alternative Route 1</span>
            </button>

            {/* Alternative Route 2 */}
            <button
              type="button"
              onClick={() => onSelectRoute('safer')}
              disabled={!fromLocation || !toLocation}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                !fromLocation || !toLocation
                  ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                  : selectedRoute === 'safer'
                  ? 'bg-[#0070F3] text-white shadow-sm'
                  : 'bg-white text-[#0070F3] border border-[#0070F3]/40 hover:bg-blue-50/60'
              }`}
            >
              <span>Alternative Route 2</span>
            </button>
          </div>

          {/* Action Tools: Basemap Switcher & Fullscreen (Kept strictly outside any overflow-x scroll container) */}
          <div className="flex items-center gap-1.5 shrink-0 relative">
            
            {/* Basemap Dropdown */}
            <div className="relative" ref={basemapDropdownRef}>
              <button
                type="button"
                onClick={() => setBasemapDropdownOpen(!basemapDropdownOpen)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-[#0B2F56] cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-2xs transition-colors"
                title="Change Map Style (Satellite Labels / Voyager Streets / OSM / Dark)"
              >
                <MapIcon className="w-3.5 h-3.5 text-[#0070F3]" />
                <span className="text-[11px] font-bold text-[#0B2F56]">{getBasemapLabel(activeBasemap)}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${basemapDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {basemapDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-1.5 z-[100] text-xs font-sans animate-in fade-in-50 zoom-in-95 duration-100 ring-1 ring-black/5">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between mb-1">
                    <span>Map Basemap Style</span>
                    <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold">Active GPS</span>
                  </div>
                  <div className="space-y-1">
                    {BASEMAP_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = activeBasemap === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setActiveBasemap(opt.id);
                            setBasemapDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-50/80 text-[#0070F3] font-bold border border-blue-200/70 shadow-2xs'
                              : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#0070F3] text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-bold text-[#0B2F56] truncate flex items-center gap-1.5">
                                <span>{opt.label}</span>
                                {opt.badge && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-slate-100 text-slate-500">
                                    {opt.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal truncate">
                                {opt.desc}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-[#0070F3] shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button 
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer shadow-2xs transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Map Display Frame */}
      <div className="relative flex-1 w-full min-h-[380px] bg-slate-950 overflow-hidden select-none">
        
        {/* Real Leaflet Map */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />

        {/* Doppler Radar Simulation Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-10"
        />

        {/* TOP FLOATING NOTIFICATION WHEN BLANK */}
        {(!fromLocation || !toLocation) && (
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-white border border-white/20 px-3.5 py-1.5 rounded-xl text-xs font-semibold z-20 shadow-lg flex items-center gap-2 animate-in fade-in-50">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-[11px]">Select Origin &amp; Destination above to plot route corridors</span>
          </div>
        )}

        {/* TOP LEFT: Rainfall Intensity Color Bar HUD */}
        <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md border border-white/20 rounded-xl p-2.5 z-20 text-white max-w-[190px] shadow-lg">
          <div className="text-[10px] font-bold text-slate-300 mb-1 flex items-center justify-between">
            <span>Rainfall Intensity</span>
            <span className="font-mono text-[9px] text-slate-400">mm/hr</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#0284C7] via-[#22C55E] via-[#FACC15] via-[#EA580C] via-[#DC2626] to-[#A855F7]" />
          <div className="flex justify-between text-[9px] font-mono text-slate-300 mt-1">
            <span>0</span>
            <span>10</span>
            <span>25</span>
            <span>50</span>
            <span>100+</span>
          </div>
        </div>

        {/* LEFT CONTROLS: Zoom & Recenter */}
        <div className="absolute top-24 left-3 flex flex-col gap-1.5 z-20">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
            title="Zoom In"
          >
            <Plus className="w-4 h-4 text-slate-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4 text-slate-700" />
          </button>
          <button
            onClick={handleRecenter}
            className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
            title="Recenter Map to Origin & Destination"
          >
            <Crosshair className="w-4 h-4 text-slate-700" />
          </button>
        </div>

        {/* BOTTOM RIGHT: Route Legend & Scale HUD */}
        <div className="absolute bottom-3 right-3 flex flex-col items-end gap-2 z-20 select-none">
          
          {/* Route Legend Box */}
          {fromLocation && toLocation ? (
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-xl border border-slate-200/90 text-xs font-sans space-y-1.5 min-w-[210px]">
              
              {/* Recommended Route */}
              <div 
                onClick={() => onSelectRoute('balanced')}
                className={`flex items-center gap-2 p-1 rounded-lg cursor-pointer transition-colors ${
                  selectedRoute === 'balanced' ? 'bg-emerald-50 border border-emerald-300' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-5 h-1 rounded bg-[#10B981] shrink-0" />
                <div className="leading-tight">
                  <div className="font-bold text-[#0B2F56] text-[11px]">Recommended Route</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    ({routesData.balanced.duration}, {routesData.balanced.risk} Risk)
                  </div>
                </div>
              </div>

              {/* Alternative Route 1 */}
              <div 
                onClick={() => onSelectRoute('fastest')}
                className={`flex items-center gap-2 p-1 rounded-lg cursor-pointer transition-colors ${
                  selectedRoute === 'fastest' ? 'bg-red-50 border border-red-300' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-5 border-t-2 border-dashed border-[#DC2626] shrink-0" />
                <div className="leading-tight">
                  <div className="font-bold text-[#0B2F56] text-[11px]">Alternative Route 1</div>
                  <div className="text-[10px] text-red-600 font-semibold">
                    ({routesData.fastest.duration}, {routesData.fastest.risk} Risk)
                  </div>
                </div>
              </div>

              {/* Alternative Route 2 */}
              <div 
                onClick={() => onSelectRoute('safer')}
                className={`flex items-center gap-2 p-1 rounded-lg cursor-pointer transition-colors ${
                  selectedRoute === 'safer' ? 'bg-cyan-50 border border-cyan-300' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-5 border-t-2 border-dashed border-[#087693] shrink-0" />
                <div className="leading-tight">
                  <div className="font-bold text-[#0B2F56] text-[11px]">Alternative Route 2</div>
                  <div className="text-[10px] text-cyan-700 font-semibold">
                    ({routesData.safer.duration}, {routesData.safer.risk} Risk)
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-slate-200/80 text-xs font-sans text-slate-500 font-semibold min-w-[200px] text-center">
              <span className="text-[11px] text-slate-500">Awaiting Origin &amp; Destination</span>
            </div>
          )}

          {/* Map Scale Bar */}
          <div className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-white flex items-center gap-3 text-[9px] font-mono shadow">
            <span>0</span>
            <span>10</span>
            <span>15</span>
            <span className="font-bold text-cyan-300">25 km</span>
          </div>

        </div>

      </div>

    </div>
  );
};
