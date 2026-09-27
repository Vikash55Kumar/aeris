import { PrismaClient, Role, SeverityLevel, EventStage, CapStatus, CapMsgType, CapUrgency, CapSeverity, CapCertainty, RiverGaugeStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AERIS Database...');

  // 1. Jurisdictions
  const jurisdictions = await Promise.all([
    prisma.jurisdiction.upsert({
      where: { code: 'mumbai_mmr' },
      update: {},
      create: {
        code: 'mumbai_mmr',
        name: 'Mumbai MMR',
        region: 'Konkan Basin',
        status: 'Red Alert',
        centerLat: 19.0760,
        centerLng: 72.8777,
        zoomLevel: 11,
      },
    }),
    prisma.jurisdiction.upsert({
      where: { code: 'pune_catchment' },
      update: {},
      create: {
        code: 'pune_catchment',
        name: 'Pune Catchment',
        region: 'Western Ghats',
        status: 'Normal',
        centerLat: 18.5204,
        centerLng: 73.8567,
        zoomLevel: 10,
      },
    }),
    prisma.jurisdiction.upsert({
      where: { code: 'coastal_konkan' },
      update: {},
      create: {
        code: 'coastal_konkan',
        name: 'Coastal Konkan',
        region: 'Ratnagiri / Sindhudurg',
        status: 'Watch',
        centerLat: 18.8500,
        centerLng: 73.1000,
        zoomLevel: 9,
      },
    }),
    prisma.jurisdiction.upsert({
      where: { code: 'national' },
      update: {},
      create: {
        code: 'national',
        name: 'National Overview',
        region: 'All India Synoptic',
        status: 'Active',
        centerLat: 20.5937,
        centerLng: 78.9629,
        zoomLevel: 5,
      },
    }),
  ]);

  const mumbaiJurisdiction = jurisdictions[0];

  // 2. Users (Admin + Guest)
  const adminPasswordHash = await bcrypt.hash('Aeris@SDMA2026', 10);
  const guestPasswordHash = await bcrypt.hash('Guest@AerisPublic2026', 10);

  await prisma.user.upsert({
    where: { email: 'sdma.officer@maharashtra.gov.in' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'sdma.officer@maharashtra.gov.in',
      name: 'Maharashtra SDMA',
      subtitle: 'State Disaster Mgmt Authority',
      agencyName: 'State Disaster Management Authority, Government of Maharashtra',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      jurisdictionId: mumbaiJurisdiction.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'guest.observer@aeris.in' },
    update: { passwordHash: guestPasswordHash },
    create: {
      email: 'guest.observer@aeris.in',
      name: 'Guest User',
      subtitle: 'Public Observer Access',
      agencyName: 'AERIS Public Portal',
      passwordHash: guestPasswordHash,
      role: Role.GUEST,
      jurisdictionId: mumbaiJurisdiction.id,
    },
  });

  // 3. Weather Events
  const eventA1027 = await prisma.weatherEvent.upsert({
    where: { code: 'A1027' },
    update: {},
    create: {
      jurisdictionId: mumbaiJurisdiction.id,
      code: 'A1027',
      title: 'Severe Convective System',
      eventType: 'Mesoscale Convective Storm',
      stage: EventStage.INTENSIFICATION,
      severity: SeverityLevel.HIGH,
      confidencePct: 87.0,
      description: 'Intense rainfall and localized cloudburst risk over Eastern & Central Mumbai in next 2–3 hours. Moving NE at 25 km/h.',
      locationName: 'Mithi River Basin Corridor',
      centerLat: 19.0728,
      centerLng: 72.8797,
      trajectoryDir: 'NE',
      trajectorySpeedKmh: 25.0,
      rainMinMm: 80.0,
      rainMaxMm: 120.0,
      peakDurationHours: '2–3',
      status: 'ACTIVE',
      affectedAreas: {
        create: [
          { rank: 1, name: 'Kurla, Kalina, Santa Cruz', severity: SeverityLevel.VERY_HIGH, lat: 19.0728, lng: 72.8797 },
          { rank: 2, name: 'BKC, Bandra East', severity: SeverityLevel.HIGH, lat: 19.0607, lng: 72.8683 },
          { rank: 3, name: 'Chembur, Govandi', severity: SeverityLevel.HIGH, lat: 19.0522, lng: 72.8994 },
          { rank: 4, name: 'Andheri, Jogeshwari', severity: SeverityLevel.MODERATE, lat: 19.1136, lng: 72.8697 },
          { rank: 5, name: 'Eastern Suburbs (Thane border)', severity: SeverityLevel.MODERATE, lat: 19.2183, lng: 72.9781 },
        ],
      },
    },
  });

  await prisma.weatherEvent.upsert({
    where: { code: 'A1025' },
    update: {},
    create: {
      jurisdictionId: mumbaiJurisdiction.id,
      code: 'A1025',
      title: 'Thunderstorm Cluster',
      eventType: 'Convective Storm Cell',
      stage: EventStage.CONVECTIVE_INITIATION,
      severity: SeverityLevel.MODERATE,
      confidencePct: 74.0,
      description: 'Scattered thunderstorms with frequent lightning strikes over Western Suburbs.',
      locationName: 'Western Suburbs Artery',
      centerLat: 19.1136,
      centerLng: 72.8697,
      trajectoryDir: 'NNE',
      trajectorySpeedKmh: 18.0,
      rainMinMm: 40.0,
      rainMaxMm: 65.0,
      peakDurationHours: '1–2',
      status: 'ACTIVE',
    },
  });

  await prisma.weatherEvent.upsert({
    where: { code: 'A1023' },
    update: {},
    create: {
      jurisdictionId: mumbaiJurisdiction.id,
      code: 'A1023',
      title: 'Heavy Rainfall Event',
      eventType: 'Monsoon Orographic Surge',
      stage: EventStage.HEAVY_RAINFALL,
      severity: SeverityLevel.MODERATE,
      confidencePct: 68.0,
      description: 'Persistent moderate to heavy rainfall over Navi Mumbai and Thane Creek.',
      locationName: 'Navi Mumbai & Vashi',
      centerLat: 19.0330,
      centerLng: 73.0297,
      trajectoryDir: 'ENE',
      trajectorySpeedKmh: 15.0,
      rainMinMm: 35.0,
      rainMaxMm: 55.0,
      peakDurationHours: '2–4',
      status: 'ACTIVE',
    },
  });

  // 4. Atmospheric Telemetry Snapshot
  await prisma.atmosphericTelemetry.create({
    data: {
      jurisdictionId: mumbaiJurisdiction.id,
      stationId: 'IMD_MUMBAI_S_BAND',
      cloudTopTempCelsius: -72.4,
      coolingRatePerHour: -8.2,
      radarReflectivityDbz: 52.0,
      dopplerRadialVelocityKt: 24.5,
      lightningFlashesPerMin: 36,
      precipitableWaterMm: 68.2,
      capeJkg: 2850.0,
      surfacePrecipRateMmHr: 92.0,
      windSpeedKmh: 25.0,
      windDirection: 'NE',
    },
  });

  // 5. River Gauges
  await Promise.all([
    prisma.riverGauge.upsert({
      where: { stationCode: 'CST-BRIDGE-01' },
      update: {},
      create: {
        jurisdictionId: mumbaiJurisdiction.id,
        stationCode: 'CST-BRIDGE-01',
        name: 'Mithi River - CST Bridge',
        locationName: 'Kurla / BKC',
        lat: 19.068,
        lng: 72.872,
        currentLevelM: 3.82,
        warningLevelM: 3.50,
        dangerLevelM: 4.20,
        trendPerHourM: 0.35,
        capacityPct: 91.0,
        dischargeM3s: 410.0,
        status: RiverGaugeStatus.WARNING,
      },
    }),
    prisma.riverGauge.upsert({
      where: { stationCode: 'KRANTI-NAGAR-02' },
      update: {},
      create: {
        jurisdictionId: mumbaiJurisdiction.id,
        stationCode: 'KRANTI-NAGAR-02',
        name: 'Mithi River - Kurla Kranti Nagar',
        locationName: 'Kurla West',
        lat: 19.075,
        lng: 72.880,
        currentLevelM: 3.65,
        warningLevelM: 3.40,
        dangerLevelM: 4.00,
        trendPerHourM: 0.28,
        capacityPct: 88.0,
        dischargeM3s: 380.0,
        status: RiverGaugeStatus.WARNING,
      },
    }),
    prisma.riverGauge.upsert({
      where: { stationCode: 'DAHISAR-03' },
      update: {},
      create: {
        jurisdictionId: mumbaiJurisdiction.id,
        stationCode: 'DAHISAR-03',
        name: 'Dahisar River - WEH Bridge',
        locationName: 'Dahisar Check Naka',
        lat: 19.255,
        lng: 72.865,
        currentLevelM: 2.10,
        warningLevelM: 2.80,
        dangerLevelM: 3.50,
        trendPerHourM: 0.10,
        capacityPct: 60.0,
        dischargeM3s: 140.0,
        status: RiverGaugeStatus.NORMAL,
      },
    }),
  ]);

  // 6. Inundation Zones
  await Promise.all([
    prisma.inundationZone.create({
      data: {
        name: 'Mithi River Basin & Kurla West',
        region: 'Mumbai MMR',
        severity: SeverityLevel.CRITICAL,
        waterlogDepthCm: 42.0,
        riskTag: 'CRITICAL INUNDATION',
        polygonCoordsJson: JSON.stringify([
          [19.0600, 72.8650],
          [19.0850, 72.8700],
          [19.0800, 72.8950],
          [19.0550, 72.8800],
        ]),
      },
    }),
    prisma.inundationZone.create({
      data: {
        name: 'Chembur & Chunabhatti Lowlands',
        region: 'Mumbai MMR',
        severity: SeverityLevel.HIGH,
        waterlogDepthCm: 28.0,
        riskTag: 'HIGH FLOOD RISK',
        polygonCoordsJson: JSON.stringify([
          [19.0450, 72.8850],
          [19.0700, 72.8950],
          [19.0650, 72.9200],
          [19.0350, 72.9050],
        ]),
      },
    }),
    prisma.inundationZone.create({
      data: {
        name: 'Thane Creek Basin & Western Suburbs',
        region: 'Mumbai MMR',
        severity: SeverityLevel.MODERATE,
        waterlogDepthCm: 18.0,
        riskTag: 'MODERATE RISK',
        polygonCoordsJson: JSON.stringify([
          [19.1800, 72.9500],
          [19.2200, 72.9600],
          [19.2100, 72.9950],
          [19.1700, 72.9800],
        ]),
      },
    }),
  ]);

  // 7. Emergency Alerts (CAP-v1.2)
  await Promise.all([
    prisma.emergencyAlert.upsert({
      where: { identifier: 'AERIS-CAP-2026-07-21-004' },
      update: {},
      create: {
        jurisdictionId: mumbaiJurisdiction.id,
        weatherEventId: eventA1027.id,
        identifier: 'AERIS-CAP-2026-07-21-004',
        sender: 'sdma.officer@maharashtra.gov.in',
        status: CapStatus.ACTUAL,
        msgType: CapMsgType.ALERT,
        category: 'Met',
        eventTitle: 'Heavy Rainfall & Localized Cloudburst Warning',
        urgency: CapUrgency.IMMEDIATE,
        severity: CapSeverity.EXTREME,
        certainty: CapCertainty.OBSERVED,
        headline: 'Heavy rainfall intensifying over Kurla and BKC',
        description: 'Intense convective storm cell A1027 producing 92 mm/hr deluge over Kurla-BKC corridor. Mithi river level crossed warning threshold (3.82m).',
        instruction: 'Avoid low-lying subways under LBS Marg and CST Bridge. Follow municipal traffic diversions.',
        targetAreaDesc: 'Kurla, Sion, BKC, Ghatkopar, Chembur',
      },
    }),
    prisma.emergencyAlert.upsert({
      where: { identifier: 'AERIS-CAP-2026-07-21-003' },
      update: {},
      create: {
        jurisdictionId: mumbaiJurisdiction.id,
        weatherEventId: eventA1027.id,
        identifier: 'AERIS-CAP-2026-07-21-003',
        sender: 'sdma.officer@maharashtra.gov.in',
        status: CapStatus.ACTUAL,
        msgType: CapMsgType.ALERT,
        category: 'Met',
        eventTitle: 'Thunderstorm with Frequent Lightning Alert',
        urgency: CapUrgency.EXPECTED,
        severity: CapSeverity.SEVERE,
        certainty: CapCertainty.LIKELY,
        headline: 'Thunderstorm with frequent lightning over Western Suburbs',
        description: 'Atmospheric sounding indicates severe convective updrafts with vertical velocity exceeding 28 m/s.',
        instruction: 'Stay indoors away from metal structures and open fields.',
        targetAreaDesc: 'Western Suburbs, Andheri, Goregaon, Borivali',
      },
    }),
  ]);

  // 8. Corridor Presets
  await Promise.all([
    prisma.corridorPreset.upsert({
      where: { code: 'thane-borivali' },
      update: {},
      create: {
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
      },
    }),
    prisma.corridorPreset.upsert({
      where: { code: 'mumbai-thane' },
      update: {},
      create: {
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
      },
    }),
  ]);

  console.log('✅ AERIS Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
