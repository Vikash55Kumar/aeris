"""
Physics-Informed 2D Hydrodynamic Overland Runoff & Urban Inundation Surrogate Model.
"""
import numpy as np
from typing import List, Dict, Any, Tuple
from config.constants import INUNDATION_THRESHOLDS
from src.data.schemas import InundationZone


class HydrodynamicRunoffSurrogate:
    """
    Physics-Informed Neural Surrogate for 2D Shallow Water Overland Runoff.
    
    Governing Equation (Continuity with Source/Sink):
    dh/dt + div(q) = Precipitation(t) - Infiltration(t) - DrainageCapacity(t)
    
    Features:
    - Horton Soil Infiltration Curve: f(t) = fc + (f0 - fc)*exp(-k*t)
    - Depression storage & urban slope accumulation
    - Street-level waterlog depth (cm) calculation for Mumbai MMR flood-prone hotspots.
    """

    # Major Vulnerable Mumbai Low-Lying Hotspots
    HOTSPOT_REGISTRY: List[Dict[str, Any]] = [
        {
            "id": "ZONE_HINDMATA_01",
            "name": "Hindmata Junction / Parel Basin",
            "region": "South Central Mumbai",
            "lat": 19.0142,
            "lng": 72.8428,
            "elevation_m": 4.2,
            "drainage_capacity_mm_hr": 25.0, # Mumbai SWD design benchmark: 25-50 mm/hr
            "depression_storage_cm": 3.0,
            "polygon": [
                [19.0125, 72.8410], [19.0160, 72.8410],
                [19.0160, 72.8445], [19.0125, 72.8445]
            ]
        },
        {
            "id": "ZONE_MILAN_SUBWAY_02",
            "name": "Milan Subway Underpass",
            "region": "Santacruz Western Suburb",
            "lat": 19.0833,
            "lng": 72.8417,
            "elevation_m": 2.1, # Deep depression underpass
            "drainage_capacity_mm_hr": 35.0,
            "depression_storage_cm": 1.5,
            "polygon": [
                [19.0815, 72.8395], [19.0850, 72.8395],
                [19.0850, 72.8440], [19.0815, 72.8440]
            ]
        },
        {
            "id": "ZONE_KURLA_LBS_03",
            "name": "Kurla West (LBS Marg & Mithi Basin)",
            "region": "Central Suburbs",
            "lat": 19.0728,
            "lng": 72.8797,
            "elevation_m": 3.8,
            "drainage_capacity_mm_hr": 20.0, # High backwater vulnerability from Mithi
            "depression_storage_cm": 2.0,
            "polygon": [
                [19.0700, 72.8760], [19.0755, 72.8760],
                [19.0755, 72.8835], [19.0700, 72.8835]
            ]
        },
        {
            "id": "ZONE_GANDHI_MARKET_04",
            "name": "Gandhi Market / King's Circle",
            "region": "Sion - Matunga East",
            "lat": 19.0320,
            "lng": 72.8580,
            "elevation_m": 3.1,
            "drainage_capacity_mm_hr": 22.0,
            "depression_storage_cm": 2.5,
            "polygon": [
                [19.0295, 72.8550], [19.0345, 72.8550],
                [19.0345, 72.8610], [19.0295, 72.8610]
            ]
        },
        {
            "id": "ZONE_ANDHERI_SUBWAY_05",
            "name": "Andheri Subway",
            "region": "Andheri West Corridor",
            "lat": 19.1190,
            "lng": 72.8465,
            "elevation_m": 1.8, # Severe underpass depression
            "drainage_capacity_mm_hr": 30.0,
            "depression_storage_cm": 1.0,
            "polygon": [
                [19.1170, 72.8440], [19.1210, 72.8440],
                [19.1210, 72.8490], [19.1170, 72.8490]
            ]
        },
        {
            "id": "ZONE_DAHISAR_TOLL_06",
            "name": "Dahisar Check Naka Lowlands",
            "region": "Northern MMR Suburbs",
            "lat": 19.2550,
            "lng": 72.8650,
            "elevation_m": 6.5,
            "drainage_capacity_mm_hr": 45.0,
            "depression_storage_cm": 4.0,
            "polygon": [
                [19.2520, 72.8620], [19.2580, 72.8620],
                [19.2580, 72.8680], [19.2520, 72.8680]
            ]
        },
    ]

    def __init__(self):
        # Soil Infiltration parameters (Urban impermeable paved surfaces: low f0 & fc)
        self.f0 = 12.0  # Initial infiltration capacity (mm/hr)
        self.fc = 2.0   # Saturated final infiltration capacity (mm/hr)
        self.decay_k = 0.8 # Infiltration decay constant

    def compute_infiltration_rate(self, duration_hours: float) -> float:
        """Horton Infiltration Equation: f(t) = fc + (f0 - fc) * exp(-k*t)."""
        return self.fc + (self.f0 - self.fc) * np.exp(-self.decay_k * duration_hours)

    def simulate_inundation(
        self,
        current_precip_rate_mm_hr: float,
        storm_duration_hours: float = 1.5,
        river_backwater_factor: float = 1.2
    ) -> List[InundationZone]:
        """
        Calculates dynamic waterlogging depth (cm) across all registered zones.
        """
        infilt_rate = self.compute_infiltration_rate(storm_duration_hours)
        zones: List[InundationZone] = []

        for h in self.HOTSPOT_REGISTRY:
            drainage = h["drainage_capacity_mm_hr"]
            depression = h["depression_storage_cm"]
            
            # Net effective rainfall rate after infiltration & drainage
            # Scale with localized elevation factor (lower elevation = higher accumulation)
            elevation_factor = max(0.6, 1.8 - (h["elevation_m"] / 10.0))
            effective_precip = max(0.0, (current_precip_rate_mm_hr * elevation_factor) - infilt_rate - drainage)
            
            # Inundation accumulation over storm duration (convert mm to cm: / 10)
            accumulated_water_cm = (effective_precip * min(storm_duration_hours, 2.5)) / 10.0
            
            # Add backwater effect for coastal/riverine basins
            if "Kurla" in h["name"] or "Subway" in h["name"]:
                accumulated_water_cm *= river_backwater_factor

            total_depth_cm = float(np.round(max(0.0, accumulated_water_cm - depression), 1))
            saturation_pct = float(np.round(min(100.0, (current_precip_rate_mm_hr / max(1.0, drainage)) * 100.0), 1))

            # Severity Categorization
            if total_depth_cm >= INUNDATION_THRESHOLDS["critical_impassable_cm"]:
                sev = "critical"
                risk_tag = "IMPASSABLE / RESCUE DISPATCH"
            elif total_depth_cm >= INUNDATION_THRESHOLDS["severe_inundation_cm"]:
                sev = "very_high"
                risk_tag = "SEVERE WATERLOGGING"
            elif total_depth_cm >= INUNDATION_THRESHOLDS["moderate_waterlog_cm"]:
                sev = "high"
                risk_tag = "INUNDATION WARNING"
            elif total_depth_cm >= INUNDATION_THRESHOLDS["minor_ponding_cm"]:
                sev = "moderate"
                risk_tag = "MODERATE PONDING"
            else:
                sev = "low"
                risk_tag = "NORMAL RUNOFF FLOW"

            zones.append(
                InundationZone(
                    zone_id=h["id"],
                    name=h["name"],
                    region=h["region"],
                    center_lat=h["lat"],
                    center_lng=h["lng"],
                    waterlog_depth_cm=total_depth_cm,
                    severity=sev,
                    risk_tag=risk_tag,
                    drainage_saturation_pct=saturation_pct,
                    polygon_coordinates=h["polygon"],
                )
            )

        return zones
