"""
End-to-End Dynamic Route Weather Risk & Departure Optimization Pipeline.
"""
from typing import Optional
from src.data.schemas import JourneyRiskRequest, JourneyRiskResponse
from src.models.routing.dynamic_router import DynamicWeatherRouter


class JourneyRiskPipeline:
    """Orchestrates dynamic pathfinding and departure window evaluation against live weather."""

    def __init__(self):
        self.router = DynamicWeatherRouter()

    def optimize_journey(self, request: JourneyRiskRequest) -> JourneyRiskResponse:
        dep_time = request.departure_time_iso or "16:30"
        if "T" in dep_time:
            # Extract HH:MM if ISO format passed
            dep_time = dep_time.split("T")[1][:5]

        return self.router.optimize(
            origin_query=request.origin,
            dest_query=request.destination,
            travel_mode=request.travel_mode,
            base_departure_time=dep_time
        )
