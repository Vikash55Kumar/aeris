"""
Semi-Lagrangian Optical Flow Advection Nowcaster for Hybrid Ensemble Extrapolation.
"""
import numpy as np
from scipy.ndimage import map_coordinates


class OpticalFlowNowcaster:
    """
    Extrapolates 2D radar reflectivity fields forward in time using estimated velocity vectors (u, v).
    Implements Semi-Lagrangian backward trajectory integration:
    I(x, y, t + dt) = I(x - u*dt, y - v*dt, t)
    """

    def __init__(self, default_u_kmh: float = 18.0, default_v_kmh: float = 12.0):
        # Default trajectory direction: Northeast (typical monsoon convective storm track across Mumbai)
        self.u_kmh = default_u_kmh
        self.v_kmh = default_v_kmh

    def advect(
        self,
        grid: np.ndarray,
        delta_minutes: int,
        grid_res_km: float = 0.25,
        decay_factor: float = 0.985
    ) -> np.ndarray:
        """
        Advects a 2D scalar field forward by `delta_minutes`.
        """
        h, w = grid.shape
        dt_hours = delta_minutes / 60.0
        
        # Displacement in grid cell units
        dx_cells = (self.u_kmh * dt_hours) / grid_res_km
        dy_cells = (self.v_kmh * dt_hours) / grid_res_km

        y_coords, x_coords = np.mgrid[0:h, 0:w]
        
        # Semi-Lagrangian backward origin coordinates
        src_x = x_coords - dx_cells
        src_y = y_coords + dy_cells # in image coords, row index increases downward

        advected = map_coordinates(
            grid,
            [src_y, src_x],
            order=1, # Bilinear interpolation
            mode="nearest"
        )
        
        # Apply physical storm dissipation / decay over extended horizons
        decay = decay_factor ** (delta_minutes / 15.0)
        return (advected * decay).astype(np.float32)
