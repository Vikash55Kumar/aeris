import { 
  LocationItem, 
  CorridorPreset, 
  JourneyRoute, 
  RouteSegment, 
  TravelMode, 
  RouteStrategy, 
  RiskLevel, 
  DepartureOption 
} from '../types';

// Complete Registry of Mumbai Metropolitan Area Locations with Actual GPS Coordinates
export const MUMBAI_LOCATIONS: LocationItem[] = [
  { id: 'thane', name: 'Thane', subname: 'Thane City • Eastern Corridor', coords: [19.2183, 72.9781], type: 'city' },
  { id: 'borivali', name: 'Borivali', subname: 'Borivali (Borawali) • Western Suburbs', coords: [19.2307, 72.8567], type: 'suburb' },
  { id: 'airport', name: 'Mumbai Airport (BOM)', subname: 'Chhatrapati Shivaji Maharaj Intl (CSMIA)', coords: [19.0896, 72.8656], type: 'airport' },
  { id: 'bkc', name: 'BKC', subname: 'Bandra Kurla Complex • Financial Hub', coords: [19.0607, 72.8683], type: 'business' },
  { id: 'andheri', name: 'Andheri', subname: 'Andheri East/West • WEH Link', coords: [19.1136, 72.8697], type: 'suburb' },
  { id: 'kurla', name: 'Kurla', subname: 'Kurla West • Mithi River Basin', coords: [19.0728, 72.8797], type: 'suburb' },
  { id: 'ghatkopar', name: 'Ghatkopar', subname: 'Ghatkopar • Eastern Express Corridor', coords: [19.0860, 72.9080], type: 'suburb' },
  { id: 'mulund', name: 'Mulund', subname: 'Mulund Check Naka • Toll Corridor', coords: [19.1726, 72.9565], type: 'suburb' },
  { id: 'dadar', name: 'Dadar', subname: 'Dadar TT Circle • Central Mumbai', coords: [19.0178, 72.8478], type: 'transit' },
  { id: 'colaba', name: 'Colaba', subname: 'South Mumbai • Heritage District', coords: [18.9067, 72.8147], type: 'city' },
  { id: 'navi-mumbai', name: 'Navi Mumbai (Vashi)', subname: 'Vashi Creek • Trans-Harbour Corridor', coords: [19.0771, 72.9986], type: 'city' },
  { id: 'powai', name: 'Powai', subname: 'Powai Lake • Hiranandani Corridor', coords: [19.1197, 72.9051], type: 'suburb' },
  { id: 'bandra', name: 'Bandra', subname: 'Bandra West • Sea Link Connector', coords: [19.0596, 72.8295], type: 'suburb' },
  { id: 'goregaon', name: 'Goregaon', subname: 'Goregaon Hub • Western Express', coords: [19.1663, 72.8526], type: 'suburb' },
  { id: 'kandivali', name: 'Kandivali', subname: 'Kandivali East/West • Link Road', coords: [19.2045, 72.8522], type: 'suburb' },
  { id: 'malad', name: 'Malad', subname: 'Malad Mindspace • Western Suburbs', coords: [19.1874, 72.8484], type: 'suburb' },
  { id: 'chembur', name: 'Chembur', subname: 'Chembur Naka • SCLR Connector', coords: [19.0522, 72.8994], type: 'suburb' },
  { id: 'sion', name: 'Sion', subname: 'Sion Circle • Central Transit Hub', coords: [19.0390, 72.8619], type: 'transit' },
];

// Helper: Normalize location name and find item
export const findLocationByName = (name: string): LocationItem => {
  const query = name.toLowerCase().trim();
  if (query.includes('bora') || query.includes('bori')) {
    return MUMBAI_LOCATIONS.find(l => l.id === 'borivali')!;
  }
  const match = MUMBAI_LOCATIONS.find(l => 
    l.name.toLowerCase().includes(query) || 
    query.includes(l.name.toLowerCase()) ||
    l.id.toLowerCase().includes(query)
  );
  return match || MUMBAI_LOCATIONS[0];
};

// Helper: Format Date into HH:mm
export const formatHHMM = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Helper: Get offset time formatted from base Date
export const getOffsetHHMM = (baseDate: Date, offsetMinutes: number): string => {
  const target = new Date(baseDate.getTime() + offsetMinutes * 60 * 1000);
  return formatHHMM(target);
};

// Helper: Add minutes to time string (HH:MM or dynamic)
export const addMinutesToTime = (baseTime: string, addedMinutes: number): string => {
  let [hours, mins] = baseTime.includes(':') 
    ? baseTime.split(':').map(Number) 
    : [new Date().getHours(), new Date().getMinutes()];
  
  if (isNaN(hours)) hours = new Date().getHours();
  if (isNaN(mins)) mins = new Date().getMinutes();

  const totalMins = hours * 60 + mins + addedMinutes;
  const newHours = Math.floor((totalMins / 60) % 24);
  const newMins = Math.floor(totalMins % 60);

  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
};

// Calculate Euclidean approximate road distance (km)
export const calculateDistanceKm = (c1: [number, number], c2: [number, number]): number => {
  const dLat = (c2[0] - c1[0]) * 111;
  const dLng = (c2[1] - c1[1]) * 105;
  const direct = Math.sqrt(dLat * dLat + dLng * dLng);
  return Math.max(4, Math.round(direct * 1.32));
};

// Weather Risk Matrix based on Departure Time and Geographic Location
const getSegmentWeatherForCoords = (
  coords: [number, number],
  segmentName: string, 
  departureTime: string, 
  mode: TravelMode
): {
  weather: string;
  icon: 'light' | 'moderate' | 'heavy' | 'thunder';
  rain: string;
  flood: string;
  risk: RiskLevel;
  nodeColor: string;
  alert?: string | null;
} => {
  let [h, m] = departureTime.includes(':') ? departureTime.split(':').map(Number) : [new Date().getHours(), new Date().getMinutes()];
  if (isNaN(h)) h = new Date().getHours();
  if (isNaN(m)) m = new Date().getMinutes();

  const isNearStormCore = (coords[0] >= 19.05 && coords[0] <= 19.10) && (coords[1] >= 72.85 && coords[1] <= 72.92);
  const isGhodbunderHills = (coords[0] >= 19.22 && coords[1] >= 72.88 && coords[1] <= 72.98);

  if (isNearStormCore) {
    return {
      weather: 'Moderate rain',
      icon: 'moderate',
      rain: '24 mm/hr',
      flood: 'Receding (< 5 cm)',
      risk: 'Low',
      nodeColor: 'bg-emerald-500',
      alert: null,
    };
  }

  if (isGhodbunderHills) {
    return {
      weather: 'Light rain',
      icon: 'light',
      rain: '12 mm/hr',
      flood: 'Clear',
      risk: 'Low',
      nodeColor: 'bg-emerald-500',
      alert: null,
    };
  }

  return {
    weather: 'Light rain',
    icon: 'light',
    rain: '8 mm/hr',
    flood: 'Clear',
    risk: 'Low',
    nodeColor: 'bg-emerald-500',
    alert: null,
  };
};

// Dynamic Route Generator for ANY Origin and Destination
export const getRoutesForLocationPair = (
  fromName: string, 
  toName: string, 
  departureTime: string = formatHHMM(new Date()),
  mode: TravelMode = 'car'
): Record<RouteStrategy, JourneyRoute> => {
  const origin = findLocationByName(fromName);
  const dest = findLocationByName(toName);

  const isThaneBorivali = (origin.id === 'thane' && dest.id === 'borivali') || (origin.id === 'borivali' && dest.id === 'thane');
  const isAirportThane = (origin.id === 'airport' && dest.id === 'thane') || (origin.id === 'thane' && dest.id === 'airport');

  // Case 1: Thane <-> Borivali (As shown in user's image media_1790538698962.png)
  if (isThaneBorivali) {
    const isThaneToBorivali = origin.id === 'thane';

    const balancedCoords: Array<[number, number]> = isThaneToBorivali ? [
      [19.2183, 72.9781], // Thane Teen Hath Naka
      [19.2350, 72.9650], // Manpada Flyover
      [19.2600, 72.9350], // Ghodbunder Road / Gaimukh
      [19.2680, 72.8950], // Chenna Creek Link
      [19.2550, 72.8650], // Dahisar Check Naka
      [19.2307, 72.8567], // Borivali West / SV Road
    ] : [
      [19.2307, 72.8567],
      [19.2550, 72.8650],
      [19.2680, 72.8950],
      [19.2600, 72.9350],
      [19.2350, 72.9650],
      [19.2183, 72.9781],
    ];

    const fastestCoords: Array<[number, number]> = isThaneToBorivali ? [
      [19.2183, 72.9781],
      [19.1726, 72.9565],
      [19.1450, 72.9150],
      [19.1663, 72.8526],
      [19.2045, 72.8522],
      [19.2307, 72.8567],
    ] : [
      [19.2307, 72.8567],
      [19.2045, 72.8522],
      [19.1663, 72.8526],
      [19.1450, 72.9150],
      [19.1726, 72.9565],
      [19.2183, 72.9781],
    ];

    const saferCoords: Array<[number, number]> = isThaneToBorivali ? [
      [19.2183, 72.9781],
      [19.2450, 72.9600],
      [19.2750, 72.9200],
      [19.2650, 72.8750],
      [19.2307, 72.8567],
    ] : [
      [19.2307, 72.8567],
      [19.2650, 72.8750],
      [19.2750, 72.9200],
      [19.2450, 72.9600],
      [19.2183, 72.9781],
    ];

    return {
      balanced: {
        id: 'balanced',
        name: 'Recommended Route (via Ghodbunder Road)',
        shortLabel: 'Recommended Route',
        tradeoffTag: 'BALANCED',
        distance: '24 km',
        duration: '38 min',
        risk: 'Low',
        description: 'Direct transit through Ghodbunder 4-lane expressway with smooth traffic flow.',
        coords: balancedCoords,
        getSegments: (depTime: string, tMode: TravelMode): RouteSegment[] => {
          let curMin = 0;
          const raw = isThaneToBorivali ? [
            { from: 'Thane Teen Hath Naka', to: 'Manpada Flyover', dist: '5 km', distKm: 5, dur: 8, coords: [19.2350, 72.9650] as [number, number] },
            { from: 'Manpada Flyover', to: 'Gaimukh (Ghodbunder)', dist: '7 km', distKm: 7, dur: 11, coords: [19.2600, 72.9350] as [number, number] },
            { from: 'Gaimukh Ghat', to: 'Dahisar Check Naka', dist: '7 km', distKm: 7, dur: 11, coords: [19.2550, 72.8650] as [number, number] },
            { from: 'Dahisar Check Naka', to: 'Borivali West / Station', dist: '5 km', distKm: 5, dur: 8, coords: [19.2307, 72.8567] as [number, number] },
          ] : [
            { from: 'Borivali West / Station', to: 'Dahisar Check Naka', dist: '5 km', distKm: 5, dur: 8, coords: [19.2550, 72.8650] as [number, number] },
            { from: 'Dahisar Check Naka', to: 'Gaimukh Ghat', dist: '7 km', distKm: 7, dur: 11, coords: [19.2600, 72.9350] as [number, number] },
            { from: 'Gaimukh', to: 'Manpada Flyover', dist: '7 km', distKm: 7, dur: 11, coords: [19.2350, 72.9650] as [number, number] },
            { from: 'Manpada Flyover', to: 'Thane Teen Hath Naka', dist: '5 km', distKm: 5, dur: 8, coords: [19.2183, 72.9781] as [number, number] },
          ];

          return raw.map((item, idx) => {
            const start = addMinutesToTime(depTime, curMin);
            curMin += item.dur;
            const end = addMinutesToTime(depTime, curMin);
            const wx = getSegmentWeatherForCoords(item.coords, `${item.from} -> ${item.to}`, depTime, tMode);

            return {
              id: `bal-tb-${idx + 1}`,
              from: item.from,
              to: item.to,
              distance: item.dist,
              distanceKm: item.distKm,
              durationMin: item.dur,
              timeWindow: `${start} – ${end}`,
              weatherCondition: wx.weather,
              weatherIcon: wx.icon,
              rainfallRate: wx.rain,
              floodDepth: wx.flood,
              risk: wx.risk,
              nodeColor: wx.nodeColor,
              alert: wx.alert,
            };
          });
        },
      },

      fastest: {
        id: 'fastest',
        name: 'Alternative Route 1 (via JVLR & Western Express)',
        shortLabel: 'Alternative Route 1',
        tradeoffTag: 'FASTEST',
        distance: '28 km',
        duration: '32 min',
        risk: 'Moderate',
        description: 'Express highway route (-6 min) with arterial road connectivity.',
        coords: fastestCoords,
        getSegments: (depTime: string, tMode: TravelMode): RouteSegment[] => {
          let curMin = 0;
          const raw = [
            { from: origin.name, to: 'Mulund Link', dist: '7 km', distKm: 7, dur: 8, coords: [19.1726, 72.9565] as [number, number] },
            { from: 'Mulund Link', to: 'JVLR Expressway', dist: '7 km', distKm: 7, dur: 8, coords: [19.1450, 72.9150] as [number, number] },
            { from: 'JVLR Link', to: 'Goregaon WEH Flyover', dist: '7 km', distKm: 7, dur: 8, coords: [19.1663, 72.8526] as [number, number] },
            { from: 'Goregaon WEH', to: dest.name, dist: '7 km', distKm: 7, dur: 8, coords: dest.coords },
          ];

          return raw.map((item, idx) => {
            const start = addMinutesToTime(depTime, curMin);
            curMin += item.dur;
            const end = addMinutesToTime(depTime, curMin);
            const wx = getSegmentWeatherForCoords(item.coords, `${item.from} -> ${item.to}`, depTime, tMode);

            return {
              id: `fast-tb-${idx + 1}`,
              from: item.from,
              to: item.to,
              distance: item.dist,
              distanceKm: item.distKm,
              durationMin: item.dur,
              timeWindow: `${start} – ${end}`,
              weatherCondition: wx.weather,
              weatherIcon: wx.icon,
              rainfallRate: wx.rain,
              floodDepth: wx.flood,
              risk: wx.risk,
              nodeColor: wx.nodeColor,
              alert: wx.alert,
            };
          });
        },
      },

      safer: {
        id: 'safer',
        name: 'Alternative Route 2 (via North Ghodbunder & Mira Road)',
        shortLabel: 'Alternative Route 2',
        tradeoffTag: 'WEATHER-SAFER',
        distance: '27 km',
        duration: '42 min',
        risk: 'Low',
        description: 'Elevated bypass completely avoiding all suburban flood pockets.',
        coords: saferCoords,
        getSegments: (depTime: string, tMode: TravelMode): RouteSegment[] => {
          let curMin = 0;
          const raw = [
            { from: origin.name, to: 'Ovala Flyover', dist: '6 km', distKm: 6, dur: 9, coords: [19.2450, 72.9600] as [number, number] },
            { from: 'Ovala Flyover', to: 'Kashimira Junction', dist: '8 km', distKm: 8, dur: 13, coords: [19.2750, 72.9200] as [number, number] },
            { from: 'Kashimira', to: 'Dahisar West', dist: '7 km', distKm: 7, dur: 11, coords: [19.2650, 72.8750] as [number, number] },
            { from: 'Dahisar West', to: dest.name, dist: '6 km', distKm: 6, dur: 9, coords: dest.coords },
          ];

          return raw.map((item, idx) => {
            const start = addMinutesToTime(depTime, curMin);
            curMin += item.dur;
            const end = addMinutesToTime(depTime, curMin);
            return {
              id: `safe-tb-${idx + 1}`,
              from: item.from,
              to: item.to,
              distance: item.dist,
              distanceKm: item.distKm,
              durationMin: item.dur,
              timeWindow: `${start} – ${end}`,
              weatherCondition: 'Light rain',
              weatherIcon: 'light',
              rainfallRate: '8 mm/hr',
              floodDepth: 'Dry / No waterlogging',
              risk: 'Low',
              nodeColor: 'bg-emerald-500',
              alert: null,
            };
          });
        },
      },
    };
  }

  // Case 2: Mumbai Airport <-> Thane
  if (isAirportThane) {
    const isAirToThane = origin.id === 'airport';

    const balancedCoords: Array<[number, number]> = isAirToThane ? [
      [19.0896, 72.8656],
      [19.1050, 72.8680],
      [19.1250, 72.8800],
      [19.1450, 72.9150],
      [19.1650, 72.9450],
      [19.1850, 72.9620],
      [19.2050, 72.9720],
      [19.2183, 72.9781],
    ] : [
      [19.2183, 72.9781],
      [19.2050, 72.9720],
      [19.1850, 72.9620],
      [19.1650, 72.9450],
      [19.1450, 72.9150],
      [19.1250, 72.8800],
      [19.1050, 72.8680],
      [19.0896, 72.8656],
    ];

    const fastestCoords: Array<[number, number]> = isAirToThane ? [
      [19.0896, 72.8656],
      [19.0750, 72.8660],
      [19.0607, 72.8683],
      [19.0728, 72.8797],
      [19.0860, 72.9080],
      [19.1300, 72.9300],
      [19.1726, 72.9565],
      [19.2183, 72.9781],
    ] : [
      [19.2183, 72.9781],
      [19.1726, 72.9565],
      [19.1300, 72.9300],
      [19.0860, 72.9080],
      [19.0728, 72.8797],
      [19.0607, 72.8683],
      [19.0750, 72.8660],
      [19.0896, 72.8656],
    ];

    const saferCoords: Array<[number, number]> = isAirToThane ? [
      [19.0896, 72.8656],
      [19.1136, 72.8550],
      [19.1400, 72.8580],
      [19.1650, 72.8750],
      [19.1800, 72.9100],
      [19.1950, 72.9450],
      [19.2183, 72.9781],
    ] : [
      [19.2183, 72.9781],
      [19.1950, 72.9450],
      [19.1800, 72.9100],
      [19.1650, 72.8750],
      [19.1400, 72.8580],
      [19.1136, 72.8550],
      [19.0896, 72.8656],
    ];

    return {
      balanced: {
        id: 'balanced',
        name: 'Recommended Route (via Eastern Express Corridor)',
        shortLabel: 'Recommended Route',
        tradeoffTag: 'BALANCED',
        distance: '32 km',
        duration: '1h 05m',
        risk: 'Low',
        description: 'Smooth arc via Andheri & JVLR link bypassing the low-lying Kurla flood basin.',
        coords: balancedCoords,
        getSegments: (depTime: string, tMode: TravelMode): RouteSegment[] => {
          let curMin = 0;
          const raw = [
            { from: 'Mumbai Airport', to: 'Andheri East', dist: '6 km', distKm: 6, dur: 12, coords: [19.1136, 72.8697] as [number, number] },
            { from: 'Andheri East', to: 'JVLR Link', dist: '7 km', distKm: 7, dur: 14, coords: [19.1300, 72.9100] as [number, number] },
            { from: 'JVLR Link', to: 'Eastern Express Highway', dist: '6 km', distKm: 6, dur: 15, coords: [19.1450, 72.9150] as [number, number] },
            { from: 'Eastern Express', to: 'Ghatkopar North', dist: '6 km', distKm: 6, dur: 12, coords: [19.0860, 72.9080] as [number, number] },
            { from: 'Ghatkopar North', to: 'Mulund Check Naka', dist: '4 km', distKm: 4, dur: 10, coords: [19.1726, 72.9565] as [number, number] },
            { from: 'Mulund Check Naka', to: 'Thane City', dist: '9 km', distKm: 9, dur: 12, coords: [19.2183, 72.9781] as [number, number] },
          ];

          return raw.map((item, idx) => {
            const start = addMinutesToTime(depTime, curMin);
            curMin += item.dur;
            const end = addMinutesToTime(depTime, curMin);
            const wx = getSegmentWeatherForCoords(item.coords, `${item.from} -> ${item.to}`, depTime, tMode);

            return {
              id: `bal-at-${idx + 1}`,
              from: item.from,
              to: item.to,
              distance: item.dist,
              distanceKm: item.distKm,
              durationMin: item.dur,
              timeWindow: `${start} – ${end}`,
              weatherCondition: wx.weather,
              weatherIcon: wx.icon,
              rainfallRate: wx.rain,
              floodDepth: wx.flood,
              risk: wx.risk,
              nodeColor: wx.nodeColor,
              alert: wx.alert,
            };
          });
        },
      },

      fastest: {
        id: 'fastest',
        name: 'Alternative Route 1 (Direct via BKC & Kurla)',
        shortLabel: 'Alternative Route 1',
        tradeoffTag: 'FASTEST',
        distance: '30 km',
        duration: '58 min',
        risk: 'High',
        description: 'Fastest direct corridor (-7 min) through urban highway artery.',
        coords: fastestCoords,
        getSegments: (depTime: string, tMode: TravelMode): RouteSegment[] => {
          let curMin = 0;
          const raw = [
            { from: 'Mumbai Airport', to: 'BKC Connector', dist: '5 km', distKm: 5, dur: 10, coords: [19.0607, 72.8683] as [number, number] },
            { from: 'BKC Connector', to: 'Kurla West (LBS Marg)', dist: '4 km', distKm: 4, dur: 12, coords: [19.0728, 72.8797] as [number, number] },
            { from: 'Kurla West', to: 'Ghatkopar West', dist: '5 km', distKm: 5, dur: 11, coords: [19.0860, 72.9080] as [number, number] },
            { from: 'Ghatkopar West', to: 'Vikhroli Expressway', dist: '5 km', distKm: 5, dur: 9, coords: [19.1100, 72.9300] as [number, number] },
            { from: 'Vikhroli', to: 'Mulund Toll', dist: '5 km', distKm: 5, dur: 8, coords: [19.1726, 72.9565] as [number, number] },
            { from: 'Mulund Toll', to: 'Thane Teen Hath Naka', dist: '6 km', distKm: 6, dur: 8, coords: [19.2183, 72.9781] as [number, number] },
          ];

          return raw.map((item, idx) => {
            const start = addMinutesToTime(depTime, curMin);
            curMin += item.dur;
            const end = addMinutesToTime(depTime, curMin);
            const wx = getSegmentWeatherForCoords(item.coords, `${item.from} -> ${item.to}`, depTime, tMode);

            return {
              id: `fast-at-${idx + 1}`,
              from: item.from,
              to: item.to,
              distance: item.dist,
              distanceKm: item.distKm,
              durationMin: item.dur,
              timeWindow: `${start} – ${end}`,
              weatherCondition: wx.weather,
              weatherIcon: wx.icon,
              rainfallRate: wx.rain,
              floodDepth: wx.flood,
              risk: wx.risk,
              nodeColor: wx.nodeColor,
              alert: wx.alert,
            };
          });
        },
      },

      safer: {
        id: 'safer',
        name: 'Alternative Route 2 (via Western Suburbs & Ghodbunder)',
        shortLabel: 'Alternative Route 2',
        tradeoffTag: 'WEATHER-SAFER',
        distance: '38 km',
        duration: '1h 12m',
        risk: 'Low',
        description: 'Slightly longer (+14 min) but avoids central congestion pockets.',
        coords: saferCoords,
        getSegments: (depTime: string, tMode: TravelMode): RouteSegment[] => {
          let curMin = 0;
          const raw = [
            { from: 'Mumbai Airport', to: 'Western Express Highway', dist: '7 km', distKm: 7, dur: 12, coords: [19.1136, 72.8550] as [number, number] },
            { from: 'WEH', to: 'Goregaon Flyover', dist: '8 km', distKm: 8, dur: 14, coords: [19.1663, 72.8526] as [number, number] },
            { from: 'Goregaon', to: 'Kandivali Link', dist: '7 km', distKm: 7, dur: 12, coords: [19.2045, 72.8522] as [number, number] },
            { from: 'Kandivali', to: 'Ghodbunder Road', dist: '8 km', distKm: 8, dur: 16, coords: [19.2550, 72.8650] as [number, number] },
            { from: 'Ghodbunder Road', to: 'Thane West', dist: '8 km', distKm: 8, dur: 18, coords: [19.2183, 72.9781] as [number, number] },
          ];

          return raw.map((item, idx) => {
            const start = addMinutesToTime(depTime, curMin);
            curMin += item.dur;
            const end = addMinutesToTime(depTime, curMin);

            return {
              id: `safe-at-${idx + 1}`,
              from: item.from,
              to: item.to,
              distance: item.dist,
              distanceKm: item.distKm,
              durationMin: item.dur,
              timeWindow: `${start} – ${end}`,
              weatherCondition: 'Light rain',
              weatherIcon: 'light',
              rainfallRate: '8 mm/hr',
              floodDepth: 'Dry / No waterlogging',
              risk: 'Low',
              nodeColor: 'bg-emerald-500',
              alert: null,
            };
          });
        },
      },
    };
  }

  // Case 3: Generic Pair
  const distKm = calculateDistanceKm(origin.coords, dest.coords);
  const baseMinutes = Math.round((distKm / 35) * 60);

  const mid1Lat = origin.coords[0] + (dest.coords[0] - origin.coords[0]) * 0.33;
  const mid1Lng = origin.coords[1] + (dest.coords[1] - origin.coords[1]) * 0.33;

  const mid2Lat = origin.coords[0] + (dest.coords[0] - origin.coords[0]) * 0.66;
  const mid2Lng = origin.coords[1] + (dest.coords[1] - origin.coords[1]) * 0.66;

  const genCoords: Array<[number, number]> = [
    origin.coords,
    [mid1Lat + 0.005, mid1Lng - 0.005],
    [mid2Lat - 0.005, mid2Lng + 0.005],
    dest.coords,
  ];

  const genFastCoords: Array<[number, number]> = [
    origin.coords,
    [mid1Lat - 0.008, mid1Lng + 0.008],
    [mid2Lat - 0.008, mid2Lng + 0.008],
    dest.coords,
  ];

  const genSafeCoords: Array<[number, number]> = [
    origin.coords,
    [mid1Lat + 0.015, mid1Lng - 0.015],
    [mid2Lat + 0.015, mid2Lng - 0.015],
    dest.coords,
  ];

  return {
    balanced: {
      id: 'balanced',
      name: `Recommended Route (${origin.name} → ${dest.name})`,
      shortLabel: 'Recommended Route',
      tradeoffTag: 'BALANCED',
      distance: `${distKm} km`,
      duration: `${Math.floor(baseMinutes / 60) > 0 ? `${Math.floor(baseMinutes / 60)}h ` : ''}${baseMinutes % 60}m`,
      risk: 'Low',
      description: `Optimized corridor connecting ${origin.name} to ${dest.name} with lowest weather exposure.`,
      coords: genCoords,
      getSegments: (depTime: string, tMode: TravelMode): RouteSegment[] => {
        let curMin = 0;
        const dur1 = Math.round(baseMinutes * 0.35);
        const dur2 = Math.round(baseMinutes * 0.35);
        const dur3 = Math.max(5, baseMinutes - dur1 - dur2);

        const raw = [
          { from: origin.name, to: `Corridor Sector 1`, dist: `${Math.round(distKm * 0.35)} km`, distKm: Math.round(distKm * 0.35), dur: dur1, coords: [mid1Lat, mid1Lng] as [number, number] },
          { from: `Corridor Sector 1`, to: `Corridor Sector 2`, dist: `${Math.round(distKm * 0.35)} km`, distKm: Math.round(distKm * 0.35), dur: dur2, coords: [mid2Lat, mid2Lng] as [number, number] },
          { from: `Corridor Sector 2`, to: dest.name, dist: `${Math.max(2, distKm - Math.round(distKm * 0.7))} km`, distKm: Math.max(2, distKm - Math.round(distKm * 0.7)), dur: dur3, coords: dest.coords },
        ];

        return raw.map((item, idx) => {
          const start = addMinutesToTime(depTime, curMin);
          curMin += item.dur;
          const end = addMinutesToTime(depTime, curMin);
          const wx = getSegmentWeatherForCoords(item.coords, `${item.from} -> ${item.to}`, depTime, tMode);

          return {
            id: `bal-gen-${idx + 1}`,
            from: item.from,
            to: item.to,
            distance: item.dist,
            distanceKm: item.distKm,
            durationMin: item.dur,
            timeWindow: `${start} – ${end}`,
            weatherCondition: wx.weather,
            weatherIcon: wx.icon,
            rainfallRate: wx.rain,
            floodDepth: wx.flood,
            risk: wx.risk,
            nodeColor: wx.nodeColor,
            alert: wx.alert,
          };
        });
      },
    },

    fastest: {
      id: 'fastest',
      name: `Alternative Route 1 (Direct Express)`,
      shortLabel: 'Alternative Route 1',
      tradeoffTag: 'FASTEST',
      distance: `${Math.max(3, distKm - 3)} km`,
      duration: `${Math.max(10, baseMinutes - 7)} min`,
      risk: 'High',
      description: `Fastest direct line through urban arterial corridors.`,
      coords: genFastCoords,
      getSegments: (depTime: string, tMode: TravelMode): RouteSegment[] => {
        let curMin = 0;
        const dur1 = Math.round((baseMinutes - 7) * 0.5);
        const dur2 = Math.max(5, (baseMinutes - 7) - dur1);

        const raw = [
          { from: origin.name, to: `Direct Midpoint`, dist: `${Math.round(distKm * 0.5)} km`, distKm: Math.round(distKm * 0.5), dur: dur1, coords: [mid1Lat, mid1Lng] as [number, number] },
          { from: `Direct Midpoint`, to: dest.name, dist: `${Math.round(distKm * 0.5)} km`, distKm: Math.round(distKm * 0.5), dur: dur2, coords: dest.coords },
        ];

        return raw.map((item, idx) => {
          const start = addMinutesToTime(depTime, curMin);
          curMin += item.dur;
          const end = addMinutesToTime(depTime, curMin);
          const wx = getSegmentWeatherForCoords(item.coords, `${item.from} -> ${item.to}`, depTime, tMode);

          return {
            id: `fast-gen-${idx + 1}`,
            from: item.from,
            to: item.to,
            distance: item.dist,
            distanceKm: item.distKm,
            durationMin: item.dur,
            timeWindow: `${start} – ${end}`,
            weatherCondition: wx.weather,
            weatherIcon: wx.icon,
            rainfallRate: wx.rain,
            floodDepth: wx.flood,
            risk: wx.risk,
            nodeColor: wx.nodeColor,
            alert: wx.alert,
          };
        });
      },
    },

    safer: {
      id: 'safer',
      name: `Alternative Route 2 (Outer Ring Bypass)`,
      shortLabel: 'Alternative Route 2',
      tradeoffTag: 'WEATHER-SAFER',
      distance: `${distKm + 6} km`,
      duration: `${baseMinutes + 12} min`,
      risk: 'Low',
      description: `Perimeter road bypass avoiding city center waterlogging zones.`,
      coords: genSafeCoords,
      getSegments: (depTime: string, tMode: TravelMode): RouteSegment[] => {
        let curMin = 0;
        const dur1 = Math.round((baseMinutes + 12) * 0.5);
        const dur2 = Math.max(5, (baseMinutes + 12) - dur1);

        const raw = [
          { from: origin.name, to: `Outer Ringway`, dist: `${Math.round((distKm + 6) * 0.5)} km`, distKm: Math.round((distKm + 6) * 0.5), dur: dur1, coords: [mid1Lat + 0.01, mid1Lng - 0.01] as [number, number] },
          { from: `Outer Ringway`, to: dest.name, dist: `${Math.round((distKm + 6) * 0.5)} km`, distKm: Math.round((distKm + 6) * 0.5), dur: dur2, coords: dest.coords },
        ];

        return raw.map((item, idx) => {
          const start = addMinutesToTime(depTime, curMin);
          curMin += item.dur;
          const end = addMinutesToTime(depTime, curMin);

          return {
            id: `safe-gen-${idx + 1}`,
            from: item.from,
            to: item.to,
            distance: item.dist,
            distanceKm: item.distKm,
            durationMin: item.dur,
            timeWindow: `${start} – ${end}`,
            weatherCondition: 'Light rain',
            weatherIcon: 'light',
            rainfallRate: '8 mm/hr',
            floodDepth: 'Dry / Clear',
            risk: 'Low',
            nodeColor: 'bg-emerald-500',
            alert: null,
          };
        });
      },
    },
  };
};

// Dynamic Departure Simulation Generator Synchronized with Current Client Time
export const getDynamicDepartureOptions = (
  baseDate: Date, 
  approxDuration: string = '38 min'
): DepartureOption[] => {
  return [
    {
      time: formatHHMM(baseDate),
      journeyTime: approxDuration,
      risk: 'High',
      reason: 'Active rainfall cell & peak traffic congestion',
      score: 38,
      highRiskSegment: 'Initial Sector (0–15m)',
      stormCenterRelative: 'Direct storm impact',
    },
    {
      time: getOffsetHHMM(baseDate, 15),
      journeyTime: approxDuration,
      risk: 'High',
      reason: 'Thunderstorm & surface runoff active',
      score: 46,
      highRiskSegment: 'Midway Corridor (15–30m)',
      stormCenterRelative: 'Peak convective activity',
    },
    {
      time: getOffsetHHMM(baseDate, 30),
      journeyTime: approxDuration,
      risk: 'Moderate',
      reason: 'Rainfall decreasing; localized pooling receding',
      score: 72,
      highRiskSegment: 'Localized spot',
      stormCenterRelative: 'Storm moving northeast',
    },
    {
      time: getOffsetHHMM(baseDate, 45),
      journeyTime: approxDuration,
      risk: 'Low',
      reason: 'Best overall conditions & clear road drainage',
      isRecommended: true,
      score: 95,
      highRiskSegment: 'None detected',
      stormCenterRelative: 'Convective cell cleared',
    },
    {
      time: getOffsetHHMM(baseDate, 75),
      journeyTime: approxDuration,
      risk: 'Low',
      reason: 'Dry corridor conditions & normal flow',
      score: 92,
      highRiskSegment: 'None detected',
      stormCenterRelative: 'Clear conditions',
    },
  ];
};

// Dynamic Timeline Buckets for Gantt Heatmap
export const getDynamicTimelineBuckets = (baseDate: Date): string[] => {
  return [
    formatHHMM(baseDate),
    getOffsetHHMM(baseDate, 20),
    getOffsetHHMM(baseDate, 40),
    getOffsetHHMM(baseDate, 60),
    getOffsetHHMM(baseDate, 80),
  ];
};

// Presets
export const CORRIDOR_PRESETS: CorridorPreset[] = [
  {
    id: 'thane-borivali',
    title: 'Thane ⇄ Borivali (Ghodbunder Corridor)',
    from: 'Thane',
    to: 'Borivali',
    defaultTime: '16:30',
  },
  {
    id: 'mumbai-thane',
    title: 'Mumbai Airport (BOM) ⇄ Thane',
    from: 'Mumbai Airport (BOM)',
    to: 'Thane',
    defaultTime: '16:30',
  },
  {
    id: 'colaba-bkc',
    title: 'Colaba ⇄ BKC (Financial Corridor)',
    from: 'Colaba',
    to: 'BKC',
    defaultTime: '16:15',
  },
  {
    id: 'andheri-vashi',
    title: 'Andheri ⇄ Navi Mumbai (Vashi)',
    from: 'Andheri',
    to: 'Navi Mumbai (Vashi)',
    defaultTime: '16:45',
  },
];
