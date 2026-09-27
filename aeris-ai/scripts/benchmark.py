#!/usr/bin/env python3
"""
AERIS-AI Inference Latency & Benchmark Profiler.
"""
import os
import sys
import time
import torch
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.inference.engine import AerisAIEngine
from src.data.schemas import JourneyRiskRequest


def run_benchmark(num_runs: int = 20):
    print("=" * 70)
    print(f" ⏱️ AERIS-AI Inference Latency Benchmark (Averaged over {num_runs} runs)")
    print("=" * 70)

    engine = AerisAIEngine()
    obs = engine.get_live_observation()

    # 1. Warm-up
    print("[*] Performing warm-up passes...")
    for _ in range(3):
        _ = engine.compute_nowcast(obs, horizon_hours=6)
        _ = engine.compute_flood_inundation(obs)
        _ = engine.optimize_journey_route(JourneyRiskRequest(origin="Thane", destination="Borivali"))

    # 2. Benchmark Spatiotemporal Nowcasting
    nowcast_latencies = []
    for _ in range(num_runs):
        t0 = time.perf_counter()
        _ = engine.compute_nowcast(obs, horizon_hours=6)
        nowcast_latencies.append((time.perf_counter() - t0) * 1000.0)

    # 3. Benchmark Hydrodynamic Inundation
    hydro_latencies = []
    for _ in range(num_runs):
        t0 = time.perf_counter()
        _ = engine.compute_flood_inundation(obs)
        hydro_latencies.append((time.perf_counter() - t0) * 1000.0)

    # 4. Benchmark Journey Route Risk Optimization
    journey_latencies = []
    req = JourneyRiskRequest(origin="Thane", destination="Borivali", travel_mode="car")
    for _ in range(num_runs):
        t0 = time.perf_counter()
        _ = engine.optimize_journey_route(req)
        journey_latencies.append((time.perf_counter() - t0) * 1000.0)

    # 5. Full End-to-End Cycle
    e2e_latencies = []
    for _ in range(num_runs):
        t0 = time.perf_counter()
        _ = engine.generate_full_tactical_assessment()
        e2e_latencies.append((time.perf_counter() - t0) * 1000.0)

    print("\nBenchmark Results:")
    print("-" * 70)
    print(f" 1. ConvLSTM-UNet Nowcast (0-6h):  Mean = {np.mean(nowcast_latencies):6.2f} ms | P95 = {np.percentile(nowcast_latencies, 95):6.2f} ms")
    print(f" 2. 2D Hydrodynamic Inundation:    Mean = {np.mean(hydro_latencies):6.2f} ms | P95 = {np.percentile(hydro_latencies, 95):6.2f} ms")
    print(f" 3. Dynamic Weather Graph Router:  Mean = {np.mean(journey_latencies):6.2f} ms | P95 = {np.percentile(journey_latencies, 95):6.2f} ms")
    print(f" 4. Full E2E Assessment Cycle:     Mean = {np.mean(e2e_latencies):6.2f} ms | P95 = {np.percentile(e2e_latencies, 95):6.2f} ms")
    print("=" * 70)
    print(" ✅ Benchmark Completed Successfully.\n")


if __name__ == "__main__":
    run_benchmark()
