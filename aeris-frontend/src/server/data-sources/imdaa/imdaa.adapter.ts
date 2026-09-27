export class ImdaaAdapter {
  static async fetchMesoscaleForecast() {
    return {
      model: 'IMDAA 4km Regional NWP',
      cycle: '06Z',
      surfaceVorticity: 1.4e-4,
      precipitableWaterMm: 68.2,
    };
  }
}
