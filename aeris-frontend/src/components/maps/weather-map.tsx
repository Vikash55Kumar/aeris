'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Plus, 
  Minus, 
  Crosshair, 
  Layers, 
  ChevronDown, 
  Play, 
  Pause 
} from 'lucide-react';

interface InteractiveSimulationMapProps {
  activeLayer: 'Composite' | 'Rainfall' | 'Radar' | 'Satellite (INSAT)' | 'Lightning' | 'Risk Layer';
  onLayerChange: (layer: 'Composite' | 'Rainfall' | 'Radar' | 'Satellite (INSAT)' | 'Lightning' | 'Risk Layer') => void;
  selectedTimeline: string;
  onTimelineChange: (timeline: string) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const REGIONS: Record<string, { center: [number, number]; zoom: number }> = {
  'Mumbai Region': { center: [19.0760, 72.8777], zoom: 11 },
  'Konkan Basin': { center: [18.8500, 73.1000], zoom: 9 },
  'Thane & Palghar': { center: [19.3500, 72.9500], zoom: 10 },
  'Pune Catchment': { center: [18.5204, 73.8567], zoom: 10 },
};

const LANDMARKS = [
  { name: 'Mumbai', coords: [18.9800, 72.8300], style: 'bg-[#0B2F56]/95 border border-white/50 text-white font-black text-xs px-2.5 py-0.5 rounded-lg shadow-md' },
  { name: 'Kurla', coords: [19.0728, 72.8797], style: 'bg-[#0B2F56]/95 border-2 border-red-500 text-white font-black text-xs px-2 py-0.5 rounded-md shadow-lg' },
  { name: 'BKC', coords: [19.0607, 72.8683], style: 'bg-[#0B2F56]/90 border border-slate-400 text-white font-semibold text-[10px] px-1.5 py-0.5 rounded shadow' },
  { name: 'Andheri', coords: [19.1136, 72.8697], style: 'bg-[#0B2F56]/90 border border-slate-400 text-white font-semibold text-[10px] px-1.5 py-0.5 rounded shadow' },
  { name: 'Borivali', coords: [19.2307, 72.8567], style: 'bg-[#0B2F56]/90 border border-slate-400 text-white font-semibold text-[10px] px-1.5 py-0.5 rounded shadow' },
  { name: 'Thane', coords: [19.2183, 72.9781], style: 'bg-[#0B2F56]/95 border border-slate-300 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow' },
  { name: 'Bhiwandi', coords: [19.2967, 73.0631], style: 'bg-[#0B2F56]/90 border border-slate-400 text-white font-semibold text-[10px] px-1.5 py-0.5 rounded shadow' },
  { name: 'Navi Mumbai', coords: [19.0330, 73.0297], style: 'bg-[#0B2F56]/90 border border-slate-400 text-white font-semibold text-[10px] px-1.5 py-0.5 rounded shadow' },
  { name: 'Panvel', coords: [18.9894, 73.1175], style: 'bg-[#0B2F56]/90 border border-slate-400 text-white font-semibold text-[10px] px-1.5 py-0.5 rounded shadow' },
  { name: 'Dadar', coords: [19.0178, 72.8478], style: 'bg-[#0B2F56]/90 border border-slate-400 text-white font-semibold text-[10px] px-1.5 py-0.5 rounded shadow' },
  { name: 'Arabian Sea', coords: [19.0500, 72.7300], style: 'text-cyan-200/90 font-serif italic text-sm pointer-events-none tracking-wider' },
];

const TIMELINE_OFFSETS: Record<string, { lat: number; lng: number; intensity: number; offsetHours: number }> = {
  '-2h': { lat: -0.06, lng: -0.05, intensity: 0.6, offsetHours: -2 },
  '-1h': { lat: -0.03, lng: -0.025, intensity: 0.8, offsetHours: -1 },
  'Now': { lat: 0, lng: 0, intensity: 1.0, offsetHours: 0 },
  '+1h': { lat: 0.04, lng: 0.035, intensity: 0.95, offsetHours: 1 },
  '+2h': { lat: 0.08, lng: 0.07, intensity: 0.85, offsetHours: 2 },
  '+3h': { lat: 0.12, lng: 0.10, intensity: 0.7, offsetHours: 3 },
  '+4h': { lat: 0.16, lng: 0.13, intensity: 0.5, offsetHours: 4 },
  '+6h': { lat: 0.22, lng: 0.17, intensity: 0.35, offsetHours: 6 },
};

// Lightning Strike Flash Simulation Points
const LIGHTNING_POINTS = [
  { lat: 19.0728, lng: 72.8797, age: 2, type: '+' },
  { lat: 19.0850, lng: 72.8950, age: 4, type: '-' },
  { lat: 19.0620, lng: 72.8650, age: 6, type: '+' },
  { lat: 19.1000, lng: 72.9100, age: 1, type: '-' },
  { lat: 19.1200, lng: 72.8800, age: 8, type: '+' },
  { lat: 19.1800, lng: 72.9600, age: 3, type: '-' },
  { lat: 19.0400, lng: 72.8900, age: 5, type: '+' },
];

// Flood Risk Polygons (GeoJSON bounds for flood zones)
const RISK_ZONES = [
  {
    name: 'Mithi River Basin & Kurla West',
    coords: [[19.0600, 72.8650], [19.0850, 72.8700], [19.0800, 72.8950], [19.0550, 72.8800]],
    risk: 'Severe',
    fill: 'rgba(220, 38, 38, 0.45)',
    stroke: '#DC2626',
    tag: 'CRITICAL INUNDATION'
  },
  {
    name: 'Chembur & Chunabhatti Lowlands',
    coords: [[19.0450, 72.8850], [19.0700, 72.8950], [19.0650, 72.9200], [19.0350, 72.9050]],
    risk: 'High',
    fill: 'rgba(234, 88, 12, 0.40)',
    stroke: '#EA580C',
    tag: 'HIGH FLOOD RISK'
  },
  {
    name: 'Thane Creek Basin & Western Suburbs',
    coords: [[19.1800, 72.9500], [19.2200, 72.9600], [19.2100, 72.9950], [19.1700, 72.9800]],
    risk: 'Moderate',
    fill: 'rgba(234, 179, 8, 0.35)',
    stroke: '#EAB308',
    tag: 'MODERATE RISK'
  }
];

// Helper: Format Date into HH:mm
const formatTimeHHMM = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Helper: Get formatted time with hour offset from a base date
const getTimeWithOffset = (baseDate: Date, hoursOffset: number) => {
  const targetDate = new Date(baseDate.getTime() + hoursOffset * 60 * 60 * 1000);
  return formatTimeHHMM(targetDate);
};

export const InteractiveSimulationMap: React.FC<InteractiveSimulationMapProps> = ({
  activeLayer,
  onLayerChange,
  selectedTimeline,
  onTimelineChange,
  isPlaying,
  onTogglePlay,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const radarSweepAngleRef = useRef<number>(0);

  const [selectedRegion, setSelectedRegion] = useState<string>('Mumbai Region');
  const [regionDropdown, setRegionDropdown] = useState<boolean>(false);
  
  // Real-time live clock state matching current client time
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    // Keep live clock synchronized in real time
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const layers = [
    'Composite',
    'Rainfall',
    'Radar',
    'Satellite (INSAT)',
    'Lightning',
    'Risk Layer',
  ] as const;

  // Dynamically calculate timeline steps with real-time timestamps
  const timelineSteps = [
    { label: '-2h', time: getTimeWithOffset(currentTime, -2) },
    { label: '-1h', time: getTimeWithOffset(currentTime, -1) },
    { label: 'Now', time: formatTimeHHMM(currentTime) },
    { label: '+1h', time: getTimeWithOffset(currentTime, 1) },
    { label: '+2h', time: getTimeWithOffset(currentTime, 2) },
    { label: '+3h', time: getTimeWithOffset(currentTime, 3) },
    { label: '+4h', time: getTimeWithOffset(currentTime, 4) },
    { label: '+6h', time: getTimeWithOffset(currentTime, 6) },
  ];

  // Helper: Get Watermark-Free Base Tile URL for each layer
  const getTileUrlForLayer = (layer: string) => {
    switch (layer) {
      case 'Radar':
      case 'Lightning':
        // Esri Dark Gray Canvas - Zero watermark, crisp dark theme
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      case 'Rainfall':
      case 'Risk Layer':
        // Esri World Topo Map - Zero watermark, high-contrast terrain and hydrological features
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      case 'Composite':
      case 'Satellite (INSAT)':
      default:
        // Esri High-Resolution World Imagery - Zero watermark, photographic satellite view
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
  };

  // Main Canvas Rendering Engine
  const drawSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    const map = mapInstanceRef.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = map.getSize().x;
    const height = canvas.height = map.getSize().y;

    ctx.clearRect(0, 0, width, height);

    // Convective storm center based on timeline offset
    const offset = TIMELINE_OFFSETS[selectedTimeline] || TIMELINE_OFFSETS['Now'];
    const stormCenterLat = 19.0728 + offset.lat;
    const stormCenterLng = 72.8797 + offset.lng;
    const intensity = offset.intensity;

    // Convert GPS coordinates to screen pixels
    const stormCenterPoint = map.latLngToContainerPoint([stormCenterLat, stormCenterLng]);
    const thanePoint = map.latLngToContainerPoint([19.2183 + offset.lat * 0.7, 72.9781 + offset.lng * 0.7]);
    const naviMumbaiPoint = map.latLngToContainerPoint([19.0330 + offset.lat * 0.5, 73.0297 + offset.lng * 0.5]);

    const zoomScale = Math.pow(2, map.getZoom() - 11);
    const baseRadius = Math.max(60, Math.min(width, height) * 0.28) * zoomScale;

    // Helper: Draw radial convective gradient blob
    const drawRadialBlob = (
      px: number, 
      py: number, 
      radius: number, 
      colorStops: Array<[number, string]>
    ) => {
      if (radius <= 0) return;
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius);
      colorStops.forEach(([stop, color]) => gradient.addColorStop(stop, color));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    // -------------------------------------------------------------
    // LAYER 1: COMPOSITE (Doppler Radar Heatmap + Trajectory Vector)
    // -------------------------------------------------------------
    if (activeLayer === 'Composite') {
      const radarStops: Array<[number, string]> = [
        [0, `rgba(168, 85, 247, ${0.95 * intensity})`],  // 60+ dBZ Magenta
        [0.2, `rgba(220, 38, 38, ${0.90 * intensity})`], // 55 dBZ Red
        [0.4, `rgba(234, 88, 12, ${0.80 * intensity})`], // 45 dBZ Orange
        [0.6, `rgba(250, 204, 21, ${0.70 * intensity})`], // 35 dBZ Yellow
        [0.8, `rgba(34, 197, 94, ${0.50 * intensity})`],  // 25 dBZ Green
        [0.95, `rgba(2, 132, 199, ${0.30 * intensity})`], // 15 dBZ Cyan
        [1, 'rgba(2, 132, 199, 0)']
      ];

      // Storm Core
      drawRadialBlob(stormCenterPoint.x, stormCenterPoint.y, baseRadius, radarStops);
      drawRadialBlob(stormCenterPoint.x + baseRadius * 0.3, stormCenterPoint.y - baseRadius * 0.2, baseRadius * 0.7, radarStops);
      drawRadialBlob(thanePoint.x, thanePoint.y, baseRadius * 0.65, radarStops);
      drawRadialBlob(naviMumbaiPoint.x, naviMumbaiPoint.y, baseRadius * 0.55, radarStops);

      // Trajectory Vector & Dashed Core Boundary
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(stormCenterPoint.x, stormCenterPoint.y, baseRadius * 0.7, 0, Math.PI * 2);
      ctx.stroke();

      // Trajectory Arrow (NE Vector 45deg)
      const arrowTargetX = stormCenterPoint.x + baseRadius * 0.85;
      const arrowTargetY = stormCenterPoint.y - baseRadius * 0.75;

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(stormCenterPoint.x, stormCenterPoint.y);
      ctx.lineTo(arrowTargetX, arrowTargetY);
      ctx.stroke();

      // Arrow Head
      ctx.setLineDash([]);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(arrowTargetX, arrowTargetY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Event A1027 Badge anchored at Storm Center
      ctx.fillStyle = '#DC2626';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 8;
      const badgeW = 90;
      const badgeH = 22;
      const badgeX = stormCenterPoint.x + 12;
      const badgeY = stormCenterPoint.y - 12;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Event A1027', badgeX + badgeW / 2, badgeY + badgeH / 2);
      ctx.restore();
    }

    // -------------------------------------------------------------
    // LAYER 2: RAINFALL (Isohyets, mm/hr Precipitation Gradient)
    // -------------------------------------------------------------
    else if (activeLayer === 'Rainfall') {
      const rainStops: Array<[number, string]> = [
        [0, `rgba(147, 51, 234, ${0.92 * intensity})`],  // 120 mm/hr Violet
        [0.25, `rgba(225, 29, 72, ${0.85 * intensity})`], // 90 mm/hr Rose Red
        [0.45, `rgba(234, 88, 12, ${0.75 * intensity})`], // 60 mm/hr Orange
        [0.65, `rgba(234, 179, 8, ${0.65 * intensity})`], // 30 mm/hr Amber
        [0.85, `rgba(34, 197, 94, ${0.45 * intensity})`], // 15 mm/hr Green
        [0.98, `rgba(6, 182, 212, ${0.25 * intensity})`], // 5 mm/hr Cyan
        [1, 'rgba(6, 182, 212, 0)']
      ];

      drawRadialBlob(stormCenterPoint.x, stormCenterPoint.y, baseRadius * 1.1, rainStops);
      drawRadialBlob(stormCenterPoint.x + 30, stormCenterPoint.y - 20, baseRadius * 0.8, rainStops);
      drawRadialBlob(thanePoint.x, thanePoint.y, baseRadius * 0.7, rainStops);

      // Rainfall Telemetry Callout Tags
      ctx.save();
      const drawCallout = (pt: { x: number; y: number }, text: string, subtext: string) => {
        ctx.fillStyle = '#0B2F56';
        ctx.beginPath();
        ctx.roundRect(pt.x + 10, pt.y - 18, 95, 34, 6);
        ctx.fill();
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(text, pt.x + 16, pt.y - 3);

        ctx.fillStyle = '#E2E8F0';
        ctx.font = '9px sans-serif';
        ctx.fillText(subtext, pt.x + 16, pt.y + 10);
      };

      drawCallout(stormCenterPoint, '92 mm/hr', 'Kurla Gauge');
      drawCallout(thanePoint, '58 mm/hr', 'Thane Gauge');
      ctx.restore();
    }

    // -------------------------------------------------------------
    // LAYER 3: RADAR (Doppler dBZ Reflectivity & Range Rings)
    // -------------------------------------------------------------
    else if (activeLayer === 'Radar') {
      const dwrCenter = map.latLngToContainerPoint([19.0500, 72.8500]); // Mumbai DWR Radar site

      // Doppler Range Rings (30km, 60km, 90km)
      ctx.save();
      ctx.strokeStyle = 'rgba(17, 216, 204, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      [baseRadius * 0.8, baseRadius * 1.5, baseRadius * 2.2].forEach((radius, idx) => {
        ctx.beginPath();
        ctx.arc(dwrCenter.x, dwrCenter.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(17, 216, 204, 0.75)';
        ctx.font = '9px monospace';
        ctx.fillText(`${(idx + 1) * 30} km`, dwrCenter.x + radius - 30, dwrCenter.y - 4);
      });

      // Rotating Radar Beam Sweep Simulation
      radarSweepAngleRef.current = (radarSweepAngleRef.current + 0.02) % (Math.PI * 2);
      const sweepAngle = radarSweepAngleRef.current;
      const sweepLength = baseRadius * 2.5;

      const sweepGradient = ctx.createConicGradient(sweepAngle, dwrCenter.x, dwrCenter.y);
      sweepGradient.addColorStop(0, 'rgba(17, 216, 204, 0.25)');
      sweepGradient.addColorStop(0.1, 'rgba(17, 216, 204, 0.0)');
      sweepGradient.addColorStop(1, 'rgba(17, 216, 204, 0.0)');

      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.arc(dwrCenter.x, dwrCenter.y, sweepLength, 0, Math.PI * 2);
      ctx.fill();

      // Convective dBZ Cores
      const radarStops: Array<[number, string]> = [
        [0, `rgba(236, 72, 153, ${0.95 * intensity})`],  // 65 dBZ Pink
        [0.2, `rgba(220, 38, 38, ${0.90 * intensity})`], // 55 dBZ Red
        [0.4, `rgba(234, 88, 12, ${0.80 * intensity})`], // 45 dBZ Orange
        [0.6, `rgba(250, 204, 21, ${0.70 * intensity})`], // 35 dBZ Yellow
        [0.8, `rgba(34, 197, 94, ${0.50 * intensity})`],  // 25 dBZ Green
        [0.95, `rgba(6, 182, 212, ${0.30 * intensity})`], // 15 dBZ Cyan
        [1, 'rgba(6, 182, 212, 0)']
      ];

      drawRadialBlob(stormCenterPoint.x, stormCenterPoint.y, baseRadius * 0.9, radarStops);
      drawRadialBlob(thanePoint.x, thanePoint.y, baseRadius * 0.6, radarStops);
      ctx.restore();
    }

    // -------------------------------------------------------------
    // LAYER 4: SATELLITE (INSAT-3D IR Cloud Top Temperature CTT)
    // -------------------------------------------------------------
    else if (activeLayer === 'Satellite (INSAT)') {
      const irStops: Array<[number, string]> = [
        [0, `rgba(168, 85, 247, ${0.90 * intensity})`],  // -75°C Cold Cloud Core (Magenta)
        [0.25, `rgba(59, 130, 246, ${0.80 * intensity})`],// -60°C Deep Convection (Blue)
        [0.5, `rgba(16, 185, 129, ${0.65 * intensity})`], // -40°C Anvil Cloud (Emerald)
        [0.75, `rgba(251, 191, 36, ${0.50 * intensity})`],// -20°C Mid-level Clouds (Amber)
        [0.95, `rgba(255, 255, 255, ${0.25 * intensity})`],// 0°C Low Clouds (White)
        [1, 'rgba(255, 255, 255, 0)']
      ];

      drawRadialBlob(stormCenterPoint.x, stormCenterPoint.y, baseRadius * 1.3, irStops);
      drawRadialBlob(stormCenterPoint.x - 40, stormCenterPoint.y + 30, baseRadius * 1.0, irStops);
      drawRadialBlob(thanePoint.x, thanePoint.y, baseRadius * 0.9, irStops);

      // CTT Label Badge
      ctx.save();
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(stormCenterPoint.x - 55, stormCenterPoint.y - 12, 110, 24, 6);
      ctx.fill();
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#F1F5F9';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CTT: -72°C (INSAT-3D)', stormCenterPoint.x, stormCenterPoint.y);
      ctx.restore();
    }

    // -------------------------------------------------------------
    // LAYER 5: LIGHTNING (Real-time Discharges, Shockwaves & Density)
    // -------------------------------------------------------------
    else if (activeLayer === 'Lightning') {
      // Background Strike Density Heatmap
      const lightningStops: Array<[number, string]> = [
        [0, 'rgba(250, 204, 21, 0.75)'],
        [0.4, 'rgba(234, 88, 12, 0.55)'],
        [0.8, 'rgba(220, 38, 38, 0.25)'],
        [1, 'rgba(220, 38, 38, 0)']
      ];
      drawRadialBlob(stormCenterPoint.x, stormCenterPoint.y, baseRadius * 0.85, lightningStops);

      // Render Individual Lightning Flashes
      ctx.save();
      LIGHTNING_POINTS.forEach((pt, index) => {
        const screenPt = map.latLngToContainerPoint([pt.lat + offset.lat * 0.5, pt.lng + offset.lng * 0.5]);
        
        // Animated Expanding Shockwave Ring
        const ringRadius = 12 + ((Date.now() / 200 + index * 4) % 18);
        ctx.strokeStyle = `rgba(250, 204, 21, ${Math.max(0, 1 - ringRadius / 30)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(screenPt.x, screenPt.y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Flash Core
        ctx.fillStyle = '#FEF08A';
        ctx.shadowColor = '#FACC15';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(screenPt.x, screenPt.y, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Time tag
        ctx.fillStyle = '#F8FAFC';
        ctx.shadowBlur = 0;
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`⚡ -${pt.age}m`, screenPt.x + 8, screenPt.y + 3);
      });

      // Total Strikes Badge Top Overlay
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(14, 60, 175, 26, 6);
      ctx.fill();
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#FACC15';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡ 36 Strikes in 15 mins', 24, 73);
      ctx.restore();
    }

    // -------------------------------------------------------------
    // LAYER 6: RISK LAYER (Urban Flood Inundation Zones & Hotspots)
    // -------------------------------------------------------------
    else if (activeLayer === 'Risk Layer') {
      ctx.save();
      RISK_ZONES.forEach((zone) => {
        const screenCoords = zone.coords.map((c) => map.latLngToContainerPoint(c as [number, number]));
        if (screenCoords.length < 3) return;

        ctx.fillStyle = zone.fill;
        ctx.strokeStyle = zone.stroke;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(screenCoords[0].x, screenCoords[0].y);
        for (let i = 1; i < screenCoords.length; i++) {
          ctx.lineTo(screenCoords[i].x, screenCoords[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Zone Tag
        const centerPt = {
          x: screenCoords.reduce((sum, p) => sum + p.x, 0) / screenCoords.length,
          y: screenCoords.reduce((sum, p) => sum + p.y, 0) / screenCoords.length,
        };

        ctx.fillStyle = zone.stroke;
        ctx.beginPath();
        ctx.roundRect(centerPt.x - 55, centerPt.y - 10, 110, 20, 4);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(zone.tag, centerPt.x, centerPt.y);
      });
      ctx.restore();
    }
  }, [activeLayer, selectedTimeline]);

  // Ref to always hold fresh drawSimulation
  const drawRef = useRef(drawSimulation);
  useEffect(() => {
    drawRef.current = drawSimulation;
  }, [drawSimulation]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [19.0760, 72.8777],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Base Tile Layer (Watermark-Free)
      const tileUrl = getTileUrlForLayer(activeLayer);
      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 18,
        subdomains: ['a', 'b', 'c', 'd'],
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Landmark Markers Group
      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;

      LANDMARKS.forEach((lm) => {
        const icon = L.divIcon({
          className: 'custom-map-marker',
          html: `<div class="${lm.style}">${lm.name}</div>`,
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        });
        L.marker(lm.coords as [number, number], { icon, interactive: false }).addTo(markersGroup);
      });

      // Synchronize Canvas on Map Events
      const handleRedraw = () => drawRef.current?.();
      map.on('move moveend zoom zoomend viewreset resize', handleRedraw);

      handleRedraw();
    });

    return () => {
      isMounted = false;
      const mapInstance = mapInstanceRef.current;
      if (mapInstance) {
        mapInstance.remove();
        mapInstanceRef.current = null;
      }
      const animFrame = animationFrameRef.current;
      if (animFrame) {
        cancelAnimationFrame(animFrame);
      }
    };
  }, []);

  // 2. Switch Tile Layer dynamically when activeLayer changes (100% Watermark-Free)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      if (!mapInstanceRef.current) return;

      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      const newTileUrl = getTileUrlForLayer(activeLayer);
      const newTileLayer = L.tileLayer(newTileUrl, {
        maxZoom: 18,
        subdomains: ['a', 'b', 'c', 'd'],
      }).addTo(mapInstanceRef.current);

      tileLayerRef.current = newTileLayer;
      drawSimulation();
    });
  }, [activeLayer, drawSimulation]);

  // 3. Animation loop for rotating radar beam or lightning pulses
  useEffect(() => {
    let frameId: number;
    const loop = () => {
      if (activeLayer === 'Radar' || activeLayer === 'Lightning') {
        drawSimulation();
      }
      frameId = requestAnimationFrame(loop);
    };

    if (activeLayer === 'Radar' || activeLayer === 'Lightning') {
      frameId = requestAnimationFrame(loop);
    } else {
      drawSimulation();
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [activeLayer, drawSimulation]);

  // Handle Region Change
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setRegionDropdown(false);
    if (mapInstanceRef.current && REGIONS[region]) {
      const { center, zoom } = REGIONS[region];
      mapInstanceRef.current.flyTo(center, zoom, { duration: 1.2 });
    }
  };

  // Zoom Controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([19.0760, 72.8777], 11, { duration: 1 });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col relative font-sans">
      
      {/* Map Canvas Container */}
      <div className="relative w-full h-[540px] sm:h-[580px] bg-slate-950 overflow-hidden select-none">
        
        {/* Real Leaflet Map Container */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />

        {/* Real-time Weather Radar / Layer Simulation Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-10"
        />

        {/* TOP OVERLAY: Layer Pills (Left) & Region Dropdown (Right) */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-30">
          
          {/* Layer Switcher Pills */}
          <div className="flex items-center gap-1 bg-black/55 backdrop-blur-md p-1 rounded-xl border border-white/20 overflow-x-auto max-w-[calc(100%-145px)] shadow-lg">
            {layers.map((layer) => {
              const isActive = activeLayer === layer;
              return (
                <button
                  key={layer}
                  onClick={() => onLayerChange(layer)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#0B2F56] shadow-md'
                      : 'text-white/80 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {layer}
                </button>
              );
            })}
          </div>

          {/* Region Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRegionDropdown(!regionDropdown)}
              className="bg-white/95 hover:bg-white text-[#0B2F56] font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-md backdrop-blur-md flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>{selectedRegion}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${regionDropdown ? 'rotate-180' : ''}`} />
            </button>

            {regionDropdown && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 font-sans animate-in fade-in-50 zoom-in-95">
                {Object.keys(REGIONS).map((reg) => (
                  <button
                    key={reg}
                    onClick={() => handleRegionChange(reg)}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 font-semibold cursor-pointer ${
                      selectedRegion === reg ? 'text-[#087693] bg-[#E6F3F7]/60' : 'text-slate-700'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LEFT FLOATING CONTROLS: Zoom, Recenter, Layers */}
        <div className="absolute top-16 left-3 flex flex-col gap-1.5 z-30">
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
            title="Recenter Map"
          >
            <Crosshair className="w-4 h-4 text-slate-700" />
          </button>
          <button
            onClick={() => onLayerChange(activeLayer === 'Radar' ? 'Composite' : 'Radar')}
            className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
            title="Toggle Radar Mode"
          >
            <Layers className="w-4 h-4 text-slate-700" />
          </button>
        </div>

        {/* BOTTOM LEFT: Dynamic Legend HUD based on Active Layer */}
        <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-2.5 z-30 text-white max-w-[210px] shadow-lg">
          {activeLayer === 'Composite' && (
            <>
              <div className="text-[10px] font-bold text-slate-300 mb-1">
                Rainfall Intensity (mm/hr)
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#0284C7] via-[#22C55E] via-[#FACC15] via-[#EA580C] via-[#DC2626] to-[#A855F7]" />
              <div className="flex justify-between text-[9px] font-mono text-slate-300 mt-1">
                <span>0</span>
                <span>1</span>
                <span>5</span>
                <span>10</span>
                <span>20</span>
                <span>50</span>
                <span>100+</span>
              </div>
            </>
          )}

          {activeLayer === 'Rainfall' && (
            <>
              <div className="text-[10px] font-bold text-slate-300 mb-1">
                Precipitation Rate (mm/hr)
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#06B6D4] via-[#22C55E] via-[#EAB308] via-[#EA580C] via-[#E11D48] to-[#9333EA]" />
              <div className="flex justify-between text-[9px] font-mono text-slate-300 mt-1">
                <span>0</span>
                <span>10</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100+</span>
              </div>
            </>
          )}

          {activeLayer === 'Radar' && (
            <>
              <div className="text-[10px] font-bold text-slate-300 mb-1">
                Doppler Reflectivity (dBZ)
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#06B6D4] via-[#22C55E] via-[#FACC15] via-[#EA580C] via-[#DC2626] to-[#EC4899]" />
              <div className="flex justify-between text-[9px] font-mono text-slate-300 mt-1">
                <span>15</span>
                <span>25</span>
                <span>35</span>
                <span>45</span>
                <span>55</span>
                <span>65+</span>
              </div>
            </>
          )}

          {activeLayer === 'Satellite (INSAT)' && (
            <>
              <div className="text-[10px] font-bold text-slate-300 mb-1">
                Cloud Top Temp (°C)
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#FFFFFF] via-[#FBBF24] via-[#10B981] via-[#3B82F6] to-[#A855F7]" />
              <div className="flex justify-between text-[9px] font-mono text-slate-300 mt-1">
                <span>0°</span>
                <span>-20°</span>
                <span>-40°</span>
                <span>-60°</span>
                <span>-75°C</span>
              </div>
            </>
          )}

          {activeLayer === 'Lightning' && (
            <>
              <div className="text-[10px] font-bold text-slate-300 mb-1">
                Lightning Strike Density (/km²)
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#FEF08A] via-[#FACC15] via-[#EA580C] to-[#DC2626]" />
              <div className="flex justify-between text-[9px] font-mono text-slate-300 mt-1">
                <span>0</span>
                <span>2</span>
                <span>5</span>
                <span>10</span>
                <span>20</span>
                <span>35+</span>
              </div>
            </>
          )}

          {activeLayer === 'Risk Layer' && (
            <>
              <div className="text-[10px] font-bold text-slate-300 mb-1">
                Urban Flood Risk Level
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#22C55E] via-[#EAB308] via-[#EA580C] to-[#DC2626]" />
              <div className="flex justify-between text-[9px] font-mono text-slate-300 mt-1">
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
                <span>Severe</span>
              </div>
            </>
          )}
        </div>

        {/* BOTTOM CENTER/RIGHT: Time Scrubber Player with Real-Time Timestamps */}
        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl px-3.5 py-2 z-30 text-white flex items-center gap-3 shadow-lg">
          <button
            onClick={onTogglePlay}
            className="w-7 h-7 rounded-full bg-white text-[#0B2F56] flex items-center justify-center shrink-0 hover:bg-slate-200 cursor-pointer shadow-sm transition-transform active:scale-95"
            title={isPlaying ? 'Pause Simulation' : 'Play Timeline'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-[#0B2F56]" /> : <Play className="w-3.5 h-3.5 fill-[#0B2F56] ml-0.5" />}
          </button>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {timelineSteps.map((step) => {
              const isNow = step.label === 'Now';
              const isSelected = selectedTimeline === step.label;

              return (
                <button
                  key={step.label}
                  onClick={() => onTimelineChange(step.label)}
                  className={`flex flex-col items-center cursor-pointer transition-all ${
                    isSelected ? 'scale-105 opacity-100' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* Upper Floating Timestamp Badge: shows real-time timestamp for active step or live time */}
                  {isSelected ? (
                    <span className="bg-white text-[#0B2F56] font-mono text-[9px] font-black px-1.5 py-0.2 rounded mb-0.5 shadow-xs animate-in fade-in zoom-in-95 duration-150">
                      {step.time}
                    </span>
                  ) : isNow ? (
                    <span className="text-[9px] font-mono font-bold text-cyan-300/80 mb-0.5">
                      {step.time}
                    </span>
                  ) : (
                    <span className="h-[15px] mb-0.5" />
                  )}

                  <span className={`text-[11px] ${
                    isNow 
                      ? 'font-black text-cyan-300' 
                      : isSelected 
                      ? 'font-bold text-white' 
                      : 'font-medium text-slate-300'
                  }`}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
