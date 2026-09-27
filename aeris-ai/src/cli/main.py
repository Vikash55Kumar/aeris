"""
AERIS-AI Command-Line Interface (CLI) Runner.
"""
import os
import sys
import argparse

# Add package root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.inference.engine import AerisAIEngine
from src.data.schemas import JourneyRiskRequest


def run_cli():
    parser = argparse.ArgumentParser(
        prog="aeris-ai",
        description="AERIS High-Resolution AI Weather Intelligence & Hydrodynamic Simulator CLI"
    )
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # Command 1: assess
    assess_parser = subparsers.add_parser("assess", help="Run end-to-end tactical situation assessment")
    assess_parser.add_argument("--origin", type=str, default="Thane", help="Origin location query")
    assess_parser.add_argument("--destination", type=str, default="Borivali", help="Destination location query")
    assess_parser.add_argument("--mode", type=str, default="car", choices=["car", "two_wheeler", "bus", "freight"])

    # Command 2: nowcast
    nowcast_parser = subparsers.add_parser("nowcast", help="Run 0-6h spatiotemporal precipitation nowcasting")
    nowcast_parser.add_argument("--horizon", type=int, default=6, help="Forecast horizon in hours")

    # Command 3: serve
    serve_parser = subparsers.add_parser("serve", help="Start standalone FastAPI HTTP server")
    serve_parser.add_argument("--host", type=str, default="0.0.0.0")
    serve_parser.add_argument("--port", type=int, default=8000)

    args = parser.parse_args()

    if args.command == "serve":
        import uvicorn
        print(f"[*] Starting AERIS-AI Inference Server on {args.host}:{args.port}...")
        uvicorn.run("src.api.app:app", host=args.host, port=args.port, reload=True)

    elif args.command == "nowcast":
        print("[*] Initializing AERIS-AI ConvLSTM-UNet Nowcasting Engine...")
        engine = AerisAIEngine()
        obs = engine.get_live_observation()
        res = engine.compute_nowcast(obs, horizon_hours=args.horizon)
        
        print("\n" + "=" * 70)
        print(f" AERIS NOWCAST REPORT: Event {res.event_code} ({res.event_id})")
        print("=" * 70)
        print(f" Convective Stage:          {res.convective_indices.convective_stage.upper()}")
        print(f" Cloudburst Potential Index:{res.convective_indices.cloudburst_potential_index} / 100")
        print(f" Severe Storm Probability:  {res.convective_indices.severe_thunderstorm_prob_pct} %")
        print(f" Microburst Risk Level:     {res.convective_indices.microburst_risk_level.upper()}")
        print("-" * 70)
        print(f"{'STEP':<6} | {'TIME OFFSET':<12} | {'PEAK RAIN (mm/hr)':<20} | {'RADAR (dBZ)':<12} | {'RISK'}")
        print("-" * 70)
        for step in res.time_steps[:12]:
            print(f"{step.step_index:<6} | +{step.offset_minutes:<2} min ({step.valid_time.strftime('%H:%M')}) | {step.max_rain_rate_mm_hr:<20.1f} | {step.radar_reflectivity_max_dbz:<12.1f} | {step.risk_level.upper()}")
        print("=" * 70 + "\n")

    elif args.command == "assess" or args.command is None:
        print("[*] Running Complete AERIS Tactical Assessment...")
        engine = AerisAIEngine()
        report = engine.generate_full_tactical_assessment(
            origin=getattr(args, "origin", "Thane"),
            destination=getattr(args, "destination", "Borivali"),
            travel_mode=getattr(args, "mode", "car")
        )

        print("\n" + "=" * 75)
        print("                   AERIS TACTICAL SITUATIONAL INTELLIGENCE                 ")
        print("=" * 75)
        print(f" Timestamp:                 {report['timestamp']}")
        print(f" Convective State:          {report['convective_diagnostic']['convective_stage'].upper()}")
        print(f" Cloudburst Risk Index:     {report['convective_diagnostic']['cloudburst_potential_index']} / 100")
        print(f" Peak Surface Rain Rate:    {report['peak_forecast']['max_rain_rate_mm_hr']} mm/hr")
        print(f" Peak Radar Reflectivity:   {report['peak_forecast']['radar_dbz_max']} dBZ")
        print("-" * 75)
        print(" [HYDROLOGY & INUNDATION HOTSPOTS]")
        print(f" Critical Hotspots Count:   {report['inundation_summary']['critical_hotspots_count']}")
        print(f" Max Inundation Depth:      {report['inundation_summary']['max_flood_depth_cm']} cm")
        print(f" Mithi River Stage Level:   {report['inundation_summary']['mithi_river_level_m']} m ({report['inundation_summary']['mithi_river_status']})")
        print("-" * 75)
        print(" [JOURNEY OPTIMIZATION RECOMMENDATION]")
        print(f" Recommended Departure:     {report['journey_recommendation']['recommended_departure']} (Score: {report['journey_recommendation']['best_score']}/100)")
        print(f" Recommended Duration:      {report['journey_recommendation']['balanced_duration']} min")
        print(f" Direct Artery Warning:     {report['journey_recommendation']['fastest_hazard_warning']}")
        print("=" * 75 + "\n")


if __name__ == "__main__":
    run_cli()
