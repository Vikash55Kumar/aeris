"""
Spatial Harmonization, Marshall-Palmer Z-R Conversion, and Tensor Preprocessors.
"""
import numpy as np
import torch
from typing import Tuple, Dict, Any
from config.constants import MMR_BOUNDS, MARSHALL_PALMER, GRID_SPECS


class SpatialResampler:
    """Projects real-world GPS coordinates to 250m matrix grid coordinates."""

    def __init__(self, bounds: Dict[str, float] = MMR_BOUNDS, grid_h: int = 64, grid_w: int = 64):
        self.min_lat = bounds["min_lat"]
        self.max_lat = bounds["max_lat"]
        self.min_lng = bounds["min_lng"]
        self.max_lng = bounds["max_lng"]
        self.grid_h = grid_h
        self.grid_w = grid_w

    def gps_to_grid(self, lat: float, lng: float) -> Tuple[int, int]:
        """Maps (lat, lng) to (row_idx, col_idx)."""
        lat_norm = (lat - self.min_lat) / (self.max_lat - self.min_lat)
        lng_norm = (lng - self.min_lng) / (self.max_lng - self.min_lng)
        
        row = int(np.clip((1.0 - lat_norm) * (self.grid_h - 1), 0, self.grid_h - 1))
        col = int(np.clip(lng_norm * (self.grid_w - 1), 0, self.grid_w - 1))
        return row, col

    def grid_to_gps(self, row: int, col: int) -> Tuple[float, float]:
        """Maps (row_idx, col_idx) back to approximate (lat, lng)."""
        lat_norm = 1.0 - (row / max(1, self.grid_h - 1))
        lng_norm = col / max(1, self.grid_w - 1)
        
        lat = self.min_lat + lat_norm * (self.max_lat - self.min_lat)
        lng = self.min_lng + lng_norm * (self.max_lng - self.min_lng)
        return float(lat), float(lng)


class MarshallPalmerConverter:
    """Converts Doppler Radar reflectivity (dBZ) to rainfall intensity (mm/hr)."""

    @staticmethod
    def dbz_to_rain_rate(dbz: float) -> float:
        """
        Calculates precipitation rate R using the standard empirical Marshall-Palmer Z-R relation:
        Z = a * R^b  ==> R = (10^(dBZ / 10) / a)^(1 / b)
        """
        if dbz < 10.0:
            return 0.0
        z_linear = 10.0 ** (dbz / 10.0)
        a = MARSHALL_PALMER["a"] # 200.0
        b = MARSHALL_PALMER["b"] # 1.6
        rain_rate = (z_linear / a) ** (1.0 / b)
        return float(np.round(rain_rate, 2))

    @classmethod
    def dbz_grid_to_rain_grid(cls, dbz_grid: np.ndarray) -> np.ndarray:
        """Vectorized conversion of a 2D/3D dBZ array to rainfall rate (mm/hr)."""
        z_linear = 10.0 ** (np.maximum(0.0, dbz_grid) / 10.0)
        a = MARSHALL_PALMER["a"]
        b = MARSHALL_PALMER["b"]
        rain_rates = np.where(dbz_grid >= 10.0, (z_linear / a) ** (1.0 / b), 0.0)
        return rain_rates.astype(np.float32)


class TensorNormalizer:
    """Normalizes multi-modal spatial arrays into standardized PyTorch input tensors."""

    @staticmethod
    def create_multichannel_tensor(
        radar_dbz_grid: np.ndarray,
        satellite_tir1_grid: np.ndarray,
        device: str = "cpu"
    ) -> torch.Tensor:
        """
        Creates a normalized (B, C, H, W) tensor:
        Channel 0: Radar Reflectivity normalized [0, 70 dBZ] -> [0, 1]
        Channel 1: Satellite TIR1 Cloud-Top normalized [-100°C, 20°C] -> [0, 1]
        Channel 2: Derived Rain Rate normalized [0, 150 mm/hr] -> [0, 1]
        """
        h, w = radar_dbz_grid.shape
        c0 = np.clip(radar_dbz_grid / 70.0, 0.0, 1.0)
        
        # TIR1: colder means higher convective activity -> invert so core is high value
        c1 = np.clip((-satellite_tir1_grid - 20.0) / 80.0, 0.0, 1.0)
        
        rain_grid = MarshallPalmerConverter.dbz_grid_to_rain_grid(radar_dbz_grid)
        c2 = np.clip(rain_grid / 150.0, 0.0, 1.0)
        
        tensor = np.stack([c0, c1, c2], axis=0) # Shape: (3, H, W)
        tensor = np.expand_dims(tensor, axis=0) # Shape: (1, 3, H, W)
        
        return torch.from_numpy(tensor).float().to(device)
