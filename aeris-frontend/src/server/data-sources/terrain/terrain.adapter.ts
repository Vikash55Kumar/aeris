export class TerrainAdapter {
  static async fetchDigitalElevationModel() {
    return {
      dem: 'CartoDEM 10m',
      basin: 'Mithi River Catchment (72.88E, 19.07N)',
      slopePct: 3.2,
    };
  }
}
