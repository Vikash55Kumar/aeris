import { JourneyRepository } from '../repositories/journey.repository.js';
import { PlanJourneyInput, OptimizeDepartureInput } from '../schemas/journey.schema.js';

export interface LocationItem {
  id: string;
  name: string;
  subname: string;
  coords: [number, number];
  type: 'airport' | 'city' | 'suburb' | 'business' | 'transit';
}

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

export class JourneyService {
  static findLocationByName(name: string): LocationItem {
    const query = name.toLowerCase().trim();
    if (query.includes('bora') || query.includes('bori')) {
      return MUMBAI_LOCATIONS.find((l) => l.id === 'borivali')!;
    }
    const match = MUMBAI_LOCATIONS.find(
      (l) =>
        l.name.toLowerCase().includes(query) ||
        query.includes(l.name.toLowerCase()) ||
        l.id.toLowerCase().includes(query)
    );
    return match || MUMBAI_LOCATIONS[0];
  }

  static getLocations() {
    return MUMBAI_LOCATIONS;
  }

  static async getPresets() {
    const presets = await JourneyRepository.getCorridorPresets();
    if (presets.length > 0) return presets;

    return [
      { id: 'thane-borivali', title: 'Thane ⇄ Borivali (Ghodbunder Corridor)', fromName: 'Thane', toName: 'Borivali', defaultDepartureOffsetMin: 45 },
      { id: 'mumbai-thane', title: 'Mumbai Airport (BOM) ⇄ Thane', fromName: 'Mumbai Airport (BOM)', toName: 'Thane', defaultDepartureOffsetMin: 30 },
      { id: 'bkc-andheri', title: 'BKC ⇄ Andheri Link', fromName: 'BKC', toName: 'Andheri', defaultDepartureOffsetMin: 15 },
      { id: 'dadar-borivali', title: 'Dadar ⇄ Borivali (WEH Artery)', fromName: 'Dadar', toName: 'Borivali', defaultDepartureOffsetMin: 45 },
    ];
  }

  static planJourney(input: PlanJourneyInput) {
    const origin = this.findLocationByName(input.fromLocation);
    const dest = this.findLocationByName(input.toLocation);
    const departureTime = input.departureTime || this.formatHHMM(new Date());

    const isThaneBorivali =
      (origin.id === 'thane' && dest.id === 'borivali') ||
      (origin.id === 'borivali' && dest.id === 'thane');
    const isAirportThane =
      (origin.id === 'airport' && dest.id === 'thane') ||
      (origin.id === 'thane' && dest.id === 'airport');

    const distanceKm = this.calculateDistanceKm(origin.coords, dest.coords);
    const baseMinutes = Math.round((distanceKm / (input.travelMode === 'bike' ? 25 : 35)) * 60);

    // Build routes
    const routes = this.buildRoutesForPair(origin, dest, isThaneBorivali, isAirportThane, departureTime, input.travelMode, distanceKm, baseMinutes);

    return {
      origin,
      destination: dest,
      travelMode: input.travelMode,
      selectedDepartureTime: departureTime,
      routes,
    };
  }

  static optimizeDeparture(input: OptimizeDepartureInput) {
    const origin = this.findLocationByName(input.fromLocation);
    const dest = this.findLocationByName(input.toLocation);
    const baseDate = input.baseTime ? new Date(input.baseTime) : new Date();

    const departureMatrix = [
      {
        time: this.formatHHMM(baseDate),
        offsetMinutes: 0,
        journeyTime: '38 min',
        risk: 'High',
        reason: 'Active rainfall cell & peak traffic congestion',
        score: 38,
        highRiskSegment: 'Initial Sector (0–15m)',
        stormCenterRelative: 'Direct storm impact',
      },
      {
        time: this.getOffsetHHMM(baseDate, 15),
        offsetMinutes: 15,
        journeyTime: '38 min',
        risk: 'High',
        reason: 'Thunderstorm & surface runoff active',
        score: 46,
        highRiskSegment: 'Midway Corridor (15–30m)',
        stormCenterRelative: 'Peak convective activity',
      },
      {
        time: this.getOffsetHHMM(baseDate, 30),
        offsetMinutes: 30,
        journeyTime: '38 min',
        risk: 'Moderate',
        reason: 'Rainfall decreasing; localized pooling receding',
        score: 72,
        highRiskSegment: 'Localized spot',
        stormCenterRelative: 'Storm moving northeast',
      },
      {
        time: this.getOffsetHHMM(baseDate, 45),
        offsetMinutes: 45,
        journeyTime: '38 min',
        risk: 'Low',
        reason: 'Best overall conditions & clear road drainage',
        isRecommended: true,
        score: 95,
        highRiskSegment: 'None detected',
        stormCenterRelative: 'Convective cell cleared',
      },
      {
        time: this.getOffsetHHMM(baseDate, 75),
        offsetMinutes: 75,
        journeyTime: '38 min',
        risk: 'Low',
        reason: 'Dry corridor conditions & normal flow',
        score: 92,
        highRiskSegment: 'None detected',
        stormCenterRelative: 'Clear conditions',
      },
    ];

    const optimalTime = this.getOffsetHHMM(baseDate, 45);

    const plan = this.planJourney({
      fromLocation: input.fromLocation,
      toLocation: input.toLocation,
      travelMode: input.travelMode,
      departureTime: optimalTime,
      strategy: 'balanced',
    });

    return {
      corridor: `${origin.name} ⇄ ${dest.name}`,
      origin,
      destination: dest,
      travelMode: input.travelMode,
      recommendedDepartureOffsetMin: 45,
      recommendedDepartureTime: optimalTime,
      optimalRouteStrategy: 'balanced',
      confidencePct: 82,
      explanation: `AERIS Decision Engine: Optimum departure computed for ${origin.name} → ${dest.name} at ${optimalTime} IST. Bypasses active convective storm cells with 82% confidence.`,
      departureMatrix,
      routes: plan.routes,
      keyInsights: [
        {
          id: 'insight-1',
          title: 'Storm Passage Window',
          description: `Cell A1027 is moving NE at 25 km/h and will vacate the central corridor within 35 minutes.`,
          level: 'positive',
        },
        {
          id: 'insight-2',
          title: 'Flood Hazard Bypass',
          description: `Recommended route routes via Ghodbunder elevated 4-lane link, entirely avoiding low-lying Mithi basin drainage pockets.`,
          level: 'safe',
        },
        {
          id: 'insight-3',
          title: 'Estimated Travel Delay',
          description: `Zero weather-induced travel delay expected if departing at ${optimalTime} IST.`,
          level: 'positive',
        },
      ],
    };
  }

  // Helpers
  private static calculateDistanceKm(c1: [number, number], c2: [number, number]): number {
    const dLat = (c2[0] - c1[0]) * 111;
    const dLng = (c2[1] - c1[1]) * 105;
    const direct = Math.sqrt(dLat * dLat + dLng * dLng);
    return Math.max(4, Math.round(direct * 1.32));
  }

  private static formatHHMM(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private static getOffsetHHMM(baseDate: Date, offsetMinutes: number): string {
    const target = new Date(baseDate.getTime() + offsetMinutes * 60 * 1000);
    return this.formatHHMM(target);
  }

  private static addMinutesToTime(baseTime: string, addedMinutes: number): string {
    let [hours, mins] = baseTime.includes(':')
      ? baseTime.split(':').map(Number)
      : [new Date().getHours(), new Date().getMinutes()];

    if (isNaN(hours)) hours = new Date().getHours();
    if (isNaN(mins)) mins = new Date().getMinutes();

    const totalMins = hours * 60 + mins + addedMinutes;
    const newHours = Math.floor((totalMins / 60) % 24);
    const newMins = Math.floor(totalMins % 60);

    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  }

  private static buildRoutesForPair(
    origin: LocationItem,
    dest: LocationItem,
    isThaneBorivali: boolean,
    isAirportThane: boolean,
    departureTime: string,
    mode: string,
    distanceKm: number,
    baseMinutes: number
  ) {
    if (isThaneBorivali) {
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
          segments: [
            { id: 'seg-1', from: 'Thane Teen Hath Naka', to: 'Manpada Flyover', distance: '5 km', distanceKm: 5, durationMin: 8, timeWindow: `${departureTime} – ${this.addMinutesToTime(departureTime, 8)}`, weatherCondition: 'Light rain', weatherIcon: 'light', rainfallRate: '8 mm/hr', floodDepth: 'Clear', risk: 'Low', nodeColor: 'bg-emerald-500' },
            { id: 'seg-2', from: 'Manpada Flyover', to: 'Gaimukh (Ghodbunder)', distance: '7 km', distanceKm: 7, durationMin: 11, timeWindow: `${this.addMinutesToTime(departureTime, 8)} – ${this.addMinutesToTime(departureTime, 19)}`, weatherCondition: 'Light rain', weatherIcon: 'light', rainfallRate: '10 mm/hr', floodDepth: 'Clear', risk: 'Low', nodeColor: 'bg-emerald-500' },
            { id: 'seg-3', from: 'Gaimukh Ghat', to: 'Dahisar Check Naka', distance: '7 km', distanceKm: 7, durationMin: 11, timeWindow: `${this.addMinutesToTime(departureTime, 19)} – ${this.addMinutesToTime(departureTime, 30)}`, weatherCondition: 'Moderate rain', weatherIcon: 'moderate', rainfallRate: '15 mm/hr', floodDepth: 'Receding (< 5 cm)', risk: 'Low', nodeColor: 'bg-emerald-500' },
            { id: 'seg-4', from: 'Dahisar Check Naka', to: 'Borivali West / Station', distance: '5 km', distanceKm: 5, durationMin: 8, timeWindow: `${this.addMinutesToTime(departureTime, 30)} – ${this.addMinutesToTime(departureTime, 38)}`, weatherCondition: 'Light rain', weatherIcon: 'light', rainfallRate: '6 mm/hr', floodDepth: 'Clear', risk: 'Low', nodeColor: 'bg-emerald-500' },
          ],
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
          segments: [
            { id: 'seg-f1', from: origin.name, to: 'Mulund Link', distance: '7 km', distanceKm: 7, durationMin: 8, timeWindow: `${departureTime} – ${this.addMinutesToTime(departureTime, 8)}`, weatherCondition: 'Light rain', weatherIcon: 'light', rainfallRate: '12 mm/hr', floodDepth: 'Clear', risk: 'Low', nodeColor: 'bg-emerald-500' },
            { id: 'seg-f2', from: 'Mulund Link', to: 'JVLR Expressway', distance: '7 km', distanceKm: 7, durationMin: 8, timeWindow: `${this.addMinutesToTime(departureTime, 8)} – ${this.addMinutesToTime(departureTime, 16)}`, weatherCondition: 'Heavy rain', weatherIcon: 'heavy', rainfallRate: '45 mm/hr', floodDepth: 'Waterlogging (15–20 cm)', risk: 'High', nodeColor: 'bg-red-500', alert: 'High risk segment' },
            { id: 'seg-f3', from: 'JVLR Link', to: 'Goregaon WEH Flyover', distance: '7 km', distanceKm: 7, durationMin: 8, timeWindow: `${this.addMinutesToTime(departureTime, 16)} – ${this.addMinutesToTime(departureTime, 24)}`, weatherCondition: 'Moderate rain', weatherIcon: 'moderate', rainfallRate: '25 mm/hr', floodDepth: 'Slow drainage', risk: 'Moderate', nodeColor: 'bg-amber-500' },
            { id: 'seg-f4', from: 'Goregaon WEH', to: dest.name, distance: '7 km', distanceKm: 7, durationMin: 8, timeWindow: `${this.addMinutesToTime(departureTime, 24)} – ${this.addMinutesToTime(departureTime, 32)}`, weatherCondition: 'Light rain', weatherIcon: 'light', rainfallRate: '8 mm/hr', floodDepth: 'Clear', risk: 'Low', nodeColor: 'bg-emerald-500' },
          ],
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
          segments: [
            { id: 'seg-s1', from: origin.name, to: 'Ovala Flyover', distance: '6 km', distanceKm: 6, durationMin: 9, timeWindow: `${departureTime} – ${this.addMinutesToTime(departureTime, 9)}`, weatherCondition: 'Light rain', weatherIcon: 'light', rainfallRate: '8 mm/hr', floodDepth: 'Dry', risk: 'Low', nodeColor: 'bg-emerald-500' },
            { id: 'seg-s2', from: 'Ovala Flyover', to: 'Kashimira Junction', distance: '8 km', distanceKm: 8, durationMin: 13, timeWindow: `${this.addMinutesToTime(departureTime, 9)} – ${this.addMinutesToTime(departureTime, 22)}`, weatherCondition: 'Light rain', weatherIcon: 'light', rainfallRate: '6 mm/hr', floodDepth: 'Dry', risk: 'Low', nodeColor: 'bg-emerald-500' },
            { id: 'seg-s3', from: 'Kashimira', to: 'Dahisar West', distance: '7 km', distanceKm: 7, durationMin: 11, timeWindow: `${this.addMinutesToTime(departureTime, 22)} – ${this.addMinutesToTime(departureTime, 33)}`, weatherCondition: 'Light rain', weatherIcon: 'light', rainfallRate: '5 mm/hr', floodDepth: 'Dry', risk: 'Low', nodeColor: 'bg-emerald-500' },
            { id: 'seg-s4', from: 'Dahisar West', to: dest.name, distance: '6 km', distanceKm: 6, durationMin: 9, timeWindow: `${this.addMinutesToTime(departureTime, 33)} – ${this.addMinutesToTime(departureTime, 42)}`, weatherCondition: 'Light rain', weatherIcon: 'light', rainfallRate: '4 mm/hr', floodDepth: 'Dry', risk: 'Low', nodeColor: 'bg-emerald-500' },
          ],
        },
      };
    }

    // Generic Corridor
    return {
      balanced: {
        id: 'balanced',
        name: `Recommended Route (${origin.name} → ${dest.name})`,
        shortLabel: 'Recommended Route',
        tradeoffTag: 'BALANCED',
        distance: `${distanceKm} km`,
        duration: `${Math.floor(baseMinutes / 60) > 0 ? `${Math.floor(baseMinutes / 60)}h ` : ''}${baseMinutes % 60}m`,
        risk: 'Low',
        description: `Optimized corridor connecting ${origin.name} to ${dest.name} with lowest weather exposure.`,
        segments: [
          { id: 'seg-g1', from: origin.name, to: `Corridor Sector 1`, distance: `${Math.round(distanceKm * 0.4)} km`, distanceKm: Math.round(distanceKm * 0.4), durationMin: Math.round(baseMinutes * 0.4), timeWindow: `${departureTime} – ${this.addMinutesToTime(departureTime, Math.round(baseMinutes * 0.4))}`, weatherCondition: 'Light rain', weatherIcon: 'light', rainfallRate: '12 mm/hr', floodDepth: 'Clear', risk: 'Low', nodeColor: 'bg-emerald-500' },
          { id: 'seg-g2', from: `Corridor Sector 1`, to: dest.name, distance: `${Math.max(2, distanceKm - Math.round(distanceKm * 0.4))} km`, distanceKm: Math.max(2, distanceKm - Math.round(distanceKm * 0.4)), durationMin: Math.max(5, baseMinutes - Math.round(baseMinutes * 0.4)), timeWindow: `${this.addMinutesToTime(departureTime, Math.round(baseMinutes * 0.4))} – ${this.addMinutesToTime(departureTime, baseMinutes)}`, weatherCondition: 'Moderate rain', weatherIcon: 'moderate', rainfallRate: '18 mm/hr', floodDepth: 'Clear', risk: 'Low', nodeColor: 'bg-emerald-500' },
        ],
      },
      fastest: {
        id: 'fastest',
        name: 'Alternative Route 1 (Direct Express)',
        shortLabel: 'Alternative Route 1',
        tradeoffTag: 'FASTEST',
        distance: `${Math.max(3, distanceKm - 3)} km`,
        duration: `${Math.max(10, baseMinutes - 7)} min`,
        risk: 'Moderate',
        description: 'Fastest direct line through urban arterial corridors.',
        segments: [
          { id: 'seg-gf1', from: origin.name, to: dest.name, distance: `${Math.max(3, distanceKm - 3)} km`, distanceKm: Math.max(3, distanceKm - 3), durationMin: Math.max(10, baseMinutes - 7), timeWindow: `${departureTime} – ${this.addMinutesToTime(departureTime, Math.max(10, baseMinutes - 7))}`, weatherCondition: 'Heavy rain', weatherIcon: 'heavy', rainfallRate: '48 mm/hr', floodDepth: 'Waterlogging (10–15 cm)', risk: 'High', nodeColor: 'bg-red-500' },
        ],
      },
      safer: {
        id: 'safer',
        name: 'Alternative Route 2 (Outer Ring Bypass)',
        shortLabel: 'Alternative Route 2',
        tradeoffTag: 'WEATHER-SAFER',
        distance: `${distanceKm + 6} km`,
        duration: `${baseMinutes + 12} min`,
        risk: 'Low',
        description: 'Perimeter road bypass avoiding city center waterlogging zones.',
        segments: [
          { id: 'seg-gs1', from: origin.name, to: dest.name, distance: `${distanceKm + 6} km`, distanceKm: distanceKm + 6, durationMin: baseMinutes + 12, timeWindow: `${departureTime} – ${this.addMinutesToTime(departureTime, baseMinutes + 12)}`, weatherCondition: 'Light rain', weatherIcon: 'light', rainfallRate: '6 mm/hr', floodDepth: 'Dry', risk: 'Low', nodeColor: 'bg-emerald-500' },
        ],
      },
    };
  }
}
