import { prisma } from '../core/prisma.js';

const IN_MEMORY_PRESETS = [
  {
    id: 'preset-001',
    code: 'thane-borivali',
    title: 'Thane ⇄ Borivali (Ghodbunder Corridor)',
    fromName: 'Thane',
    toName: 'Borivali',
    defaultDepartureOffsetMin: 45,
    waypointsJson: JSON.stringify([
      [19.2183, 72.9781],
      [19.2350, 72.9650],
      [19.2600, 72.9350],
      [19.2680, 72.8950],
      [19.2550, 72.8650],
      [19.2307, 72.8567],
    ]),
    createdAt: new Date(),
  },
  {
    id: 'preset-002',
    code: 'mumbai-thane',
    title: 'Mumbai Airport (BOM) ⇄ Thane',
    fromName: 'Mumbai Airport (BOM)',
    toName: 'Thane',
    defaultDepartureOffsetMin: 30,
    waypointsJson: JSON.stringify([
      [19.0896, 72.8656],
      [19.1136, 72.8697],
      [19.1450, 72.9150],
      [19.1726, 72.9565],
      [19.2183, 72.9781],
    ]),
    createdAt: new Date(),
  },
  {
    id: 'preset-003',
    code: 'bkc-andheri',
    title: 'BKC ⇄ Andheri Link',
    fromName: 'BKC',
    toName: 'Andheri',
    defaultDepartureOffsetMin: 15,
    waypointsJson: JSON.stringify([
      [19.0607, 72.8683],
      [19.0860, 72.8700],
      [19.1136, 72.8697],
    ]),
    createdAt: new Date(),
  },
];

export class JourneyRepository {
  static async getCorridorPresets() {
    try {
      return await prisma.corridorPreset.findMany({
        orderBy: { createdAt: 'asc' },
      });
    } catch (e) {
      return IN_MEMORY_PRESETS;
    }
  }

  static async getCorridorByCode(code: string) {
    try {
      return await prisma.corridorPreset.findUnique({
        where: { code },
      });
    } catch (e) {
      return IN_MEMORY_PRESETS.find((p) => p.code === code) || null;
    }
  }

  static async findCorridorByOriginDest(fromName: string, toName: string) {
    try {
      return await prisma.corridorPreset.findFirst({
        where: {
          OR: [
            { fromName: { contains: fromName, mode: 'insensitive' }, toName: { contains: toName, mode: 'insensitive' } },
            { fromName: { contains: toName, mode: 'insensitive' }, toName: { contains: fromName, mode: 'insensitive' } },
          ],
        },
      });
    } catch (e) {
      return (
        IN_MEMORY_PRESETS.find(
          (p) =>
            (p.fromName.toLowerCase().includes(fromName.toLowerCase()) &&
              p.toName.toLowerCase().includes(toName.toLowerCase())) ||
            (p.fromName.toLowerCase().includes(toName.toLowerCase()) &&
              p.toName.toLowerCase().includes(fromName.toLowerCase()))
        ) || null
      );
    }
  }
}
