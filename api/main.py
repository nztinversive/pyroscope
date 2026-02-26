"""PyroScope API — Fire & Smoke Detection."""
import os
os.environ["POLARS_SKIP_CPU_CHECK"] = "1"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import detect, health, detections, keys
from .core.config import API_VERSION

app = FastAPI(
    title="PyroScope API",
    description="Fire & smoke detection API powered by YOLO11. Upload images or provide URLs for real-time wildfire detection with bounding boxes, confidence scores, and GPS-tagged alerts.",
    version=API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow dashboard and any origin for API access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router)
app.include_router(detect.router)
app.include_router(detections.router)
app.include_router(keys.router)


@app.on_event("startup")
async def startup():
    """Pre-load model on startup for fast first inference."""
    print(f"[PyroScope] v{API_VERSION} starting...")
    try:
        from .core.model import get_model
        get_model()
        print("[PyroScope] Model pre-loaded, ready for inference")
    except Exception as e:
        print(f"[PyroScope] Warning: Model not pre-loaded: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
