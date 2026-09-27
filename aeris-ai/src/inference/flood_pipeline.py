"""
End-to-End Hydrodynamic Overland Inundation & River Gauge Simulation Pipeline.
"""
from datetime import datetime
import numpy as np
from typing import List, Optional
from src.data.schemas import (
    MultiSensorObservation,
    InundationResponse,
    InundationZone,
    RiverGaugeReading,
)
from src.models.hydrology.pinn_runoff import HydrodynamicRunoffSurrogate
from src.models.hydrology.river_discharge import RiverDischargePredictor


class FloodRiskPipeline:
    """Orchestrates 2D hydrodynamic overland runoff and catchment river discharge modeling."""

    def __init__(self):
        self.runoff_surrogate = HydrodynamicRunoffSurrogate()
        self.river_predictor = RiverDischargePredictor()

    def run_flood_simulation(
        self,
        observation: MultiSensorObservation,
        storm_duration_hours: float = 1.5,
        high_tide_locked: bool = True
    ) -> InundationResponse:
        current_rain = observation.atmospheric_vector.surface_precip_rate_mm_hr

        # 1. 2D Overland Runoff Inundation Depth Simulation
        inundation_zones: List[InundationZone] = self.runoff_surrogate.simulate_inundation(
            current_precip_rate_mm_hr=current_rain,
            storm_duration_hours=storm_duration_hours,
            river_backwater_factor=1.35 if high_tide_locked else 1.05
        )

        # 2. Dynamic River Stage Propagation
        updated_gauges: List[RiverGaugeReading] = self.river_predictor.forecast_river_states(
            base_readings=observation.river_gauges,
            catchment_rain_rate_mm_hr=current_rain,
            lead_time_hours=storm_duration_hours,
            high_tide_lock=high_tide_locked
        )

        max_depth = float(np.max([z.waterlog_depth_cm for z in inundation_zones])) if inundation_zones else 0.0
        critical_count = sum(1 for z in inundation_zones if z.severity in ["high", "very_high", "critical"])

        return InundationResponse(
            timestamp=datetime.utcnow(),
            total_flooded_hotspots=critical_count,
            max_inundation_depth_cm=max_depth,
            river_gauges=updated_gauges,
            critical_zones=inundation_zones,
        )
