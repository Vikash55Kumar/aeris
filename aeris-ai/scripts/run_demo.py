#!/usr/bin/env python3
"""
AERIS-AI End-to-End Intelligence Demonstration Script.
"""
import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.inference.engine import AerisAIEngine
from src.data.schemas import JourneyRiskRequest


def main():
    print("\n" + "=" * 80)
    print(" 🚀 AERIS-AI: High-Resolution Hydro-Meteorological Intelligence Pipeline")
    print("=" * 80)

    # 1. Initialize Master Engine
    print("\n[Stage 01: OBSERVE] Ingesting Multi-Modal Remote Sensing & Telemetry Baseline...")
    engine = AerisAIEngine()
    observation = engine.get_live_observation()
    atm = observation.atmospheric_vector

    print(f"  • Ground Surface Rain Rate:      {atm.surface_precip_rate_mm_hr} mm/hr")
    print(f"  • Doppler Radar Reflectivity:    {atm.radar_reflectivity_dbz} dBZ")
    print(f"  • Satellite TIR1 Cloud-Top Temp: {atm.cloud_top_temp_celsius} °C")
    print(f"  • Convective Cooling Rate:       {atm.cooling_rate_celsius_hr} °C/hr")
    print(f"  • Convective Instability (CAPE): {atm.cape_j_kg} J/kg")
    print(f"  • Precipitable Water (PWV):      {atm.precipitable_water_mm} mm")
    print(f"  • Ground Lightning Flash Rate:   {atm.lightning_flashes_per_min} flashes/min")

    # 2. Stage 02: FUSE & NOWCAST
    print("\n[Stage 02: FUSE & NOWCAST] Executing ConvLSTM-UNet Spatio-Temporal Nowcasting...")
    nowcast = engine.compute_nowcast(observation, horizon_hours=6)
    indices = nowcast.convective_indices

    print(f"  • Convective Stage:              {indices.convective_stage.upper()}")
    print(f"  • Cloudburst Potential Index:    {indices.cloudburst_potential_index} / 100")
    print(f"  • Severe Thunderstorm Prob:      {indices.severe_thunderstorm_prob_pct} %")
    print(f"  • Microburst Risk Level:         {indices.microburst_risk_level.upper()}")
    print(f"  • 15-min Peak Precipitation:     {nowcast.time_steps[0].max_rain_rate_mm_hr} mm/hr")
    print(f"  • 60-min Peak Precipitation:     {nowcast.time_steps[3].max_rain_rate_mm_hr} mm/hr")

    # 3. Stage 03: PROPAGATE
    print("\n[Stage 03: PROPAGATE] Executing 2D Hydrodynamic Inundation & River Stage Modeling...")
    flood = engine.compute_flood_inundation(observation, storm_duration_hours=1.5, high_tide_locked=True)

    print(f"  • Critical Inundation Hotspots:  {flood.total_flooded_hotspots}")
    print(f"  • Maximum Surface Waterlog:      {flood.max_inundation_depth_cm} cm")
    for zone in flood.critical_zones[:3]:
        print(f"     - [{zone.severity.upper()}] {zone.name}: {zone.waterlog_depth_cm} cm ({zone.risk_tag})")
    
    print("  • River Gauges Status:")
    for gauge in flood.river_gauges:
        print(f"     - {gauge.name}: {gauge.current_level_m}m / Warning: {gauge.warning_level_m}m -> [{gauge.status}]")

    # 4. Stage 04: WARN & ROUTE
    print("\n[Stage 04: WARN & ROUTE] Computing Dynamic Journey Hazards (Thane ⇄ Borivali)...")
    journey = engine.optimize_journey_route(
        JourneyRiskRequest(origin="Thane", destination="Borivali", travel_mode="car")
    )

    print("  • Dynamic Route Strategies Evaluated:")
    for key, route in journey.routes.items():
        print(f"     - [{route.tradeoff_tag}] {route.name}: {route.total_distance_km} km, {route.total_duration_min} min (Risk: {route.composite_risk})")

    print("\n  • Departure Optimization Matrix:")
    for opt in journey.departure_options:
        rec_tag = " [RECOMMENDED]" if opt.is_recommended else ""
        print(f"     - Departure {opt.departure_time} | Score: {opt.score:>2}/100 | Risk: {opt.risk_level:<8} | {opt.reason}{rec_tag}")

    print("\n" + "=" * 80)
    print(" ✅ E2E AERIS-AI INTELLIGENCE DEMONSTRATION COMPLETE")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
