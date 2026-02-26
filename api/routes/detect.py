"""Detection API endpoints."""
import io
import time
import uuid
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, File, Query, UploadFile, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from PIL import Image

from ..core.auth import get_api_key
from ..core.model import detect_image, detect_and_annotate
from ..core.config import DEFAULT_CONFIDENCE, MAX_BATCH_SIZE, MAX_IMAGE_SIZE_MB
from ..core.storage import save_detection

router = APIRouter(prefix="/api/v1", tags=["detection"])


class UrlDetectRequest(BaseModel):
    url: str
    confidence: float = DEFAULT_CONFIDENCE
    classes: Optional[list[str]] = None
    metadata: Optional[dict] = None


class BatchUrlRequest(BaseModel):
    urls: list[str]
    confidence: float = DEFAULT_CONFIDENCE
    classes: Optional[list[str]] = None


def _parse_classes(classes: Optional[str]) -> Optional[list[str]]:
    if not classes:
        return None
    return [c.strip() for c in classes.split(",")]


@router.post("/detect")
async def detect(
    file: UploadFile = File(...),
    confidence: float = Query(DEFAULT_CONFIDENCE, ge=0.01, le=1.0),
    classes: Optional[str] = Query(None, description="Comma-separated: fire,smoke"),
    key_info: dict = Depends(get_api_key),
):
    """Upload an image, get fire/smoke detections."""
    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"Image too large (max {MAX_IMAGE_SIZE_MB}MB)")
    
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(400, "Invalid image file")
    
    result = detect_image(image, confidence, _parse_classes(classes))
    det_id = f"det_{uuid.uuid4().hex[:12]}"
    result["id"] = det_id
    result["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    
    save_detection(det_id, result)
    return result


@router.post("/detect/url")
async def detect_from_url(
    body: UrlDetectRequest,
    key_info: dict = Depends(get_api_key),
):
    """Detect fire/smoke from an image URL."""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(body.url)
            resp.raise_for_status()
    except Exception as e:
        raise HTTPException(400, f"Failed to fetch image: {e}")
    
    try:
        image = Image.open(io.BytesIO(resp.content)).convert("RGB")
    except Exception:
        raise HTTPException(400, "URL did not return a valid image")
    
    result = detect_image(image, body.confidence, body.classes)
    det_id = f"det_{uuid.uuid4().hex[:12]}"
    result["id"] = det_id
    result["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    if body.metadata:
        result["metadata"] = body.metadata
    
    save_detection(det_id, result)
    return result


@router.post("/detect/batch")
async def detect_batch(
    files: list[UploadFile] = File(...),
    confidence: float = Query(DEFAULT_CONFIDENCE, ge=0.01, le=1.0),
    classes: Optional[str] = Query(None),
    key_info: dict = Depends(get_api_key),
):
    """Upload multiple images (up to 10), get batch results."""
    if len(files) > MAX_BATCH_SIZE:
        raise HTTPException(400, f"Max {MAX_BATCH_SIZE} images per batch")
    
    batch_id = f"bat_{uuid.uuid4().hex[:12]}"
    results = []
    total_ms = 0
    fire_count = 0
    smoke_count = 0
    
    parsed_classes = _parse_classes(classes)
    
    for file in files:
        contents = await file.read()
        try:
            image = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception:
            results.append({"error": f"Invalid image: {file.filename}"})
            continue
        
        result = detect_image(image, confidence, parsed_classes)
        det_id = f"det_{uuid.uuid4().hex[:12]}"
        result["id"] = det_id
        result["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        result["filename"] = file.filename
        
        total_ms += result["inference_ms"]
        if result["has_fire"]:
            fire_count += 1
        if result["has_smoke"]:
            smoke_count += 1
        
        save_detection(det_id, result)
        results.append(result)
    
    return {
        "batch_id": batch_id,
        "results": results,
        "total_inference_ms": round(total_ms, 1),
        "summary": {
            "images_processed": len(results),
            "fire_detected": fire_count,
            "smoke_detected": smoke_count,
        },
    }


@router.post("/detect/annotated")
async def detect_annotated(
    file: UploadFile = File(...),
    confidence: float = Query(DEFAULT_CONFIDENCE, ge=0.01, le=1.0),
    key_info: dict = Depends(get_api_key),
):
    """Upload an image, get back the annotated image with bounding boxes."""
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(400, "Invalid image file")
    
    _, annotated_bytes = detect_and_annotate(image, confidence)
    
    return Response(
        content=annotated_bytes,
        media_type="image/jpeg",
        headers={"Content-Disposition": "inline; filename=annotated.jpg"},
    )
