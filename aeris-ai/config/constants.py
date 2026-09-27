"""
AERIS-AI System Constants and Physical Meteorological Parameters.
"""
from typing import Dict, Any, Tuple

# Mumbai Metropolitan Region (MMR) Geographic Bounding Box
MMR_BOUNDS: Dict[str, float] = {
    "min_lat": 18.8800,
    "max_lat": 19.3400,
    "min_lng": 72.7500,
    "max_lng": 73.1500,
    "center_lat": 19.0760,
    "center_lng": 72.8777,
}

# 250m Universal Spatial Grid Specifications
GRID_SPECS: Dict[str, Any] = {
    "resolution_meters": 250,
    "grid_height": 204,   # Latitude bins: (19.34 - 18.88) * 111km / 0.25km ≈ 204
    "grid_width": 168,    # Longitude bins: (73.15 - 72.75) * 105km / 0.25km ≈ 168
    "temporal_step_minutes": 15,
    "max_forecast_hours": 6,
    "forecast_steps": 24, # 6 hours / 15 mins = 24 time steps
}

# Empirical & Physical Meteorological Formulas
# Marshall-Palmer Z-R Relationship: Z = a * R^b  => R = (10^(dBZ/10) / a)^(1/b)
MARSHALL_PALMER: Dict[str, float] = {
    "a": 200.0,
    "b": 1.6,
}

# Severe Weather & Convective Risk Thresholds
METEOROLOGICAL_THRESHOLDS: Dict[str, Any] = {
    "cloudburst_rain_rate_mm_hr": 100.0,
    "heavy_rain_rate_mm_hr": 50.0,
    "moderate_rain_rate_mm_hr": 15.0,
    "light_rain_rate_mm_hr": 2.5,
    
    # Atmospheric Instability Indices
    "cape_extreme_j_kg": 3000.0,
    "cape_high_j_kg": 2200.0,
    "cape_moderate_j_kg": 1500.0,
    
    "pwv_extreme_mm": 65.0,
    "pwv_high_mm": 55.0,
    
    "cloud_top_cooling_extreme_c_hr": -8.0,
    "cloud_top_cooling_high_c_hr": -5.0,
    
    "radar_reflectivity_cloudburst_dbz": 52.0,
    "radar_reflectivity_severe_dbz": 45.0,
    "radar_reflectivity_moderate_dbz": 35.0,
    
    "lightning_flash_extreme_per_min": 40,
    "lightning_flash_high_per_min": 20,
}

# Hydrodynamic Inundation & River Gauge Thresholds
INUNDATION_THRESHOLDS: Dict[str, Any] = {
    "clear_cm": 0.0,
    "minor_ponding_cm": 10.0,
    "moderate_waterlog_cm": 25.0,
    "severe_inundation_cm": 50.0,
    "critical_impassable_cm": 75.0,
    
    # Mithi River Gauge Thresholds (Meters)
    "mithi_river_warning_level_m": 2.7,
    "mithi_river_danger_level_m": 3.6,
    "mithi_river_critical_level_m": 4.2,
}

# Risk Level Enumerations
RISK_LEVELS: Tuple[str, ...] = (
    "low",
    "moderate",
    "high",
    "very_high",
    "critical",
)

# Multi-Modal Travel Cost Weights
VEHICLE_PROFILES: Dict[str, Dict[str, float]] = {
    "car": {
        "alpha_rain": 0.02,
        "beta_inundation": 0.08,
        "gamma_wind": 0.005,
        "max_tolerable_waterlog_cm": 25.0,
    },
    "two_wheeler": {
        "alpha_rain": 0.04,
        "beta_inundation": 0.12,
        "gamma_wind": 0.015,
        "max_tolerable_waterlog_cm": 15.0,
    },
    "bus": {
        "alpha_rain": 0.015,
        "beta_inundation": 0.04,
        "gamma_wind": 0.008,
        "max_tolerable_waterlog_cm": 45.0,
    },
    "freight": {
        "alpha_rain": 0.01,
        "beta_inundation": 0.03,
        "gamma_wind": 0.012,
        "max_tolerable_waterlog_cm": 50.0,
    },
}
