"""YOLO model wrapper for fire/smoke detection."""
import io
import time
from pathlib import Path
from typing import Optional
from PIL import Image
import numpy as np

_model = None

def get_model():
    """Lazy-load the YOLO model."""
    global _model
    if _model is None:
        from ultralytics import YOLO
        from .config import MODEL_PATH
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model weights not found at {MODEL_PATH}")
        _model = YOLO(str(MODEL_PATH))
        print(f"[PyroScope] Model loaded: {MODEL_PATH.name}")
    return _model


def detect_image(
    image: Image.Image,
    confidence: float = 0.25,
    classes: Optional[list[str]] = None,
) -> dict:
    """
    Run fire/smoke detection on a PIL Image.
    Returns structured detection results.
    """
    model = get_model()
    
    # Convert PIL RGB to BGR numpy (YOLO expects BGR)
    img_bgr = np.array(image)[:, :, ::-1].copy()
    
    start = time.time()
    results = model.predict(
        source=img_bgr,
        conf=confidence,
        verbose=False,
    )
    inference_ms = round((time.time() - start) * 1000, 1)
    
    result = results[0]
    w, h = image.size
    
    detections = []
    for box in result.boxes:
        cls_id = int(box.cls[0])
        cls_name = result.names[cls_id]
        
        # Filter by requested classes
        if classes and cls_name not in classes:
            continue
        
        conf = round(float(box.conf[0]), 4)
        x1, y1, x2, y2 = [round(float(v)) for v in box.xyxy[0]]
        
        detections.append({
            "class": cls_name,
            "confidence": conf,
            "bbox": [x1, y1, x2, y2],
            "bbox_normalized": [
                round(x1 / w, 4),
                round(y1 / h, 4),
                round(x2 / w, 4),
                round(y2 / h, 4),
            ],
        })
    
    # Sort by confidence descending
    detections.sort(key=lambda d: d["confidence"], reverse=True)
    
    return {
        "image_size": [w, h],
        "detections": detections,
        "inference_ms": inference_ms,
        "model": "pyroscope-v1-yolo11s",
        "has_fire": any(d["class"] == "fire" for d in detections),
        "has_smoke": any(d["class"] == "smoke" for d in detections),
        "detection_count": len(detections),
    }


def detect_and_annotate(
    image: Image.Image,
    confidence: float = 0.25,
) -> tuple[dict, bytes]:
    """
    Run detection and return both results and annotated image bytes (JPEG).
    """
    model = get_model()
    
    img_bgr = np.array(image)[:, :, ::-1].copy()
    
    start = time.time()
    results = model.predict(
        source=img_bgr,
        conf=confidence,
        verbose=False,
    )
    inference_ms = round((time.time() - start) * 1000, 1)
    
    result = results[0]
    w, h = image.size
    
    # Get annotated image
    annotated = result.plot()  # numpy array with boxes drawn
    ann_image = Image.fromarray(annotated[..., ::-1])  # BGR to RGB
    
    buf = io.BytesIO()
    ann_image.save(buf, format="JPEG", quality=90)
    annotated_bytes = buf.getvalue()
    
    detections = []
    for box in result.boxes:
        cls_id = int(box.cls[0])
        conf = round(float(box.conf[0]), 4)
        x1, y1, x2, y2 = [round(float(v)) for v in box.xyxy[0]]
        detections.append({
            "class": result.names[cls_id],
            "confidence": conf,
            "bbox": [x1, y1, x2, y2],
            "bbox_normalized": [round(x1/w, 4), round(y1/h, 4), round(x2/w, 4), round(y2/h, 4)],
        })
    detections.sort(key=lambda d: d["confidence"], reverse=True)
    
    det_result = {
        "image_size": [w, h],
        "detections": detections,
        "inference_ms": inference_ms,
        "model": "pyroscope-v1-yolo11s",
        "has_fire": any(d["class"] == "fire" for d in detections),
        "has_smoke": any(d["class"] == "smoke" for d in detections),
        "detection_count": len(detections),
    }
    
    return det_result, annotated_bytes
