"""
Hydrodynamic River Stage & Catchment Discharge Forecaster.
"""
import numpy as np
from typing import List
from config.constants import INUNDATION_THRESHOLDS
from src.data.schemas import RiverGaugeReading


class RiverDischargePredictor:
    """
    Predicts water surface stage (meters) and discharge flow rates (m³/s)
    for urban drainage rivers (e.g. Mithi River) under high-intensity rainfall.
    """

    @staticmethod
    def forecast_river_states(
        base_readings: List[RiverGaugeReading],
        catchment_rain_rate_mm_hr: float,
        lead_time_hours: float = 1.0,
        high_tide_lock: bool = True
    ) -> List[RiverGaugeReading]:
        """
        Calculates predicted stage and discharge rate after `lead_time_hours`.
        
        Hydraulic Manning / Inflow Approximation:
        dH/dt = (Q_in - Q_out) / SurfaceArea
        Q_in = CatchmentArea * RunoffCoeff * RainRate
        """
        updated_readings: List[RiverGaugeReading] = []

        for g in base_readings:
            # Catchment response multiplier
            catchment_multiplier = 0.008 if "Mithi" in g.name else 0.004
            
            # High tide prevents gravitational outfall into Mahim Bay
            tide_outfall_factor = 0.45 if high_tide_lock and "Mithi" in g.name else 0.85
            
            inflow_stage_rise = catchment_rain_rate_mm_hr * catchment_multiplier * (1.0 / tide_outfall_factor)
            new_level = g.current_level_m + (inflow_stage_rise * lead_time_hours)
            
            # Rate of change per hour
            trend_m_hr = float(np.round(inflow_stage_rise, 2))
            
            # Discharge scaling (Q ∝ H^(3/2))
            new_discharge = float(np.round(g.discharge_m3_s * ((max(0.5, new_level) / max(0.5, g.current_level_m)) ** 1.5), 1))
            new_level_rounded = float(np.round(new_level, 2))

            # Status classification
            if new_level_rounded >= g.critical_level_m:
                status = "CRITICAL"
            elif new_level_rounded >= g.danger_level_m:
                status = "DANGER"
            elif new_level_rounded >= g.warning_level_m:
                status = "WARNING"
            else:
                status = "NORMAL"

            updated_readings.append(
                RiverGaugeReading(
                    station_code=g.station_code,
                    name=g.name,
                    lat=g.lat,
                    lng=g.lng,
                    current_level_m=new_level_rounded,
                    warning_level_m=g.warning_level_m,
                    danger_level_m=g.danger_level_m,
                    critical_level_m=g.critical_level_m,
                    discharge_m3_s=new_discharge,
                    trend_rate_m_hr=trend_m_hr,
                    status=status,
                )
            )

        return updated_readings
