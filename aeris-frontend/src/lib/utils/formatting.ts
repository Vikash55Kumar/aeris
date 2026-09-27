export function formatRainfall(mm: number): string {
  return `${Math.round(mm)} mm/h`;
}

export function formatWaterLevel(meters: number): string {
  return `${meters.toFixed(2)} m`;
}

export function formatPercentage(pct: number): string {
  return `${Math.round(pct)}%`;
}
