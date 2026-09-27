"""
Atmospheric Convective Instability & Cloudburst Risk Classifier.
"""
import numpy as np
from typing import Dict, Any
from config.constants import METEOROLOGICAL_THRESHOLDS
from src.data.schemas import ConvectiveIndices, AtmosphericTelemetryVector


class ConvectiveIndexClassifier:
    """
    Computes diagnostic thermodynamic instability indices and cloudburst potential
    from multi-sensor atmospheric telemetry vectors.
    """

    @staticmethod
    def evaluate(telemetry: AtmosphericTelemetryVector) -> ConvectiveIndices:
        """
        Evaluates convective state based on:
        1. CAPE (Convective Available Potential Energy): Thermodynamic buoyancy.
        2. PWV (Precipitable Water Vapor): Atmospheric moisture reservoir.
        3. Cloud-Top Cooling Rate (dT/dt): Convective updraft intensity.
        4. Lightning Flash Density: Ice-graupel collisions and electrification.
        5. Radar Reflectivity: Core hydrometeor mass.
        """
        # 1. Normalization of sub-indices
        cape_score = np.clip((telemetry.cape_j_kg - 1000.0) / 2000.0, 0.0, 1.0)
        pwv_score = np.clip((telemetry.precipitable_water_mm - 45.0) / 25.0, 0.0, 1.0)
        cooling_score = np.clip((-telemetry.cooling_rate_celsius_hr - 2.0) / 7.0, 0.0, 1.0)
        radar_score = np.clip((telemetry.radar_reflectivity_dbz - 30.0) / 25.0, 0.0, 1.0)
        lightning_score = np.clip(telemetry.lightning_flashes_per_min / 40.0, 0.0, 1.0)

        # 2. Weighted Cloudburst Potential Index (0 - 100)
        # Cloudburst requires deep thermodynamic instability + extreme moisture + violent updraft
        cloudburst_weights = {
            "cooling": 0.30,
            "radar": 0.25,
            "cape": 0.20,
            "pwv": 0.15,
            "lightning": 0.10,
        }
        cb_raw = (
            cloudburst_weights["cooling"] * cooling_score +
            cloudburst_weights["radar"] * radar_score +
            cloudburst_weights["cape"] * cape_score +
            cloudburst_weights["pwv"] * pwv_score +
            cloudburst_weights["lightning"] * lightning_score
        )
        cloudburst_index = float(np.round(np.clip(cb_raw * 100.0, 0.0, 100.0), 1))

        # 3. Severe Thunderstorm Probability (0 - 100%)
        # Dominated by CAPE, Lightning frequency, and Doppler wind shear
        storm_prob = float(np.round(
            np.clip((0.35 * cape_score + 0.35 * lightning_score + 0.30 * radar_score) * 100.0, 5.0, 99.0),
            1
        ))

        # 4. Microburst Risk Level
        if telemetry.doppler_radial_velocity_kt > 35.0 or (telemetry.radar_reflectivity_dbz > 50.0 and telemetry.cooling_rate_celsius_hr < -7.0):
            microburst_risk = "critical"
        elif telemetry.doppler_radial_velocity_kt > 25.0 or telemetry.radar_reflectivity_dbz > 45.0:
            microburst_risk = "high"
        elif telemetry.doppler_radial_velocity_kt > 15.0:
            microburst_risk = "moderate"
        else:
            microburst_risk = "low"

        # 5. Convective Evolution Stage Determination
        if cloudburst_index >= 75.0 or (telemetry.surface_precip_rate_mm_hr >= 90.0 and telemetry.radar_reflectivity_dbz >= 52.0):
            stage = "cloudburst_potential"
        elif telemetry.surface_precip_rate_mm_hr >= 50.0 or telemetry.radar_reflectivity_dbz >= 45.0:
            stage = "heavy_rainfall"
        elif telemetry.cooling_rate_celsius_hr <= -6.0 or telemetry.lightning_flashes_per_min >= 20:
            stage = "intensification"
        elif telemetry.cape_j_kg >= 2000.0 and telemetry.cloud_top_temp_celsius < -40.0:
            stage = "convective_initiation"
        elif telemetry.precipitable_water_mm >= 55.0:
            stage = "moisture_accumulation"
        else:
            stage = "decay"

        return ConvectiveIndices(
            cloudburst_potential_index=cloudburst_index,
            severe_thunderstorm_prob_pct=storm_prob,
            microburst_risk_level=microburst_risk,
            convective_stage=stage,
        )
