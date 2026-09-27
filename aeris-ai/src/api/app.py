"""
FastAPI Application Entrypoint for AERIS-AI.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router


def create_app() -> FastAPI:
    app = FastAPI(
        title="AERIS-AI Inference Service",
        description=(
            "High-Resolution Hydro-Meteorological Nowcasting, Urban Flood Inundation Surrogate, "
            "and Dynamic Journey Risk AI Engine."
        ),
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Enable CORS for external callers (BFF, dashboards, CLI clients)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(router)
    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.app:app", host="0.0.0.0", port=8000, reload=True)
