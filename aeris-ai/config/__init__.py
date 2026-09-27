"""Configuration package for AERIS-AI."""
from config.settings import get_settings, Settings
from config.constants import (
    MMR_BOUNDS,
    GRID_SPECS,
    METEOROLOGICAL_THRESHOLDS,
    INUNDATION_THRESHOLDS,
    RISK_LEVELS,
)

__all__ = [
    "get_settings",
    "Settings",
    "MMR_BOUNDS",
    "GRID_SPECS",
    "METEOROLOGICAL_THRESHOLDS",
    "INUNDATION_THRESHOLDS",
    "RISK_LEVELS",
]
