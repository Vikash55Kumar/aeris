# AERIS-AI: High-Resolution Hydro-Meteorological AI Inference Engine

**AERIS-AI** is an independent, standalone AI subsystem designed for high-resolution atmospheric nowcasting, convective cloudburst detection, 2D hydrodynamic urban flood inundation surrogate modeling, and multi-objective dynamic route risk optimization.

---

## 🌟 Core Capabilities

1. **Observe & Fuse (`src/data`)**:
   - Multi-source observation assimilation (INSAT-3DR satellite, Doppler Weather Radar, AWS surface telemetry, River gauges).
   - 250m Universal Spatial Grid resampling and cross-sensor quality control.

2. **Spatio-Temporal Atmospheric Nowcasting (`src/models/nowcasting`)**:
   - `ConvLSTM-UNet` Neural Extrapolator predicting 0–6 hour radar reflectivity ($dBZ$) and rainfall rates ($mm/hr$).
   - Convective Instability & Cloudburst potential classifier (CAPE, PWV, Cloud-Top Cooling rate, Lightning flash rate).
   - Semi-Lagrangian optical flow advection for hybrid ensemble forecasts.

3. **Physics-Informed Hydrodynamics (`src/models/hydrology`)**:
   - 2D Overland Runoff Surrogate computing street-level waterlogging depth ($cm$).
   - Temporal River Gauge Predictor for Mithi River stage heights ($m$) and discharge rates ($m^3/s$).

4. **Dynamic Route Hazard Optimizer (`src/models/routing`)**:
   - Road graph network traversal with weather & inundation cost penalty functions.
   - Dynamic departure scoring matrix ($0\text{--}100$) evaluating optimal travel windows.

5. **Standalone API & CLI (`src/api`, `src/cli`)**:
   - High-throughput FastAPI REST server with interactive Swagger UI.
   - Rich CLI tool for running tactical simulations and offline model evaluations.

---

## 🚀 Quick Start

### 1. Run the CLI Simulation Demo
```bash
python3 scripts/run_demo.py
```

### 2. Run the Benchmark
```bash
python3 scripts/benchmark.py
```

### 3. Start the Standalone FastAPI Server
```bash
python3 -m uvicorn src.api.app:app --host 0.0.0.0 --port 8000 --reload
```
Access the Swagger documentation at: `http://localhost:8000/docs`

### 4. Run Automated Tests
```bash
pytest tests/
```
