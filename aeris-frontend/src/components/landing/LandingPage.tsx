'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Shield,
  Activity,
  Radio,
  Satellite,
  Waves,
  Zap,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  Layers,
  AlertTriangle,
  Building2,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export const LandingPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isGuest } = useAuth();

  const handleExplore = () => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (isGuest) {
      router.push('/journey');
    } else {
      router.push('/command-center');
    }
  };

  const architectureCards = [
    {
      id: '01',
      badge: '01 · OBSERVE',
      badgeColor: 'bg-[#E6F3F7] text-[#087693] border-[#087693]/30',
      glowGradient: 'from-[#0B2F56] to-[#087693]',
      title: 'Continuous multi-source sensor ingestion.',
      summary: 'Harmonizes geostationary spaceborne infrared soundings, Doppler radar pulses, and automated surface networks into a unified observational baseline before convective cells trigger rain.',
      image: '/images/architecture-observe.jpg',
      imageAlt: 'National Weather Forecasting Centre meteorologists monitoring satellite and radar feeds',
      bullets: [
        'INSAT-3DR Satellite (Thermal Infrared & Water Vapor bands)',
        'IMD Doppler Radar (Reflectivity, Velocity & Convective tracking)',
        'Atmospheric Soundings (Radiosonde, PWV & Lightning sensors)',
      ],
      metrics: '5-Min Satellite Refresh • 250m Radar Mesh',
      imageLeft: true,
    },
    {
      id: '02',
      badge: '02 · FUSE',
      badgeColor: 'bg-[#E6F3F7] text-[#087693] border-[#087693]/30',
      glowGradient: 'from-[#0B2F56] via-[#087693] to-[#11D8CC]',
      title: 'Harmonizing observations into one state.',
      summary: 'Eliminates sensor fragmentation and spatial blind spots by fusing satellite, radar, and thermodynamics into a single coherent high-resolution atmospheric vector field.',
      image: '/images/architecture-fuse.jpg',
      imageAlt: 'Data scientists and atmospheric AI researchers analyzing neural cross-sensor fusion models',
      bullets: [
        '250m Spatial Mesh (Continuous thermodynamic grid across regions)',
        'Cross-Sensor Quality Control (Automated anomaly filtering & calibration)',
        'Unified Event State (Single coherent atmospheric vector representation)',
      ],
      metrics: 'Sub-Kilometer Mesh • Zero Sensor Discrepancy',
      imageLeft: false,
    },
    {
      id: '03',
      badge: '03 · PROPAGATE',
      badgeColor: 'bg-[#E6F3F7] text-[#087693] border-[#087693]/30',
      glowGradient: 'from-[#087693] to-[#11D8CC]',
      title: 'Translating precipitation into ground impact.',
      summary: 'Couples high-resolution nowcast rainfall with terrain digital elevation models, soil saturation mechanics, and municipal drainage channels to compute real-time inundation depth.',
      image: '/images/architecture-propagate.jpg',
      imageAlt: 'Municipal civil engineers and hydrology specialists reviewing flood inundation risk and catchment telemetry',
      bullets: [
        'Hydrological Inundation (2D hydrodynamic overland runoff simulation)',
        'Catchment Runoff Physics (Dynamic soil infiltration & saturation curves)',
        'Mithi River Stage (Real-time urban canal discharge telemetry)',
      ],
      metrics: 'Street-Level Precision • 15-Minute Dynamic Hydrology',
      imageLeft: true,
    },
    {
      id: '04',
      badge: '04 · WARN',
      badgeColor: 'bg-[#E6F3F7] text-[#087693] border-[#087693]/30',
      glowGradient: 'from-[#0B2F56] to-[#11D8CC]',
      title: 'Actionable dispatch to decision makers.',
      summary: 'Converts complex hydro-meteorological models into unambiguous, geofenced early warnings, giving municipal authorities and emergency responders hours of actionable lead time.',
      image: '/images/architecture-warn.jpg',
      imageAlt: 'Emergency response command center officers and disaster relief dispatchers coordinating early warning alerts',
      bullets: [
        'Hyper-Local Boundaries (Ward, sub-basin, and corridor risk envelopes)',
        'Lead Time ETA (+2 to +6 hour proactive mitigation window)',
        'Severity & Impact Tier (Standardized CAP-v1.2 automated broadcast)',
      ],
      metrics: 'Standardized CAP-v1.2 Protocol • Zero Alert Fatigue',
      imageLeft: false,
    },
  ];

  return (
    <div className="bg-white text-[#0B2F56] min-h-screen font-sans selection:bg-[#087693] selection:text-white">
      {/* 0. NAVBAR — Clean, Minimal, White Background */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* AERIS Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="AERIS Logo"
              width={140}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* Simple Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#product" className="hover:text-[#087693] transition-colors">Product</a>
            <a href="#how-it-works" className="hover:text-[#087693] transition-colors">Intelligence</a>
            <a href="#audiences" className="hover:text-[#087693] transition-colors">About</a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-[#087693] transition-colors hidden sm:block"
            >
              Sign In
            </Link>

            <button
              onClick={handleExplore}
              className="bg-[#0B2F56] hover:bg-[#08223F] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isAuthenticated ? (isGuest ? 'View AERIS Journey' : 'Go to Command Center') : 'Explore AERIS'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* 1. HERO — The Core Message */}
      <section className="pt-20 pb-16 sm:pt-24 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Eyebrow */}
          <div className="inline-block">
            <span className="text-xs font-mono font-bold tracking-widest text-[#087693] uppercase bg-[#E6F3F7] border border-[#087693]/25 px-3 py-1 rounded-full">
              AI-POWERED WEATHER INTELLIGENCE
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-[#0B2F56] tracking-tight leading-[1.1] font-sans">
            Know What’s Developing. <br />
            <span className="bg-gradient-to-r from-[#087693] via-[#0AA2B4] to-[#11D8CC] bg-clip-text text-transparent">
              Know What Comes Next.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            AERIS connects satellite, radar, atmospheric and hydrological intelligence to detect evolving severe-weather events and understand their potential impact at the local level.
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={handleExplore}
              className="bg-[#0B2F56] hover:bg-[#08223F] text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>{isAuthenticated ? (isGuest ? 'View AERIS Journey' : 'Go to Command Center') : 'Explore AERIS'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. THE PRODUCT — What AERIS Actually Does */}
      <section id="product" className="py-20 sm:py-28 bg-slate-50/70 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Section Header */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F3F7] border border-[#087693]/25 text-xs font-mono font-bold text-[#087693] uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Core Intelligence Engine</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0B2F56] tracking-tight leading-tight">
              Weather data is everywhere. <br />
              <span className="text-[#087693]">Intelligence is not.</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              AERIS unifies fragmented satellite, radar, atmospheric, and hydrological data into real-time, actionable early warnings for high-stakes urban infrastructure.
            </p>
          </div>

          {/* Three Visual Capability Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 01 — Detect */}
            <div className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-[#087693]/40 transition-all duration-300 overflow-hidden flex flex-col justify-between">
              <div>
                {/* Visual Imagery Container */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src="/images/insat-scan.jpg"
                    alt="Satellite Infrared Thermal Observation"
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                  
                  {/* Top HUD Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-mono text-cyan-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#11D8CC] animate-pulse" />
                    <span>INSAT-3DR TIR1</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-red-950/80 backdrop-blur-md px-2 py-1 rounded border border-red-500/30 text-[10px] font-mono text-red-300 font-bold">
                    CTT: -68.4°C
                  </div>
                  
                  {/* Bottom Image Label */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/90">
                    <span className="flex items-center gap-1">
                      <Satellite className="w-3.5 h-3.5 text-[#11D8CC]" />
                      <span>Convective Signature</span>
                    </span>
                    <span className="text-[#11D8CC] font-semibold">+4.5h Lead Time</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-bold text-[#0B2F56] tracking-tight group-hover:text-[#087693] transition-colors">
                    Identify developing severe weather
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    Evaluates rapid cloud-top cooling and lightning density to detect emerging convection hours before ground rain begins.
                  </p>
                </div>
              </div>
            </div>

            {/* 02 — Understand */}
            <div className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-[#087693]/40 transition-all duration-300 overflow-hidden flex flex-col justify-between">
              <div>
                {/* Visual Imagery Container */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src="/images/radar-scan.jpg"
                    alt="Doppler Weather Radar Convective Scan"
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                  
                  {/* Top HUD Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-mono text-blue-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span>DWR MUMBAI • S-BAND</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-amber-950/80 backdrop-blur-md px-2 py-1 rounded border border-amber-500/30 text-[10px] font-mono text-amber-300 font-bold">
                    56.8 dBZ CORE
                  </div>
                  
                  {/* Bottom Image Label */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/90">
                    <span className="flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-blue-400" />
                      <span>Storm Cell Track</span>
                    </span>
                    <span className="text-blue-400 font-semibold">22.4 km/h NNE</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-bold text-[#0B2F56] tracking-tight group-hover:text-[#087693] transition-colors">
                    Connect signals into an evolving event
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    Synthesizes radar reflectivity, wind shear, and satellite soundings into a single coherent storm lifecycle track.
                  </p>
                </div>
              </div>

            </div>

            {/* 03 — Anticipate */}
            <div className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between">
              <div>
                {/* Visual Imagery Container */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src="/images/flood-map.jpg"
                    alt="Hydrological Flood Inundation & Terrain Risk"
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                  
                  {/* Top HUD Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-mono text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>HYDRO-TERRAIN MESH</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-red-950/80 backdrop-blur-md px-2 py-1 rounded border border-red-500/30 text-[10px] font-mono text-red-300 font-bold">
                    WATERLOG: +42cm
                  </div>
                  
                  {/* Bottom Image Label */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/90">
                    <span className="flex items-center gap-1">
                      <Waves className="w-3.5 h-3.5 text-amber-400" />
                      <span>Catchment Inundation</span>
                    </span>
                    <span className="text-amber-400 font-semibold">5 Corridors Alert</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-bold text-[#0B2F56] tracking-tight group-hover:text-amber-600 transition-colors">
                    Translate weather into local impact
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    Couples rainfall forecasts with elevation contours, drainage bottlenecks, and soil moisture to pinpoint street flooding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW AERIS THINKS — Architecture of Intelligence */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F3F7] border border-[#087693]/25 text-xs font-semibold text-[#087693] uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5" />
            <span>Architecture of Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0B2F56] tracking-tight">
            One event. <span className="text-[#087693]">One evolving picture.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            AERIS follows severe weather from atmospheric signals to ground-level impact through an end-to-end intelligent pipeline.
          </p>
        </div>

        {/* 4 Alternating Left-Right Cards */}
        <div className="space-y-16 sm:space-y-24">
          {architectureCards.map((card) => (
            <div
              key={card.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
            >
              {/* Image Container with Vibrant Gradient Glow Frame */}
              <div
                className={`lg:col-span-6 ${
                  card.imageLeft ? 'lg:order-1' : 'lg:order-2'
                }`}
              >
                <div
                  className={`p-2.5 sm:p-3.5 rounded-3xl bg-gradient-to-br ${card.glowGradient} shadow-xl hover:shadow-2xl transition-all duration-500`}
                >
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
                    <Image
                      src={card.image}
                      alt={card.imageAlt}
                      fill
                      className="object-cover object-center hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/10" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-medium text-white/95 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                      <span className="font-semibold truncate">{card.imageAlt.split(' ')[0]} {card.imageAlt.split(' ')[1]} {card.imageAlt.split(' ')[2]}</span>
                      <span className="text-[#11D8CC] font-semibold shrink-0">{card.metrics.split('•')[0]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text & Content Container */}
              <div
                className={`lg:col-span-6 space-y-4 ${
                  card.imageLeft ? 'lg:order-2' : 'lg:order-1'
                }`}
              >
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold tracking-wider uppercase border ${card.badgeColor}`}>
                  <span>{card.badge}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B2F56] tracking-tight leading-tight">
                  {card.title}
                </h3>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  {card.summary}
                </p>

                {/* Structured Bullets */}
                <div className="pt-2 space-y-2.5">
                  {card.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#087693] mt-2 shrink-0" />
                      <span className="leading-snug">{bullet}</span>
                    </div>
                  ))}
                </div>

                {/* Micro-telemetry bottom pill with clean, professional typography */}
                <div className="pt-3">
                  <div className="inline-flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/80 px-4 py-2 rounded-full border border-slate-200/90 text-xs text-slate-700 transition-colors shadow-2xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#0B2F56]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#087693]" />
                      Pipeline Metric:
                    </span>
                    <span className="text-slate-600 font-medium">{card.metrics}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WHO IT'S FOR + FINAL CTA */}
      <section id="audiences" className="py-20 sm:py-24 bg-slate-50/70 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Heading */}
          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-5xl font-black text-[#0B2F56] tracking-tight">
              Built for decisions that depend on <span className="text-[#087693]">what happens next.</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-3 font-normal">
              AERIS is a platform engineered for teams responsible for critical infrastructure, public safety, and operational continuity.
            </p>
          </div>

          {/* 3 Audience Cards — High Precision Illustrated Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Government & Emergency Management */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-[#087693]/30 transition-all duration-300 flex flex-col justify-between">
              <div>
                {/* Illustration Icon with Soft Ground Shadow */}
                <div className="flex flex-col items-center justify-center h-28 mb-4">
                  <div className="relative">
                    <svg className="w-20 h-20" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Officer badge shield */}
                      <rect x="12" y="18" width="28" height="34" rx="8" stroke="#0B2F56" strokeWidth="2.5" fill="white" />
                      {/* Officer avatar inside shield */}
                      <circle cx="26" cy="30" r="5.5" stroke="#0B2F56" strokeWidth="2" fill="#E6F3F7" />
                      <path d="M18 46c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#0B2F56" strokeWidth="2" strokeLinecap="round" />
                      
                      {/* Route dashed line to emergency dispatch flag */}
                      <path d="M38 35c8 0 8 10 16 10" stroke="#0B2F56" strokeWidth="2" strokeDasharray="3 3" />
                      
                      {/* Intermediate waypoint dot */}
                      <circle cx="46" cy="40" r="3" fill="#087693" stroke="#0B2F56" strokeWidth="1.5" />
                      
                      {/* Destination Beacon / Dispatch Target */}
                      <circle cx="58" cy="45" r="4" fill="#11D8CC" stroke="#0B2F56" strokeWidth="2" />
                      <path d="M58 41v-16l8 4-8 4" fill="#087693" stroke="#0B2F56" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                    <div className="w-16 h-2 bg-slate-200/70 rounded-full blur-[1.5px] mx-auto -mt-1" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#0B2F56] tracking-tight">
                  Government &amp; Emergency Response
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-3 font-normal">
                  Monitor evolving severe-weather events, evaluate vulnerable drainage catchments, and dispatch automated CAP-v1.2 early warnings with multi-hour lead time.
                </p>
              </div>
            </div>

            {/* Card 2: Infrastructure & Operations */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-[#087693]/30 transition-all duration-300 flex flex-col justify-between">
              <div>
                {/* Illustration Icon with Soft Ground Shadow */}
                <div className="flex flex-col items-center justify-center h-28 mb-4">
                  <div className="relative">
                    <svg className="w-20 h-20" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Inflow sensor wires / nodes */}
                      <path d="M12 28h16" stroke="#0B2F56" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="12" cy="28" r="3" fill="#087693" stroke="#0B2F56" strokeWidth="1.5" />
                      
                      <path d="M12 40h16" stroke="#0B2F56" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="12" cy="40" r="3" fill="#0B2F56" stroke="#0B2F56" strokeWidth="1.5" />
                      
                      <path d="M12 52h16" stroke="#0B2F56" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="12" cy="52" r="3" fill="#11D8CC" stroke="#0B2F56" strokeWidth="1.5" />

                      {/* Central telemetry chip / hub unit */}
                      <rect x="28" y="24" width="24" height="32" rx="7" stroke="#0B2F56" strokeWidth="2.5" fill="white" />
                      <rect x="33" y="29" width="14" height="22" rx="4" fill="#E6F3F7" stroke="#087693" strokeWidth="1.5" />
                      <circle cx="40" cy="40" r="3.5" fill="#087693" stroke="#0B2F56" strokeWidth="1.5" />

                      {/* Outward wireless radar/sensor broadcast waves */}
                      <path d="M56 32a12 12 0 0 1 0 16" stroke="#087693" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M62 26a20 20 0 0 1 0 28" stroke="#11D8CC" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3" />
                      <path d="M68 20a28 28 0 0 1 0 40" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <div className="w-16 h-2 bg-slate-200/70 rounded-full blur-[1.5px] mx-auto -mt-1" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#0B2F56] tracking-tight">
                  Infrastructure &amp; City Operations
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-3 font-normal">
                  Anticipate weather-driven disruption across arterial highway corridors, rail bottlenecks, airport runways, and power grids before localized waterlogging strikes.
                </p>
              </div>
            </div>

            {/* Card 3: Weather & Climate Intelligence */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-[#087693]/30 transition-all duration-300 flex flex-col justify-between">
              <div>
                {/* Illustration Icon with Soft Ground Shadow */}
                <div className="flex flex-col items-center justify-center h-28 mb-4">
                  <div className="relative">
                    <svg className="w-20 h-20" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Coordinate axes */}
                      <path d="M16 16v44h48" stroke="#0B2F56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      
                      {/* Histogram bars */}
                      <rect x="22" y="46" width="6" height="14" rx="1" fill="#F1F5F9" stroke="#0B2F56" strokeWidth="1.5" />
                      <rect x="30" y="38" width="6" height="22" rx="1" fill="#E6F3F7" stroke="#0B2F56" strokeWidth="1.5" />
                      <rect x="38" y="28" width="6" height="32" rx="1" fill="#C4EAF0" stroke="#0B2F56" strokeWidth="1.5" />
                      <rect x="46" y="20" width="6" height="40" rx="1" fill="#8CE0E7" stroke="#0B2F56" strokeWidth="1.5" />

                      {/* Upward trending prediction vector */}
                      <path d="M20 48l12-14 10 4 18-20" stroke="#0B2F56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M56 18h6v6" stroke="#0B2F56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                      {/* High-impact value badge / metric circle */}
                      <circle cx="56" cy="18" r="6" fill="#087693" stroke="#0B2F56" strokeWidth="2" />
                      <path d="M54 18h4M56 15v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <div className="w-16 h-2 bg-slate-200/70 rounded-full blur-[1.5px] mx-auto -mt-1" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#0B2F56] tracking-tight">
                  Weather &amp; Climate Intelligence
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-3 font-normal">
                  Turn fragmented spaceborne, Doppler radar, and hydrological gauge feeds into structured, event-level spatial intelligence for mission-critical operations.
                </p>
              </div>
            </div>
          </div>

          {/* Final Call to Action Block — Matches AERIS Design System */}
          <div className="relative bg-[#08223F] border border-[#164E85] rounded-3xl p-8 sm:p-16 text-center text-white space-y-8 shadow-xl overflow-hidden">
            {/* Subtle Atmospheric Teal Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#087693]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B2F56] border border-[#087693]/40 text-[#11D8CC] text-xs font-semibold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-[#11D8CC] animate-pulse" />
                <span>Next-Gen Severe Weather Nowcasting</span>
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
                Build a safer response to <br className="hidden sm:inline" />
                <span className="text-[#11D8CC]">
                  severe weather.
                </span>
              </h2>

              {/* Subtext */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                AERIS connects environmental signals to real-world operational decisions—giving emergency commanders and infrastructure operators proactive lead time.
              </p>

              {/* Buttons */}
              <div className="flex items-center justify-center pt-2">
                <button
                  onClick={handleExplore}
                  className="bg-white hover:bg-slate-100 text-[#0B2F56] font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-sans"
                >
                  <span>{isAuthenticated ? (isGuest ? 'View AERIS Journey' : 'Explore Command Center') : 'Sign In to Command Center'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Trust Indicators / Badges */}
              <div className="pt-6 border-t border-[#164E85] flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#11D8CC]" />
                  CAP-v1.2 Protocol Compliant
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#11D8CC]" />
                  Sub-Kilometer Radar Nowcasts
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#11D8CC]" />
                  Real-Time Hydro-Terrain Mesh
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER — Minimal */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 sm:px-8 text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <Image
              src="/logo.png"
              alt="AERIS Logo"
              width={120}
              height={28}
              className="h-6 w-auto object-contain"
            />
            <div className="text-slate-500 mt-1.5 text-xs">Weather Intelligence for a Changing World.</div>
          </div>

          <div className="flex items-center gap-6 text-slate-600 font-medium">
            <a href="#product" className="hover:text-[#087693] transition-colors">Product</a>
            <a href="#how-it-works" className="hover:text-[#087693] transition-colors">Intelligence</a>
            <a href="#audiences" className="hover:text-[#087693] transition-colors">About</a>
            <Link href="/login" className="hover:text-[#087693] transition-colors">Contact</Link>
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            &copy; 2026 AERIS &bull; Privacy &bull; Terms
          </div>
        </div>
      </footer>
    </div>
  );
};
