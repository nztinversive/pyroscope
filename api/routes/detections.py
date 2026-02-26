"""Detection history endpoints."""
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException

from ..core.auth import get_api_key
from ..core.storage import list_detections, get_detection

router = APIRouter(prefix="/api/v1", tags=["detections"])


@router.get("/detections")
async def get_detections(
    source: Optional[str] = Query(None),
    has_fire: Optional[bool] = Query(None),
    has_smoke: Optional[bool] = Query(None),
    since: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    key_info: dict = Depends(get_api_key),
):
    """List past detections with filters."""
    results = list_detections(
        source=source,
        has_fire=has_fire,
        has_smoke=has_smoke,
        since=since,
        limit=limit,
    )
    return {
        "detections": results,
        "count": len(results),
    }


@router.get("/detections/{det_id}")
async def get_detection_by_id(
    det_id: str,
    key_info: dict = Depends(get_api_key),
):
    """Get a specific detection by ID."""
    result = get_detection(det_id)
    if not result:
        raise HTTPException(404, "Detection not found")
    return result
