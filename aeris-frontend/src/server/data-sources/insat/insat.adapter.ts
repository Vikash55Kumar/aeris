export class InsatAdapter {
  static async fetchCloudTopTemp() {
    return {
      satellite: 'INSAT-3DR',
      channel: 'TIR1 (10.8um)',
      minCttCelsius: -72.4,
      deepeningRatePerHour: -8.2,
      timestamp: new Date().toISOString(),
    };
  }
}
