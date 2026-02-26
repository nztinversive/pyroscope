"""Health and info endpoints."""
import time
from fastapi import APIRouter
from ..core.config import API_VERSION, MODEL_PATH

router = APIRouter(tags=["health"])

_start_time = time.time()


@router.get("/api/v1/health")
async def health():
    return {
        "status": "ok",
        "version": API_VERSION,
        "model": "pyroscope-v1-yolo11s",
        "model_loaded": MODEL_PATH.exists(),
        "classes": ["fire", "smoke"],
        "uptime_seconds": round(time.time() - _start_time),
    }


@router.get("/")
async def root():
    return {
        "name": "PyroScope API",
        "version": API_VERSION,
        "docs": "/docs",
        "description": "Fire & smoke detection API. Upload images or stream drone feeds for real-time wildfire detection.",
    }
