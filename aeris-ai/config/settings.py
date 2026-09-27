"""
AERIS-AI System Environment & Runtime Settings.
"""
import os
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """Global configuration settings for the AERIS AI subsystem."""
    
    # Environment
    app_name: str = "AERIS-AI"
    app_env: str = Field(default="development", alias="AERIS_ENV")
    debug: bool = Field(default=False, alias="AERIS_DEBUG")
    
    # API & Serving
    api_host: str = Field(default="0.0.0.0", alias="AERIS_API_HOST")
    api_port: int = Field(default=8000, alias="AERIS_API_PORT")
    api_workers: int = Field(default=1, alias="AERIS_API_WORKERS")
    
    # Hardware & Model Execution
    device: str = Field(default="cuda" if os.environ.get("CUDA_VISIBLE_DEVICES") else "cpu", alias="AERIS_DEVICE")
    torch_threads: int = Field(default=4, alias="AERIS_TORCH_THREADS")
    precision: str = Field(default="float32", alias="AERIS_PRECISION") # float32, float16, bfloat16
    
    # Checkpoints & Data Paths
    model_cache_dir: str = Field(default="./models_cache", alias="AERIS_MODEL_CACHE_DIR")
    nowcast_checkpoint: Optional[str] = Field(default=None, alias="AERIS_NOWCAST_CHECKPOINT")
    hydro_checkpoint: Optional[str] = Field(default=None, alias="AERIS_HYDRO_CHECKPOINT")
    
    # Nowcast Parameters
    default_forecast_horizon_hours: int = 6
    time_step_mins: int = 15
    grid_res_meters: int = 250
    
    # Model Hyperparameters
    convlstm_hidden_dim: int = 64
    convlstm_kernel_size: int = 3
    convlstm_num_layers: int = 3
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    """Singleton getter for system settings."""
    return Settings()
