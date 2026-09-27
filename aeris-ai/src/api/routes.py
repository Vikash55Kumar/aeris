"""
AERIS-AI REST API Endpoints & Route Handlers.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from src.data.schemas import (
    MultiSensorObservation,
    NowcastResponse,
    InundationResponse,
    JourneyRiskRequest,
    JourneyRiskResponse,
)
from src.inference.engine import AerisAIEngine

router = APIRouter()
engine = AerisAIEngine()


@router.get("/health", tags=["Health & Status"])
async def health_check():
    """Health check endpoint confirming engine operational readiness."""
    import torch
    return {
        "status": "OPERATIONAL",
        "service": "aeris-ai",
        "version": "1.0.0",
        "device": str(engine.nowcast_pipeline.device),
        "cuda_available": torch.cuda.is_available(),
        "pipelines": {
            "ingestion": "ACTIVE",
            "spatiotemporal_nowcasting": "ACTIVE",
            "hydrodynamic_inundation": "ACTIVE",
            "journey_risk_optimizer": "ACTIVE",
        }
    }


@router.get("/api/v1/telemetry/live", response_model=MultiSensorObservation, tags=["Observation & Telemetry"])
async def get_live_telemetry(
    radar_dbz: float = Query(53.0, description="Peak radar reflectivity (dBZ)"),
    cloud_top_temp: float = Query(-74.5, description="Satellite TIR1 cloud-top temp (°C)"),
    cooling_rate: float = Query(-8.5, description="Cloud top cooling rate (°C/hr)"),
    cape_val: float = Query(2950.0, description="CAPE instability (J/kg)"),
    precip_rate: float = Query(96.0, description="Surface precipitation rate (mm/hr)"),
):
    """Ingests and fuses real-time multi-source observation state."""
    return engine.get_live_observation(
        cloud_top_temp=cloud_top_temp,
        cooling_rate=cooling_rate,
        radar_dbz=radar_dbz,
        cape_val=cape_val,
        precip_rate=precip_rate,
    )


@router.post("/api/v1/nowcast/predict", response_model=NowcastResponse, tags=["AI Spatio-Temporal Nowcasting"])
async def run_nowcast(
    observation: Optional[MultiSensorObservation] = None,
    horizon_hours: int = Query(6, ge=1, le=12, description="Forecast horizon in hours"),
):
    """Executes ConvLSTM-UNet spatio-temporal nowcasting (0-6 hours)."""
    try:
        return engine.compute_nowcast(observation=observation, horizon_hours=horizon_hours)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nowcast prediction failed: {str(e)}")


@router.post("/api/v1/hydrology/inundation", response_model=InundationResponse, tags=["Hydrodynamic Flood Modeling"])
async def run_inundation(
    observation: Optional[MultiSensorObservation] = None,
    storm_duration_hours: float = Query(1.5, ge=0.25, le=6.0, description="Storm duration in hours"),
    high_tide_locked: bool = Query(True, description="High tide preventing canal outfall"),
):
    """Executes 2D hydrodynamic overland runoff & river gauge simulation."""
    try:
        return engine.compute_flood_inundation(
            observation=observation,
            storm_duration_hours=storm_duration_hours,
            high_tide_locked=high_tide_locked
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inundation simulation failed: {str(e)}")


@router.post("/api/v1/journey/optimize", response_model=JourneyRiskResponse, tags=["Journey & Route Optimizer"])
async def optimize_journey(request: JourneyRiskRequest):
    """Calculates multi-objective weather-penalty routes & departure recommendation scores."""
    try:
        return engine.optimize_journey_route(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Route optimization failed: {str(e)}")


@router.get("/api/v1/tactical-assessment", tags=["Full Situation Overview"])
async def get_tactical_assessment(
    origin: str = Query("Thane", description="Origin query"),
    destination: str = Query("Borivali", description="Destination query"),
    travel_mode: str = Query("car", description="Travel mode (car, two_wheeler, bus, freight)"),
):
    """Executes full Observe -> Fuse -> Propagate -> Warn intelligence cycle."""
    try:
        return engine.generate_full_tactical_assessment(origin=origin, destination=destination, travel_mode=travel_mode)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tactical assessment failed: {str(e)}")
