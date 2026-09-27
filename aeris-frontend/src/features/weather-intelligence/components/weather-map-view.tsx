'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Plus, 
  Minus, 
  Crosshair, 
  Layers, 
  ChevronDown, 
  Maximize2,
  Minimize2,
  Satellite,
  Radio,
  Thermometer,
  Zap,
  Wind,
  Check,
  MapPin
} from 'lucide-react';

interface WeatherMapViewProps {
  liveTime?: Date;
  selectedOffsetHours?: number;
}

type TabType = 'Composite View' | 'Satellite (INSAT)' | 'Radar Reflectivity' | 'Cloud Top Temp' | 'Lightning' | 'Wind & Moisture';

interface LayerState {
  adminBoundary: boolean;
  radarReflectivity: boolean;
  satelliteInsat: boolean;
  cloudTopTemp: boolean;
  lightningIldn: boolean;
  windImdaa: boolean;
  moistureMidaa: boolean;
  eventTrack: boolean;
  cityLabels: boolean;
}

interface HoveredLocationInfo {
  x: number;
  y: number;
  lat: number;
  lng: number;
  name: string;
  rainfall: string;
  radarDbz: string;
  cloudTemp: string;
  lightning: string;
  wind: string;
  riskStatus: string;
  riskColor: string;
}

const REGIONS: Record<string, { center: [number, number]; zoom: number }> = {
  'Mumbai (City)': { center: [19.0760, 72.8777], zoom: 11 },
  'Eastern Suburbs': { center: [19.0728, 72.9000], zoom: 12 },
  'Western Suburbs': { center: [19.1136, 72.8400], zoom: 12 },
  'Thane & Palghar': { center: [19.2500, 72.9500], zoom: 10 },
  'Konkan Basin': { center: [18.8500, 73.1000], zoom: 9 },
};

const MAP_LANDMARKS = [
  { name: 'Mumbai (Island City)', coords: [18.9800, 72.8300], isPrimary: true, rainfall: '45 mm/hr', dbz: '38 dBZ', temp: '-54°C', lightning: '4 strikes', wind: 'NE 22 km/h', risk: 'Moderate', riskColor: '#EAB308' },
  { name: 'Kurla West', coords: [19.0728, 72.8797], isCore: true, rainfall: '92.4 mm/hr', dbz: '56.2 dBZ', temp: '-72.5°C', lightning: '18 strikes', wind: 'NE 32 km/h', risk: 'Critical Hazard', riskColor: '#DC2626' },
  { name: 'BKC Financial Hub', coords: [19.0607, 72.8683], rainfall: '68 mm/hr', dbz: '48 dBZ', temp: '-68°C', lightning: '12 strikes', wind: 'NE 28 km/h', risk: 'High Risk', riskColor: '#EA580C' },
  { name: 'Andheri Subway', coords: [19.1136, 72.8697], rainfall: '52 mm/hr', dbz: '42 dBZ', temp: '-60°C', lightning: '8 strikes', wind: 'NE 25 km/h', risk: 'High Risk', riskColor: '#EA580C' },
  { name: 'Thane City Basin', coords: [19.2183, 72.9781], rainfall: '64 mm/hr', dbz: '45 dBZ', temp: '-62°C', lightning: '10 strikes', wind: 'NE 26 km/h', risk: 'High Risk', riskColor: '#EA580C' },
  { name: 'Bhiwandi Industrial', coords: [19.2967, 73.0631], rainfall: '38 mm/hr', dbz: '35 dBZ', temp: '-48°C', lightning: '5 strikes', wind: 'NE 20 km/h', risk: 'Moderate', riskColor: '#EAB308' },
  { name: 'Navi Mumbai', coords: [19.0330, 73.0297], rainfall: '40 mm/hr', dbz: '36 dBZ', temp: '-50°C', lightning: '6 strikes', wind: 'NE 22 km/h', risk: 'Moderate', riskColor: '#EAB308' },
  { name: 'Dadar Central', coords: [19.0178, 72.8478], rainfall: '55 mm/hr', dbz: '44 dBZ', temp: '-58°C', lightning: '9 strikes', wind: 'NE 24 km/h', risk: 'High Risk', riskColor: '#EA580C' },
  { name: 'Borivali West', coords: [19.2307, 72.8567], rainfall: '32 mm/hr', dbz: '30 dBZ', temp: '-42°C', lightning: '3 strikes', wind: 'NE 18 km/h', risk: 'Low Risk', riskColor: '#22C55E' },
  { name: 'Vasai-Virar', coords: [19.3919, 72.8397], rainfall: '25 mm/hr', dbz: '26 dBZ', temp: '-38°C', lightning: '2 strikes', wind: 'NE 16 km/h', risk: 'Low Risk', riskColor: '#22C55E' },
];

const ADMIN_BOUNDARIES = [
  {
    name: 'Mumbai Suburban District',
    coords: [[19.0000, 72.8000], [19.2600, 72.8200], [19.2400, 72.9800], [19.0500, 72.9200]],
    color: '#0284C7'
  },
  {
    name: 'Thane Metropolitan Region',
    coords: [[19.1500, 72.9300], [19.3500, 72.9500], [19.3200, 73.1200], [19.1200, 73.0500]],
    color: '#3B82F6'
  },
  {
    name: 'Palghar Coastal District',
    coords: [[19.3300, 72.7800], [19.5500, 72.8000], [19.5200, 73.0200], [19.3200, 72.9500]],
    color: '#6366F1'
  }
];

export const WeatherMapView: React.FC<WeatherMapViewProps> = ({
  liveTime = new Date(),
  selectedOffsetHours = 0,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hoverThrottleRef = useRef<number | null>(null);
  const radarSweepAngleRef = useRef<number>(0);
  const windParticlesRef = useRef<Array<{ x: number; y: number; speed: number; age: number; maxAge: number }>>([]);

  const [activeTab, setActiveTab] = useState<TabType>('Composite View');
  const [selectedRegion, setSelectedRegion] = useState<string>('Mumbai (City)');
  const [showRegionDropdown, setShowRegionDropdown] = useState<boolean>(false);
  const [showLayersDropdown, setShowLayersDropdown] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Hover telemetry state with white background card
  const [hoveredInfo, setHoveredInfo] = useState<HoveredLocationInfo | null>(null);

  const [layers, setLayers] = useState<LayerState>({
    adminBoundary: true,
    radarReflectivity: true,
    satelliteInsat: true,
    cloudTopTemp: true,
    lightningIldn: false,
    windImdaa: false,
    moistureMidaa: false,
    eventTrack: true,
    cityLabels: true,
  });

  const toggleLayer = (key: keyof LayerState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Watermark-Free Base Tiles for Weather Intelligence
  const getTileUrlForTab = (tab: TabType) => {
    switch (tab) {
      case 'Radar Reflectivity':
      case 'Lightning':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      case 'Wind & Moisture':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      case 'Composite View':
      case 'Satellite (INSAT)':
      case 'Cloud Top Temp':
      default:
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
  };

  // Landmark Badges
  const renderLandmarks = useCallback((L: any, group: any, visible: boolean) => {
    group.clearLayers();
    if (!visible) return;

    // Arabian Sea Label
    const seaIcon = L.divIcon({
      className: 'sea-label',
      html: `<div style="color: #67e8f9; font-style: italic; font-size: 15px; font-weight: 600; letter-spacing: 0.05em; text-shadow: 0 2px 6px rgba(0,0,0,0.9); pointer-events: none;">Arabian Sea</div>`,
      iconSize: [120, 24],
      iconAnchor: [60, 12],
    });
    L.marker([19.0500, 72.7300], { icon: seaIcon, interactive: false }).addTo(group);

    MAP_LANDMARKS.forEach((lm) => {
      let badgeHtml = `<div class="bg-[#0B2F56]/90 hover:bg-[#0B2F56] border border-slate-400 text-white font-semibold text-[10px] px-1.5 py-0.5 rounded shadow cursor-pointer transition-transform hover:scale-105">${lm.name}</div>`;
      
      if (lm.isPrimary) {
        badgeHtml = `<div class="bg-[#0B2F56]/95 border border-white/50 text-white font-black text-xs px-2.5 py-0.5 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105">${lm.name}</div>`;
      } else if (lm.isCore) {
        badgeHtml = `<div class="bg-[#0B2F56]/95 border-2 border-red-500 text-white font-black text-xs px-2 py-0.5 rounded-md shadow-lg cursor-pointer transition-transform hover:scale-105 animate-pulse">${lm.name}</div>`;
      }

      const icon = L.divIcon({
        className: 'city-marker',
        html: badgeHtml,
        iconSize: [70, 22],
        iconAnchor: [35, 11],
      });

      L.marker(lm.coords as [number, number], { icon, interactive: false }).addTo(group);
    });
  }, []);

  // Main Canvas Simulation Engine (Independent of hover state to prevent flickering)
  const drawSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    const map = mapInstanceRef.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = map.getSize().x;
    const height = canvas.height = map.getSize().y;

    ctx.clearRect(0, 0, width, height);

    // Timeline offset coordinates
    const offsetLat = selectedOffsetHours * 0.035;
    const offsetLng = selectedOffsetHours * 0.03;
    const intensity = Math.max(0.3, 1 - Math.abs(selectedOffsetHours) * 0.12);

    const stormCenterLat = 19.0728 + offsetLat;
    const stormCenterLng = 72.8797 + offsetLng;

    const stormCenterPoint = map.latLngToContainerPoint([stormCenterLat, stormCenterLng]);
    const thanePoint = map.latLngToContainerPoint([19.2183 + offsetLat * 0.7, 72.9781 + offsetLng * 0.7]);
    const naviMumbaiPoint = map.latLngToContainerPoint([19.0330 + offsetLat * 0.5, 73.0297 + offsetLng * 0.5]);

    const zoomScale = Math.pow(2, map.getZoom() - 11);
    const baseRadius = Math.max(70, Math.min(width, height) * 0.30) * zoomScale;

    // Helper: Draw radial gradient blob
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

    // 1. Administrative Boundaries Overlay
    if (layers.adminBoundary) {
      ctx.save();
      ADMIN_BOUNDARIES.forEach((dist) => {
        const pts = dist.coords.map((c) => map.latLngToContainerPoint(c as [number, number]));
        if (pts.length < 3) return;
        ctx.strokeStyle = `${dist.color}90`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.closePath();
        ctx.stroke();
      });
      ctx.restore();
    }

    // 2. Radar Reflectivity / Composite Simulation
    const showRadar = layers.radarReflectivity || activeTab === 'Composite View' || activeTab === 'Radar Reflectivity';
    if (showRadar) {
      const radarStops: Array<[number, string]> = [
        [0, `rgba(168, 85, 247, ${0.95 * intensity})`],  // 60+ dBZ Magenta
        [0.2, `rgba(220, 38, 38, ${0.90 * intensity})`], // 55 dBZ Red
        [0.4, `rgba(234, 88, 12, ${0.80 * intensity})`], // 45 dBZ Orange
        [0.6, `rgba(250, 204, 21, ${0.70 * intensity})`], // 35 dBZ Yellow
        [0.8, `rgba(34, 197, 94, ${0.50 * intensity})`],  // 25 dBZ Green
        [0.95, `rgba(2, 132, 199, ${0.30 * intensity})`], // 15 dBZ Cyan
        [1, 'rgba(2, 132, 199, 0)']
      ];

      drawRadialBlob(stormCenterPoint.x, stormCenterPoint.y, baseRadius, radarStops);
      drawRadialBlob(stormCenterPoint.x + baseRadius * 0.25, stormCenterPoint.y - baseRadius * 0.2, baseRadius * 0.7, radarStops);
      drawRadialBlob(thanePoint.x, thanePoint.y, baseRadius * 0.65, radarStops);
      drawRadialBlob(naviMumbaiPoint.x, naviMumbaiPoint.y, baseRadius * 0.55, radarStops);
    }

    // 3. Satellite (INSAT) & Cloud Top Temp (CTT) Layer
    const showSat = layers.satelliteInsat || layers.cloudTopTemp || activeTab === 'Satellite (INSAT)' || activeTab === 'Cloud Top Temp';
    if (showSat && !showRadar) {
      const irStops: Array<[number, string]> = [
        [0, `rgba(168, 85, 247, ${0.88 * intensity})`],  // -75°C Magenta Core
        [0.25, `rgba(59, 130, 246, ${0.80 * intensity})`],// -60°C Deep Convection
        [0.5, `rgba(16, 185, 129, ${0.65 * intensity})`], // -40°C Anvil Cloud
        [0.75, `rgba(251, 191, 36, ${0.50 * intensity})`],// -20°C Mid Clouds
        [0.95, `rgba(255, 255, 255, ${0.25 * intensity})`],// 0°C Low Clouds
        [1, 'rgba(255, 255, 255, 0)']
      ];

      drawRadialBlob(stormCenterPoint.x, stormCenterPoint.y, baseRadius * 1.25, irStops);
      drawRadialBlob(thanePoint.x, thanePoint.y, baseRadius * 0.9, irStops);
    }

    // 4. Doppler Radar Station Sweep Beam & Range Rings (for Radar tab)
    if (activeTab === 'Radar Reflectivity') {
      const dwrCenter = map.latLngToContainerPoint([19.0500, 72.8500]);
      ctx.save();
      ctx.strokeStyle = 'rgba(17, 216, 204, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      [baseRadius * 0.8, baseRadius * 1.5, baseRadius * 2.2].forEach((radius, idx) => {
        ctx.beginPath();
        ctx.arc(dwrCenter.x, dwrCenter.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(17, 216, 204, 0.8)';
        ctx.font = '9px monospace';
        ctx.fillText(`${(idx + 1) * 30} km`, dwrCenter.x + radius - 30, dwrCenter.y - 4);
      });

      // Rotating Radar Beam Sweep
      radarSweepAngleRef.current = (radarSweepAngleRef.current + 0.02) % (Math.PI * 2);
      const sweepAngle = radarSweepAngleRef.current;
      const sweepLength = baseRadius * 2.5;

      const sweepGradient = ctx.createConicGradient(sweepAngle, dwrCenter.x, dwrCenter.y);
      sweepGradient.addColorStop(0, 'rgba(17, 216, 204, 0.3)');
      sweepGradient.addColorStop(0.1, 'rgba(17, 216, 204, 0.0)');
      sweepGradient.addColorStop(1, 'rgba(17, 216, 204, 0.0)');

      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.arc(dwrCenter.x, dwrCenter.y, sweepLength, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Wind Particle Streamlines & Moisture Saturation (for Wind & Moisture tab or checkboxes)
    const showWind = layers.windImdaa || layers.moistureMidaa || activeTab === 'Wind & Moisture';
    if (showWind) {
      ctx.save();
      // Moisture CAPE Saturation Heatmap
      const moistureStops: Array<[number, string]> = [
        [0, 'rgba(6, 182, 212, 0.6)'],
        [0.4, 'rgba(14, 165, 233, 0.4)'],
        [0.8, 'rgba(59, 130, 246, 0.2)'],
        [1, 'rgba(59, 130, 246, 0)']
      ];
      drawRadialBlob(stormCenterPoint.x, stormCenterPoint.y, baseRadius * 1.3, moistureStops);

      // Initialize wind particles if needed
      if (windParticlesRef.current.length < 50) {
        windParticlesRef.current = Array.from({ length: 60 }).map(() => ({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: 1.5 + Math.random() * 2.5,
          age: Math.random() * 40,
          maxAge: 40 + Math.random() * 30
        }));
      }

      // Update & render wind particle streamlines flowing NE
      ctx.strokeStyle = 'rgba(165, 243, 252, 0.7)';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';

      windParticlesRef.current.forEach((p) => {
        p.x += p.speed * 0.8;
        p.y -= p.speed * 0.6; // Flowing North-East
        p.age += 1;

        if (p.age > p.maxAge || p.x > width || p.y < 0) {
          p.x = Math.random() * (width * 0.5);
          p.y = height * 0.5 + Math.random() * (height * 0.5);
          p.age = 0;
        }

        const alpha = Math.sin((p.age / p.maxAge) * Math.PI);
        ctx.strokeStyle = `rgba(165, 243, 252, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 8, p.y + 6);
        ctx.stroke();
      });
      ctx.restore();
    }

    // 6. Lightning Flash Simulation (for Lightning tab or checkbox)
    const showLightning = layers.lightningIldn || activeTab === 'Lightning';
    if (showLightning) {
      ctx.save();
      for (let i = 0; i < 14; i++) {
        const lx = stormCenterPoint.x + Math.sin(i * 4.2 + (Date.now() / 300)) * (baseRadius * 0.65);
        const ly = stormCenterPoint.y + Math.cos(i * 3.1 + (Date.now() / 400)) * (baseRadius * 0.55);

        // Flash Shockwave
        const ring = 6 + ((Date.now() / 150 + i * 5) % 15);
        ctx.strokeStyle = `rgba(250, 204, 21, ${Math.max(0, 1 - ring / 20)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(lx, ly, ring, 0, Math.PI * 2);
        ctx.stroke();

        // Flash Core Pin
        ctx.fillStyle = '#FEF08A';
        ctx.shadowColor = '#FACC15';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 7. Event Track & Hazard Ellipse
    if (layers.eventTrack) {
      ctx.save();
      // Dashed Hazard Perimeter
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(stormCenterPoint.x, stormCenterPoint.y, baseRadius * 0.7, 0, Math.PI * 2);
      ctx.stroke();

      // Trajectory Arrow pointing NE
      const arrowTargetX = stormCenterPoint.x + baseRadius * 0.8;
      const arrowTargetY = stormCenterPoint.y - baseRadius * 0.7;

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
      ctx.arc(arrowTargetX, arrowTargetY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Event A1027 Badge anchored at Storm Center
      ctx.fillStyle = '#DC2626';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 6;
      const bW = 85;
      const bH = 20;
      const bX = stormCenterPoint.x + 10;
      const bY = stormCenterPoint.y - 10;
      ctx.beginPath();
      ctx.roundRect(bX, bY, bW, bH, 5);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Cell A1027', bX + bW / 2, bY + bH / 2);
      ctx.restore();
    }
  }, [layers, activeTab, selectedOffsetHours]);

  // Ref to always hold fresh drawSimulation
  const drawRef = useRef(drawSimulation);
  useEffect(() => {
    drawRef.current = drawSimulation;
  }, [drawSimulation]);

  // Handle Fullscreen Toggle & Invalidate Map Size
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const t1 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ animate: false });
        drawRef.current?.();
      }
    }, 50);
    const t2 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ animate: false });
        drawRef.current?.();
      }
    }, 250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isFullscreen]);

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
      const tileUrl = getTileUrlForTab(activeTab);
      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 18,
        subdomains: ['a', 'b', 'c', 'd'],
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Markers Layer
      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;

      renderLandmarks(L, markersGroup, layers.cityLabels);

      // Throttled Mouse Hover Inspector Tracker (prevents canvas flickering and blur)
      map.on('mousemove', (e: any) => {
        if (hoverThrottleRef.current) return;
        hoverThrottleRef.current = requestAnimationFrame(() => {
          hoverThrottleRef.current = null;
          if (!mapInstanceRef.current) return;

          const { lat, lng } = e.latlng;
          const containerPt = mapInstanceRef.current.latLngToContainerPoint(e.latlng);

          // Find nearest landmark to provide contextual live data
          let nearest = MAP_LANDMARKS[0];
          let minDist = Infinity;
          MAP_LANDMARKS.forEach((lm) => {
            const d = Math.hypot(lm.coords[0] - lat, lm.coords[1] - lng);
            if (d < minDist) {
              minDist = d;
              nearest = lm;
            }
          });

          setHoveredInfo({
            x: containerPt.x,
            y: containerPt.y,
            lat,
            lng,
            name: minDist < 0.08 ? nearest.name : `Corridor (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`,
            rainfall: minDist < 0.08 ? nearest.rainfall : '18.5 mm/hr',
            radarDbz: minDist < 0.08 ? nearest.dbz : '24.0 dBZ',
            cloudTemp: minDist < 0.08 ? nearest.temp : '-35.0 °C',
            lightning: minDist < 0.08 ? nearest.lightning : '1 strike',
            wind: minDist < 0.08 ? nearest.wind : 'NE 15 km/h',
            riskStatus: minDist < 0.08 ? nearest.risk : 'Low Risk',
            riskColor: minDist < 0.08 ? nearest.riskColor : '#22C55E'
          });
        });
      });

      map.on('mouseout', () => {
        setHoveredInfo(null);
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
      const hoverThrottle = hoverThrottleRef.current;
      if (hoverThrottle) {
        cancelAnimationFrame(hoverThrottle);
      }
    };
  }, []);

  // 2. Re-render landmarks when cityLabels layer changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    import('leaflet').then((L) => {
      renderLandmarks(L, markersGroupRef.current, layers.cityLabels);
    });
  }, [layers.cityLabels, renderLandmarks]);

  // 3. Switch Tile Layer dynamically on Tab change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      if (!mapInstanceRef.current) return;

      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      const newTileUrl = getTileUrlForTab(activeTab);
      const newTileLayer = L.tileLayer(newTileUrl, {
        maxZoom: 18,
        subdomains: ['a', 'b', 'c', 'd'],
      }).addTo(mapInstanceRef.current);

      tileLayerRef.current = newTileLayer;
      drawSimulation();
    });
  }, [activeTab, drawSimulation]);

  // 4. Animation loop for radar sweep and wind particles
  useEffect(() => {
    let frameId: number;
    const loop = () => {
      if (activeTab === 'Radar Reflectivity' || activeTab === 'Lightning' || activeTab === 'Wind & Moisture' || layers.windImdaa || layers.lightningIldn) {
        drawSimulation();
      }
      frameId = requestAnimationFrame(loop);
    };

    if (activeTab === 'Radar Reflectivity' || activeTab === 'Lightning' || activeTab === 'Wind & Moisture' || layers.windImdaa || layers.lightningIldn) {
      frameId = requestAnimationFrame(loop);
    } else {
      drawSimulation();
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [activeTab, layers.windImdaa, layers.lightningIldn, drawSimulation]);

  // Region switcher
  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setShowRegionDropdown(false);
    if (mapInstanceRef.current && REGIONS[region]) {
      const { center, zoom } = REGIONS[region];
      mapInstanceRef.current.flyTo(center, zoom, { duration: 1.2 });
    }
  };

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const tabs: { label: TabType; icon: React.ReactNode }[] = [
    { label: 'Composite View', icon: <Layers className="w-3.5 h-3.5" /> },
    { label: 'Satellite (INSAT)', icon: <Satellite className="w-3.5 h-3.5" /> },
    { label: 'Radar Reflectivity', icon: <Radio className="w-3.5 h-3.5" /> },
    { label: 'Cloud Top Temp', icon: <Thermometer className="w-3.5 h-3.5" /> },
    { label: 'Lightning', icon: <Zap className="w-3.5 h-3.5" /> },
    { label: 'Wind & Moisture', icon: <Wind className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className={`space-y-2 font-sans select-none ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-4 flex flex-col w-screen h-screen' : ''}`}>
      
      {/* 1. Map Tab Bar: Responsive, No Overlap */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.label;
          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0284C7] text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/90 shadow-2xs'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Full-Height Map Container */}
      <div className={`relative w-full ${isFullscreen ? 'flex-1 h-full min-h-0' : 'h-[600px] lg:h-[660px] min-h-[580px]'} bg-slate-950 rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs`}>
        
        {/* Real Leaflet Map */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />

        {/* Real-time Weather Layer Simulation Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-10"
        />

        {/* TOP RIGHT CONTROLS: Map Layers Popover + Region Dropdown + Fullscreen */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
          
          {/* Map Layers Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLayersDropdown(!showLayersDropdown);
                setShowRegionDropdown(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md backdrop-blur-md border transition-all cursor-pointer ${
                showLayersDropdown
                  ? 'bg-[#0B2F56] text-white border-[#0B2F56]'
                  : 'bg-white/95 hover:bg-white text-[#0B2F56] border-slate-200'
              }`}
              title="Toggle Map Layers"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLayersDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Clean Dropdown Popover */}
            {showLayersDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-40 text-xs font-medium animate-in fade-in-50 zoom-in-95">
                <div className="text-[11px] font-bold text-[#0B2F56] uppercase tracking-wider mb-2.5 flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span>Map Layers</span>
                  <span className="text-[9px] text-slate-400 font-mono">TOGGLE</span>
                </div>

                <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                  {[
                    { key: 'adminBoundary', label: 'Administrative Boundary' },
                    { key: 'radarReflectivity', label: 'Radar Reflectivity' },
                    { key: 'satelliteInsat', label: 'Satellite (INSAT)' },
                    { key: 'cloudTopTemp', label: 'Cloud Top Temperature' },
                    { key: 'lightningIldn', label: 'Lightning (ILDN)' },
                    { key: 'windImdaa', label: 'Wind (IMDAA)' },
                    { key: 'moistureMidaa', label: 'Moisture (MIDAA)' },
                    { key: 'eventTrack', label: 'Event Track' },
                    { key: 'cityLabels', label: 'City Labels' },
                  ].map((item) => {
                    const isChecked = layers[item.key as keyof LayerState];
                    return (
                      <label
                        key={item.key}
                        onClick={() => toggleLayer(item.key as keyof LayerState)}
                        className="flex items-center justify-between p-1 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-[#0B2F56] cursor-pointer text-[11px]"
                      >
                        <span className={isChecked ? 'font-bold text-[#0B2F56]' : 'text-slate-600'}>
                          {item.label}
                        </span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          isChecked 
                            ? 'bg-[#0284C7] border-[#0284C7] text-white' 
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Region Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRegionDropdown(!showRegionDropdown);
                setShowLayersDropdown(false);
              }}
              className="bg-white/95 hover:bg-white text-[#0B2F56] font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-md backdrop-blur-md flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>{selectedRegion}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showRegionDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showRegionDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-40 text-xs font-semibold animate-in fade-in-50 zoom-in-95">
                {Object.keys(REGIONS).map((reg) => (
                  <button
                    key={reg}
                    onClick={() => handleRegionSelect(reg)}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 cursor-pointer ${
                      selectedRegion === reg ? 'text-[#0284C7] bg-blue-50/50 font-bold' : 'text-slate-700'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen Expansion Button */}
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200 flex items-center justify-center cursor-pointer transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* LEFT FLOATING CONTROLS: Zoom, Recenter */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-30">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center cursor-pointer active:scale-95"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center cursor-pointer active:scale-95"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleRecenter}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center cursor-pointer active:scale-95"
            title="Recenter Map"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* HOVER INSPECTOR FLOATING TOOLTIP HUD (WHITE BACKGROUND) */}
        {hoveredInfo && (
          <div 
            className="absolute pointer-events-none z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-2xl text-[#0B2F56] font-sans min-w-[230px] animate-in fade-in zoom-in-95 duration-75 transition-all"
            style={{
              left: Math.max(12, Math.min(window.innerWidth - 260, hoveredInfo.x + 14)),
              top: Math.max(12, Math.min(window.innerHeight - 200, hoveredInfo.y - 70)),
            }}
          >
            {/* Header: Location & Risk Badge */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                <span className="font-black text-xs text-[#0B2F56] truncate">
                  {hoveredInfo.name}
                </span>
              </div>
              <span 
                className="text-[9px] font-black px-2 py-0.5 rounded-full shadow-2xs shrink-0 whitespace-nowrap"
                style={{ 
                  backgroundColor: `${hoveredInfo.riskColor}15`, 
                  color: hoveredInfo.riskColor, 
                  border: `1px solid ${hoveredInfo.riskColor}40` 
                }}
              >
                {hoveredInfo.riskStatus}
              </span>
            </div>

            {/* Live Telemetry 4-Metric Grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px]">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-1.5">
                <span className="text-slate-400 text-[9px] block font-medium">Rainfall Rate</span>
                <span className="font-black text-[#0284C7] text-xs font-mono">{hoveredInfo.rainfall}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-1.5">
                <span className="text-slate-400 text-[9px] block font-medium">Radar (dBZ)</span>
                <span className="font-black text-[#DC2626] text-xs font-mono">{hoveredInfo.radarDbz}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-1.5">
                <span className="text-slate-400 text-[9px] block font-medium">Cloud Temp</span>
                <span className="font-black text-purple-700 text-xs font-mono">{hoveredInfo.cloudTemp}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-1.5">
                <span className="text-slate-400 text-[9px] block font-medium">Lightning</span>
                <span className="font-black text-amber-600 text-xs font-mono">{hoveredInfo.lightning}</span>
              </div>
            </div>

            {/* Footer: Wind & Live Status */}
            <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-slate-400" />
                <span>{hoveredInfo.wind}</span>
              </span>
              <span className="text-[#0284C7] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE</span>
              </span>
            </div>
          </div>
        )}

        {/* BOTTOM LEFT: Dynamic Legend HUD */}
        <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-2.5 z-30 text-white min-w-[210px] shadow-lg">
          {activeTab === 'Radar Reflectivity' || activeTab === 'Composite View' ? (
            <>
              <div className="text-[10px] font-bold text-slate-200 mb-1.5">
                Radar Reflectivity (dBZ)
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#0284c7] via-[#22c55e] via-[#eab308] via-[#f97316] via-[#ef4444] via-[#ec4899] to-[#a855f7]" />
              <div className="flex justify-between text-[9px] font-mono text-slate-300 mt-1">
                <span>0</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
                <span>50</span>
                <span>60+</span>
              </div>
            </>
          ) : activeTab === 'Satellite (INSAT)' || activeTab === 'Cloud Top Temp' ? (
            <>
              <div className="text-[10px] font-bold text-slate-200 mb-1.5">
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
          ) : activeTab === 'Lightning' ? (
            <>
              <div className="text-[10px] font-bold text-slate-200 mb-1.5">
                Lightning Strike Activity
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
          ) : (
            <>
              <div className="text-[10px] font-bold text-slate-200 mb-1.5">
                Wind Velocity &amp; Moisture (m/s)
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#A5F3FC] via-[#38BDF8] via-[#0284C7] to-[#1E3A8A]" />
              <div className="flex justify-between text-[9px] font-mono text-slate-300 mt-1">
                <span>0</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
                <span>30+</span>
              </div>
            </>
          )}
        </div>

        {/* BOTTOM RIGHT: Map Scale Bar */}
        <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md border border-white/20 rounded-lg px-2.5 py-1 z-30 text-white flex items-center gap-1.5 font-mono text-[10px]">
          <div className="flex items-center gap-1">
            <span className="text-[9px]">0</span>
            <div className="w-12 h-1 bg-white rounded-full flex justify-between px-0.5">
              <span className="w-0.5 h-1.5 -mt-0.5 bg-white" />
              <span className="w-0.5 h-1.5 -mt-0.5 bg-white" />
              <span className="w-0.5 h-1.5 -mt-0.5 bg-white" />
            </div>
            <span className="text-[9px]">20 km</span>
          </div>
        </div>

      </div>
    </div>
  );
};
