export class LightningAdapter {
  static async fetchLightningStrikes() {
    return {
      network: 'IITM Pune LLN',
      flashesPerMinute: 42,
      cgRatioPct: 68,
    };
  }
}
