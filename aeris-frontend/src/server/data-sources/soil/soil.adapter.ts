export class SoilAdapter {
  static async fetchSoilMoisture() {
    return {
      source: 'NRSC SMAP Hydro-Mesh',
      saturationPct: 88,
      infiltrationRateMmHr: 4.5,
    };
  }
}
