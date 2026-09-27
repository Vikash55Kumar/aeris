export class RadarAdapter {
  static async fetchReflectivityGrid() {
    return {
      station: 'Mumbai Colaba S-Band',
      frequencyGhz: 2.8,
      maxDbz: 58.5,
      precipitationCoreKm2: 45,
      timestamp: new Date().toISOString(),
    };
  }
}
