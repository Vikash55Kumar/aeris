export const MUMBAI_MAP_CENTER = {
  lat: 19.076,
  lon: 72.8777,
};

export const MUMBAI_BOUNDS = {
  north: 19.35,
  south: 18.85,
  east: 73.15,
  west: 72.7,
};

export const MAP_LANDMARKS = [
  { id: 'borivali', name: 'Borivali', top: '20%', left: '36%', status: 'Normal' },
  { id: 'andheri', name: 'Andheri', top: '38%', left: '35%', status: 'Moderate' },
  { id: 'bkc', name: 'BKC', top: '44%', left: '41%', status: 'High' },
  { id: 'thane', name: 'Thane', top: '28%', left: '50%', status: 'High', isAccent: true },
  { id: 'kurla', name: 'Kurla', top: '45%', left: '45%', status: 'Critical', isCore: true },
  { id: 'navi-mumbai', name: 'Navi Mumbai', top: '52%', left: '51%', status: 'Moderate' },
  { id: 'dadar', name: 'Dadar', top: '63%', left: '35%', status: 'High' },
  { id: 'colaba', name: 'Colaba', top: '80%', left: '32%', status: 'Normal' },
] as const;
