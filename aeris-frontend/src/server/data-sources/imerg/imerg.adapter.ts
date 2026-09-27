export class ImergAdapter {
  static async fetchGpmPrecipitation() {
    return {
      product: 'GPM-IMERG Early Run',
      accumulatedRain3hMm: 45.0,
    };
  }
}
