"""
Master AERIS AI Inference Engine (Observe -> Fuse -> Propagate -> Warn).
"""
from typing import Dict, Any, Optional
from src.data.extractors import MultiSensorIngestionPipeline
from src.data.schemas import (
    MultiSensorObservation,
    NowcastResponse,
    InundationResponse,
    JourneyRiskRequest,
    JourneyRiskResponse,
)
from src.inference.nowcast_pipeline import NowcastPipeline
from src.inference.flood_pipeline import FloodRiskPipeline
from src.inference.journey_pipeline import JourneyRiskPipeline


class AerisAIEngine:
    """
    Unified AI Orchestrator implementing the full AERIS hydro-meteorological intelligence cycle.
    """

    def __init__(self, device: Optional[str] = None):
        self.ingestion_pipeline = MultiSensorIngestionPipeline(grid_size=64)
        self.nowcast_pipeline = NowcastPipeline(device=device)
        self.flood_pipeline = FloodRiskPipeline()
        self.journey_pipeline = JourneyRiskPipeline()

    def get_live_observation(
        self,
        cloud_top_temp: float = -74.5,
        cooling_rate: float = -8.5,
        radar_dbz: float = 53.0,
        lightning_rate: int = 38,
        cape_val: float = 2950.0,
        pwv_val: float = 68.5,
        precip_rate: float = 96.0
    ) -> MultiSensorObservation:
        """Stage 01: OBSERVE - Ingests spaceborne, radar, and surface sensors."""
        return self.ingestion_pipeline.ingest_current_state(
            cloud_top_temp=cloud_top_temp,
            cooling_rate=cooling_rate,
            radar_dbz=radar_dbz,
            lightning_rate=lightning_rate,
            cape_val=cape_val,
            pwv_val=pwv_val,
            precip_rate=precip_rate,
        )

    def compute_nowcast(
        self,
        observation: Optional[MultiSensorObservation] = None,
        horizon_hours: int = 6
    ) -> NowcastResponse:
        """Stage 02: FUSE & NOWCAST - Neural spatio-temporal radar & rainfall extrapolation."""
        obs = observation or self.get_live_observation()
        return self.nowcast_pipeline.run_nowcast(obs, horizon_hours=horizon_hours)

    def compute_flood_inundation(
        self,
        observation: Optional[MultiSensorObservation] = None,
        storm_duration_hours: float = 1.5,
        high_tide_locked: bool = True
    ) -> InundationResponse:
        """Stage 03: PROPAGATE - 2D Hydrodynamic overland runoff and river gauge forecast."""
        obs = observation or self.get_live_observation()
        return self.flood_pipeline.run_flood_simulation(
            obs,
            storm_duration_hours=storm_duration_hours,
            high_tide_locked=high_tide_locked
        )

    def optimize_journey_route(self, request: JourneyRiskRequest) -> JourneyRiskResponse:
        """Stage 04: WARN & ROUTE - Multi-objective weather risk route optimization."""
        return self.journey_pipeline.optimize_journey(request)

    def generate_full_tactical_assessment(
        self,
        origin: str = "Thane",
        destination: str = "Borivali",
        travel_mode: str = "car"
    ) -> Dict[str, Any]:
        """Runs the complete end-to-end intelligence cycle and returns a combined situation report."""
        obs = self.get_live_observation()
        nowcast = self.compute_nowcast(obs)
        flood = self.compute_flood_inundation(obs)
        journey = self.optimize_journey_route(
            JourneyRiskRequest(origin=origin, destination=destination, travel_mode=travel_mode)
        )

        return {
            "timestamp": obs.timestamp.isoformat(),
            "atmospheric_telemetry": obs.atmospheric_vector.model_dump(),
            "convective_diagnostic": nowcast.convective_indices.model_dump(),
            "peak_forecast": {
                "max_rain_rate_mm_hr": nowcast.time_steps[0].max_rain_rate_mm_hr if nowcast.time_steps else 0.0,
                "radar_dbz_max": nowcast.time_steps[0].radar_reflectivity_max_dbz if nowcast.time_steps else 0.0,
                "convective_stage": nowcast.convective_indices.convective_stage,
            },
            "inundation_summary": {
                "critical_hotspots_count": flood.total_flooded_hotspots,
                "max_flood_depth_cm": flood.max_inundation_depth_cm,
                "mithi_river_level_m": flood.river_gauges[0].current_level_m if flood.river_gauges else 0.0,
                "mithi_river_status": flood.river_gauges[0].status if flood.river_gauges else "NORMAL",
            },
            "journey_recommendation": {
                "recommended_departure": next((d.departure_time for d in journey.departure_options if d.is_recommended), "17:15"),
                "best_score": max((d.score for d in journey.departure_options), default=95),
                "balanced_duration": journey.routes["balanced"].total_duration_min,
                "fastest_hazard_warning": journey.routes["fastest"].segments[0].alert or "Heavy Rain Warning",
            }
        }
