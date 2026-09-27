"""
AERIS-AI Pydantic Domain Schemas & Data Contracts.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Geospatial Primitives
# ---------------------------------------------------------------------------
class GeoLocation(BaseModel):
    name: str = Field(..., description="Location name or landmark")
    lat: float = Field(..., description="Latitude coordinate (degrees)")
    lng: float = Field(..., description="Longitude coordinate (degrees)")


# ---------------------------------------------------------------------------
# Observation & Telemetry Vectors
# ---------------------------------------------------------------------------
class AtmosphericTelemetryVector(BaseModel):
    station_id: str = Field(default="IMD_MUMBAI_RADAR_01")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    cloud_top_temp_celsius: float = Field(..., description="TIR1 Cloud top temperature in Celsius (e.g. -72.4)")
    cooling_rate_celsius_hr: float = Field(..., description="Rate of convective cooling in C/hour (e.g. -8.2)")
    radar_reflectivity_dbz: float = Field(..., description="Doppler radar max reflectivity in dBZ (e.g. 52.0)")
    doppler_radial_velocity_kt: float = Field(..., description="Radial wind velocity in knots (e.g. 24.5)")
    lightning_flashes_per_min: int = Field(..., description="Ground lightning sensor flash rate (e.g. 36)")
    precipitable_water_mm: float = Field(..., description="Total column precipitable water in mm (e.g. 68.2)")
    cape_j_kg: float = Field(..., description="Convective Available Potential Energy in J/kg (e.g. 2850.0)")
    surface_precip_rate_mm_hr: float = Field(..., description="Surface gauge precipitation rate (e.g. 92.0)")


class RiverGaugeReading(BaseModel):
    station_code: str = Field(..., description="Gauge station ID (e.g. MITHI_KURLA_01)")
    name: str = Field(..., description="River name & gauge location")
    lat: float
    lng: float
    current_level_m: float = Field(..., description="Current water stage in meters")
    warning_level_m: float = Field(default=2.7)
    danger_level_m: float = Field(default=3.6)
    critical_level_m: float = Field(default=4.2)
    discharge_m3_s: float = Field(default=0.0, description="Discharge volume rate in m³/s")
    trend_rate_m_hr: float = Field(default=0.0, description="Rate of level change per hour")
    status: str = Field(default="NORMAL") # NORMAL, WARNING, DANGER, CRITICAL


class MultiSensorObservation(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    atmospheric_vector: AtmosphericTelemetryVector
    river_gauges: List[RiverGaugeReading] = Field(default_factory=list)
    satellite_tir1_band: Optional[List[List[float]]] = None
    radar_reflectivity_grid: Optional[List[List[float]]] = None


# ---------------------------------------------------------------------------
# Spatio-Temporal Nowcast Outputs
# ---------------------------------------------------------------------------
class ConvectiveIndices(BaseModel):
    cloudburst_potential_index: float = Field(..., ge=0.0, le=100.0, description="Index from 0-100")
    severe_thunderstorm_prob_pct: float = Field(..., ge=0.0, le=100.0)
    microburst_risk_level: str = Field(default="low")
    convective_stage: str = Field(
        ...,
        description="moisture_accumulation | convective_initiation | intensification | heavy_rainfall | cloudburst_potential | decay"
    )


class NowcastTimeStep(BaseModel):
    step_index: int
    offset_minutes: int
    valid_time: datetime
    max_rain_rate_mm_hr: float
    mean_rain_rate_mm_hr: float
    radar_reflectivity_max_dbz: float
    convective_stage: str
    risk_level: str
    grid_summary: Optional[Dict[str, Any]] = None


class NowcastResponse(BaseModel):
    event_id: str
    event_code: str
    generated_at: datetime
    forecast_horizon_hours: int
    interval_minutes: int
    convective_indices: ConvectiveIndices
    time_steps: List[NowcastTimeStep]
    hotspot_zones: List[Dict[str, Any]]


# ---------------------------------------------------------------------------
# 2D Hydrodynamic & Inundation Outputs
# ---------------------------------------------------------------------------
class InundationZone(BaseModel):
    zone_id: str
    name: str
    region: str
    center_lat: float
    center_lng: float
    waterlog_depth_cm: float
    severity: str # low, moderate, high, very_high, critical
    risk_tag: str
    drainage_saturation_pct: float
    polygon_coordinates: List[List[float]] = Field(default_factory=list)


class InundationResponse(BaseModel):
    timestamp: datetime
    total_flooded_hotspots: int
    max_inundation_depth_cm: float
    river_gauges: List[RiverGaugeReading]
    critical_zones: List[InundationZone]


# ---------------------------------------------------------------------------
# Dynamic Route & Journey Risk Outputs
# ---------------------------------------------------------------------------
class RouteSegmentAnalysis(BaseModel):
    id: str
    from_name: str
    to_name: str
    distance_km: float
    duration_min: int
    time_window: str
    rainfall_rate_mm_hr: float
    flood_depth_cm: float
    risk_level: str # Low, Moderate, High, Critical
    node_color: str
    alert: Optional[str] = None


class RouteOption(BaseModel):
    strategy: str # balanced, fastest, safer
    name: str
    tradeoff_tag: str # BALANCED, FASTEST, WEATHER-SAFER
    total_distance_km: float
    total_duration_min: int
    composite_risk: str # Low, Moderate, High, Critical
    description: str
    waypoints: List[List[float]]
    segments: List[RouteSegmentAnalysis]


class DepartureOption(BaseModel):
    departure_time: str
    journey_time: str
    risk_level: str # Low, Moderate, High
    score: int = Field(..., ge=0, le=100, description="AERIS Condition Score (0-100)")
    reason: str
    high_risk_segment: str
    storm_center_relative: str
    is_recommended: bool = False


class JourneyRiskRequest(BaseModel):
    origin: str = Field(..., examples=["Thane"])
    destination: str = Field(..., examples=["Borivali"])
    travel_mode: str = Field(default="car", examples=["car"]) # car, two_wheeler, bus, freight
    departure_time_iso: Optional[str] = None


class JourneyRiskResponse(BaseModel):
    origin: GeoLocation
    destination: GeoLocation
    travel_mode: str
    queried_at: datetime
    routes: Dict[str, RouteOption]
    departure_options: List[DepartureOption]
